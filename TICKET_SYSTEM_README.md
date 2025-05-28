# DJ AI Platform Ticket System

This document provides an overview of the ticket system implementation for the DJ AI Platform.

## Overview

The ticket system allows users to purchase tickets for events using Stripe as the payment processor. The system includes:

- Ticket purchase flow with Stripe Checkout
- Ticket management for users
- Webhook handling for payment processing
- Database schema for storing ticket information

## Setup Instructions

### 1. Environment Variables

Ensure the following environment variables (in our chat) are in this project

### 2. Database Setup

Run the SQL migration script in `migrations/create_tables.sql` against your Neon PostgreSQL database to create the necessary tables.

### 3. Stripe Webhook Configuration

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-deployed-url.vercel.app/api/webhook`
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret and add it as the `STRIPE_WEBHOOK_SECRET` environment variable

## How It Works

### Ticket Purchase Flow

1. User selects an event and ticket type
2. User clicks "Checkout" to initiate the purchase
3. The application creates a Stripe Checkout session
4. User completes payment on the Stripe-hosted checkout page
5. Upon successful payment, the user is redirected to the success page
6. Stripe sends a webhook event to the application
7. The webhook handler creates ticket records in the database

### Ticket Management

Users can view their purchased tickets in the "My Tickets" section of the application. Each ticket includes:

- Event details
- Ticket type
- Purchase date
- Ticket code (for entry verification)
- Status (active, used, cancelled, refunded)

## Testing

To test the ticket purchase flow:

1. Use Stripe test cards (e.g., 4242 4242 4242 4242) for payments
2. Check the Stripe Dashboard for payment events
3. Verify that tickets are created in the database
4. Test the webhook using the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

## Troubleshooting

- Check Stripe Dashboard for payment status and logs
- Verify webhook events are being received
- Check application logs for errors
- Ensure all environment variables are correctly set
