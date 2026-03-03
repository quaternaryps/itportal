import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ComplianceData, ComponentCompliance, calculateStatus, ComplianceStatus } from "./compliance-types";

const DATA_DIR = path.join(process.cwd(), "data");
const COMPLIANCE_PATH = path.join(DATA_DIR, "compliance.json");

// Default compliance data - used to seed the JSON file on first run
function defaultComplianceData(): ComplianceData {
  const now = new Date().toISOString();
  return {
    lastUpdated: now,
    components: {
      laptop: {
        id: "laptop",
        name: "Laptops",
        description: "Windows 11 Pro laptop devices",
        metrics: [
          { id: "static_ip", name: "Static IP Address Config", description: "Query all laptops for NIC configuration - IP, subnet, gateway, DNS, and Static vs DHCP", compliant: true, lastChecked: now, notes: "All laptops in GRP-DEV-Laptops-All queried via Ansible/WinRM" },
          { id: "local_admin", name: "Local Admin Elevation", description: "Temp admin elevation for 30 minutes with auto-removal via Intune remediation", compliant: true, lastChecked: now, notes: "Intune remediation script with scheduled task expiration" },
          { id: "defender_av", name: "Defender Antivirus Status", description: "MS Defender real-time protection and definition status on all laptops", compliant: true, lastChecked: now, notes: "Real-time protection active, definitions current" },
          { id: "win_firewall", name: "Windows Firewall Status", description: "Firewall status for Domain/Private/Public profiles on all laptops", compliant: true, lastChecked: now, notes: "All three profiles enabled via Intune endpoint security" },
          { id: "hardware_inv", name: "Hardware Inventory", description: "CPU, memory, hard drive size and utilization for all laptops", compliant: true, lastChecked: now, notes: "Intune hardware inventory with extended remediation data" },
          { id: "security_update", name: "Windows Security Update", description: "Latest Windows security update installed within policy window", compliant: true, lastChecked: now, notes: "Intune WUfB managing security update deployment" },
          { id: "bitlocker", name: "BitLocker Encryption Status", description: "BitLocker encryption on OS drive with recovery key in Entra ID", compliant: true, lastChecked: now, notes: "XTS-AES 256 encryption, keys escrowed to Entra ID" },
          { id: "domain_join", name: "Domain / Entra Join Status", description: "Verify Hybrid AD Joined or Entra Joined for Conditional Access", compliant: true, lastChecked: now, notes: "All devices Hybrid Azure AD Joined and compliant in Entra ID" },
          { id: "intune_compliance", name: "Intune Compliance State", description: "Roll-up compliance state gating M365 access via Conditional Access", compliant: true, lastChecked: now, notes: "Master compliance metric - all policies passing" },
          { id: "vpn_client", name: "VPN Client Configuration", description: "FortiClient VPN configuration and connection status for remote access", compliant: true, lastChecked: now, notes: "FortiClient VPN profile deployed, split-tunnel policy applied" }
        ]
      },
      pc: {
        id: "pc",
        name: "Workstations",
        description: "Windows 11 Pro desktop workstations",
        metrics: [
          { id: "static_ip", name: "Static IP Address Config", description: "Query all desktops for NIC configuration - IP, subnet, gateway, DNS, and Static vs DHCP", compliant: true, lastChecked: now, notes: "All desktops in GRP-DEV-Desktops-All queried via Ansible/WinRM" },
          { id: "local_admin", name: "Local Admin Elevation", description: "Temp admin elevation for 30 minutes with auto-removal via Intune remediation", compliant: true, lastChecked: now, notes: "Intune remediation script with scheduled task expiration" },
          { id: "defender_av", name: "Defender Antivirus Status", description: "MS Defender real-time protection and definition status on all desktops", compliant: true, lastChecked: now, notes: "Real-time protection active, definitions current" },
          { id: "win_firewall", name: "Windows Firewall Status", description: "Firewall status for Domain/Private/Public profiles on all desktops", compliant: true, lastChecked: now, notes: "All three profiles enabled via Intune endpoint security" },
          { id: "hardware_inv", name: "Hardware Inventory", description: "CPU, memory, hard drive size and utilization for all desktops", compliant: true, lastChecked: now, notes: "Intune hardware inventory with extended remediation data" },
          { id: "security_update", name: "Windows Security Update", description: "Latest Windows security update installed within policy window", compliant: true, lastChecked: now, notes: "Intune WUfB managing security update deployment" },
          { id: "bitlocker", name: "BitLocker Encryption Status", description: "BitLocker encryption on OS drive with recovery key in Entra ID", compliant: true, lastChecked: now, notes: "XTS-AES 256 encryption, keys escrowed to Entra ID" },
          { id: "domain_join", name: "Domain / Entra Join Status", description: "Verify Hybrid AD Joined or Entra Joined for Conditional Access", compliant: true, lastChecked: now, notes: "All devices Hybrid Azure AD Joined and compliant in Entra ID" },
          { id: "intune_compliance", name: "Intune Compliance State", description: "Roll-up compliance state gating M365 access via Conditional Access", compliant: true, lastChecked: now, notes: "Master compliance metric - all policies passing" }
        ]
      },
      apps: {
        id: "apps",
        name: "Applications",
        description: "Business applications and software compliance",
        metrics: [
          { id: "m365_apps", name: "M365 Apps Installation", description: "M365 Apps install status and version per device against Current Channel baseline", compliant: true, lastChecked: now, notes: "Word, Excel, PowerPoint, Teams, OneDrive deployed via Intune" },
          { id: "outlook_config", name: "Outlook Configuration", description: "Outlook profile config and Exchange Online connectivity", compliant: true, lastChecked: now, notes: "Intune config profile managing Outlook settings" },
          { id: "civil3d", name: "AutoDesk Civil 3D", description: "Civil 3D version, license activation, and update status on engineering workstations", compliant: true, lastChecked: now, notes: "Ansible via WinRM - version matches firm-approved release" },
          { id: "version_compliance", name: "Software Version Compliance", description: "Compare installed app versions against approved baseline across all devices", compliant: true, lastChecked: now, notes: "Intune discovered apps inventory checked against baseline" },
          { id: "unauthorized_sw", name: "Unauthorized Software Detection", description: "Detect installed software not on approved whitelist - shadow IT detection", compliant: true, lastChecked: now, notes: "Weekly whitelist audit - no unauthorized software detected" },
          { id: "m365_activation", name: "M365 License Activation", description: "M365 license activation state per device - detect deactivated or unlicensed", compliant: true, lastChecked: now, notes: "All devices activated with correct tenant" },
          { id: "browser_compliance", name: "Browser Version Compliance", description: "Edge/Chrome version and auto-update policy compliance", compliant: true, lastChecked: now, notes: "Microsoft Edge managed via Intune update rings" }
        ]
      },
      wifi: {
        id: "wifi",
        name: "WiFi",
        description: "FortiAP wireless network infrastructure",
        metrics: [
          { id: "ap_status", name: "AP Online / Connectivity Status", description: "Status of all managed FortiAP access points - online, uptime, connection state", compliant: true, lastChecked: now, notes: "All FortiAPs online and managed by FortiGate wireless controller" },
          { id: "ssid_config", name: "SSID Configuration Compliance", description: "Verify SSID settings match security baseline - WPA2/WPA3-Enterprise with RADIUS", compliant: true, lastChecked: now, notes: "Corporate SSID using WPA2-Enterprise/802.1X, Guest on captive portal" },
          { id: "client_count", name: "Connected Client Count", description: "Per-AP and per-SSID connected client count with signal strength and band info", compliant: true, lastChecked: now, notes: "Client distribution balanced across APs" },
          { id: "channel_util", name: "Channel Utilization / Interference", description: "Channel utilization, noise floor, and interference metrics per radio", compliant: true, lastChecked: now, notes: "Auto-channel and auto-power enabled, utilization within limits" },
          { id: "ap_firmware", name: "AP Firmware Version", description: "FortiAP firmware version compatibility with FortiGate controller", compliant: true, lastChecked: now, notes: "All APs running compatible firmware with FortiOS" },
          { id: "radius_auth", name: "802.1X / RADIUS Auth Status", description: "RADIUS authentication active for enterprise SSID via both NPS VMs", compliant: true, lastChecked: now, notes: "Both NPS RADIUS servers responding, auth success rate normal" },
          { id: "rogue_ap", name: "Rogue AP Detection", description: "Detected rogue or unmanaged access points via wireless IDS", compliant: true, lastChecked: now, notes: "No rogue APs detected, approved AP whitelist maintained" },
          { id: "vlan_assignment", name: "VLAN Assignment Compliance", description: "Verify SSID-to-VLAN mapping matches network design - corporate and guest segregation", compliant: true, lastChecked: now, notes: "Corporate SSID on Employee VLAN, Guest SSID on Guest VLAN with internet-only" }
        ]
      },
      switch: {
        id: "switch",
        name: "LAN Switch",
        description: "FortiSwitch managed network switching infrastructure",
        metrics: [
          { id: "port_util", name: "Switch Port Utilization", description: "Port up/down status, speed, VLAN assignment, and connected device MAC", compliant: true, lastChecked: now, notes: "Port utilization within acceptable range, VLANs correctly assigned" },
          { id: "vlan_config", name: "VLAN Configuration Compliance", description: "Verify VLAN IDs, names, and trunk configurations match network design", compliant: true, lastChecked: now, notes: "All VLANs consistent across switches, trunks carry authorized VLANs only" },
          { id: "stp_status", name: "Spanning Tree Status", description: "STP root bridge, port roles, and topology change monitoring", compliant: true, lastChecked: now, notes: "Correct root bridge elected, BPDU guard on edge ports" },
          { id: "port_security", name: "Port Security / 802.1X", description: "802.1X authentication state and MAC limiting on access ports", compliant: true, lastChecked: now, notes: "802.1X enabled on user-facing ports with NPS RADIUS" },
          { id: "sw_firmware", name: "Switch Firmware Version", description: "FortiSwitch firmware compatibility with FortiGate FortiLink", compliant: true, lastChecked: now, notes: "All switches running compatible firmware" },
          { id: "poe_budget", name: "PoE Power Budget", description: "PoE total budget, allocated, and available watts per switch", compliant: true, lastChecked: now, notes: "PoE budget within limits, critical devices have priority" },
          { id: "uplink_lag", name: "Uplink / LAG Status", description: "Uplink and LAG member link status and throughput", compliant: true, lastChecked: now, notes: "All uplinks active, LACP operational" },
          { id: "error_rate", name: "Network Error Rate", description: "CRC errors, collisions, and drops per port", compliant: true, lastChecked: now, notes: "Error rates within acceptable thresholds" }
        ]
      },
      firewall: {
        id: "firewall",
        name: "Firewall",
        description: "FortiGate 60F network perimeter security",
        metrics: [
          { id: "firmware", name: "Firmware Version Compliance", description: "FortiOS version checked against approved baseline and known CVEs", compliant: true, lastChecked: now, notes: "Running recommended FortiOS release" },
          { id: "ha_status", name: "HA Failover Status", description: "HA cluster sync status, failover role, and configuration synchronization", compliant: true, lastChecked: now, notes: "HA pair operational, config synchronized" },
          { id: "vpn_tunnel", name: "VPN Tunnel Status", description: "Status of all IPSec and SSL VPN tunnels - up/down, bytes, flapping", compliant: true, lastChecked: now, notes: "All expected tunnels up, SSL VPN within license limits" },
          { id: "ips_signatures", name: "IPS/IDS Signature Update", description: "IPS signature database version and last update time", compliant: true, lastChecked: now, notes: "FortiGuard IPS signatures current, profiles applied to all policies" },
          { id: "policy_audit", name: "Policy Rule Audit", description: "Firewall policies audited for unused, overly broad, or missing UTM profiles", compliant: true, lastChecked: now, notes: "Policy review completed, no any-any rules, unused rules cleaned" },
          { id: "performance", name: "CPU / Memory / Session Count", description: "FortiGate CPU %, memory %, and active session count vs model limits", compliant: true, lastChecked: now, notes: "Performance within acceptable thresholds for FG-60F" },
          { id: "ssl_certs", name: "SSL Certificate Expiration", description: "SSL cert expiration for management and VPN portals", compliant: true, lastChecked: now, notes: "All certificates valid, no expirations within 30 days" },
          { id: "log_forwarding", name: "Log Forwarding Status", description: "Verify log forwarding to syslog/FortiAnalyzer is active", compliant: true, lastChecked: now, notes: "Logs forwarding to FortiAnalyzer, all UTM categories enabled" },
          { id: "fortiguard_license", name: "FortiGuard License Status", description: "FortiGuard subscription expiration dates for IPS, AV, Web Filter, FortiCare", compliant: true, lastChecked: now, notes: "All subscriptions active, no expirations within 60 days" }
        ]
      },
      nas: {
        id: "nas",
        name: "NAS Storage",
        description: "Synology NAS storage appliance",
        metrics: [
          { id: "capacity", name: "Total Capacity Utilization", description: "Total, used, and available storage across all volumes and shared folders", compliant: true, lastChecked: now, notes: "Storage utilization within acceptable limits" },
          { id: "raid_health", name: "RAID / Disk Health Status", description: "RAID array status and individual disk SMART health attributes", compliant: true, lastChecked: now, notes: "RAID Normal, all disk SMART attributes healthy" },
          { id: "backup_jobs", name: "Backup Job Status", description: "Hyper Backup and snapshot replication job status and last success", compliant: true, lastChecked: now, notes: "All backup jobs completing successfully" },
          { id: "performance", name: "Storage Performance (IOPS/Latency)", description: "Read/write IOPS and latency metrics per volume", compliant: true, lastChecked: now, notes: "Latency within acceptable range for Civil 3D file access" },
          { id: "share_perms", name: "Share Permission Audit", description: "SMB share permissions and ACLs verified against role-based access matrix", compliant: true, lastChecked: now, notes: "Permissions follow least-privilege, no Everyone access" },
          { id: "dsm_firmware", name: "NAS Firmware / DSM Version", description: "Synology DSM version and available security updates", compliant: true, lastChecked: now, notes: "Running current DSM version, no critical updates pending" },
          { id: "fs_integrity", name: "File System Integrity", description: "Btrfs scrub results and data integrity verification", compliant: true, lastChecked: now, notes: "Last scrub completed with zero errors" }
        ]
      },
      server: {
        id: "server",
        name: "Windows Server",
        description: "Physical Windows Server domain controllers (DC01, DC02)",
        metrics: [
          { id: "os_update", name: "OS Security Update Status", description: "Last installed KB and pending security updates by severity", compliant: true, lastChecked: now, notes: "Critical patches applied within policy window" },
          { id: "uptime_reboot", name: "Server Uptime / Reboot Pending", description: "System uptime and pending reboot flag from registry keys", compliant: true, lastChecked: now, notes: "No pending reboots, uptime within acceptable range" },
          { id: "disk_space", name: "Disk Space Utilization", description: "All drive capacity, used, and free space with trend tracking", compliant: true, lastChecked: now, notes: "All volumes below 80% utilization" },
          { id: "cpu_memory", name: "CPU / Memory Utilization", description: "Avg CPU % and memory utilization over 15-minute sample with top processes", compliant: true, lastChecked: now, notes: "Performance within normal baseline" },
          { id: "defender", name: "Windows Defender Status", description: "Defender real-time protection, definition age, and threat detection", compliant: true, lastChecked: now, notes: "Real-time protection active, definitions current" },
          { id: "event_logs", name: "Event Log Critical Errors", description: "System and Application event log errors in last 24 hours", compliant: true, lastChecked: now, notes: "No critical events detected, error count within baseline" },
          { id: "ad_replication", name: "AD Replication Status", description: "AD replication health between domain controllers for all naming contexts", compliant: true, lastChecked: now, notes: "Replication successful across all partitions between DC01 and DC02" },
          { id: "backup", name: "Backup Status", description: "Last successful backup timestamp and job result", compliant: true, lastChecked: now, notes: "Backup completing successfully within schedule" },
          { id: "win_firewall", name: "Windows Firewall Status", description: "Windows Firewall profile status and inbound rule audit against DC baseline", compliant: true, lastChecked: now, notes: "Domain profile active, rules match DC role baseline" },
          { id: "ssl_certs", name: "SSL/TLS Certificate Expiration", description: "Expiration dates for all server certificates including LDAPS and DC auth", compliant: true, lastChecked: now, notes: "All certificates valid, renewal calendar maintained" }
        ]
      },
      vm: {
        id: "vm",
        name: "Virtual Machines",
        description: "All VMs (~10): Ubuntu Linux and Windows NPS/RADIUS servers",
        metrics: [
          { id: "power_state", name: "VM Power State / Availability", description: "Power state and uptime for all VMs against expected-state registry", compliant: true, lastChecked: now, notes: "All expected-running VMs online and reachable" },
          { id: "os_update", name: "OS Update Status", description: "Pending apt updates (Linux) and KB updates (Windows NPS)", compliant: true, lastChecked: now, notes: "Security updates applied within policy window" },
          { id: "disk_space", name: "Disk Space Utilization", description: "Filesystem utilization for all mounted volumes on Linux and Windows VMs", compliant: true, lastChecked: now, notes: "All filesystems below 80% utilization" },
          { id: "cpu_memory", name: "CPU / Memory Utilization", description: "Avg CPU % and memory utilization per VM for right-sizing", compliant: true, lastChecked: now, notes: "All VMs within performance thresholds" },
          { id: "snapshot_age", name: "VM Snapshot Age", description: "List of VM snapshots and age - flag snapshots older than 3-7 days", compliant: true, lastChecked: now, notes: "No stale snapshots found" },
          { id: "backup", name: "VM Backup Status", description: "Last VM backup timestamp and success/fail per VM", compliant: true, lastChecked: now, notes: "All VM backups completing successfully" },
          { id: "service_health", name: "Service Health Check", description: "Role-specific services running - RADIUS, DNS, Docker, etc.", compliant: true, lastChecked: now, notes: "All critical services running on their respective VMs" },
          { id: "remote_access", name: "SSH / RDP Access Security", description: "SSH key auth (Linux) and NLA (Windows NPS) security verification", compliant: true, lastChecked: now, notes: "SSH password auth disabled, root login blocked; NLA enabled on Windows" },
          { id: "host_firewall", name: "Host Firewall Rules", description: "Active firewall rules verified against role-based baseline", compliant: true, lastChecked: now, notes: "UFW/iptables (Linux) and Windows Firewall rules match baselines" },
          { id: "ntp_sync", name: "NTP Time Sync Status", description: "Time sync offset and NTP source - critical for Kerberos and RADIUS auth", compliant: true, lastChecked: now, notes: "All VMs synced, offset within acceptable range" }
        ]
      },
      useraccounts: {
        id: "useraccounts",
        name: "User Accounts",
        description: "User account lifecycle and identity management (~30 users)",
        metrics: [
          { id: "provision", name: "Provision New Account", description: "Automated user provisioning across AD, Entra ID, and M365 with role-based templates", compliant: true, lastChecked: now, notes: "Ansible playbook orchestrating multi-system provisioning" },
          { id: "password_reset", name: "Reset Password", description: "Password reset via Entra SSPR or admin-initiated via MS Graph API", compliant: true, lastChecked: now, notes: "Entra SSPR configured as primary, Ansible fallback available" },
          { id: "password_age", name: "Password Age Policy", description: "Password last changed date checked against 90-day policy for all users", compliant: true, lastChecked: now, notes: "All accounts within password age policy" },
          { id: "mfa_enrollment", name: "MFA Enrollment & Enforcement", description: "MFA registration and enforcement status via Conditional Access for all users", compliant: true, lastChecked: now, notes: "100% MFA enrollment, Conditional Access enforcing" },
          { id: "account_lockout", name: "Account Lockout Status", description: "Locked accounts with source identification and brute-force detection", compliant: true, lastChecked: now, notes: "No mass lockout events, normal lockout rate" },
          { id: "inactive_accounts", name: "Inactive Account Detection", description: "Accounts with no sign-in > 30 days flagged for review or disable", compliant: true, lastChecked: now, notes: "Monthly inactive account review completed" },
          { id: "license_assignment", name: "M365 License Assignment", description: "M365 license utilization, waste detection, and optimization", compliant: true, lastChecked: now, notes: "License assignments aligned with active users" },
          { id: "group_audit", name: "Security Group Membership Audit", description: "Validate users in correct security groups per role-based template", compliant: true, lastChecked: now, notes: "Role-based group memberships verified" }
        ]
      },
      networkservices: {
        id: "networkservices",
        name: "Network Services",
        description: "DNS, DHCP, Authentication/RADIUS, and NTP infrastructure services",
        metrics: [
          { id: "dns_resolution", name: "DNS Resolution Health", description: "Test internal and external DNS resolution from all DNS servers including SRV records", compliant: true, lastChecked: now, notes: "All DNS servers resolving internal and external queries" },
          { id: "dns_zone_repl", name: "DNS Zone Replication", description: "AD-integrated DNS zone replication between DCs - SOA serial comparison", compliant: true, lastChecked: now, notes: "Zone replication healthy, SOA serials match" },
          { id: "dns_forwarders", name: "DNS Forwarder Status", description: "Connectivity and latency test to configured external DNS forwarders", compliant: true, lastChecked: now, notes: "External forwarders responding within acceptable latency" },
          { id: "dns_stale", name: "Stale DNS Record Cleanup", description: "DNS records with no matching AD computer object or DHCP lease", compliant: true, lastChecked: now, notes: "DNS scavenging configured, stale records within threshold" },
          { id: "dhcp_scope", name: "DHCP Scope Utilization", description: "Address pool utilization per scope with exhaustion risk tracking", compliant: true, lastChecked: now, notes: "All scopes below 80% utilization" },
          { id: "dhcp_availability", name: "DHCP Server Availability", description: "DHCP service running and responding to discover packets", compliant: true, lastChecked: now, notes: "DHCP service active and responding on all VLANs" },
          { id: "dhcp_lease_audit", name: "DHCP Lease Audit", description: "Active leases cross-referenced against known device inventory for rogue detection", compliant: true, lastChecked: now, notes: "No unknown MAC addresses on sensitive VLANs" },
          { id: "dhcp_failover", name: "DHCP Failover Status", description: "DHCP failover relationship state and scope synchronization", compliant: true, lastChecked: now, notes: "Failover relationship healthy, scopes synchronized" },
          { id: "dc_health", name: "AD Domain Controller Health", description: "DCDiag results for all tests - Replications, NetLogons, Services, FSMO roles", compliant: true, lastChecked: now, notes: "All DCDiag tests passing on both DCs" },
          { id: "radius_status", name: "RADIUS Service Status (NPS)", description: "NPS RADIUS authentication test on primary and secondary VMs", compliant: true, lastChecked: now, notes: "Both NPS VMs responding to RADIUS auth requests" },
          { id: "radius_redundancy", name: "RADIUS Redundancy Check", description: "Verify both RADIUS servers actively processing requests with balanced load", compliant: true, lastChecked: now, notes: "Both servers processing requests, load balanced" },
          { id: "entra_sync", name: "Entra ID Connect / Cloud Sync", description: "Entra Cloud Sync status, last sync time, and object/error count", compliant: true, lastChecked: now, notes: "Sync running on schedule, no export errors" },
          { id: "password_sync", name: "AD / Entra Password Sync", description: "Password hash sync between on-prem AD and Entra ID verification", compliant: true, lastChecked: now, notes: "Password sync operational, writeback enabled" },
          { id: "kerberos_health", name: "Kerberos / NTLM Auth Health", description: "Kerberos TGT issuance and service ticket validation on both DCs", compliant: true, lastChecked: now, notes: "Kerberos authentication healthy, no NTLM fallback detected" },
          { id: "ca_health", name: "Certificate Authority Health", description: "CA service status, CRL publication, and root cert expiration", compliant: true, lastChecked: now, notes: "CA service running, CRL current, root cert valid" },
          { id: "ntp_source", name: "NTP Time Source Status", description: "PDC emulator syncs to external NTP; all clients in sync hierarchy", compliant: true, lastChecked: now, notes: "NTP hierarchy healthy, all systems within acceptable offset" }
        ]
      },
      appservices: {
        id: "appservices",
        name: "Application Services",
        description: "VPN, Cloud, Microsoft 365, and Secrets management services",
        metrics: [
          { id: "vpn_cert", name: "VPN Certificate Valid", description: "SSL certificate not expired, ≥2048-bit", compliant: true, lastChecked: now, notes: "Cert valid, RSA 4096-bit" },
          { id: "vpn_mfa", name: "VPN MFA Enabled", description: "Multi-factor authentication required for all VPN connections", compliant: true, lastChecked: now, notes: "MFA required for all VPN connections" },
          { id: "vpn_encryption", name: "VPN Encryption Standard", description: "TLS 1.2+ or IKEv2, no weak ciphers", compliant: true, lastChecked: now, notes: "TLS 1.3 with AES-256-GCM" },
          { id: "vpn_split_tunnel", name: "VPN Split Tunnel Policy", description: "Split tunneling disabled or controlled", compliant: true, lastChecked: now, notes: "Split tunnel policy reviewed and approved" },
          { id: "vpn_session_timeout", name: "VPN Session Timeout", description: "Idle timeout ≤30 minutes", compliant: true, lastChecked: now, notes: "20 minute idle timeout configured" },
          { id: "cloud_mfa", name: "Cloud MFA Enforced", description: "All cloud admin accounts require MFA", compliant: true, lastChecked: now, notes: "MFA required via Azure Conditional Access" },
          { id: "cloud_encryption_transit", name: "Cloud Encryption in Transit", description: "TLS 1.2+ for all cloud connections", compliant: true, lastChecked: now, notes: "Minimum TLS 1.2 enforced" },
          { id: "cloud_encryption_rest", name: "Cloud Encryption at Rest", description: "Cloud data encrypted with managed keys", compliant: true, lastChecked: now, notes: "Azure Storage Service Encryption enabled" },
          { id: "cloud_access_review", name: "Cloud Access Review", description: "Cloud permissions audited within 90 days", compliant: true, lastChecked: now, notes: "Quarterly access review completed" },
          { id: "cloud_logging", name: "Cloud Logging Enabled", description: "Cloud activity logs forwarded to SIEM", compliant: true, lastChecked: now, notes: "Azure Activity Log streaming to Sentinel" },
          { id: "m365_mfa", name: "M365 MFA Enforced", description: "All M365 users require MFA", compliant: true, lastChecked: now, notes: "Security defaults enabled, 100% MFA adoption" },
          { id: "m365_conditional_access", name: "M365 Conditional Access", description: "Location/device conditional access policies active", compliant: true, lastChecked: now, notes: "5 CA policies active: device compliance, location, risk" },
          { id: "m365_dlp", name: "M365 DLP Policies", description: "Data loss prevention rules enabled for PII and financial data", compliant: true, lastChecked: now, notes: "PII and financial data DLP policies active" },
          { id: "m365_retention", name: "M365 Retention Policy", description: "Email/Teams retention configured per compliance requirements", compliant: true, lastChecked: now, notes: "7-year retention for email, 3-year for Teams" },
          { id: "m365_external_sharing", name: "M365 External Sharing", description: "SharePoint/OneDrive external sharing restricted", compliant: true, lastChecked: now, notes: "External sharing requires approval" },
          { id: "secrets_rotation", name: "Secrets Rotation Policy", description: "Secrets rotated within 90 days", compliant: true, lastChecked: now, notes: "Auto-rotation enabled for DB credentials" },
          { id: "secrets_access_audit", name: "Secrets Access Audit", description: "Secret access logged and reviewed", compliant: true, lastChecked: now, notes: "Weekly access log review completed" },
          { id: "secrets_encryption", name: "Secrets Encryption", description: "Secrets encrypted at rest (AES-256)", compliant: true, lastChecked: now, notes: "AES-256 encryption with HSM-backed keys" },
          { id: "secrets_least_privilege", name: "Secrets Least Privilege", description: "Access scoped to specific projects/environments", compliant: true, lastChecked: now, notes: "Project-level access controls enforced" },
          { id: "secrets_no_hardcoding", name: "No Hardcoded Secrets", description: "No secrets detected in source code repos", compliant: true, lastChecked: now, notes: "GitLeaks scan passed, 0 secrets found" }
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
