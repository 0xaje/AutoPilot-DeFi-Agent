import { OpenAI } from "openai";
import { executeSwap } from "./uniswap";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export type DecisionPayload = {
  decision: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
};

export type AgentResponse = {
  strategist: DecisionPayload;
  riskEvaluation: {
    approved: boolean;
    reason: string;
  };
  execution?: {
    success: boolean;
    txHash?: string;
    error?: string;
  };
};

export async function runAgentCycle(riskLevel: "Low" | "Medium" | "High" = "Medium"): Promise<AgentResponse> {
  // 1. STRATEGIST AGENT
  let strategistDecision: DecisionPayload;
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY") {
    console.warn("No OpenAI API key found. Using mock decision.");
    // Mock the strategist decision for demo purposes
    const mockDecisions: ("BUY" | "SELL" | "HOLD")[] = ["BUY", "SELL", "HOLD"];
    const randomDecision = mockDecisions[Math.floor(Math.random() * mockDecisions.length)];
    strategistDecision = {
      decision: randomDecision,
      confidence: Math.floor(Math.random() * 40) + 60, // 60-99
      reasoning: `Market volatility detected. Moving averages indicate a ${randomDecision.toLowerCase()} opportunity based on simulated ETH/USDC pairs.`,
    };
  } else {
    // Real call to LLM
    const prompt = `You are an autonomous DeFi Strategist Agent monitoring the ETH/USDC pair.
Based on current market trends (assume a volatile test scenario where ETH has dropped 2% but volume is spiking), what is your decision?
Respond in strictly valid JSON format: { "decision": "BUY" | "SELL" | "HOLD", "confidence": <number 0-100>, "reasoning": "<your concise reason>" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-3.5-turbo
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    try {
      strategistDecision = JSON.parse(response.choices[0].message.content || "{}") as DecisionPayload;
    } catch (e) {
      strategistDecision = { decision: "HOLD", confidence: 0, reasoning: "Failed to parse AI response." };
    }
  }

  // 2. RISK AGENT
  const isApproved = await evaluateRisk(strategistDecision, riskLevel);

  // 3. EXECUTOR AGENT
  let executionResult = undefined;
  if (isApproved.approved && strategistDecision.decision !== "HOLD") {
    try {
      const txHash = await executeSwap(strategistDecision.decision);
      executionResult = { success: true, txHash };
    } catch (e: any) {
      executionResult = { success: false, error: e.message };
    }
  }

  return {
    strategist: strategistDecision,
    riskEvaluation: isApproved,
    execution: executionResult,
  };
}

async function evaluateRisk(decision: DecisionPayload, targetRisk: string) {
  // A simple risk evaluation logic.
  // E.g. If Risk level is Low, we need higher confidence to approve trades.
  if (decision.decision === "HOLD") {
    return { approved: true, reason: "Holding carries native risk, no transaction needed." };
  }

  if (targetRisk === "Low" && decision.confidence < 85) {
    return { approved: false, reason: "Confidence too low for Low Risk profile." };
  }
  if (targetRisk === "Medium" && decision.confidence < 60) {
    return { approved: false, reason: "Confidence too low for Medium Risk profile." };
  }
  if (targetRisk === "High" && decision.confidence < 40) {
    return { approved: false, reason: "Reckless trade averted." };
  }

  return { approved: true, reason: "Risk parameters met. Trade authorized." };
}
