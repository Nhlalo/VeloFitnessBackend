import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const baseUrl = process.env.DATABASE_URL;
const params = new URLSearchParams({
  connection_timeout: "10",
  statement_timeout: "30000", // ← 30 sec for queries
  idle_in_transaction_session_timeout: "60000",
});

const connectionString = `${baseUrl}?${params.toString()}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
