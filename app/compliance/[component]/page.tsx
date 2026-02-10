"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ComponentCompliance, ComplianceStatus, ComplianceMetric } from "@/lib/compliance-types";

interface ComplianceResponse extends ComponentCompliance {
  status: ComplianceStatus;
  percentage: number;
}

export default function ComplianceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const componentId = params.component as string;

  const [data, setData] = useState<ComplianceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/compliance/${componentId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Component not found");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [componentId]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: ComplianceStatus) => {
    switch (status) {
      case "green": return "bg-green-600";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-600";
    }
  };

  const getStatusLabel = (status: ComplianceStatus) => {
    switch (status) {
      case "green": return "Compliant";
      case "yellow": return "Partial";
      case "red": return "Non-Compliant";
    }
  };

  const getMetricIcon = (compliant: boolean) => {
    return compliant ? (
      <span className="text-green-500 text-xl">✓</span>
    ) : (
      <span className="text-red-500 text-xl">✗</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "Component not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const compliantCount = data.metrics.filter((m) => m.compliant).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">{data.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(data.status)}`}>
                {getStatusLabel(data.status)}
              </span>
            </div>
            <p className="text-slate-400">{data.description}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Compliance Score</p>
            <p className={`text-3xl font-bold ${
              data.percentage === 100 ? "text-green-500" :
              data.percentage >= 50 ? "text-yellow-500" : "text-red-500"
            }`}>
              {data.percentage}%
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Metrics Passing</p>
            <p className="text-3xl font-bold">
              <span className="text-green-500">{compliantCount}</span>
              <span className="text-slate-500"> / {data.metrics.length}</span>
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Issues Found</p>
            <p className={`text-3xl font-bold ${
              data.metrics.length - compliantCount === 0 ? "text-green-500" : "text-red-500"
            }`}>
              {data.metrics.length - compliantCount}
            </p>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold">Compliance Metrics</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                <th className="px-4 py-3 w-12">Status</th>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3 w-44">Last Checked</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.map((metric) => (
                <tr
                  key={metric.id}
                  className={`border-b border-slate-700/50 last:border-0 ${
                    !metric.compliant ? "bg-red-900/20" : ""
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    {getMetricIcon(metric.compliant)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-slate-400">{metric.description}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {formatDate(metric.lastChecked)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={metric.compliant ? "text-slate-300" : "text-red-300"}>
                      {metric.notes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span>Green = 100% Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Yellow = 50-99% Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span>Red = &lt;50% Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
