let propiedadesCargadas = [];

document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("contenedor-propiedades");

    // En tu script.js, busca esta parte:
const btnPrev = document.getElementById('btn-prev-detalle');
const btnNext = document.getElementById('btn-next-detalle');

// Y reemplázala por esta:
const btnPrev = document.querySelector('.flecha-detalle.izquierda');
const btnNext = document.querySelector('.flecha-detalle.derecha');

    // Cargar propiedades desde JSON
    fetch("./propiedades.json")
        .then((res) => res.json())
        .then((data) => {
            propiedadesCargadas = data;
            renderizarPropiedades(propiedadesCargadas);
        })
        .catch((error) => {
            console.error("Error al cargar propiedades:", error);
        });

    // Función para renderizar propiedades
    function renderizarPropiedades(lista) { // <-- Aquí inicia la función
        contenedor.innerHTML = "";
        lista.forEach((prop) => {
            const div = document.createElement("div");
            div.className = "propiedad";
            div.innerHTML = `
                <img src="${prop.imagen}" alt="${prop.titulo}" />
                <h3>${prop.titulo}</h3>
                <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
                <p>Precio: U$S ${prop["u$s"]}</p>  
                <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
            `;
            contenedor.appendChild(div);
        });
    } // <-- Aquí cierra la función renderizarPropiedades

    // Filtro de búsqueda
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

    // ✅ Menú hamburguesa para mobile
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");

    if (menuToggle && menu) {
        menuToggle.addEventListener("click", function () {
            menu.classList.toggle("active");
        });
    }

    // 🔁 Botones para mover el carrusel agregado 25/7
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");

   
    const sliderElement = document.querySelector(".slider"); // O el ID de tu slider real

    if (btnNext && btnPrev && sliderElement) { // Usar sliderElement aquí
        btnNext.addEventListener("click", () => {
            sliderElement.scrollBy({ left: 320, behavior: "smooth" });
        });

        btnPrev.addEventListener("click", () => {
            sliderElement.scrollBy({ left: -320, behavior: "smooth" });
        });
    }

}); // <-- Aquí cierra document.addEventListener("DOMContentLoaded"