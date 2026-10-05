/** Types of the lens API contract (same field names as the service; money in cents). */

export type LensStatus = 'ACTIVE' | 'INACTIVE';
export type LensType = 'MONOFOCAL' | 'BIFOCAL' | 'PROGRESSIVE' | 'OCCUPATIONAL';

export interface Lens {
  id: string;
  sku: string;
  brand: string;
  lensType: LensType;
  material: string | null;
  coating: string | null;
  refractiveIndexX100: number | null;
  costCents: number;
  salePriceCents: number;
  stock: number;
  minStock: number;
  lowStock: boolean;
  status: LensStatus;
  createdAt: string;
}

export const LENS_STATUS_LABEL: Record<LensStatus, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };

export const LENS_TYPE_LABEL: Record<LensType, string> = {
  MONOFOCAL: 'Monofocal',
  BIFOCAL: 'Bifocal',
  PROGRESSIVE: 'Progresivo',
  OCCUPATIONAL: 'Ocupacional',
};

/** Refractive index is stored times 100 (e.g. 150 = 1.50); shown to people with two decimals. */
export function formatRefractiveIndex(x100: number | null): string {
  return x100 === null ? '—' : (x100 / 100).toFixed(2);
}
