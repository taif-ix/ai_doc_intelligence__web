import { NextResponse } from "next/server";
import { fetchBackendAnalytics } from "@/src/server/backend";
import { getAnalytics } from "@/src/server/contracts";

export async function GET() {
  const backendAnalytics = await fetchBackendAnalytics();
  if (backendAnalytics) {
    return NextResponse.json(backendAnalytics);
  }

  return NextResponse.json(getAnalytics());
}
