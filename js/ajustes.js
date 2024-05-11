'use strict'

import { URL, togglePassword } from './utils.js';
import { mostrarErrores, validaEmail, validaNombre, validaPassword, comprobarUsuarioAjustes } from './validaciones.js';

window.addEventListener("load", async () => {
    togglePassword();

    // Vista
    let idUsuario = localStorage.getItem("id");
    let nombreUsuario = localStorage.getItem("nombre");
    let emailUsuario = localStorage.getItem("email");
    let vistaDecimal = localStorage.getItem("decimal");

    document.querySelector("span").textContent = nombreUsuario;
    document.querySelector('input[type="text"]').value = nombreUsuario;
    document.querySelector('input[type="email"]').value = emailUsuario;
    document.querySelector('input[type="password"]').value = await getPasswordUsuario(idUsuario);

    vistaDecimal = JSON.parse(vistaDecimal);
    vistaDecimalColores(vistaDecimal);

    let btnForm = document.querySelectorAll("header > p");

    btnForm.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (btn.textContent == "Editar") {
                btn.textContent = "Guardar";
                document.querySelectorAll('input').forEach(input => {
                    input.removeAttribute('readonly');
                });
            } else {
                let form = document.getElementById('formAjustes');
                let formdata = new FormData(form);

                let errores = await validaRegistro(formdata, idUsuario);
                console.log(errores);

                if (Object.keys(errores).length > 0) {
                    mostrarErrores(form, errores);
                } else {
                    formdata.append("vistaDecimal", vistaDecimal);
                    await fetch(`${URL}/usuarios/${idUsuario}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(Object.fromEntries(formdata))
                    })
                    mostrarErrores(form, {});
                    console.log("Cambio ajustes OK");

                    localStorage.setItem("nombre", formdata.get("nombre"));
                    localStorage.setItem("email", formdata.get("email"));
                    localStorage.setItem("decimal", vistaDecimal);              

                    btn.textContent = "Editar";
                    document.querySelectorAll('input').forEach(input => {
                        input.setAttribute('readonly', 'readonly');
                    });

                    location.reload();
                }
            }
        });
    });

    // Vista decimal
    btnForm.forEach(btn => {
        const decimalTrue = document.getElementById("decimalTrue");
        const decimalFalse = document.getElementById("decimalFalse");

        decimalTrue.addEventListener('click', (e) => {
            if (btn.textContent == "Guardar") {
                e.preventDefault();
                vistaDecimal = true;
                vistaDecimalColores(vistaDecimal);
            };
        });

        decimalFalse.addEventListener('click', (e) => {
            if (btn.textContent == "Guardar") {
                e.preventDefault();
                vistaDecimal = false;
                vistaDecimalColores(vistaDecimal);
            }
        });
    });
})

async function getPasswordUsuario(idUsuario) {
    const usuarioResponse = await fetch(`${URL}/usuarios/${idUsuario}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    const usuario = await usuarioResponse.json();
    return usuario.password;
}

async function validaRegistro(formdata, idUsuario) {
    const errores = {};

    let nombre = formdata.get("nombre");
    let email = formdata.get("email");
    let password = formdata.get("password");

    validaNombre(nombre, errores);
    await comprobarUsuarioAjustes(email, idUsuario, errores);
    validaEmail(email, errores)
    validaPassword(password, errores);

    return errores;
}

function vistaDecimalColores(vistaDecimal) {
    document.getElementById("decimalTrue").classList.remove("decimalesActivo");
    document.getElementById("decimalFalse").classList.remove("decimalesActivo");
    
    if (vistaDecimal) {
        document.getElementById("decimalTrue").classList.add("decimalesActivo");
    } else {
        document.getElementById("decimalFalse").classList.add("decimalesActivo");
    }
}