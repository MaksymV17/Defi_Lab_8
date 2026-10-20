// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Client, IRouterClient} from "./CCIPInterfaces.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CrossChainMessenger - відправник міжмережевих повідомлень через Chainlink CCIP
/// @notice Розгортається в Ethereum Sepolia. Комісію CCIP сплачує у токені LINK з балансу самого контракту.
contract CrossChainMessenger is Ownable {
    IRouterClient public immutable router;
    IERC20 public immutable linkToken;

    uint256 public constant DEST_GAS_LIMIT = 300_000;

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        string text,
        uint256 fees
    );

    error NotEnoughLink(uint256 balance, uint256 required);
    error ChainNotSupported(uint64 selector);

    constructor(address router_, address link_) Ownable(msg.sender) {
        router = IRouterClient(router_);
        linkToken = IERC20(link_);
    }

    /// @notice Надіслати текстове повідомлення отримувачу в іншій мережі
    /// @param destinationChainSelector селектор цільової мережі (Arbitrum Sepolia: 3478487238524512106)
    /// @param receiver адреса контракту-отримувача в цільовій мережі
    /// @param text текст повідомлення
    function sendMessage(uint64 destinationChainSelector, address receiver, string calldata text)
        external
        onlyOwner
        returns (bytes32 messageId)
    {
        if (!router.isChainSupported(destinationChainSelector)) revert ChainNotSupported(destinationChainSelector);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(text),
            tokenAmounts: new Client.EVMTokenAmount[](0), // токени не переказуємо, лише дані
            feeToken: address(linkToken),
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({gasLimit: DEST_GAS_LIMIT, allowOutOfOrderExecution: true})
            )
        });

        uint256 fees = router.getFee(destinationChainSelector, message);
        uint256 balance = linkToken.balanceOf(address(this));
        if (fees > balance) revert NotEnoughLink(balance, fees);

        linkToken.approve(address(router), fees);
        messageId = router.ccipSend(destinationChainSelector, message);

        emit MessageSent(messageId, destinationChainSelector, receiver, text, fees);
    }

    /// @notice Оцінка комісії у LINK перед відправкою
    function estimateFee(uint64 destinationChainSelector, address receiver, string calldata text)
        external
        view
        returns (uint256)
    {
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(text),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            feeToken: address(linkToken),
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({gasLimit: DEST_GAS_LIMIT, allowOutOfOrderExecution: true})
            )
        });
        return router.getFee(destinationChainSelector, message);
    }

    /// @notice Забрати залишок LINK з контракту
    function withdrawLink(address to) external onlyOwner {
        linkToken.transfer(to, linkToken.balanceOf(address(this)));
    }
}
