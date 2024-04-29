export function crearElemento(tipo = "br", padre = contenido) {
    let elemento = document.createElement(tipo);
    padre.appendChild(elemento);
    return elemento;
  }
  
  export function crearElementoTexto(texto = "Ejemplo", tipo = "div", padre = contenido) {
    let elemento = document.createElement(tipo);
    elemento.textContent = texto;
    padre.appendChild(elemento);
    return elemento;
  }