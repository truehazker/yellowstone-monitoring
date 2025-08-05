import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const balancesTable = sqliteTable("balances_table", {
  id: int().primaryKey({ autoIncrement: true }),
  address: text().notNull(),
  token: text().notNull(),
  amount: int().notNull(),
});
