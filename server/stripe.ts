import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_NOT_CONFIGURED");
    }
    stripeClient = new Stripe(key, { apiVersion: "2025-01-27.acacia" as any });
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export interface PlanInfo {
  planKey: string;
  name: string;
  priceId: string;
  interval: string;
  currency: string;
  displayPrice: string;
  features: string[];
}

export function getPlansFromEnv(): PlanInfo[] {
  const plans: PlanInfo[] = [];

  const proPriceId = process.env.STRIPE_PRICE_PRO;
  if (proPriceId) {
    plans.push({
      planKey: "pro",
      name: "Pro",
      priceId: proPriceId,
      interval: "month",
      currency: "usd",
      displayPrice: "",
      features: [
        "Up to 100 employees",
        "Unlimited training records",
        "Compliance dashboard",
        "Priority support",
      ],
    });
  }

  const enterprisePriceId = process.env.STRIPE_PRICE_ENTERPRISE;
  if (enterprisePriceId) {
    plans.push({
      planKey: "enterprise",
      name: "Enterprise",
      priceId: enterprisePriceId,
      interval: "month",
      currency: "usd",
      displayPrice: "",
      features: [
        "Unlimited employees",
        "Unlimited training records",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
      ],
    });
  }

  return plans;
}

export async function getOrCreateStripeCustomer(
  companyId: string,
  existingStripeId: string | null,
  companyName: string,
  email: string,
): Promise<string> {
  const stripe = getStripe();

  if (existingStripeId) {
    return existingStripeId;
  }

  const customer = await stripe.customers.create({
    name: companyName,
    email,
    metadata: { companyId },
  });

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session.url!;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
