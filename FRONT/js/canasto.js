// Gestión del canasto de compras
export const canasto = {
    articulos: [],

    inicializar() {
        this.cargarDesdeAlmacenamiento();
        this.renderizarResumen();
        this.configurarEventListeners();
    },

    agregarArticulo(producto, cantidad) {
        const articuloExistente = this.articulos.find(articulo => articulo.id === producto.id);
        if (articuloExistente) {
            articuloExistente.cantidad += cantidad;
        } else {
            this.articulos.push({ ...producto, cantidad });
        }
        this.guardarEnAlmacenamiento();
        this.renderizarResumen();
        this.renderizarArticulosCanasto();
    },

    eliminarArticulo(idProducto) {
        this.articulos = this.articulos.filter(articulo => articulo.id !== idProducto);
        this.guardarEnAlmacenamiento();
        this.renderizarResumen();
        this.renderizarArticulosCanasto();
    },

    actualizarCantidad(idProducto, cambio) {
        const articulo = this.articulos.find(articulo => articulo.id === idProducto);
        if (articulo) {
            articulo.cantidad += cambio;
            if (articulo.cantidad <= 0) {
                this.eliminarArticulo(idProducto);
            } else {
                this.guardarEnAlmacenamiento();
                this.renderizarResumen();
                this.renderizarArticulosCanasto();
            }
        }
    },

    obtenerTotal() {
        return this.articulos.reduce((total, articulo) => total + (articulo.precio * articulo.cantidad), 0);
    },

    obtenerCantidad() {
        return this.articulos.reduce((cuenta, articulo) => cuenta + articulo.cantidad, 0);
    },

    guardarEnAlmacenamiento() {
        localStorage.setItem('articulosCanasto', JSON.stringify(this.articulos));
    },

    cargarDesdeAlmacenamiento() {
        const almacenado = localStorage.getItem('articulosCanasto');
        if (almacenado) {
            this.articulos = JSON.parse(almacenado);
        }
    },

    renderizarResumen() {
        const elementoCantidad = document.getElementById('cart-count');
        const elementoTotal = document.getElementById('cart-total');
        const elementoResumen = document.getElementById('cart-summary');

        if (elementoCantidad && elementoTotal) {
            elementoCantidad.textContent = `Cant artículos: ${this.obtenerCantidad()}`;
            elementoTotal.textContent = `Costo total: ${this.obtenerTotal()}🟡`;
        }

        if (this.articulos.length > 0) {
            elementoResumen.classList.remove('hidden');
        } else {
            elementoResumen.classList.add('hidden');
        }
    },

    renderizarArticulosCanasto() {
        const contenedor = document.getElementById('cart-items');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        this.articulos.forEach(articulo => {
            const div = document.createElement('div');
            div.className = 'cart-item-row';
            div.innerHTML = `
                <span>${articulo.nombre} - ${articulo.precio}🟡 - ${articulo.cantidad}</span>
                <div class="cart-item-controls">
                    <button class="btn-qty-minus" data-id="${articulo.id}">-</button>
                    <button class="btn-qty-plus" data-id="${articulo.id}">+</button>
                    <button class="btn-remove" data-id="${articulo.id}">❌</button>
                </div>
            `;
            contenedor.appendChild(div);
        });

        // Reasignar listeners para elementos dinámicos
        contenedor.querySelectorAll('.btn-qty-minus').forEach(boton => {
            boton.addEventListener('click', (e) => this.actualizarCantidad(parseInt(e.target.dataset.id), -1));
        });
        contenedor.querySelectorAll('.btn-qty-plus').forEach(boton => {
            boton.addEventListener('click', (e) => this.actualizarCantidad(parseInt(e.target.dataset.id), 1));
        });
        contenedor.querySelectorAll('.btn-remove').forEach(boton => {
            boton.addEventListener('click', (e) => this.eliminarArticulo(parseInt(e.target.dataset.id)));
        });
    },

    configurarEventListeners() {
        const alternador = document.getElementById('cart-toggle');
        const articulosCanasto = document.getElementById('cart-items');
        const iconoAlternador = document.querySelector('.toggle-icon');

        if (alternador) {
            alternador.addEventListener('click', () => {
                articulosCanasto.classList.toggle('visible');
                iconoAlternador.textContent = articulosCanasto.classList.contains('visible') ? '⬇️' : '⬆️';
                this.renderizarArticulosCanasto();
            });
        }

        const botonConfirmar = document.getElementById('btn-confirm-purchase');
        if (botonConfirmar) {
            botonConfirmar.addEventListener('click', () => this.confirmarCompra());
        }
    },

    async confirmarCompra() {
        const inputNombreUsuario = document.getElementById('input-user-name');
        const nombreUsuario = inputNombreUsuario ? inputNombreUsuario.value.trim() : '';

        if (!nombreUsuario) {
            alert('Por favor ingrese su nombre para confirmar la compra.');
            return;
        }

        if (this.articulos.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        try {
            const respuesta = await fetch('http://localhost:3010/api/productos/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombreUsuario: nombreUsuario,
                    productos: this.articulos
                })
            });

            if (!respuesta.ok) throw new Error('Error generando ticket');

            const ticket = await respuesta.json();
            alert(`Compra confirmada!\nTicket ID: ${ticket.id}\nTotal: ${ticket.total}🟡\nGracias ${ticket.nombreUsuario}!`);

            // Limpiar canasto
            this.articulos = [];
            this.guardarEnAlmacenamiento();
            this.renderizarResumen();
            this.renderizarArticulosCanasto();

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al procesar la compra.');
        }
    }
};
