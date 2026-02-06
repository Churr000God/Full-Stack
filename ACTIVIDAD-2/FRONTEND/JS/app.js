// ================================
// Actividad 2 - Gestor de Tareas
// POO + ES6+ + DOM + LocalStorage
// ================================

/**
 * Clase Tarea
 * Representa una tarea individual con:
 * - id: identificador único
 * - nombre: texto de la tarea
 * - completa: boolean (true/false)
 * - creadaEn: timestamp
 */
class Tarea { // Definición de la clase Tarea
    constructor(nombre, completa = false, id = crypto.randomUUID(), creadaEn = Date.now()) { // Constructor con valores por defecto
        this.id = id; // Asigna el ID único de la tarea
        this.nombre = nombre; // Asigna el nombre de la tarea
        this.completa = completa; // Asigna el estado de completitud (true/false)
        this.creadaEn = creadaEn; // Asigna la fecha de creación
    }

    // Cambiar estado de la tarea
    alternarEstado() { // Método para alternar el estado de completada
        this.completa = !this.completa; // Invierte el valor de 'completa' (true <-> false)
    }

    // Editar nombre de la tarea
    editarNombre(nuevoNombre) { // Método para actualizar el nombre de la tarea
        this.nombre = nuevoNombre; // Asigna el nuevo nombre a la propiedad
    }

    // Convertir objeto a JSON
    toJson() { // Método para convertir la instancia a un objeto plano (JSON)
        return { // Retorna un objeto con las propiedades de la tarea
            id: this.id, // Propiedad id
            nombre: this.nombre, // Propiedad nombre
            completa: this.completa, // Propiedad completa
            creadaEn: this.creadaEn, // Propiedad creadaEn
        };
    }

    // Crear una tarea desde un objeto JSON
    static fromJson(json) { // Método estático para crear una instancia desde un JSON
        return new Tarea(json.nombre, json.completa, json.id, json.creadaEn); // Retorna una nueva instancia de Tarea
    }
}

/**
 * Clase GestorDeTareas
 * Mantiene una lista de tareas y gestiona:
 * - agregar, editar, eliminar, alternar estado
 * - renderizar (DOM)
 * - LocalStorage
 */
class GestorDeTareas { // Definición de la clase principal para gestionar la app
    constructor() { // Constructor de la clase gestora
        this.tareas = []; // Inicializa el array de tareas vacío
        this.filtro = 'todas'; // Establece el filtro inicial ('todas', 'pendientes', 'completadas')
        this.storageKey = 'tareas_app_V|1.0.0'; // Define la clave para guardar en LocalStorage

        // Auth Elementos
        this.$authSection = document.getElementById('auth-section');
        this.$taskSection = document.getElementById('task-section');
        this.$authForm = document.getElementById('form-auth');
        this.$authUsername = document.getElementById('auth-username');
        this.$authPassword = document.getElementById('auth-password');
        this.$authTitle = document.getElementById('auth-title');
        this.$authToggleLink = document.getElementById('auth-toggle-link');
        this.$authToggleText = document.getElementById('auth-toggle-text');
        this.$authError = document.getElementById('auth-error');
        this.$btnLogout = document.getElementById('btn-logout');

        this.isLoginMode = true; // true = login, false = register
        this.token = localStorage.getItem('jwt_token'); // Recuperar token

        // DOM Elementos
        this.$form = document.getElementById("form-tarea"); // Referencia al formulario de agregar tarea
        this.$input = document.getElementById("nueva-tarea"); // Referencia al input de texto para nuevas tareas
        this.$lista = document.getElementById("lista-tareas"); // Referencia a la tabla donde se listan las tareas
        this.$error = document.getElementById("error"); // Referencia al contenedor de mensajes de error
        this.$contador = document.getElementById("contador"); // Referencia al contador de tareas pendientes
        // this.$borrarTodo = document.getElementById("borrar-todo"); // Desactivado en versión API
        this.$filtros = document.querySelectorAll(".filtro"); // Referencia a los botones de filtro

        // Modal Elementos (Eliminados)
        this.idTareaEnEdicion = null; // Inicializa la variable para rastrear qué tarea se edita

        // Init
        this.verificarSesion(); // Verificar si mostrar login o tareas
        this.configurarEventos(); // Configura los listeners de eventos
    }

