import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { accessoriesApi } from '../api/accessoriesApi';
import { AccessoryStockEntryForm } from '../components/AccessoryStockEntryForm';
import { formatCents } from '../model/frame';
import { validateMinStock } from '../model/validation';

function MinStockEditor({ shell, accessoryId, current, onSaved }: { shell: ShellContext; accessoryId: string; current: number; onSaved: () => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => accessoriesApi(shell.api), [shell.api]);
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
      await api.updateMinStock(accessoryId, Number(value));
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
      <ui.TextField id="accessory-min-stock-edit" label="Nuevo stock mínimo" inputMode="numeric" value={value} onChange={setValue}
        error={errors.minStock} maxLength={7} />
      <button type="submit" className="btn" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)} disabled={pending}>Cancelar</button>
    </form>
  );
}

/** Accessory record (HU-25), same shape as {@link LensDetailPage}. */
export function AccessoryDetailPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const { id = '' } = useParams();
  const api = useMemo(() => accessoriesApi(shell.api), [shell.api]);
  const [version, setVersion] = useState(0);
  const { state, reload } = ui.useLoad((signal) => api.get(id, signal), [id, version]);

  return (
    <>
      <ui.PageHeader title="Ficha del accesorio" actions={<Link className="btn btn-quiet" to="..">Volver al catálogo</Link>} />
      <ui.DataState state={state} onRetry={reload}>
        {(accessory) => (
          <>
            <section className="card">
              <h2>
                {accessory.brand ?? accessory.category} · {accessory.category} {accessory.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : null}
              </h2>
              <dl className="facts">
                <dt>SKU</dt>
                <dd>{accessory.sku}</dd>
                <dt>Categoría</dt>
                <dd>{accessory.category}</dd>
                <dt>Costo</dt>
                <dd>{formatCents(accessory.costCents)}</dd>
                <dt>Precio de venta</dt>
                <dd>{formatCents(accessory.salePriceCents)}</dd>
                <dt>Stock</dt>
                <dd>{accessory.stock}</dd>
              </dl>
              {shell.can('ADMIN') ? (
                <div className="actions">
                  <MinStockEditor shell={shell} accessoryId={accessory.id} current={accessory.minStock} onSaved={() => setVersion((v) => v + 1)} />
                </div>
              ) : null}
            </section>

            {shell.can('ADMIN') ? (
              <section className="card">
                <h2>Registrar entrada de stock</h2>
                <AccessoryStockEntryForm shell={shell} accessoryId={accessory.id} onSaved={() => setVersion((v) => v + 1)} />
              </section>
            ) : null}
          </>
        )}
      </ui.DataState>
    </>
  );
}
