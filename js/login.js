'use strict'

import { validaUsuario, mostrarErrores } from './validaciones.js';
import { URL } from './utils.js';

window.addEventListener("load", () => {
  const botonSubmitLogin = document.querySelector('.botonAzul');

  botonSubmitLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    
    let form = document.getElementById('formLogin');
    let formdata = new FormData(form);

    const loginResponse = await fetch(`${URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    const usuarios = await loginResponse.json();

    const usuarioEncontrado = usuarios.find(usuario => usuario.email === formdata.get('email') && usuario.password === formdata.get('password'));

    if (usuarioEncontrado) {
      console.log('Login OK. Usuario:', usuarioEncontrado);
      mostrarErrores(form, {});

      localStorage.setItem("id", usuarioEncontrado.id);
      localStorage.setItem("nombre", usuarioEncontrado.nombre);
      localStorage.setItem("decimal", usuarioEncontrado.vista_decimal);

      window.location.href = "../inicio.html";
    } else {
      let errores = validaUsuario();
      mostrarErrores(form, errores);
    }
  })
})