    verificarSesion() {
        if (this.token) {
            this.$authSection.style.display = 'none';
            this.$taskSection.style.display = 'block';
            this.cargarTareasAPI(); // Cargar tareas desde API
        } else {
            this.$authSection.style.display = 'block';
            this.$taskSection.style.display = 'none';
        }
    }

    // Configuración de Eventos
    configurarEventos() { // Método para agrupar todos los event listeners
        // Auth Toggle (Login <-> Register)
        this.$authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.isLoginMode = !this.isLoginMode;
            if (this.isLoginMode) {
                this.$authTitle.textContent = 'Iniciar Sesión';
                this.$authForm.querySelector('button').textContent = 'Entrar';
                this.$authToggleText.textContent = '¿No tienes cuenta?';
                this.$authToggleLink.textContent = 'Regístrate aquí';
            } else {
                this.$authTitle.textContent = 'Registrarse';
                this.$authForm.querySelector('button').textContent = 'Registrar';
                this.$authToggleText.textContent = '¿Ya tienes cuenta?';
                this.$authToggleLink.textContent = 'Inicia sesión aquí';
            }
            this.$authError.textContent = '';
        });

        // Auth Submit
        this.$authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = this.$authUsername.value;
            const password = this.$authPassword.value;
            await this.autenticar(username, password);
        });

        // Logout
        this.$btnLogout.addEventListener('click', () => {
            this.cerrarSesion();
        });

        // Submit formulario
        this.$form.addEventListener('submit', (e) => { // Escucha el evento submit del formulario
            e.preventDefault(); // Previene que la página se recargue
            this.agregarTareaAPI(this.$input.value); // API CALL
            this.$input.value = ''; // Limpia el campo de texto
            this.$input.focus(); // Devuelve el foco al input
        });

        // Click en lista (Delegación de eventos)
        this.$lista.addEventListener('click', (e) => { // Escucha clicks en la lista (delegación)
            // Elementos clickeables
            const btnEliminar = e.target.closest('.btn-eliminar'); // Busca si el click fue en botón eliminar
            const btnEditar = e.target.closest('.btn-editar'); // Busca si el click fue en botón editar
            const checkbox = e.target.closest('.checkbox-tarea'); // Busca si el click fue en el checkbox
            const btnGuardar = e.target.closest('.btn-guardar-inline'); // Busca si el click fue en guardar edición
            const btnCancelar = e.target.closest('.btn-cancelar-inline'); // Busca si el click fue en cancelar edición
            
            // Obtenemos el ID del elemento padre tr (fila)
            const tr = e.target.closest('.tarea-item'); // Encuentra la fila (tr) contenedora
            if (!tr) return; // Si no hay fila, sale de la función
            const id = tr.dataset.id; // Obtiene el ID de la tarea desde el atributo data-id

            if (btnEliminar) { // Si se hizo click en eliminar
                if (confirm('¿Borrar esta tarea permanentemente?')) { // Pide confirmación
                    this.eliminarTareaAPI(id); // API CALL
                }
            } else if (btnEditar) { // Si se hizo click en editar
                this.solicitarEdicion(id); // Activa el modo edición
            } else if (checkbox) { // Si se hizo click en el checkbox
                const nuevaCompleta = checkbox.checked;
                this.alternarTareaAPI(id, nuevaCompleta); // API CALL
            } else if (btnGuardar) { // Si se hizo click en guardar cambios
                this.guardarEdicionInline(id); // Guarda los cambios de la edición en línea
            } else if (btnCancelar) { // Si se hizo click en cancelar edición
                this.render(); // Re-renderiza para cancelar la edición y volver al estado normal
            }
        });

        /* Desactivado Borrar Todo por ahora
        this.$borrarTodo.addEventListener('click', () => { 
            if (this.tareas.length === 0) return; 
            if (confirm('¿Estás seguro de querer borrar todas las tareas?')) { 
                this.borrarTodo(); 
            }
        });
        */

        // Filtros
        this.$filtros.forEach(btn => { // Itera sobre los botones de filtro
            btn.addEventListener('click', () => { // Agrega listener de click a cada uno
                // Obtenemos el filtro del ID (ej: filtrar-pendientes -> pendientes)
                const filtro = btn.id.replace('filtrar-', '');  // Extrae el tipo de filtro del ID
                this.setFiltro(filtro); // Aplica el nuevo filtro
            });
        });
    }

    // --- API & AUTH METODOS ---

    async autenticar(username, password) {
        const endpoint = this.isLoginMode ? '/login' : '/register';
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error de autenticación');
            }

            if (this.isLoginMode) {
                this.token = data.token;
                localStorage.setItem('jwt_token', this.token);
                this.$authUsername.value = '';
                this.$authPassword.value = '';
                this.verificarSesion();
            } else {
                // Registro exitoso, auto-login o pedir login
                alert('Registro exitoso. Por favor inicia sesión.');
                this.$authToggleLink.click(); // Cambiar a modo login
            }

        } catch (error) {
            this.$authError.textContent = error.message;
            setTimeout(() => this.$authError.textContent = '', 3000);
        }
    }

    cerrarSesion() {
        this.token = null;
        localStorage.removeItem('jwt_token');
        this.tareas = [];
        this.verificarSesion();
    }

    // API CRUD Helpers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async cargarTareasAPI() {
        try {
            const response = await fetch('http://localhost:3000/tareas', {
                headers: this.getHeaders()
            });
            if (response.status === 401) {
                this.cerrarSesion();
                return;
            }
            const data = await response.json();
            // Convertir objetos planos a instancias de Tarea
            this.tareas = data.map(obj => Tarea.fromJson(obj));
            this.render();
        } catch (error) {
            console.error('Error cargando tareas:', error);
            this.mostrarError('Error de conexión con el servidor');
        }
    }

    async agregarTareaAPI(nombre) {
        const limpio = nombre.trim();
        if (!limpio) {
            this.mostrarError("No se puede agregar una tarea vacía");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/tareas', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ nombre: limpio })
            });

            if (!response.ok) throw new Error('Error al crear tarea');
            
            await this.cargarTareasAPI(); // Recargar lista
        } catch (error) {
            console.error(error);
            this.mostrarError('No se pudo guardar la tarea');
        }
    }

    async eliminarTareaAPI(id) {
        try {
            const response = await fetch(`http://localhost:3000/tareas/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar');

            await this.cargarTareasAPI();
        } catch (error) {
            console.error(error);
            this.mostrarError('No se pudo eliminar la tarea');
        }
    }

    async alternarTareaAPI(id, completa) {
        // Optimistic update (actualizar UI antes de confirmar) podría ser buena idea, 
        // pero por simplicidad recargaremos o actualizaremos localmente.
        // Vamos a hacer update real.
        try {
            const response = await fetch(`http://localhost:3000/tareas/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ completa })
            });

            if (!response.ok) throw new Error('Error al actualizar estado');

            await this.cargarTareasAPI();
        } catch (error) {
            console.error(error);
            this.mostrarError('No se pudo actualizar la tarea');
        }
    }

    async editarTareaAPI(id, nuevoNombre) {
        try {
            const response = await fetch(`http://localhost:3000/tareas/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ nombre: nuevoNombre })
            });

            if (!response.ok) throw new Error('Error al actualizar nombre');

            await this.cargarTareasAPI();
        } catch (error) {
            console.error(error);
            this.mostrarError('No se pudo editar la tarea');
        }
    }

    // Activar modo edición en línea
    solicitarEdicion(id) { // Método para iniciar la edición de una tarea específica
        const tarea = this.tareas.find(t => t.id === id); // Busca la tarea por ID
        if (!tarea) return; // Si no existe, sale

        // Encontrar la fila
        const tr = document.querySelector(`tr[data-id="${id}"]`); // Selecciona la fila en el DOM
        if (!tr) return; // Si no encuentra la fila, sale

        // Si ya hay otra tarea en edición, renderizamos todo para cancelar la anterior
        if (document.querySelector('.input-inline')) { // Verifica si hay un input de edición abierto
            this.render(); // Renderiza para limpiar estados de edición previos
            // Necesitamos re-seleccionar el tr después del render
            return this.solicitarEdicion(id); // Vuelve a intentar editar la tarea actual
        }

        tr.classList.add('editing'); // Añade clase visual de edición a la fila

        // Reemplazar celda de nombre
        const tdNombre = tr.querySelector('.tarea-nombre'); // Selecciona la celda del nombre
        const anchoActual = tdNombre.offsetWidth; // (Opcional) Obtiene ancho actual
        tdNombre.innerHTML = `
            <input type="text" class="input-inline" value="${this.escapeHTML(tarea.nombre)}" aria-label="Editar nombre de tarea">
        `; // Reemplaza el texto con un input editable
        
        // Foco al input
        const input = tdNombre.querySelector('input'); // Selecciona el nuevo input
        input.style.width = '100%'; // Asegura que ocupe todo el ancho
        input.focus(); // Pone el foco en el input

        // Permitir guardar con Enter
        input.addEventListener('keypress', (e) => { // Escucha teclas en el input
            if (e.key === 'Enter') { // Si es Enter
                this.guardarEdicionInline(id); // Guarda la edición
            }
        });

        // Reemplazar celda de acciones
        const tdAcciones = tr.querySelector('.acciones-container'); // Selecciona celda de botones
        tdAcciones.innerHTML = `
            <button class="btn-guardar-inline" title="Guardar">💾</button>
            <button class="btn-cancelar-inline" title="Cancelar">❌</button>
            <button class="btn-eliminar" title="Eliminar" disabled style="opacity: 0.5; cursor: not-allowed;">🗑️</button>
        `; // Cambia botones normales por guardar/cancelar
    }

    guardarEdicionInline(id) { // Método para guardar cambios de edición en línea
        const tr = document.querySelector(`tr[data-id="${id}"]`); // Busca la fila
        if (!tr) return; // Si no existe, sale

        const input = tr.querySelector('.input-inline'); // Busca el input
        const nuevoNombre = input.value.trim(); // Obtiene y limpia el valor
        
        if (nuevoNombre === '') { // Validación: si está vacío
            this.mostrarError("El nombre de la tarea no puede estar vacío"); // Muestra error
            input.focus(); // Mantiene foco en input
            return; // Sale sin guardar
        }

        this.editarTareaAPI(id, nuevoNombre); // Llama al método de editar lógica API
    }

    // Validación y Errores
    mostrarError(msg) { // Método para mostrar mensajes de error
        this.$error.textContent = msg; // Pone el texto del error
        if (msg) { // Si hay mensaje
            window.clearTimeout(this._errorTimeout); // Limpia timeout anterior si existe
            this._errorTimer = window.setTimeout(() => (this.$error.textContent = ""), 3000); // Borra el error a los 3 seg
        }
    }

    // CRUD
    agregarTarea(nombre) { // Método para añadir nueva tarea
        const limpio = nombre.trim(); // Limpia espacios
        if (!limpio) { // Si está vacío
            this.mostrarError("No se puede agregar una tarea vacía"); // Error
            return; // Sale
        }

        const tarea = new Tarea(limpio); // Crea instancia de Tarea
        this.tareas.push(tarea); // Añade al array
        this.guardarEnLocalStorage(); // Guarda en persistencia
        this.render(); // Actualiza vista
    }

    eliminarTarea(id) { // Método para eliminar tarea por ID
        this.tareas = this.tareas.filter((t) => t.id !== id); // Filtra quitando la tarea del ID
        this.guardarEnLocalStorage(); // Actualiza persistencia
        this.render(); // Actualiza vista
    }

    editarTarea(id, nuevoNombre) { // Método para editar datos de tarea
        const limpio = nuevoNombre.trim(); // Limpia nombre
        if (!limpio) return; // Validación extra

        const tarea = this.tareas.find((t) => t.id === id); // Busca la tarea
        if (!tarea) return; // Si no existe, sale

        tarea.editarNombre(limpio); // Actualiza el nombre en el objeto
        this.guardarEnLocalStorage(); // Guarda cambios
        this.render(); // Actualiza vista
    }

    alternarTarea(id) { // Método para alternar estado completado
        const tarea = this.tareas.find((t) => t.id === id); // Busca tarea
        if (!tarea) return; // Si no existe, sale

        tarea.alternarEstado(); // Cambia estado en objeto
        this.guardarEnLocalStorage(); // Guarda cambios
        this.render(); // Actualiza vista
    }

    borrarTodo() { // Método para borrar todas las tareas
        this.tareas = []; // Vacía el array
        this.guardarEnLocalStorage(); // Guarda array vacío
        this.render(); // Actualiza vista
    }

    // Filtros
    setFiltro(nuevoFiltro) { // Método para cambiar el filtro activo
        this.filtro = nuevoFiltro; // Actualiza propiedad filtro
        // Actualizar estado visual de botones
        this.$filtros.forEach(btn => { // Recorre botones de filtro
            const btnFiltro = btn.id.replace('filtrar-', ''); // Obtiene tipo filtro
            const isActive = btnFiltro === nuevoFiltro; // Chequea si es el activo
            btn.setAttribute('aria-pressed', isActive); // Actualiza atributo ARIA
            btn.classList.toggle('active', isActive); // Alterna clase active
        });
        this.render(); // Renderiza con nuevo filtro
    }

    getTareasFiltradas() { // Método para obtener tareas según filtro
        if (this.filtro === "pendientes") return this.tareas.filter((t) => !t.completa); // Retorna solo pendientes
        if (this.filtro === "completadas") return this.tareas.filter((t) => t.completa); // Retorna solo completadas
        return this.tareas; // Retorna todas por defecto
    }

    // Local Storage
    guardarEnLocalStorage() { // Método para persistir datos
        const data = this.tareas.map((t) => t.toJson()); // Convierte tareas a JSON simple
        localStorage.setItem(this.storageKey, JSON.stringify(data)); // Guarda string en localStorage
    }

    cargarDesdeLocalStorage() { // Método para recuperar datos
        try { // Bloque try-catch por si falla parseo
            const raw = localStorage.getItem(this.storageKey); // Obtiene string crudo
            if (!raw) return; // Si no hay nada, sale

            const data = JSON.parse(raw); // Parsea JSON a objetos
            if (!Array.isArray(data)) return; // Si no es array, sale

            this.tareas = data.map((obj) => Tarea.fromJson(obj)); // Reconstruye instancias Tarea
        } catch (e) { // Manejo de errores
            console.warn("No se pudo cargar tareas desde LocalStorage", e); // Log warning
            this.mostrarError("Error al cargar tareas guardadas"); // Muestra error usuario
        }
    }

    // Renderizado
    render() { // Método principal para dibujar la UI
        const tareasAMostrar = this.getTareasFiltradas(); // Obtiene lista filtrada
        
        // Limpiar tabla (tbody)
        this.$lista.innerHTML = ''; // Borra contenido actual de la tabla

        if (tareasAMostrar.length === 0) { // Si no hay tareas para mostrar
            const mensaje = this.tareas.length === 0 // Decide mensaje según si hay tareas totales o no
                ? "No tienes tareas registradas. ¡Empieza agregando una!" 
                : "No hay tareas en este filtro.";
            
            // Usamos un row que ocupe todas las columnas
            this.$lista.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <p>${mensaje}</p>
                    </td>
                </tr>
            `; // Inserta fila de estado vacío
        } else { // Si hay tareas
            tareasAMostrar.forEach(tarea => { // Recorre cada tarea
                const tr = document.createElement('tr'); // Crea elemento fila
                tr.className = `tarea-item ${tarea.completa ? 'completada' : ''}`; // Asigna clases CSS
                tr.dataset.id = tarea.id; // Asigna ID en data attribute
                
                const isChecked = tarea.completa ? 'checked' : ''; // Determina si checkbox está marcado
                
                // Formatear fecha
                const fecha = new Date(tarea.creadaEn).toLocaleDateString('es-ES', { // Formatea fecha
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Estructura de Tabla
                tr.innerHTML = `
                    <td style="width: 50px; text-align: center;">
                        <input type="checkbox" class="checkbox-tarea" ${isChecked} aria-label="Marcar como completada">
                    </td>
                    <td class="tarea-nombre">
                        <span class="tarea-texto">${this.escapeHTML(tarea.nombre)}</span>
                    </td>
                    <td class="fecha-creacion">
                        ${fecha}
                    </td>
                    <td class="acciones-cell">
                        <div class="acciones-container">
                            <button class="btn-editar" aria-label="Editar tarea">
                                ✏️ Editar
                            </button>
                            <button class="btn-eliminar" aria-label="Eliminar tarea">
                                🗑️
                            </button>
                        </div>
                    </td>
                `; // Inserta HTML de las celdas
                
                this.$lista.appendChild(tr); // Añade fila a la tabla
            });
        }

        // Actualizar contador
        const pendientes = this.tareas.filter(t => !t.completa).length; // Cuenta pendientes
        this.$contador.textContent = `${pendientes} tarea${pendientes !== 1 ? 's' : ''} pendiente${pendientes !== 1 ? 's' : ''}`; // Actualiza texto contador
    }

    // Seguridad XSS simple
    escapeHTML(str) { // Método para sanitizar strings y prevenir XSS
        return str // Reemplaza caracteres peligrosos
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => { // Escucha evento carga completa
    window.app = new GestorDeTareas(); // Instancia la app globalmente
});
