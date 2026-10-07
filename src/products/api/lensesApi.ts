import type { ApiClient, Page } from '../../shell-contract';
import type { Lens, LensStatus } from '../model/lens';

export interface LensQuery {
  q?: string;
  lowStock?: '' | 'true' | 'false';
  status?: LensStatus | '';
  page?: number;
  limit?: number;
}

export interface NewLens {
  sku: string;
  brand: string;
  lensType: string;
  material: string | null;
  coating: string | null;
  refractiveIndexX100: number | null;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
}

/** Client of the lens catalogue; same contract shape as {@link productsApi}, kept in its own file
 * since the lens resource (no photo, no movement ledger yet) does not share request/response
 * shapes with frames. */
export function lensesApi(api: ApiClient) {
  return {
    list: (query: LensQuery, signal?: AbortSignal) =>
      api.get<Page<Lens>>('/api/v1/lenses', {
        query: { q: query.q, lowStock: query.lowStock, status: query.status, page: query.page, limit: query.limit ?? 10 },
        ...(signal ? { signal } : {}),
      }),

    get: (id: string, signal?: AbortSignal) => api.get<Lens>(`/api/v1/lenses/${id}`, signal ? { signal } : {}),

    create: (body: NewLens, idempotencyKey: string) =>
      api.post<{ id: string }>('/api/v1/lenses', body, { idempotencyKey }),

    updateMinStock: (id: string, minStock: number) => api.put<Lens>(`/api/v1/lenses/${id}/min-stock`, { minStock }),

    addStock: (id: string, quantity: number, idempotencyKey: string) =>
      api.post<Lens>(`/api/v1/lenses/${id}/stock-entries`, { quantity }, { idempotencyKey }),
  };
}

export type LensesApi = ReturnType<typeof lensesApi>;
