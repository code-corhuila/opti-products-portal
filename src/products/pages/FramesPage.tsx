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
  const page = Number(params.get('page') ?? '1') || 1;
  const q = ui.useDebounced(text.trim(), 300);

  const { state, reload } = ui.useLoad((signal) => api.list({ q, lowStock, page }, signal), [q, lowStock, page]);

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
      <div className="toolbar" role="search">
        <ui.TextField id="frame-search" label="Buscar" type="search" placeholder="SKU, marca o modelo" value={text}
          onChange={(value) => { setText(value); update({ page: '' }); }} maxLength={60} />
        <ui.SelectField id="frame-low-stock" label="Existencia" value={lowStock} placeholder="Todas"
          onChange={(value) => update({ lowStock: value, page: '' })}
          options={[{ value: 'true', label: 'Stock bajo' }, { value: 'false', label: 'Stock normal' }]} />
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
