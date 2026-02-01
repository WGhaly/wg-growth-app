'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface ErrorLog {
  timestamp: string;
  userId?: string;
  userEmail?: string;
  context: string;
  error: any;
  userAgent?: string;
  url?: string;
}

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  async function fetchLogs() {
    setLoading(true);
    try {
      const response = await fetch('/api/logs/client-errors');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Client Error Logs</h1>
          <p className="text-text-secondary">
            Showing {logs.length} of {total} recent errors
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {logs.length === 0 && !loading && (
        <Card variant="elevated">
          <CardContent className="p-8 text-center text-text-secondary">
            No errors logged yet
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {logs.map((log, index) => (
          <Card key={index} variant="elevated">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-semantic-error">
                    {log.context}
                  </CardTitle>
                  <p className="text-sm text-text-secondary mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                {log.userEmail && (
                  <span className="text-sm bg-bg-tertiary px-3 py-1 rounded">
                    {log.userEmail}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong className="text-sm text-text-secondary">Error:</strong>
                <div className="bg-bg-tertiary p-3 rounded mt-1 font-mono text-sm">
                  {log.error.name}: {log.error.message}
                </div>
              </div>
              
              {log.url && (
                <div>
                  <strong className="text-sm text-text-secondary">URL:</strong>
                  <div className="text-sm mt-1 break-all">{log.url}</div>
                </div>
              )}
              
              {log.userAgent && (
                <div>
                  <strong className="text-sm text-text-secondary">User Agent:</strong>
                  <div className="text-sm mt-1 text-text-secondary">{log.userAgent}</div>
                </div>
              )}
              
              {log.error.stack && (
                <details className="mt-2">
                  <summary className="text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                    Stack Trace
                  </summary>
                  <pre className="bg-bg-tertiary p-3 rounded mt-2 text-xs overflow-x-auto">
                    {log.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
