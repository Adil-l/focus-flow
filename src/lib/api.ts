// Centralized API handler with security headers
export const API_CONFIG = {
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
};

export const safeFetch = async (url: string, options: RequestInit = {}) => {
  // Configurar headers base
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Só adicionar Content-Type se houver corpo na requisição ou se não for GET
  if (options.body || (options.method && options.method !== 'GET')) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Bloquear status de erro crítico
    if (response.status === 401 || response.status === 403) {
        throw new Error("Acesso negado: Verifique suas credenciais.");
    }
    
    if (!response.ok) {
        // Tentar extrair erro do JSON, senão usar statusText
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
            // Se não for JSON, ignorar
        }
        throw new Error(errorMsg);
    }
    
    return await response.json();
  } catch (error) {
    // Logar apenas o essencial para evitar ruído no console se for erro de rede esperado
    if (error instanceof TypeError && error.message === 'Load failed') {
        console.warn("Network: Falha na conexão com o servidor. Verifique sua internet ou CORS.");
    } else {
        console.error("API Call failed:", error);
    }
    throw error;
  }
};

/**
 * Chama uma Edge Function do Supabase de forma segura e padronizada.
 */
export const invokeEdgeFunction = async (functionName: string, params: Record<string, string> = {}) => {
  if (!API_CONFIG.SUPABASE_URL || !API_CONFIG.SUPABASE_ANON_KEY) {
    throw new Error("Configuração do Supabase ausente.");
  }

  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_CONFIG.SUPABASE_URL}/functions/v1/${functionName}${queryParams ? `?${queryParams}` : ''}`;

  return safeFetch(url, {
    headers: {
      'apikey': API_CONFIG.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
    }
  });
};
