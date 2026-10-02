import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ShellContext } from '../../shell-contract';
import { FrameForm } from '../components/FrameForm';

export function NewFramePage({ shell }: { shell: ShellContext }): ReactNode {
  const navigate = useNavigate();
  return (
    <>
      <shell.ui.PageHeader title="Nueva montura" subtitle="Los campos con * son obligatorios."
        actions={<Link className="btn btn-quiet" to="..">Volver</Link>} />
      <div className="card">
        <FrameForm shell={shell} onCreated={(id) => navigate(`../${id}`)} />
      </div>
    </>
  );
}
