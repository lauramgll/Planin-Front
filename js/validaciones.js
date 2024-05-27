'use strict'

import { crearElementoTexto, getUsuarios } from "./utils.js";

export function validaNombre(campo, errores) {
  let correcto = true;
  if (campo == "" || campo == null) {
    errores["nombre"] = "El nombre no puede estar vacío.";
    correcto = false;
  } else if (campo.length > 50) {
    errores["nombre"] = "El nombre debe tener un máximo de 50 caracteres.";
    correcto = false;
  }
  return correcto;
}

export function validaEmail(campo, errores) {
  let correcto = true;
  let emailexpreg = /^[a-zA-Z0-9._%+-ñÑ]+@[a-zA-Z0-9.-ñÑ]+\.[a-zA-Z]{2,4}$/;
  if (!emailexpreg.test(campo)) {
    errores["email"] = "El email no es válido.";
    correcto = false;
  }
  return correcto;
}

export function validaPassword(campo, errores) {
  let correcto = true;
  let passexpreg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{6,}$/;
  if (!passexpreg.test(campo)) {
    errores["password"] = "La contraseña debe tener mínimo 6 caracteres e incluir al menos 1 dígito.";
    correcto = false;
  }
  return correcto;
}

export function validaUsuarioLogin() {
  let errores = {};
  errores["password"] = "No se encontró ningún usuario con ese email y contraseña.";
  return errores;
}

export async function comprobarUsuarioRegistro(email, errores) {
  let correcto = true;
  const usuarios = await getUsuarios();
  if (usuarios.some(usuario => usuario.email === email)) {
    errores["email"] = "Ya existe un usuario registrado con ese email.";
    correcto = false;
  }
  return correcto;
}

export async function comprobarUsuarioAjustes(email, idUsuario, errores) {
  let correcto = true;
  const usuarios = await getUsuarios();

  console.log(idUsuario);
  if (usuarios.some(usuario => usuario.email === email && usuario.id != idUsuario)) {
    errores["email"] = "Ya existe un usuario registrado con ese email.";
    correcto = false;
  }

  return correcto;
}

export function validaCategoria(campo, errores) {
  let correcto = true;
  if (campo == "" || campo == null || campo == "ELEGIR") {
    errores["categoria"] = "No hay ninguna categoría seleccionada.";
    correcto = false;
  }
  return correcto;
}

export function validaFecha(campo, errores) {
  let correcto = true;
  if (campo == "" || campo == null) {
    errores["fecha"] = "No hay ninguna fecha seleccionada.";
    correcto = false;
  }
  return correcto;
}

export function mostrarErrores(form, errores) {
  const inputs = form.querySelectorAll("input");

  inputs.forEach(campo => {
    const error = errores[campo.id];
    const contenedor = campo.closest("div");
    let errorAnterior = contenedor.querySelector(".error");

    if (error) {
      if (errorAnterior) {
        errorAnterior.textContent = error;
      } else {
        const nuevoError = crearElementoTexto(error, "p", contenedor);
        nuevoError.classList.add("error");
      }
    } else {
      if (errorAnterior) {
        errorAnterior.remove();
      }
    }
  });
}

export function mostrarErroresNombreCuenta(campo, errores) {
  const error = errores[campo.id];
  const contenedor = document.querySelector("span");
  let errorAnterior = contenedor.querySelector(".error");

  if (error) {
    if (errorAnterior) {
      errorAnterior.textContent = error;
    } else {
      const nuevoError = crearElementoTexto(error, "p", contenedor);
      nuevoError.classList.add("error");
    }
  } else {
    if (errorAnterior) {
      errorAnterior.remove();
    }
  }
}

export function mostrarErroresTransaccion(campo, errores) {
  const error = errores[campo];
  
  let contenedor;
  if (campo === "categoria") {
    contenedor = document.getElementById("errorCategoria");
  } else if (campo === "fecha") {
    contenedor = document.getElementById("errorFecha");
  }

  let errorAnterior = contenedor.querySelector(".error");

  if (error) {
    if (errorAnterior) {
      errorAnterior.textContent = error;
    } else {
      const nuevoError = crearElementoTexto(error, "p", contenedor);
      nuevoError.classList.add("error");
    }
  } else {
    if (errorAnterior) {
      errorAnterior.remove();
    }
  }
}
