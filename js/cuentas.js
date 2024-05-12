'use strict'

import { getCuentas, crearElemento, crearElementoTexto, formateoDecimal, actualizarSaldoCuentas } from './utils.js';

window.addEventListener("load", async () => {
    actualizarSaldoCuentas();

    let valorNeto = document.getElementById("valorNeto");

    // Cuentas usuario
    let cuentas = await getCuentas();

    let sumaSaldo = 0;
    cuentas.forEach(cuenta => {
        sumaSaldo += cuenta.saldo;

        let listadoCuentas = document.getElementById("vistaCuentas");

        let divCuenta = crearElemento("div", listadoCuentas);
        if(cuenta.predeterminada == "Sí") {
            divCuenta.classList.add("predeterminada");
        }

        let nombreCuenta = crearElementoTexto(cuenta.nombre, "p", divCuenta);
        nombreCuenta.classList.add("fuenteTransacciones");

        let saldoCuenta = crearElementoTexto(formateoDecimal(cuenta.saldo), "p", divCuenta);
        saldoCuenta.classList.add("fuenteTransacciones");

        // Ir a cuenta
        divCuenta.addEventListener("click", function() {
            localStorage.setItem("cuentaSeleccionada", JSON.stringify(cuenta));
            localStorage.setItem("tipoEditCuenta", "editar")
            window.location.href = "../nueva_editar_cuenta.html";
        });
    });

    // Valor neto
    valorNeto.textContent = formateoDecimal(sumaSaldo);

    // Nueva cuenta
    document.getElementById("nuevaCuenta").addEventListener("click", function() {
        localStorage.setItem("tipoEditCuenta", "nueva")
        window.location.href = "../nueva_editar_cuenta.html";
    });

    // Transferencia
    document.getElementById("transferencia").addEventListener("click", function() {
        localStorage.setItem("tipoEditTransferencia", "nueva")
        window.location.href = "../nueva_editar_transferencia.html";
    });
});