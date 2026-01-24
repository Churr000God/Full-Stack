# Changelog

Todas las modificaciones notables en este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.1.0] - 2026-01-23

### Añadido
- Archivo `CHANGELOG.md` para el seguimiento de cambios y versiones del proyecto.
- Documentación detallada línea por línea en `CSS/style.css` (líneas 98-687).
- Mejoras de responsividad y contenedores:
  - **Header Container**: Reestructuración completa para móviles (eliminación de clip-path, ajuste de imagen y texto).
  - **Form Container**: Cambio a layout vertical en tablets y optimización de espaciado.
  - **Tabla Contenedor**: Implementación de scroll horizontal (`overflow-x: auto`) para preservar datos en pantallas pequeñas.
  - Breakpoints adicionales para Tablets (1024px) y Móviles Pequeños (480px).
  - Ajustes de diseño fluido para todos los contenedores principales.
  - Optimización de tipografía y espaciado para pantallas táctiles.

### Cambiado
- Se ha adoptado una metodología de "DevOps Documenter" para la gestión del repositorio.
- Mejora en la estructura de comentarios del archivo CSS principal.

## [1.0.0] - 2026-01-23

### Inicial
- Versión inicial funcional del Gestor de Tareas.
- Funcionalidades de añadir, editar, eliminar y filtrar tareas.
- Diseño responsivo y tabla de gestión de tareas.
