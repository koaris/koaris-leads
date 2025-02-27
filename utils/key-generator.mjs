import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// generate a payload signed
const webhookSecret = process.env.WEBHOOK_SECRET;
const body = '{"type": "payment.success", "orderId": "12345"}';

let hmac = crypto.createHmac('sha256', webhookSecret);
let signature = hmac.update(body).digest('hex');

console.log(signature);