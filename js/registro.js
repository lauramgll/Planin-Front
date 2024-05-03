'use strict'

import { URL } from './utils.js';
import { mostrarErrores, validaEmail, validaNombre, validaPassword } from './validaciones.js';

window.addEventListener("load", () => {
  const botonSubmitRgistro = document.querySelector('.botonAzul');

  botonSubmitRgistro.addEventListener('click', async (e) => {
    e.preventDefault();
    
    let form = document.getElementById('formRegistro');
    let formdata = new FormData(form);

    let errores = validaRegistro(formdata);
    if (Object.keys(errores).length > 0) {
      mostrarErrores(form, errores);
    } else {
      // COMPROBAR QUE EL USUARIO NO EXISTE YA //

      /*En la entidad vista_decimal no existe, siempre se tiene que llamar igual 
      que el campo de la entidad, luego spring ya se encarga de convertila a 
      vista_decimal, pero eso nos la pela. YA ME PAGARAS UN ALMUERZO :D*/

      formdata.append("vistaDecimal", true);
      await fetch(`${URL}/usuarios/crearUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formdata))
      })
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