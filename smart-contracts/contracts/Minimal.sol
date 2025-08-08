// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Very small contract to validate Hedera deployment pipeline
contract Minimal {
    uint256 public value = 1;

    function set(uint256 v) external {
        value = v;
    }
}
