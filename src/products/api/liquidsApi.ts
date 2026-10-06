import type { ApiClient, Page } from '../../shell-contract';
import type { Liquid, LiquidStatus } from '../model/liquid';

export interface LiquidQuery {
  q?: string;
  lowStock?: '' | 'true' | 'false';
  status?: LiquidStatus | '';
  page?: number;
  limit?: number;
}

export interface NewLiquid {
  sku: string;
  brand: string;
  volumeMl: number;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
}

/** Client of the liquid catalogue; same contract shape as the others, kept in its own file. */
export function liquidsApi(api: ApiClient) {
  return {
    list: (query: LiquidQuery, signal?: AbortSignal) =>
      api.get<Page<Liquid>>('/api/v1/liquids', {
        query: { q: query.q, lowStock: query.lowStock, status: query.status, page: query.page, limit: query.limit ?? 10 },
        ...(signal ? { signal } : {}),
      }),

    get: (id: string, signal?: AbortSignal) => api.get<Liquid>(`/api/v1/liquids/${id}`, signal ? { signal } : {}),

    create: (body: NewLiquid, idempotencyKey: string) =>
      api.post<{ id: string }>('/api/v1/liquids', body, { idempotencyKey }),

    updateMinStock: (id: string, minStock: number) => api.put<Liquid>(`/api/v1/liquids/${id}/min-stock`, { minStock }),

    addStock: (id: string, quantity: number, idempotencyKey: string) =>
      api.post<Liquid>(`/api/v1/liquids/${id}/stock-entries`, { quantity }, { idempotencyKey }),
  };
}

export type LiquidsApi = ReturnType<typeof liquidsApi>;
