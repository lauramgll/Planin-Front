'use strict'

import { URL, vistaDecimal, getImporte, calcularPorcentaje, getCuentas, crearElemento, crearElementoTexto, getCategorias, cargarMenu } from './utils.js';

let fechaActual = new Date();
let filtroActivo = "Mes";
let cuentaActiva = "filtroTodas";
let idUsuario = localStorage.getItem("id");

window.addEventListener("DOMContentLoaded", async () => {
    cargarMenu();

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
    cargarTransaccionesSegunFiltro();

    // Vista desglose
    document.getElementById("btnTodos").addEventListener("click", async function () {
        document.getElementById("btnTodos").classList.add("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#727DF3";

        cargarTransaccionesSegunFiltro();

        document.getElementById("vistaChart").classList.remove("visible");
        document.getElementById("vistaTotales").classList.remove("oculto");
        document.getElementById("vistaChart").classList.add("oculto");
        document.getElementById("vistaTotales").classList.add("visible");
    });

    document.getElementById("btnIngresos").addEventListener("click", async function () {
        document.getElementById("btnIngresos").classList.add("ingresos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#50CFBC";

        cargarTransaccionesSegunFiltro();

        document.getElementById("vistaChart").classList.remove("oculto");
        document.getElementById("vistaTotales").classList.remove("visible");
        document.getElementById("vistaChart").classList.add("visible");
        document.getElementById("vistaTotales").classList.add("oculto");
    });

    document.getElementById("btnGastos").addEventListener("click", async function () {
        document.getElementById("btnGastos").classList.add("gastos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("botonera").style.borderColor = "#FC7B7F";

        cargarTransaccionesSegunFiltro();

        document.getElementById("vistaChart").classList.remove("oculto");
        document.getElementById("vistaTotales").classList.remove("visible");
        document.getElementById("vistaChart").classList.add("visible");
        document.getElementById("vistaTotales").classList.add("oculto");
    });

    // Filtros
    const transparenciaFiltrado = document.getElementById("transparenciaFiltrado");

    document.querySelectorAll(".iconoFiltro").forEach(icono => {
        icono.addEventListener("click", function () {
            transparenciaFiltrado.style.display = "block";
        });
    });

    // Cerrar popup
    document.getElementById("cerrar").addEventListener("click", function () {
        transparenciaFiltrado.style.display = "none";
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

        document.getElementById("filtroTodas").classList.remove("filtroInactivo");
        document.getElementById("filtroTodas").classList.add("filtroActivo");

        fechaActual = new Date();
        filtroActivo = "Mes";
        cuentaActiva = "filtroTodas";
    });

    // Guardar cambios y cargar transacciones acorde a los filtros
    document.getElementById("guardar").addEventListener("click", async function () {
        actualizarTituloFecha();

        transparenciaFiltrado.style.display = "none";

        await cargarTransaccionesSegunFiltro();
    });
})

// Función para cargar las transacciones según el filtro seleccionado
function cargarTransaccionesSegunFiltro() {
    if (document.getElementById("btnTodos").classList.contains("todos")) {
        cargarTransacciones(cuentaActiva, fechaActual);
    } else if (document.getElementById("btnIngresos").classList.contains("ingresos")) {
        cargarTransacciones(cuentaActiva, fechaActual, "ingreso");
    } else if (document.getElementById("btnGastos").classList.contains("gastos")) {
        cargarTransacciones(cuentaActiva, fechaActual, "gasto");
    }
}

// Función para cambiar la fecha y cargar las transacciones
async function cambiarFechaYTransacciones(incremento) {
    cambiarFecha(incremento);
    cargarTransaccionesSegunFiltro();
}

async function cargarTransacciones(cuenta, fecha, tipo = "") {
    let listadoTransacciones = document.getElementById("listado");
    let categorias = await getCategorias();

    // Obtener el año y el mes de la fecha
    let year = fecha.getFullYear();
    let month = fecha.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    let url = `${URL}/transacciones/${idUsuario}`;

    if (filtroActivo == "Mes" && cuenta !== "filtroTodas") {
        url += `/mes/${month}/year/${year}/cuenta/${cuentaActiva}`;
    } else if (filtroActivo == "Mes" && cuenta == "filtroTodas") {
        url += `/mes/${month}/year/${year}`;
    } else if (filtroActivo !== "Mes" && cuenta !== "filtroTodas") {
        url += `/year/${year}/cuenta/${cuentaActiva}`;
    } else {
        url += `/year/${year}`;
    }

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

    // Cargar datos vista totales
    vistaTotales(transacciones);

    // Filtrar por tipo
    if (tipo) {
        transacciones = transacciones.filter(transaccion => transaccion.tipo == tipo);
        await porcentajesPorCategoria(transacciones);
    }

    console.log(transacciones);

    if (transacciones.length == 0) {
        listadoTransacciones.innerHTML = "";
        let noDatos = crearElementoTexto("No hay transacciones registradas para este período.", "p", listadoTransacciones);
        noDatos.classList.add("fuenteTransacciones", "noDatos");
    } else {
        listadoTransacciones.innerHTML = "";

        transacciones.forEach(transaccion => {
            let divTransaccion = crearElemento("div", listadoTransacciones);

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
                console.log(importe);
            } else if (transaccion.tipo === 'gasto') {
                importe = "-" + vistaDecimal(transaccion.importe);
            } else {
                importe = vistaDecimal(transaccion.importe);
            }

            let importeTransaccion = crearElementoTexto(importe, "p", divTransaccion);
            importeTransaccion.classList.add("fuenteTransacciones");
        });
    }

    async function porcentajesPorCategoria(transacciones) {
        let categorias = await getCategorias();

        let totalesPorCategoria = {};

        transacciones.forEach(transaccion => {
            if (totalesPorCategoria[transaccion.idCategoria]) {
                totalesPorCategoria[transaccion.idCategoria] += transaccion.importe;
            } else {
                totalesPorCategoria[transaccion.idCategoria] = transaccion.importe;
            }
        });

        let totalImporte = Object.values(totalesPorCategoria).reduce((totales, total) => totales + total, 0);

        // Ordenar las categorías de mayor a menor porcentaje
        categorias.sort((a, b) => {
            let porcentajeA = totalesPorCategoria[a.id] ? (totalesPorCategoria[a.id] / totalImporte) * 100 : 0;
            let porcentajeB = totalesPorCategoria[b.id] ? (totalesPorCategoria[b.id] / totalImporte) * 100 : 0;
            return porcentajeB - porcentajeA;
        });

        let categoriasHTML = "";
        let yValues = [];
        let barColors = [];

        for (let categoria of categorias) {
            let porcentaje = totalesPorCategoria[categoria.id] ? (totalesPorCategoria[categoria.id] / totalImporte) * 100 : 0;
            let color = categoria.color;

            if (porcentaje > 0) {
                categoriasHTML += `
                    <p class="porcentajes">${porcentaje.toFixed()}%</p>
                    <div id="circulo2" style="background-color: ${color}"></div>
                    <p class="fuentePeque">${categoria.nombre}</p>
                `;
                yValues.push(porcentaje.toFixed(2));
                barColors.push(color);
            }
        }

        document.getElementById("categorias").innerHTML = categoriasHTML;

        // Crear el chart
        new Chart("chartCategorias", {
            type: "doughnut",
            data: {
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues,
                    borderWidth: 0
                }]
            },
            options: {
                tooltips: { enabled: false },
                hover: { mode: null },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

function cambiarFecha(incremento) {
    if (filtroActivo == "Mes") {
        fechaActual.setMonth(fechaActual.getMonth() + incremento);
    } else {
        fechaActual.setFullYear(fechaActual.getFullYear() + incremento);
    }
    actualizarTituloFecha();
    cargarTransacciones(cuentaActiva, fechaActual);
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

    cuentas.forEach(cuenta => {
        let divFiltroCuenta = document.getElementById("filtroCuenta");

        let cuentaP = crearElementoTexto(cuenta.nombre, "p", divFiltroCuenta);
        cuentaP.classList.add("filtroInactivo", "fuenteTransacciones");

        cuentaP.setAttribute("id", cuenta.id);

        cuentaP.addEventListener('click', cambiarFiltroCuenta);
    });

    document.getElementById("filtroTodas").addEventListener('click', cambiarFiltroCuenta);
}

function vistaTotales(transacciones) {
    const ingresos = transacciones.filter(transaccion => transaccion.tipo === 'ingreso');
    const gastos = transacciones.filter(transaccion => transaccion.tipo === 'gasto');

    let importeIngresos = getImporte(ingresos);
    let importeGastos = getImporte(gastos);
    console.log("Ingresos", importeIngresos);
    console.log("Gastos", importeGastos);

    // Vista totales
    let saldo = importeIngresos - importeGastos;
    document.getElementById("saldo").textContent = vistaDecimal(saldo);

    document.getElementById("ingresos").textContent = vistaDecimal(importeIngresos);

    document.getElementById("gastos").textContent = vistaDecimal(importeGastos);

    let total = importeIngresos + importeGastos;
    let porcentajeIngresos = calcularPorcentaje(importeIngresos, total);
    let porcentajeGastos = calcularPorcentaje(importeGastos, total);

    if (importeIngresos == 0 && importeGastos == 0) {
        document.getElementById("porcentajeIngresos").textContent = '0%';
        document.getElementById("porcentajeGastos").textContent = '0%';
        porcentajeIngresos = 0;
        porcentajeGastos = 0;
    } else if (importeIngresos == 0) {
        document.getElementById("porcentajeIngresos").textContent = '0%';
        document.getElementById("porcentajeGastos").textContent = porcentajeGastos.toFixed() + '%';
        porcentajeIngresos = 0;
    } else if (importeGastos == 0) {
        document.getElementById("porcentajeGastos").textContent = '0%';
        document.getElementById("porcentajeIngresos").textContent = porcentajeIngresos.toFixed() + '%';
        porcentajeGastos = 0;
    } else {
        document.getElementById("porcentajeIngresos").textContent = porcentajeIngresos.toFixed() + '%';
        document.getElementById("porcentajeGastos").textContent = porcentajeGastos.toFixed() + '%';
    }

    // Vista chart totales
    let yValues = [porcentajeIngresos, porcentajeGastos];

    let barColors = [
        "#50CFBC",
        "#FC7B7F",
    ];

    // Verificar si no hay datos
    let isEmpty = yValues.every(value => value === 0);

    let data;
    if (isEmpty) {
        data = {
            datasets: [{
                backgroundColor: ["#D9D9D9"], 
                data: [100], 
                borderWidth: 0,
            }],
        };
    } else {
        data = {
            datasets: [{
                backgroundColor: barColors,
                data: yValues,
                borderWidth: 0,
            }],
        };
    }

    // Mostrar gráfico
    new Chart("chartIngresosGastos", {
        type: "doughnut",
        data: data,
        options: {
            tooltips: { enabled: false },
            hover: { mode: null },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}