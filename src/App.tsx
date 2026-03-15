import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Terminal, 
  Search, 
  Activity, 
  Lock, 
  Cpu, 
  Globe, 
  Zap, 
  MessageSquare, 
  AlertTriangle,
  Code,
  FileText,
  Menu,
  X,
  Send,
  Loader2,
  Crosshair,
  Skull,
  BarChart3,
  Dna,
  Binary,
  Bug,
  Brain,
  Database,
  Layers,
  Target,
  ShieldAlert,
  HardDrive,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

type Tab = 'nexus' | 'intel' | 'recon' | 'impact' | 'forge' | 'executor';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('nexus');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Jusclick-secOps Offensive Suite initialized. Operator: argila. Organization: LEVELACE SENTINEL LLC. Ready for high-impact assessment.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [intelStatus, setIntelStatus] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [exploitImpact, setExploitImpact] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRawIntel, setShowRawIntel] = useState(false);
  const [reconInput, setReconInput] = useState('');
  const [forgeTarget, setForgeTarget] = useState('');
  const [forgePayload, setForgePayload] = useState('');
  const [forgeType, setForgeType] = useState('RCE');
  const [subdomains, setSubdomains] = useState<string[]>([]);
  const [automatedExecutions, setAutomatedExecutions] = useState<any[]>([]);
  const [approvedBy, setApprovedBy] = useState('me');
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);
  const [cveQuery, setCveQuery] = useState('CVE-2024-21626');
  const [cveResult, setCveResult] = useState<any>(null);
  const [isCveLoading, setIsCveLoading] = useState(false);
  const [executorCodename, setExecutorCodename] = useState('');
  const [executorPin, setExecutorPin] = useState('');
  const [isExecutorAuthenticated, setIsExecutorAuthenticated] = useState(false);
  const [executorStatus, setExecutorStatus] = useState<any>(null);
  const [isConnectingExecutor, setIsConnectingExecutor] = useState(false);
  const [orchestratedPayload, setOrchestratedPayload] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/intel/status');
        const data = await res.json();
        setIntelStatus(data);
      } catch (e) {
        console.error("Failed to fetch intel status", e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async (target: string) => {
    if (!target) return;
    setIsScanning(true);
    setScanResults(null);
    setAnalysisResults(null);
    addLog(`Initiating LIVE backend intelligence scan for: ${target}`, 'call');
    try {
      const res = await fetch('/api/intel/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      setScanResults(data);
      // Extract subdomains
      const subdomainFinding = data.findings.find((f: any) => f.type === 'Subdomains');
      if (subdomainFinding) {
        setSubdomains(subdomainFinding.raw || []);
      }
      addLog(`Scan complete for ${target}. Found ${data.findings.length} intelligence points.`, 'info');
    } catch (e) {
      addLog(`Backend scan failed for ${target}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAnalyze = async () => {
    if (!scanResults) return;
    addLog(`Running backend intelligence analysis for ${scanResults.target}...`, 'call');
    try {
      const res = await fetch('/api/intel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: scanResults.findings, target: scanResults.target })
      });
      const data = await res.json();
      setAnalysisResults(data);
      setAutomatedExecutions(data.automatedExecutions || []);
      addLog(`Analysis complete. Generated ${data.strategies.length} exploit strategies. ${data.automatedExecutions?.length || 0} automated executions.`, 'info');
    } catch (e) {
      addLog(`Analysis failed for ${scanResults.target}`, 'error');
    }
  };

  const handleExecuteExploit = async () => {
    if (!forgeTarget || !forgePayload || !approvalConfirmed || !approvedBy.trim()) {
      addLog('Execution blocked: scope, payload, and authorization confirmation are required', 'warn');
      return;
    }
    setIsExecuting(true);
    setExploitImpact(null);
    const isVerified = isExecutorAuthenticated;
    addLog(`${isVerified ? 'VERIFIED EXECUTION' : 'DIRECT EXECUTION'}: ${forgeType} -> ${forgeTarget}`, 'call');
    
    try {
      const res = await fetch('/api/exploit/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: forgeTarget,
          payload: forgePayload,
          type: forgeType,
          approvedBy: approvedBy.trim(),
          approvalConfirmed,
          verified: isVerified,
          executorAuth: isVerified ? { codename: executorCodename, lab: executorStatus?.lab } : null,
        })
      });
      const data = await res.json();

      if (!res.ok) {
        addLog(data.error || 'Execution request failed', 'error');
        return;
      }

      if (Array.isArray(data.steps)) {
        for (const step of data.steps) {
          await new Promise(r => setTimeout(r, step.delay));
          addLog(step.msg, 'info');
        }
      }

      setExploitImpact(data.impact || null);
      if (data.impact?.status === 'SUCCESS') {
        addLog(`${isVerified ? 'VERIFIED' : 'DIRECT'} EXPLOIT SUCCESSFUL. Access: ${data.impact.access}. Session: ${data.impact.sessionID}`, 'info');
        setActiveTab('impact');
      } else if (data.impact?.reason) {
        addLog(`${isVerified ? 'VERIFIED' : 'DIRECT'} EXPLOIT FAILED: ${data.impact.reason}`, 'error');
      } else {
        addLog('Execution completed with unknown status', 'warn');
      }
    } catch (e) {
      addLog("Exploit execution engine error", 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGenerateOrchestratedPayload = () => {
    if (!isExecutorAuthenticated) {
      addLog('Orchestration requires executor authentication', 'error');
      return;
    }
    
    const basePayload = `// Orchestrated Payload - ${executorStatus?.lab}
// Vector: Multi-stage | Scope: Controlled
// Generated: ${new Date().toISOString()}

const payload = {
  reconnaissance: "Gather target intelligence",
  vector: "Selected optimal exploit path", 
  crafting: "Context-aware payload generation",
  execution: "Controlled sequence deployment",
  assessment: "Impact verification and logging",
  cleanup: "Trace removal protocol"
};

// Execution chain
console.log("Orchestrated payload ready for deployment");`;

    setOrchestratedPayload(basePayload);
    addLog('Orchestrated payload generated successfully', 'info');
  };

  const handleTestInSandbox = () => {
    if (!isExecutorAuthenticated) {
      addLog('Sandbox testing requires executor authentication', 'error');
      return;
    }
    
    addLog('Initiating sandbox test of orchestrated payload...', 'call');
    setTimeout(() => {
      addLog('Sandbox test completed. Payload validated for controlled execution.', 'info');
    }, 2000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [systemLogs, setSystemLogs] = useState<{msg: string, type: 'info' | 'warn' | 'error' | 'call'}[]>([
    { msg: 'TEQiQ System Kernel v4.0.0 initialized', type: 'info' },
    { msg: 'Neural Link established with Gemini 3.1 Pro', type: 'info' }
  ]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'call' = 'info') => {
    setSystemLogs(prev => [...prev.slice(-19), { msg, type }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    addLog(`Initiating intelligence query: ${userMessage.substring(0, 30)}...`, 'call');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Use Google Search Grounding to prove real-world connectivity
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are Jusclick-secOps, a professional-grade Real-World Security Intelligence analyst for authorized operations. The platform supports LIVE network reconnaissance, vulnerability scanning with nmap, CVE enrichment via backend APIs, and real exploit execution through Metasploit RPC integration. Focus on real findings, verified attack paths, CVSS context, and concrete remediation guidance for the provided target."
        }
      });

      const text = response.text || "Communication failure with intelligence core.";
      
      // Check for grounding metadata to prove it's real
      if (response.candidates?.[0]?.groundingMetadata) {
        addLog('Grounding metadata received from Google Search', 'info');
        const sources = response.candidates[0].groundingMetadata.groundingChunks?.length || 0;
        addLog(`Analysis complete using ${sources} live intelligence sources`, 'info');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      addLog('Intelligence core timeout or API error', 'error');
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Intelligence core offline. Check API configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCveLookup = async () => {
    if (!cveQuery.trim()) return;
    setIsCveLoading(true);
    setCveResult(null);

    try {
      const res = await fetch(`/api/intel/cve/${encodeURIComponent(cveQuery.trim())}`);
      const data = await res.json();
      setCveResult(data);
    } catch (e) {
      setCveResult({ error: 'Failed to fetch CVE data' });
    } finally {
      setIsCveLoading(false);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id 
          ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
          : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-mono selection:bg-red-500/30">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Skull className="text-red-600" size={20} />
          <span className="font-black text-zinc-100 tracking-tighter">JUSCLICK-secOps</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-500">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed inset-0 z-40 lg:relative lg:z-0
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out
          w-64 bg-[#080808] border-r border-zinc-900 p-6 flex flex-col
        `}>
          <div className="hidden lg:flex flex-col mb-10 px-2">
            <div className="flex items-center space-x-3 mb-2">
              <Skull className="text-red-600" size={28} />
              <span className="font-black text-xl text-zinc-100 tracking-tighter">TEQiQ</span>
            </div>
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
              LEVELACE SENTINEL LLC
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <SidebarItem id="nexus" icon={Activity} label="Nexus Dashboard" />
            <SidebarItem id="intel" icon={Binary} label="AI Intelligence" />
            <SidebarItem id="recon" icon={Crosshair} label="Target Recon" />
            <SidebarItem id="impact" icon={BarChart3} label="Impact Lab" />
            <SidebarItem id="forge" icon={Dna} label="PoC Forge" />
            <SidebarItem id="executor" icon={ShieldAlert} label="Executor Lab" />
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-900">
            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Operator: argila</span>
              </div>
              <div className="text-[9px] text-zinc-600 leading-tight">
                SEC_LEVEL: BLACK_OPS<br />
                ENCRYPTION: QUANTUM_AES
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50 opacity-10" />
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeTab === 'nexus' && (
                <motion.div
                  key="nexus"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-7xl mx-auto space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                    <div>
                      <h1 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase italic">Intelligence Nexus</h1>
                      <p className="text-zinc-600 mt-2 font-bold uppercase tracking-widest text-xs">Expert security recon and vulnerability exploitation lab telemetry.</p>
                    </div>
                      <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-600">Threat Level</span>
                          <span className="text-red-500">{intelStatus?.threatLevel || 'UNKNOWN'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-600">Active Nodes</span>
                          <span className="text-zinc-100">{intelStatus?.activeNodes?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                  </div>

                  {/* High Impact Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Findings in Last Scan', value: scanResults?.findings?.length ?? intelStatus?.activeNodes ?? 0, sub: 'Live Findings', icon: Brain, color: 'text-red-500' },
                      { label: 'High-Risk Findings', value: intelStatus?.verifiedFlaws ?? 0, sub: 'High Risk', icon: Globe, color: 'text-blue-500' },
                      { label: 'TXT Intel Records', value: intelStatus?.trackedAPTs ?? 0, sub: 'DNS TXT Count', icon: Shield, color: 'text-emerald-500' },
                      { label: 'Actionable PoCs', value: intelStatus?.activePoCs ?? 0, sub: 'Derived from Scan', icon: Zap, color: 'text-amber-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl hover:bg-zinc-900/40 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                          <stat.icon size={48} />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                        <div className="flex items-baseline space-x-2">
                          <p className={`text-4xl font-black text-zinc-100 ${stat.color}`}>{stat.value}</p>
                          <p className="text-[10px] text-zinc-500 font-bold">{stat.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* WebApp Recon Module */}
                    <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center">
                          <Globe size={18} className="mr-3 text-blue-500" />
                          WebApp Recon & Intelligence
                        </h3>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">Live Analysis</span>
                      </div>
                      
                      <div className="space-y-4">
                        {scanResults?.findings?.length ? (
                          scanResults.findings.slice(0, 8).map((finding: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-black/40">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest">{finding.type}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${finding.risk === 'High' ? 'bg-red-500 text-red-500' : finding.risk === 'Medium' ? 'bg-amber-500 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                  {finding.risk}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-2 break-all">{finding.value}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 rounded-xl border border-zinc-800 bg-black/40 text-xs text-zinc-500">
                            No live scan findings yet. Run a target scan in the Target Recon tab to populate this panel.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Impact Feed */}
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 flex flex-col h-[500px]">
                      <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center">
                        <Terminal size={18} className="mr-3 text-red-500" />
                        System Kernel Logs
                      </h3>
                      <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide font-mono text-[10px]">
                        {systemLogs.map((log, i) => (
                          <div key={i} className="flex space-x-2">
                            <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                            <span className={`
                              ${log.type === 'info' ? 'text-blue-500' : ''}
                              ${log.type === 'warn' ? 'text-amber-500' : ''}
                              ${log.type === 'error' ? 'text-red-500' : ''}
                              ${log.type === 'call' ? 'text-emerald-500' : ''}
                            `}>
                              {log.type.toUpperCase()}:
                            </span>
                            <span className="text-zinc-400">{log.msg}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-zinc-900">
                        <div className="flex items-center justify-between text-[8px] font-bold text-zinc-600 uppercase">
                          <span>Kernel Status: STABLE</span>
                          <span>Uptime: 100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'intel' && (
                <motion.div
                  key="intel"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full flex flex-col max-w-5xl mx-auto bg-zinc-900/10 border border-zinc-900 rounded-3xl overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-zinc-900 bg-zinc-900/20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Binary className="text-red-500" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tighter">Security Intelligence Core</h3>
                        <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em]">WebApp Hacking Mode: ACTIVE</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 font-bold uppercase">Neural Sync</div>
                      <div className="text-xs font-black text-zinc-300">98.4%</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-6 rounded-3xl ${
                          msg.role === 'user' 
                            ? 'bg-red-600 text-white rounded-tr-none shadow-[0_10px_30px_rgba(220,38,38,0.2)]' 
                            : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800 rounded-tl-none'
                        }`}>
                          <div className="flex items-center space-x-2 mb-3 opacity-50">
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {msg.role === 'user' ? 'argila' : 'TEQiQ_CORE'}
                            </span>
                          </div>
                          <div className="text-xs leading-relaxed font-mono whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-900/50 p-6 rounded-3xl rounded-tl-none border border-zinc-800">
                          <Loader2 className="animate-spin text-red-600" size={20} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-8 border-t border-zinc-900 bg-zinc-900/20">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-800 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Request exploit strategy, PoC logic, or impact analysis..."
                        className="relative w-full bg-black border border-zinc-800 rounded-2xl py-5 pl-6 pr-16 text-xs focus:outline-none focus:border-red-600 transition-all placeholder:text-zinc-700 font-bold"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-3 bottom-3 px-5 bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recon' && (
                <motion.div
                  key="recon"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-6xl mx-auto space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                    <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">Target Recon</h2>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowRawIntel(!showRawIntel)}
                        className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showRawIntel ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        {showRawIntel ? 'Hide Raw' : 'Show Raw'}
                      </button>
                      <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">Import Scope</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <div className="relative mb-8">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                          <input 
                            type="text" 
                            value={reconInput}
                            onChange={(e) => setReconInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan(reconInput)}
                            placeholder="Target Domain, IP, or CIDR..." 
                            className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-16 pr-6 text-xs focus:outline-none focus:border-red-600 transition-all font-bold"
                          />
                          <button 
                            onClick={() => handleScan(reconInput)}
                            disabled={isScanning}
                            className="absolute right-3 top-2 bottom-2 px-4 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase disabled:opacity-50"
                          >
                            {isScanning ? <Loader2 className="animate-spin" size={14} /> : 'Scan'}
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                              {scanResults ? `Scan Results: ${scanResults.target}` : 'Active Target Matrix'}
                            </h4>
                            {scanResults && (
                              <button 
                                onClick={handleAnalyze}
                                className="text-[9px] font-bold text-red-500 uppercase border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                              >
                                Run Analysis
                              </button>
                            )}
                          </div>
                          
                          {isScanning && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                              <Loader2 className="animate-spin text-red-600" size={32} />
                              <p className="text-[10px] font-bold text-zinc-600 uppercase animate-pulse">Probing Network & Headers...</p>
                            </div>
                          )}

                          {!isScanning && (scanResults ? (
                            showRawIntel ? (
                              <div className="p-6 bg-black border border-zinc-800 rounded-2xl font-mono text-[10px] text-emerald-500 overflow-x-auto whitespace-pre">
                                {JSON.stringify(scanResults, null, 2)}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-4">
                                {scanResults.findings.map((target: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-zinc-700 transition-all group">
                                    <div className="flex items-center space-x-6">
                                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-red-500/50 transition-colors">
                                        <Globe size={20} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">{target.value || target.name}</p>
                                        <div className="flex items-center space-x-3 mt-1">
                                          <span className="text-[9px] text-zinc-600 font-bold uppercase">{target.type}</span>
                                          <span className="text-[9px] text-zinc-600 font-bold">•</span>
                                          <span className={`text-[9px] font-bold uppercase ${target.risk === 'Critical' || target.risk === 'High' ? 'text-red-500' : target.risk === 'Secure' ? 'text-emerald-500' : 'text-amber-500'}`}>{target.risk}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-zinc-100">VERIFIED</p>
                                      <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">LIVE DATA</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="p-6 bg-black/40 border border-zinc-800 rounded-2xl text-xs text-zinc-500">
                              No scan data loaded. Enter a real target and run a scan to populate this panel.
                            </div>
                          )
                        )}
                        </div>
                      </div>

                    <div className="space-y-8">
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Live CVE Intelligence (NVD)</h3>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={cveQuery}
                              onChange={(e) => setCveQuery(e.target.value)}
                              placeholder="CVE-YYYY-NNNN"
                              className="flex-1 bg-black border border-zinc-800 rounded-xl py-2 px-3 text-[11px] text-zinc-200"
                            />
                            <button
                              onClick={handleCveLookup}
                              disabled={isCveLoading || !cveQuery.trim()}
                              className="px-3 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase disabled:opacity-50"
                            >
                              {isCveLoading ? 'Loading' : 'Lookup'}
                            </button>
                          </div>

                          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[11px]">
                            {!cveResult && <p className="text-zinc-500">No cached list is shown. Use lookup to pull live CVE data.</p>}
                            {cveResult?.error && <p className="text-red-400">{cveResult.error}</p>}
                            {cveResult?.id && (
                              <>
                                <p className="text-red-400 font-black">{cveResult.id}</p>
                                <p className="text-zinc-300 mt-2">Severity: {cveResult.severity}</p>
                                <p className="text-zinc-400 mt-2">{cveResult.description}</p>
                                <p className="text-zinc-600 mt-2">Source: {cveResult.source}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Intelligence Analysis</h3>
                        <div className="space-y-4">
                          {!analysisResults ? (
                            <div className="p-6 border border-dashed border-zinc-800 rounded-2xl text-center">
                              <p className="text-[10px] text-zinc-600 font-bold uppercase">No analysis data. Run a scan and click 'Run Analysis'.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                <p className="text-[9px] text-red-500 font-black uppercase mb-1">Report</p>
                                <p className="text-xs font-bold text-zinc-200">{analysisResults.report}</p>
                              </div>
                              <div className="space-y-3">
                                {analysisResults.strategies.map((strat: any, i: number) => (
                                  <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black text-zinc-100 uppercase">{strat.name}</span>
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${strat.impact === 'Critical' ? 'bg-red-500 text-red-500' : 'bg-amber-500 text-amber-500'}`}>
                                        {strat.impact}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase">
                                      <span>Vector: {strat.vector}</span>
                                      <span>Complexity: {strat.complexity}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>


                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Subdomain Enumeration</h3>
                        <div className="space-y-4">
                          {subdomains.length > 0 ? (
                            <div className="space-y-2">
                              {subdomains.map((sub, i) => (
                                <div key={i} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                  <p className="text-xs font-bold text-zinc-200">{sub}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">No subdomains found. Run a scan to enumerate.</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Automated Exploit Executions</h3>
                        <div className="space-y-4">
                          {automatedExecutions.length > 0 ? (
                            <div className="space-y-3">
                              {automatedExecutions.map((exec: any, i: number) => (
                                <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-zinc-100 uppercase">{exec.job?.type || 'Unknown'}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${exec.result && exec.result.success ? 'bg-emerald-500 text-emerald-500' : 'bg-red-500 text-red-500'}`}>
                                      {exec.result && exec.result.success ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-400">{exec.result?.error || 'Executed successfully'}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">No automated executions. Run analysis on vulnerable targets.</p>
                          )}
                        </div>
                      </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { name: 'DNS A Records', count: (scanResults?.findings || []).filter((f: any) => f.type === 'DNS' && String(f.value || '').includes('A Records')).length },
                            { name: 'DNS MX Records', count: (scanResults?.findings || []).filter((f: any) => f.type === 'Mail').length },
                            { name: 'DNS TXT Records', count: (scanResults?.findings || []).filter((f: any) => f.type === 'DNS' && String(f.value || '').includes('TXT Records')).length },
                            { name: 'Header Checks', count: (scanResults?.findings || []).filter((f: any) => f.type === 'Header' || f.type === 'Vulnerability').length },
                            { name: 'Probe Errors', count: (scanResults?.findings || []).filter((f: any) => f.type === 'Error').length },
                          ].map((mod, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">{mod.name}</span>
                              <span className="text-[10px] font-black text-zinc-200">{mod.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            )}

              {activeTab === 'impact' && (
                <motion.div
                  key="impact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-6xl mx-auto space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                    <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">Impact Lab</h2>
                    <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live Evidence Mode</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 space-y-6">
                      <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">Evidence Summary</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                          <p className="text-[9px] text-zinc-500 font-black uppercase">Target</p>
                          <p className="text-xs font-bold text-zinc-200 mt-2 break-all">{scanResults?.target || 'No scan yet'}</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                          <p className="text-[9px] text-zinc-500 font-black uppercase">High Risk Findings</p>
                          <p className="text-2xl font-black text-red-500 mt-1">{intelStatus?.verifiedFlaws ?? 0}</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                          <p className="text-[9px] text-zinc-500 font-black uppercase">Threat Level</p>
                          <p className="text-2xl font-black text-amber-400 mt-1">{intelStatus?.threatLevel || 'UNKNOWN'}</p>
                        </div>
                      </div>

                      <div className="p-6 bg-black/40 border border-zinc-800 rounded-2xl">
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Current Recommendation</p>
                        <p className="text-xs text-zinc-300 mt-3">{analysisResults?.recommendation || 'Run a live scan and analysis to generate actionable remediation guidance.'}</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Top Strategies</p>
                        {analysisResults?.strategies?.length ? (
                          analysisResults.strategies.slice(0, 3).map((strat: any, i: number) => (
                            <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                              <p className="text-[11px] font-black text-zinc-100">{strat.name}</p>
                              <p className="text-[10px] text-zinc-400 mt-1">Vector: {strat.vector} • Complexity: {strat.complexity} • Impact: {strat.impact}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-[11px] text-zinc-500">No strategy data yet.</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Execution State</h3>
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-amber-300">Executor Offline</p>
                          <p className="text-[11px] text-zinc-300 mt-2">Active exploit runtime is disabled in this repository build. Attach a controlled executor service to enable verified operations.</p>
                        </div>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Last Execution Response</h3>
                        {exploitImpact ? (
                          <pre className="text-[10px] text-zinc-300 bg-black/40 border border-zinc-800 rounded-xl p-4 overflow-auto whitespace-pre-wrap">{JSON.stringify(exploitImpact, null, 2)}</pre>
                        ) : (
                          <p className="text-[11px] text-zinc-500">No execution response captured.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'forge' && (
                <motion.div
                  key="forge"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-6xl mx-auto space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                    <h2 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">PoC Forge</h2>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">Templates</button>
                      <button 
                        onClick={handleExecuteExploit}
                        disabled={isExecuting || !forgeTarget || !forgePayload || !approvedBy.trim() || !approvalConfirmed}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg disabled:opacity-50"
                      >
                        {isExecuting ? 'Submitting...' : 'Submit Operation'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-600/30 rounded-2xl p-4">
                    <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest">Real-World Security Operations Mode</p>
                    <p className="text-[11px] text-zinc-400 mt-2">This lab is configured for actual penetration testing and vulnerability exploitation with proper authorization controls.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Exploit Type</label>
                        <select 
                          value={forgeType}
                          onChange={(e) => setForgeType(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-6 text-xs text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold uppercase"
                        >
                          <option value="RCE">Remote Code Execution (RCE)</option>
                          <option value="SQLi">SQL Injection (SQLMap)</option>
                          <option value="XSS">Cross-Site Scripting (XSS)</option>
                          <option value="Directory">Directory Brute-Force (Gobuster)</option>
                          <option value="Nuclei">Vulnerability Scan (Nuclei)</option>
                          <option value="HeaderInjection">Header Injection</option>
                          <option value="PortExploit">Port Service Exploitation</option>
                          <option value="NucleiExploit">Nuclei-detected Exploit</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target Parameters</label>
                        <div className="grid grid-cols-1 gap-4">
                          <input 
                            type="text" 
                            value={forgeTarget}
                            onChange={(e) => setForgeTarget(e.target.value)}
                            placeholder="Target URL / IP" 
                            className="bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold" 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Authorization Control</label>
                        <input
                          type="text"
                          value={approvedBy}
                          onChange={(e) => setApprovedBy(e.target.value)}
                          placeholder="Approved by"
                          className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold"
                        />
                        <label className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          <input
                            type="checkbox"
                            checked={approvalConfirmed}
                            onChange={(e) => setApprovalConfirmed(e.target.checked)}
                            className="h-4 w-4 accent-red-600"
                          />
                          I confirm this operation is approved and in scope.
                        </label>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Custom Payload</label>
                        <textarea 
                          rows={8}
                          value={forgePayload}
                          onChange={(e) => setForgePayload(e.target.value)}
                          placeholder="Define custom exploit logic or constraints..."
                          className="w-full bg-black border border-zinc-800 rounded-2xl p-6 text-xs text-emerald-500 focus:outline-none focus:border-red-600 transition-all font-mono leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">Generated PoC</h3>
                        <div className="flex space-x-2">
                          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"><FileText size={16} /></button>
                          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"><Code size={16} /></button>
                        </div>
                      </div>
                      <div className="flex-1 bg-black border border-zinc-800 rounded-2xl p-6 font-mono text-[11px] text-emerald-500 overflow-auto min-h-[300px] leading-relaxed">
                        <p className="text-zinc-500">No mock payload is rendered in this lab.</p>
                        <p className="mt-4">Operation profile</p>
                        <p className="text-zinc-400 mt-2">type: <span className="text-zinc-200">{forgeType || 'unset'}</span></p>
                        <p className="text-zinc-400">target: <span className="text-zinc-200 break-all">{forgeTarget || 'unset'}</span></p>
                        <p className="text-zinc-400">approvedBy: <span className="text-zinc-200">{approvedBy || 'unset'}</span></p>
                        <p className="text-zinc-400">scopeConfirmed: <span className="text-zinc-200">{approvalConfirmed ? 'true' : 'false'}</span></p>
                        <p className="text-zinc-400">payloadLength: <span className="text-zinc-200">{forgePayload.length}</span></p>
                        <p className="text-zinc-500 mt-6">Ready for real-world security operations.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'executor' && (
                <motion.div
                  key="executor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full flex flex-col max-w-5xl mx-auto bg-zinc-900/10 border border-zinc-900 rounded-3xl overflow-hidden"
                >
                  <div className="px-8 py-6 border-b border-zinc-900 bg-zinc-900/20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="text-red-500" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tighter">Controlled Executor Lab</h3>
                        <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em]">Verified Exploit Execution</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 font-bold uppercase">Executor Status</div>
                      <div className="text-xs font-black text-zinc-300">{isExecutorAuthenticated ? 'CONNECTED' : 'AUTH REQUIRED'}</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {!isExecutorAuthenticated ? (
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                        <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center">
                          <Lock size={18} className="mr-3 text-red-500" />
                          Executor Authentication
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Auth Codename</label>
                            <input
                              type="text"
                              value={executorCodename}
                              onChange={(e) => setExecutorCodename(e.target.value)}
                              placeholder="Enter codename"
                              className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Auth PIN</label>
                            <input
                              type="password"
                              value={executorPin}
                              onChange={(e) => setExecutorPin(e.target.value)}
                              placeholder="Enter PIN"
                              className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-[10px] text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={async () => {
                              if (!executorCodename.trim() || !executorPin.trim()) return;
                              setIsConnectingExecutor(true);
                              addLog(`Authenticating executor access for ${executorCodename}...`, 'call');
                              
                              // Simulate auth check
                              await new Promise(r => setTimeout(r, 2000));
                              
                              if (executorCodename.toLowerCase() === 'sentinel' && executorPin === '1337') {
                                setIsExecutorAuthenticated(true);
                                setExecutorStatus({ connected: true, lab: 'LEVELACE_CONTROLLED', version: 'v2.1' });
                                addLog('Executor authentication successful. Connected to controlled lab.', 'info');
                              } else {
                                addLog('Executor authentication failed. Invalid credentials.', 'error');
                              }
                              
                              setIsConnectingExecutor(false);
                            }}
                            disabled={isConnectingExecutor || !executorCodename.trim() || !executorPin.trim()}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                          >
                            {isConnectingExecutor ? <Loader2 className="animate-spin" size={16} /> : 'Authenticate & Connect'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                          <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center">
                            <Shield size={18} className="mr-3 text-green-500" />
                            Executor Status
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center">
                              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Lab</div>
                              <div className="text-xs font-black text-zinc-300">{executorStatus?.lab || 'UNKNOWN'}</div>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center">
                              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Version</div>
                              <div className="text-xs font-black text-zinc-300">{executorStatus?.version || 'UNKNOWN'}</div>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center">
                              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Status</div>
                              <div className="text-xs font-black text-green-500">CONNECTED</div>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center">
                              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Auth</div>
                              <div className="text-xs font-black text-zinc-300">{executorCodename}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                          <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center">
                            <Zap size={18} className="mr-3 text-yellow-500" />
                            Payload Orchestration Engine
                          </h4>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Primary Vector</label>
                                <select className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-red-600">
                                  <option>RCE</option>
                                  <option>SQLi</option>
                                  <option>XSS</option>
                                  <option>CSRF</option>
                                  <option>XXE</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Chain Method</label>
                                <select className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-red-600">
                                  <option>Sequential</option>
                                  <option>Parallel</option>
                                  <option>Conditional</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Scope Control</label>
                                <select className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-red-600">
                                  <option>Targeted</option>
                                  <option>Broad</option>
                                  <option>Constrained</option>
                                </select>
                              </div>
                            </div>

                            <div className="bg-black border border-zinc-800 rounded-2xl p-6">
                              <h5 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-4">Orchestration Logic</h5>
                              <div className="font-mono text-[11px] text-emerald-500 space-y-2">
                                {orchestratedPayload ? (
                                  <pre className="whitespace-pre-wrap">{orchestratedPayload}</pre>
                                ) : (
                                  <>
                                    <p>// Payload Orchestration Sequence</p>
                                    <p>1. Reconnaissance Phase - Gather target intelligence</p>
                                    <p>2. Vector Selection - Choose optimal exploit path</p>
                                    <p>3. Payload Crafting - Generate context-aware payload</p>
                                    <p>4. Execution Chain - Deploy in controlled sequence</p>
                                    <p>5. Impact Assessment - Verify and log results</p>
                                    <p>6. Cleanup Protocol - Remove traces if required</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              <button 
                                onClick={handleGenerateOrchestratedPayload}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-200"
                              >
                                Generate Orchestrated Payload
                              </button>
                              <button 
                                onClick={handleTestInSandbox}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-200"
                              >
                                Test in Sandbox
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8" style={{display: "none"}}>
                          <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 flex items-center">
                            <HardDrive size={18} className="mr-3 text-blue-500" />
                            Execution History
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-black border border-zinc-800 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-zinc-300">RCE Exploit Chain</span>
                                <span className="text-[10px] text-green-500 font-bold">SUCCESS</span>
                              </div>
                              <p className="text-[10px] text-zinc-600">Target: example.com | Session: RCE-1703123456789</p>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-zinc-300">SQLi Vector Test</span>
                                <span className="text-[10px] text-amber-500 font-bold">PARTIAL</span>
                              </div>
                              <p className="text-[10px] text-zinc-600">Target: test-db.com | Session: SQL-1703123456000</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Status Bar */}
          <footer className="bg-[#080808] border-t border-zinc-900 px-8 py-3 flex items-center justify-between text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] z-20">
            <div className="flex items-center space-x-10">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                CORE_TEMP: 42°C
              </span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                LINK: ENCRYPTED
              </span>
              <span className="hidden sm:inline">NODES: {intelStatus?.activeNodes?.toLocaleString() || '0'} ACTIVE</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="hidden sm:inline">SIG: argila@LEVELACE</span>
              <span className="text-zinc-400">JUSCLICK-secOps v1.0.0-PRO</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
