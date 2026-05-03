import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const count = donations.length;
  const average = count > 0 ? total / count : 0;

  return NextResponse.json({
    donations,
    stats: { total, count, average },
  });
}