import { proxyBackendExcelReport } from "@/src/server/backend";

export async function GET() {
  return proxyBackendExcelReport();
}
