const API_BASE = import.meta.env.VITE_API_URL ?? "";

function resolveUrl(url: string): string {
  if (API_BASE && url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return url;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export class SubscriptionRequiredError extends Error {
  constructor(public billingStatus: string) {
    super("Subscription required");
    this.name = "SubscriptionRequiredError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Please sign in again to view account details.");
    this.name = "AuthenticationRequiredError";
  }
}

function handleSubscriptionRequired(billingStatus: string): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  if (currentPath === "/account") return;

  const redirectUrl = `/account?reason=subscription&from=${encodeURIComponent(currentPath)}`;
  window.location.href = redirectUrl;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveUrl(url), {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }));

    if (response.status === 402) {
      const billingStatus = errorData.billingStatus || "inactive";
      handleSubscriptionRequired(billingStatus);
      throw new SubscriptionRequiredError(billingStatus);
    }

    if (response.status === 401) {
      throw new Error("Unable to complete request. Please sign in again.");
    }

    if (response.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }

    throw new Error(errorData.error || "Request failed. Please try again.");
  }

  return response.json();
}
