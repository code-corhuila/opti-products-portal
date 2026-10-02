import { pesosToCents } from './frame';

export type Errors = Record<string, string>;

const SKU = /^[A-Za-z0-9][A-Za-z0-9._-]{2,59}$/;

export interface FrameDraft {
  sku: string;
  brand: string;
  model: string;
  color: string;
  material: string;
  gender: string;
  costPesos: string;
  salePricePesos: string;
  stock: string;
  minStock: string;
  location: string;
  supplier: string;
}

export const EMPTY_FRAME: FrameDraft = {
  sku: '',
  brand: '',
  model: '',
  color: '',
  material: '',
  gender: '',
  costPesos: '',
  salePricePesos: '',
  stock: '0',
  minStock: '0',
  location: '',
  supplier: '',
};

function length(value: string, min: number, max: number): boolean {
  const size = value.trim().length;
  return size >= min && size <= max;
}

function integerBetween(text: string, min: number, max: number): number | undefined {
  if (!/^\d+$/.test(text.trim())) {
    return undefined;
  }
  const value = Number(text.trim());
  return value >= min && value <= max ? value : undefined;
}

/** HU-05: SKU único, stock ≥ 0, sale_price ≥ cost. */
export function validateFrame(draft: FrameDraft): Errors {
  const errors: Errors = {};
  if (!SKU.test(draft.sku.trim())) {
    errors.sku = 'De 3 a 60 letras, números, puntos, guiones o guion bajo';
  }
  if (!length(draft.brand, 2, 80)) {
    errors.brand = 'La marca es obligatoria (2 a 80 caracteres)';
  }
  if (!length(draft.model, 1, 80)) {
    errors.model = 'El modelo es obligatorio';
  }
  const cost = pesosToCents(draft.costPesos);
  if (Number.isNaN(cost) || cost < 0) {
    errors.costPesos = 'Escribe un valor en pesos, por ejemplo 310000';
  }
  const price = pesosToCents(draft.salePricePesos);
  if (Number.isNaN(price) || price < 0) {
    errors.salePricePesos = 'Escribe un valor en pesos';
  } else if (!Number.isNaN(cost) && price < cost) {
    errors.salePricePesos = 'El precio de venta debe ser mayor o igual al costo';
  }
  if (integerBetween(draft.stock, 0, 1_000_000) === undefined) {
    errors.stock = 'El stock debe ser un número entero, 0 o mayor';
  }
  if (integerBetween(draft.minStock, 0, 1_000_000) === undefined) {
    errors.minStock = 'El stock mínimo debe ser un número entero, 0 o mayor';
  }
  return errors;
}

export function validateStockEntry(quantityText: string): Errors {
  const errors: Errors = {};
  if (integerBetween(quantityText, 1, 1_000_000) === undefined) {
    errors.quantity = 'La cantidad debe ser un número entero mayor que 0';
  }
  return errors;
}

export function validateMinStock(text: string): Errors {
  const errors: Errors = {};
  if (integerBetween(text, 0, 1_000_000) === undefined) {
    errors.minStock = 'Debe ser un número entero, 0 o mayor';
  }
  return errors;
}
