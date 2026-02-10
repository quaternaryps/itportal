import { NextResponse } from "next/server";
import { addTicketNote, getTicket } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { userId, description } = body;

  if (!userId || !description) {
    return NextResponse.json(
      { error: "userId and description are required" },
      { status: 400 }
    );
  }

  const ticket = await getTicket(id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updatedTicket = await addTicketNote(id, userId, description);
  return NextResponse.json(updatedTicket);
}
