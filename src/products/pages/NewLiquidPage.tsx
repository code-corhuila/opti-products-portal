import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { LiquidForm } from '../components/LiquidForm';

export function NewLiquidPage({ shell }: { shell: ShellContext }): ReactNode {
  const navigate = useNavigate();
  return (
    <>
      <shell.ui.PageHeader title="Nuevo líquido" subtitle="Los campos con * son obligatorios."
        actions={<Link className="btn btn-quiet" to="..">Volver</Link>} />
      <div className="card">
        <LiquidForm shell={shell} onCreated={(id) => navigate(`../${id}`)} />
      </div>
    </>
  );
}
