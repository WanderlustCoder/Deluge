import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAquiferWithPlan } from "@/lib/aquifer";

// GET: Fetch aquifer fund balances with active strategic plan
export async function GET() {
  const session = await auth();

  const data = await getAquiferWithPlan(session?.user?.id);

  return NextResponse.json(data);
}
