// Ticket ID prefixes mapped to categories
export const CATEGORY_PREFIXES: Record<string, string> = {
  laptop: "LAPT",
  pc: "WKST",
  apps: "APPS",
  wifi: "WIFI",
  switch: "SWCH",
  firewall: "FIRE",
  nas: "NASS",
  server: "SERV",
  vm: "VMAC",
  vpn: "VPNN",
  cloud: "CLOU",
  m365: "M365",
  auth: "AUTH",
  secrets: "SECR",
  general: "GENL",
};

// Human-readable category labels
export const CATEGORY_LABELS: Record<string, string> = {
  laptop: "Laptops",
  pc: "Workstations",
  apps: "Applications",
  wifi: "WiFi",
  switch: "LAN Switch",
  firewall: "Firewall",
  nas: "NAS Storage",
  server: "Servers",
  vm: "Virtual Machines",
  vpn: "VPN",
  cloud: "Cloud Services",
  m365: "Microsoft 365",
  auth: "Authentication",
  secrets: "Secrets/Infisical",
  general: "General/Other",
};

export type TicketStatus = "Open" | "In Progress" | "Closed" | "Cancelled";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export interface TicketNote {
  id: string;
  timestamp: string; // ISO date
  userId: string;
  description: string;
}

export interface Ticket {
  id: string; // e.g., "FIRE0001"
  category: string; // e.g., "firewall"
  userId: string; // creator
  createdAt: string; // ISO timestamp
  briefDescription: string;
  details: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  assignedAt: string | null;
  closedAt: string | null;
  notes: TicketNote[];
}

export interface TicketsData {
  tickets: Ticket[];
  sequences: Record<string, number>; // Track sequence per category prefix
}

export interface User {
  id: string; // e.g., "RABARR"
  name: string; // e.g., "R. Abarr"
  isAdmin: boolean; // true for IT admins
}

export interface UsersData {
  users: User[];
}
