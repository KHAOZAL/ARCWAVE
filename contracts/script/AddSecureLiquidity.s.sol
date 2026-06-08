// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IArcWaveFactoryView {
    function getPool(address tokenA, address tokenB) external view returns (address);
}

interface ISimpleDEXLiquidity {
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity);
    function reserveA() external view returns (uint256);
    function reserveB() external view returns (uint256);
}

contract AddSecureLiquidity is Script {
    using SafeERC20 for IERC20;

    address constant FACTORY = 0xEd62670DB50E6e1C312F086B3230168D7E1521AA;

    address constant TUSDC = 0xf2BD20dAcd843e4DF5B03366b29b9119Db2EBd02;
    address constant TARC = 0x605cF46994C1fc75c04D2386d88E2529DC1C3C77;
    address constant TUSDT = 0x211aabF85b0162b07DdCB88AE076E8485d1fe5Cc;
    address constant TDAI = 0x1f74243d2b360a848BC1833dEF27d2bBA7fC19A5;
    address constant TUSDE = 0xCD7eC626C79573a5aC5CD79b45b9274fB896E128;
    address constant TPYUSD = 0x1Ee284FA2252f1521d31AC6FAC912EcaCC52e72D;

    uint256 constant AMOUNT = 100 ether;

    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        console2.log("Adding liquidity to secure ArcWave pools...");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(privateKey);

        _addLiquidity(TUSDC, TARC, "tUSDC/tARC", deployer);
        _addLiquidity(TUSDC, TUSDT, "tUSDC/tUSDT", deployer);
        _addLiquidity(TUSDC, TDAI, "tUSDC/tDAI", deployer);
        _addLiquidity(TUSDC, TUSDE, "tUSDC/tUSDe", deployer);
        _addLiquidity(TUSDC, TPYUSD, "tUSDC/tPYUSD", deployer);

        vm.stopBroadcast();

        console2.log("Liquidity added successfully.");
    }

    function _addLiquidity(address tokenX, address tokenY, string memory label, address deployer) internal {
        address pool = IArcWaveFactoryView(FACTORY).getPool(tokenX, tokenY);
        require(pool != address(0), "POOL_NOT_FOUND");

        address poolTokenA = ISimpleDEXLiquidity(pool).tokenA();
        address poolTokenB = ISimpleDEXLiquidity(pool).tokenB();

        uint256 balanceA = IERC20(poolTokenA).balanceOf(deployer);
        uint256 balanceB = IERC20(poolTokenB).balanceOf(deployer);

        require(balanceA >= AMOUNT, "INSUFFICIENT_TOKEN_A_BALANCE");
        require(balanceB >= AMOUNT, "INSUFFICIENT_TOKEN_B_BALANCE");

        IERC20(poolTokenA).forceApprove(pool, 0);
        IERC20(poolTokenA).forceApprove(pool, AMOUNT);

        IERC20(poolTokenB).forceApprove(pool, 0);
        IERC20(poolTokenB).forceApprove(pool, AMOUNT);

        uint256 liquidity = ISimpleDEXLiquidity(pool).addLiquidity(AMOUNT, AMOUNT);

        console2.log("--------------------------------------");
        console2.log(label);
        console2.log("Pool:", pool);
        console2.log("TokenA:", poolTokenA);
        console2.log("TokenB:", poolTokenB);
        console2.log("Liquidity minted:", liquidity);
        console2.log("ReserveA:", ISimpleDEXLiquidity(pool).reserveA());
        console2.log("ReserveB:", ISimpleDEXLiquidity(pool).reserveB());
    }
}
