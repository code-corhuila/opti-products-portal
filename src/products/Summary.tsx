import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Page, ShellContext } from '../shell-contract';
import { productsApi } from './api/productsApi';
import type { Frame } from './model/frame';

/** The card of this domain in the dashboard (HU-12): frames with low stock. */
export default function Summary({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const { state, reload } = ui.useLoad<Page<Frame>>((signal) => api.list({ lowStock: 'true', limit: 1 }, signal), []);
  return (
    <div className="summary-card">
      <h2>Stock bajo</h2>
      <ui.DataState state={state} onRetry={reload}>
        {(page) => (
          <>
            <div className={page.meta.total === 0 ? 'metric calm' : 'metric'}>{page.meta.total}</div>
            <p>{page.meta.total === 0 ? 'Todo el inventario está en niveles normales.' : 'monturas por debajo de su mínimo.'}</p>
            {page.meta.total > 0 ? <Link to="/products?lowStock=true">Ver inventario</Link> : null}
          </>
        )}
      </ui.DataState>
    </div>
  );
}
