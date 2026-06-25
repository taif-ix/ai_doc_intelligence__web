import { NextResponse } from "next/server";
import { getAnalytics } from "@/src/server/contracts";

export async function GET() {
  return NextResponse.json(getAnalytics());
}
