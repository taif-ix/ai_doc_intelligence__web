import { NextResponse } from "next/server";
import { fetchBackendAnalytics, getBackendApiUrl } from "@/src/server/backend";
import { getAnalytics } from "@/src/server/contracts";

export async function GET() {
  const backendUrl = getBackendApiUrl();

  try {
    const backendAnalytics = await fetchBackendAnalytics();
    if (backendAnalytics) {
      return NextResponse.json(backendAnalytics);
    }
  } catch (error) {
    console.warn("Backend /api/analytics unavailable.", error);
    if (backendUrl) {
      return NextResponse.json(
        { error: "Backend /api/analytics unavailable." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(getAnalytics());
}
