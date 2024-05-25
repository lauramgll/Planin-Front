'use strict'

import { calcularPorcentaje, cargarMenu, crearElemento, crearElementoTexto, getCategorias, getListadoGastos, getListadoIngresos, getTransacciones, vistaDecimal } from './utils.js';

window.addEventListener("load", async () => {
    cargarMenu();
    //Declaración de los posibles valores de meses para el calculo de fechas
    const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
    // Filtros
    const transparenciaFiltrado = document.getElementById("transparenciaFiltrado");
    /*Inicialización de los filtros en localStorage.
    En caso de que ya existan se mantienen y sino se pone por defecto el mes actual
    */
    if (localStorage.getItem("filtroTemporal") == null || localStorage.getItem("filtroTemporal").includes("mes")) {
        localStorage.setItem("filtroTemporal", "mes " + document.getElementById("fechaMensual").innerHTML
        );
        //Ocultamos la fecha Anual (para mostrar solo la mensual)
        document.getElementById("fechaAnual").style.display = "none"
        document.getElementById("fechaAnualEsc").style.display = "none"
        //Damos estilos a los filtros en el popup
        document.getElementById("filtroMes").classList.add("filtroActivo");
        document.getElementById("filtroMes").classList.remove("filtroInactivo");
        document.getElementById("filtroAnyo").classList.remove("filtroActivo");
        document.getElementById("filtroAnyo").classList.add("filtroInactivo");
    } else {
        //Operación contraria, mostramos el filtro de año y damos estilos a los filtros
        localStorage.setItem("filtroTemporal", "anyo " + document.getElementById("fechaAnual").innerHTML)
        document.getElementById("fechaMensual").style.display = "none"
        document.getElementById("fechaMensualEsc").style.display = "none"
        document.getElementById("filtroMes").classList.remove("filtroActivo");
        document.getElementById("filtroMes").classList.add("filtroInactivo");
        document.getElementById("filtroAnyo").classList.add("filtroActivo");
        document.getElementById("filtroAnyo").classList.remove("filtroInactivo");
    }

    //TODO Habria que añadir la cuenta seleccionada y cambiar los estilos de los filtros (a ver si me da tiempo, si lees esto es que no jjajaja)
    if (localStorage.getItem("filtroCuentas") == null) {
        localStorage.setItem("filtroCuentas", "todos");
    }

    // Cargamos el listado inicial de trasnferencias arreglo a los filtros anteriores de mes y cuenta
    let transacciones = await getTransacciones();
    //Añadimos las transacciones a sus respectivas categorias
    cargarTransacciones(transacciones);

    // Vista desglose
    document
        .getElementById("btnTodos")
        .addEventListener("click", async function () {
            document.getElementById("btnTodos").classList.add("todos");
            document.getElementById("btnIngresos").classList.remove("ingresos");
            document.getElementById("btnGastos").classList.remove("gastos");
            document.getElementById("botonera").style.borderColor = "#727DF3";

            cargarTransacciones(transacciones);

            document.getElementById("vistaChart").classList.remove("visible");
            document.getElementById("vistaTotales").classList.remove("oculto");
            document.getElementById("vistaChart").classList.add("oculto");
            document.getElementById("vistaTotales").classList.add("visible");
        });

    document
        .getElementById("btnIngresos")
        .addEventListener("click", async function () {
            document.getElementById("btnIngresos").classList.add("ingresos");
            document.getElementById("btnTodos").classList.remove("todos");
            document.getElementById("btnGastos").classList.remove("gastos");
            document.getElementById("botonera").style.borderColor = "#50CFBC";

            let transaccionesIngresos = await getListadoIngresos();
            cargarTransacciones(transaccionesIngresos);

            porcentajesPorCategoria(transaccionesIngresos);
            document.getElementById("vistaChart").classList.remove("oculto");
            document.getElementById("vistaTotales").classList.remove("visible");
            document.getElementById("vistaChart").classList.add("visible");
            document.getElementById("vistaTotales").classList.add("oculto");
        });

    document.getElementById("btnGastos").addEventListener("click", async function () {
        document.getElementById("btnGastos").classList.add("gastos");
        document.getElementById("btnTodos").classList.remove("todos");
        document.getElementById("btnIngresos").classList.remove("ingresos");
        document.getElementById("botonera").style.borderColor = "#FC7B7F";

        let transaccionesGastos = await getListadoGastos();
        cargarTransacciones(transaccionesGastos);

        porcentajesPorCategoria(transaccionesGastos);
        document.getElementById("vistaChart").classList.remove("oculto");
        document.getElementById("vistaTotales").classList.remove("visible");
        document.getElementById("vistaChart").classList.add("visible");
        document.getElementById("vistaTotales").classList.add("oculto");
    });

    //Funcionalidad al pulsar la flecha izquierda de la fecha
    document
        .getElementById("flechaIzq")
        .addEventListener("click", async function () {
            //Calculamos la fehc aen caso de ser mes
            if (localStorage.getItem("filtroTemporal").includes("mes")) {
                let mes = document.getElementById("fechaMensual").innerHTML.match(/[a-zA-Z]+/)[0];
                let anyo = document.getElementById("fechaMensual").innerHTML.match(/\d+/)[0];
                let mesInt = meses.indexOf(mes)
                mesInt = mesInt - 1

                if (mesInt == -1) {
                    mesInt = 11
                    anyo = parseInt(anyo) - 1
                }
                document.getElementById("fechaMensual").innerHTML = ""
                document.getElementById("fechaMensual").innerHTML = meses[mesInt] + " " + anyo;
                //Metemos en filtro la fecha, ejemplo: mes ABRIL 2024
                localStorage.setItem("filtroTemporal", "mes " + document.getElementById("fechaMensual").innerHTML);

            } else {
                //Que facil es para año joder...
                document.getElementById("fechaAnual").innerHTML = parseInt(document.getElementById("fechaAnual").innerHTML) - 1
                localStorage.setItem("filtroTemporal", "anyo " + document.getElementById("fechaAnual").innerHTML);

            }
            //Una vez finalizado el calculo de las fechas y cambiado el filtroTemporal realizamos la consulta
            transacciones = await getTransacciones();
            //Recargar los listados
            cargarTransacciones(transacciones)
            //Pintamos grafica y calculo de Saldo Gasto e Ingreso
            calcularValores(transacciones)

        });

    //Funcionalidad al pulsar la flecha derecha de la fecha (Mismo que la anterior pero sumando meses y años LOL)
    document
        .getElementById("flechaDer")
        .addEventListener("click", async function () {
            if (localStorage.getItem("filtroTemporal").includes("mes")) {
                let mes = document.getElementById("fechaMensual").innerHTML.match(/[a-zA-Z]+/)[0];
                let anyo = document.getElementById("fechaMensual").innerHTML.match(/\d+/)[0];
                let mesInt = meses.indexOf(mes)
                mesInt = mesInt + 1

                if (mesInt == 12) {
                    mesInt = 1
                    anyo = parseInt(anyo) + 1
                }
                document.getElementById("fechaMensual").innerHTML = ""
                document.getElementById("fechaMensual").innerHTML = meses[mesInt] + " " + anyo;
                localStorage.setItem("filtroTemporal", "mes " + document.getElementById("fechaMensual").innerHTML);

            } else {

                document.getElementById("fechaAnual").innerHTML = parseInt(document.getElementById("fechaAnual").innerHTML) + 1
                localStorage.setItem("filtroTemporal", "anyo " + document.getElementById("fechaAnual").innerHTML);
            }
            transacciones = await getTransacciones()
            cargarTransacciones(transacciones)
            calcularValores(transacciones)

        });

    //FLECHAS ESCRITORIO
    //Funcionalidad al pulsar la flecha izquierda de la fecha
    document
        .getElementById("flechaIzqEsc")
        .addEventListener("click", async function () {
            //Calculamos la fehc aen caso de ser mes
            if (localStorage.getItem("filtroTemporal").includes("mes")) {
                let mes = document.getElementById("fechaMensualEsc").innerHTML.match(/[a-zA-Z]+/)[0];
                let anyo = document.getElementById("fechaMensualEsc").innerHTML.match(/\d+/)[0];
                let mesInt = meses.indexOf(mes)
                mesInt = mesInt - 1

                if (mesInt == -1) {
                    mesInt = 11
                    anyo = parseInt(anyo) - 1
                }
                document.getElementById("fechaMensualEsc").innerHTML = ""
                document.getElementById("fechaMensualEsc").innerHTML = meses[mesInt] + " " + anyo;
                //Metemos en filtro la fecha, ejemplo: mes ABRIL 2024
                localStorage.setItem("filtroTemporal", "mes " + document.getElementById("fechaMensualEsc").innerHTML);

            } else {
                //Que facil es para año joder...
                document.getElementById("fechaAnualEsc").innerHTML = parseInt(document.getElementById("fechaAnualEsc").innerHTML) - 1
                localStorage.setItem("filtroTemporal", "anyo " + document.getElementById("fechaAnualEsc").innerHTML);

            }
            //Una vez finalizado el calculo de las fechas y cambiado el filtroTemporal realizamos la consulta
            transacciones = await getTransacciones();
            //Recargar los listados
            cargarTransacciones(transacciones)
            //Pintamos grafica y calculo de Saldo Gasto e Ingreso
            calcularValores(transacciones)

        });

    //Funcionalidad al pulsar la flecha derecha de la fecha (Mismo que la anterior pero sumando meses y años LOL)
    document
        .getElementById("flechaDerEsc")
        .addEventListener("click", async function () {
            if (localStorage.getItem("filtroTemporal").includes("mes")) {
                let mes = document.getElementById("fechaMensualEsc").innerHTML.match(/[a-zA-Z]+/)[0];
                let anyo = document.getElementById("fechaMensualEsc").innerHTML.match(/\d+/)[0];
                let mesInt = meses.indexOf(mes)
                mesInt = mesInt + 1

                if (mesInt == 12) {
                    mesInt = 1
                    anyo = parseInt(anyo) + 1
                }
                document.getElementById("fechaMensualEsc").innerHTML = ""
                document.getElementById("fechaMensualEsc").innerHTML = meses[mesInt] + " " + anyo;
                localStorage.setItem("filtroTemporal", "mes " + document.getElementById("fechaMensualEsc").innerHTML);

            } else {

                document.getElementById("fechaAnualEsc").innerHTML = parseInt(document.getElementById("fechaAnualEsc").innerHTML) + 1
                localStorage.setItem("filtroTemporal", "anyo " + document.getElementById("fechaAnualEsc").innerHTML);
            }
            transacciones = await getTransacciones()
            cargarTransacciones(transacciones)
            calcularValores(transacciones)

        });

    document.querySelectorAll(".iconoFiltro").forEach((icono) => {
        icono.addEventListener("click", function () {
            transparenciaFiltrado.style.display = "block";
        });
    });

    //POPUP filtrado, acciones de cada boton, consiste en cambiar estilos de los botones, nada mas y añadir mes o año y tipo de centa a los filtros
    document
        .getElementById("filtroMes")
        .addEventListener("click", async function () {
            localStorage.setItem("filtroTemporal", "mes");

            document.getElementById("filtroMes").classList.add("filtroActivo");
            document.getElementById("filtroMes").classList.remove("filtroInactivo");
            document.getElementById("filtroAnyo").classList.remove("filtroActivo");
            document.getElementById("filtroAnyo").classList.add("filtroInactivo");
        });
    document
        .getElementById("filtroAnyo")
        .addEventListener("click", async function () {
            localStorage.setItem("filtroTemporal", "anyo");

            document.getElementById("filtroMes").classList.remove("filtroActivo");
            document.getElementById("filtroMes").classList.add("filtroInactivo");
            document.getElementById("filtroAnyo").classList.add("filtroActivo");
            document.getElementById("filtroAnyo").classList.remove("filtroInactivo");
        });
    document
        .getElementById("filtroTodos")
        .addEventListener("click", async function () {
            localStorage.setItem("filtroCuentas", "todos");
            document.getElementById("filtroTodos").classList.add("filtroActivo");
            document.getElementById("filtroTodos").classList.remove("filtroInactivo");
            document
                .getElementById("filtroPrincipal")
                .classList.add("filtroInactivo");
            document
                .getElementById("filtroPrincipal")
                .classList.remove("filtroActivo");
            document.getElementById("filtroAhorro").classList.add("filtroInactivo");
            document.getElementById("filtroAhorro").classList.remove("filtroActivo");
        });
    document
        .getElementById("filtroPrincipal")
        .addEventListener("click", async function () {
            localStorage.setItem("filtroCuentas", "principal");
            document.getElementById("filtroTodos").classList.remove("filtroActivo");
            document.getElementById("filtroTodos").classList.add("filtroInactivo");
            document
                .getElementById("filtroPrincipal")
                .classList.remove("filtroInactivo");
            document.getElementById("filtroPrincipal").classList.add("filtroActivo");
            document.getElementById("filtroAhorro").classList.add("filtroInactivo");
            document.getElementById("filtroAhorro").classList.remove("filtroActivo");
        });
    document
        .getElementById("filtroAhorro")
        .addEventListener("click", async function () {
            localStorage.setItem("filtroCuentas", "ahorro");
            document.getElementById("filtroTodos").classList.remove("filtroActivo");
            document.getElementById("filtroTodos").classList.add("filtroInactivo");
            document
                .getElementById("filtroPrincipal")
                .classList.add("filtroInactivo");
            document
                .getElementById("filtroPrincipal")
                .classList.remove("filtroActivo");
            document
                .getElementById("filtroAhorro")
                .classList.remove("filtroInactivo");
            document.getElementById("filtroAhorro").classList.add("filtroActivo");
        });

    //Ocultamos el popup y recargamos listados, no he encontrado otra forma que el location reload para cargar de nuevo todo...
    document
        .getElementById("iconoGuardado")
        .addEventListener("click", async function () {
            cargarTransacciones(transacciones);
            transparenciaFiltrado.style.display = "none";
            location.reload()
        });

    //Cerramos el popup, (lo que no se hace es mantener las anteriores opciones, así que es un poco absurdo, pero queda bonito, no se van a dar cuenta que falla)
    document
        .getElementById("iconoCerrarFiltro")
        .addEventListener("click", async function () {
            transparenciaFiltrado.style.display = "none";
        });
});

