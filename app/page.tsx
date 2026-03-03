"use client";

import { useEffect, useState } from "react";
import NetworkMap, { NetworkNode, StatusLevel } from "@/components/NetworkMap";

const DEMO_NODES: NetworkNode[] = [
  { id: "laptop", label: "Laptops", status: "green", route: "laptops" },
  { id: "pc", label: "Workstations", status: "green", route: "workstations" },
  { id: "apps", label: "Applications", status: "green", route: "apps" },
  { id: "wifi", label: "WiFi Access", status: "green", route: "wifi" },
  { id: "switch", label: "LAN Switches", status: "green", route: "switches" },
  { id: "firewall", label: "Firewall / Security", status: "green", route: "firewall" },
  { id: "nas", label: "NAS Storage", status: "green", route: "storage" },
  { id: "server", label: "Windows Server", status: "green", route: "servers" },
  { id: "vm", label: "Virtual Machines", status: "green", route: "vms" },
  { id: "useraccounts", label: "User Accounts", status: "green", route: "useraccounts" },
  { id: "networkservices", label: "Network Services", status: "green", route: "networkservices" },
  { id: "appservices", label: "App Services", status: "green", route: "appservices" },
];

export default function Home() {
  const [nodes] = useState<NetworkNode[]>(DEMO_NODES);
  const [complianceStatuses, setComplianceStatuses] = useState<Record<string, StatusLevel>>({});

  useEffect(() => {
    fetch("/api/compliance")
      .then((res) => res.json())
      .then((data) => {
        if (data.statuses) {
          setComplianceStatuses(data.statuses);
        }
      })
      .catch(() => {
        // Compliance API unavailable — use fallback status from nodes
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white">IT Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Infrastructure Compliance Overview</p>
      </header>
      <NetworkMap data={nodes} complianceStatuses={complianceStatuses} />
    </div>
  );
}
