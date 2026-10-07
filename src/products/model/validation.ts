import { pesosToCents } from './frame';
import type { LensType } from './lens';

export type Errors = Record<string, string>;

const SKU = /^[A-Za-z0-9][A-Za-z0-9._-]{2,59}$/;
const LENS_TYPES: LensType[] = ['MONOFOCAL', 'BIFOCAL', 'PROGRESSIVE', 'OCCUPATIONAL'];

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

export interface LensDraft {
  sku: string;
  brand: string;
  lensType: string;
  material: string;
  coating: string;
  refractiveIndex: string;
  costPesos: string;
  salePricePesos: string;
  stock: string;
  minStock: string;
}

export const EMPTY_LENS: LensDraft = {
  sku: '',
  brand: '',
  lensType: '',
  material: '',
  coating: '',
  refractiveIndex: '',
  costPesos: '',
  salePricePesos: '',
  stock: '0',
  minStock: '0',
};

/** Same rules as HU-05's frame, plus a closed lens type and an optional refractive index (1.00 to 2.00). */
export function validateLens(draft: LensDraft): Errors {
  const errors: Errors = {};
  if (!SKU.test(draft.sku.trim())) {
    errors.sku = 'De 3 a 60 letras, números, puntos, guiones o guion bajo';
  }
  if (!length(draft.brand, 2, 80)) {
    errors.brand = 'La marca es obligatoria (2 a 80 caracteres)';
  }
  if (!LENS_TYPES.includes(draft.lensType as LensType)) {
    errors.lensType = 'Selecciona un tipo de lente';
  }
  if (draft.refractiveIndex.trim() !== '') {
    const index = Number(draft.refractiveIndex.trim());
    if (Number.isNaN(index) || index < 1 || index > 2) {
      errors.refractiveIndex = 'Debe estar entre 1.00 y 2.00';
    }
  }
  const cost = pesosToCents(draft.costPesos);
  if (Number.isNaN(cost) || cost < 0) {
    errors.costPesos = 'Escribe un valor en pesos, por ejemplo 80000';
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

export interface AccessoryDraft {
  sku: string;
  brand: string;
  category: string;
  costPesos: string;
  salePricePesos: string;
  stock: string;
  minStock: string;
}

export const EMPTY_ACCESSORY: AccessoryDraft = {
  sku: '',
  brand: '',
  category: '',
  costPesos: '',
  salePricePesos: '',
  stock: '0',
  minStock: '0',
};

/** category is free text (2 to 60 chars), brand is optional (HU-25). */
export function validateAccessory(draft: AccessoryDraft): Errors {
  const errors: Errors = {};
  if (!SKU.test(draft.sku.trim())) {
    errors.sku = 'De 3 a 60 letras, números, puntos, guiones o guion bajo';
  }
  if (!length(draft.category, 2, 60)) {
    errors.category = 'La categoría es obligatoria (2 a 60 caracteres)';
  }
  const cost = pesosToCents(draft.costPesos);
  if (Number.isNaN(cost) || cost < 0) {
    errors.costPesos = 'Escribe un valor en pesos, por ejemplo 5000';
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

export interface LiquidDraft {
  sku: string;
  brand: string;
  volumeMl: string;
  costPesos: string;
  salePricePesos: string;
  stock: string;
  minStock: string;
}

export const EMPTY_LIQUID: LiquidDraft = {
  sku: '',
  brand: '',
  volumeMl: '',
  costPesos: '',
  salePricePesos: '',
  stock: '0',
  minStock: '0',
};

/** volumeMl is the container size in millilitres, between 1 and 5000 (HU-25). */
export function validateLiquid(draft: LiquidDraft): Errors {
  const errors: Errors = {};
  if (!SKU.test(draft.sku.trim())) {
    errors.sku = 'De 3 a 60 letras, números, puntos, guiones o guion bajo';
  }
  if (!length(draft.brand, 2, 80)) {
    errors.brand = 'La marca es obligatoria (2 a 80 caracteres)';
  }
  if (integerBetween(draft.volumeMl, 1, 5_000) === undefined) {
    errors.volumeMl = 'El volumen debe ser un número entero entre 1 y 5000 ml';
  }
  const cost = pesosToCents(draft.costPesos);
  if (Number.isNaN(cost) || cost < 0) {
    errors.costPesos = 'Escribe un valor en pesos, por ejemplo 3000';
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
