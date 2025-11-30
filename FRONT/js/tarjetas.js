import { canasto } from "./canasto.js";

let paginaActual = 1;
const articulosPorPagina = 8;
let todosLosDatos = [];

function crearTarjeta(objeto) {
    const $tarjetaArticulo = document.createElement("div");
    $tarjetaArticulo.classList.add("div-card");

    const $nombreProducto = (document.createElement("p"));
    $nombreProducto.classList.add("Producto-articulo")
    $nombreProducto.innerHTML = objeto.nombre;
    $tarjetaArticulo.appendChild($nombreProducto);

    const imagen = (document.createElement("img"));
    imagen.src = `http://localhost:3010/${objeto.ruta_img}`;
    imagen.classList.add("img-card");
    $tarjetaArticulo.appendChild(imagen);

    const divInferior = document.createElement("div");
    divInferior.classList.add("div-inferior");

    const stock = document.createElement("p");
    const precio = document.createElement("p");

    stock.innerHTML = `Stock: ${objeto.stock}`;
    precio.innerHTML = `${objeto.precio}🟡`;
    divInferior.appendChild(stock);
    divInferior.appendChild(precio);

    $tarjetaArticulo.appendChild(divInferior);

    // Controles del Canasto
    const divControles = document.createElement("div");
    divControles.classList.add("cart-controls");

    const botonMenos = document.createElement("button");
    botonMenos.innerText = "-";
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.value = 1;
    inputCantidad.min = 1;
    inputCantidad.max = objeto.stock;
    const botonMas = document.createElement("button");
    botonMas.innerText = "+";

    botonMenos.onclick = () => { if (inputCantidad.value > 1) inputCantidad.value--; };
    botonMas.onclick = () => { if (parseInt(inputCantidad.value) < objeto.stock) inputCantidad.value++; };

    const botonAgregar = document.createElement("button");
    botonAgregar.innerText = "Agregar al canasto 🧺";
    botonAgregar.classList.add("btn-add-cart");
    botonAgregar.onclick = () => {
        canasto.agregarArticulo(objeto, parseInt(inputCantidad.value));
        // Retroalimentación visual
        const textoOriginal = botonAgregar.innerText;
        botonAgregar.innerText = "Agregado! ✅";
        setTimeout(() => botonAgregar.innerText = textoOriginal, 1000);
    };

    divControles.appendChild(botonMenos);
    divControles.appendChild(inputCantidad);
    divControles.appendChild(botonMas);

    $tarjetaArticulo.appendChild(divControles);
    $tarjetaArticulo.appendChild(botonAgregar);

    return $tarjetaArticulo;
}

function renderizarControlesPaginacion(contenedor) {
    const totalPaginas = Math.ceil(todosLosDatos.length / articulosPorPagina);
    if (totalPaginas <= 1) return;

    const divPaginacion = document.createElement("div");
    divPaginacion.classList.add("pagination-controls");

    const botonAnterior = document.createElement("button");
    botonAnterior.innerText = "Anterior";
    botonAnterior.disabled = paginaActual === 1;
    botonAnterior.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarPaginaActual(contenedor);
        }
    };

    const spanInfo = document.createElement("span");
    spanInfo.innerText = `Página ${paginaActual} de ${totalPaginas}`;
    spanInfo.style.color = "white";
    spanInfo.style.alignSelf = "center";

    const botonSiguiente = document.createElement("button");
    botonSiguiente.innerText = "Siguiente";
    botonSiguiente.disabled = paginaActual === totalPaginas;
    botonSiguiente.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarPaginaActual(contenedor);
        }
    };

    // Estilizar botones
    [botonAnterior, botonSiguiente].forEach(boton => {
        boton.style.padding = "5px 15px";
        boton.style.cursor = "pointer";
        boton.style.backgroundColor = "rgb(23, 195, 243)";
        boton.style.border = "none";
        boton.style.borderRadius = "4px";
        boton.style.color = "white";
        boton.style.fontSize = "14px";
        if (boton.disabled) {
            boton.style.backgroundColor = "grey";
            boton.style.cursor = "not-allowed";
        }
    });

    divPaginacion.appendChild(botonAnterior);
    divPaginacion.appendChild(spanInfo);
    divPaginacion.appendChild(botonSiguiente);

    contenedor.appendChild(divPaginacion);
}

function renderizarPaginaActual(contenedor) {
    while (contenedor.hasChildNodes()) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const indiceInicio = (paginaActual - 1) * articulosPorPagina;
    const indiceFin = indiceInicio + articulosPorPagina;
    const articulosPagina = todosLosDatos.slice(indiceInicio, indiceFin);

    articulosPagina.forEach(elemento => {
        contenedor.appendChild(crearTarjeta(elemento));
    });

    renderizarControlesPaginacion(contenedor);
}

export function actualizarTarjetas(datos, contenedor) {
    todosLosDatos = datos;
    paginaActual = 1;
    renderizarPaginaActual(contenedor);
}