'use strict'

import { cargarMenu, checkUser } from './utils.js';

window.addEventListener("DOMContentLoaded", () => {
    checkUser();
    cargarMenu();

    const categorias = document.querySelectorAll('#vistaCategorias div');
    categorias.forEach(function(categoria) {
        categoria.addEventListener('click', function() {
            let cat = categoria.getAttribute("id").split("_");
            let idCat = cat[cat.length - 1];
            let nombreCat = cat[0];
            localStorage.setItem('idCategoria', idCat);
            localStorage.setItem('nombreCategoria', nombreCat);
            window.location.href = "nueva_editar_transaccion.html";
        });
    });
})