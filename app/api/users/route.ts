import { NextResponse } from "next/server";
import { getAllUsers, getAdminUsers, createUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminsOnly = searchParams.get("admins") === "true";

  const users = adminsOnly ? await getAdminUsers() : await getAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, name, isAdmin } = body;

  if (!id || !name) {
    return NextResponse.json(
      { error: "id and name are required" },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(id, name, isAdmin || false);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
