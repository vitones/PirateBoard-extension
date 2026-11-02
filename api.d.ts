export function mapApi(data: Record<string, any>, gamertag: string): { parts: any; missing: string[] };
export function readAll(
  fetchFn: (url: string, init: any) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>,
  opts?: { pause?: () => number; timeout?: number; onStep?: (endpoint: string, status: 'lendo' | 'ok' | 'erro') => void },
): Promise<{ data: Record<string, unknown>; error: 'sessao' | 'limite' | 'rede' | 'formato' | null; failed: string[] }>;
export const ENDPOINTS: string[];
