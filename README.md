# Yellowstone SPL Token Transfer Monitor

A TypeScript application for monitoring SPL token transfers on Solana using the Yellowstone gRPC client.

## Todo lisT:

- [ ] Parse ALL transfer instruction fron the transaction, not only the first one
- [ ] Add a database to store the transactions
- [ ] Improve parsing of the compled instructios
- [ ] Investigate why sometimes addresses from the body of the instruction have IDs out or bounds of the account keys
