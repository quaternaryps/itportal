import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ComplianceData, ComponentCompliance, calculateStatus, ComplianceStatus } from "./compliance-types";

const DATA_DIR = path.join(process.cwd(), "data");
const COMPLIANCE_PATH = path.join(DATA_DIR, "compliance.json");

// Default compliance data - used to seed the JSON file on first run
function defaultComplianceData(): ComplianceData {
  return {
    lastUpdated: new Date().toISOString(),
    components: {
      laptop: {
        id: "laptop",
        name: "Laptops",
        description: "Mobile computing devices managed by IT",
        metrics: [
          { id: "mdm_enrolled", name: "MDM Enrollment", description: "Device enrolled in mobile device management", compliant: true, lastChecked: "2026-02-05T14:30:00Z", notes: "All 47 laptops enrolled in Intune" },
          { id: "disk_encryption", name: "Disk Encryption", description: "BitLocker/FileVault enabled and key escrowed", compliant: true, lastChecked: "2026-02-05T14:30:00Z", notes: "BitLocker active, keys stored in Azure AD" },
          { id: "os_patching", name: "OS Patching", description: "Updates installed within 14 days of release", compliant: true, lastChecked: "2026-02-04T09:00:00Z", notes: "January patches deployed to 100% of devices" },
          { id: "antivirus", name: "Antivirus Active", description: "EDR/AV running with definitions < 24hrs old", compliant: true, lastChecked: "2026-02-06T06:00:00Z", notes: "Defender for Endpoint active on all devices" },
          { id: "screen_lock", name: "Screen Lock Policy", description: "Auto-lock enabled with ≤5 minute timeout", compliant: true, lastChecked: "2026-02-05T14:30:00Z", notes: "Policy enforced via Intune" }
        ]
      },
      pc: {
        id: "pc",
        name: "Workstations",
        description: "Desktop computers and fixed workstations",
        metrics: [
          { id: "antivirus", name: "Anti-Virus Active", description: "Anti-virus software updated and running", compliant: true, lastChecked: "2026-02-06T07:00:00Z", notes: "Windows Defender active, definitions current" },
          { id: "firewall", name: "Windows Firewall", description: "Windows Firewall enabled and configured", compliant: true, lastChecked: "2026-02-06T07:00:00Z", notes: "Domain profile active on all workstations" },
          { id: "software_inventory", name: "Software Inventory", description: "Software inventory inspection within last 90 days", compliant: true, lastChecked: "2026-01-15T10:00:00Z", notes: "Last audit completed Jan 15, 2026" },
          { id: "windows_update", name: "Windows Update", description: "Windows Update ran this month", compliant: true, lastChecked: "2026-02-03T03:00:00Z", notes: "February updates installed via WSUS" },
          { id: "group_policy", name: "Group Policy Sync", description: "Device synced with Group Policy within 24 hours", compliant: true, lastChecked: "2026-02-06T06:30:00Z", notes: "GPO last applied at startup today" }
        ]
      },
      apps: {
        id: "apps",
        name: "Applications",
        description: "Business applications and software",
        metrics: [
          { id: "license_valid", name: "License Compliance", description: "All software properly licensed", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "License audit passed - 156 apps verified" },
          { id: "version_current", name: "Version Currency", description: "Applications on supported versions", compliant: false, lastChecked: "2026-02-05T11:00:00Z", notes: "3 apps on EOL versions: Adobe Reader DC, Java 8, Office 2016" },
          { id: "vulnerability_scan", name: "Vulnerability Scan", description: "No critical CVEs unpatched > 30 days", compliant: false, lastChecked: "2026-02-04T22:00:00Z", notes: "2 critical CVEs pending: CVE-2026-1234, CVE-2026-1235" },
          { id: "approved_list", name: "Approved Software", description: "All apps from approved vendor list", compliant: true, lastChecked: "2026-02-05T11:00:00Z", notes: "No unauthorized software detected" }
        ]
      },
      wifi: {
        id: "wifi",
        name: "WiFi",
        description: "Wireless network infrastructure",
        metrics: [
          { id: "encryption", name: "Encryption Standard", description: "WPA3 or WPA2-Enterprise enabled", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "WPA2-Enterprise with AES-256" },
          { id: "radius_auth", name: "RADIUS Authentication", description: "802.1X authentication configured", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "RADIUS integrated with Active Directory" },
          { id: "guest_isolation", name: "Guest Network Isolation", description: "Guest network isolated from corporate", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Guest VLAN 100 with internet-only access" },
          { id: "firmware", name: "AP Firmware", description: "Access point firmware updated within 90 days", compliant: true, lastChecked: "2026-01-20T02:00:00Z", notes: "Firmware v8.10.2 deployed to all 12 APs" },
          { id: "rogue_detection", name: "Rogue AP Detection", description: "Wireless IDS monitoring active", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "No rogue APs detected in last 30 days" }
        ]
      },
      switch: {
        id: "switch",
        name: "LAN Switch",
        description: "Network switching infrastructure",
        metrics: [
          { id: "firmware", name: "Firmware Current", description: "Switch OS updated within 90 days", compliant: true, lastChecked: "2026-01-15T03:00:00Z", notes: "Cisco IOS 17.9.4 on all switches" },
          { id: "port_security", name: "Port Security", description: "Unused ports disabled or MAC-limited", compliant: true, lastChecked: "2026-02-01T10:00:00Z", notes: "23 unused ports administratively disabled" },
          { id: "vlan_segmentation", name: "VLAN Segmentation", description: "Proper VLAN separation enforced", compliant: true, lastChecked: "2026-02-01T10:00:00Z", notes: "5 VLANs configured: Corp, Guest, VoIP, Servers, Mgmt" },
          { id: "management_access", name: "Management Access", description: "SSH only, ACL-restricted management", compliant: true, lastChecked: "2026-02-01T10:00:00Z", notes: "Telnet disabled, SSH from management VLAN only" },
          { id: "logging", name: "Logging Enabled", description: "Syslog forwarding to SIEM configured", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "All switches logging to Graylog" }
        ]
      },
      firewall: {
        id: "firewall",
        name: "Firewall",
        description: "Network perimeter security (FortiGate)",
        metrics: [
          { id: "firmware", name: "Firmware Current", description: "Firewall OS updated within 30 days", compliant: true, lastChecked: "2026-02-01T04:00:00Z", notes: "FortiOS 7.4.3 installed Feb 1" },
          { id: "rule_review", name: "Rule Review", description: "Firewall rules audited within 90 days", compliant: true, lastChecked: "2026-01-10T14:00:00Z", notes: "Q1 rule review completed, 12 stale rules removed" },
          { id: "default_deny", name: "Default Deny", description: "Implicit deny-all at end of ruleset", compliant: true, lastChecked: "2026-01-10T14:00:00Z", notes: "Default deny policy in place" },
          { id: "ids_ips", name: "IDS/IPS Active", description: "Intrusion detection/prevention enabled", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "FortiGuard IPS signatures updated daily" },
          { id: "logging", name: "Traffic Logging", description: "Traffic logs forwarded to SIEM", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "Logs streaming to FortiAnalyzer" },
          { id: "ha_config", name: "High Availability", description: "HA/failover configured", compliant: true, lastChecked: "2026-02-01T04:00:00Z", notes: "Active-passive cluster operational" }
        ]
      },
      nas: {
        id: "nas",
        name: "NAS Storage",
        description: "Network attached storage systems",
        metrics: [
          { id: "backup_verified", name: "Backup Verified", description: "Backup tested/restored within 30 days", compliant: false, lastChecked: "2025-12-15T10:00:00Z", notes: "Last restore test was 53 days ago - OVERDUE" },
          { id: "encryption", name: "Encryption at Rest", description: "Volume encryption enabled", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "AES-256 encryption on all volumes" },
          { id: "access_controls", name: "Access Controls", description: "Share permissions follow least-privilege", compliant: true, lastChecked: "2026-01-20T11:00:00Z", notes: "Permissions audit completed, 8 over-permissioned shares fixed" },
          { id: "firmware", name: "Firmware Current", description: "NAS OS updated within 90 days", compliant: true, lastChecked: "2026-01-25T03:00:00Z", notes: "Synology DSM 7.2.1 installed" },
          { id: "raid_health", name: "RAID Health", description: "All drives healthy, no degraded arrays", compliant: false, lastChecked: "2026-02-06T06:00:00Z", notes: "WARNING: Drive 3 showing SMART errors - replacement ordered" }
        ]
      },
      server: {
        id: "server",
        name: "Servers",
        description: "Physical and virtual server infrastructure",
        metrics: [
          { id: "os_patching", name: "OS Patching", description: "Critical patches applied within 14 days", compliant: true, lastChecked: "2026-02-04T03:00:00Z", notes: "February patches deployed to all 8 servers" },
          { id: "hardening", name: "Hardening Applied", description: "CIS benchmark or equivalent applied", compliant: true, lastChecked: "2026-01-15T09:00:00Z", notes: "CIS Level 1 benchmark applied" },
          { id: "backup", name: "Backup Verified", description: "Backup completed and tested monthly", compliant: true, lastChecked: "2026-02-01T06:00:00Z", notes: "Veeam backup successful, test restore passed" },
          { id: "monitoring", name: "Monitoring Active", description: "CPU/memory/disk alerting configured", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "All servers monitored in Zabbix" },
          { id: "antivirus", name: "Antivirus/EDR", description: "Endpoint protection running", compliant: true, lastChecked: "2026-02-06T06:00:00Z", notes: "Defender for Endpoint active" }
        ]
      },
      vm: {
        id: "vm",
        name: "Virtual Machines",
        description: "Virtualized server workloads",
        metrics: [
          { id: "os_patching", name: "OS Patching", description: "Guest OS patched within 14 days", compliant: true, lastChecked: "2026-02-04T04:00:00Z", notes: "23/23 VMs patched this cycle" },
          { id: "snapshot_age", name: "Snapshot Hygiene", description: "No snapshots older than 7 days", compliant: true, lastChecked: "2026-02-06T06:00:00Z", notes: "No stale snapshots found" },
          { id: "resource_limits", name: "Resource Limits", description: "CPU/RAM reservations configured", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "All production VMs have reservations" },
          { id: "tools_current", name: "VMware Tools", description: "Guest tools/agent updated", compliant: true, lastChecked: "2026-02-04T04:00:00Z", notes: "Tools updated during patch cycle" },
          { id: "backup_included", name: "Backup Included", description: "VM included in backup schedule", compliant: true, lastChecked: "2026-02-06T06:00:00Z", notes: "All VMs in nightly Veeam job" }
        ]
      },
      vpn: {
        id: "vpn",
        name: "VPN",
        description: "Remote access VPN infrastructure",
        metrics: [
          { id: "cert_valid", name: "Certificate Valid", description: "SSL certificate not expired, ≥2048-bit", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "Cert valid until Dec 2026, RSA 4096-bit" },
          { id: "mfa_enabled", name: "MFA Enabled", description: "Multi-factor authentication required", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Duo MFA required for all VPN connections" },
          { id: "encryption", name: "Encryption Standard", description: "TLS 1.2+ or IKEv2, no weak ciphers", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "TLS 1.3 with AES-256-GCM" },
          { id: "split_tunnel", name: "Split Tunnel Policy", description: "Split tunneling disabled or controlled", compliant: false, lastChecked: "2026-02-01T08:00:00Z", notes: "Split tunnel enabled for Teams/Zoom - pending policy review" },
          { id: "session_timeout", name: "Session Timeout", description: "Idle timeout ≤30 minutes", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "20 minute idle timeout configured" }
        ]
      },
      cloud: {
        id: "cloud",
        name: "Cloud Services",
        description: "Public cloud infrastructure (AWS/Azure/GCP)",
        metrics: [
          { id: "mfa_enforced", name: "MFA Enforced", description: "All admin accounts require MFA", compliant: true, lastChecked: "2026-02-05T10:00:00Z", notes: "MFA required via Azure Conditional Access" },
          { id: "encryption_transit", name: "Encryption in Transit", description: "TLS 1.2+ for all connections", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Minimum TLS 1.2 enforced" },
          { id: "encryption_rest", name: "Encryption at Rest", description: "Data encrypted with managed keys", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Azure Storage Service Encryption enabled" },
          { id: "access_review", name: "Access Review", description: "Permissions audited within 90 days", compliant: true, lastChecked: "2026-01-20T14:00:00Z", notes: "Quarterly access review completed" },
          { id: "logging", name: "Logging Enabled", description: "Activity logs forwarded to SIEM", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "Azure Activity Log streaming to Sentinel" }
        ]
      },
      m365: {
        id: "m365",
        name: "Microsoft 365",
        description: "Microsoft 365 cloud productivity suite",
        metrics: [
          { id: "mfa_enforced", name: "MFA Enforced", description: "All users require MFA", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "Security defaults enabled, 100% MFA adoption" },
          { id: "conditional_access", name: "Conditional Access", description: "Location/device policies active", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "5 CA policies active: device compliance, location, risk" },
          { id: "dlp_policies", name: "DLP Policies", description: "Data loss prevention rules enabled", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "PII and financial data DLP policies active" },
          { id: "retention", name: "Retention Policy", description: "Email/Teams retention configured", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "7-year retention for email, 3-year for Teams" },
          { id: "external_sharing", name: "External Sharing", description: "SharePoint/OneDrive sharing restricted", compliant: true, lastChecked: "2026-02-01T09:00:00Z", notes: "External sharing requires approval" }
        ]
      },
      auth: {
        id: "auth",
        name: "Authentication",
        description: "Identity and access management",
        metrics: [
          { id: "password_policy", name: "Password Policy", description: "Min 12 chars, complexity, 90-day max age", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Policy enforced via Azure AD" },
          { id: "mfa_enabled", name: "MFA Enabled", description: "MFA required for all users", compliant: true, lastChecked: "2026-02-06T00:00:00Z", notes: "100% MFA enrollment achieved" },
          { id: "account_lockout", name: "Account Lockout", description: "Lockout after 5 failed attempts", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Smart lockout enabled in Azure AD" },
          { id: "stale_accounts", name: "Stale Accounts", description: "No inactive accounts > 90 days", compliant: true, lastChecked: "2026-02-05T11:00:00Z", notes: "Monthly cleanup script disabled 3 accounts" },
          { id: "privileged_access", name: "Privileged Access", description: "Admin accounts in separate OU/PIM", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "Azure PIM for all admin roles" }
        ]
      },
      secrets: {
        id: "secrets",
        name: "Secrets Management",
        description: "Secrets and credential management (Infisical)",
        metrics: [
          { id: "rotation", name: "Rotation Policy", description: "Secrets rotated within 90 days", compliant: true, lastChecked: "2026-02-01T10:00:00Z", notes: "Auto-rotation enabled for DB credentials" },
          { id: "access_audit", name: "Access Audit", description: "Secret access logged and reviewed", compliant: true, lastChecked: "2026-02-05T14:00:00Z", notes: "Weekly access log review completed" },
          { id: "encryption", name: "Encryption", description: "Secrets encrypted at rest (AES-256)", compliant: true, lastChecked: "2026-02-01T08:00:00Z", notes: "AES-256 encryption with HSM-backed keys" },
          { id: "least_privilege", name: "Least Privilege", description: "Access scoped to specific projects/envs", compliant: true, lastChecked: "2026-02-05T14:00:00Z", notes: "Project-level access controls enforced" },
          { id: "no_hardcoding", name: "No Hardcoded Secrets", description: "No secrets in source code repos", compliant: true, lastChecked: "2026-02-04T22:00:00Z", notes: "GitLeaks scan passed, 0 secrets found" }
        ]
      }
    }
  };
}

export async function readComplianceData(): Promise<ComplianceData> {
  try {
    const raw = await readFile(COMPLIANCE_PATH, "utf-8");
    return JSON.parse(raw) as ComplianceData;
  } catch {
    // File missing - create with defaults
    const data = defaultComplianceData();
    await writeComplianceData(data);
    return data;
  }
}

export async function writeComplianceData(data: ComplianceData): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  data.lastUpdated = new Date().toISOString();
  await writeFile(COMPLIANCE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getComplianceData(): Promise<ComplianceData> {
  return readComplianceData();
}

export async function getComponentCompliance(componentId: string): Promise<ComponentCompliance | null> {
  const data = await readComplianceData();
  return data.components[componentId] || null;
}

export async function getAllComponentStatuses(): Promise<Record<string, ComplianceStatus>> {
  const data = await readComplianceData();
  const statuses: Record<string, ComplianceStatus> = {};
  for (const [id, component] of Object.entries(data.components)) {
    statuses[id] = calculateStatus(component.metrics);
  }
  return statuses;
}
