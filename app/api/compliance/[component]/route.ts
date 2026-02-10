import { NextResponse } from "next/server";
import { getComponentCompliance } from "@/lib/compliance";
import { calculateStatus, calculatePercentage } from "@/lib/compliance-types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ component: string }> }
) {
  const { component } = await params;
  const compliance = await getComponentCompliance(component);

  if (!compliance) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }

  const status = calculateStatus(compliance.metrics);
  const percentage = calculatePercentage(compliance.metrics);

  return NextResponse.json({
    ...compliance,
    status,
    percentage,
  });
}
