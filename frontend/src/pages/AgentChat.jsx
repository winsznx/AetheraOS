import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import PaymentModal from '../components/PaymentModal';
import { getChatRooms, createChatRoom, getRoomMessages, sendMessage } from '../lib/api';
import useThemeStore from '../store/theme';
import { cn } from '../utils/cn';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'https://aetheraos-autonomous-agent.timjosh507.workers.dev';

/**
 * Agent Chat Page
 * Talk to the Autonomous Agent that orchestrates ChainIntel MCP
 */
export default function AgentChat() {
  const { initTheme } = useThemeStore();
  const { address } = useAccount();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [plan, setPlan] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [agentRoomId, setAgentRoomId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Load chat history from backend when wallet connects
  useEffect(() => {
    if (address) {
      loadChatHistory();
    } else {
      // Show welcome message if not connected
      setMessages([{
        role: 'agent',
        content: "Hi! I'm your blockchain intelligence agent. I can analyze wallets, detect whales, track smart money, and more!\n\nTry asking:\n• \"Analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4\"\n• \"Find whale wallets on Base\"\n• \"Is wallet 0xABC a smart money trader?\"\n• \"What's the risk score for wallet 0xDEF?\"",
        timestamp: new Date().toISOString()
      }]);
      setLoadingHistory(false);
    }
  }, [address]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Load chat history from backend database
   */
  const loadChatHistory = async () => {
    if (!address) return;

    setLoadingHistory(true);
    try {
      // Get or create agent chat room for this user
      const roomsResponse = await getChatRooms(address);

      let agentRoom = null;

      if (roomsResponse.success && roomsResponse.rooms) {
        // Find existing agent chat room
        agentRoom = roomsResponse.rooms.find(r => r.type === 'AGENT');
      }

      // Create room if it doesn't exist
      if (!agentRoom) {
        const createResponse = await createChatRoom({
          name: `AI Agent Chat - ${address.slice(0, 6)}...${address.slice(-4)}`,
          description: 'Autonomous AI Agent conversations',
          type: 'AGENT',
          private: true,
          participants: [address]
        });

        if (createResponse.success) {
          agentRoom = createResponse.room;
        }
      }

      if (agentRoom) {
        setAgentRoomId(agentRoom.id);

        // Load message history
        const messagesResponse = await getRoomMessages(agentRoom.id, { limit: 100 });

        if (messagesResponse.success && messagesResponse.messages && messagesResponse.messages.length > 0) {
          // Convert backend messages to chat format
          const chatMessages = messagesResponse.messages.map(msg => ({
            role: msg.sender === address ? 'user' : 'agent',
            content: msg.content,
            timestamp: msg.createdAt,
            metadata: msg.metadata
          }));

          setMessages(chatMessages);
        } else {
          // Show welcome message for new conversations
          setMessages([{
            role: 'agent',
            content: "Hi! I'm your blockchain intelligence agent. I can analyze wallets, detect whales, track smart money, and more!\n\nTry asking:\n• \"Analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4\"\n• \"Find whale wallets on Base\"\n• \"Is wallet 0xABC a smart money trader?\"\n• \"What's the risk score for wallet 0xDEF?\"",
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Show welcome message on error
      setMessages([{
        role: 'agent',
        content: "Hi! I'm your blockchain intelligence agent. Connect your wallet to save conversation history!",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Save message to backend database
   */
  const saveMessageToBackend = async (role, content, metadata = null) => {
    if (!address || !agentRoomId) return;

    try {
      await sendMessage(agentRoomId, {
        content: content,
        sender: role === 'user' ? address : 'AGENT',
        messageType: 'text',
        metadata: metadata
      });
    } catch (error) {
      console.error('Failed to save message to backend:', error);
      // Don't throw - message is already shown in UI
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setCurrentQuery(userQuery);
    setInput('');
    setLoading(true);
    setPlan(null);
    setShowPlan(false);

    // Save user message to backend
    await saveMessageToBackend('user', userQuery);

    try {
      // STEP 1: Get execution plan first (don't execute yet!)
      const response = await fetch(`${AGENT_URL}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      const result = await response.json();

      // Handle error responses
      if (!response.ok || !result.plan) {
        const errorMsg = result.error || response.statusText || 'Failed to create plan';

        setMessages(prev => [...prev, {
          role: 'agent',
          content: errorMsg,
          timestamp: new Date().toISOString(),
          isError: true
        }]);

        setLoading(false);
        return;
      }

      // STEP 2: Show plan in sidebar and payment modal
      const planData = result.plan;
      setPlan(planData);
      setCurrentPlan(planData);
      setShowPlan(true);
      setLoading(false);

      // Show plan message to user
      const planMessage = `I've created a plan to answer your question:\n\n${planData.reasoning}\n\n**Total cost: ${planData.totalCost} ETH**\n**Steps: ${planData.steps.length}**\n\nClick "Pay & Execute" to approve payment and run the analysis.`;

      setMessages(prev => [...prev, {
        role: 'agent',
        content: planMessage,
        timestamp: new Date().toISOString(),
        isPlan: true
      }]);

      await saveMessageToBackend('agent', planMessage, { plan: planData });

      // STEP 3: Open payment modal
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Agent error:', error);
      const errorMessage = `Sorry, I encountered an error: ${error.message}\n\nPlease make sure the agent is running at ${AGENT_URL}`;

      setMessages(prev => [...prev, {
        role: 'agent',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        isError: true
      }]);

      // Save error to backend too
      await saveMessageToBackend('agent', errorMessage, { error: true });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle payment approval - execute plan with user's payment proof
   */
  const handlePaymentApproved = async (paymentProof) => {
    setShowPaymentModal(false);
    setLoading(true);

    try {
      // Show payment confirmation message
      setMessages(prev => [...prev, {
        role: 'agent',
        content: `✅ Payment confirmed! Transaction: ${paymentProof.transactionHash.slice(0, 10)}...\n\nExecuting your query now...`,
        timestamp: new Date().toISOString()
      }]);

      // STEP 4: Execute plan with user's payment proof
      const executeResponse = await fetch(`${AGENT_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentPlan,
          paymentProof: paymentProof
        })
      });

      const result = await executeResponse.json();

      if (!executeResponse.ok || !result.success) {
        const errorMsg = result.report || result.error || 'Execution failed';

        setMessages(prev => [...prev, {
          role: 'agent',
          content: errorMsg,
          timestamp: new Date().toISOString(),
          isError: true
        }]);

        setLoading(false);
        return;
      }

      // Show results
      if (result.report) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: result.report,
          timestamp: new Date().toISOString(),
          metadata: result.metadata
        }]);

        await saveMessageToBackend('agent', result.report, result.metadata);
      }

    } catch (error) {
      console.error('Execution error:', error);

      setMessages(prev => [...prev, {
        role: 'agent',
        content: `Execution failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (message) => {
    // Simple markdown-like formatting
    let formatted = message.content;

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points
    formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');

    // Numbered lists
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li value="$1">$2</li>');

    // Wrap lists
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1">$1</ul>');
    }

    // Code blocks
    formatted = formatted.replace(/```(.*?)```/gs, '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-x-auto"><code>$1</code></pre>');

    return formatted;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
            <Brain className="w-6 h-6 text-white dark:text-brand-black" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
              AI Agent Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by Claude 3.5 + ChainIntel MCP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Chat Area */}
          <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg p-4',
                      msg.role === 'user'
                        ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                        : msg.isError
                          ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-700'
                          : msg.isPlan
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-brand-black dark:text-white'
                    )}
                  >
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg) }}
                    />

                    {msg.metadata && (
                      <div className="text-xs opacity-75 mt-3 pt-3 border-t border-current">
                        Cost: {msg.metadata.totalCost} ETH • Time: {(msg.metadata.executionTime / 1000).toFixed(2)}s
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">Agent is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about wallets, whales, trading patterns..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white disabled:opacity-50"
                />
                <Button
                  onClick={handleSend}
                  variant="primary"
                  icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  disabled={!input.trim() || loading}
                >
                  Send
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Be specific about which wallet or chain you want to analyze
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Current Plan */}
        <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 overflow-y-auto space-y-6">
          <Card>
            <h2 className="font-display font-bold text-lg text-brand-black dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Current Plan
            </h2>

            {plan ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Intent
                  </div>
                  <div className="text-brand-black dark:text-white">
                    {plan.intent}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Steps ({plan.steps.length})
                  </div>
                  <div className="space-y-2">
                    {plan.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-brand-black dark:text-white">
                              {step.tool}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {step.reason}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Cost
                    </span>
                    <span className="text-lg font-bold text-brand-black dark:text-white">
                      {plan.totalCost}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Ask a question to see the agent's plan
                </p>
              </div>
            )}
          </Card>

          {/* Example Queries */}
          <Card>
            <h2 className="font-display font-bold text-lg text-brand-black dark:text-white mb-4">
              Example Queries
            </h2>

            <div className="space-y-2">
              {[
                "Analyze wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
                "Find whale wallets on Base",
                "Is wallet 0xABC worth copying?",
                "What's the risk score for 0xDEF?",
                "Show me smart money traders"
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(example)}
                  disabled={loading}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-brand-black dark:text-white transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </Card>
        </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        plan={currentPlan}
        onApprove={handlePaymentApproved}
        onCancel={() => setShowPaymentModal(false)}
        isOpen={showPaymentModal}
      />
    </DashboardLayout>
  );
}
