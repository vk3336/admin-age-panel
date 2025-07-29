// Read env variables at the top level
const API_KEY_NAME = process.env.NEXT_PUBLIC_API_KEY_NAME;
const API_KEY_VALUE = process.env.NEXT_PUBLIC_API_SECRET_KEY;
const SUPER_ADMIN_HEADER_NAME = process.env.NEXT_PUBLIC_Role_Management_Key;
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_Role_Management_Key_Value;

// Get base URL based on environment
const getBaseUrl = () => {
  // In browser, use relative URL (handled by Next.js proxy in development)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // In server-side rendering, use absolute URL from environment
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Convert input to URL object if it's a string
    let url = typeof input === 'string' ? input : input.toString();
    
    // Prepend base URL if the URL is relative
    if (url.startsWith('/')) {
      const baseUrl = getBaseUrl();
      // Ensure we don't create double slashes
      const separator = baseUrl.endsWith('/') ? '' : '/';
      url = `${baseUrl}${separator}${url.replace(/^\/+/, '')}`;
    }
    
    console.log('API Request:', { url, method: init?.method || 'GET' });
    
    let headers: Headers | undefined = undefined;
    const isFormData = init?.body instanceof FormData;
    headers = new Headers(init?.headers);
    
    // Set default headers
    if (!headers.has('Content-Type') && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add authentication headers if needed
    const isRoleApi = url.includes('/api/roles');
    if (isRoleApi) {
        if (SUPER_ADMIN_HEADER_NAME && SUPER_ADMIN_EMAIL) {
            headers.append(SUPER_ADMIN_HEADER_NAME, SUPER_ADMIN_EMAIL);
        }
    } else {
        if (API_KEY_NAME && API_KEY_VALUE) {
            headers.append(API_KEY_NAME, API_KEY_VALUE);
        }
    }

    // If FormData, remove Content-Type so browser sets it, but keep auth headers
    if (isFormData && headers.has('Content-Type')) {
        headers.delete('Content-Type');
    }

    const updatedOptions = {
        ...init,
        headers,
    };

    try {
      const response = await fetch(url, updatedOptions);
      
      // Log response details for debugging
      console.log('API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response;
      }
      
      // If not JSON, read the response as text to see what we got
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 500));
      
      // If the response is HTML, it's likely an error page
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Received HTML response. Check your API endpoint (${url}). The server might be returning an error page.`);
      }
      
      // For non-JSON responses, return the original response
      return responseClone;
    } catch (error) {
      console.error('API Request Failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
};

export default apiFetch; 