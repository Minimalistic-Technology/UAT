// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables.");
}

/**
 * Centralized fetch function for API calls.
 * Works in both development and production environments.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[apiFetch] Calling: ${url}`, {
        method: options.method,
        body: options.body ? JSON.parse(options.body as string) : null
    });

    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    console.log("response: ", response);

    if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.text();
            if (errorBody) {
                errorMessage += ` - ${errorBody}`;
            }
        } catch (e) {
            // Ignore if body can't be read
        }
        throw new Error(errorMessage);
    }

    return response.json();
}
