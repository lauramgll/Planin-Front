'use strict'

import { URL, cargarMenu, crearElemento, crearElementoTexto, vistaDecimal, getCategorias, getCuentas, checkUser } from './utils.js';
import { } from './validaciones.js';

let fechaActual = new Date();
let filtroActivo = "Mes";
let cuentaActiva = "filtroTodasCuenta";
let categoriaActiva = "filtroTodasCategoria";
let tipoActivo = "filtroTodasTipo";
let idUsuario = localStorage.getItem("id");

localStorage.removeItem("idCategoria");
localStorage.removeItem("tipoTransaccion");
localStorage.removeItem("transaccionSeleccionada");
localStorage.removeItem("importeTransaccion");
localStorage.removeItem("fechaTransaccion"); 
localStorage.removeItem("notasTransaccion");

window.addEventListener("DOMContentLoaded", async () => {
    checkUser();
    cargarMenu();

    // Botón crear transacción
    let btnCrearTransaccion = document.getElementById("crearTransaccion");

    btnCrearTransaccion.addEventListener("click", function () {
        localStorage.setItem("tipoEditTransaccion", "nueva");
        location.href = "../nueva_editar_transaccion.html";
    });

    const filtroMes = document.getElementById("filtroMes");
    const filtroYear = document.getElementById("filtroYear");
    const flechaIzq = document.querySelectorAll(".flechaIzquierda");
    const flechaDer = document.querySelectorAll(".flechaDerecha");

    filtroMes.addEventListener('click', () => cambiarFiltroFecha("Mes"));
    filtroYear.addEventListener('click', () => cambiarFiltroFecha("Año"));

    flechaIzq.forEach(element => {
        element.addEventListener('click', () => cambiarFechaYTransacciones(-1));
    });
    
    flechaDer.forEach(element => {
        element.addEventListener('click', () => cambiarFechaYTransacciones(1));
    });

    // Inicializar
    actualizarTituloFecha();
    cargarCuentas();
    cargarCategorias();
    document.querySelectorAll("#filtroTipo p").forEach(elemento => {
        elemento.addEventListener("click", cambiarFiltroTipo);
    });
    cargarTransacciones(cuentaActiva, fechaActual, categoriaActiva, tipoActivo);
    actualizarVista();

    // Filtros
    const transparenciaFiltrado = document.getElementById("transparenciaFiltrado");

    document.querySelectorAll(".iconoFiltro").forEach(icono => {
        icono.addEventListener("click", function () {
            transparenciaFiltrado.style.display = "block";
            actualizarVista();
        });
    });

    // Cerrar popup
    document.getElementById("cerrar").addEventListener("click", function () {
        transparenciaFiltrado.style.display = "none";
        actualizarVista();
    });

    // Resetear
    document.getElementById("refrescar").addEventListener("click", function () {
        //Fecha
        document.getElementById("filtroMes").classList.remove("filtroInactivo");
        document.getElementById("filtroYear").classList.remove("filtroActivo");
        document.getElementById("filtroMes").classList.add("filtroActivo");
        document.getElementById("filtroYear").classList.add("filtroInactivo");

        // Cuentas
        let cuentas = document.querySelectorAll("#filtroCuenta p");

        cuentas.forEach(function (cuenta) {
            cuenta.classList.remove("filtroActivo");
            cuenta.classList.add("filtroInactivo");
        });

        document.getElementById("filtroTodasCuenta").classList.remove("filtroInactivo");
        document.getElementById("filtroTodasCuenta").classList.add("filtroActivo");

        // Tipos
        let tipos = document.querySelectorAll("#filtroTipo p");

        tipos.forEach(function (tipo) {
            tipo.classList.remove("filtroActivo");
            tipo.classList.add("filtroInactivo");
        });

        document.getElementById("filtroTodasTipo").classList.remove("filtroInactivo");
        document.getElementById("filtroTodasTipo").classList.add("filtroActivo");

        // Categorías
        let categorias = document.querySelectorAll("#filtroCategoria p");

        categorias.forEach(function (categoria) {
            categoria.classList.remove("filtroActivo");
            categoria.classList.add("filtroInactivo");
        });

        document.getElementById("filtroTodasCat").classList.remove("filtroInactivo");
        document.getElementById("filtroTodasCat").classList.add("filtroActivo");
        
        fechaActual = new Date();
        filtroActivo = "Mes";
        cuentaActiva = "filtroTodasCuenta";
        categoriaActiva = "filtroTodasCategoria";
        tipoActivo = "filtroTodasTipo";
    });

    // Guardar cambios y cargar transacciones acorde a los filtros
    document.getElementById("guardar").addEventListener("click", async function () {
        actualizarTituloFecha();

        transparenciaFiltrado.style.display = "none";
        actualizarVista();

        await cargarTransacciones(cuentaActiva, fechaActual, categoriaActiva, tipoActivo);
    });
});

