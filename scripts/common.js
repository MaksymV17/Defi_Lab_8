const fs = require("node:fs");

// Адреси з офіційного довідника Chainlink CCIP (docs.chain.link/ccip/directory/testnet)
const SEPOLIA = {
  router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  selector: "16015286601757825753",
};
const ARB_SEPOLIA = {
  router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
  link: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
  selector: "3478487238524512106",
};

const FILE = "deployment-ccip.json";
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {});
const save = (patch) => fs.writeFileSync(FILE, JSON.stringify({ ...load(), ...patch }, null, 2));

module.exports = { SEPOLIA, ARB_SEPOLIA, load, save };
