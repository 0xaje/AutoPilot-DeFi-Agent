"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Activity, Shield, Info, ArrowRightLeft, Clock,  ExternalLink, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

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
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleRunAgent = async () => {
    setIsRunning(true);
    addLog({ type: "info", message: "🚀 Agent cycle started." });
    
    try {
      addLog({ type: "info", message: "🤖 Strategist Agent analyzing ETH/USDC via OpenAI..." });
      
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
        message: `Strategist Decision: ${data.strategist.decision} (Confidence: ${data.strategist.confidence}%)`,
        details: data.strategist.reasoning,
      });

      // Log Risk Agent
      addLog({
        type: data.riskEvaluation.approved ? "info" : "error",
        message: `Risk Evaluation (${riskLevel}): ${data.riskEvaluation.approved ? "APPROVED ✅" : "REJECTED ❌"}`,
        details: data.riskEvaluation.reason,
      });

      // Log Executor
      if (data.execution) {
        if (data.execution.success) {
          addLog({
            type: "execution",
            message: `Execution successful! Token Swap Triggered.`,
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
            type: "error", message: `Execution failed.`, details: data.execution.error,
          });
        }
      }

    } catch (err: any) {
      addLog({ type: "error", message: "Error running agent cycle.", details: err.message });
    } finally {
      setIsRunning(false);
      addLog({ type: "info", message: "⏱️ Cycle complete. Agent is idle." });
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 glass-card rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Activity className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AutoPilot DeFi
              </h1>
              <p className="text-zinc-400 text-sm">Autonomous Multi-Agent Swapper</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase font-semibold">Status</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-emerald-500' : 'bg-zinc-500'}`}></span>
                </span>
                <span className="font-medium text-zinc-300">{isRunning ? "Running Cycle" : "Idle"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls & Portfolio */}
          <div className="lg:col-span-1 space-y-8">
            {/* Portfolio Card */}
            <section className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-200">
                <ArrowRightLeft className="w-5 h-5 text-zinc-400" /> Portfolio (Sepolia)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">ETH Balance</div>
                  <div className="text-2xl font-bold font-mono">{balances.eth}</div>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">USDC Balance</div>
                  <div className="text-2xl font-bold font-mono">${balances.usdc.toLocaleString()}</div>
                </div>
              </div>
            </section>

            {/* Controls Card */}
            <section className="glass-card rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-200">
                <Shield className="w-5 h-5 text-zinc-400" /> Agent Controls
              </h2>
              
              <div className="space-y-3">
                <label className="text-sm text-zinc-400 font-medium">Risk Tolerance</label>
                <div className="flex rounded-xl bg-zinc-900/50 p-1 border border-white/5">
                  {(["Low", "Medium", "High"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        riskLevel === level
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <button
                  onClick={handleRunAgent}
                  disabled={isRunning}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity"></span>
                  <div className="relative flex items-center justify-center gap-2 bg-zinc-950 px-6 py-4 rounded-xl transition-all group-hover:bg-opacity-0">
                    {isRunning ? (
                      <Activity className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                    <span className="font-bold text-white shadow-sm">
                      {isRunning ? "Executing..." : "Run Agent Now"}
                    </span>
                  </div>
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900/50 text-indigo-300 hover:bg-zinc-800 transition-colors border border-indigo-500/20 text-sm font-medium"
                  onClick={() => alert("ELI5: I try to buy low and sell high based on current news and price trends. I won't trade unless I am very confident.")}
                >
                  <Info className="w-4 h-4" /> Explain Like I'm 5
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Logs Feed */}
          <div className="lg:col-span-2">
            <section className="glass-card rounded-2xl p-6 h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-200">
                  <Clock className="w-5 h-5 text-zinc-400" /> Action Logs
                </h2>
                <div className="text-xs text-zinc-500 font-mono">
                  {logs.length} Events
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-zinc-500 mt-20"
                    >
                      Agent is sleeping. Click 'Run Agent Now' to start.
                    </motion.div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {log.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
                          {log.type === "decision" && <Activity className="w-5 h-5 text-purple-400" />}
                          {log.type === "execution" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                          {log.type === "error" && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-zinc-200">{log.message}</span>
                            <span className="text-xs text-zinc-500 font-mono">{log.timestamp}</span>
                          </div>
                          {log.details && (
                            <p className="text-sm text-zinc-400 mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
                              {log.details}
                            </p>
                          )}
                          {log.txHash && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-zinc-500 font-mono bg-black/40 px-2 py-1 rounded">
                                TX: {log.txHash.substring(0, 10)}...{log.txHash.slice(-8)}
                              </span>
                              <a
                                href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                View on Explorer <ExternalLink className="w-3 h-3" />
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
