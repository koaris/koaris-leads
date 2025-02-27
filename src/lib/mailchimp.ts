import Mailchimp from "mailchimp-api-v3";
import dotenv from 'dotenv';

dotenv.config();

export const mailchimpAPI = new Mailchimp(process.env.MAILCHIMP_SECRET || '');