function actualizarVista() {
    if (transparenciaFiltrado.style.display === "none" || transparenciaFiltrado.style.display === "") {
        document.querySelector("main").classList.add("main-expandido");
    } else {
        document.querySelector("main").classList.remove("main-expandido");
    }
}

async function cargarTransacciones(cuenta, fecha, categoria, tipo) {
    console.log("Fecha", fecha);
    console.log("Cuenta", cuenta);
    console.log("Tipo", tipo);
    console.log("Categoría", categoria);

    let listadoTransacciones = document.getElementById("vistaTransacciones");
    let categorias = await getCategorias();

    // Obtener el año y el mes de la fecha
    let year = fecha.getFullYear();
    let month = fecha.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    let url = `${URL}/transacciones/${idUsuario}`;

    if (filtroActivo == "Mes" && cuenta !== "filtroTodasCuenta") {
        url += `/mes/${month}/year/${year}/cuenta/${cuentaActiva}`;
    } else if (filtroActivo == "Mes" && cuenta == "filtroTodasCuenta") {
        url += `/mes/${month}/year/${year}`;
    } else if (filtroActivo !== "Mes" && cuenta !== "filtroTodasCuenta") {
        url += `/year/${year}/cuenta/${cuentaActiva}`;
    } else {
        url += `/year/${year}`;
    }

    console.log(url);
    const transaccionesResponse = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    let transacciones = await transaccionesResponse.json();
    // Quitar las transferencias
    transacciones = transacciones.filter(
        (transaccion) =>
        transaccion.tipo === "ingreso" || transaccion.tipo === "gasto"
    );

    // Filtrar por tipo
    if (tipo !== "filtroTodasTipo") {
        transacciones = transacciones.filter(transaccion => transaccion.tipo == tipo);
    }

    // Filtrar por categoría
    if (categoria !== "filtroTodasCategoria") {
        transacciones = transacciones.filter(transaccion => transaccion.idCategoria == categoria);
    }

    console.log("Transacciones filtradas", transacciones);

    let transaccionesPorFecha = transacciones.reduce((acumulador, transaccion) => {
        let fecha = transaccion.fecha; 
        if (!acumulador[fecha]) {
            acumulador[fecha] = [];
        }
        acumulador[fecha].push(transaccion);
        return acumulador;
    }, {});

    let transaccionesOrdenadasPorFecha = Object.keys(transaccionesPorFecha).sort((a, b) => {
        return new Date(b) - new Date(a); 
    });

    if (transaccionesOrdenadasPorFecha.length == 0) {
        listadoTransacciones.innerHTML = "";
        let noDatos = crearElementoTexto("No hay transacciones registradas para este período.", "p", listadoTransacciones);
        noDatos.classList.add("fuenteTransacciones", "noDatos");
    } else {
        listadoTransacciones.innerHTML = "";

        transaccionesOrdenadasPorFecha.forEach(fecha => {
            let divGrupoFecha = crearElemento("div", vistaTransacciones);
            divGrupoFecha.classList.add("grupoFecha");
    
            crearElementoTexto(formatearFecha(fecha), "h5", divGrupoFecha);
    
            transaccionesPorFecha[fecha].forEach(transaccion => {
                let divTransaccion = crearElemento("div", divGrupoFecha);
                divTransaccion.classList.add("cursor");
    
                let nombreCategoria;
                let colorCategoria;
        
                categorias.forEach(categoria => {
                    if (categoria.id === transaccion.idCategoria) {
                        nombreCategoria = categoria.nombre;
                        colorCategoria = categoria.color;
                    }
                });
        
                let circuloTransaccion = crearElemento("div", divTransaccion);
                circuloTransaccion.id = "circulo";
                circuloTransaccion.style.backgroundColor = colorCategoria;
        
                let categoriaTransaccion = crearElementoTexto(nombreCategoria, "p", divTransaccion);
                categoriaTransaccion.classList.add("fuenteTransacciones");
        
                let importe;
                if (transaccion.tipo === 'ingreso') {
                    importe = "+" + vistaDecimal(transaccion.importe);
                } else if (transaccion.tipo === 'gasto') {
                    importe = "-" + vistaDecimal(transaccion.importe);
                } else {
                    importe = vistaDecimal(transaccion.importe);
                }
        
                let importeTransaccion = crearElementoTexto(importe, "p", divTransaccion);
                importeTransaccion.classList.add("fuenteTransacciones");
    
                divTransaccion.addEventListener("click", function () {
                    localStorage.setItem("transaccionSeleccionada", JSON.stringify(transaccion));
                    localStorage.setItem("nombreCategoria", nombreCategoria);
                    localStorage.setItem("tipoEditTransaccion", "editar");
                    location.href = "../nueva_editar_transaccion.html";
                });
            });
        });
    
    }
}

function formatearFecha(fecha) {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const [year, month, day] = fecha.split("-");
    const mesTexto = meses[parseInt(month, 10) - 1];

    return `${day} de ${mesTexto}`;
}

