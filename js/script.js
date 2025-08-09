document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("contenedor-propiedades");
    const form = document.getElementById("form-busqueda");
    const selectBarrio = document.getElementById("filtro-barrio");
    const selectTipo = document.getElementById("filtro-tipo");
    const selectOperacion = document.getElementById("filtro-operacion");
    const selectAmbientes = document.getElementById("filtro-ambientes");
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const sliderElement = document.getElementById("contenedor-propiedades");

    let propiedadesCargadas = [];

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
            div.innerHTML = `
                <img src="${prop.imagen}" alt="${prop.titulo}" />
                <h3>${prop.titulo}</h3>
                <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
                <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
            `;
            contenedor.appendChild(div);
        });
    }

    // Filtro de búsqueda
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const barrio = selectBarrio.value.toLowerCase();
            const tipo = selectTipo.value.toLowerCase();
            const operacion = selectOperacion.value.toLowerCase();
            const ambientes = selectAmbientes.value;

            const filtradas = propiedadesCargadas.filter((p) => {
                return (!barrio || p.barrio.toLowerCase() === barrio) &&
                       (!tipo || p.tipo.toLowerCase() === tipo) &&
                       (!operacion || p.operacion.toLowerCase() === operacion) &&
                       (!ambientes || String(p.ambientes) === ambientes);
            });

            renderizarPropiedades(filtradas);
        });
    }

    // Lógica del menú hamburguesa
    if (menuToggle && menu) {
        menuToggle.addEventListener("click", function () {
            menu.classList.toggle("active");
        });
    }

    // Lógica del carrusel (CORREGIDO)
    if (btnNext && btnPrev && sliderElement) {
        btnNext.addEventListener("click", () => {
            sliderElement.scrollBy({ left: sliderElement.offsetWidth, behavior: "smooth" });
        });

        btnPrev.addEventListener("click", () => {
            sliderElement.scrollBy({ left: -sliderElement.offsetWidth, behavior: "smooth" });
        });
    }
});