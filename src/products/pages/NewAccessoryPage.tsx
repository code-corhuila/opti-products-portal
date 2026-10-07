import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { AccessoryForm } from '../components/AccessoryForm';

export function NewAccessoryPage({ shell }: { shell: ShellContext }): ReactNode {
  const navigate = useNavigate();
  return (
    <>
      <shell.ui.PageHeader title="Nuevo accesorio" subtitle="Los campos con * son obligatorios."
        actions={<Link className="btn btn-quiet" to="/products/accessories">Volver</Link>} />
      <div className="card">
        <AccessoryForm shell={shell} onCreated={(id) => navigate(`/products/accessories/${id}`, { replace: true })} />
      </div>
    </>
  );
}
