import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { liquidsApi } from '../api/liquidsApi';
import { CatalogTabs } from '../components/CatalogTabs';
import { formatCents } from '../model/frame';

/** Liquid inventory listing (HU-25), mirroring {@link FramesPage}: search, low-stock filter, bounded pages. */
export function LiquidsPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => liquidsApi(shell.api), [shell.api]);
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
        title="Líquidos"
        subtitle="Limpiadores de lentes, soluciones y otros líquidos por tamaño de envase."
        actions={shell.can('ADMIN') ? <Link className="btn" to="new">Nuevo líquido</Link> : null}
      />
      <div className="toolbar" role="search">
        <ui.TextField id="liquid-search" label="Buscar" type="search" placeholder="SKU o marca" value={text}
          onChange={(value) => { setText(value); update({ page: '' }); }} maxLength={60} />
        <ui.SelectField id="liquid-low-stock" label="Existencia" value={lowStock} placeholder="Todas"
          onChange={(value) => update({ lowStock: value, page: '' })}
          options={[{ value: 'true', label: 'Stock bajo' }, { value: 'false', label: 'Stock normal' }]} />
      </div>
      <ui.DataState
        state={state}
        onRetry={reload}
        isEmpty={(result) => result.data.length === 0}
        emptyTitle="No encontramos líquidos"
        emptyHint={q || lowStock ? 'Prueba con otro término o quita el filtro.' : 'Registra el primero con «Nuevo líquido».'}
      >
        {(result) => (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Marca</th>
                    <th className="num">Volumen</th>
                    <th className="num">Precio</th>
                    <th className="num">Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((liquid) => (
                    <tr key={liquid.id}>
                      <td>
                        <Link to={liquid.id}>{liquid.sku}</Link>
                      </td>
                      <td>{liquid.brand}</td>
                      <td className="num">{liquid.volumeMl} ml</td>
                      <td className="num">{formatCents(liquid.salePriceCents)}</td>
                      <td className="num">{liquid.stock}</td>
                      <td>
                        {liquid.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : <ui.Badge tone="success">Normal</ui.Badge>}
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
