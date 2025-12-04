// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TaskEscrow.sol";

/**
 * @title DeployTaskEscrow
 * @notice Deployment script for TaskEscrow contract
 * @dev Run with: forge script script/Deploy.s.sol:DeployTaskEscrow --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployTaskEscrow is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address platformWallet = vm.envAddress("PLATFORM_WALLET");

        require(platformWallet != address(0), "PLATFORM_WALLET not set");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TaskEscrow
        TaskEscrow taskEscrow = new TaskEscrow(platformWallet);

        console.log("========================================");
        console.log("TaskEscrow Deployed!");
        console.log("========================================");
        console.log("Contract Address:", address(taskEscrow));
        console.log("Platform Wallet:", platformWallet);
        console.log("Platform Fee:", taskEscrow.PLATFORM_FEE_BPS(), "bps (2%)");
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contract on Basescan:");
        console.log("   forge verify-contract", address(taskEscrow), "src/TaskEscrow.sol:TaskEscrow --chain-id 84532 --watch");
        console.log("");
        console.log("2. Update frontend/.env:");
        console.log("   VITE_TASK_ESCROW_ADDRESS=", address(taskEscrow));
        console.log("");
        console.log("3. Test contract:");
        console.log("   cast call", address(taskEscrow), "getTotalTasks()(uint256)");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
