"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { Ticket, User, CATEGORY_LABELS } from "@/lib/ticket-types";

export default function AdminTicketPortal() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");

  useEffect(() => {
    Promise.all([
      fetch("/api/users?admins=true").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ]).then(([admins, ticketData]) => {
      setAdminUsers(admins);
      // Sort: Open tickets first by newest, then others
      const sorted = sortTickets(ticketData);
      setTickets(sorted);
      setLoading(false);
    });
  }, []);

  const sortTickets = (ticketList: Ticket[]) => {
    return [...ticketList].sort((a, b) => {
      // Open tickets first
      const aOpen = a.status === "Open" || a.status === "In Progress";
      const bOpen = b.status === "Open" || b.status === "In Progress";
      if (aOpen && !bOpen) return -1;
      if (!aOpen && bOpen) return 1;
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "open") return t.status === "Open" || t.status === "In Progress";
    if (filter === "closed") return t.status === "Closed" || t.status === "Cancelled";
    return true;
  });

  const handleStatusChange = async (ticketId: string, status: string) => {
    if (!currentAdmin) {
      alert("Please select your admin ID first");
      return;
    }

    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userId: currentAdmin }),
    });

    if (res.ok) {
      const updated = await res.json();
      const newTickets = sortTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
      setTickets(newTickets);
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
    }
  };

  const handleAssign = async (ticketId: string, assignedTo: string) => {
    if (!currentAdmin) {
      alert("Please select your admin ID first");
      return;
    }

    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo, userId: currentAdmin }),
    });

    if (res.ok) {
      const updated = await res.json();
      const newTickets = sortTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
      setTickets(newTickets);
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !newNote.trim() || !currentAdmin) {
      if (!currentAdmin) alert("Please select your admin ID first");
      return;
    }

    const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentAdmin, description: newNote }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTicket(updated);
      setNewNote("");
    }
  };

  const generatePDF = (ticket: Ticket) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("IT Support Ticket", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Ticket ID and Status
    doc.setFontSize(14);
    doc.text(`Ticket ID: ${ticket.id}`, 20, y);
    doc.text(`Status: ${ticket.status}`, pageWidth - 20, y, { align: "right" });
    y += 15;

    // Divider
    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const addField = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(value, pageWidth - 70);
      doc.text(lines, 60, y);
      y += 7 * Math.max(lines.length, 1);
    };

    addField("Category", CATEGORY_LABELS[ticket.category] || ticket.category);
    addField("Priority", ticket.priority);
    addField("Created By", ticket.userId);
    addField("Created At", new Date(ticket.createdAt).toLocaleString());
    addField("Assigned To", ticket.assignedTo || "Unassigned");
    if (ticket.assignedAt) {
      addField("Assigned At", new Date(ticket.assignedAt).toLocaleString());
    }
    if (ticket.closedAt) {
      addField("Closed At", new Date(ticket.closedAt).toLocaleString());
    }

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Brief Description:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const briefLines = doc.splitTextToSize(ticket.briefDescription, pageWidth - 40);
    doc.text(briefLines, 20, y);
    y += 7 * briefLines.length + 5;

    doc.setFont("helvetica", "bold");
    doc.text("Details:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const detailLines = doc.splitTextToSize(ticket.details, pageWidth - 40);
    doc.text(detailLines, 20, y);
    y += 7 * detailLines.length + 10;

    // Notes
    if (ticket.notes.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 20, y);
      y += 7;

      ticket.notes.forEach((note) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${note.userId} - ${new Date(note.timestamp).toLocaleString()}`, 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const noteLines = doc.splitTextToSize(note.description, pageWidth - 40);
        doc.text(noteLines, 20, y);
        y += 7 * noteLines.length + 3;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 285, { align: "center" });

    doc.save(`ticket-${ticket.id}.pdf`);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-blue-600";
      case "In Progress": return "bg-yellow-600";
      case "Closed": return "bg-green-600";
      case "Cancelled": return "bg-gray-600";
      default: return "bg-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">IT Ticket Administration</h1>
            <p className="text-sm text-slate-400">Manage and track all IT support tickets</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Admin Selection */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4 flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Your Admin ID
            </label>
            <select
              value={currentAdmin}
              onChange={(e) => setCurrentAdmin(e.target.value)}
              className="w-full max-w-xs bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="">-- Select Admin --</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Filter</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("open")}
                className={`px-3 py-2 rounded text-sm ${filter === "open" ? "bg-blue-600" : "bg-slate-700"}`}
              >
                Open
              </button>
              <button
                onClick={() => setFilter("closed")}
                className={`px-3 py-2 rounded text-sm ${filter === "closed" ? "bg-blue-600" : "bg-slate-700"}`}
              >
                Closed
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 rounded text-sm ${filter === "all" ? "bg-blue-600" : "bg-slate-700"}`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Ticket List (3 cols) */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <h2 className="font-semibold">Tickets ({filteredTickets.length})</h2>
            </div>
            {loading ? (
              <div className="p-4 text-slate-400">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-4 text-slate-400">No tickets found</div>
            ) : (
              <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-slate-700" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-slate-400">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="font-medium text-sm truncate">{ticket.briefDescription}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{ticket.userId}</span>
                      <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                      <span>{ticket.assignedTo ? `-> ${ticket.assignedTo}` : "Unassigned"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Ticket Detail (3 cols) */}
          <div className="lg:col-span-3 bg-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="font-semibold">Ticket Details</h2>
            </div>
            {selectedTicket ? (
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg">{selectedTicket.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <button
                      onClick={() => generatePDF(selectedTicket)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Brief Description</label>
                  <p className="font-medium">{selectedTicket.briefDescription}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Details</label>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedTicket.details}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-slate-400">Category</label>
                    <p>{CATEGORY_LABELS[selectedTicket.category]}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Priority</label>
                    <p className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Created By</label>
                    <p>{selectedTicket.userId}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Created</label>
                    <p>{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Assigned To</label>
                    <p>{selectedTicket.assignedTo || "Unassigned"}</p>
                  </div>
                  {selectedTicket.closedAt && (
                    <div>
                      <label className="text-xs text-slate-400">Closed</label>
                      <p>{formatDate(selectedTicket.closedAt)}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedTicket.notes.length > 0 && (
                  <div>
                    <label className="text-xs text-slate-400">Notes ({selectedTicket.notes.length})</label>
                    <div className="mt-1 space-y-2 max-h-40 overflow-y-auto">
                      {selectedTicket.notes.map((note) => (
                        <div key={note.id} className="bg-slate-700 rounded p-2 text-sm">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{note.userId}</span>
                            <span>{formatDate(note.timestamp)}</span>
                          </div>
                          <p className="text-slate-200">{note.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t border-slate-700 pt-4 space-y-3">
                  {/* Change Status */}
                  {(selectedTicket.status === "Open" || selectedTicket.status === "In Progress") && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400 w-20">Status:</label>
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, "Closed")}
                        className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded text-sm"
                      >
                        Close Ticket
                      </button>
                    </div>
                  )}

                  {/* Assign To */}
                  {(selectedTicket.status === "Open" || selectedTicket.status === "In Progress") && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400 w-20">Assign To:</label>
                      <select
                        value={selectedTicket.assignedTo || ""}
                        onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                      >
                        <option value="">-- Unassigned --</option>
                        {adminUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Add Note */}
                  <div>
                    <label className="text-xs text-slate-400">Add Note</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type your note..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || !currentAdmin}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-slate-400">Select a ticket to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
