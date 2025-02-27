// Generate key for local tests
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const webhookSecret = process.env.WEBHOOK_SECRET;
const body = '{"optin": true, "type": "touch", "message": "Olá, tudo bem? Gostaria de saber se está tudo bem. Tomou água e tem feito exercícios regularmente? Me avisa, att.", "user": {"firstName": "Joe", "lastName": "Doe", "phone": "11911234567", "email": "joe.doe@suamaeaquelaursa.com", "souce": "Koaris LP - Contacts", "country": "BR"}}';

let hmac = crypto.createHmac('sha256', webhookSecret);
let signature = hmac.update(body).digest('hex');

console.log(signature);