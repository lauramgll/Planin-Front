'use strict'

import { URL, cargarMenu, checkUser, getCuentas } from './utils.js';
import { validaNombre, mostrarErroresNombreCuenta } from './validaciones.js';

window.addEventListener("DOMContentLoaded", () => {
    checkUser();
    cargarMenu();

    let tipoEdit = localStorage.getItem("tipoEditCuenta");
    let titulos = document.querySelectorAll(".tituloTipo");
    let btnBorrar = document.getElementById("btnBorrar");

    let txtSaldo = document.querySelector("h5");
    let nombre = document.getElementById("nombre");
    let predeterminada = document.querySelector("#predeterminada > p");

    let idCuenta;
    if(localStorage.getItem("cuentaSeleccionada") != null) {
        idCuenta = JSON.parse(localStorage.getItem("cuentaSeleccionada")).id;
    }
    
    let numeroInput = document.getElementById('numeroInput');

    titulos.forEach(titulo => {
        if (tipoEdit == "nueva") {
            titulo.textContent = "NUEVA CUENTA";
            btnBorrar.style.display = "none";
            txtSaldo.textContent = "Saldo inicial";
            predeterminada.textContent = "No";

            numeroInput.disabled = false; 
        } else {
            titulo.textContent = "EDITAR CUENTA";
            btnBorrar.style.display = "block";
            txtSaldo.textContent = "Saldo";
            nombre.value = JSON.parse(localStorage.getItem("cuentaSeleccionada")).nombre;

            let cuentaSeleccionada = JSON.parse(localStorage.getItem("cuentaSeleccionada"));
            if (cuentaSeleccionada.saldo != null) {
                numeroInput.value = (JSON.parse(localStorage.getItem("cuentaSeleccionada")).saldo).toFixed(2).toString().replace('.', ',');
            } else {
                numeroInput.value = "0,00";
            }
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

    let redireccion = false;
    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (tipoEdit == "nueva") { 
                // CUENTA NUEVA
                let errores =  validaNombreCuenta(nombre.value); 
                console.log(errores);

                if (Object.keys(errores).length > 0) {
                    mostrarErroresNombreCuenta(nombre, errores);
                } else {
                    const dataNueva = {
                        saldoInicial: parseFloat(numeroInput.value.replace(/\./g, '').replace(',', '.')),
                        saldo: 0.00,
                        nombre: nombre.value,
                        predeterminada: predeterminada.textContent,
                        idUsuario: localStorage.getItem("id")
                    };

                    const cuentaResponse = await fetch(`${URL}/cuentas/crearCuenta`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify((dataNueva))
                    })
                    console.log("Cuenta creada OK");

                    const nuevaCuenta = await cuentaResponse.json();
                    idCuenta = nuevaCuenta.id;
                    console.log(idCuenta);
                    redireccion = true;
                }
            } else {
                // EDITAR CUENTA
                let errores =  validaNombreCuenta(nombre.value); 
                console.log(errores);

                if (Object.keys(errores).length > 0) {
                    mostrarErroresNombreCuenta(nombre, errores);
                } else {
                    const dataEditar = {
                        saldoInicial: JSON.parse(localStorage.getItem("cuentaSeleccionada")).saldoInicial,
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
                        body: JSON.stringify((dataEditar))
                    })
                    console.log("Cambio cuenta OK");
                    redireccion = true;
                }
            }

            // Cambio resto cuentas a predeterminada: no
            if(predeterminada.textContent == "Sí") {
                const cuentas = await getCuentas();
                const cuentasPorActualizar = cuentas.filter(cuenta => cuenta.id != idCuenta);
                
                const updatePromises = cuentasPorActualizar.map(cuenta => {
                    cuenta.predeterminada = "No";
                    console.log(cuenta);
                    return fetch(`${URL}/cuentas/${cuenta.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(cuenta)
                    });
                });

                await Promise.all(updatePromises);
            }

            if(redireccion) {
                location.href = "../cuentas.html";
            }
        });
    });

    // Borrar cuenta
    btnBorrar.addEventListener('click', (e) => {
        Swal.fire({
            text: "Vas a borrar la cuenta, ¿seguro que quieres hacerlo?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#727DF3",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#FC7B7F",
            confirmButtonText: "Borrar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await fetch(`${URL}/cuentas/${idCuenta}`, {
                    method: 'DELETE',
                    headers: {
                    'Content-Type': 'application/json'
                    }
                });
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

function validaNombreCuenta(campo) {
    const errores = {};

    validaNombre(campo, errores);

    return errores;
}