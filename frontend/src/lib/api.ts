const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error instanceof Error ? error : new Error('API request failed');
  }
}
