import { NextResponse } from "next/server";
import { getComplianceData, getAllComponentStatuses } from "@/lib/compliance";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getComplianceData();
  const statuses = await getAllComponentStatuses();
  return NextResponse.json({ data, statuses });
}
