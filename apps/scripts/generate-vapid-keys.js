
import { generateVAPIDKeys } from 'web-push';
import fs from 'fs';

const vapidKeys = generateVAPIDKeys();

console.info('\n🔐 VAPID Keys generated successfully!\n');


const envData = `
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
NEXT_PUBLIC_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

fs.writeFileSync('.env', envData, { flag: 'w' });