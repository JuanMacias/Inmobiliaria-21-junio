document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const idPropiedad = params.get("id");

    const contenedorDetalle = document.getElementById("detalle-propiedad");
    const contenedorUltimas = document.querySelector(".ultimas-propiedades");

    // Flechas flotantes para navegar entre propiedades
    const flechaIzq = document.getElementById("flecha-izq");
    const flechaDer = document.getElementById("flecha-der");

    let propiedadesCargadas = [];
    let imagenesPropiedad = [];
    let indiceActualImagen = 0;

    if (!idPropiedad) {
        contenedorDetalle.innerHTML = "<p>ID de propiedad no encontrado.</p>";
        return;
    }

    fetch("./propiedades.json")
        .then(res => res.json())
        .then(data => {
            propiedadesCargadas = data;
            const prop = propiedadesCargadas.find(p => p.id === idPropiedad);

            if (!prop) {
                contenedorDetalle.innerHTML = "<p>Propiedad no encontrada.</p>";
                return;
            }

            renderizarDetalle(prop);
            renderUltimasPropiedades(propiedadesCargadas);

            // Configurar flechas flotantes para navegar entre propiedades
            configurarFlechasNavegacion(propiedadesCargadas, idPropiedad);
        })
        .catch(error => {
            contenedorDetalle.innerHTML = "<p>Error al cargar la propiedad.</p>";
            console.error("Error al cargar propiedades:", error);
        });

    function renderizarDetalle(prop) {
        imagenesPropiedad = prop.imagenes || [prop.imagen];
        indiceActualImagen = 0;

        const miniaturasHtml = imagenesPropiedad.map((img, i) => `
            <img src="${img}" class="miniatura ${i === 0 ? 'activa' : ''}" data-index="${i}" alt="Miniatura ${i + 1}" />
        `).join("");

        const direccionCompleta = `${prop.direccion}, ${prop.barrio}, Capital Federal`;
        const direccionEncoded = encodeURIComponent(direccionCompleta);

        contenedorDetalle.innerHTML = `
            <h2>${prop.titulo}</h2>
            <div class="galeria">
                <div class="galeria-principal">
                    <button class="flecha izquierda" id="btn-prev-galeria">❮</button>
                    <img id="imagen-activa" src="${imagenesPropiedad[0]}" alt="Imagen principal" />
                    <button class="flecha derecha" id="btn-next-galeria">❯</button>
                </div>
                <div class="galeria-miniaturas">
                    ${miniaturasHtml}
                </div>
            </div>
            <div class="info-bloque">
                <h4>Dirección</h4>
                <div class="direccion-grid">
                    <p><strong>Dirección:</strong> ${prop.direccion || '-'}</p>
                    <p><strong>Ciudad:</strong> Capital Federal</p>
                    <p><strong>Barrio:</strong> ${prop.barrio || '-'}</p>
                    <p><strong>País:</strong> Argentina</p>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=${direccionEncoded}" target="_blank" class="btn-mapa">Abrir en Google Maps</a>
            </div>
            <div class="info-bloque">
                <h4>Detalles</h4>
                <div class="detalle-grid">
                    <p><strong>Precio:</strong> u$s ${prop.precio || '-'}</p>
                    <p><strong>Metros cuadrados:</strong> ${prop.metrosCuadrados || '-'} m²</p>
                    <p><strong>Ambientes:</strong> ${prop.ambientes || '-'}</p>
                    <p><strong>Baños:</strong> ${prop.baños || '-'}</p>
                    ${prop.terraza ? '<p><strong>Terraza:</strong> Sí</p>' : ''}
                    ${prop.jardin ? '<p><strong>Jardín:</strong> Sí</p>' : ''}
                </div>
            </div>
            <div class="info-bloque">
                <h4>Descripción</h4>
                <p>${prop.descripcion || 'No disponible'}</p>
            </div>
            <div class="info-bloque mapa">
                <h4>Ubicación</h4>
                <iframe src="https://www.google.com/maps/embed/v1/place?key=TU_API_KEY&q=${direccionEncoded}" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
        `;

        // Lógica de la galería de imágenes
        const imagenActiva = document.getElementById("imagen-activa");
        const miniaturas = document.querySelectorAll(".miniatura");
        const prevBtnGaleria = document.getElementById("btn-prev-galeria");
        const nextBtnGaleria = document.getElementById("btn-next-galeria");

        miniaturas.forEach(miniatura => {
            miniatura.addEventListener("click", e => {
                const index = parseInt(e.target.dataset.index);
                cambiarImagen(index);
            });
        });

        prevBtnGaleria.addEventListener("click", () => cambiarImagen((indiceActualImagen - 1 + imagenesPropiedad.length) % imagenesPropiedad.length));
        nextBtnGaleria.addEventListener("click", () => cambiarImagen((indiceActualImagen + 1) % imagenesPropiedad.length));

        function cambiarImagen(index) {
            imagenActiva.src = imagenesPropiedad[index];
            indiceActualImagen = index;
            miniaturas.forEach(img => img.classList.remove("activa"));
            miniaturas[index].classList.add("activa");
        }
    }

    function renderUltimasPropiedades(propiedades) {
        if (!contenedorUltimas) return;

        const ultimas = propiedades.filter(p => p.id !== idPropiedad).slice(0, 4);

        contenedorUltimas.innerHTML = `
            <h3>Últimas propiedades</h3>
            <ul class="lista-ultimas">
                ${ultimas.map(p => `
                    <li>
                        <a href="detalle.html?id=${p.id}">
                            <img src="${p.imagen || (p.imagenes?.[0] || './img/placeholder.jpg')}" alt="${p.titulo}" />
                            <div>
                                <p>${p.titulo.length > 40 ? p.titulo.slice(0, 40) + '...' : p.titulo}</p>
                                <p class="precio">$ ${p.precio}</p>
                            </div>
                        </a>
                    </li>
                `).join("")}
            </ul>
        `;
    }
    
    // Función de navegación de flechas flotantes
    function configurarFlechasNavegacion(propiedades, idActual) {
        const indexActual = propiedades.findIndex(p => p.id === idActual);

        if (indexActual === -1) {
            if (flechaIzq) flechaIzq.style.display = "none";
            if (flechaDer) flechaDer.style.display = "none";
            return;
        }

        // Flecha izquierda (anterior)
        if (flechaIzq) {
            if (indexActual === 0) {
                flechaIzq.style.display = "block";
                flechaIzq.onclick = function (e) {
                    e.preventDefault();
                    window.location.href = `index.html`;
                };
            } else {
                flechaIzq.style.display = "block";
                flechaIzq.onclick = function (e) {
                    e.preventDefault();
                    const idAnterior = propiedades[indexActual - 1].id;
                    window.location.href = `detalle.html?id=${idAnterior}`;
                };
            }
        }

        // Flecha derecha (siguiente)
        if (flechaDer) {
            if (indexActual === propiedades.length - 1) {
                flechaDer.style.display = "none";
            } else {
                flechaDer.style.display = "block";
                flechaDer.onclick = function (e) {
                    e.preventDefault();
                    const idSiguiente = propiedades[indexActual + 1].id;
                    window.location.href = `detalle.html?id=${idSiguiente}`;
                };
            }
        }
    }
});