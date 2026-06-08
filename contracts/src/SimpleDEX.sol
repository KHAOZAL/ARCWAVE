// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDEX is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    address public tokenA;
    address public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;

    mapping(address => uint256) public liquidityOf;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);

    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);

    event Swapped(address indexed trader, address indexed tokenIn, uint256 amountIn, uint256 amountOut);

    event EmergencyPaused(address indexed caller);
    event EmergencyUnpaused(address indexed caller);

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        require(_tokenA != address(0), "TOKEN_A_ZERO");
        require(_tokenB != address(0), "TOKEN_B_ZERO");
        require(_tokenA != _tokenB, "IDENTICAL_TOKENS");

        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function addLiquidity(uint256 amountA, uint256 amountB)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 liquidity)
    {
        require(amountA > 0 && amountB > 0, "ZERO_AMOUNT");

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        if (totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            require(reserveA > 0 && reserveB > 0, "EMPTY_RESERVES");

            uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * totalLiquidity) / reserveB;
            liquidity = min(liquidityA, liquidityB);
        }

        require(liquidity > 0, "ZERO_LIQUIDITY");

        liquidityOf[msg.sender] += liquidity;
        totalLiquidity += liquidity;

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    function removeLiquidity(uint256 liquidity)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountA, uint256 amountB)
    {
        require(liquidity > 0, "ZERO_LIQUIDITY");
        require(liquidityOf[msg.sender] >= liquidity, "NOT_ENOUGH_LIQUIDITY");
        require(totalLiquidity > 0, "NO_LIQUIDITY");

        amountA = (liquidity * reserveA) / totalLiquidity;
        amountB = (liquidity * reserveB) / totalLiquidity;

        require(amountA > 0 && amountB > 0, "ZERO_OUTPUT");

        liquidityOf[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;

        reserveA -= amountA;
        reserveB -= amountB;

        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    // Mantém compatibilidade com o front/router atual.
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountOut)
    {
        amountOut = _swap(tokenIn, amountIn, minAmountOut, msg.sender);
    }

    // Versão mais segura para o próximo front: inclui deadline.
    function swapWithDeadline(address tokenIn, uint256 amountIn, uint256 minAmountOut, uint256 deadline)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountOut)
    {
        require(block.timestamp <= deadline, "EXPIRED");
        amountOut = _swap(tokenIn, amountIn, minAmountOut, msg.sender);
    }

    function _swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, address recipient)
        internal
        returns (uint256 amountOut)
    {
        require(recipient != address(0), "RECIPIENT_ZERO");
        require(amountIn > 0, "ZERO_AMOUNT");
        require(tokenIn == tokenA || tokenIn == tokenB, "INVALID_TOKEN");

        bool isTokenA = tokenIn == tokenA;

        address tokenOut = isTokenA ? tokenB : tokenA;

        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;

        require(reserveIn > 0 && reserveOut > 0, "EMPTY_POOL");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / ((reserveIn * 1000) + amountInWithFee);

        require(amountOut > 0, "ZERO_OUT");
        require(amountOut >= minAmountOut, "SLIPPAGE");
        require(reserveOut >= amountOut, "INSUFFICIENT_RESERVE");

        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        IERC20(tokenOut).safeTransfer(recipient, amountOut);

        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        require(tokenIn == tokenA || tokenIn == tokenB, "INVALID_TOKEN");

        bool isTokenA = tokenIn == tokenA;

        uint256 reserveIn = isTokenA ? reserveA : reserveB;
        uint256 reserveOut = isTokenA ? reserveB : reserveA;

        if (amountIn == 0 || reserveIn == 0 || reserveOut == 0) {
            return 0;
        }

        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / ((reserveIn * 1000) + amountInWithFee);
    }

    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = (y / 2) + 1;

            while (x < z) {
                z = x;
                x = ((y / x) + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
