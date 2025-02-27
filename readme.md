## Test
Run the new server
```bash
serverless offline
```
Run the new key
```bash
npm run key
```
Send a Test Event
```bash
curl -X POST http://localhost:3000/dev/webhook \
     -H "x-webhook-signature: aaaaa" \
     -H "Content-Type: application/json" \
     -d '{"type": "payment.success", "orderId": "12345"}'
```