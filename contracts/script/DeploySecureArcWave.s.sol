// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ArcWaveFactory} from "../src/ArcWaveFactory.sol";
import {ArcWaveRouter} from "../src/ArcWaveRouter.sol";

contract DeploySecureArcWave is Script {
    address constant TUSDC = 0xf2BD20dAcd843e4DF5B03366b29b9119Db2EBd02;
    address constant TARC = 0x605cF46994C1fc75c04D2386d88E2529DC1C3C77;
    address constant TUSDT = 0x211aabF85b0162b07DdCB88AE076E8485d1fe5Cc;
    address constant TDAI = 0x1f74243d2b360a848BC1833dEF27d2bBA7fC19A5;
    address constant TUSDE = 0xCD7eC626C79573a5aC5CD79b45b9274fB896E128;
    address constant TPYUSD = 0x1Ee284FA2252f1521d31AC6FAC912EcaCC52e72D;

    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        console2.log("Deploying secure ArcWave contracts...");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(privateKey);

        ArcWaveFactory factory = new ArcWaveFactory();
        ArcWaveRouter router = new ArcWaveRouter(address(factory));

        address poolUsdcArc = factory.createPool(TUSDC, TARC);
        address poolUsdcUsdt = factory.createPool(TUSDC, TUSDT);
        address poolUsdcDai = factory.createPool(TUSDC, TDAI);
        address poolUsdcUsde = factory.createPool(TUSDC, TUSDE);
        address poolUsdcPyusd = factory.createPool(TUSDC, TPYUSD);

        vm.stopBroadcast();

        console2.log("======================================");
        console2.log("ArcWave Secure Core - Arc Testnet");
        console2.log("Factory:", address(factory));
        console2.log("Router:", address(router));
        console2.log("======================================");
        console2.log("Pools:");
        console2.log("tUSDC/tARC:  ", poolUsdcArc);
        console2.log("tUSDC/tUSDT: ", poolUsdcUsdt);
        console2.log("tUSDC/tDAI:  ", poolUsdcDai);
        console2.log("tUSDC/tUSDe: ", poolUsdcUsde);
        console2.log("tUSDC/tPYUSD:", poolUsdcPyusd);
    }
}
