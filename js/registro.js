'use strict'

import { validaNombre, validaEmail, validaPassword, mostrarErrores } from './validaciones.js';
import { URL } from './utils.js';

window.addEventListener("load", () => {
  const botonSubmitRegistro = document.querySelector('.botonAzul');

  botonSubmitRegistro.addEventListener('click', async (e) => {
    e.preventDefault();
    
    let form = document.getElementById('formRegistro');
    let formdata = new FormData(form);

    let errores = validaRegistro(formdata);
    if (Object.keys(errores).length > 0) {
      mostrarErrores(form, errores);
    } else {
      // COMPROBAR QUE EL USUARIO NO EXISTE YA // 
      formdata.append("vista_decimal", 1);

      await fetch(`${URL}/usuarios/crearUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formdata))
      })
      // Redirigir al login
    }
  })
})

function validaRegistro(formdata) {
  const errores = {};

  let nombre = formdata.get("nombre");
  let email = formdata.get("email");
  let password = formdata.get("password");

  validaNombre(nombre, errores);
  validaEmail(email, errores)
  validaPassword(password, errores);

  return errores;
}