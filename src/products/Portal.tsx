import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { ShellContext } from '../shell-contract';
import { AccessoriesPage } from './pages/AccessoriesPage';
import { AccessoryDetailPage } from './pages/AccessoryDetailPage';
import { FrameDetailPage } from './pages/FrameDetailPage';
import { FramesPage } from './pages/FramesPage';
import { LensDetailPage } from './pages/LensDetailPage';
import { LensesPage } from './pages/LensesPage';
import { LiquidDetailPage } from './pages/LiquidDetailPage';
import { LiquidsPage } from './pages/LiquidsPage';
import { NewAccessoryPage } from './pages/NewAccessoryPage';
import { NewFramePage } from './pages/NewFramePage';
import { NewLensPage } from './pages/NewLensPage';
import { NewLiquidPage } from './pages/NewLiquidPage';

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
      <Route path="accessories" element={<AccessoriesPage shell={shell} />} />
      <Route path="accessories/new" element={<NewAccessoryPage shell={shell} />} />
      <Route path="accessories/:id" element={<AccessoryDetailPage shell={shell} />} />
      <Route path="liquids" element={<LiquidsPage shell={shell} />} />
      <Route path="liquids/new" element={<NewLiquidPage shell={shell} />} />
      <Route path="liquids/:id" element={<LiquidDetailPage shell={shell} />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
