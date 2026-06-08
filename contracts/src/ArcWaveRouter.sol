// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IArcWaveFactory {
    function getPool(address tokenA, address tokenB) external view returns (address);
}

interface ISimpleDEXRouter {
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut);

    function swapWithDeadline(address tokenIn, uint256 amountIn, uint256 minAmountOut, uint256 deadline)
        external
        returns (uint256 amountOut);
}

contract ArcWaveRouter is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    address public factory;

    event RoutedSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        address pool,
        uint256 amountIn,
        uint256 amountOut
    );

    event FactoryUpdated(address indexed oldFactory, address indexed newFactory);
    event EmergencyPaused(address indexed caller);
    event EmergencyUnpaused(address indexed caller);

    constructor(address _factory) Ownable(msg.sender) {
        require(_factory != address(0), "FACTORY_ZERO");
        factory = _factory;
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function setFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "FACTORY_ZERO");

        address oldFactory = factory;
        factory = newFactory;

        emit FactoryUpdated(oldFactory, newFactory);
    }

    // Mantém compatibilidade com o front atual.
    function exactInputSingle(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountOut)
    {
        amountOut = _exactInputSingle(tokenIn, tokenOut, amountIn, minAmountOut, 0, false);
    }

    // Versão mais segura para o próximo front: inclui deadline.
    function exactInputSingleWithDeadline(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "EXPIRED");
        amountOut = _exactInputSingle(tokenIn, tokenOut, amountIn, minAmountOut, deadline, true);
    }

    function _exactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline,
        bool useDeadline
    ) internal returns (uint256 amountOut) {
        require(tokenIn != address(0), "TOKEN_IN_ZERO");
        require(tokenOut != address(0), "TOKEN_OUT_ZERO");
        require(tokenIn != tokenOut, "IDENTICAL_TOKENS");
        require(amountIn > 0, "ZERO_AMOUNT");
        require(minAmountOut > 0, "ZERO_MIN_OUT");

        address pool = IArcWaveFactory(factory).getPool(tokenIn, tokenOut);
        require(pool != address(0), "POOL_NOT_FOUND");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        IERC20(tokenIn).forceApprove(pool, 0);
        IERC20(tokenIn).forceApprove(pool, amountIn);

        uint256 beforeBalance = IERC20(tokenOut).balanceOf(address(this));

        if (useDeadline) {
            ISimpleDEXRouter(pool).swapWithDeadline(tokenIn, amountIn, minAmountOut, deadline);
        } else {
            ISimpleDEXRouter(pool).swap(tokenIn, amountIn, minAmountOut);
        }

        uint256 afterBalance = IERC20(tokenOut).balanceOf(address(this));
        amountOut = afterBalance - beforeBalance;

        require(amountOut >= minAmountOut, "INSUFFICIENT_OUTPUT");

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit RoutedSwap(msg.sender, tokenIn, tokenOut, pool, amountIn, amountOut);
    }
}
