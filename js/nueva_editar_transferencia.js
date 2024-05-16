'use strict'

import { URL, cargarMenu, getCuentas } from './utils.js';
import { validaNombre, mostrarErroresNombreCuenta } from './validaciones.js';

window.addEventListener("DOMContentLoaded", () => {
    cargarMenu();

    let numeroInput = document.getElementById('numeroInput');

    numeroInput.addEventListener('input', formatoNumero);
    ajustarAncho();
    numeroInput.addEventListener("input", ajustarAncho);
});

function formatoNumero() {
    let input = document.getElementById('numeroInput');
    let valor = input.value.replace(/[^\d]/g, ''); // Eliminar caracteres no numéricos
    let longitud = valor.length;

    // Eliminar los ceros iniciales
    while (valor.length > 1 && valor[0] === '0') {
        valor = valor.substring(1);
    }

    // Si la longitud del valor es 0, mostrar 0,00
    if (valor.length === 0) {
        input.value = '0,00';
        return;
    }

    // Insertar la coma en la posición correcta
    if (longitud <= 2) {
        input.value = '0,' + (longitud === 1 ? '0' + valor : valor);
    } else {
        let comaPosition = longitud - 2;
        let newValue = valor.substring(0, comaPosition) + ',' + valor.substring(comaPosition);

        // Insertar los puntos para los millares, millones, etc.
        let puntos = [];
        for (let i = newValue.length - 6; i > 0; i -= 3) {
            puntos.push(i);
        }
        puntos.forEach(index => {
            newValue = newValue.substring(0, index) + '.' + newValue.substring(index);
        });

        input.value = newValue;
    }
}

function ajustarAncho() {
    const value = numeroInput.value;
    const inputWidth = value.length * 14 + 25;
    numeroInput.style.width = inputWidth + "px";
}