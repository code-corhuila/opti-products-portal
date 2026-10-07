import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { productsApi } from '../api/productsApi';
import { StockEntryForm } from '../components/StockEntryForm';
import { FramePhoto, FramePhotoEditor } from '../components/FramePhoto';
import { formatCents, MOVEMENT_LABEL } from '../model/frame';
import { validateMinStock } from '../model/validation';

function MinStockEditor({ shell, frameId, current, onSaved }: { shell: ShellContext; frameId: string; current: number; onSaved: () => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
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
      await api.updateMinStock(frameId, Number(value));
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
      <ui.TextField id="min-stock" label="Nuevo stock mínimo" inputMode="numeric" value={value} onChange={setValue}
        error={errors.minStock} maxLength={7} />
      <button type="submit" className="btn" disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)} disabled={pending}>Cancelar</button>
    </form>
  );
}

/** Frame record with its ledger of movements (HU-05, HU-06). */
export function FrameDetailPage({ shell }: { shell: ShellContext }): ReactNode {
  const { ui } = shell;
  const { id = '' } = useParams();
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const [version, setVersion] = useState(0);
  const [movementPage, setMovementPage] = useState(1);
  const { state, reload } = ui.useLoad((signal) => api.get(id, signal), [id, version]);
  const movements = ui.useLoad((signal) => api.movements(id, movementPage, signal), [id, movementPage, version]);

  return (
    <>
      <ui.PageHeader title="Ficha de la montura" actions={<Link className="btn btn-quiet" to="..">Volver a inventario</Link>} />
      <ui.DataState state={state} onRetry={reload}>
        {(frame) => (
          <>
            <section className="card">
              <h2>
                {frame.brand} {frame.model} {frame.lowStock ? <ui.Badge tone="warning">Stock bajo</ui.Badge> : null}
              </h2>
              <FramePhoto url={frame.imageUrl} label={`${frame.brand} ${frame.model}`} large version={version} />
              {frame.imageUrl ? <p><a href={`${frame.imageUrl}?v=${version}`} target="_blank" rel="noreferrer">Ver foto completa</a></p> : null}
              {shell.can('ADMIN') ? <FramePhotoEditor shell={shell} frameId={frame.id} onSaved={() => setVersion((v) => v + 1)} /> : null}
              <dl className="facts">
                <dt>SKU</dt>
                <dd>{frame.sku}</dd>
                <dt>Costo</dt>
                <dd>{formatCents(frame.costCents)}</dd>
                <dt>Precio de venta</dt>
                <dd>{formatCents(frame.salePriceCents)}</dd>
                <dt>Stock</dt>
                <dd>{frame.stock}</dd>
                <dt>Ubicación</dt>
                <dd>{frame.location ?? '—'}</dd>
                <dt>Proveedor</dt>
                <dd>{frame.supplier ?? '—'}</dd>
              </dl>
              {shell.can('ADMIN') ? (
                <div className="actions">
                  <MinStockEditor shell={shell} frameId={frame.id} current={frame.minStock} onSaved={() => setVersion((v) => v + 1)} />
                </div>
              ) : null}
            </section>

            {shell.can('ADMIN') ? (
              <section className="card">
                <h2>Registrar entrada de stock</h2>
                <StockEntryForm shell={shell} frameId={frame.id} onSaved={() => setVersion((v) => v + 1)} />
              </section>
            ) : null}

            <section className="card">
              <h2>Movimientos de stock</h2>
              <ui.DataState state={movements.state} onRetry={movements.reload} isEmpty={(r) => r.data.length === 0}
                emptyTitle="Sin movimientos todavía">
                {(result) => (
                  <>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Fecha</th><th>Tipo</th><th className="num">Cantidad</th><th>Motivo</th></tr>
                        </thead>
                        <tbody>
                          {result.data.map((movement) => (
                            <tr key={movement.id}>
                              <td>{new Date(movement.createdAt).toLocaleString('es-CO')}</td>
                              <td>{MOVEMENT_LABEL[movement.type]}</td>
                              <td className="num">{movement.quantity}</td>
                              <td>{movement.reason ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ui.Pager meta={result.meta} onPage={setMovementPage} />
                  </>
                )}
              </ui.DataState>
            </section>
          </>
        )}
      </ui.DataState>
    </>
  );
}
