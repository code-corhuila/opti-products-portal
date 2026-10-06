import type { ApiClient, Page } from '../../shell-contract';
import type { Accessory, AccessoryStatus } from '../model/accessory';

export interface AccessoryQuery {
  q?: string;
  lowStock?: '' | 'true' | 'false';
  status?: AccessoryStatus | '';
  category?: string;
  page?: number;
  limit?: number;
}

export interface NewAccessory {
  sku: string;
  brand: string | null;
  category: string;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
}

/** Client of the accessory catalogue; same contract shape as the others, kept in its own file. */
export function accessoriesApi(api: ApiClient) {
  return {
    list: (query: AccessoryQuery, signal?: AbortSignal) =>
      api.get<Page<Accessory>>('/api/v1/accessories', {
        query: {
          q: query.q, lowStock: query.lowStock, status: query.status, category: query.category,
          page: query.page, limit: query.limit ?? 10,
        },
        ...(signal ? { signal } : {}),
      }),

    get: (id: string, signal?: AbortSignal) => api.get<Accessory>(`/api/v1/accessories/${id}`, signal ? { signal } : {}),

    create: (body: NewAccessory, idempotencyKey: string) =>
      api.post<{ id: string }>('/api/v1/accessories', body, { idempotencyKey }),

    updateMinStock: (id: string, minStock: number) => api.put<Accessory>(`/api/v1/accessories/${id}/min-stock`, { minStock }),

    addStock: (id: string, quantity: number, idempotencyKey: string) =>
      api.post<Accessory>(`/api/v1/accessories/${id}/stock-entries`, { quantity }, { idempotencyKey }),
  };
}

export type AccessoriesApi = ReturnType<typeof accessoriesApi>;
