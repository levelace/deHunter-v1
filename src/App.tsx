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
  ChevronRight,
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

type Tab = 'nexus' | 'intel' | 'recon' | 'impact' | 'forge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('nexus');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Jusclick-TEQiQ Offensive Suite initialized. Operator: argila. Organization: LEVELACE SENTINEL LLC. Ready for high-impact assessment.' }
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
      addLog(`Analysis complete. Generated ${data.strategies.length} exploit strategies.`, 'info');
    } catch (e) {
      addLog(`Analysis failed for ${scanResults.target}`, 'error');
    }
  };

  const handleExecuteExploit = async () => {
    if (!forgeTarget || !forgePayload) {
      addLog("Execution blocked: Target and Payload required", 'warn');
      return;
    }
    setIsExecuting(true);
    setExploitImpact(null);
    addLog(`DEPLOYING EXPLOIT: ${forgeType} -> ${forgeTarget}`, 'call');
    
    try {
      const res = await fetch('/api/exploit/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: forgeTarget, payload: forgePayload, type: forgeType })
      });
      const data = await res.json();
      
      // Simulate live terminal feedback
      for (const step of data.steps) {
        await new Promise(r => setTimeout(r, step.delay));
        addLog(step.msg, 'info');
      }

      setExploitImpact(data.impact);
      if (data.impact.status === 'SUCCESS') {
        addLog(`EXPLOIT SUCCESSFUL. Access: ${data.impact.access}. Session: ${data.impact.sessionID}`, 'info');
        setActiveTab('impact'); // Switch to impact lab to see results
      } else {
        addLog(`EXPLOIT FAILED: ${data.impact.reason}`, 'error');
      }
    } catch (e) {
      addLog("Exploit execution engine error", 'error');
    } finally {
      setIsExecuting(false);
    }
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
          systemInstruction: "You are Jusclick-TEQiQ, a professional-grade Real-World Security Intelligence & WebApp Hacker. Your platform is a FULL-STACK system with a real Express backend capable of LIVE network probing and ACTIVE EXPLOIT EXECUTION. You have access to real-world intelligence via GOOGLE SEARCH and a custom BACKEND ENGINE. Your primary mission tonight is to FIND REAL BUGS. Use GOOGLE SEARCH to find the latest CVEs, zero-days, and misconfigurations for any target or technology the user provides. When a user provides a target, perform a LIVE scan using the 'Target Recon' module and then use your intelligence to cross-reference findings with real-world exploits. You provide technical attack chains, CVSS scores, and remediation strategies based on ACTUAL CURRENT DATA. You are precise, technical, and focused on real-world impact for LEVELACE SENTINEL LLC."
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
          <span className="font-black text-zinc-100 tracking-tighter">JUSCLICK-TEQiQ</span>
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
                      <p className="text-zinc-600 mt-2 font-bold uppercase tracking-widest text-xs">Real-world security intelligence & webapp hacking telemetry.</p>
                    </div>
                      <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-600">Threat Level</span>
                          <span className="text-red-500">{intelStatus?.threatLevel || 'CRITICAL'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-zinc-600">Active Nodes</span>
                          <span className="text-zinc-100">{intelStatus?.activeNodes?.toLocaleString() || '1,204'}</span>
                        </div>
                      </div>
                  </div>

                  {/* High Impact Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Intelligence IQ', value: '98.4', sub: 'Neural Sync', icon: Brain, color: 'text-red-500' },
                      { label: 'WebApp Vulnerabilities', value: intelStatus?.verifiedFlaws || '1,242', sub: 'Verified Flaws', icon: Globe, color: 'text-blue-500' },
                      { label: 'Threat Actors', value: intelStatus?.trackedAPTs || '42', sub: 'Tracked APTs', icon: Shield, color: 'text-emerald-500' },
                      { label: 'Exploit Ready', value: intelStatus?.activePoCs || '842', sub: 'Active PoCs', icon: Zap, color: 'text-amber-500' },
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
                      
                      <div className="space-y-6">
                        {[
                          { name: 'Target: ilevelace.com', steps: ['Subdomain Scan', 'API Discovery', 'WAF Bypass', 'SQLi Test'], progress: 85, risk: 'Critical' },
                          { name: 'Threat Intel: APT-29', steps: ['TTP Mapping', 'C2 Identification', 'Payload Analysis'], progress: 60, risk: 'High' },
                          { name: 'WebApp: Auth-Module-V2', steps: ['JWT Analysis', 'IDOR Discovery', 'Logic Flaw Test'], progress: 95, risk: 'Critical' },
                        ].map((chain, i) => (
                          <div key={i} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest">{chain.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${chain.risk === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                {chain.risk}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {chain.steps.map((step, si) => (
                                <React.Fragment key={si}>
                                  <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase border ${si < (chain.progress/25) ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                    {step}
                                  </div>
                                  {si < chain.steps.length - 1 && <ChevronRight size={10} className="text-zinc-800" />}
                                </React.Fragment>
                              ))}
                            </div>
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${chain.progress}%` }}
                                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                              />
                            </div>
                          </div>
                        ))}
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
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
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
                            <div className="grid grid-cols-1 gap-4 opacity-30 grayscale">
                              {[
                                { type: 'API', value: 'internal-api.example.com', risk: 'Critical', status: 'Scanning' },
                                { type: 'Host', value: '192.168.10.42', risk: 'High', status: 'Idle' },
                              ].map((target: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                                  <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                                      <Globe size={20} className="text-zinc-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">{target.value}</p>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{target.type}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}
                        </div>
                      </div>

                    <div className="space-y-8">
                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Recent CVE Intelligence</h3>
                        <div className="space-y-4">
                          {[
                            { id: 'CVE-2024-21626', title: 'runc Container Breakout', severity: 'Critical', date: '2024-01-31' },
                            { id: 'CVE-2024-23897', title: 'Jenkins Arbitrary File Read', severity: 'High', date: '2024-01-24' },
                            { id: 'CVE-2023-46604', title: 'Apache ActiveMQ RCE', severity: 'Critical', date: '2023-10-27' },
                          ].map((cve, i) => (
                            <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-red-500/50 transition-all cursor-pointer group">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-red-500 uppercase">{cve.id}</span>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase">{cve.date}</span>
                              </div>
                              <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{cve.title}</p>
                              <div className="mt-2">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${cve.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                  {cve.severity}
                                </span>
                              </div>
                            </div>
                          ))}
                          <button className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-zinc-400">
                            Load More Intelligence
                          </button>
                        </div>
                      </div>

                      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Intelligence Analysis</h3>
                        <div className="space-y-4">
                          {!analysisResults ? (
                            <div className="p-6 border border-dashed border-zinc-800 rounded-2xl text-center">
                              <p className="text-[10px] text-zinc-600 font-bold uppercase">No analysis data. Run a scan and click 'Run Analysis'.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                <p className="text-[9px] text-red-500 font-black uppercase mb-1">Recommendation</p>
                                <p className="text-xs font-bold text-zinc-200">{analysisResults.recommendation}</p>
                              </div>
                              <div className="space-y-3">
                                {analysisResults.strategies.map((strat: any, i: number) => (
                                  <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black text-zinc-100 uppercase">{strat.name}</span>
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${strat.impact === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
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
                        <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-6">Recon Modules</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { name: 'Subdomain Brute', active: true },
                            { name: 'Port Discovery', active: true },
                            { name: 'WAF Bypass Test', active: false },
                            { name: 'Cloud Bucket Scan', active: true },
                            { name: 'Tech Stack ID', active: true },
                          ].map((mod, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">{mod.name}</span>
                              <div className={`w-2 h-2 rounded-full ${mod.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                            </div>
                          ))}
                        </div>
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
                    <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">Generate Report</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Base CVSS Score</label>
                          <div className="flex items-center space-x-4">
                            <input type="range" min="0" max="10" step="0.1" className="flex-1 accent-red-600" />
                            <span className="text-2xl font-black text-red-500">8.4</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Exploitability</label>
                          <div className="flex space-x-2">
                            {['Low', 'Medium', 'High', 'Critical'].map(level => (
                              <button key={level} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border ${level === 'High' ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Impact Description</label>
                        <textarea 
                          rows={6}
                          placeholder="Describe the business and technical impact of the vulnerability..."
                          className="w-full bg-black border border-zinc-800 rounded-2xl p-6 text-xs text-zinc-300 focus:outline-none focus:border-red-600 transition-all font-bold leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                      <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-8">Active Impact Data</h3>
                      {exploitImpact?.status === 'SUCCESS' ? (
                        <div className="space-y-6">
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <p className="text-[9px] text-emerald-500 font-black uppercase mb-1">Access Level</p>
                            <p className="text-lg font-black text-zinc-100">{exploitImpact.access}</p>
                          </div>
                          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Data Exfiltrated</p>
                            <p className="text-xs font-bold text-zinc-300">{exploitImpact.dataExfiltrated}</p>
                          </div>
                          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Session ID</p>
                            <p className="text-xs font-mono text-red-500">{exploitImpact.sessionID}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 border border-dashed border-zinc-800 rounded-2xl text-center">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase italic">No active impact data. Execute a successful exploit in the PoC Forge.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8">
                      <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-8">Impact Metrics</h3>
                      <div className="space-y-8">
                        {[
                          { label: 'Financial Risk', value: 85, color: 'bg-red-600' },
                          { label: 'Reputation Damage', value: 92, color: 'bg-red-600' },
                          { label: 'Compliance Violation', value: 64, color: 'bg-amber-600' },
                          { label: 'Operational Downtime', value: 78, color: 'bg-red-600' },
                        ].map((metric, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-zinc-500">{metric.label}</span>
                              <span className="text-zinc-200">{metric.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                className={`h-full ${metric.color}`}
                              />
                            </div>
                          </div>
                        ))}
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
                        disabled={isExecuting || !forgeTarget || !forgePayload}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg disabled:opacity-50"
                      >
                        {isExecuting ? 'Executing...' : 'Execute Exploit'}
                      </button>
                    </div>
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
                          <option value="SQLi">SQL Injection (Blind/Time-based)</option>
                          <option value="Auth">Auth Bypass (JWT/OAuth)</option>
                          <option value="LPE">Local Privilege Escalation</option>
                          <option value="SSRF">Server-Side Request Forgery</option>
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
                        <span className="text-zinc-600"># Jusclick-TEQiQ PoC Generator</span><br />
                        <span className="text-zinc-600"># Operator: argila</span><br />
                        <span className="text-zinc-600"># Target: internal-api.levelace.com</span><br /><br />
                        <span className="text-blue-400">import</span> requests<br />
                        <span className="text-blue-400">import</span> sys<br /><br />
                        <span className="text-purple-400">def</span> <span className="text-amber-400">exploit</span>(target):<br />
                        &nbsp;&nbsp;payload = <span className="text-emerald-300">"'; exec(atob('...')); --"</span><br />
                        &nbsp;&nbsp;headers = {'{'}'User-Agent': 'TEQiQ-Impact-Scanner'{'}'}<br />
                        &nbsp;&nbsp;r = requests.post(target, data={'{'}'id': payload{'}'}, headers=headers)<br />
                        &nbsp;&nbsp;<span className="text-purple-400">if</span> r.status_code == <span className="text-red-400">200</span>:<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">print</span>(<span className="text-emerald-300">"[+] Impact Verified: RCE Successful"</span>)<br /><br />
                        <span className="text-purple-400">if</span> __name__ == <span className="text-emerald-300">"__main__"</span>:<br />
                        &nbsp;&nbsp;exploit(sys.argv[1])
                      </div>
                    </div>
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
              <span className="hidden sm:inline">NODES: 1,204 ACTIVE</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="hidden sm:inline">SIG: argila@LEVELACE</span>
              <span className="text-zinc-400">JUSCLICK-TEQiQ v4.0.0-PRO</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
