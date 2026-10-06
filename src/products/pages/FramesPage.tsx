import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { productsApi } from '../api/productsApi';
import { CatalogTabs } from '../components/CatalogTabs';
import { formatCents } from '../model/frame';

const FRAME_ICON = (
  <>
    <circle cx="6" cy="10" r="3" />
    <circle cx="14" cy="10" r="3" />
    <path d="M9 10h2M3 10 1.5 8M17 10l1.5-2" />
  </>
);

const LOW_STOCK_ICON = (
  <>
    <rect x="3.5" y="4" width="13" height="12" rx="1.5" />
    <path d="M3.5 8h13" />
  </>
);

const OUT_OF_STOCK_ICON = (
  <>
    <path d="M10 2.5 2.5 16.5h15Z" />
    <path d="M10 8.5v3.5M10 14.5h.01" />
  </>
);

const VALUE_ICON = (
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6v8M12.5 8c0-1-1-1.7-2.5-1.7S7.5 7 7.5 8c0 2.3 5 .9 5 3.3 0 1.1-1.1 1.7-2.5 1.7S7.5 12.4 7.5 11.3" />
  </>
);

/** Inventory listing (HU-05, HU-06): search, low-stock filter, four states, bounded pages. */
export function FramesPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const lowStock = (params.get('lowStock') ?? '') as '' | 'true' | 'false';
  const brand = params.get('brand') ?? '';
  const page = Number(params.get('page') ?? '1') || 1;
  const q = ui.useDebounced(text.trim(), 300);

  const { state, reload } = ui.useLoad((signal) => api.list({ q, lowStock, brand, page }, signal), [q, lowStock, brand, page]);
  const { state: summaryState } = ui.useLoad((signal) => api.summary(signal), []);
  const { state: brandsState } = ui.useLoad((signal) => api.brands(signal), []);
  const brandOptions = brandsState.status === 'ready' ? brandsState.data.map((b) => ({ value: b, label: b })) : [];

  function update(next: Record<string, string>): void {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged, { replace: true });
  }

  return (
    <>
      <CatalogTabs />
      <ui.PageHeader
        title="Inventario"
        subtitle="Monturas y su existencia."
        actions={shell.can('ADMIN') ? <Link className="btn" to="new">Nueva montura</Link> : null}
      />
      <div className="summary-grid">
        <ui.DataState state={summaryState} onRetry={() => undefined}>
          {(summary) => (
            <>
              <ui.StatCard icon={FRAME_ICON} tone="primary" label="Total de referencias" value={summary.totalReferences} />
              <ui.StatCard icon={LOW_STOCK_ICON} tone={summary.lowStockCount === 0 ? 'success' : 'warning'}
                label="Stock bajo" value={summary.lowStockCount} />
              <ui.StatCard icon={OUT_OF_STOCK_ICON} tone={summary.outOfStockCount === 0 ? 'success' : 'danger'}
                label="Sin stock" value={summary.outOfStockCount} />
              <ui.StatCard icon={VALUE_ICON} tone="success" label="Valor total del inventario"
                value={formatCents(summary.totalValueCents)}
                hint={summary.recentCount30d > 0 ? `+${summary.recentCount30d} nuevas este mes` : undefined} />
            </>
          )}
        </ui.DataState>
      </div>
      <div className="toolbar" role="search">
        <ui.TextField id="frame-search" label="Buscar" type="search" placeholder="SKU, marca o modelo" value={text}
          onChange={(value) => { setText(value); update({ page: '' }); }} maxLength={60} />
        <ui.SelectField id="frame-low-stock" label="Existencia" value={lowStock} placeholder="Todas"
          onChange={(value) => update({ lowStock: value, page: '' })}
          options={[{ value: 'true', label: 'Stock bajo' }, { value: 'false', label: 'Stock normal' }]} />
        <ui.SelectField id="frame-brand" label="Marca" value={brand} placeholder="Todas"
          onChange={(value) => update({ brand: value, page: '' })} options={brandOptions} />
      </div>
      <ui.DataState
        state={state}
        onRetry={reload}
        isEmpty={(result) => result.data.length === 0}
        emptyTitle="No encontramos monturas"
        emptyHint={q || lowStock ? 'Prueba con otro término o quita el filtro.' : 'Registra la primera con «Nueva montura».'}
      >
        {(result) => (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>SKU</th>
                    <th>Montura</th>
                    <th className="num">Precio</th>
                    <th className="num">Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((frame) => (
                    <tr key={frame.id}>
                      <td>
                        {frame.imageUrl ? (
                          <img src={frame.imageUrl} alt={`${frame.brand} ${frame.model}`}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <span aria-hidden="true" role="img" aria-label="Sin foto"
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '40px', height: '40px', borderRadius: '4px', border: '1px solid var(--border)',
                              color: 'var(--text-soft)', fontSize: '1.1rem',
                            }}>
                            👓
                          </span>
                        )}
                      </td>
                      <td>{frame.sku}</td>
                      <td>
                        <Link to={frame.id}>{frame.brand} {frame.model}</Link>
                      </td>
                      <td className="num">{formatCents(frame.salePriceCents)}</td>
                      <td className="num">{frame.stock}</td>
                      <td>
                        {frame.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : <ui.Badge tone="success">Normal</ui.Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ui.Pager meta={result.meta} onPage={(next) => update({ page: next === 1 ? '' : String(next) })} />
          </>
        )}
      </ui.DataState>
    </>
  );
}
