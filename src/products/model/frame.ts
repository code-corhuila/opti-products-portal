/** Types of the products API contract (same field names as the service; money in cents). */

export type FrameStatus = 'ACTIVE' | 'INACTIVE';
export type MovementType = 'ENTRY' | 'EXIT' | 'RETURN';

export interface Frame {
  id: string;
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
  lowStock: boolean;
  location: string | null;
  supplier: string | null;
  status: FrameStatus;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  frameId: string;
  type: MovementType;
  quantity: number;
  reference: string | null;
  reason: string | null;
  createdAt: string;
}

export const STATUS_LABEL: Record<FrameStatus, string> = { ACTIVE: 'Activa', INACTIVE: 'Inactiva' };
export const MOVEMENT_LABEL: Record<MovementType, string> = { ENTRY: 'Entrada', EXIT: 'Salida', RETURN: 'Devolución' };

/** Cents to a "$ 123.456" string, with thousands separators, no decimals (money has no fractional cents here). */
export function formatCents(cents: number): string {
  return `$ ${Math.round(cents / 100).toLocaleString('es-CO')}`;
}

/**
 * Reads the pesos a person typed and returns cents, WITHOUT multiplying a float (0.07 * 100 is not 7):
 * it parses the integer and decimal parts as text and combines them.
 */
export function pesosToCents(text: string): number {
  const cleaned = text.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return Number.NaN;
  }
  const [pesos, decimals = ''] = cleaned.split('.');
  const centsPart = (decimals + '00').slice(0, 2);
  return Number(pesos) * 100 + Number(centsPart);
}

export function centsToPesosInput(cents: number): string {
  return String(Math.round(cents / 100));
}
