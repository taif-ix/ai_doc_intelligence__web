import { NextRequest } from "next/server";
import { proxyBackendContractPreview } from "@/src/server/backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackendContractPreview(id);
}
