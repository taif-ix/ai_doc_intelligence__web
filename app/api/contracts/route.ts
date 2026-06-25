import { NextResponse } from "next/server";
import { getContracts } from "@/src/server/contracts";

export async function GET() {
  return NextResponse.json(getContracts());
}
