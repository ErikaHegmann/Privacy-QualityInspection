// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control with FHE
/// @notice Demonstrates FHE.allow, FHE.allowThis, and permission management
contract AccessControl is ZamaEthereumConfig {
    mapping(address => euint32) private userValues;
    mapping(address => bool) public authorizedViewers;

    /// @notice Stores an encrypted value for a user
    function store(externalEuint32 input, bytes calldata inputProof) external {
        euint32 value = FHE.fromExternal(input, inputProof);

        userValues[msg.sender] = value;

        // Grant permissions:
        // 1. Contract can process the value
        FHE.allowThis(value);
        // 2. Only the owner can decrypt
        FHE.allow(value, msg.sender);
    }

    /// @notice Authorizes another address to view encrypted values
    function authorizeViewer(address viewer) external {
        authorizedViewers[viewer] = true;
    }

    /// @notice Revokes viewing authorization
    function revokeViewer(address viewer) external {
        authorizedViewers[viewer] = false;
    }

    /// @notice Retrieves user's own value
    function getUserValue() external view returns (euint32) {
        return userValues[msg.sender];
    }

    /// @notice Allows authorized viewers to see values
    /// @dev This demonstrates permission boundaries - viewer still needs their own decryption keys
    function getValueForViewer(address user) external view returns (euint32) {
        require(authorizedViewers[msg.sender], "Not authorized");
        return userValues[user];
    }
}
