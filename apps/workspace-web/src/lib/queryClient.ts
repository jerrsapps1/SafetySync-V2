import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function resolveUrl(url: string): string {
  if (API_BASE && url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return url;
}

function handleSubscriptionRequired(): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  if (currentPath === "/account") return;

  const redirectUrl = `/account?reason=subscription&from=${encodeURIComponent(currentPath)}`;
  window.location.href = redirectUrl;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 402) {
      handleSubscriptionRequired();
      throw new Error("Subscription required");
    }

    if (res.status === 401) {
      throw new Error("Unable to complete request. Please sign in again.");
    }

    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }

    const text = (await res.text()) || res.statusText;
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || "Request failed. Please try again.");
    } catch {
      throw new Error("Request failed. Please try again.");
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(resolveUrl(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = queryKey.join("/") as string;
    const res = await fetch(resolveUrl(url), {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
