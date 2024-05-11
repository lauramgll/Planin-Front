'use strict'

import { URL, togglePassword } from './utils.js';
import { mostrarErrores, validaEmail, validaNombre, validaPassword, comprobarUsuarioRegistro } from './validaciones.js';

window.addEventListener("load", () => {
  togglePassword();

  const botonSubmitRegistro = document.querySelector('.botonAzul');

  botonSubmitRegistro.addEventListener('click', async (e) => {
    e.preventDefault();
    
    let form = document.getElementById('formRegistro');
    let formdata = new FormData(form);

    let errores = await validaRegistro(formdata);
    console.log(errores);
    if (Object.keys(errores).length > 0) {
      mostrarErrores(form, errores);
    } else {
      formdata.append("vistaDecimal", true);
      await fetch(`${URL}/usuarios/crearUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formdata))
      })
      mostrarErrores(form, {});
      console.log("Registro OK");
      window.location.href = "../inicio_sesion.html";
    }
  })
})

async function validaRegistro(formdata) {
  const errores = {};

  let nombre = formdata.get("nombre");
  let email = formdata.get("email");
  let password = formdata.get("password");

  validaNombre(nombre, errores);
  await comprobarUsuarioRegistro(email, errores);
  validaEmail(email, errores)
  validaPassword(password, errores);

  return errores;
}