//Organizamos las transacciones por el tipo
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
            importe = "+" + vistaDecimal(transaccion.importe);
            console.log(importe);
        } else if (transaccion.tipo === 'gasto') {
            importe = "-" + vistaDecimal(transaccion.importe);
        } else {
            importe = vistaDecimal(transaccion.importe);
        }

        let importeTransaccion = crearElementoTexto(importe, "p", divTransaccion);
        importeTransaccion.classList.add("fuenteTransacciones");
    });

    //Refrescamos los valores al cambiar de pestaña, esto tengo dudas de si deberiamos o no
    await calcularValores(transacciones);
}

// Vista totales
async function calcularValores(transacciones) {
    let saldo = 0;
    let ingresos = 0;
    let gastos = 0;
    let porcentajeIngresos = 0;
    let porcentajeGastos = 0;
    let total = 0;

    transacciones.forEach((transaccion) => {
        if (
            transaccion.tipo == "gasto" ||
            transaccion.tipo == "transferencia_origen"
        ) {
            gastos += transaccion.importe;
        } else {
            ingresos += transaccion.importe;
        }
        saldo = ingresos - gastos;
        total = ingresos + gastos;

        porcentajeIngresos = calcularPorcentaje(ingresos, total);
        document.getElementById("porcentajeIngresos").textContent =
            porcentajeIngresos.toFixed() + "%";

        porcentajeGastos = calcularPorcentaje(gastos, total);
        document.getElementById("porcentajeGastos").textContent =
            porcentajeGastos.toFixed() + "%";

    });
    document.getElementById("saldo").textContent = vistaDecimal(saldo);
    document.getElementById("ingresos").textContent = vistaDecimal(ingresos);
    document.getElementById("gastos").textContent = vistaDecimal(gastos);
    pintarGrafico(porcentajeIngresos, porcentajeGastos);
}

