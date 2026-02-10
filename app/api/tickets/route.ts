import { NextResponse } from "next/server";
import { getAllTickets, createTicket } from "@/lib/tickets";
import { TicketPriority } from "@/lib/ticket-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const tickets = await getAllTickets();
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { category, userId, briefDescription, details, priority } = body;

  if (!category || !userId || !briefDescription || !details) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const ticket = await createTicket(
    category,
    userId,
    briefDescription,
    details,
    (priority as TicketPriority) || "Medium"
  );

  return NextResponse.json(ticket, { status: 201 });
}
