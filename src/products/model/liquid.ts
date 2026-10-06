/** Types of the liquid API contract (same field names as the service; money in cents). */

export type LiquidStatus = 'ACTIVE' | 'INACTIVE';

export interface Liquid {
  id: string;
  sku: string;
  brand: string;
  volumeMl: number;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
  lowStock: boolean;
  status: LiquidStatus;
  createdAt: string;
}

export const LIQUID_STATUS_LABEL: Record<LiquidStatus, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };
