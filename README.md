# opti-products-portal

> products bounded context: web UI (remote)

Part of the **LMS Library** distributed system — team `lms-library`, Grupo 2.
Governance and documentation live in [`library-docs`](https://github.com/code-corhuila/library-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `library-docs`.

## Validaciones alineadas con servidor

Monturas, lentes, accesorios y líquidos verifican límites de campos opcionales y montos (hasta 100.000.000.000 centavos), además de SKU, marca/categoría, costo/precio, volumen y stock. El índice de refracción admite como máximo dos decimales, sin notación científica ni redondeos silenciosos. Los errores del servidor `costCents`/`salePriceCents` se muestran en los campos de pesos; los campos opcionales y el motivo de entrada de monturas muestran sus errores en español.

`npm test` y `npm run build`; casos frontera de textos, dinero e índice de refracción. Los límites correspondientes permanecen protegidos por `opti-products-api`. Se revisaron alta, entradas de stock y edición de mínimos.
