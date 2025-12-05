import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, Plus } from 'lucide-react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { createRoom as createEdenlayerRoom, getRoomMessages as getEdenlayerMessages, listRooms as listEdenlayerRooms } from '../lib/edenlayer';
import { createWebSocketClient } from '../lib/realtimeClient';
import { getChatRooms, createChatRoom, getRoomMessages, sendMessage } from '../lib/api';
import useThemeStore from '../store/theme';
import { cn } from '../utils/cn';

/**
 * Chat/Rooms Page
 * Real-time communication with agents via Edenlayer rooms
 */
export default function Chat() {
  const { initTheme } = useThemeStore();
  const { address } = useAccount();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const messagesEndRef = useRef(null);
  const wsClientRef = useRef(null);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (address) {
      loadRooms();
    }
  }, [address]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      connectWebSocket(selectedRoom.id);
    }

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRooms = async () => {
    if (!address) return;

    try {
      setLoading(true);

      // Load rooms from backend database only
      const backendResponse = await getChatRooms(address);

      if (backendResponse.success && backendResponse.rooms) {
        setRooms(backendResponse.rooms);

        if (backendResponse.rooms.length > 0 && !selectedRoom) {
          setSelectedRoom(backendResponse.rooms[0]);
        }
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      // Load messages from backend database
      const backendResponse = await getRoomMessages(roomId, { limit: 50 });

      if (backendResponse.success && backendResponse.messages) {
        setMessages(backendResponse.messages);
      } else {
        // Fallback to Edenlayer
        const edenlayerMessages = await getEdenlayerMessages(roomId, { limit: 50 });
        setMessages(edenlayerMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const connectWebSocket = (roomId) => {
    // Get API key from env or session
    const apiKey = import.meta.env.VITE_EDENLAYER_API_KEY;

    const wsClient = createWebSocketClient(roomId, { apiKey });

    wsClient.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    wsClient.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    wsClient.connect().catch(error => {
      console.error('Failed to connect WebSocket:', error);
    });

    wsClientRef.current = wsClient;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !address) return;

    try {
      // Send via API (which triggers WebSocket event)
      // wsClientRef.current.sendMessage(newMessage);

      // Also save to backend database for persistence
      if (selectedRoom) {
        await sendMessage(selectedRoom.id, {
          content: newMessage,
          sender: address,
          messageType: 'text'
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !address) return;

    try {
      // Create room in backend database only (no Edenlayer for regular chat)
      const backendResponse = await createChatRoom({
        name: newRoomName,
        description: 'User-created chat room',
        type: 'CHAT',
        private: false,
        maxParticipants: 10,
        participants: [address]
      });

      if (backendResponse.success) {
        const room = backendResponse.room;
        setRooms(prev => [room, ...prev]);
        setSelectedRoom(room);
        setShowCreateRoom(false);
        setNewRoomName('');
      } else {
        throw new Error(backendResponse.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert(`Failed to create room: ${error.message}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white dark:text-brand-black" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
            Chat Rooms
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time communication with AI agents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Room List */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-brand-black dark:text-white">
                Rooms
              </h2>
              <Button
                onClick={() => setShowCreateRoom(true)}
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                New
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center text-brand-gray py-8">Loading...</div>
              ) : rooms.length === 0 ? (
                <div className="text-center text-brand-gray py-8">
                  No rooms available
                </div>
              ) : (
                rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-colors',
                      selectedRoom?.id === room.id
                        ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                        : 'bg-brand-light dark:bg-gray-800 text-brand-black dark:text-white hover:bg-brand-gray dark:hover:bg-gray-700'
                    )}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm opacity-75 flex items-center gap-2 mt-1">
                      <Users className="w-3 h-3" />
                      {room.participantCount || 0} participants
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-9">
          {selectedRoom ? (
            <Card className="h-full flex flex-col">
              {/* Room Header */}
              <div className="border-b border-brand-light dark:border-brand-dark pb-4 mb-4">
                <h2 className="font-display font-bold text-xl text-brand-black dark:text-white">
                  {selectedRoom.name}
                </h2>
                <p className="text-sm text-brand-gray">
                  {selectedRoom.description || 'Chat with agents'}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-brand-gray py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex',
                        (msg.user?.address?.toLowerCase() === address?.toLowerCase() || msg.sender === address)
                          ? 'justify-end'
                          : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-lg p-3',
                          (msg.user?.address?.toLowerCase() === address?.toLowerCase() || msg.sender === address)
                            ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                            : 'bg-brand-light dark:bg-gray-800 text-brand-black dark:text-white'
                        )}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {msg.user?.displayName || msg.sender?.name || 'Unknown'}
                        </div>
                        <div>{msg.content}</div>
                        <div className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-brand-light dark:border-brand-dark rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
                <Button
                  onClick={handleSendMessage}
                  variant="primary"
                  icon={<Send className="w-5 h-5" />}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-brand-gray">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a room to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full m-4">
            <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-4">
              Create New Room
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Agent Discussion"
                  className="w-full px-4 py-2 border border-brand-light dark:border-brand-dark rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowCreateRoom(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  variant="primary"
                  disabled={!newRoomName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
