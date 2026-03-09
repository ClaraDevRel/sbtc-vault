;; sbtc-vault
;; A simple vault contract that accepts sBTC deposits and tracks balances
;; Users can deposit sBTC (transferred to contract) and track their balance

;; Constants
(define-constant contract-owner tx-sender)
(define-constant contract-principal (as-contract tx-sender))
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-zero-amount (err u102))

;; Note: sBTC token contract is referenced directly in contract-call? as it requires a literal

;; Data Variables
(define-data-var total-deposits uint u0)

;; Data Maps - track user deposits
(define-map deposits principal uint)
(define-map deposit-block principal uint)

;; Read-only functions

(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? deposits account))
)

(define-read-only (get-total-deposits)
  (var-get total-deposits)
)

(define-read-only (get-deposit-block (account principal))
  (default-to u0 (map-get? deposit-block account))
)

;; Public functions

(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) err-zero-amount)

    ;; Transfer sBTC from user to contract
    ;; Note: contract-call? requires literal contract identifier, not a constant
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer amount tx-sender contract-principal none))

    ;; Update user's deposit balance
    (map-set deposits tx-sender (+ (get-balance tx-sender) amount))

    ;; Record deposit block
    (map-set deposit-block tx-sender stacks-block-height)

    ;; Update total deposits
    (var-set total-deposits (+ (var-get total-deposits) amount))

    (ok amount)
  )
)

(define-public (withdraw (amount uint))
  (let
    (
      (current-balance (get-balance tx-sender))
      (recipient tx-sender)
    )
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (>= current-balance amount) err-insufficient-balance)

    ;; Transfer sBTC from contract back to user
    ;; Capture tx-sender as recipient before as-contract switches context
    (try! (as-contract (contract-call?
      'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      transfer amount tx-sender recipient none)))

    ;; Update user's deposit balance
    (map-set deposits recipient (- current-balance amount))

    ;; Update total deposits
    (var-set total-deposits (- (var-get total-deposits) amount))

    (ok amount)
  )
)

(define-read-only (get-user-info (account principal))
  {
    balance: (get-balance account),
    deposit-block: (get-deposit-block account),
    total-deposits: (var-get total-deposits)
  }
)
