import type { ApiClient, Page } from '../../shell-contract';
import type { Frame, FrameStatus, FrameSummary, StockMovement } from '../model/frame';

export interface FrameQuery {
  q?: string;
  lowStock?: '' | 'true' | 'false';
  status?: FrameStatus | '';
  brand?: string;
  page?: number;
  limit?: number;
}

export interface NewFrame {
  sku: string;
  brand: string;
  model: string;
  color: string | null;
  material: string | null;
  gender: string | null;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
  location: string | null;
  supplier: string | null;
}

export function productsApi(api: ApiClient) {
  return {
    list: (query: FrameQuery, signal?: AbortSignal) =>
      api.get<Page<Frame>>('/api/v1/frames', {
        query: {
          q: query.q, lowStock: query.lowStock, status: query.status, brand: query.brand, page: query.page,
          limit: query.limit ?? 10,
        },
        ...(signal ? { signal } : {}),
      }),

    get: (id: string, signal?: AbortSignal) => api.get<Frame>(`/api/v1/frames/${id}`, signal ? { signal } : {}),

    summary: (signal?: AbortSignal) => api.get<FrameSummary>('/api/v1/frames/summary', signal ? { signal } : {}),

    brands: (signal?: AbortSignal) => api.get<string[]>('/api/v1/frames/brands', signal ? { signal } : {}),

    create: (body: NewFrame, idempotencyKey: string) =>
      api.post<{ id: string }>('/api/v1/frames', body, { idempotencyKey }),

    updateMinStock: (id: string, minStock: number) => api.put<Frame>(`/api/v1/frames/${id}/min-stock`, { minStock }),

    addStock: (id: string, quantity: number, reason: string | null, idempotencyKey: string) =>
      api.post<{ id: string }>(`/api/v1/frames/${id}/stock-entries`, { quantity, reason }, { idempotencyKey }),

    movements: (id: string, page: number, signal?: AbortSignal) =>
      api.get<Page<StockMovement>>(`/api/v1/frames/${id}/movements`, { query: { page, limit: 5 }, ...(signal ? { signal } : {}) }),

    /** Uploads the frame's photo (HU-16) as multipart/form-data. */
    uploadImage: (id: string, file: File) => {
      const body = new FormData();
      body.append('file', file);
      return api.post<Frame>(`/api/v1/frames/${id}/image`, body);
    },
  };
}

export type ProductsApi = ReturnType<typeof productsApi>;
