// Generate key for local tests
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const webhookSecret = process.env.WEBHOOK_SECRET;
const body = '{"optin": true, "type": "lead", "user": {"FirstName": "Joe", "LastName": "Doe", "Phone": "11911234567", "Email": "joe.doe@test.com", "Source": "Koaris LP - Contacts"}}';

let hmac = crypto.createHmac('sha256', webhookSecret);
let signature = hmac.update(body).digest('hex');

console.log(signature);