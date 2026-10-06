import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { liquidsApi } from '../api/liquidsApi';
import { validateStockEntry } from '../model/validation';

/** Registers a supplier entry against a liquid; same idempotency guarantee as the other forms. */
export function LiquidStockEntryForm({ shell, liquidId, onSaved }: { shell: ShellContext; liquidId: string; onSaved: () => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => liquidsApi(shell.api), [shell.api]);
  const [quantity, setQuantity] = useState('');
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateStockEntry(quantity);
  const { submit, pending, error, fieldErrors } = ui.useSubmit(
    (key) => api.addStock(liquidId, Number(quantity), key),
    `${liquidId}:${quantity}`,
  );
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    if (await submit()) {
      shell.notify('Entrada de stock registrada', 'success');
      setQuantity('');
      setAttempted(false);
      onSaved();
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="toolbar" aria-label="Registrar entrada de stock">
      {error && Object.keys(fieldErrors).length === 0 ? <ui.Banner kind="error">{error.userMessage}</ui.Banner> : null}
      <ui.TextField id="liquid-entry-quantity" label="Unidades a ingresar" required inputMode="numeric" value={quantity}
        onChange={setQuantity} error={errors.quantity} maxLength={7} />
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Guardando…' : 'Registrar entrada'}
      </button>
    </form>
  );
}
