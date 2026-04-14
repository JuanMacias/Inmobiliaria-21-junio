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
            // ✅ CORRECCIÓN 1: Entrar a la lista "propiedades" del objeto JSON
            propiedadesCargadas = data.propiedades || []; 
            renderizarPropiedades(propiedadesCargadas);
        })
        .catch((error) => {
            console.error("Error al cargar propiedades:", error);
        });

    function renderizarPropiedades(lista) {
        if (!contenedor) return;
        contenedor.innerHTML = "";

        if (lista.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron propiedades con estos filtros.</p>";
            return;
        }

        lista.forEach((prop) => {
            const div = document.createElement("div");
            div.className = "propiedad";

            // ✅ CORRECCIÓN 2: Usar la primera imagen del array 'imagenes'
            // Si no hay imágenes, ponemos una por defecto
            const fotoUrl = (prop.imagenes && prop.imagenes.length > 0) ? prop.imagenes[0] : 'img/sin-foto.jpg';

            div.innerHTML = `
                <img src="${fotoUrl}" alt="${prop.titulo}" />
                <h3>${prop.titulo}</h3>
                <p><strong>${prop.barrio.toUpperCase()}</strong></p>
                <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
                <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
            `;
            contenedor.appendChild(div);
        });
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const barrio = selectBarrio.value.toLowerCase().trim();
            const tipo = selectTipo.value.toLowerCase().trim();
            const operacion = selectOperacion.value.toLowerCase().trim();
            const ambientes = selectAmbientes.value;

            const filtradas = propiedadesCargadas.filter((p) => {
                // Filtramos comparando todo en minúsculas para evitar errores
                return (!barrio || p.barrio.toLowerCase() === barrio) &&
                       (!tipo || p.tipo.toLowerCase() === tipo) &&
                       (!operacion || p.operacion.toLowerCase() === operacion) &&
                       (!ambientes || String(p.ambientes) === ambientes);
            });

            renderizarPropiedades(filtradas);
        });
    }

    // Flechas del carrusel (se mantienen igual)
    const slider = document.getElementById("contenedor-propiedades");
    const btnPrev = document.getElementById("flecha-izq");
    const btnNext = document.getElementById("flecha-der");

    if (slider && btnPrev && btnNext) {
        btnNext.addEventListener("click", () => {
            slider.scrollBy({ left: 320, behavior: "smooth" });
        });
        btnPrev.addEventListener("click", () => {
            slider.scrollBy({ left: -320, behavior: "smooth" });
        });
    }
});