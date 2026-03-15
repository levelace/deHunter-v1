<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# deHunter-v1

Security recon and vulnerability analysis lab UI with a live Express backend.

This app provides:
- Live target recon (DNS + HTTP/HTTPS header probing)
- CVE enrichment through NVD API lookup
- Findings analysis/recommendation workflow
- Approval-gated operation request flow with tracked execution pipeline states

---

## Prerequisites

- Node.js 18+
- npm
- Optional: Gemini API key for AI Intelligence tab

---

## Setup

1. Install dependencies

```bash
npm install
```

2. Create local environment file

```bash
cp .env.example .env.local
```

3. Set your Gemini key in `.env.local`

```env
GEMINI_API_KEY=your_key_here
```

4. Start the app

```bash
npm run dev
```

The app runs at:
- `http://localhost:3000`

---

## Usage

### 1) Intelligence Nexus
- View current runtime intel status (threat level, findings, and scan-derived metrics).
- Dashboard cards are populated from backend scan/status state.

### 2) AI Intelligence tab
- Ask for recon/cve/remediation guidance.
- If `GEMINI_API_KEY` is configured, responses can use grounded search context.

### 3) Target Recon tab (live scan)
1. Enter a target domain/IP/CIDR-like target string.
2. Click **Scan**.
3. Review findings (DNS A/MX/TXT, server/header checks, probe errors).
4. Optionally click **Run Analysis** to generate strategy recommendations from findings.

### 4) Live CVE lookup
- In Target Recon, use **Live CVE Intelligence (NVD)**
- Enter `CVE-YYYY-NNNN` and click **Lookup**
- Data is fetched from NVD via backend `/api/intel/cve/:id`

### 5) Impact Lab
- Shows live evidence summary from scan + analysis state.
- Displays executor status and latest execution response payload (if any).

### 6) PoC Forge (approval-gated)
- Provide:
  - target
  - payload
  - approved-by identity
  - in-scope confirmation checkbox
- Click **Submit Operation** to queue an authorized operation request.
- Important: backend accepts authorized requests into a controlled pipeline and returns operation tracking metadata (`202`).

---

## API Endpoints

- `GET /api/intel/status`
  - Returns current runtime intel state.

- `POST /api/intel/scan`
  - Body: `{ "target": "example.com" }`
  - Runs live DNS/header probing and returns structured findings.

- `POST /api/intel/analyze`
  - Body: `{ "target": "example.com", "findings": [...] }`
  - Returns remediation-focused strategies/recommendation.

- `GET /api/intel/cve/:id`
  - Example: `/api/intel/cve/CVE-2024-21626`
  - Returns NVD-backed CVE details.

- `POST /api/exploit/execute`
  - Body requires: `target`, `payload`, `type`, `approvedBy`, `approvalConfirmed`
  - Returns `202` with queued operation metadata for controlled execution workflows.

---

## Build

```bash
npm run build
```

---

## Notes

- This repository intentionally avoids fake exploit-success telemetry.
- Operations are approval-gated and tracked through controlled pipeline responses with strict authorization/scope controls.
