import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { ShellContext } from '../shell-contract';
import { FrameDetailPage } from './pages/FrameDetailPage';
import { FramesPage } from './pages/FramesPage';
import { LensDetailPage } from './pages/LensDetailPage';
import { LensesPage } from './pages/LensesPage';
import { NewFramePage } from './pages/NewFramePage';
import { NewLensPage } from './pages/NewLensPage';

/**
 * The products portal: mounted once by opti-front under /products (see opti-front's registry.ts
 * and App.tsx, unchanged by HU-25). Every other product catalogue (lenses here; accessories and
 * liquids next) is routed inside this same portal, with its own in-portal tabs (CatalogTabs), so
 * opti-front never needs a second route per resource.
 */
export default function Portal({ shell }: { shell: ShellContext }): ReactNode {
  return (
    <Routes>
      <Route index element={<FramesPage shell={shell} />} />
      <Route path="new" element={<NewFramePage shell={shell} />} />
      <Route path=":id" element={<FrameDetailPage shell={shell} />} />
      <Route path="lenses" element={<LensesPage shell={shell} />} />
      <Route path="lenses/new" element={<NewLensPage shell={shell} />} />
      <Route path="lenses/:id" element={<LensDetailPage shell={shell} />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
