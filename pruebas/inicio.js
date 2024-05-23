'use strict'

import { getsaldoCuenta, vistaDecimal, getImporteIngresos, getImporteGastos, calcularPorcentaje, getCuentas, crearElemento, crearElementoTexto, getCategorias, getListadoIngresos, getListadoGastos, cargarMenu } from './utils.js';

window.addEventListener("load", async () => {
    cargarMenu();

    const filtroMes = document.getElementById("filtroMes");
    const filtroYear = document.getElementById("filtroYear");
    const flechaIzq = document.getElementById("flechaIzquierda");
    const flechaDer = document.getElementById("flechaDerecha");

    let fechaActual = new Date();
    let filtroActivo = "Mes"; 
    let cuentaActiva = ""; 

    filtroMes.addEventListener('click', () => cambiarFiltroFecha("Mes"));
    filtroYear.addEventListener('click', () => cambiarFiltroFecha("Año"));
    flechaIzq.addEventListener('click', () => cambiarFecha(-1));
    flechaDer.addEventListener('click', () => cambiarFecha(1));
    document.getElementById("filtroTodas").addEventListener('click', cambiarFiltroCuenta);
    
    // Inicializar
    actualizarTituloFecha(filtroActivo, fechaActual);
    cargarCuentas();
    cargarTransacciones(cuentaActiva, fechaActual);

    // Vista totales
    let saldo = await getsaldoCuenta();
    document.getElementById("saldo").textContent = vistaDecimal(saldo);

    let ingresos = await getImporteIngresos();
    document.getElementById("ingresos").textContent = vistaDecimal(ingresos);

    let gastos = await getImporteGastos();
    document.getElementById("gastos").textContent = vistaDecimal(gastos);

    let total = ingresos + gastos;

    let porcentajeIngresos = calcularPorcentaje(ingresos, total)
    document.getElementById("porcentajeIngresos").textContent = porcentajeIngresos.toFixed() + '%';

    let porcentajeGastos = calcularPorcentaje(gastos, total);
    document.getElementById("porcentajeGastos").textContent = porcentajeGastos.toFixed() + '%';

    // Vista chart totales
    let yValues = [porcentajeIngresos, porcentajeGastos];

    let barColors = [
        "#50CFBC",
        "#FC7B7F",
    ];

    new Chart("chartIngresosGastos", {
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

    // // Cargar todos por defecto
    // let transacciones = await getTransacciones();
    // cargarTransacciones(transacciones);

    // Vista desglose
    document.getElementById("btnTodos").addEventListener("click", async function() {
        document.getElementById("btnTodos").classList.add("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#727DF3";

        cargarTransacciones(transacciones);

        document.getElementById("vistaChart").classList.remove("visible");
        document.getElementById("vistaTotales").classList.remove("oculto");
        document.getElementById("vistaChart").classList.add("oculto");
        document.getElementById("vistaTotales").classList.add("visible");
    });
    
    document.getElementById("btnIngresos").addEventListener("click", async function() {
        document.getElementById("btnIngresos").classList.add("ingresos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#50CFBC";

        let transaccionesIngresos = await getListadoIngresos();
        cargarTransacciones(transaccionesIngresos);

        porcentajesPorCategoria(transaccionesIngresos);

        document.getElementById("vistaChart").classList.remove("oculto");
        document.getElementById("vistaTotales").classList.remove("visible");
        document.getElementById("vistaChart").classList.add("visible");
        document.getElementById("vistaTotales").classList.add("oculto");
    });
    
    document.getElementById("btnGastos").addEventListener("click", async function() {
        document.getElementById("btnGastos").classList.add("gastos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("botonera").style.borderColor = "#FC7B7F";

        let transaccionesGastos = await getListadoGastos();
        cargarTransacciones(transaccionesGastos);

        porcentajesPorCategoria(transaccionesGastos);

        document.getElementById("vistaChart").classList.remove("oculto");
        document.getElementById("vistaTotales").classList.remove("visible");
        document.getElementById("vistaChart").classList.add("visible");
        document.getElementById("vistaTotales").classList.add("oculto");
    });

    // Filtros
    const transparenciaFiltrado = document.getElementById("transparenciaFiltrado");

    document.querySelectorAll(".iconoFiltro").forEach(icono => {
        icono.addEventListener("click", function() {
            transparenciaFiltrado.style.display = "block";
        });
    });
}) 

async function cargarTransacciones(cuenta, fecha) {
    let listadoTransacciones = document.getElementById("listado");
    let categorias = await getCategorias();

    // Obtener el año y el mes de la fecha
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1; 
    const fechaFormateada = `${year}-${month < 10 ? '0' + month : month}`;

    // Obtener las transacciones para la cuenta y la fecha seleccionadas
    const transaccionesResponse = await fetch(`${URL}/transacciones/filtradas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
    
    let transacciones = await transaccionesResponse.json();

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

function cambiarFecha(incremento, fechaActual) {
    if (filtroActivo == "Mes") {
        fechaActual.setMonth(fechaActual.getMonth() + incremento);
    } else {
        fechaActual.setFullYear(fechaActual.getFullYear() + incremento);
    }
    actualizarTituloFecha();
    cargarTransacciones();
}

function actualizarTituloFecha(filtroActivo, fechaActual) {
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

function cambiarFiltroFecha(nuevoFiltro, filtroActivo) {
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
    actualizarTituloFecha();
    cargarTransacciones();
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
    cargarTransacciones();
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
}