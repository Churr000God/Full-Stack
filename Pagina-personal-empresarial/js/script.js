/**
 * Espera a que todo el contenido HTML del documento esté cargado antes de ejecutar el código.
 * 'DOMContentLoaded' es un evento que dispara el navegador cuando el HTML ha sido completamente analizado.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Referencia al botón que cambiará el tema
    const changeColorBtn = document.getElementById('change-color');
    // Referencia al elemento <body> del documento
    const body = document.body;

    /**
     * LOCALSTORAGE - RECUPERAR DATOS (getItem)
     * localStorage es una base de datos pequeña en el navegador que guarda información
     * incluso si cierras la pestaña o recargas la página.
     * 
     * localStorage.getItem('theme'): Busca si hay un valor guardado bajo la llave 'theme'.
     */
    const savedTheme = localStorage.getItem('theme');

    // Si el usuario ya había elegido el tema claro anteriormente, lo aplicamos al iniciar.
    if (savedTheme === 'light') {
        // classList.add(): Añade una clase CSS a un elemento.
        body.classList.add('light-mode');
    }

    /**
     * EVENT LISTENER - CLICK
     * Escuchamos cuando el usuario hace clic en el botón.
     */
    changeColorBtn.addEventListener('click', () => {
        /**
         * TOGGLE (Alternar)
         * body.classList.toggle('light-mode'):
         * 1. Si el body YA TIENE la clase 'light-mode', se la QUITA.
         * 2. Si el body NO TIENE la clase 'light-mode', se la PONE.
         * Es como un interruptor de luz (encender/apagar).
         */
        body.classList.toggle('light-mode');
        
        /**
         * LOCALSTORAGE - GUARDAR DATOS (setItem)
         * Después de cambiar el tema, guardamos la preferencia del usuario
         * para recordarla la próxima vez que entre.
         * 
         * localStorage.setItem('clave', 'valor'): Guarda el valor asociado a la clave.
         */
        if (body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
});