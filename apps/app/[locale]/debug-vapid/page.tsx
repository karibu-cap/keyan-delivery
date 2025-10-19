
'use client';

export default function DebugVapid() {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🔍 Debug VAPID Configuration</h1>

            <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold mb-2">VAPID Public Key:</h2>
                    <code className="text-xs break-all">
                        {vapidKey || '❌ NOT FOUND'}
                    </code>
                </div>

                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold mb-2">Service Worker Support:</h2>
                    <p>{typeof window !== 'undefined' && 'serviceWorker' in navigator ? '✅ Supported' : '❌ Not Supported'}</p>
                </div>

                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold mb-2">Notification Support:</h2>
                    <p>{typeof window !== 'undefined' && 'Notification' in window ? '✅ Supported' : '❌ Not Supported'}</p>
                </div>

                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold mb-2">Notification Permission:</h2>
                    <p>{typeof window !== 'undefined' && Notification.permission}</p>
                </div>

                <button
                    onClick={async () => {
                        if ('serviceWorker' in navigator) {
                            const registration = await navigator.serviceWorker.getRegistration();
                            alert(registration ? '✅ SW Registered' : '❌ SW Not Registered');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Check Service Worker Registration
                </button>

                <button
                    onClick={async () => {
                        if ('serviceWorker' in navigator) {
                            const registration = await navigator.serviceWorker.ready;
                            const subscription = await registration.pushManager.getSubscription();
                            alert(subscription ? '✅ Subscribed' : '❌ Not Subscribed');
                        }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded ml-2"
                >
                    Check Push Subscription
                </button>
            </div>
        </div>
    );
}