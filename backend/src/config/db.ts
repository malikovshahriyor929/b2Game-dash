import { prisma } from "../db/prisma";

export async function assertDbConnection() {
  await prisma.$queryRaw`select 1`;
}
