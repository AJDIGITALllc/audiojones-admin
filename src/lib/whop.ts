// Whop API integration helpers
// No SDK dependency yet - using fetch with env vars

import { logWarn } from "./logging";

export interface WhopProduct {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  url?: string;
}

/**
 * Get Whop API configuration from environment
 */
function getWhopConfig() {
  const baseUrl = process.env.WHOP_API_BASE_URL;
  const apiKey = process.env.WHOP_API_KEY;

  if (!baseUrl || !apiKey) {
    logWarn("Whop API credentials not configured", {
      hasBaseUrl: !!baseUrl,
      hasApiKey: !!apiKey,
    });
    return null;
  }

  return { baseUrl, apiKey };
}

/**
 * Fetch a single Whop product by ID
 * Returns null if product not found or API not configured
 */
export async function fetchWhopProduct(
  productId: string
): Promise<WhopProduct | null> {
  const config = getWhopConfig();
  if (!config) return null;

  try {
    const response = await fetch(`${config.baseUrl}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      logWarn(`Whop API error fetching product ${productId}`, {
        status: response.status,
      });
      return null;
    }

    const data = await response.json();
    
    // Map Whop API response to our WhopProduct interface
    // Adjust mapping based on actual Whop API response structure
    return {
      id: data.id,
      name: data.name || data.title,
      priceCents: data.price_cents || data.amount || 0,
      currency: data.currency || "USD",
      url: data.checkout_url || data.url,
    };
  } catch (error) {
    logWarn(`Failed to fetch Whop product ${productId}`, {
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * List all Whop products
 * Returns empty array if API not configured
 */
export async function listWhopProducts(): Promise<WhopProduct[]> {
  const config = getWhopConfig();
  if (!config) return [];

  try {
    const response = await fetch(`${config.baseUrl}/products`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      logWarn("Whop API error listing products", {
        status: response.status,
      });
      return [];
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products || [];

    return products.map((item: any) => ({
      id: item.id,
      name: item.name || item.title,
      priceCents: item.price_cents || item.amount || 0,
      currency: item.currency || "USD",
      url: item.checkout_url || item.url,
    }));
  } catch (error) {
    logWarn("Failed to list Whop products", {
      error: (error as Error).message,
    });
    return [];
  }
}
