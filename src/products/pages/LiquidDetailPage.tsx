import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { liquidsApi } from '../api/liquidsApi';
import { LiquidStockEntryForm } from '../components/LiquidStockEntryForm';
import { formatCents } from '../model/frame';
import { validateMinStock } from '../model/validation';

function MinStockEditor({ shell, liquidId, current, onSaved }: { shell: ShellContext; liquidId: string; current: number; onSaved: () => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => liquidsApi(shell.api), [shell.api]);
  const [value, setValue] = useState(String(current));
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const errors = attempted ? validateMinStock(value) : {};

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    setFailure(null);
    if (pending || Object.keys(validateMinStock(value)).length > 0) {
      return;
    }
    setPending(true);
    try {
      await api.updateMinStock(liquidId, Number(value));
      shell.notify('Stock mínimo actualizado', 'success');
      setEditing(false);
      onSaved();
    } catch (error) {
      setFailure((error as { info?: { userMessage: string } }).info?.userMessage ?? 'No se pudo guardar.');
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <button type="button" className="btn btn-quiet" onClick={() => setEditing(true)}>
        Cambiar stock mínimo ({current})
      </button>
    );
  }
  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="toolbar" aria-label="Cambiar stock mínimo">
      {failure ? <ui.Banner kind="error">{failure}</ui.Banner> : null}
      <ui.TextField id="liquid-min-stock-edit" label="Nuevo stock mínimo" inputMode="numeric" value={value} onChange={setValue}
        error={errors.minStock} maxLength={7} />
      <button type="submit" className="btn" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)} disabled={pending}>Cancelar</button>
    </form>
  );
}

/** Liquid record (HU-25), same shape as {@link LensDetailPage}. */
export function LiquidDetailPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const { id = '' } = useParams();
  const api = useMemo(() => liquidsApi(shell.api), [shell.api]);
  const [version, setVersion] = useState(0);
  const { state, reload } = ui.useLoad((signal) => api.get(id, signal), [id, version]);

  return (
    <>
      <ui.PageHeader title="Ficha del líquido" actions={<Link className="btn btn-quiet" to="/products/liquids">Volver al catálogo</Link>} />
      <ui.DataState state={state} onRetry={reload}>
        {(liquid) => (
          <>
            <section className="card">
              <h2>
                {liquid.brand} · {liquid.volumeMl} ml {liquid.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : null}
              </h2>
              <dl className="facts">
                <dt>SKU</dt>
                <dd>{liquid.sku}</dd>
                <dt>Volumen</dt>
                <dd>{liquid.volumeMl} ml</dd>
                <dt>Costo</dt>
                <dd>{formatCents(liquid.costCents)}</dd>
                <dt>Precio de venta</dt>
                <dd>{formatCents(liquid.salePriceCents)}</dd>
                <dt>Stock</dt>
                <dd>{liquid.stock}</dd>
              </dl>
              {shell.can('ADMIN') ? (
                <div className="actions">
                  <MinStockEditor shell={shell} liquidId={liquid.id} current={liquid.minStock} onSaved={() => setVersion((v) => v + 1)} />
                </div>
              ) : null}
            </section>

            {shell.can('ADMIN') ? (
              <section className="card">
                <h2>Registrar entrada de stock</h2>
                <LiquidStockEntryForm shell={shell} liquidId={liquid.id} onSaved={() => setVersion((v) => v + 1)} />
              </section>
            ) : null}
          </>
        )}
      </ui.DataState>
    </>
  );
}
