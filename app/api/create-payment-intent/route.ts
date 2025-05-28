import { NextResponse } from "next/server"
import { stripe, formatAmountForStripe } from "@/features/payments/services/stripe"

export async function POST(request: Request) {
  try {
    const { amount, userId, tokenAmount } = await request.json()

    // Validate the request
    if (!amount || amount <= 0 || !userId || !tokenAmount) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Create a payment intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: "usd",
      // Store metadata about the purchase
      metadata: {
        userId,
        tokenAmount: tokenAmount.toString(),
        type: "token_purchase",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Error creating payment intent" }, { status: 500 })
  }
}
