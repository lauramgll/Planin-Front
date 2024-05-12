'use strict'

import { URL } from './utils.js';

window.addEventListener("DOMContentLoaded", () => {
    let tipoEdit = localStorage.getItem("tipoEditCuenta");
    let titulos = document.querySelectorAll(".tituloTipo");
    let btnBorrar = document.getElementById("btnBorrar");

    let txtSaldo = document.querySelector("h5");
    let nombre = document.getElementById("nombre");
    let predeterminada = document.querySelector("#predeterminada > p");

    let idCuenta = JSON.parse(localStorage.getItem("cuentaSeleccionada")).id;
    let numeroInput = document.getElementById('numeroInput');

    titulos.forEach(titulo => {
        if (tipoEdit == "nueva") {
            titulo.textContent = "NUEVA CUENTA";
            btnBorrar.style.display = "none";
            txtSaldo.textContent = "Saldo inicial";

            numeroInput.disabled = false; 
        } else {
            titulo.textContent = "EDITAR CUENTA";
            btnBorrar.style.display = "block";
            txtSaldo.textContent = "Saldo";
            nombre.value = JSON.parse(localStorage.getItem("cuentaSeleccionada")).nombre;
            numeroInput.value = JSON.parse(localStorage.getItem("cuentaSeleccionada")).saldo;
            predeterminada.textContent = JSON.parse(localStorage.getItem("cuentaSeleccionada")).predeterminada;

            if (predeterminada.textContent == "Sí") {
                predeterminada.classList.add("predeterminada");
            } else {
                predeterminada.classList.remove("predeterminada");
            }

            numeroInput.disabled = true;
        }
    });

    predeterminada.addEventListener('click', (e) => {
        e.preventDefault();
        if (predeterminada.textContent == "Sí") {
            predeterminada.textContent = "No";
            predeterminada.classList.remove("predeterminada");
        } else {
            predeterminada.textContent = "Sí";
            predeterminada.classList.add("predeterminada");
        }
    });

    numeroInput.addEventListener('input', formatoNumero);
    ajustarAncho();
    numeroInput.addEventListener("input", ajustarAncho);

    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (btn.textContent == "Editar") {
                btn.textContent = "Guardar";
                document.querySelectorAll('input').forEach(input => {
                    input.removeAttribute('readonly');
                });
            } else {
                const data = {
                    saldo: JSON.parse(localStorage.getItem("cuentaSeleccionada")).saldo,
                    nombre: nombre.value,
                    predeterminada: predeterminada.textContent,
                    idUsuario: localStorage.getItem("id")
                };

                await fetch(`${URL}/cuentas/${idCuenta}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify((data))
                })
                console.log("Cambio cuenta OK");

                btn.textContent = "Editar";
                document.querySelectorAll('input').forEach(input => {
                    input.setAttribute('readonly', 'readonly');
                });

                //location.reload();
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
    numeroInput.style.width = "110px";
    const inputWidth = numeroInput.scrollWidth + 10; 
    numeroInput.style.width = inputWidth + "px";
}

/*
// Convertir saldo a double
let numeroInputValue = numeroInput.value;
numeroInputValue = numeroInputValue.replace(',', '.');
numeroInputValue = parseFloat(numeroInputValue);
*/