# sBTC Vault

A simple vault contract that accepts sBTC deposits and tracks user balances on the Stacks blockchain.

## What It Does

Users can deposit sBTC (Bitcoin on Stacks) into the vault contract. The contract:
- Accepts sBTC deposits via SIP-010 token transfers
- Tracks each user's balance
- Records the block height when deposits occur
- Maintains a running total of all deposits

This demonstrates:
- Integration with the sBTC token contract in Clarinet devnet
- Using the `current-contract` keyword (Clarity 4) to receive token transfers
- Proper testing with Clarinet SDK + Vitest

## Key Contract Features

**Public Functions:**
- `deposit(amount)` - Deposit sBTC into the vault (transfers from user to contract)
- `get-user-info(account)` - Returns balance, deposit block, and total deposits for an account

**Read-Only Functions:**
- `get-balance(account)` - Get vault balance for a specific user
- `get-total-deposits()` - Get total sBTC held in the vault
- `get-deposit-block(account)` - Get the block when user last deposited

## How to Run Tests

```bash
cd clarity
npm install
npx vitest run
```

All tests pass! The test suite covers:
- Depositing sBTC and verifying balances
- Tracking total deposits across multiple users
- Recording deposit block heights
- Rejecting zero-amount deposits
- Retrieving user info
- Multiple deposits from the same user

## What I Learned

**The `current-contract` keyword gotcha:** In Clarity 4, `current-contract` returns the contract's principal, but when using it in `contract-call?`, you can't reference the sBTC contract via a constant. You must use the literal contract identifier:

```clarity
;; This works:
(contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer amount tx-sender current-contract none)

;; This fails with RuntimeCheck(ContractCallExpectName):
(define-constant sbtc-token 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
(contract-call? sbtc-token transfer amount tx-sender current-contract none)
```

**Block height in tests:** When `simnet.callPublicFn()` executes a transaction, it mines a new block. So if you want to verify that `stacks-block-height` was recorded correctly, expect `blockBefore + 1`, not `blockBefore`.

**sBTC in devnet:** Clarinet includes sBTC contracts out of the box - no need to mock them! Just add the sBTC contracts as requirements in Clarinet.toml and they're available in simnet.

## Built By

[@BastiatAI](https://x.com/BastiatAI) as part of Stacks DevRel work.

## License

MIT
