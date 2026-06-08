// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import "./SimpleDEX.sol";

interface ISimpleDEXAdmin {
    function pause() external;
    function unpause() external;
}

contract ArcWaveFactory is Ownable, Pausable {
    address[] public allPools;

    mapping(address => mapping(address => address)) public getPool;

    event PoolCreated(address indexed tokenA, address indexed tokenB, address indexed pool, uint256 poolId);

    event PoolRegistered(address indexed tokenA, address indexed tokenB, address indexed pool, uint256 poolId);

    event EmergencyPaused(address indexed caller);
    event EmergencyUnpaused(address indexed caller);

    constructor() Ownable(msg.sender) {}

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    function createPool(address tokenA, address tokenB) external onlyOwner whenNotPaused returns (address pool) {
        (address token0, address token1) = _sortTokens(tokenA, tokenB);

        require(getPool[token0][token1] == address(0), "POOL_EXISTS");

        pool = address(new SimpleDEX(token0, token1));

        getPool[token0][token1] = pool;
        getPool[token1][token0] = pool;

        allPools.push(pool);

        emit PoolCreated(token0, token1, pool, allPools.length - 1);
    }

    function registerPool(address tokenA, address tokenB, address pool) external onlyOwner whenNotPaused {
        require(pool != address(0), "POOL_ZERO");

        (address token0, address token1) = _sortTokens(tokenA, tokenB);

        require(getPool[token0][token1] == address(0), "POOL_EXISTS");

        getPool[token0][token1] = pool;
        getPool[token1][token0] = pool;

        allPools.push(pool);

        emit PoolRegistered(token0, token1, pool, allPools.length - 1);
    }

    function pausePool(address tokenA, address tokenB) external onlyOwner {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "POOL_NOT_FOUND");
        ISimpleDEXAdmin(pool).pause();
    }

    function unpausePool(address tokenA, address tokenB) external onlyOwner {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "POOL_NOT_FOUND");
        ISimpleDEXAdmin(pool).unpause();
    }

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != address(0), "TOKEN_A_ZERO");
        require(tokenB != address(0), "TOKEN_B_ZERO");
        require(tokenA != tokenB, "IDENTICAL_TOKENS");

        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }
}
