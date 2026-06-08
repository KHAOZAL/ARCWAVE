// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {SimpleDEX} from "../src/SimpleDEX.sol";
import {ArcWaveFactory} from "../src/ArcWaveFactory.sol";
import {ArcWaveRouter} from "../src/ArcWaveRouter.sol";

contract TestToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ArcWaveSecurityTest is Test {
    TestToken tokenA;
    TestToken tokenB;

    SimpleDEX dex;
    ArcWaveFactory factory;
    ArcWaveRouter router;

    address alice = address(0xA11CE);

    uint256 constant INITIAL_BALANCE = 1_000 ether;
    uint256 constant LIQUIDITY_AMOUNT = 100 ether;
    uint256 constant SWAP_AMOUNT = 1 ether;

    function setUp() public {
        tokenA = new TestToken("Test USDC", "tUSDC");
        tokenB = new TestToken("Test USDT", "tUSDT");

        tokenA.mint(alice, INITIAL_BALANCE);
        tokenB.mint(alice, INITIAL_BALANCE);

        dex = new SimpleDEX(address(tokenA), address(tokenB));

        vm.startPrank(alice);
        tokenA.approve(address(dex), type(uint256).max);
        tokenB.approve(address(dex), type(uint256).max);
        dex.addLiquidity(LIQUIDITY_AMOUNT, LIQUIDITY_AMOUNT);
        vm.stopPrank();
    }

    function testAddLiquidityWorks() public {
        assertEq(dex.reserveA(), LIQUIDITY_AMOUNT);
        assertEq(dex.reserveB(), LIQUIDITY_AMOUNT);
        assertEq(dex.totalLiquidity(), LIQUIDITY_AMOUNT);
    }

    function testSwapWorks() public {
        vm.startPrank(alice);

        uint256 beforeBalance = tokenB.balanceOf(alice);
        uint256 amountOut = dex.swap(address(tokenA), SWAP_AMOUNT, 1);
        uint256 afterBalance = tokenB.balanceOf(alice);

        vm.stopPrank();

        assertGt(amountOut, 0);
        assertEq(afterBalance - beforeBalance, amountOut);
    }

    function testSwapFailsWithInvalidToken() public {
        TestToken fakeToken = new TestToken("Fake", "FAKE");
        fakeToken.mint(alice, INITIAL_BALANCE);

        vm.startPrank(alice);
        fakeToken.approve(address(dex), type(uint256).max);

        vm.expectRevert(bytes("INVALID_TOKEN"));
        dex.swap(address(fakeToken), SWAP_AMOUNT, 1);

        vm.stopPrank();
    }

    function testSwapFailsWithHighSlippage() public {
        vm.startPrank(alice);

        vm.expectRevert(bytes("SLIPPAGE"));
        dex.swap(address(tokenA), SWAP_AMOUNT, 999 ether);

        vm.stopPrank();
    }

    function testSwapWithDeadlineFailsWhenExpired() public {
        vm.startPrank(alice);

        vm.expectRevert(bytes("EXPIRED"));
        dex.swapWithDeadline(address(tokenA), SWAP_AMOUNT, 1, block.timestamp - 1);

        vm.stopPrank();
    }

    function testPauseBlocksSwap() public {
        dex.pause();

        vm.startPrank(alice);

        vm.expectRevert();
        dex.swap(address(tokenA), SWAP_AMOUNT, 1);

        vm.stopPrank();
    }

    function testUnpauseAllowsSwapAgain() public {
        dex.pause();
        dex.unpause();

        vm.startPrank(alice);

        uint256 amountOut = dex.swap(address(tokenA), SWAP_AMOUNT, 1);

        vm.stopPrank();

        assertGt(amountOut, 0);
    }

    function testRemoveLiquidityWorks() public {
        vm.startPrank(alice);

        uint256 liquidity = dex.liquidityOf(alice);
        uint256 beforeA = tokenA.balanceOf(alice);
        uint256 beforeB = tokenB.balanceOf(alice);

        (uint256 amountA, uint256 amountB) = dex.removeLiquidity(liquidity / 2);

        uint256 afterA = tokenA.balanceOf(alice);
        uint256 afterB = tokenB.balanceOf(alice);

        vm.stopPrank();

        assertGt(amountA, 0);
        assertGt(amountB, 0);
        assertEq(afterA - beforeA, amountA);
        assertEq(afterB - beforeB, amountB);
    }

    function testFactoryCreatesPool() public {
        factory = new ArcWaveFactory();

        address pool = factory.createPool(address(tokenA), address(tokenB));

        assertTrue(pool != address(0));
        assertEq(factory.getPool(address(tokenA), address(tokenB)), pool);
        assertEq(factory.getPool(address(tokenB), address(tokenA)), pool);
    }

    function testFactoryCannotCreateDuplicatePool() public {
        factory = new ArcWaveFactory();

        factory.createPool(address(tokenA), address(tokenB));

        vm.expectRevert(bytes("POOL_EXISTS"));
        factory.createPool(address(tokenA), address(tokenB));
    }

    function testRouterSwapWorks() public {
        factory = new ArcWaveFactory();
        router = new ArcWaveRouter(address(factory));

        address pool = factory.createPool(address(tokenA), address(tokenB));

        vm.startPrank(alice);

        tokenA.approve(pool, type(uint256).max);
        tokenB.approve(pool, type(uint256).max);
        SimpleDEX(pool).addLiquidity(LIQUIDITY_AMOUNT, LIQUIDITY_AMOUNT);

        tokenA.approve(address(router), type(uint256).max);

        uint256 beforeBalance = tokenB.balanceOf(alice);
        uint256 amountOut = router.exactInputSingle(address(tokenA), address(tokenB), SWAP_AMOUNT, 1);
        uint256 afterBalance = tokenB.balanceOf(alice);

        vm.stopPrank();

        assertGt(amountOut, 0);
        assertEq(afterBalance - beforeBalance, amountOut);
    }

    function testRouterDeadlineFailsWhenExpired() public {
        factory = new ArcWaveFactory();
        router = new ArcWaveRouter(address(factory));

        address pool = factory.createPool(address(tokenA), address(tokenB));

        vm.startPrank(alice);

        tokenA.approve(pool, type(uint256).max);
        tokenB.approve(pool, type(uint256).max);
        SimpleDEX(pool).addLiquidity(LIQUIDITY_AMOUNT, LIQUIDITY_AMOUNT);

        tokenA.approve(address(router), type(uint256).max);

        vm.expectRevert(bytes("EXPIRED"));
        router.exactInputSingleWithDeadline(address(tokenA), address(tokenB), SWAP_AMOUNT, 1, block.timestamp - 1);

        vm.stopPrank();
    }
}
