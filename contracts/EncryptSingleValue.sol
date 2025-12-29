// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value
/// @notice Demonstrates FHE encryption mechanism for single values
contract EncryptSingleValue is ZamaEthereumConfig {
    euint32 private storedValue;

    /// @notice Stores an encrypted value
    /// @param input The external encrypted input
    /// @param inputProof The proof validating the encrypted input
    function store(externalEuint32 input, bytes calldata inputProof) external {
        // Convert external encrypted input to internal representation
        euint32 value = FHE.fromExternal(input, inputProof);

        // Store the encrypted value
        storedValue = value;

        // CRITICAL: Grant permissions
        // 1. allowThis - allows the contract to operate on this value
        // 2. allow - allows the caller to decrypt this value
        FHE.allowThis(value);
        FHE.allow(value, msg.sender);
    }

    /// @notice Retrieves the stored encrypted value
    /// @return The encrypted value (only owner can decrypt)
    function retrieve() external view returns (euint32) {
        return storedValue;
    }

    /// @notice Performs an operation on the stored value
    /// @return The result of adding 10 to the stored value (encrypted)
    function addTen() external returns (euint32) {
        euint32 result = FHE.add(storedValue, FHE.asEuint32(10));

        // Grant permissions for the result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return result;
    }
}