async function pintarGrafico(porcentajeIngresos, porcentajeGastos) {
    // Vista chart
    let yValues = [porcentajeIngresos, porcentajeGastos];
    let barColors = ["#50CFBC", "#FC7B7F"];

    // Verificar si no hay datos
    let isEmpty = yValues.every(value => value === 0);

    let data;
    if (isEmpty) {
        // Mostrar una rosca vacía
        data = {
            datasets: [
                {
                    backgroundColor: ["#e0e0e0"], // Color gris para indicar que está vacío
                    data: [1], // Valor ficticio para mostrar el gráfico
                    borderWidth: 0,
                },
            ],
        };
    } else {
        // Mostrar los datos reales
        data = {
            datasets: [
                {
                    backgroundColor: barColors,
                    data: yValues,
                    borderWidth: 0,
                },
            ],
        };
    }

    new Chart("chartIngresosGastos", {
        type: "doughnut",
        data: data,
        options: {
            tooltips: { enabled: false },
            hover: { mode: null },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
}
async function porcentajesPorCategoria(transacciones) {
    let categorias = await getCategorias();

    let totalesPorCategoria = {};

    transacciones.forEach(transaccion => {
        if (totalesPorCategoria[transaccion.idCategoria]) {
            totalesPorCategoria[transaccion.idCategoria] += transaccion.importe;
        } else {
            totalesPorCategoria[transaccion.idCategoria] = transaccion.importe;
        }
    });

    let totalImporte = Object.values(totalesPorCategoria).reduce((totales, total) => totales + total, 0);

    // Ordenar las categorías de mayor a menor porcentaje
    categorias.sort((a, b) => {
        let porcentajeA = totalesPorCategoria[a.id] ? (totalesPorCategoria[a.id] / totalImporte) * 100 : 0;
        let porcentajeB = totalesPorCategoria[b.id] ? (totalesPorCategoria[b.id] / totalImporte) * 100 : 0;
        return porcentajeB - porcentajeA;
    });

    let categoriasHTML = "";
    let yValues = [];
    let barColors = [];

    for (let categoria of categorias) {
        let porcentaje = totalesPorCategoria[categoria.id] ? (totalesPorCategoria[categoria.id] / totalImporte) * 100 : 0;
        let color = categoria.color;

        if (porcentaje > 0) {
            categoriasHTML += `
                <p class="porcentajes">${porcentaje.toFixed()}%</p>
                <div id="circulo2" style="background-color: ${color}"></div>
                <p class="fuentePeque">${categoria.nombre}</p>
            `;
            yValues.push(porcentaje.toFixed(2));
            barColors.push(color);
        }
    }

    document.getElementById("categorias").innerHTML = categoriasHTML;

    // Crear el chart
    new Chart("chartCategorias", {
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
}