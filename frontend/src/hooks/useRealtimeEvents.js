import { useEffect, useRef } from 'react';
import { createWebSocketClient } from '../lib/realtimeClient';
import { useAccount } from 'wagmi';

/**
 * Hook for subscribing to real-time events
 * @param {Object} options
 * @param {string[]} options.channels - List of channels to subscribe to
 * @param {Function} options.onMessage - Callback for incoming messages
 * @param {boolean} options.enabled - Whether to connect
 */
export function useRealtimeEvents({ channels = [], onMessage, enabled = true } = {}) {
    const { address } = useAccount();
    const clientRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        // Create client if not exists (using a dummy room ID initially, or global)
        // We use 'system:global' as the default room to ensure connection
        const client = createWebSocketClient('system:global', {});
        clientRef.current = client;

        const handleConnect = () => {
            // Subscribe to requested channels
            channels.forEach(channel => {
                client.subscribe(channel);
            });

            // Subscribe to user-specific channel if logged in
            if (address) {
                client.subscribe(`user:${address.toLowerCase()}`);
            }
        };

        const handleMessage = (data) => {
            if (onMessage) {
                onMessage(data);
            }
        };

        client.on('connect', handleConnect);
        client.on('message', handleMessage);

        // Also listen for specific event types if needed
        // client.on('task_updated', (data) => ...);

        client.connect().catch(console.error);

        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        };
    }, [JSON.stringify(channels), address, enabled]); // Re-connect if channels change

    return clientRef.current;
}
