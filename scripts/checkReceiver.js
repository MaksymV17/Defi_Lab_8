// Перевірка, чи дійшло повідомлення до Receiver в Arbitrum Sepolia (зазвичай 10-20 хвилин)
const { ethers } = require("hardhat");
const { load } = require("./common");

async function main() {
  const { receiver } = load();
  const c = await ethers.getContractAt("CrossChainReceiver", receiver);
  const count = await c.receivedCount();
  console.log("Отримано повідомлень:", count.toString());
  if (count > 0n) {
    console.log("messageId:", await c.lastMessageId());
    console.log("Відправник (Messenger):", await c.lastSender());
    console.log("Текст:", await c.lastText());
  } else {
    console.log("Ще не дійшло. Стежте за статусом у CCIP Explorer і повторіть через кілька хвилин.");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
