# Gestor de Tareas (ToDo List)

Este repositorio contiene el código fuente de una aplicación web para la gestión de tareas (ToDo List) moderna y responsive, diseñada para organizar actividades diarias con funcionalidades de creación, edición, eliminación y filtrado.

## 🚀 Características Principales

*   **Diseño Responsive:** Adaptable a dispositivos móviles (tarjetas) y escritorio (tabla).
*   **Gestión de Tareas (CRUD):** Funcionalidad completa para crear, leer, actualizar y eliminar tareas.
*   **Edición en Línea:** Capacidad de editar tareas directamente en la lista sin ventanas emergentes intrusivas.
*   **Persistencia de Datos:** Almacenamiento automático en `localStorage` para no perder la información al recargar.
*   **Filtrado Dinámico:** Organización de tareas por estado (Todas, Completadas, Pendientes).
*   **Interfaz Moderna:** Diseño limpio con efectos visuales, transiciones y feedback al usuario.

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructura semántica y accesible.
*   **CSS3:**
    *   Variables CSS para consistencia visual.
    *   Diseño adaptable con Media Queries.
    *   Estilos específicos para tablas y formularios.
    *   Efectos de hover y transiciones suaves.
*   **JavaScript (Vanilla):**
    *   Programación Orientada a Objetos (Clases `Tarea` y `GestorDeTareas`).
    *   Manipulación avanzada del DOM.
    *   Manejo de eventos y delegación.
    *   Uso de `localStorage` para persistencia.

## 📂 Estructura del Proyecto

```
ACTIVIDAD-2/
├── index.html          # Estructura principal y maquetación
├── CSS/
│   └── style.css       # Estilos globales, responsividad y temas
├── JS/
│   └── app.js          # Lógica de la aplicación y clases
├── ASSETS/
│   ├── Imagenes/       # Recursos gráficos (Hero image)
│   └── Iconos/         # Iconos de interfaz
└── README.md           # Documentación del proyecto
```

## 🔧 Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Churr000God/Full-Stack.git
    ```
2.  **Navegar al proyecto:**
    Ubícate en la carpeta `ACTIVIDAD-2`.
3.  **Abrir la aplicación:**
    Abre el archivo `index.html` en tu navegador web preferido.

## 🎨 Personalización

El proyecto utiliza variables CSS en `CSS/style.css` para facilitar la personalización:

```css
:root {
    --orange-main: #FF6B00;    /* Color principal */
    --orange-soft: #FF8533;    /* Variación suave */
    --bg-main: #FFFFFF;        /* Fondo principal */
    --text-color: #333333;     /* Color de texto */
}
```

## 📄 Licencia

Este proyecto es parte del portafolio de desarrollo Full Stack.
