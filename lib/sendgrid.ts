/*
<ai_context>
Contains the SendGrid client configuration for sending emails in the app.
</ai_context>
*/

import sgMail from "@sendgrid/mail"

// Initialize SendGrid client with API key from environment variables
const apiKey = process.env.SENDGRID_API_KEY

if (apiKey) {
  sgMail.setApiKey(apiKey)
} else {
  console.warn("SendGrid API key not found in environment variables")
}

export { sgMail }
