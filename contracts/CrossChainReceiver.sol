// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Client, IAny2EVMMessageReceiver} from "./CCIPInterfaces.sol";

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

/// @title CrossChainReceiver - контракт-пустушка, що приймає повідомлення CCIP (Arbitrum Sepolia)
contract CrossChainReceiver is IAny2EVMMessageReceiver, IERC165 {
    address public immutable router;

    bytes32 public lastMessageId;
    uint64 public lastSourceChainSelector;
    address public lastSender;
    string public lastText;
    uint256 public receivedCount;

    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address sender, string text);

    error InvalidRouter(address caller);

    constructor(address router_) {
        router = router_;
    }

    /// @dev Викликається лише CCIP Router після проходження повідомлення через мережу оракулів
    function ccipReceive(Client.Any2EVMMessage calldata message) external override {
        if (msg.sender != router) revert InvalidRouter(msg.sender);

        lastMessageId = message.messageId;
        lastSourceChainSelector = message.sourceChainSelector;
        lastSender = abi.decode(message.sender, (address));
        lastText = abi.decode(message.data, (string));
        receivedCount++;

        emit MessageReceived(lastMessageId, lastSourceChainSelector, lastSender, lastText);
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
