// Centralized API handler with security headers
export const API_CONFIG = {
  SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '2c2d0e6de2c74806b1fe1a5cc1ee7d5b',
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
};

export const safeFetch = async (url: string, options: RequestInit = {}) => {
  // Garantir que todas as chamadas enviem headers de segurança básicos
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Bloquear status de erro crítico
    if (response.status === 401 || response.status === 403) {
        throw new Error("Acesso negado: Verifique suas credenciais.");
    }
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Security Alert: API Call failed:", error);
    throw error;
  }
};
