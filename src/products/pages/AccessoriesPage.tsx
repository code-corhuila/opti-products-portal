import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { accessoriesApi } from '../api/accessoriesApi';
import { CatalogTabs } from '../components/CatalogTabs';
import { formatCents } from '../model/frame';

/** Accessory inventory listing (HU-25), mirroring {@link FramesPage}: search, low-stock filter, bounded pages. */
export function AccessoriesPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => accessoriesApi(shell.api), [shell.api]);
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
      <CatalogTabs />
      <ui.PageHeader
        title="Accesorios"
        subtitle="Estuches, paños de limpieza, cordones y otros accesorios."
        actions={shell.can('ADMIN') ? <Link className="btn" to="new">Nuevo accesorio</Link> : null}
      />
      <div className="toolbar" role="search">
        <ui.TextField id="accessory-search" label="Buscar" type="search" placeholder="SKU o marca" value={text}
          onChange={(value) => { setText(value); update({ page: '' }); }} maxLength={60} />
        <ui.SelectField id="accessory-low-stock" label="Existencia" value={lowStock} placeholder="Todas"
          onChange={(value) => update({ lowStock: value, page: '' })}
          options={[{ value: 'true', label: 'Stock bajo' }, { value: 'false', label: 'Stock normal' }]} />
      </div>
      <ui.DataState
        state={state}
        onRetry={reload}
        isEmpty={(result) => result.data.length === 0}
        emptyTitle="No encontramos accesorios"
        emptyHint={q || lowStock ? 'Prueba con otro término o quita el filtro.' : 'Registra el primero con «Nuevo accesorio».'}
      >
        {(result) => (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th className="num">Precio</th>
                    <th className="num">Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((accessory) => (
                    <tr key={accessory.id}>
                      <td>
                        <Link to={accessory.id}>{accessory.sku}</Link>
                      </td>
                      <td>{accessory.brand ?? '—'}</td>
                      <td>{accessory.category}</td>
                      <td className="num">{formatCents(accessory.salePriceCents)}</td>
                      <td className="num">{accessory.stock}</td>
                      <td>
                        {accessory.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : <ui.Badge tone="success">Normal</ui.Badge>}
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
