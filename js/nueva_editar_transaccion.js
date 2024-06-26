'use strict'

import { URL, cargarMenu, getCuentas, crearElementoTexto, checkUser } from './utils.js';
import { validaCategoria, validaFecha, mostrarErroresTransaccion } from './validaciones.js';

window.addEventListener("DOMContentLoaded", async () => {
    checkUser();
    cargarMenu();

    let tipoEdit = localStorage.getItem("tipoEditTransaccion");
    let titulos = document.querySelectorAll(".tituloTipo");
    let btnBorrar = document.getElementById("btnBorrar");
    let flechaCategoria = document.getElementById("flechaCategoria");

    let idCategoria = localStorage.getItem("idCategoria");
    let transaccionSeleccionada = JSON.parse(localStorage.getItem("transaccionSeleccionada"));
    console.log(transaccionSeleccionada);
    let numeroInput = document.getElementById('numeroInput');
    let categoria = document.getElementById("categoriaSeleccionada");
    let fecha = document.getElementById("fecha");
    fecha.value = new Date().toISOString().split('T')[0];
    let notas = document.getElementById("textAreaNotas");

    // Cuentas usuario
    let cuentas = await getCuentas();
    let listadoCuentas = document.getElementById("cuentas");

    // Si ya ha ido a la página de categorías, para no perder los datos que ya haya seleccionado previamente comprobar si hay algo guardado
    let importeTransaccion = localStorage.getItem("importeTransaccion");
    let fechaTransaccion = localStorage.getItem("fechaTransaccion"); 
    let notasTransaccion = localStorage.getItem("notasTransaccion");

    if(importeTransaccion != null) {
        numeroInput.value = importeTransaccion;
    }
    if(fechaTransaccion != null) {
        fecha.value = fechaTransaccion;
    }
    if(notasTransaccion != null) {
        notas.value = notasTransaccion;
    }

    titulos.forEach(titulo => {
        if (tipoEdit == "nueva") {
            titulo.textContent = "NUEVA TRANSACCIÓN";
            btnBorrar.style.display = "none";
            flechaCategoria.style.display = "block";

            cuentas.sort((a, b) => {
                if (a.predeterminada === "Sí" && b.predeterminada !== "Sí") {
                    return -1; 
                } else if (a.predeterminada !== "Sí" && b.predeterminada === "Sí") {
                    return 1; 
                } else {
                    return 0; 
                }
            });

            listadoCuentas.innerHTML = "";

            cuentas.forEach(cuenta => {
                let option = crearElementoTexto(cuenta.nombre, "option", listadoCuentas);
                option.value = cuenta.id;
            });

            // Elegir categoría
            document.getElementById("elegirCat").addEventListener('click', () => {
                importeTransaccion = localStorage.setItem("importeTransaccion", numeroInput.value);
                fechaTransaccion = localStorage.setItem("fechaTransaccion", fecha.value);
                notasTransaccion = localStorage.setItem("notasTransaccion", notas.value);
                window.location.href = "../categorias.html";
            });

            if(idCategoria != null) {
                categoria.textContent = localStorage.getItem("nombreCategoria");
                categoria.style.color = "#5F5F5F";
                flechaCategoria.style.display = "none";
            }
        } else {
            titulo.textContent = "EDITAR TRANSACCIÓN";
            btnBorrar.style.display = "block";
            numeroInput.value = transaccionSeleccionada.importe.toFixed(2).toString().replace('.', ',');
            categoria.textContent = localStorage.getItem("nombreCategoria");
            categoria.style.color = "#5F5F5F";
            flechaCategoria.style.display = "none";
            fecha.value = transaccionSeleccionada.fecha;
            notas.value = transaccionSeleccionada.notas;

            document.getElementById("elegirCat").addEventListener('click', () => {
                window.location.href = "../categorias.html";
            });
            
            let idCuentaSeleccionada = transaccionSeleccionada.idCuenta;

            // Mover la cuenta seleccionada al inicio
            let cuentaSeleccionada = cuentas.find(cuenta => cuenta.id == idCuentaSeleccionada);
            if (cuentaSeleccionada) {
                cuentas = [cuentaSeleccionada, ...cuentas.filter(cuenta => cuenta.id != idCuentaSeleccionada)];
            }

            listadoCuentas.innerHTML = "";

            cuentas.forEach(cuenta => {
                let option = crearElementoTexto(cuenta.nombre, "option", listadoCuentas);
                option.value = cuenta.id;
            });
        }
    });

    numeroInput.addEventListener('input', formatoNumero);
    ajustarAncho();
    numeroInput.addEventListener("input", ajustarAncho);

    let tipoTransaccion;
    if (transaccionSeleccionada !== null) {
        tipoTransaccion = transaccionSeleccionada.tipo;
    } else {
        tipoTransaccion = localStorage.getItem("tipoTransaccion");
    }

    if((tipoTransaccion == "ingreso")){
        document.getElementById("ingreso").style.border = "1px solid #50CFBC";
        document.getElementById("gasto").style.border = "1px solid rgba(95, 95, 95, 0.20)";
        localStorage.setItem("tipoTransaccion", "ingreso");
    } else {
        document.getElementById("gasto").style.border = "1px solid #FC7B7F";
        document.getElementById("ingreso").style.border = "1px solid rgba(95, 95, 95, 0.20)";
        localStorage.setItem("tipoTransaccion", "gasto");
    }

    document.getElementById("ingreso").addEventListener('click', () => {
        document.getElementById("ingreso").style.border = "1px solid #50CFBC";
        document.getElementById("gasto").style.border = "1px solid rgba(95, 95, 95, 0.20)";
        localStorage.setItem("tipoTransaccion", "ingreso");
    });

    document.getElementById("gasto").addEventListener('click', () => {
        document.getElementById("gasto").style.border = "1px solid #FC7B7F";
        document.getElementById("ingreso").style.border = "1px solid rgba(95, 95, 95, 0.20)";
        localStorage.setItem("tipoTransaccion", "gasto");
    });


    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (tipoEdit == "nueva") { 
                // TRANSACCIÓN NUEVA
                let errores = validaTransaccion(categoria.textContent, fecha.value);
                console.log(errores);
                
                if (Object.keys(errores).length > 0) {
                    mostrarErroresTransaccion("categoria", errores);
                    mostrarErroresTransaccion("fecha", errores);
                } else {
                    if (numeroInput.value != "0,00") {
                        const dataNueva = {
                            idCuenta: listadoCuentas.value,
                            idCategoria: idCategoria,
                            fecha: fecha.value,
                            tipo: localStorage.getItem("tipoTransaccion"),
                            importe: parseFloat(numeroInput.value.replace(/\./g, '').replace(',', '.')),
                            notas: notas.value
                        };
    
                        console.log(dataNueva);
    
                        await fetch(`${URL}/transacciones/crearTransaccion`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify((dataNueva))
                        })
                        console.log("Transacción creada OK");
                        localStorage.removeItem("idCategoria");
                        localStorage.removeItem("tipoTransaccion");
                    }
                    localStorage.removeItem("idCategoria");
                    localStorage.removeItem("tipoTransaccion");
                    window.location.href = "../transacciones.html";
                }
            } else {
                // EDITAR TRANSACCIÓN
                let idCat;
                if (idCategoria == null) {
                    idCat = transaccionSeleccionada.idCategoria;
                } else {
                    idCat = localStorage.getItem("idCategoria");
                };

                let errores = validaTransaccion(categoria.textContent, fecha.value);
                console.log(errores);
                
                if (Object.keys(errores).length > 0) {
                    mostrarErroresTransaccion("categoria", errores);
                    mostrarErroresTransaccion("fecha", errores);
                } else {
                    if (numeroInput.value != "0,00") {

                    const dataEditar = {
                        idCuenta: listadoCuentas.value,
                        idCategoria: idCat,
                        fecha: fecha.value,
                        tipo: localStorage.getItem("tipoTransaccion"),
                        importe: parseFloat(numeroInput.value.replace(/\./g, '').replace(',', '.')),
                        notas: notas.value
                    };

                    await fetch(`${URL}/transacciones/${transaccionSeleccionada.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify((dataEditar))
                    })
                    console.log("Cambio transacción OK");
                    localStorage.removeItem("idCategoria");
                    localStorage.removeItem("tipoTransaccion");
                    window.location.href = "../transacciones.html";
                    }
                }
            }
        });
    });

    // Borrar transacción
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
                await fetch(`${URL}/transacciones/${transaccionSeleccionada.id}`, {
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

function validaTransaccion(categoria, fecha) {
    const errores = {};

    validaCategoria(categoria, errores);
    validaFecha(fecha, errores);

    return errores;
}