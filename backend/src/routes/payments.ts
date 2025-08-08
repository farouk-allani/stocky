import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { getDatabase } from "../config/database.js";
import { contracts } from "../services/evmContracts.js";

const router = express.Router();

// Create & escrow payment (server-funded demo)
// Simplified: client now only needs to send { orderId } (amount optional override)
router.post(
  "/create",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { orderId } = req.body;
    let { amount } = req.body as { amount?: string | number | bigint };
    if (!orderId) throw createError("orderId required", 400);

    const db = getDatabase();
    const order = await db.order
      .findUnique({
        where: { id: orderId },
        include: { business: { include: { owner: true } } },
      })
      .catch(() => null);
    if (!order) throw createError("Order not found", 404);
    if (order.customerId !== req.user.id)
      throw createError("Not authorized for this order", 403);

    // Derive buyer/seller from order
    const buyerId = order.customerId;
    const sellerId = order.business?.owner?.id || order.businessId;

    // Compute amount (scale to 1e18) if not provided
    if (amount == null) {
      // order.total stored as Float in normal currency units; scale to 1e18 for on-chain
      amount = BigInt(Math.round(order.total * 1e18));
    }
    const weiAmount =
      typeof amount === "bigint" ? amount : BigInt(amount.toString());

    const paymentId = `pay-${Date.now()}`;
    if (!contracts.payments)
      throw createError("Payments contract not configured", 500);
    const signer: any =
      (contracts as any)?.payments?.signer ||
      (contracts as any)?.payments?.provider?.getSigner?.();
    if (!signer) throw createError("Server signer missing for payments", 500);

    let receipt;
    try {
      const tx = await contracts.payments
        .connect(signer)
        .createPayment(paymentId, orderId, buyerId, sellerId, weiAmount, {
          value: weiAmount,
        });
      receipt = await tx.wait();
    } catch (e: any) {
      const reason =
        e?.reason || e?.error?.reason || e?.message || "createPayment failed";
      throw createError(`createPayment revert: ${reason}`, 500);
    }

    let escrowTxHash: string | null = null;
    let status: string = "PENDING";
    try {
      const escrowTx = await contracts.payments
        .connect(signer)
        .escrowPayment(paymentId);
      const escReceipt = await escrowTx.wait();
      escrowTxHash = escReceipt.transactionHash;
      status = "ESCROWED";
    } catch (e) {
      // Escrow can be attempted later
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentId,
        paymentEscrowTxHash: escrowTxHash || null,
        paymentStatus: status,
        paymentMethod: "hedera",
        isPaid: true,
        hederaTransactionId: receipt.transactionHash,
      },
    });

    res.json({
      message: "Payment created",
      payment: {
        paymentId,
        orderId,
        buyerId,
        sellerId,
        amount: weiAmount.toString(),
        txHash: receipt.transactionHash,
        escrowTxHash,
        status,
      },
    });
  })
);

// Get payment info by orderId (DB augmented + chain basic status)
router.get(
  "/order/:orderId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { orderId } = req.params;
    const db = getDatabase();
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError("Order not found", 404);
    if (
      order.customerId !== req.user.id &&
      order.businessId !== req.user.businessId
    ) {
      throw createError("Not authorized", 403);
    }
    res.json({
      payment: {
        paymentId: order.paymentId,
        status: order.paymentStatus,
        escrowTxHash: order.paymentEscrowTxHash,
        hederaTransactionId: order.hederaTransactionId,
      },
    });
  })
);

// Get on-chain payment details merged with DB order by paymentId
router.get(
  "/details/:paymentId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { paymentId } = req.params;
    const db = getDatabase();
    const order = await db.order.findFirst({ where: { paymentId } });
    if (!order) throw createError("Payment not found", 404);
    if (
      order.customerId !== req.user.id &&
      order.businessId !== req.user.businessId &&
      req.user.role !== "ADMIN"
    ) {
      throw createError("Not authorized", 403);
    }
    // Attempt on-chain read (non-fatal)
    let chain: any = null;
    try {
      if (contracts.payments) {
        const result = await contracts.payments.getPayment(paymentId);
        chain = {
          orderId: result[0],
          buyerId: result[1],
          sellerId: result[2],
          amount: result[3]?.toString?.() || "0",
          timestamp: Number(result[4] || 0),
          statusEnum: Number(result[5] || 0),
          escrowReleaseTime: Number(result[6] || 0),
        };
      }
    } catch (e) {
      chain = null;
    }
    res.json({
      payment: {
        paymentId,
        orderId: order.id,
        dbStatus: order.paymentStatus,
        hederaTransactionId: order.hederaTransactionId,
        escrowTxHash: order.paymentEscrowTxHash,
        chain,
      },
    });
  })
);

// Complete payment (release from escrow) - business owner or admin triggers
router.post(
  "/complete",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { paymentId } = req.body;
    if (!paymentId) throw createError("paymentId required", 400);
    const db = getDatabase();
    const order = await db.order.findFirst({
      where: { paymentId },
      include: { business: { include: { owner: true } } },
    });
    if (!order) throw createError("Payment/order not found", 404);
    const isOwner = order.business.owner.id === req.user.id;
    if (!(isOwner || req.user.role === "ADMIN"))
      throw createError("Not authorized", 403);
    if (!contracts.payments)
      throw createError("Payments contract not configured", 500);
    const signer: any =
      (contracts as any)?.payments?.signer ||
      (contracts as any)?.payments?.provider?.getSigner?.();
    if (!signer) throw createError("Server signer missing for payments", 500);
    let txHash: string | undefined;
    try {
      const tx = await contracts.payments
        .connect(signer)
        .completePayment(paymentId);
      const receipt = await tx.wait();
      txHash = receipt.transactionHash;
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "COMPLETED", paymentCompleteTxHash: txHash },
      });
    } catch (e: any) {
      throw createError(
        `completePayment failed: ${e?.reason || e?.message || "unknown error"}`,
        500
      );
    }
    res.json({ message: "Payment completion submitted", paymentId, txHash });
  })
);

// Debug signer & authorization status (temporary diagnostics)
router.get(
  "/debug",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    if (req.user.role !== "ADMIN") throw createError("Admin only", 403);
    if (!contracts.payments)
      throw createError("Payments contract not configured", 500);
    const signer: any =
      (contracts as any)?.payments?.signer ||
      (contracts as any)?.payments?.provider?.getSigner?.();
    let signerAddress: string | null = null;
    let authorized = null;
    try {
      signerAddress = signer ? await signer.getAddress() : null;
      if (signerAddress) {
        authorized = await (contracts.payments as any).authorizedUsers(
          signerAddress
        );
      }
    } catch (e) {
      // ignore
    }
    res.json({ signerAddress, authorized });
  })
);

export default router;
