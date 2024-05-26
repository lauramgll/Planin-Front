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

/*
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

  //console.log(transacciones);
  return transacciones;
}

/*
export async function getTransacciones() {
  let idUsuario = localStorage.getItem("id");
  let ft = localStorage.getItem("filtroTemporal");
  let fc = localStorage.getItem("filtroCuentas");

  //EJEMPLO: /transacciones/usuario/2/mes mayo 2024/todos
  //ERROR si no hay nada en ese mes y para ese usuario
  const transaccionesResponse = await fetch(
    `${URL}/transacciones/usuario/${idUsuario}/${ft}/${0}`,
    {
      method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
    }
  );

  // Verificar si la respuesta es exitosa
  if (!transaccionesResponse.ok) {
    // Manejar el error según el código de estado HTTP
    if (transaccionesResponse.status === 404) {
      console.error("No se encontraron transacciones.");
      return [];
    } else {
      throw new Error("Error en la solicitud: " + transaccionesResponse.status);
    }
  }

  let transacciones = await transaccionesResponse.json();

  // Quitar las transferencias
  transacciones = transacciones.filter(
    (transaccion) =>
      transaccion.tipo === "ingreso" || transaccion.tipo === "gasto"
  );

  console.log(transacciones);

  // Devolver las transacciones si no están vacías
  if (transacciones.length > 0) {
  return transacciones;
  } else {
    return [];
  }
}
*/

export function getImporte(datos) {
  let importe = 0;

  datos.forEach(dato => {
    importe += dato.importe;
  });

  return importe;
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

export async function getCuentas() {
  let idUsuario = localStorage.getItem("id");

  const cuentasResponse = await fetch(`${URL}/cuentas/usuario/${idUsuario}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  let cuentas = await cuentasResponse.json();

  console.log(cuentas);
  return cuentas;
}

// Ocultar/desocultar password
export function togglePassword() {
  const togglePassword = document.querySelector('.toggle-password');

  togglePassword.addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    if (type === 'password') {
      togglePassword.setAttribute('name', 'eye-outline');
    } else {
      togglePassword.setAttribute('name', 'eye-off-outline');
    }
  });
}

export function cargarMenu() {
  let menuInicio = document.querySelectorAll(".menuInicio");
  menuInicio.forEach(menu => {
    menu.addEventListener("click", function() {
      window.location.href = "../inicio.html";
    });
  });

  let menuTransacciones = document.querySelectorAll(".menuTransacciones");
  menuTransacciones.forEach(menu => {
    menu.addEventListener("click", function() {
      window.location.href = "../transacciones.html";
    });
  });

  let menuCuentas = document.querySelectorAll(".menuCuentas");
  menuCuentas.forEach(menu => {
    menu.addEventListener("click", function() {
      window.location.href = "../cuentas.html";
    });
  });

  let menuAjustes = document.querySelectorAll(".menuAjustes");
  menuAjustes.forEach(menu => {
    menu.addEventListener("click", function() {
      window.location.href = "../ajustes.html";
    });
  });

  let menuCerrarSesion = document.querySelectorAll(".menuCerrarSesion");
  menuCerrarSesion.forEach(menu => {
    menu.addEventListener("click", function() {
      window.location.href = "../inicio_sesion.html";
    });
  });
}

export function vistaDecimal(importe) {
  let vista = localStorage.getItem("decimal");

  if(vista === "true") {
    return importe.toFixed(2).toString().replace('.', ',') + ' €';
  } else {
    return Math.round(importe) + ' €';
  }
}

export function checkUser() {
  if (localStorage.getItem('id') === null || localStorage.getItem('id') === '' || localStorage.getItem('id') === undefined) {
    window.location.href = "index.html";
  }
}