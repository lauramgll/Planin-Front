import { validarNombre, validarEmail, validarCampoObligatorio, mostrarErrores } from './validaciones.js';

const botonSubmit = document.querySelector('.botonAzul');

botonSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  
  let form = document.getElementById('formRegistro');
  let formdata = new FormData(form);
  console.log(formdata);

  let errores = validarRegistro(formdata);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(form, errores);
  } else {
    // fetch
  }
})

function validarRegistro(formdata) {
  const errores = {};
  console.log(errores);
  validarCampoObligatorio(formdata, errores);
  validarNombre(formdata, errores)
  validarEmail(formdata, errores);
  return errores;
}