import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/config";
import { AppConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = (await request.json()) as AppConfig;
  await writeConfig(body);
  return NextResponse.json({ ok: true });
}
