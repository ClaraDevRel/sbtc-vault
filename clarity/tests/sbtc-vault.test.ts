import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const sbtcToken = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";

describe("sbtc-vault contract", () => {
  it("ensures simnet is well initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("allows users to deposit sBTC into the vault", () => {
    const depositAmount = 1000000; // 1 sBTC (8 decimals)

    // Call deposit function
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(depositAmount)],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(depositAmount));

    // Verify user's balance in vault
    const { result: balance } = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance).toBeUint(depositAmount);
  });

  it("tracks total deposits across all users", () => {
    const amount1 = 500000;
    const amount2 = 300000;

    // Wallet 1 deposits
    simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(amount1)], wallet1);

    // Wallet 2 deposits
    simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(amount2)], wallet2);

    // Check total deposits
    const { result } = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-total-deposits",
      [],
      deployer
    );
    expect(result).toBeUint(amount1 + amount2);
  });

  it("records deposit block height", () => {
    const depositAmount = 250000;

    const blockBefore = simnet.blockHeight;

    // Make deposit - this will mine a new block
    const depositCall = simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(depositAmount)], wallet1);
    expect(depositCall.result).toBeOk(Cl.uint(depositAmount));

    // Check deposit block was recorded
    const { result } = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-deposit-block",
      [Cl.principal(wallet1)],
      wallet1
    );

    // The deposit should be recorded at the block height when the deposit tx was executed
    // callPublicFn mines a block, so it should be blockBefore + 1
    expect(result).toBeUint(blockBefore + 1);
  });

  it("rejects zero-amount deposits", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // err-zero-amount
  });

  it("returns user info including balance and deposit block", () => {
    const depositAmount = 750000;

    // Make a deposit
    simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(depositAmount)], wallet1);

    // Get user info
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "get-user-info",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(result).toBeOk(
      Cl.tuple({
        balance: Cl.uint(depositAmount),
        "deposit-block": Cl.uint(simnet.blockHeight - 1),
        "total-deposits": Cl.uint(depositAmount),
      })
    );
  });

  it("allows multiple deposits from same user", () => {
    const deposit1 = 100000;
    const deposit2 = 200000;

    // First deposit
    simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(deposit1)], wallet1);

    // Second deposit
    simnet.callPublicFn("sbtc-vault", "deposit", [Cl.uint(deposit2)], wallet1);

    // Check balance is sum of both deposits
    const { result } = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(result).toBeUint(deposit1 + deposit2);
  });
});
