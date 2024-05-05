'use strict'

export const URL = 'http://localhost:8888';

export function crearElemento(tipo = "br", padre = contenido) {
    let elemento = document.createElement(tipo);
    padre.appendChild(elemento);
    return elemento;
}

export function crearElementoTexto(texto = "Ejemplo", tipo = "div", padre = contenido) {
  let elemento = document.createElement(tipo);
  elemento.textContent = texto;
  padre.appendChild(elemento);
  return elemento;
}

export async function getUsuarios() {
  const loginResponse = await fetch(`${URL}/usuarios`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const usuarios = await loginResponse.json();
  return usuarios;
}

export async function getTransacciones() {
  let idUsuario = localStorage.getItem("id");

  const transaccionesResponse = await fetch(`${URL}/transacciones/usuario/${idUsuario}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  let transacciones = await transaccionesResponse.json();

  // Quitar las transferencias
  transacciones = transacciones.filter(transaccion => transaccion.tipo === 'ingreso' || transaccion.tipo === 'gasto');

  console.log(transacciones);
  return transacciones;
}

export async function getListadoIngresos() {
  const transacciones = await getTransacciones();

  const ingresos = transacciones.filter(transaccion => transaccion.tipo === 'ingreso');
  return ingresos;
}

export async function getListadoGastos() {
  const transacciones = await getTransacciones();

  const gastos = transacciones.filter(transaccion => transaccion.tipo === 'gasto');
  return gastos;
}

export async function getImporteIngresos() {
  const ingresos = await getListadoIngresos();

  let importeIngresos = 0;

  ingresos.forEach(ingreso => {
    importeIngresos += ingreso.importe;
  });

  return importeIngresos;
}

export async function getImporteGastos() {
  const gastos = await getListadoGastos();

  let importeGastos = 0;
  
  gastos.forEach(gasto => {
    importeGastos += gasto.importe;
  });

  return importeGastos;
}

export async function getSaldo() {
  return await getImporteIngresos() - await getImporteGastos();
}

export function formateoDecimal(importe) {
  return importe.toFixed(2).toString().replace('.', ',') + ' €';
}

export function calcularPorcentaje(valor, total) {
  return ((valor / total) * 100);
}

export async function getCategorias() {
  const categoriasResponse = await fetch(`${URL}/categorias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const categorias = await categoriasResponse.json();
  return categorias;
}