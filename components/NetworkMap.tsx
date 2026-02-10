"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

// Types
export type StatusLevel = 'green' | 'yellow' | 'red';
export interface NetworkNode {
  id: string;
  label: string;
  status: StatusLevel;
  route: string;
}

interface Props {
  data: NetworkNode[];
  complianceStatuses?: Record<string, StatusLevel>;
}

const NetworkMap: React.FC<Props> = ({ data, complianceStatuses = {} }) => {
  const router = useRouter();

  // Helper to get status color - uses compliance status if available, falls back to data
  const getStatusColor = (id: string): string => {
    const status = complianceStatuses[id] || data.find((n) => n.id === id)?.status || 'green';
    switch (status) {
      case 'red': return '#ef4444';    // Red-500
      case 'yellow': return '#eab308'; // Yellow-500
      default: return '#22c55e';       // Green-500
    }
  };

  const handleNodeClick = (id: string) => {
    router.push(`/compliance/${id}`);
  };

  // Reusable Icon Group Wrapper
  const IconGroup = ({ id, x, y, label, children }: any) => (
    <g
      onClick={() => handleNodeClick(id)}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      transform={`translate(${x}, ${y})`}
    >
      {/* Invisible hit box for easier clicking */}
      <rect x="-40" y="-40" width="80" height="90" fill="transparent" />

      {/* The Icon Graphic passed as children */}
      {children}

      {/* The Status Light (Dynamic based on compliance) */}
      <circle cx="30" cy="-30" r="8" fill={getStatusColor(id)} stroke="white" strokeWidth="2" />

      {/* Label */}
      <text y="50" textAnchor="middle" fill="#ccc" fontSize="12" fontWeight="bold">{label}</text>
    </g>
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 p-10">
      <svg viewBox="0 0 1000 600" className="w-full max-w-6xl shadow-2xl rounded-xl bg-slate-800">
        {/* TOP-RIGHT ACTION ICONS */}
        {/* Gear (Configuration) */}
        <g
          onClick={() => router.push('/config')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          transform="translate(940, 35)"
        >
          <title>Configuration</title>
          <circle r="18" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <path
            d="M-7 -2 L-7 2 L-4 2 L-3.5 4 L-6 6.5 L-3.5 9 L-1 6.5 L1 7 L1 10 L5 10 L5 7 L7 6.5 L9.5 9 L12 6.5 L9.5 4 L10 2 L13 2 L13 -2 L10 -2 L9.5 -4 L12 -6.5 L9.5 -9 L7 -6.5 L5 -7 L5 -10 L1 -10 L1 -7 L-1 -6.5 L-3.5 -9 L-6 -6.5 L-3.5 -4 L-4 -2 Z"
            fill="#94a3b8"
            transform="translate(-3, 0) scale(0.85)"
          />
          <circle r="3.5" fill="#334155" transform="translate(0, 0)" />
        </g>

        {/* Lock (Secrets / Infisical) */}
        <g
          onClick={() => handleNodeClick('secrets')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          transform="translate(900, 35)"
        >
          <title>Secrets (Infisical)</title>
          <circle r="18" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <rect x="-7" y="-2" width="14" height="11" rx="2" fill="#94a3b8" />
          <path d="M-4 -2 L-4 -6 Q-4 -10 0 -10 Q4 -10 4 -6 L4 -2" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <circle r="2" cy="3" fill="#334155" />
          {/* Status indicator for secrets */}
          <circle cx="12" cy="-12" r="5" fill={getStatusColor('secrets')} stroke="white" strokeWidth="1" />
        </g>

        {/* Ticket (IT Tickets) */}
        <g
          onClick={() => router.push('/tickets/admin')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          transform="translate(860, 35)"
        >
          <title>IT Tickets</title>
          <circle r="18" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#94a3b8" />
          <line x1="-6" y1="-6" x2="6" y2="-6" stroke="#334155" strokeWidth="1.5" />
          <line x1="-6" y1="-1" x2="6" y2="-1" stroke="#334155" strokeWidth="1.5" />
          <line x1="-6" y1="4" x2="3" y2="4" stroke="#334155" strokeWidth="1.5" />
          <path d="M-2 8 L1 11 L6 5" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* CONNECTOR LINES */}
        <g stroke="#475569" strokeWidth="2">
            {/* Laptop/PC to Switch */}
            <line x1="100" y1="100" x2="300" y2="250" />
            <line x1="100" y1="250" x2="300" y2="250" />

            {/* Apps to Switch */}
            <line x1="100" y1="400" x2="300" y2="250" />

            {/* WiFi to Switch */}
            <line x1="300" y1="100" x2="300" y2="250" />

            {/* Switch to Firewall */}
            <line x1="300" y1="250" x2="500" y2="250" />

            {/* VPN to Firewall */}
            <line x1="500" y1="100" x2="500" y2="250" />

            {/* Firewall to Server/NAS */}
            <line x1="500" y1="250" x2="700" y2="100" />
            <line x1="500" y1="250" x2="700" y2="250" />

            {/* Server to Cloud */}
            <line x1="700" y1="250" x2="900" y2="250" />

            {/* Cloud to M365 */}
            <line x1="900" y1="250" x2="900" y2="400" />

            {/* Auth to M365 */}
            <line x1="700" y1="550" x2="900" y2="400" />

            {/* VM to Server */}
            <line x1="700" y1="400" x2="700" y2="250" />
        </g>

        {/* --- COLUMN 1: END USERS --- */}
        <IconGroup id="laptop" x={100} y={100} label="Laptops">
            <rect x="-25" y="-20" width="50" height="35" rx="4" fill="#64748b" />
            <path d="M-30 15 L30 15 L35 25 L-35 25 Z" fill="#475569" />
        </IconGroup>

        <IconGroup id="pc" x={100} y={250} label="Workstations">
            <rect x="-25" y="-25" width="50" height="40" rx="2" fill="#64748b" />
            <rect x="-30" y="20" width="60" height="5" fill="#475569" />
        </IconGroup>

        <IconGroup id="apps" x={100} y={400} label="Apps">
            <rect x="-25" y="-25" width="50" height="50" rx="8" fill="#3b82f6" />
            <rect x="-15" y="-15" width="10" height="10" fill="white" opacity="0.5"/>
            <rect x="5" y="-15" width="10" height="10" fill="white" opacity="0.5"/>
            <rect x="-15" y="5" width="10" height="10" fill="white" opacity="0.5"/>
            <rect x="5" y="5" width="10" height="10" fill="white" opacity="0.5"/>
        </IconGroup>

        {/* --- COLUMN 2: LOCAL INFRA --- */}
        <IconGroup id="wifi" x={300} y={100} label="WiFi">
            <path d="M-20 0 Q0 -25 20 0 M-10 10 Q0 -5 10 10" fill="none" stroke="#38bdf8" strokeWidth="3" />
            <circle r="4" cy="20" fill="#38bdf8" />
        </IconGroup>

        <IconGroup id="switch" x={300} y={250} label="LAN Switch">
             <rect x="-35" y="-15" width="70" height="30" fill="#334155" stroke="#94a3b8" strokeWidth="2"/>
             <circle cx="-20" cy="0" r="2" fill="#22c55e"/>
             <circle cx="0" cy="0" r="2" fill="#22c55e"/>
             <circle cx="20" cy="0" r="2" fill="#22c55e"/>
        </IconGroup>

        {/* --- COLUMN 3: SECURITY --- */}
        <IconGroup id="vpn" x={500} y={100} label="VPN">
            <rect x="-25" y="-20" width="50" height="40" rx="4" fill="#8b5cf6" />
            <path d="M-10 -5 L0 -15 L10 -5 L10 10 L-10 10 Z" fill="#c4b5fd" />
            <circle r="3" cy="5" fill="#8b5cf6" />
        </IconGroup>

        <IconGroup id="firewall" x={500} y={250} label="Firewall">
             <path d="M0 -30 L25 -15 V10 C25 25 0 35 0 35 C0 35 -25 25 -25 10 V-15 Z" fill="#f59e0b" />
        </IconGroup>

        {/* --- COLUMN 4: SERVERS --- */}
        <IconGroup id="nas" x={700} y={100} label="NAS Storage">
            <rect x="-25" y="-30" width="50" height="60" rx="2" fill="#475569" />
            <line x1="-20" y1="-10" x2="20" y2="-10" stroke="#1e293b" strokeWidth="2"/>
            <line x1="-20" y1="10" x2="20" y2="10" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="15" cy="-10" r="3" fill="#22c55e"/>
            <circle cx="15" cy="10" r="3" fill="#eab308"/>
        </IconGroup>

        <IconGroup id="server" x={700} y={250} label="Servers">
             <rect x="-25" y="-35" width="50" height="70" fill="#1e293b" stroke="#64748b" />
             <rect x="-20" y="-25" width="40" height="5" fill="#22c55e" opacity="0.5"/>
             <rect x="-20" y="-10" width="40" height="5" fill="#22c55e" opacity="0.5"/>
             <rect x="-20" y="5" width="40" height="5" fill="#22c55e" opacity="0.5"/>
        </IconGroup>

        <IconGroup id="vm" x={700} y={400} label="VMs">
             <rect x="-20" y="-20" width="40" height="40" fill="#6366f1" opacity="0.6" transform="translate(-10, -10)" />
             <rect x="-20" y="-20" width="40" height="40" fill="#818cf8" stroke="white" />
             <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10">VM</text>
        </IconGroup>

        <IconGroup id="auth" x={700} y={550} label="Authentication">
             <circle r="25" fill="#10b981" />
             <circle r="10" cy="-5" fill="#d1fae5" />
             <path d="M-15 10 Q0 25 15 10" fill="#d1fae5" />
        </IconGroup>

        {/* --- COLUMN 5: CLOUD --- */}
        <IconGroup id="cloud" x={900} y={250} label="Cloud">
             <path d="M-30 10 Q-40 10 -40 -5 Q-40 -20 -20 -20 Q-20 -40 10 -40 Q35 -40 40 -15 Q50 -15 50 10 Z" fill="#0ea5e9" />
        </IconGroup>

        <IconGroup id="m365" x={900} y={400} label="Microsoft 365">
             <rect x="-25" y="-25" width="50" height="50" rx="4" fill="#dc2626" />
             <text x="0" y="8" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">M</text>
        </IconGroup>

      </svg>
    </div>
  );
};

export default NetworkMap;
