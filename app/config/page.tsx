"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppConfig } from "@/lib/types";

const NODE_LABELS: Record<string, string> = {
  laptop: "Laptops",
  pc: "Workstations",
  apps: "Apps",
  wifi: "WiFi",
  switch: "LAN Switch",
  firewall: "Firewall",
  nas: "NAS Storage",
  server: "Servers",
  vm: "VMs",
  vpn: "VPN",
  cloud: "Cloud / M365",
  m365: "Microsoft 365",
  auth: "Authentication",
  secrets: "Secrets (Infisical)",
};

export default function ConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: AppConfig) => setConfig(data));
  }, []);

  const handleChange = (nodeId: string, url: string) => {
    if (!config) return;
    setConfig({
      ...config,
      nodes: {
        ...config.nodes,
        [nodeId]: { url },
      },
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Configuration</h1>
            <p className="text-sm text-slate-400">Set destination URLs for each dashboard node</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-4 px-4 py-2 rounded bg-green-900/50 border border-green-700 text-green-300 text-sm">
            Configuration saved successfully.
          </div>
        )}

        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-400 w-40">Node</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">URL</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(config.nodes).map(([nodeId, nodeConfig]) => (
                <tr key={nodeId} className="border-b border-slate-700/50 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">
                    {NODE_LABELS[nodeId] || nodeId}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="url"
                      value={nodeConfig.url}
                      onChange={(e) => handleChange(nodeId, e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
