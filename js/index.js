document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("contenedor-propiedades");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    let propiedadesCargadas = [];

    // Cargar propiedades
fetch("./propiedades.json")
    .then((res) => res.json())
    .then((data) => {
        // Ahora, se pasa el array completo 'data' a la función
        propiedadesCargadas = data;
        renderizarPropiedades(propiedadesCargadas);
    })
    .catch((error) => {
        console.error("Error al cargar propiedades:", error);
    });

    // Renderizar propiedades en el contenedor del carrusel
    function renderizarPropiedades(lista) {
        if (!contenedor) return;

        contenedor.innerHTML = "";
        if (lista.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron propiedades.</p>";
            return;
        }

        lista.forEach((prop) => {
            const div = document.createElement("div");
            div.className = "propiedad";
           // Este es el código que solucionará el problema
div.innerHTML = `
    <h3>${prop.titulo}</h3>
    <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
    <img src="${prop.imagen}" alt="${prop.titulo}" />
    <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
`;
            contenedor.appendChild(div);
        });
    }

    // Flechas para mover el carrusel
    if (contenedor && btnPrev && btnNext) {
        btnNext.addEventListener("click", () => {
            contenedor.scrollBy({
                left: 320,
                behavior: "smooth"
            });
        });

        btnPrev.addEventListener("click", () => {
            contenedor.scrollBy({
                left: -320,
                behavior: "smooth"
            });
        });
    }
});