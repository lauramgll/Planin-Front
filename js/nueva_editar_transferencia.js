'use strict'

import { URL, cargarMenu, getCuentas, crearElementoTexto, checkUser } from './utils.js';
import { } from './validaciones.js';

window.addEventListener("DOMContentLoaded", async () => {
    checkUser();
    cargarMenu();

    let fecha = document.getElementById("fecha");
    fecha.value = new Date().toISOString().split('T')[0];

    let numeroInput = document.getElementById('numeroInput');

    numeroInput.addEventListener('input', formatoNumero);
    ajustarAncho();
    numeroInput.addEventListener("input", ajustarAncho);

    // Cuentas usuario
    let cuentas = await getCuentas();

    // Ordenar las cuentas, colocando la predeterminada primero
    cuentas.sort((a, b) => {
        if (a.predeterminada === "Sí" && b.predeterminada !== "Sí") {
            return -1; 
        } else if (a.predeterminada !== "Sí" && b.predeterminada === "Sí") {
            return 1; 
        } else {
            return 0; 
        }
    });

    cuentas.forEach(cuenta => {
        let listadoTransferenciaOrigen = document.getElementById("transferenciaOrigen");
        let option = crearElementoTexto(cuenta.nombre, "option", listadoTransferenciaOrigen);
        option.value = cuenta.id;

        actualizarCuentasDestino(cuentas);
    });

    document.getElementById("transferenciaOrigen").addEventListener("change", function() {
        actualizarCuentasDestino(cuentas);
    });

    let error = document.getElementById("errorTransferencia");

    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();

            if(numeroInput.value !== "0,00") {
                const importe = parseFloat(numeroInput.value.replace(/\./g, '').replace(',', '.'));
                const idCuentaOrigen = document.getElementById("transferenciaOrigen").value;
                const idCuentaDestino = document.getElementById("transferenciaDestino").value;

                const saldoCuentaOrigen = await obtenerCuenta(idCuentaOrigen);

                if (importe <= saldoCuentaOrigen.saldo) {
                    error.style.display = "none";

                    const dataOrigen = {
                        idCategoria: 11,
                        fecha: fecha.value,
                        tipo: "transferencia_origen",
                        importe: importe,
                        idUsuario: localStorage.getItem("id"),
                        idCuenta: idCuentaOrigen
                    };

                    const dataDestino = {
                        idCategoria: 11,
                        fecha: fecha.value,
                        tipo: "transferencia_destino",
                        importe: importe,
                        idUsuario: localStorage.getItem("id"),
                        idCuenta: idCuentaDestino
                    };

                    const data = [dataOrigen, dataDestino];
                    console.log(data);

                    let response = await fetch(`${URL}/transacciones/crearTransacciones`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify((data))
                    });

                    if(response.ok) {
                        console.log("Transferencia creada OK");
                        let responseActualizacion = await actualizarSaldosCuentas(idCuentaOrigen, idCuentaDestino, importe);
                        if(response.ok) {
                            location.href = "../cuentas.html";
                        }
                    }
                } else {
                    error.style.display = "block";
                }
            } else {
                location.href = "../cuentas.html";
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

function actualizarCuentasDestino(cuentas) {
    const selectCuentaOrigen = document.getElementById("transferenciaOrigen");
    const selectCuentaDestino = document.getElementById("transferenciaDestino");

    const cuentaSeleccionada = selectCuentaOrigen.value;

    selectCuentaDestino.innerHTML = "";

    // Filtrar la lista de cuentas para excluir la cuenta seleccionada
    const cuentasFiltradas = cuentas.filter(cuenta => cuenta.id != cuentaSeleccionada);

    cuentasFiltradas.forEach(cuenta => {
        let listadoTransferenciaDestino = document.getElementById("transferenciaDestino");
        let option = crearElementoTexto(cuenta.nombre, "option", listadoTransferenciaDestino);
        option.value = cuenta.id;
    });
}

async function actualizarSaldosCuentas(idCuentaOrigen, idCuentaDestino, importe) {
    const cuentaOrigen = await obtenerCuenta(idCuentaOrigen);
    const cuentaDestino = await obtenerCuenta(idCuentaDestino);
    console.log(cuentaOrigen);
    console.log(cuentaDestino);

    // Actualizar los saldos
    cuentaOrigen.saldo -= importe;
    cuentaDestino.saldo += importe;

    await Promise.all([
        fetch(`${URL}/cuentas/${idCuentaOrigen}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuentaOrigen)
        }),
        fetch(`${URL}/cuentas/${idCuentaDestino}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuentaDestino)
        })
    ]);
}

async function obtenerCuenta(idCuenta) {
    const response = await fetch(`${URL}/cuentas/${idCuenta}`);
    return await response.json();
}