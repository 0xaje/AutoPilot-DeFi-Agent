import { NextResponse } from 'next/server';
import { runAgentCycle } from '@/lib/agent';

export async function POST(request: Request) {
  try {
    const { riskLevel } = await request.json();

    if (!['Low', 'Medium', 'High'].includes(riskLevel)) {
      return NextResponse.json({ error: 'Invalid risk level' }, { status: 400 });
    }

    const result = await runAgentCycle(riskLevel as 'Low' | 'Medium' | 'High');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error in /api/agent:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
