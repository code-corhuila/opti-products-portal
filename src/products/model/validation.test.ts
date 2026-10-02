import { describe, expect, it } from 'vitest';
import { centsToPesosInput, formatCents, pesosToCents } from './frame';
import { EMPTY_FRAME, validateFrame, validateMinStock, validateStockEntry, type FrameDraft } from './validation';

const valid: FrameDraft = {
  ...EMPTY_FRAME,
  sku: 'RB5228-2000',
  brand: 'Ray-Ban',
  model: 'RB5228',
  costPesos: '310000',
  salePricePesos: '520000',
  stock: '8',
  minStock: '2',
};

describe('money: pesos typed by a person, never a float multiplication', () => {
  it('parses pesos with thousands dots and comma decimals into cents', () => {
    expect(pesosToCents('310.000')).toBe(31_000_000);
    expect(pesosToCents('0,07')).toBe(7);
    expect(pesosToCents('100')).toBe(10_000);
    expect(pesosToCents('abc')).toBeNaN();
    expect(pesosToCents('')).toBeNaN();
  });

  it('round-trips cents back to a plain peso string', () => {
    expect(centsToPesosInput(31_000_000)).toBe('310000');
  });

  it('formats cents with a peso sign and thousands separators', () => {
    expect(formatCents(52_000_000)).toBe('$ 520.000');
  });
});

describe('frame validation (HU-05)', () => {
  it('accepts a valid frame', () => {
    expect(validateFrame(valid)).toEqual({});
  });

  it('names every invalid field at once', () => {
    const errors = validateFrame({ ...valid, sku: 'x', brand: ' ', model: '', costPesos: 'abc', stock: '-1', minStock: 'x' });
    expect(Object.keys(errors).sort()).toEqual(['brand', 'costPesos', 'minStock', 'model', 'sku', 'stock']);
  });

  it('rejects a sale price below cost', () => {
    expect(validateFrame({ ...valid, costPesos: '150000', salePricePesos: '120000' }).salePricePesos).toBeDefined();
  });

  it('rejects negative stock', () => {
    expect(validateFrame({ ...valid, stock: '-3' }).stock).toBeDefined();
  });
});

describe('stock operations', () => {
  it('a stock entry needs a positive integer quantity', () => {
    expect(validateStockEntry('5')).toEqual({});
    expect(validateStockEntry('0').quantity).toBeDefined();
    expect(validateStockEntry('-1').quantity).toBeDefined();
    expect(validateStockEntry('1.5').quantity).toBeDefined();
  });

  it('the minimum stock must be zero or a positive integer', () => {
    expect(validateMinStock('0')).toEqual({});
    expect(validateMinStock('-1').minStock).toBeDefined();
  });
});
