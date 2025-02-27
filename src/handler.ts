import crypto from 'crypto';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import mailchimp from "@mailchimp/mailchimp_marketing";
import { mailchimpConfig } from './lib/mailchimp';

type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  souce?: string;
  country?: string;
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Webhook secret is not defined');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not set' })
    };
  }

  if (!verifySignature(event, webhookSecret)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const eventType: string = payload.type;

    switch (eventType) {
      case 'touch': {
        const optin: string = payload.optin;

        if (optin) {
          const user: User = payload.user;
          const response = await insertContactMailChimp(user)
          console.log(`Inserted to mailchimp`);
        }

        break;
      }

      default:
        console.log(`Received unhandled event type: ${eventType}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON payload' })
      };
    }

    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

const verifySignature = (event: APIGatewayEvent, webhookSecret: string): boolean => {
  try {
    const signature = event.headers['x-webhook-signature'];

    if (!signature) {
      console.log('No signature found in headers:', event.headers);
      return false;
    }

    const body = event.body || '';
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const expectedSignature = hmac.update(body).digest('hex');

    const isValid = signature === expectedSignature;
    if (!isValid) {
      console.log(`Invalid signature. Received: ${signature}, Expected: ${expectedSignature}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error during signature verification:', error);
    return false;
  }
};

async function insertContactMailChimp(user: User) {
  const audienceId = process.env.AUDIENCE_ID || '';

  mailchimp.setConfig(mailchimpConfig);

  const response = await mailchimp.lists.addListMember(audienceId, {
    email_address: user.email,
    status: "subscribed",
    merge_fields: {
      FNAME: user.firstName,
      LNAME: user.lastName,
      PHONE: user.phone,
      SOURCE: user.souce,
      COUNTRY: user.country,
    },
  });

  return response
}