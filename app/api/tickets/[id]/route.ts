import { NextResponse } from "next/server";
import { getTicket, updateTicketStatus, assignTicket } from "@/lib/tickets";
import { TicketStatus } from "@/lib/ticket-types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, assignedTo, userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  let ticket = await getTicket(id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Handle status change
  if (status) {
    ticket = await updateTicketStatus(id, status as TicketStatus, userId);
  }

  // Handle assignment
  if (assignedTo !== undefined) {
    ticket = await assignTicket(id, assignedTo, userId);
  }

  return NextResponse.json(ticket);
}
