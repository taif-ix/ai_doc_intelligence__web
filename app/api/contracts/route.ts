import { NextResponse } from "next/server";
import { getContracts } from "@/src/server/contracts";
import { fetchBackendContracts } from "@/src/server/backend";

export async function GET() {
  const backendContracts = await fetchBackendContracts();
  if (backendContracts) {
    return NextResponse.json(backendContracts);
  }

  return NextResponse.json(getContracts());
}
