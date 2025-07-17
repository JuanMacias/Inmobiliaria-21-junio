
let propiedadesCargadas = [];

document.addEventListener("DOMContentLoaded", function () {
  const contenedor = document.getElementById("contenedor-propiedades");
  document.getElementById("btn-filtrar").addEventListener("click", () =>{

  });

  fetch("./propiedades.json")
    .then((res) => res.json())
    .then((data) => {
      propiedadesCargadas = data;
      renderizarPropiedades(propiedadesCargadas);
    })
    .catch((error) => {
      console.error("Error al cargar propiedades:", error);
    });

  function renderizarPropiedades(lista) {
    contenedor.innerHTML = "";
    lista.forEach((prop) => {
      const div = document.createElement("div");
      div.className = "propiedad";
      div.innerHTML = `
        <img src="${prop.imagen}" alt="${prop.titulo}" />
        <h3>${prop.titulo}</h3>
        <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
        <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
      `;
      contenedor.appendChild(div);
    });
  }

  const form = document.getElementById("form-busqueda");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

     const barrio = document.getElementById("filtro-barrio").value.toLowerCase();
const tipo = document.getElementById("filtro-tipo").value.toLowerCase();
const operacion = document.getElementById("filtro-operacion").value.toLowerCase();
const ambientes = document.getElementById("filtro-ambientes").value;


    const filtradas = propiedadesCargadas.filter((p) => {
  return (!barrio || p.barrio.toLowerCase() === barrio) &&
         (!tipo || p.tipo.toLowerCase() === tipo) &&
         (!operacion || p.operacion.toLowerCase() === operacion) &&
         (!ambientes || String(p.ambientes) === ambientes);
});


      renderizarPropiedades(filtradas);
    });
  }
});
