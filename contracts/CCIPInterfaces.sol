// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Мінімальні інтерфейси Chainlink CCIP (збігаються з офіційними @chainlink/contracts-ccip),
// щоб проєкт не залежав від версій пакета.

library Client {
    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }

    struct Any2EVMMessage {
        bytes32 messageId;
        uint64 sourceChainSelector;
        bytes sender;                       // abi.encode(адреса відправника)
        bytes data;
        EVMTokenAmount[] destTokenAmounts;
    }

    struct EVM2AnyMessage {
        bytes receiver;                     // abi.encode(адреса отримувача)
        bytes data;
        EVMTokenAmount[] tokenAmounts;
        address feeToken;                   // address(0) = оплата нативним активом
        bytes extraArgs;
    }

    struct GenericExtraArgsV2 {
        uint256 gasLimit;
        bool allowOutOfOrderExecution;
    }

    bytes4 public constant GENERIC_EXTRA_ARGS_V2_TAG = 0x181dcf10;

    function _argsToBytes(GenericExtraArgsV2 memory extraArgs) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(GENERIC_EXTRA_ARGS_V2_TAG, extraArgs);
    }
}

interface IRouterClient {
    function isChainSupported(uint64 destChainSelector) external view returns (bool);
    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage memory message) external view returns (uint256 fee);
    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external payable returns (bytes32);
}

interface IAny2EVMMessageReceiver {
    function ccipReceive(Client.Any2EVMMessage calldata message) external;
}
