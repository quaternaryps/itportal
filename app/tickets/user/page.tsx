"use client";

import { useEffect, useState } from "react";
import { Ticket, User, CATEGORY_LABELS, TicketPriority } from "@/lib/ticket-types";

export default function UserTicketPortal() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  // Create form state
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [briefDescription, setBriefDescription] = useState("");
  const [details, setDetails] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data));
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data: Ticket[]) => {
        const userTickets = data.filter((t) => t.userId === currentUser);
        userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTickets(userTickets);
        setLoading(false);
      });
  }, [currentUser]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setCreating(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        userId: currentUser,
        briefDescription,
        details,
        priority,
      }),
    });

    if (res.ok) {
      const ticket = await res.json();
      setTickets([ticket, ...tickets]);
      setShowCreateForm(false);
      setBriefDescription("");
      setDetails("");
      setCategory("general");
      setPriority("Medium");
    }
    setCreating(false);
  };

  const handleCancelTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to cancel this ticket?")) return;

    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled", userId: currentUser }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
    }
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !newNote.trim()) return;

    const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser, description: newNote }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTicket(updated);
      setNewNote("");
    }
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
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">IT Support Portal</h1>
          <p className="text-sm text-slate-400">Create and track your IT support tickets</p>
        </div>

        {/* User Selection */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Select Your User ID
          </label>
          <div className="flex gap-3">
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id})
                </option>
              ))}
            </select>
            {currentUser && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
              >
                New Ticket
              </button>
            )}
          </div>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="mb-6 bg-slate-800 rounded-lg p-6 border border-slate-600">
            <h2 className="text-lg font-semibold mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Brief Description</label>
                <input
                  type="text"
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  placeholder="Short summary of the issue"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detailed description of the issue..."
                  required
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded font-medium"
                >
                  {creating ? "Creating..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Ticket List */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <h2 className="font-semibold">My Tickets</h2>
              </div>
              {loading ? (
                <div className="p-4 text-slate-400">Loading...</div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-slate-400">No tickets yet</div>
              ) : (
                <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto">
                  {tickets.map((ticket) => (
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
                        <span>{CATEGORY_LABELS[ticket.category]}</span>
                        <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Ticket Detail */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <h2 className="font-semibold">Ticket Details</h2>
              </div>
              {selectedTicket ? (
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg">{selectedTicket.id}</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Brief Description</label>
                    <p className="font-medium">{selectedTicket.briefDescription}</p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Details</label>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedTicket.details}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-slate-400">Category</label>
                      <p>{CATEGORY_LABELS[selectedTicket.category]}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Priority</label>
                      <p className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Created</label>
                      <p>{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Assigned To</label>
                      <p>{selectedTicket.assignedTo || "Unassigned"}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedTicket.notes.length > 0 && (
                    <div>
                      <label className="text-xs text-slate-400">Notes</label>
                      <div className="mt-1 space-y-2">
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

                  {/* Actions */}
                  {(selectedTicket.status === "Open" || selectedTicket.status === "In Progress") && (
                    <div className="border-t border-slate-700 pt-4 space-y-3">
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
                            disabled={!newNote.trim()}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => handleCancelTicket(selectedTicket.id)}
                        className="w-full px-3 py-2 bg-red-700 hover:bg-red-600 rounded text-sm font-medium"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-slate-400">Select a ticket to view details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
