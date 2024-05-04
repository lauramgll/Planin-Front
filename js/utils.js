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
  const usuariosResponse = await fetch(`${URL}/usuarios`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const usuarios = await usuariosResponse.json();
  return usuarios;
}