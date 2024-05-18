'use strict'

import { cargarMenu, getTransacciones, crearElemento, crearElementoTexto, formateoDecimal, getCategorias } from './utils.js';
import { } from './validaciones.js';

window.addEventListener("DOMContentLoaded", async () => {
    cargarMenu();

    let btnCrearTransaccion = document.getElementById("crearTransaccion");

    btnCrearTransaccion.addEventListener("click", function () {
        localStorage.setItem("tipoEditTransaccion", "nueva");
        location.href = "../nueva_editar_transaccion.html";
    });

    let vistaTransacciones = document.getElementById("vistaTransacciones");

    let transacciones = await getTransacciones();
    let categorias = await getCategorias();
    
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
                importe = "+" + formateoDecimal(transaccion.importe);
            } else if (transaccion.tipo === 'gasto') {
                importe = "-" + formateoDecimal(transaccion.importe);
            } else {
                importe = formateoDecimal(transaccion.importe);
            }
    
            let importeTransaccion = crearElementoTexto(importe, "p", divTransaccion);
            importeTransaccion.classList.add("fuenteTransacciones");

            divTransaccion.addEventListener("click", function () {
                localStorage.setItem("transaccionSeleccionada", transaccion);
                localStorage.setItem("tipoEditTransaccion", "editar");
                location.href = "../nueva_editar_transaccion.html";
            });
        });
    });
});

function formatearFecha(fecha) {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const [year, month, day] = fecha.split("-");
    const mesTexto = meses[parseInt(month, 10) - 1];

    return `${day} de ${mesTexto}`;
}