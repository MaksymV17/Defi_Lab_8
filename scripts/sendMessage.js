// Крок 5: виклик sendMessage - надсилання повідомлення Sepolia -> Arbitrum Sepolia
const { ethers } = require("hardhat");
const { ARB_SEPOLIA, SEPOLIA, load, save } = require("./common");

async function main() {
  const { messenger: messengerAddr, receiver } = load();
  if (!messengerAddr || !receiver) throw new Error("Спершу розгорніть Receiver і Messenger (див. README)");

  const [signer] = await ethers.getSigners();
  const messenger = await ethers.getContractAt("CrossChainMessenger", messengerAddr, signer);
  const link = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)"], SEPOLIA.link, signer);

  const text = process.env.TEXT || "Привіт з Ethereum Sepolia! Вертій Максим Олександрович";
  const fee = await messenger.estimateFee(ARB_SEPOLIA.selector, receiver, text);
  console.log("Оцінка комісії CCIP:", ethers.formatUnits(fee, 18), "LINK");
  console.log("LINK на Messenger:  ", ethers.formatUnits(await link.balanceOf(messengerAddr), 18), "LINK");

  console.log(`Надсилаю: "${text}"`);
  const tx = await messenger.sendMessage(ARB_SEPOLIA.selector, receiver, text);
  console.log("tx:", tx.hash);
  const rc = await tx.wait();

  let messageId;
  for (const log of rc.logs) {
    try {
      const parsed = messenger.interface.parseLog(log);
      if (parsed?.name === "MessageSent") messageId = parsed.args.messageId;
    } catch {}
  }
  console.log("\nТранзакцію підтверджено у блоці", rc.blockNumber);
  console.log("messageId:", messageId);
  console.log("Etherscan:    https://sepolia.etherscan.io/tx/" + tx.hash);
  console.log("CCIP Explorer: https://ccip.chain.link/msg/" + messageId);
  save({ lastSendTx: tx.hash, lastMessageId: messageId });
}
main().catch((e) => { console.error(e); process.exit(1); });