// Función para cambiar la fecha y cargar las transacciones
async function cambiarFechaYTransacciones(incremento) {
    cambiarFecha(incremento);
    cargarTransacciones(cuentaActiva, fechaActual, categoriaActiva, tipoActivo);
}

function cambiarFecha(incremento) {
    if (filtroActivo == "Mes") {
        fechaActual.setMonth(fechaActual.getMonth() + incremento);
    } else {
        fechaActual.setFullYear(fechaActual.getFullYear() + incremento);
    }
    actualizarTituloFecha();
    cargarTransacciones(cuentaActiva, fechaActual, categoriaActiva, tipoActivo);
}

function actualizarTituloFecha() {
    const titulos = document.querySelectorAll(".tituloTipo");

    titulos.forEach(tituloTipo => {
        if (filtroActivo == "Mes") {
            const opcionesMes = { month: 'long', year: 'numeric' };
            tituloTipo.textContent = fechaActual.toLocaleDateString('es-ES', opcionesMes).toUpperCase();
        } else {
            tituloTipo.textContent = fechaActual.getFullYear().toString();
        }
    });
}

function cambiarFiltroFecha(nuevoFiltro) {
    if (nuevoFiltro == "Mes") {
        filtroMes.classList.add("filtroActivo");
        filtroMes.classList.remove("filtroInactivo");
        filtroYear.classList.add("filtroInactivo");
        filtroYear.classList.remove("filtroActivo");
    } else {
        filtroYear.classList.add("filtroActivo");
        filtroYear.classList.remove("filtroInactivo");
        filtroMes.classList.add("filtroInactivo");
        filtroMes.classList.remove("filtroActivo");
    }
    filtroActivo = nuevoFiltro;
}

function cambiarFiltroCuenta(event) {
    const elementosFiltroCuenta = document.querySelectorAll("#filtroCuenta p");
    elementosFiltroCuenta.forEach(elemento => {
        elemento.classList.remove("filtroActivo");
        elemento.classList.add("filtroInactivo");
    });

    const elementoSeleccionado = event.target;
    elementoSeleccionado.classList.add("filtroActivo");
    elementoSeleccionado.classList.remove("filtroInactivo");

    cuentaActiva = elementoSeleccionado.getAttribute("id");
}

async function cargarCuentas() {
    let cuentas = await getCuentas();

    if (cuentas.length == 0) {
        Swal.fire({
            text: "Necesitas tener al menos una cuenta para crear transacciones",
            icon: "info",
            confirmButtonColor: "#727DF3",
            cancelButtonColor: "#FC7B7F",
            confirmButtonText: "Crear cuenta",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem("tipoEditCuenta", "nueva")
                window.location.href = "../nueva_editar_cuenta.html";
            }
        });
    }

    cuentas.forEach(cuenta => {
        let divFiltroCuenta = document.getElementById("filtroCuenta");

        let cuentaP = crearElementoTexto(cuenta.nombre, "p", divFiltroCuenta);
        cuentaP.classList.add("filtroInactivo", "fuenteTransacciones");

        cuentaP.setAttribute("id", cuenta.id);

        cuentaP.addEventListener('click', cambiarFiltroCuenta);
    });

    document.getElementById("filtroTodasCuenta").addEventListener('click', cambiarFiltroCuenta);
}

function cambiarFiltroCategoria(event) {
    const elementosFiltroCategoria = document.querySelectorAll("#filtroCategoria p");
    elementosFiltroCategoria.forEach(elemento => {
        elemento.classList.remove("filtroActivo");
        elemento.classList.add("filtroInactivo");
    });

    const elementoSeleccionado = event.target;
    elementoSeleccionado.classList.add("filtroActivo");
    elementoSeleccionado.classList.remove("filtroInactivo");

    categoriaActiva = elementoSeleccionado.getAttribute("id");
}

async function cargarCategorias() {
    let categorias = await getCategorias();
    categorias = categorias.filter(categoria => categoria.nombre !== 'Transferencia');

    categorias.forEach(categoria => {
        let divFiltroCategoria = document.getElementById("filtroCategoria");

        let categoriaP = crearElementoTexto(categoria.nombre, "p", divFiltroCategoria);
        categoriaP.classList.add("filtroInactivo", "fuenteTransacciones");

        categoriaP.setAttribute("id", categoria.id);

        categoriaP.addEventListener('click', cambiarFiltroCategoria);
    });

    document.getElementById("filtroTodasCat").addEventListener('click', cambiarFiltroCategoria);
}

function cambiarFiltroTipo(event) {
    const elementosFiltroTipo = document.querySelectorAll("#filtroTipo p");
    elementosFiltroTipo.forEach(elemento => {
        elemento.classList.remove("filtroActivo");
        elemento.classList.add("filtroInactivo");
    });

    const elementoSeleccionado = event.target;
    elementoSeleccionado.classList.add("filtroActivo");
    elementoSeleccionado.classList.remove("filtroInactivo");

    tipoActivo = elementoSeleccionado.getAttribute("id");
}