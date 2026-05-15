# Buenas practicas

## Principios generales

- Escribe componentes pequenos y con una unica responsabilidad.
- Evita logica repetida: extrae utilidades en `app/lib/` o en una carpeta compartida.
- Mantiene nombres explicitos para componentes, hooks y archivos.
- Prioriza componentes de servidor y usa cliente solo cuando haya interaccion.
- Evita acoplar UI con acceso a datos dentro del mismo componente cuando crezca la complejidad.

## Convenciones para Next.js (App Router)

- Crea rutas solo con archivos `page.tsx` y `route.ts`.
- Usa `layout.tsx` para UI compartida por secciones.
- Coloca codigo privado no enrutable en carpetas con prefijo `_`.
- Usa `Link` de `next/link` para navegacion interna.
- Define metadatos de pagina con `metadata` o `generateMetadata` cuando aplique.

## Estilo de codigo

- TypeScript estricto para props y estructuras de datos.
- Prefiere funciones puras para transformar datos.
- Mantiene estilos con utilidades de Tailwind y evita clases duplicadas largas.
- Deja comentarios solo cuando una decision tecnica no sea obvia.

## Calidad

- Ejecuta `npm run lint` antes de subir cambios.
- Valida visualmente la ruta principal despues de cambios de UI.
- Actualiza documentacion cuando cambie arquitectura o flujo de contribucion.
- Si el codigo fue generado por IA, revisa `docs/generacion-ia.md` para validar estructura y calidad.

