# ArcWave Security Overview

ArcWave is a stablecoin-focused DEX and liquidity layer built for Arc testnet.

## Current Security Features

- SafeERC20 transfers
- Reentrancy protection on swap and liquidity functions
- Emergency pause controls
- Owner-gated pool creation
- Slippage protection through minimum output checks
- Deadline-enabled swap functions
- Verified stablecoin pool deployment
- Factory-based pool registry
- Router-based swap execution
- Initial liquidity deployed to protected pools
- Foundry security tests

## Protected Contracts

Factory:
0xEd62670DB50E6e1C312F086B3230168D7E1521AA

Router:
0xD0796C8e58DE024E063770981E153629BcF41932

## Protected Pools

tUSDC/tARC:
0x671199e3F5cc97170A70d0C47e32e5f8FfeE4cE7

tUSDC/tUSDT:
0x2BD2D2935D02eBb49BeEDE9b32e5EF6F976DDF84

tUSDC/tDAI:
0xA63bA3DF60Aed1D87d2f141d9aE1ed69fF1D07c4

tUSDC/tUSDe:
0x05D8B17ea05b87514157037899C726985a7e70d7

tUSDC/tPYUSD:
0x1958706756A77871b925194A92f3629db4956c51

## Initial Liquidity

Each protected pool was initialized with 100 + 100 testnet tokens.

## Security Tests

The current Foundry test suite covers:

- Add liquidity
- Remove liquidity
- Normal swap execution
- Slippage revert
- Expired deadline revert
- Invalid token revert
- Pause blocking swaps
- Unpause restoring swaps
- Factory pool creation
- Duplicate pool prevention
- Router swap execution
- Router deadline protection

Latest result:

12 tests passed, 0 failed, 0 skipped.

## Current Limitations

ArcWave is currently a testnet prototype.

The protocol currently assumes standard ERC20 behavior. Fee-on-transfer, rebasing, blacklisting and other non-standard ERC20 tokens are not supported.

Admin controls are currently owner-based. For production, ownership should be transferred to a multisig and ideally protected by a timelock.

## Next Security Milestones

- Add multisig ownership
- Add Ownable2Step
- Add more invariant tests
- Add Slither static analysis
- Add frontend deadline enforcement
- Add verified pool UI labels
- Add fee caps before enabling protocol fees
- Add external audit before mainnet
