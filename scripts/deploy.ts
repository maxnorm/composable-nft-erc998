import { ethers, network } from "hardhat";

async function main(): Promise<void> {
  const ERC998 = await ethers.deployContract("ERC998", ["ERC998", "998"]);

  console.log("ERC998 deployed to:", ERC998.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});