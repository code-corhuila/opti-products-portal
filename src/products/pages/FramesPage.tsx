import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { productsApi } from '../api/productsApi';
import { formatCents } from '../model/frame';

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
      <ui.PageHeader
        title="Inventario"
        subtitle="Monturas y su existencia."
        actions={shell.can('ADMIN') ? <Link className="btn" to="new">Nueva montura</Link> : null}
      />
      <div className="summary-grid">
        <div className="summary-card">
          <h2>Total de referencias</h2>
          <ui.DataState state={summaryState} onRetry={() => undefined}>
            {(summary) => <div className="metric">{summary.totalReferences}</div>}
          </ui.DataState>
        </div>
        <div className="summary-card">
          <h2>Stock bajo</h2>
          <ui.DataState state={summaryState} onRetry={() => undefined}>
            {(summary) => (
              <div className={summary.lowStockCount === 0 ? 'metric calm' : 'metric'}>{summary.lowStockCount}</div>
            )}
          </ui.DataState>
        </div>
        <div className="summary-card">
          <h2>Sin stock</h2>
          <ui.DataState state={summaryState} onRetry={() => undefined}>
            {(summary) => (
              <div className={summary.outOfStockCount === 0 ? 'metric calm' : 'metric'}>{summary.outOfStockCount}</div>
            )}
          </ui.DataState>
        </div>
        <div className="summary-card">
          <h2>Valor total del inventario</h2>
          <ui.DataState state={summaryState} onRetry={() => undefined}>
            {(summary) => (
              <>
                <div className="metric">{formatCents(summary.totalValueCents)}</div>
                {summary.recentCount30d > 0 ? <p>+{summary.recentCount30d} nuevas este mes</p> : null}
              </>
            )}
          </ui.DataState>
        </div>
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
