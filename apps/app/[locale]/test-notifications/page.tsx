'use client';

import { useState } from 'react';

export default function TestNotifications() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const testDirectNotification = async () => {
        addLog('Testing direct notification...');
        try {
            const notification = new Notification('Test Direct', {
                body: 'This is a direct notification from the page',
            });
            addLog('✅ Direct notification created');

            notification.onclick = () => {
                addLog('Notification clicked!');
            };
        } catch (error) {
            addLog(`❌ Error: ${error}`);
        }
    };

    const testSWNotification = async () => {
        addLog('Testing SW notification...');
        try {
            const registration = await navigator.serviceWorker.ready;
            addLog('SW is ready');
            addLog(`Registration object: ${JSON.stringify({
                scope: registration.scope,
                active: !!registration.active,
            })}`);

            addLog('Calling showNotification...');
            const result = await registration.showNotification('Test SW', {
                tag: 'test-' + Date.now(),
                icon: '/icons/ios/192.png',
                badge: '/icons/ios/72.png',
                lang: 'sw',
            });

            addLog(`showNotification returned: ${result}`);
            addLog('✅ SW notification displayed!');
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            addLog(`Error name: ${error.name}`);
            addLog(`Error stack: ${error.stack}`);
            console.error('Full error:', error);
        }
    };

    const testPushSimulation = async () => {
        addLog('Simulating push notification...');
        try {
            const registration = await navigator.serviceWorker.ready;

            // Envoyer un message au SW pour simuler un push
            if (registration.active) {
                registration.active.postMessage({
                    type: 'TEST_PUSH',
                    payload: {
                        title: 'Simulated Push',
                        body: 'This simulates a real push notification',
                    }
                });
                addLog('✅ Push simulation sent to SW');
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        }
    };

    const checkPermission = () => {
        const permission = Notification.permission;
        addLog(`Current permission: ${permission}`);

        if (permission === 'granted') {
            addLog('✅ Notifications are allowed');
        } else if (permission === 'denied') {
            addLog('❌ Notifications are blocked - Check browser settings');
        } else {
            addLog('⚠️ Permission not yet requested');
        }
    };

    const requestPermission = async () => {
        addLog('Requesting notification permission...');
        try {
            const permission = await Notification.requestPermission();
            addLog(`Permission result: ${permission}`);
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        }
    };

    const checkSWStatus = async () => {
        addLog('Checking Service Worker status...');

        if (!('serviceWorker' in navigator)) {
            addLog('❌ Service Workers not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();

            if (!registration) {
                addLog('❌ No Service Worker registered');
                return;
            }

            addLog('✅ Service Worker registered');
            addLog(`   Scope: ${registration.scope}`);
            addLog(`   Active: ${!!registration.active}`);
            addLog(`   Installing: ${!!registration.installing}`);
            addLog(`   Waiting: ${!!registration.waiting}`);

            if (registration.active) {
                addLog(`   SW State: ${registration.active.state}`);
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔔 Test Notifications</h1>

            <div className="space-y-4 mb-8">
                <button
                    onClick={checkPermission}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    1. Check Permission
                </button>

                <button
                    onClick={requestPermission}
                    className="w-full px-4 py-3 bg-primary text-white rounded hover:bg-primary"
                >
                    2. Request Permission
                </button>

                <button
                    onClick={checkSWStatus}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    3. Check Service Worker Status
                </button>

                <button
                    onClick={testDirectNotification}
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                    4. Test Direct Notification (from page)
                </button>

                <button
                    onClick={testSWNotification}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    5. Test SW Notification
                </button>

                <button
                    onClick={testPushSimulation}
                    className="w-full px-4 py-3 bg-pink-600 text-white rounded hover:bg-pink-700"
                >
                    6. Test Push Simulation
                </button>
            </div>

            <div className="bg-gray-900 text-primary/40 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                <div className="font-bold mb-2">Console Logs:</div>
                {logs.length === 0 ? (
                    <div className="text-gray-500">No logs yet...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))
                )}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-bold mb-2">📋 Instructions:</h3>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                    <li>Click &quot;Check Permission&quot; - should show &quot;granted&quot;</li>
                    <li>Click &quot;Check Service Worker Status&quot; - should show &quot;Active: true&quot;</li>
                    <li>Click &quot;Test Direct Notification&ldquo; - notification should appear</li>
                    <li>Click &quot;Test SW Notification&quot; - notification should appear</li>
                    <li>If any test fails, check the error message in the logs</li>
                </ol>
            </div>
        </div>
    );
}