# Contribucion

Gracias por contribuir. Esta guia mantiene el flujo simple y consistente.

## Flujo de trabajo

1. Crea una rama desde `main` con nombre descriptivo.
2. Implementa cambios pequenos y atomicos.
3. Ejecuta validaciones locales.
4. Abre Pull Request con contexto y evidencia.

## Convenciones de ramas

- `feature/nombre-corto`
- `fix/nombre-corto`
- `chore/nombre-corto`
- `docs/nombre-corto`

## Convencion de commits

Formato recomendado:

```text
<tipo>: <descripcion corta>
```

Tipos sugeridos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

Ejemplos:

- `feat: agrega tarjeta de inicio en home`
- `docs: agrega guia de arquitectura`

## Checklist para Pull Request

- [ ] El cambio tiene objetivo claro.
- [ ] Se actualizo documentacion si aplica.
- [ ] `npm run lint` sin errores.
- [ ] Se adjuntan capturas para cambios visuales.
- [ ] Se describen riesgos o puntos a revisar.

## Criterios de aceptacion

- El codigo es legible y consistente con las guias en `docs/`.
- No rompe rutas existentes ni convenciones de App Router.
- La PR permite revision rapida (tamano y foco razonables).

