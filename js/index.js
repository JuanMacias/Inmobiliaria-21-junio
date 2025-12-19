document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("contenedor-propiedades");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    let propiedadesCargadas = [];

    // Cargar propiedades
    fetch("./propiedades.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // *** ¡CAMBIO AQUÍ! ***
            // Acceder al array dentro del objeto JSON
            propiedadesCargadas = data.propiedades; // Asumimos que el array está bajo la clave "propiedades"
            renderizarPropiedades(propiedadesCargadas);
        })
        .catch((error) => {
            console.error("Error al cargar propiedades:", error);
            // Mostrar un mensaje de error en el contenedor si es necesario
            if (contenedor) {
                contenedor.innerHTML = "<p>Error al cargar las propiedades. Intente de nuevo más tarde.</p>";
            }
        });

    // ... el resto de tu código es correcto ...

    function renderizarPropiedades(lista) {
        if (!contenedor) return;

        contenedor.innerHTML = "";
        // Asegúrate de que lista sea un array antes de usar .length
        if (!Array.isArray(lista) || lista.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron propiedades.</p>";
            return;
        }

        lista.forEach((prop) => {
            const div = document.createElement("div");
            div.className = "propiedad";
            div.innerHTML = `
                <h3>${prop.titulo}</h3>
                <p>${prop.ambientes} ambientes - ${prop.operacion}</p>
                <img src="${prop.imagenes[0]}" alt="${prop.titulo}" /> <a href="detalle.html?id=${prop.id}" class="btn-ver-detalle">Ver detalle</a>
            `;
            contenedor.appendChild(div);
        });
    }

    // ... (el código de los botones permanece igual) ...
});