import Joi from "joi";

export const validateRegistration = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid("BUSINESS", "CONSUMER", "ADMIN").required(),
    businessName: Joi.string().min(2).max(100).when("role", {
      is: "BUSINESS",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    businessType: Joi.string().when("role", {
      is: "BUSINESS",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
  });

  return schema.validate(data);
};

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateProduct = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().required(),
    originalPrice: Joi.number().positive().required(),
    currentPrice: Joi.number().positive().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().required(),
    batchNumber: Joi.string().optional(),
    manufacturedDate: Joi.date().optional(),
    expiryDate: Joi.date().required(),
    location: Joi.string().optional(),
  });

  return schema.validate(data);
};

export const validateBusiness = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  });

  return schema.validate(data);
};

export const validateOrder = (data: any) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().positive().required(),
        })
      )
      .min(1)
      .required(),
    pickupTime: Joi.date().optional(),
    notes: Joi.string().max(500).optional(),
    paymentMethod: Joi.string().valid("cash", "card", "hedera").optional(),
  });

  return schema.validate(data);
};
