const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("========================================");
  console.log("🚀 Deploying TaskEscrow Contract");
  console.log("========================================");
  console.log("");

  // Get platform wallet from .env
  const platformWallet = process.env.PLATFORM_WALLET;

  if (!platformWallet || platformWallet === "0xYourWalletAddressHere") {
    throw new Error("❌ PLATFORM_WALLET not set in .env file!");
  }

  console.log("📋 Deployment Configuration:");
  console.log(`   Network: Base Sepolia (Chain ID: 84532)`);
  console.log(`   Platform Wallet: ${platformWallet}`);
  console.log("");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);

  console.log("👤 Deployer Account:");
  console.log(`   Address: ${deployerAddress}`);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log("");

  // Check sufficient balance
  if (balance < hre.ethers.parseEther("0.001")) {
    console.log("⚠️  Warning: Low balance! You might need more testnet ETH");
    console.log("   Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia");
    console.log("");
  }

  // Deploy contract
  console.log("🔨 Deploying TaskEscrow contract...");
  const TaskEscrow = await hre.ethers.getContractFactory("TaskEscrow");
  const taskEscrow = await TaskEscrow.deploy(platformWallet);

  await taskEscrow.waitForDeployment();
  const contractAddress = await taskEscrow.getAddress();

  console.log("");
  console.log("========================================");
  console.log("✅ TaskEscrow Deployed Successfully!");
  console.log("========================================");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Platform Wallet: ${platformWallet}`);
  console.log(`   Transaction Hash: ${taskEscrow.deploymentTransaction().hash}`);
  console.log("");

  // Verify contract details
  const platformFee = await taskEscrow.PLATFORM_FEE_BPS();
  const owner = await taskEscrow.owner();

  console.log("📊 Contract Details:");
  console.log(`   Owner: ${owner}`);
  console.log(`   Platform Fee: ${platformFee} bps (2%)`);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    chainId: 84532,
    contractAddress: contractAddress,
    platformWallet: platformWallet,
    deployer: deployerAddress,
    transactionHash: taskEscrow.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to: deployment.json");
  console.log("");

  console.log("========================================");
  console.log("📝 NEXT STEPS:");
  console.log("========================================");
  console.log("");
  console.log("1️⃣  Verify contract on Basescan:");
  console.log(`   npx hardhat verify --network baseSepolia ${contractAddress} ${platformWallet}`);
  console.log("");
  console.log("2️⃣  Update frontend/.env:");
  console.log(`   VITE_TASK_ESCROW_ADDRESS=${contractAddress}`);
  console.log("");
  console.log("3️⃣  View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${contractAddress}`);
  console.log("");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("");
    console.error("❌ Deployment Error:");
    console.error(error);
    process.exit(1);
  });
