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
        
        // ... (resto de la función)

        lista.forEach((prop) => {
            // ... (creación de divs)
        });
    }

    // Filtro
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // ... (lógica de filtrado)

            renderizarPropiedades(filtradas);
        });
    }
});

// ✅ Flechas para mover el carrusel
const slider = document.getElementById("contenedor-propiedades");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

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