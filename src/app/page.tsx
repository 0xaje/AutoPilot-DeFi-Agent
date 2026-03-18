"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Activity, Shield, Info, ArrowRightLeft, Clock,  ExternalLink, AlertTriangle, CheckCircle2, ChevronRight, Fingerprint, Network } from "lucide-react";

type LogEntry = {
  id: string;
  timestamp: string;
  type: "info" | "decision" | "execution" | "error";
  message: string;
  details?: string;
  txHash?: string;
};

export default function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("Medium");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [balances, setBalances] = useState({ eth: 1.5, usdc: 2500 });

  const addLog = (log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleRunAgent = async () => {
    setIsRunning(true);
    addLog({ type: "info", message: "System initializing. Agent cycle started." });
    
    try {
      addLog({ type: "info", message: "Strategist cross-referencing on-chain data via LLM..." });
      
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskLevel }),
      });
      
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Log Strategist Decision
      addLog({
        type: "decision",
        message: `Strategist Output: ${data.strategist.decision} [Confidence ${data.strategist.confidence}%]`,
        details: data.strategist.reasoning,
      });

      // Log Risk Agent
      addLog({
        type: data.riskEvaluation.approved ? "info" : "error",
        message: `Risk Firewall: ${data.riskEvaluation.approved ? "AUTHORIZED" : "REJECTED"}`,
        details: data.riskEvaluation.reason,
      });

      // Log Executor
      if (data.execution) {
        if (data.execution.success) {
          addLog({
            type: "execution",
            message: `Execution complete. On-chain validation emitted.`,
            txHash: data.execution.txHash,
          });
          // Mock update balances
          if (data.strategist.decision === "BUY") {
            setBalances(b => ({ eth: +(b.eth + 0.05).toFixed(4), usdc: +(b.usdc - 150).toFixed(2) }));
          } else if (data.strategist.decision === "SELL") {
            setBalances(b => ({ eth: +(b.eth - 0.05).toFixed(4), usdc: +(b.usdc + 150).toFixed(2) }));
          }
        } else {
          addLog({
            type: "error", message: `Execution failed at smart contract layer.`, details: data.execution.error,
          });
        }
      }

    } catch (err: any) {
      addLog({ type: "error", message: "Critical failure in agent execution pipeline.", details: err.message });
    } finally {
      setIsRunning(false);
      addLog({ type: "info", message: "Cycle complete. Awaiting next trigger." });
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Sleek Minimalist Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
              <Network className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                AutoPilot <span className="text-indigo-400 font-light">DeFi Agent</span>
              </h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">AUTONOMOUS MULTI-AGENT SWAPPER</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <Fingerprint className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Node Status</span>
            <div className="flex items-center gap-2 ml-2">
              <span className="relative flex h-2.5 w-2.5">
                {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
              </span>
              <span className="text-sm font-medium text-zinc-300">{isRunning ? "Evaluating..." : "Listening"}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Controls & Portfolio */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Portfolio Card - Sleeker */}
            <section className="glass-panel p-6 rounded-3xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 text-zinc-400">
                  <ArrowRightLeft className="w-4 h-4" /> Live Portfolio
                </h2>
                <div className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase rounded border border-indigo-500/20">
                  Sepolia
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl transition-all hover:bg-white/[0.05]">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-zinc-500 font-medium tracking-wide mb-1">ETH HOLDINGS</div>
                      <div className="text-3xl font-light tracking-tight text-white">{balances.eth} <span className="text-lg text-zinc-500">ETH</span></div>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center bg-black/50">
                      <div className="w-5 h-5 bg-gradient-to-br from-zinc-300 to-zinc-500 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl transition-all hover:bg-white/[0.05]">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-zinc-500 font-medium tracking-wide mb-1">USDC HOLDINGS</div>
                      <div className="text-3xl font-light tracking-tight text-white">${balances.usdc.toLocaleString()}</div>
                    </div>
                     <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center bg-black/50">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Controls Card - Sleek buttons */}
            <section className="glass-panel p-6 rounded-3xl flex flex-col gap-6 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]" />
              
              <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 text-zinc-400">
                <Shield className="w-4 h-4" /> Operations
              </h2>
              
              <div className="space-y-3 relative z-10">
                <label className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Firewall Rigidity</label>
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                  {(["Low", "Medium", "High"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        riskLevel === level
                          ? "bg-zinc-800 text-white shadow-md border border-white/10"
                          : "text-zinc-500 hover:text-zinc-300 transparent"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 relative z-10 border-t border-white/10">
                <button
                  onClick={handleRunAgent}
                  disabled={isRunning}
                  className="w-full btn-premium rounded-xl py-4 px-6 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    {isRunning ? (
                      <Activity className="w-5 h-5 text-indigo-300 animate-spin" strokeWidth={2} />
                    ) : (
                      <Play className="w-5 h-5 text-indigo-300 group-hover:text-indigo-200 transition-colors" strokeWidth={2} />
                    )}
                    <span className="font-semibold tracking-wide text-white">
                      {isRunning ? "PROCESSING SEQUENCE" : "INITIATE AGENT"}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-500/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
                
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest font-semibold"
                  onClick={() => alert("ELI5: I try to buy low and sell high based on current news and price trends. I won't trade unless I am very confident.")}
                >
                  <Info className="w-4 h-4" /> Explain Like I'm 5
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Sleek Terminal Logs Feed */}
          <div className="lg:col-span-8">
            <section className="glass-panel p-1 rounded-3xl h-[660px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden border border-zinc-800/80">
              
              {/* Fake Window Header like a Mac App / Terminal */}
              <div className="h-10 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  sys_log_stream [~ {logs.length} E]
                </div>
                <Clock className="w-3 h-3 text-zinc-600" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-[#020202]">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs uppercase tracking-widest gap-3"
                    >
                      <Activity className="w-8 h-8 opacity-20" />
                      [ WAITING FOR TELEMETRY ]
                    </motion.div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group font-mono"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {log.type === "info" && <span className="text-blue-500 text-sm">▶</span>}
                          {log.type === "decision" && <span className="text-purple-500 text-sm">✦</span>}
                          {log.type === "execution" && <span className="text-green-500 text-sm">✔</span>}
                          {log.type === "error" && <span className="text-red-500 text-sm">✖</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-[11px] text-zinc-600 shrink-0">[{log.timestamp}]</span>
                            <span className="text-[13px] text-zinc-300 font-medium leading-relaxed">{log.message}</span>
                          </div>
                          
                          {log.details && (
                            <div className="mt-1.5 ml-1 pl-3 border-l-2 border-zinc-800 text-[12px] text-zinc-500 py-1">
                              {log.details}
                            </div>
                          )}
                          
                          {log.txHash && (
                            <div className="mt-2 flex items-center gap-2 bg-black rounded p-2 border border-zinc-900 w-fit">
                              <span className="text-[11px] text-zinc-500">
                                TX_HASH: <span className="text-zinc-400">{log.txHash.substring(0, 10)}...{log.txHash.slice(-8)}</span>
                              </span>
                              <div className="w-px h-3 bg-zinc-800 mx-1 border-r" />
                              <a
                                href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                              >
                                Etherscan <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
