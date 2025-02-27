// Generate key for local tests
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const webhookSecret = process.env.WEBHOOK_SECRET;
const body = '{"optin": true, "type": "touch", "user": {"firstName": "Joe", "lastName": "Doe", "phone": "11911234567", "email": "joe.doe@test.com", "souce": "Koaris LP - Contacts", "country": "BR"}}';

let hmac = crypto.createHmac('sha256', webhookSecret);
let signature = hmac.update(body).digest('hex');

console.log(signature);