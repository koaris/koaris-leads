# Introduction
A Webhook application using AWS Lambda to forward contact requests to Google and Mailchimp!
## Deploy
To deploy serverless
```bash
serverless deploy
```
To see serverless informations
```bash
serverless info
```
To undeploy
```bash
serverless remove
```
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