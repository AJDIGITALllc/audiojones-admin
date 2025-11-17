// UI helpers for handling API errors and permission failures

import { useRouter } from "next/navigation";

export interface ApiError {
  error: string;
  status: number;
}

export function useApiErrorHandler() {
  const router = useRouter();

  return (error: ApiError) => {
    switch (error.status) {
      case 401:
        // Session expired or not authenticated
        router.push("/login");
        break;
      case 403:
        // Permission denied - can be handled by the component
        return "You don't have permission to view this resource.";
      case 400:
        if (error.error.includes("configuration incomplete")) {
          return "Account configuration incomplete. Contact support.";
        }
        return error.error;
      default:
        return "An error occurred. Please try again.";
    }
  };
}

/**
 * Handle fetch errors uniformly
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login on 401
      window.location.href = "/login";
      throw new Error("UNAUTHENTICATED");
    }

    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw {
      error: error.error || "Request failed",
      status: response.status,
    };
  }

  return response.json();
}
