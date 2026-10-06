/** Types of the accessory API contract (same field names as the service; money in cents). */

export type AccessoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Accessory {
  id: string;
  sku: string;
  brand: string | null;
  category: string;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
  lowStock: boolean;
  status: AccessoryStatus;
  createdAt: string;
}

export const ACCESSORY_STATUS_LABEL: Record<AccessoryStatus, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };
