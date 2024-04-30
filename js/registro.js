import { validaNombre, validaEmail, validaPassword, mostrarErrores } from './validaciones.js';

const botonSubmitRgistro = document.querySelector('.botonAzul');

botonSubmitRgistro.addEventListener('click', (e) => {
  e.preventDefault();
  
  let form = document.getElementById('formRegistro');
  let formdata = new FormData(form);

  let errores = validaRegistro(formdata);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(form, errores);
  } else {
    // fetch
  }
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