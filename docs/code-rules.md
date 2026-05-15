# Reglas de codigo

Esta guia define como realizar el código para mantener el proyecto limpio, entendible y escalable.

## Objetivo

Se debe producir codigo que respete la estructura actual del repo:

- `src/app/` para rutas, layouts y paginas.
- `src/components/` para UI global reutilizable.
- `src/lib/` para servicios y logica compartida.
- `src/utils/` para funciones puras.
- `src/types/` para tipos compartidos.
- `src/hooks/` para hooks reutilizables.

## Reglas para el código

1. **Usar TypeScript** siempre que se creen archivos nuevos.
2. **Preferir Server Components** por defecto en `src/app/`.
3. **Crear Client Components solo** cuando haya interaccion, estado o efectos.
4. **Separar UI y logica**: la vista no debe mezclar acceso a datos complejo.
5. **Colocar codigo privado** en carpetas con prefijo `_` dentro de una feature.
6. **Usar rutas reales** con `page.tsx`, `layout.tsx` y `route.ts`.
7. **Usar imports con alias `@/`** para evitar rutas largas y frágiles.
8. **Evitar archivos innecesarios** o capas extra si no aportan valor.
9. **No duplicar componentes**: extraer cuando una pieza se repite.
10. **Mantener nombres descriptivos** y consistentes con el dominio.
11. **Usar componentes shadcn** para toda UI reutilizable o nueva antes de crear componentes Tailwind personalizados; colocar primitives en `src/components/ui/` y componerlas en pantallas o features.

## Checklist de salida esperada

Antes de entregar codigo, se debe verificar:

- [ ] Que la ruta o feature propuesta existe en la estructura.
- [ ] Que los nombres de archivos y carpetas son coherentes.
- [ ] Que la pagina principal sigue siendo entendible.
- [ ] Que los componentes reutilizables quedaron en la carpeta correcta.
- [ ] Que cualquier logica repetida fue movida a `lib` o `utils`.
- [ ] Que se actualizo la documentacion si el cambio altera la arquitectura.

## Ejemplo de prompt util

```text
Crea una feature para dashboard en src/app/dashboard.
Usa Server Components por defecto.
Extrae componentes privados en _components.
Reutiliza componentes shadcn desde src/components/ui/ antes de crear UI custom si no existe agregar de los componentes default de shadcn.
Coloca la obtencion de datos en src/lib/services.
Si necesitas helpers puros, ponlos en src/utils.
Actualiza docs si la estructura cambia.
```

## Señales de que falta detalle

Agrega más contexto al prompt si necesitas definir:

- nombres concretos de carpetas,
- tipos de datos,
- reglas de estilo visual,
- manejo de estados vacio/error/loading,
- integración con API real,
- componentes compartidos que deben reutilizarse.


