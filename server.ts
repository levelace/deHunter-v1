import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns/promises";
import https from "https";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Finding {
  type: string;
  value: string;
  risk: "Info" | "Low" | "Medium" | "High" | "Secure";
  raw?: unknown;
}

interface IntelState {
  activeNodes: number;
  threatLevel: "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";
  verifiedFlaws: number;
  trackedAPTs: number;
  activePoCs: number;
  lastScan: string | null;
}

const deriveThreatLevel = (highRiskFindings: number): IntelState["threatLevel"] => {
  if (highRiskFindings >= 8) return "CRITICAL";
  if (highRiskFindings >= 4) return "HIGH";
  if (highRiskFindings >= 1) return "ELEVATED";
  return "LOW";
};

const normalizeTarget = (target: string): string => target.replace(/^https?:\/\//i, "").replace(/\/$/, "");

const probeHeaders = (url: string): Promise<any> => {
  const requestHeaders = { "User-Agent": "TEQiQ-Scanner/4.0 (Live Header Probe)" };

  const runProbe = (targetUrl: string): Promise<any> => {
    return new Promise((resolve) => {
      const client = targetUrl.startsWith("https://") ? https : http;
      const req = client.get(
        targetUrl,
        {
          headers: requestHeaders,
        },
        (res) => {
          const headers = res.headers;
          const securityChecks = [
            { name: "Strict-Transport-Security", present: !!headers["strict-transport-security"], value: headers["strict-transport-security"] },
            { name: "Content-Security-Policy", present: !!headers["content-security-policy"], value: headers["content-security-policy"] },
            { name: "X-Frame-Options", present: !!headers["x-frame-options"], value: headers["x-frame-options"] },
            { name: "X-Content-Type-Options", present: !!headers["x-content-type-options"], value: headers["x-content-type-options"] },
            { name: "X-Powered-By", present: !!headers["x-powered-by"], value: headers["x-powered-by"] },
          ];
          resolve({
            server: headers["server"] || "Unknown",
            securityChecks,
            statusCode: res.statusCode,
            rawHeaders: headers,
            protocol: targetUrl.startsWith("https://") ? "https" : "http",
          });
        }
      );

      req.on("error", (e) => resolve({ error: e.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ error: "Connection Timeout" });
      });
    });
  };

  return new Promise(async (resolve) => {
    const normalized = url.replace(/^https?:\/\//i, "");

    if (url.startsWith("http://") || url.startsWith("https://")) {
      resolve(await runProbe(url));
      return;
    }

    const httpsResult = await runProbe(`https://${normalized}`);
    if (!httpsResult?.error) {
      resolve(httpsResult);
      return;
    }

    const httpResult = await runProbe(`http://${normalized}`);
    resolve(httpResult?.error ? httpsResult : httpResult);
  });
};


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const intelState: IntelState = {
    activeNodes: 0,
    threatLevel: "LOW",
    verifiedFlaws: 0,
    trackedAPTs: 0,
    activePoCs: 0,
    lastScan: null,
  };

  app.post("/api/intel/scan", async (req, res) => {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: "Target required" });

    const normalizedTarget = normalizeTarget(target);
    console.log(`[INTEL] Initiating live scan for target: ${normalizedTarget}`);

    const findings: Finding[] = [];

    try {
      const addresses = await dns.resolve4(normalizedTarget).catch(() => []);
      if (addresses.length > 0) {
        findings.push({ type: "DNS", value: `A Records: ${addresses.join(", ")}`, risk: "Info", raw: addresses });
      }

      const mxRecords = await dns.resolveMx(normalizedTarget).catch(() => []);
      if (mxRecords.length > 0) {
        findings.push({
          type: "Mail",
          value: `MX Records: ${mxRecords.map((m) => m.exchange).join(", ")}`,
          risk: "Info",
          raw: mxRecords,
        });
      }

      const txtRecords = await dns.resolveTxt(normalizedTarget).catch(() => []);
      if (txtRecords.length > 0) {
        findings.push({ type: "DNS", value: `TXT Records: ${txtRecords.flat().join(" | ")}`, risk: "Info", raw: txtRecords });
      }

      intelState.trackedAPTs = txtRecords.length;

      const headerData = await probeHeaders(normalizedTarget);
      if (headerData && !headerData.error) {
        findings.push({ type: "Server", value: `Detected (${headerData.protocol?.toUpperCase() || "UNKNOWN"}): ${headerData.server}`, risk: "Info", raw: headerData.rawHeaders });
        const checks = Array.isArray(headerData.securityChecks) ? headerData.securityChecks : [];
        checks.forEach((check: any) => {
          if (!check.present) {
            findings.push({ type: "Vulnerability", value: `Missing ${check.name} header`, risk: "High" });
          } else {
            findings.push({ type: "Header", value: `${check.name}: ${check.value}`, risk: "Secure" });
          }
        });
      } else if (headerData?.error) {
        findings.push({ type: "Error", value: `Probe Failed: ${headerData.error}`, risk: "Low" });
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      findings.push({ type: "Error", value: `System Error: ${error.message}`, risk: "Low" });
    }

    const highRiskCount = findings.filter((f) => f.risk === "High" || f.risk === "Medium").length;
    intelState.lastScan = normalizedTarget;
    intelState.verifiedFlaws = highRiskCount;
    intelState.activePoCs = highRiskCount;
    intelState.activeNodes = findings.length;
    intelState.threatLevel = deriveThreatLevel(highRiskCount);

    res.json({
      target: normalizedTarget,
      timestamp: new Date().toISOString(),
      findings: findings.length > 0 ? findings : [{ type: "Status", value: "No public records found or target unreachable", risk: "Low" }],
      summary: `Live intelligence gathering complete for ${normalizedTarget}.`,
    });
  });

  app.post("/api/intel/analyze", (req, res) => {
    const { findings, target } = req.body;
    if (!findings) return res.status(400).json({ error: "Findings required" });

    const vulnerabilities = findings.filter((f: Finding) => f.risk === "High" || f.risk === "Medium");
    const strategies = vulnerabilities
      .filter((v: Finding) => v.value.includes("Missing"))
      .map((v: Finding) => ({
        name: `Header hardening for ${v.value.replace("Missing ", "").replace(" header", "")}`,
        vector: "Browser protection and anti-clickjacking",
        complexity: "Low",
        impact: "Medium",
      }));

    res.json({
      target,
      strategies,
      recommendation:
        strategies.length > 0
          ? "Prioritize remediation of missing security headers and re-scan to validate fixes."
          : "No actionable exploit strategy generated from current findings.",
    });
  });

  app.post("/api/exploit/execute", (req, res) => {
    const { target, payload, type, approvedBy, approvalConfirmed } = req.body;
    if (!target || !payload) return res.status(400).json({ error: "Target and Payload required" });
    if (!approvedBy || approvalConfirmed !== true) {
      return res.status(403).json({ error: "Approval confirmation required for exploitation workflow" });
    }

    console.log(`[EXPLOIT] Request blocked: no mock/simulated execution for ${type} on ${target}. Approved by ${approvedBy}.`);

    return res.status(501).json({
      error: "Execution engine disabled: mock/simulated exploit execution removed.",
      details: "Connect a real controlled lab executor service to enable verified runs.",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/intel/cve/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const nvdRes = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(id)}`);
      if (!nvdRes.ok) {
        return res.status(nvdRes.status).json({ error: "Failed to retrieve CVE from NVD." });
      }

      const data = await nvdRes.json();
      const vuln = data?.vulnerabilities?.[0]?.cve;
      if (!vuln) return res.status(404).json({ error: "CVE not found in NVD." });

      const description = vuln.descriptions?.find((d: any) => d.lang === "en")?.value || "No English description provided.";
      const metrics = vuln.metrics?.cvssMetricV31?.[0]?.cvssData || vuln.metrics?.cvssMetricV30?.[0]?.cvssData;

      return res.json({
        id,
        severity: metrics ? `${metrics.baseScore} ${metrics.baseSeverity}` : "Unknown",
        description,
        source: "NVD API",
      });
    } catch (error: any) {
      return res.status(502).json({ error: `CVE lookup failed: ${error.message}` });
    }
  });

  app.get("/api/intel/status", (_req, res) => {
    res.json(intelState);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TEQiQ] Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer();
