// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @notice A simple counter contract demonstrating FHE basics
contract FHECounter is ZamaEthereumConfig {
    euint32 private count;

    /// @notice Returns the current count
    function getCount() external view returns (euint32) {
        return count;
    }

    /// @notice Increments the counter by a specified encrypted value
    /// @param inputEuint32 The encrypted value to add
    /// @param inputProof The proof validating the encrypted input
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        count = FHE.add(count, encryptedValue);

        // Grant permissions for subsequent operations
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value
    /// @param inputEuint32 The encrypted value to subtract
    /// @param inputProof The proof validating the encrypted input
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        count = FHE.sub(count, encryptedValue);

        // Grant permissions for subsequent operations
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }
}
