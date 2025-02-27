import crypto from 'crypto';

let webhookSecret = crypto.randomBytes(32).toString('base64');
console.log(webhookSecret)