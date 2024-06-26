'use strict'

import { validaUsuarioLogin, mostrarErrores } from './validaciones.js';
import { getUsuarios, togglePassword } from './utils.js';

window.addEventListener("load", () => {
  togglePassword();

  const botonSubmitLogin = document.querySelector('.botonAzul');

  botonSubmitLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    
    let form = document.getElementById('formLogin');
    let formdata = new FormData(form);

    const usuarios = await getUsuarios();
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === formdata.get('email') && usuario.password === formdata.get('password'));

    if (usuarioEncontrado) {
      console.log('Login OK. Usuario:', usuarioEncontrado);
      mostrarErrores(form, {});

      localStorage.setItem("id", usuarioEncontrado.id);
      localStorage.setItem("nombre", usuarioEncontrado.nombre);
      localStorage.setItem("email", usuarioEncontrado.email);
      localStorage.setItem("decimal", usuarioEncontrado.vistaDecimal);

      window.location.href = "../inicio.html";
    } else {
      let errores = validaUsuarioLogin();
      mostrarErrores(form, errores);
    }
  })
})