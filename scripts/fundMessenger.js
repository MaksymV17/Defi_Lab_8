// Крок 4: переказ LINK з вашого гаманця на контракт CrossChainMessenger
// Кількість: node ... або змінна AMOUNT (за замовчуванням 2 LINK)
const { ethers } = require("hardhat");
const { SEPOLIA, load } = require("./common");

async function main() {
  const { messenger } = load();
  if (!messenger) throw new Error("Спочатку виконайте npm run deploy:messenger");
  const [signer] = await ethers.getSigners();
  const link = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"],
    SEPOLIA.link, signer);

  const amount = ethers.parseUnits(process.env.AMOUNT || "2", 18);
  const mine = await link.balanceOf(signer.address);
  console.log("LINK на вашому гаманці:", ethers.formatUnits(mine, 18));
  if (mine < amount) throw new Error("Недостатньо LINK. Візьміть його на https://faucets.chain.link/sepolia");

  const tx = await link.transfer(messenger, amount);
  await tx.wait();
  console.log("Переказано", ethers.formatUnits(amount, 18), "LINK на контракт", messenger);
  console.log("tx:", tx.hash);
  console.log("Баланс LINK контракту:", ethers.formatUnits(await link.balanceOf(messenger), 18));
}
main().catch((e) => { console.error(e); process.exit(1); });
