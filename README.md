# Yellowstone SPL Token Transfer Monitor

A TypeScript application for monitoring SPL token transfers on Solana using the Yellowstone gRPC client.

## Todo list:

- [x] Parse balances from the transaction (previous balances and new balances)
- [x] Parse ALL transfer instruction fron the transaction, not only the first one
- [x] Add a database to store the transactions
- [x] Improve parsing of the compiled instructios
- [ ] Investigate why sometimes addresses from the body of the instruction have IDs out or bounds of the account keys
  - Seems like instructions with WSOL use 3 account keys instead of 4 (one is invalid).
  - Maybe there are multiple implementations of the Transfer/TransferChecked?
- [x] Check if we have right addresses as receiver and sender

## How to run

1. Setup `.env` file based on the `.env.example` file
2. Install dependencies
  ```bash
  pnpm install
  ```
3. Initialize the database (this will create the database file)
  ```bash
  pnpm run drizzle:init
  ```
4. Run the application
  ```bash
  pnpm run dev
  ```

## Further improvements

- Track how long ago account's balance was updated, introduce cleaning a database if no updates were done within some time to keep database size small
- Update account's balance based on the transfer event without the need of checking pre and post balances (if balance record exists and server was running non-stop, so no transfer events were skipped). If record does not exist, fallback to the old method.
- Use better DB, preferable hosted one for reliability and performance reasons.
