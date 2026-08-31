// Client HTTP centralisé avec gestion des en-têtes Multi-Tenant, JWT et Idempotence
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export interface ApiRequestOptions extends RequestInit {
  idempotencyKey?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { idempotencyKey, params, headers: customHeaders, ...restOptions } = options;

  // 1. Construction de l'URL avec paramètres de requête (Query Params)
  let url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 2. Préparation des en-têtes d'authentification et de tenant
  const token = localStorage.getItem('digicouture_jwt_token');
  const atelierId = localStorage.getItem('digicouture_atelier_id') || 'atl-1787175204484';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Atelier-Id': atelierId,
    ...(customHeaders as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }

  // 3. Exécution de la requête HTTP
  const response = await fetch(url, {
    headers,
    ...restOptions
  });

  // 4. Traitement uniforme des réponses et des erreurs métiers (SSOT)
  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Erreur HTTP ${response.status}`;
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.code = data?.error || 'HTTP_ERROR';
    error.data = data;
    throw error;
  }

  return data as T;
}
