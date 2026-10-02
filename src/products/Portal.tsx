import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { ShellContext } from '../shell-contract';
import { FrameDetailPage } from './pages/FrameDetailPage';
import { FramesPage } from './pages/FramesPage';
import { NewFramePage } from './pages/NewFramePage';

/** The products portal: mounted by opti-front under /products. */
export default function Portal({ shell }: { shell: ShellContext }): ReactNode {
  return (
    <Routes>
      <Route index element={<FramesPage shell={shell} />} />
      <Route path="new" element={<NewFramePage shell={shell} />} />
      <Route path=":id" element={<FrameDetailPage shell={shell} />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
