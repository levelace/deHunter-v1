import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns/promises";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Real Intelligence Logic (Backend) ---

  const intelState = {
    activeNodes: 1204,
    threatLevel: "CRITICAL",
    verifiedFlaws: 1242,
    trackedAPTs: 42,
    activePoCs: 842,
    lastScan: null as string | null,
  };

  // Helper to probe HTTP headers
  const probeHeaders = (url: string): Promise<any> => {
    return new Promise((resolve) => {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const req = https.get(targetUrl, {
        headers: { 'User-Agent': 'TEQiQ-Scanner/4.0 (Real-World Intelligence)' }
      }, (res) => {
        const headers = res.headers;
        const securityChecks = [
          { name: 'Strict-Transport-Security', present: !!headers['strict-transport-security'], value: headers['strict-transport-security'] },
          { name: 'Content-Security-Policy', present: !!headers['content-security-policy'], value: headers['content-security-policy'] },
          { name: 'X-Frame-Options', present: !!headers['x-frame-options'], value: headers['x-frame-options'] },
          { name: 'X-Content-Type-Options', present: !!headers['x-content-type-options'], value: headers['x-content-type-options'] },
          { name: 'X-Powered-By', present: !!headers['x-powered-by'], value: headers['x-powered-by'] },
        ];
        resolve({
          server: headers['server'] || 'Unknown',
          securityChecks,
          statusCode: res.statusCode,
          rawHeaders: headers
        });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ error: "Connection Timeout" });
      });
    });
  };

  // Intelligence Scan Endpoint - NOW WITH REAL PROBING
  app.post("/api/intel/scan", async (req, res) => {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: "Target required" });

    console.log(`[INTEL] Initiating LIVE scan for target: ${target}`);
    
    const findings: any[] = [];
    
    try {
      // 1. Real DNS Resolution
      const addresses = await dns.resolve4(target).catch(() => []);
      if (addresses.length > 0) {
        findings.push({ type: "DNS", value: `A Records: ${addresses.join(', ')}`, risk: "Info", raw: addresses });
      }

      const mxRecords = await dns.resolveMx(target).catch(() => []);
      if (mxRecords.length > 0) {
        findings.push({ type: "Mail", value: `MX Records: ${mxRecords.map(m => m.exchange).join(', ')}`, risk: "Info", raw: mxRecords });
      }

      const txtRecords = await dns.resolveTxt(target).catch(() => []);
      if (txtRecords.length > 0) {
        findings.push({ type: "DNS", value: `TXT Records: ${txtRecords.flat().join(' | ')}`, risk: "Info", raw: txtRecords });
      }

      // 2. Real Header Probing
      const headerData = await probeHeaders(target);
      if (headerData && !headerData.error) {
        findings.push({ type: "Server", value: `Detected: ${headerData.server}`, risk: "Info", raw: headerData.rawHeaders });
        headerData.securityChecks.forEach((check: any) => {
          if (!check.present) {
            findings.push({ type: "Vulnerability", value: `Missing ${check.name} header`, risk: "High" });
          } else {
            findings.push({ type: "Header", value: `${check.name}: ${check.value}`, risk: "Secure" });
          }
        });
      } else if (headerData?.error) {
        findings.push({ type: "Error", value: `Probe Failed: ${headerData.error}`, risk: "Low" });
      }

    } catch (error) {
      console.error("Scan error:", error);
      findings.push({ type: "Error", value: `System Error: ${error.message}`, risk: "Low" });
    }

    const results = {
      target,
      timestamp: new Date().toISOString(),
      findings: findings.length > 0 ? findings : [{ type: "Status", value: "No public records found or target unreachable", risk: "Low" }],
      summary: `Live intelligence gathering complete for ${target}.`
    };

    intelState.lastScan = target;
    res.json(results);
  });

  // Intelligence Analysis Endpoint - Generates strategies based on findings
  app.post("/api/intel/analyze", (req, res) => {
    const { findings, target } = req.body;
    if (!findings) return res.status(400).json({ error: "Findings required" });

    console.log(`[INTEL] Analyzing findings for ${target}`);

    const strategies = [];
    
    // Intelligent logic to map findings to strategies
    const vulnerabilities = findings.filter((f: any) => f.risk === 'Critical' || f.risk === 'High' || f.risk === 'Medium');
    
    if (vulnerabilities.length > 0) {
      vulnerabilities.forEach((v: any) => {
        if (v.value.includes('Missing')) {
          strategies.push({
            name: `Header Exploitation: ${v.value.split(' ')[1]}`,
            vector: "Session Hijacking / XSS / Clickjacking",
            complexity: "Low",
            impact: "Medium"
          });
        }
        if (v.type === 'Intelligence') {
          strategies.push({
            name: "Targeted Phishing / Social Engineering",
            vector: "Credential Harvesting",
            complexity: "High",
            impact: "Critical"
          });
        }
      });
    } else {
      strategies.push({
        name: "Zero-Day Discovery / Fuzzing",
        vector: "Unknown",
        complexity: "Very High",
        impact: "High"
      });
    }

    res.json({
      target,
      strategies,
      recommendation: strategies.length > 0 ? `Focus on ${strategies[0].name}` : "Perform deeper enumeration"
    });
  });

  // Exploit Execution Engine - Simulates active exploitation
  app.post("/api/exploit/execute", (req, res) => {
    const { target, payload, type } = req.body;
    if (!target || !payload) return res.status(400).json({ error: "Target and Payload required" });

    console.log(`[EXPLOIT] Executing ${type} on ${target}...`);

    // Simulate execution steps
    const steps = [
      { msg: `Initializing ${type} module...`, delay: 500 },
      { msg: `Probing ${target} for WAF/IPS signatures...`, delay: 1200 },
      { msg: `Encoding payload: ${Buffer.from(payload).toString('base64').substring(0, 20)}...`, delay: 800 },
      { msg: `Injecting payload into target stream...`, delay: 1500 },
      { msg: `Awaiting callback from ${target}...`, delay: 2000 },
    ];

    // Determine success based on target/type (simulated logic)
    const success = !target.includes('localhost'); 
    const impact = success ? {
      status: "SUCCESS",
      access: type === 'RCE' ? 'ROOT/SYSTEM' : 'DB_ADMIN',
      dataExfiltrated: type === 'SQLi' ? '1.2GB (Users, Hashes, Config)' : 'System Environment Variables',
      sessionID: Math.random().toString(36).substring(7).toUpperCase()
    } : {
      status: "FAILED",
      reason: "Connection reset by peer / WAF Blocked"
    };

    res.json({
      target,
      type,
      steps,
      impact,
      timestamp: new Date().toISOString()
    });
  });

  // CVE Intelligence Endpoint
  app.get("/api/intel/cve/:id", (req, res) => {
    const { id } = req.params;
    // Simulated CVE database logic
    const cveData: Record<string, any> = {
      "CVE-2024-1234": {
        id: "CVE-2024-1234",
        severity: "9.8 CRITICAL",
        description: "Remote Code Execution in Auth-Module-V2 via JWT injection.",
        remediation: "Patch to version 2.1.4 immediately."
      },
      "CVE-2023-5678": {
        id: "CVE-2023-5678",
        severity: "7.5 HIGH",
        description: "SQL Injection in legacy search endpoint.",
        remediation: "Implement parameterized queries."
      }
    };

    const data = cveData[id] || { error: "CVE not found in local intelligence cache" };
    res.json(data);
  });

  // System Status Endpoint
  app.get("/api/intel/status", (req, res) => {
    res.json(intelState);
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TEQiQ] Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer();
