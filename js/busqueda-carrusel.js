document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("contenedor-propiedades");
    const form = document.getElementById("form-busqueda");
    const selectBarrio = document.getElementById("filtro-barrio");
    const selectTipo = document.getElementById("filtro-tipo");
    const selectOperacion = document.getElementById("filtro-operacion");
    const selectAmbientes = document.getElementById("filtro-ambientes");

    let propiedadesCargadas = [];

    // Cargar propiedades
    fetch("./propiedades.json")
        .then((res) => res.json())
        .then((data) => {
            propiedadesCargadas = data;
            renderizarPropiedades(propiedadesCargadas);
        })
        .catch((error) => {
            console.error("Error al cargar propiedades:", error);
        });

    // Renderizar propiedades
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

    // Filtro
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

    // ✅ Flechas para mover el carrusel (AHORA DENTRO DEL DOMContentLoaded)
    const slider = document.getElementById("contenedor-propiedades");
    const btnPrev = document.getElementById("flecha-izq");
    const btnNext = document.getElementById("flecha-der");

    if (slider && btnPrev && btnNext) {
        btnNext.addEventListener("click", () => {
            slider.scrollBy({
                left: 320,
                behavior: "smooth"
            });
        });

        btnPrev.addEventListener("click", () => {
            slider.scrollBy({
                left: -320,
                behavior: "smooth"
            });
        });
    }
});