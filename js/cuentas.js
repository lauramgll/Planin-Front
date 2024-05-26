'use strict'

import { URL, getCuentas, crearElemento, crearElementoTexto, vistaDecimal, cargarMenu, getTransacciones, checkUser } from './utils.js';

window.addEventListener("DOMContentLoaded", async () => {
    checkUser();
    cargarMenu();

    // Cuentas usuario
    let cuentas = await getCuentas();
    await actualizarSaldoCuentas(cuentas);

    cargarCuentas(cuentas);

    // Nueva cuenta
    document.getElementById("nuevaCuenta").addEventListener("click", function () {
        localStorage.setItem("tipoEditCuenta", "nueva")
        window.location.href = "../nueva_editar_cuenta.html";
    });

    // Transferencia
    document.getElementById("transferencia").addEventListener("click", function () {
        window.location.href = "../nueva_editar_transferencia.html";
    });
});

export async function actualizarSaldoCuentas(cuentas) {
    let transaccionesUsuario = await getTransacciones();

    cuentas.forEach(async cuenta => {
        let saldoCuenta = 0;

        let transaccionesCuenta = transaccionesUsuario.filter(transaccion => transaccion.idCuenta === cuenta.id);

        transaccionesCuenta.forEach(transaccion => {
            if (transaccion.tipo === 'ingreso') {
                saldoCuenta += transaccion.importe;
            } else if (transaccion.tipo === 'gasto') {
                saldoCuenta -= transaccion.importe;
            }
        })

        cuenta.saldo = saldoCuenta;

        await fetch(`${URL}/cuentas/${cuenta.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuenta)
        });
        console.log("Saldo actualizado OK");
    });
}

export function cargarCuentas(cuentas) {
    let valorNeto = document.getElementById("valorNeto");

    let sumaSaldo = 0;
    cuentas.forEach(cuenta => {
        sumaSaldo += cuenta.saldo + cuenta.saldoInicial;

        let listadoCuentas = document.getElementById("vistaCuentas");

        let divCuenta = crearElemento("div", listadoCuentas);
        if (cuenta.predeterminada == "Sí") {
            divCuenta.classList.add("predeterminada");
        }

        let nombreCuenta = crearElementoTexto(cuenta.nombre, "p", divCuenta);
        nombreCuenta.classList.add("fuenteTransacciones");

        let saldoCuenta = crearElementoTexto(vistaDecimal(cuenta.saldo + cuenta.saldoInicial), "p", divCuenta);
        saldoCuenta.classList.add("fuenteTransacciones");

        // Ir a cuenta
        divCuenta.addEventListener("click", function () {
            localStorage.setItem("cuentaSeleccionada", JSON.stringify(cuenta));
            localStorage.setItem("tipoEditCuenta", "editar")
            window.location.href = "../nueva_editar_cuenta.html";
        });
    });

    valorNeto.textContent = vistaDecimal(sumaSaldo);
}