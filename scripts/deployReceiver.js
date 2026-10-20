// Крок 3: розгортання контракту-отримувача в Arbitrum Sepolia
const { ethers } = require("hardhat");
const { ARB_SEPOLIA, save } = require("./common");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Мережа: Arbitrum Sepolia | акаунт:", signer.address);
  console.log("Баланс ETH:", ethers.formatEther(await ethers.provider.getBalance(signer.address)));

  const Receiver = await ethers.getContractFactory("CrossChainReceiver");
  const receiver = await Receiver.deploy(ARB_SEPOLIA.router);
  await receiver.waitForDeployment();
  const addr = await receiver.getAddress();
  console.log("CrossChainReceiver:", addr);
  console.log("Arbiscan: https://sepolia.arbiscan.io/address/" + addr);
  save({ receiver: addr });
}
main().catch((e) => { console.error(e); process.exit(1); });
