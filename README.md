# Yellowstone SPL Token Transfer Monitor

A TypeScript application for monitoring SPL token transfers on Solana using the Yellowstone gRPC client.

## Todo lisT:

- [ ] Parse balances from the transaction (previous balances and new balances)
- [x] Parse ALL transfer instruction fron the transaction, not only the first one
- [x] Add a database to store the transactions
- [x] Improve parsing of the compiled instructios
- [ ] Investigate why sometimes addresses from the body of the instruction have IDs out or bounds of the account keys
- [x] Check if we have right addresses as receiver and sender
