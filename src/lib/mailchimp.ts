import dotenv from "dotenv";
dotenv.config();

export const mailchimpConfig = {
  apiKey: process.env.MAILCHIMP_SECRET,
  server: "us14"
}
