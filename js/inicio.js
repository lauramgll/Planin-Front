'use strict'

import { getSaldo, formateoDecimal, getImporteIngresos, getImporteGastos, calcularPorcentaje, getTransacciones, crearElemento, crearElementoTexto, getCategorias, getListadoIngresos, getListadoGastos } from './utils.js';

window.addEventListener("load", async () => {

    // Vista totales
    let saldo = await getSaldo();
    document.getElementById("saldo").textContent = formateoDecimal(saldo);

    let ingresos = await getImporteIngresos();
    document.getElementById("ingresos").textContent = formateoDecimal(ingresos);

    let gastos = await getImporteGastos();
    document.getElementById("gastos").textContent = formateoDecimal(gastos);

    let total = ingresos + gastos;

    let porcentajeIngresos = calcularPorcentaje(ingresos, total)
    document.getElementById("porcentajeIngresos").textContent = porcentajeIngresos.toFixed() + '%';

    let porcentajeGastos = calcularPorcentaje(gastos, total);
    document.getElementById("porcentajeGastos").textContent = porcentajeGastos.toFixed() + '%';

    // Vista chart
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

    // Cargar todos por defecto
    let transacciones = await getTransacciones();
    cargarTransacciones(transacciones);

    // Vista desglose
    document.getElementById("btnTodos").addEventListener("click", async function() {
        document.getElementById("btnTodos").classList.add("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#727DF3";

        cargarTransacciones(transacciones);
    });
    
    document.getElementById("btnIngresos").addEventListener("click", async function() {
        document.getElementById("btnIngresos").classList.add("ingresos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnGastos").classList.remove("gastos");
        document.getElementById("botonera").style.borderColor = "#50CFBC";

        let transaccionesIngresos = await getListadoIngresos();
        cargarTransacciones(transaccionesIngresos);
    });
    
    document.getElementById("btnGastos").addEventListener("click", async function() {
        document.getElementById("btnGastos").classList.add("gastos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("botonera").style.borderColor = "#FC7B7F";

        let transaccionesGastos = await getListadoGastos();
        cargarTransacciones(transaccionesGastos);
    });

    // Filtros
    const transparenciaFiltradoPC = document.getElementById("transparenciaFiltradoPC");
    const transparenciaFiltradoMovil = document.getElementById("transparenciaFiltradoMovil");

    document.getElementById("iconoFiltroMovil").addEventListener("click", function() {
        transparenciaFiltradoMovil.style.display = "block";
        transparenciaFiltradoPC.style.display = "none";
    });
    
    document.getElementById("iconoFiltroPC").addEventListener("click", function() {
        transparenciaFiltradoPC.style.display = "block";
        transparenciaFiltradoMovil.style.display = "none";
    });
}) 

async function cargarTransacciones(transacciones) {
    let listadoTransacciones = document.getElementById("listado");
    let categorias = await getCategorias();

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
            importe = "+" + formateoDecimal(transaccion.importe);
        } else if (transaccion.tipo === 'gasto') {
            importe = "-" + formateoDecimal(transaccion.importe);
        } else {
            importe = formateoDecimal(transaccion.importe);
        }

        let importeTransaccion = crearElementoTexto(importe, "p", divTransaccion);
        importeTransaccion.classList.add("fuenteTransacciones");
    });
}