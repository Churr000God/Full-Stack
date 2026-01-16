# Página Personal Empresarial

Este repositorio contiene el código fuente de una página web personal/empresarial moderna y responsive, diseñada para mostrar un portafolio profesional, servicios y métodos de contacto.

## 🚀 Características Principales

*   **Diseño Responsive:** Adaptable a dispositivos móviles, tablets y escritorio.
*   **Tema Claro/Oscuro:** Funcionalidad para cambiar entre modos de visualización con persistencia de preferencias (localStorage).
*   **Estilo Glassmorphism:** Interfaz moderna con efectos de transparencia y desenfoque.
*   **Secciones:**
    *   **Hero:** Introducción impactante con imagen de fondo y call-to-action.
    *   **Proyectos:** Grid interactivo de trabajos realizados (3 columnas en desktop, 1 en móvil).
    *   **Contacto:** Formulario funcional y validado.
    *   **Footer:** Enlaces a redes sociales y copyright.

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructura semántica.
*   **CSS3:**
    *   Variables CSS (Custom Properties) para gestión de temas.
    *   Flexbox y Grid Layout para maquetación.
    *   Media Queries para diseño responsive.
    *   Animaciones y transiciones suaves.
*   **JavaScript (Vanilla):**
    *   Manejo del DOM.
    *   Event Listeners.
    *   LocalStorage para guardar preferencias de usuario.

## 📂 Estructura del Proyecto

```
/
├── index.html          # Estructura principal
├── CSS/
│   └── styles.css      # Estilos globales y temas
├── js/
│   └── script.js       # Lógica del cambio de tema
├── assets/
│   ├── images/         # Imágenes de proyectos y fondos
│   └── icons/          # Iconos SVG (Social media, UI)
└── README.md           # Documentación
```

## 🔧 Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Churr000God/Full-Stack.git
    ```
2.  **Abrir el proyecto:**
    Navega a la carpeta del proyecto y abre el archivo `index.html` en tu navegador web preferido.

## 🎨 Personalización

El proyecto utiliza variables CSS en `CSS/styles.css` para facilitar la personalización de colores:

```css
:root {
    --primary: #4da3ff;   /* Color principal */
    --secondary: #21c7a8; /* Color secundario */
    --dark: #0b1220;      /* Fondo modo oscuro */
    --light: #e9efff;     /* Texto modo oscuro */
}
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

