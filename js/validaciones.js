import { crearElementoTexto } from './utils.js';

export function validarCampoObligatorio(formdata, errores) {
    const form = document.getElementById('formRegistro');
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        const valor = formdata.get(input.id);
        if (!valor || valor.trim() === '') {
            errores[input.id] = 'El campo no puede estar vacío.';
        }
    });
}

export function validarNombre(formdata, errores) {
    let nombre = formdata.get('nombre');
    if (nombre && nombre.length > 50) {
      errores['nombre'] = "El nombre tiene un máximo de 50 caracteres.";
    }
}

export function validarEmail(formdata, errores) {
    const emailRegex = /^[a-zA-Z0-9_.+-ñ]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    let email = formdata.get('email');
    if (!emailRegex.test(email)) {
      errores['email'] = "El email no es válido.";
    }
  }
  
  export function mostrarErrores(form, errores) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(campo => {
      const error = errores[campo.id];
      const contenedor = campo.closest('div');
      if (error) {
        let errorAnterior = contenedor.querySelector('p.error');
        if (errorAnterior) {
          errorAnterior.remove();
        }
        crearElementoTexto(error, 'p', contenedor, 'error'); 
    } else {
        let errorAnterior = contenedor.querySelector('p.error');
        if (errorAnterior) {
            errorAnterior.remove();
        }
      }
    })
}