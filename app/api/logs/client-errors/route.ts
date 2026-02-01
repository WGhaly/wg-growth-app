import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Store errors in memory (you can replace this with database storage)
const errorLogs: Array<{
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  context: string;
  error: any;
  userAgent?: string;
  url?: string;
}> = [];

// Keep only last 100 errors
const MAX_LOGS = 100;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    
    const errorLog = {
      timestamp: new Date(),
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      context: body.context || 'unknown',
      error: body.error,
      userAgent: req.headers.get('user-agent') || undefined,
      url: body.url || undefined,
    };
    
    // Log to console for Vercel logs
    console.error('[CLIENT ERROR]', JSON.stringify(errorLog, null, 2));
    
    // Store in memory
    errorLogs.unshift(errorLog);
    if (errorLogs.length > MAX_LOGS) {
      errorLogs.pop();
    }
    
    return NextResponse.json({ logged: true });
  } catch (error) {
    console.error('[ERROR LOGGING FAILED]', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    // Only allow authenticated users to view logs
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return recent logs
    return NextResponse.json({
      logs: errorLogs.slice(0, 50),
      total: errorLogs.length
    });
  } catch (error) {
    console.error('[ERROR FETCHING LOGS]', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
