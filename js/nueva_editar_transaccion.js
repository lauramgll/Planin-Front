'use strict'

import { URL, cargarMenu } from './utils.js';
import { } from './validaciones.js';

window.addEventListener("DOMContentLoaded", () => {
    cargarMenu();

    let tipoEdit = localStorage.getItem("tipoEditTransaccion");
    let titulos = document.querySelectorAll(".tituloTipo");
    let btnBorrar = document.getElementById("btnBorrar");
    let flechaCategoria = document.getElementById("flechaCategoria");

    let transaccionSeleccionada = JSON.parse(localStorage.getItem("transaccionSeleccionada"));
    console.log(transaccionSeleccionada);
    let numeroInput = document.getElementById('numeroInput');
    let categoria = document.getElementById("categoriaSeleccionada");
    let fecha = document.getElementById("fecha");
    let notas = document.getElementById("textAreaNotas");

    titulos.forEach(titulo => {
        if (tipoEdit == "nueva") {
            titulo.textContent = "NUEVA TRANSACCIÓN";
            btnBorrar.style.display = "none";
            flechaCategoria.style.display = "block";
        } else {
            titulo.textContent = "EDITAR TRANSACCIÓN";
            btnBorrar.style.display = "block";
            numeroInput.value = transaccionSeleccionada.importe.toFixed(2).toString().replace('.', ',');
            categoria.textContent = localStorage.getItem("nombreCategoria");
            categoria.style.color = "#5F5F5F";
            flechaCategoria.style.display = "none";
            fecha.value = transaccionSeleccionada.fecha;
            notas.value = transaccionSeleccionada.notas;

            // Cargar todas las cuentas y poner la primera la cuenta que está dentro transaccionSeleccionada
        }
    });

    numeroInput.addEventListener('input', formatoNumero);
    ajustarAncho();
    numeroInput.addEventListener("input", ajustarAncho);

    let tipoTransaccion = transaccionSeleccionada.tipo;

    if((tipoTransaccion == "ingreso") || (tipoEdit == "nueva")){
        document.getElementById("ingreso").style.border = "1px solid #50CFBC";
        document.getElementById("gasto").style.border = "1px solid rgba(95, 95, 95, 0.20)";
    } else {
        document.getElementById("gasto").style.border = "1px solid #FC7B7F";
        document.getElementById("ingreso").style.border = "1px solid rgba(95, 95, 95, 0.20)";
    }

    document.getElementById("ingreso").addEventListener('click', () => {
        document.getElementById("ingreso").style.border = "1px solid #50CFBC";
        document.getElementById("gasto").style.border = "1px solid rgba(95, 95, 95, 0.20)";
    });

    document.getElementById("gasto").addEventListener('click', () => {
        document.getElementById("gasto").style.border = "1px solid #FC7B7F";
        document.getElementById("ingreso").style.border = "1px solid rgba(95, 95, 95, 0.20)";
    });


    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (tipoEdit == "nueva") { 
                // TRANSACCIÓN NUEVA
                // Validar errores
                // Guardar transacción
            } else {
                // EDITAR TRANSACCIÓN
                // Validar errores
                // Guardar transacción
            }
        });
    });

    // Borrar cuenta
    btnBorrar.addEventListener('click', (e) => {
        Swal.fire({
            text: "Vas a borrar la transacción, ¿seguro que quieres hacerlo?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#727DF3",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#FC7B7F",
            confirmButtonText: "Borrar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await fetch(`${URL}/transaccion/${idTransaccion}`, {
                    method: 'DELETE',
                    headers: {
                    'Content-Type': 'application/json'
                    }
                });
            location.href = "../transacciones.html";
            }
        });
    });
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