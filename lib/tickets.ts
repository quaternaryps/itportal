import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import {
  Ticket,
  TicketsData,
  TicketNote,
  TicketStatus,
  TicketPriority,
  CATEGORY_PREFIXES,
} from "./ticket-types";

const DATA_DIR = path.join(process.cwd(), "data");
const TICKETS_PATH = path.join(DATA_DIR, "tickets.json");

function defaultTicketsData(): TicketsData {
  return {
    tickets: [],
    sequences: {},
  };
}

export async function readTickets(): Promise<TicketsData> {
  try {
    const raw = await readFile(TICKETS_PATH, "utf-8");
    return JSON.parse(raw) as TicketsData;
  } catch {
    const data = defaultTicketsData();
    await writeTickets(data);
    return data;
  }
}

export async function writeTickets(data: TicketsData): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(TICKETS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function generateTicketId(category: string, sequences: Record<string, number>): { id: string; newSequence: number } {
  const prefix = CATEGORY_PREFIXES[category] || CATEGORY_PREFIXES["general"];
  const currentSeq = sequences[prefix] || 0;
  const newSequence = currentSeq + 1;
  const id = `${prefix}${String(newSequence).padStart(4, "0")}`;
  return { id, newSequence };
}

function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function createTicket(
  category: string,
  userId: string,
  briefDescription: string,
  details: string,
  priority: TicketPriority = "Medium"
): Promise<Ticket> {
  const data = await readTickets();
  const { id, newSequence } = generateTicketId(category, data.sequences);
  const prefix = CATEGORY_PREFIXES[category] || CATEGORY_PREFIXES["general"];

  const ticket: Ticket = {
    id,
    category,
    userId,
    createdAt: new Date().toISOString(),
    briefDescription,
    details,
    status: "Open",
    priority,
    assignedTo: null,
    assignedAt: null,
    closedAt: null,
    notes: [],
  };

  data.tickets.push(ticket);
  data.sequences[prefix] = newSequence;
  await writeTickets(data);

  return ticket;
}

export async function getTicket(ticketId: string): Promise<Ticket | null> {
  const data = await readTickets();
  return data.tickets.find((t) => t.id === ticketId) || null;
}

export async function getAllTickets(): Promise<Ticket[]> {
  const data = await readTickets();
  return data.tickets;
}

export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
  const data = await readTickets();
  return data.tickets.filter((t) => t.userId === userId);
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  userId: string
): Promise<Ticket | null> {
  const data = await readTickets();
  const ticket = data.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  ticket.status = status;
  if (status === "Closed" || status === "Cancelled") {
    ticket.closedAt = new Date().toISOString();
  }

  // Add a note about the status change
  ticket.notes.push({
    id: generateNoteId(),
    timestamp: new Date().toISOString(),
    userId,
    description: `Status changed to "${status}"`,
  });

  await writeTickets(data);
  return ticket;
}

export async function assignTicket(
  ticketId: string,
  assignedTo: string,
  assignedBy: string
): Promise<Ticket | null> {
  const data = await readTickets();
  const ticket = data.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const previousAssignee = ticket.assignedTo;
  ticket.assignedTo = assignedTo;
  ticket.assignedAt = new Date().toISOString();

  if (ticket.status === "Open") {
    ticket.status = "In Progress";
  }

  // Add a note about the assignment
  const noteText = previousAssignee
    ? `Reassigned from "${previousAssignee}" to "${assignedTo}"`
    : `Assigned to "${assignedTo}"`;

  ticket.notes.push({
    id: generateNoteId(),
    timestamp: new Date().toISOString(),
    userId: assignedBy,
    description: noteText,
  });

  await writeTickets(data);
  return ticket;
}

export async function addTicketNote(
  ticketId: string,
  userId: string,
  description: string
): Promise<Ticket | null> {
  const data = await readTickets();
  const ticket = data.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const note: TicketNote = {
    id: generateNoteId(),
    timestamp: new Date().toISOString(),
    userId,
    description,
  };

  ticket.notes.push(note);
  await writeTickets(data);
  return ticket;
}
