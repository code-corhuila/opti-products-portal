import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { LensForm } from '../components/LensForm';

export function NewLensPage({ shell }: { shell: ShellContext }): ReactNode {
  const navigate = useNavigate();
  return (
    <>
      <shell.ui.PageHeader title="Nuevo lente" subtitle="Los campos con * son obligatorios."
        actions={<Link className="btn btn-quiet" to="..">Volver</Link>} />
      <div className="card">
        <LensForm shell={shell} onCreated={(id) => navigate(`../${id}`)} />
      </div>
    </>
  );
}
