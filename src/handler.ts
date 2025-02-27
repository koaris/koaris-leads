import crypto from 'crypto';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import mailchimp from "@mailchimp/mailchimp_marketing";
import { mailchimpConfig } from './lib/mailchimp';
import nodemailer from "nodemailer";
import { User, validateContactForm } from './utils';

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
        const message: string = payload.message;
        const user: User = payload.user;

        if (!validateContactForm(user).valid) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Error in validation" })
          };
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_RECEIVER) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Google access error" })
          };
        }

        if (optin) {
          const response = await insertContactMailChimp(user)
          console.log(`Inserted to mailchimp`);
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_RECEIVER,
          subject: `Koaris LP - New Contact Message from ${user.firstName}`,
          text: `From: ${user.firstName} (${user.email} - ${user.phone})\n\nMessage:\n${message}`,
        };

        await transporter.sendMail(mailOptions);

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