import { NextRequest, NextResponse } from "next/server";
import { deleteContract, getContract } from "@/src/server/contracts";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const contract = getContract(id);

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(contract);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteContract(id);

  if (!deleted) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Contract deleted" });
}
