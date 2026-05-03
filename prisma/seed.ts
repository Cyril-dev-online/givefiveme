import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "test1@mail.com" },
      { email: "test2@mail.com" },
      { email: "test3@mail.com" },
    ],
  })

  await prisma.order.createMany({
    data: [
      { amount: 120 },
      { amount: 80 },
      { amount: 200 },
      { amount: 150 },
    ],
  })
}

main().finally(() => prisma.$disconnect())