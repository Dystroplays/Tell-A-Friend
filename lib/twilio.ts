/*
<ai_context>
Contains the Twilio client configuration for sending SMS messages in the app.
</ai_context>
*/

import twilio from "twilio"

// Initialize Twilio client with credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

// Only create client if credentials are available
let twilioClient: twilio.Twilio | null = null

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken)
} else {
  console.warn("Twilio credentials not found in environment variables")
}

export { twilioClient }
