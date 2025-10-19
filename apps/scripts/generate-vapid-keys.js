
import { generateVAPIDKeys } from 'web-push';

const vapidKeys = generateVAPIDKeys();

console.info('\n🔐 VAPID Keys generated successfully!\n');
console.info('Copy these values into your .env.local file:\n');
console.info('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.info('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);