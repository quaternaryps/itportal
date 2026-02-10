export interface ComplianceMetric {
  id: string;
  name: string;
  description: string;
  compliant: boolean;
  lastChecked: string; // ISO date
  notes: string;
}

export interface ComponentCompliance {
  id: string;
  name: string;
  description: string;
  metrics: ComplianceMetric[];
}

export interface ComplianceData {
  components: Record<string, ComponentCompliance>;
  lastUpdated: string;
}

export type ComplianceStatus = "green" | "yellow" | "red";

export function calculateStatus(metrics: ComplianceMetric[]): ComplianceStatus {
  if (metrics.length === 0) return "green";
  const compliantCount = metrics.filter((m) => m.compliant).length;
  const percentage = (compliantCount / metrics.length) * 100;
  if (percentage === 100) return "green";
  if (percentage >= 50) return "yellow";
  return "red";
}

export function calculatePercentage(metrics: ComplianceMetric[]): number {
  if (metrics.length === 0) return 100;
  const compliantCount = metrics.filter((m) => m.compliant).length;
  return Math.round((compliantCount / metrics.length) * 100);
}
