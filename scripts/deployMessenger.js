// Крок 2: розгортання CrossChainMessenger у Ethereum Sepolia
const { ethers } = require("hardhat");
const { SEPOLIA, save } = require("./common");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Мережа: Ethereum Sepolia | акаунт:", signer.address);
  console.log("Баланс ETH:", ethers.formatEther(await ethers.provider.getBalance(signer.address)));

  const Messenger = await ethers.getContractFactory("CrossChainMessenger");
  const messenger = await Messenger.deploy(SEPOLIA.router, SEPOLIA.link);
  await messenger.waitForDeployment();
  const addr = await messenger.getAddress();
  console.log("CrossChainMessenger:", addr);
  console.log("Etherscan: https://sepolia.etherscan.io/address/" + addr);
  save({ messenger: addr });
}
main().catch((e) => { console.error(e); process.exit(1); });
