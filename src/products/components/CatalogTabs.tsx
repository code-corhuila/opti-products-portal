import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Lets a person move between the product catalogues (HU-25 adds lenses, accessories and liquids
 * next to the existing frames). opti-front only mounts this portal once under {@code /products};
 * the sub-navigation between its own resources lives here so opti-front needs no change.
 */
export function CatalogTabs(): ReactNode {
  return (
    <nav className="toolbar" aria-label="Catálogos de productos">
      <NavLink to="/products" end className={({ isActive }) => (isActive ? 'btn' : 'btn btn-quiet')}>
        Monturas
      </NavLink>
      <NavLink to="/products/lenses" className={({ isActive }) => (isActive ? 'btn' : 'btn btn-quiet')}>
        Lentes
      </NavLink>
      <NavLink to="/products/accessories" className={({ isActive }) => (isActive ? 'btn' : 'btn btn-quiet')}>
        Accesorios
      </NavLink>
      <NavLink to="/products/liquids" className={({ isActive }) => (isActive ? 'btn' : 'btn btn-quiet')}>
        Líquidos
      </NavLink>
    </nav>
  );
}
