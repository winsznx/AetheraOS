import { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Trash2 } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { cn } from '../../utils/cn';

/**
 * Agent Logs Component
 * Real-time agent execution logs display
 *
 * @param {string} agentId - Agent ID
 * @param {boolean} autoScroll - Auto-scroll to bottom on new logs
 */
export default function AgentLogs({ agentId, autoScroll = true }) {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Mock log data
  useEffect(() => {
    // Simulate initial logs
    const initialLogs = [
      { timestamp: Date.now() - 5000, level: 'info', message: 'Agent initialized' },
      { timestamp: Date.now() - 4000, level: 'info', message: 'Connected to Edenlayer registry' },
      { timestamp: Date.now() - 3000, level: 'success', message: 'Listening for tasks...' }
    ];
    setLogs(initialLogs);

    // Simulate new logs every few seconds
    const interval = setInterval(() => {
      const newLog = {
        timestamp: Date.now(),
        level: Math.random() > 0.8 ? 'error' : Math.random() > 0.5 ? 'success' : 'info',
        message: getRandomLogMessage()
      };
      setLogs(prev => [...prev, newLog]);
    }, 3000);

    return () => clearInterval(interval);
  }, [agentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleDownload = () => {
    const content = logs.map(log =>
      `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agentId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setLogs([]);
  };

  const levelColors = {
    info: 'text-gray-400 dark:text-gray-300',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400'
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Agent Logs
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({logs.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 dark:bg-black rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs available
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-gray-500 text-xs shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn('font-bold shrink-0', levelColors[log.level])}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper function to generate random log messages
function getRandomLogMessage() {
  const messages = [
    'Polling for new tasks...',
    'Task discovered: task-12345',
    'Evaluating task requirements',
    'Claiming task from escrow contract',
    'Executing task with Claude API',
    'Generating work proof',
    'Uploading to IPFS: QmXyz...',
    'Submitting work to contract',
    'Waiting for verification',
    'Payment received: 0.05 ETH',
    'Updating reputation score',
    'Status: Ready for next task'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
