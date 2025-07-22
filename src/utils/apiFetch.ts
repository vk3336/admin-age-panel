// Read env variables at the top level
const API_KEY_NAME = process.env.NEXT_PUBLIC_API_KEY_NAME;
const API_KEY_VALUE = process.env.NEXT_PUBLIC_API_SECRET_KEY;
const SUPER_ADMIN_HEADER_NAME = process.env.NEXT_PUBLIC_SUPER_ADMIN_HEADER_NAME;
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    let headers: Headers | undefined = undefined;
// removed redundant declaration; see below for const assignment

    const isFormData = init?.body instanceof FormData;
    headers = new Headers(init?.headers);
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

    return fetch(input, updatedOptions);
};

export default apiFetch; 