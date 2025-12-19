// Este es el callback global que la API de Google Maps necesita.
function initMapDetalle() {
    console.log("Google Maps API loaded via callback.");
}

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const idPropiedad = params.get("id");
    
    // Contenedores para las dos vistas principales
    const contenedorDetalle = document.getElementById("detalle-propiedad");
    const contenedorLista = document.querySelector(".lista-propiedades");

    const contenedorUltimas = document.querySelector(".ultimas-propiedades");
    const flechaIzq = document.getElementById("flecha-izq");
    const flechaDer = document.getElementById("flecha-der");

    let propiedadesCargadas = [];
    let imagenesPropiedad = [];
    let indiceActualImagen = 0;

    // Lógica del formulario de búsqueda (Ajustado para mantener la lógica original de tu código)
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const barrio = searchForm.querySelector('[name="barrio"]').value;
            const tipo = searchForm.querySelector('[name="tipo"]').value;
            const operacion = searchForm.querySelector('[name="operacion"]').value;
            const ambientes = searchForm.querySelector('[name="ambientes"]').value;
            
            // Redirige a la página principal con los filtros, o a sí misma si es la página de listado
            const targetUrl = window.location.pathname.endsWith('detalle.html') && !idPropiedad ? 
                              `detalle.html` : 
                              `index.html`; // Asume que index.html es la página de listado general
            
            const url = `${targetUrl}?barrio=${barrio}&tipo=${tipo}&operacion=${operacion}&ambientes=${ambientes}`;
            window.location.href = url;
        });
    }

    // ----------------------------------------------------
    //  SOLUCIÓN CONTRA CACHÉ: Añadimos un timestamp
    // ----------------------------------------------------
    const timestamp = new Date().getTime(); 

    // Lógica para cargar las propiedades desde el JSON
    fetch(`propiedades.json?v=${timestamp}`) // <-- MODIFICACIÓN CLAVE
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error al cargar el JSON: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            // Acceder al array dentro del objeto JSON
            propiedadesCargadas = data.propiedades; 

            // Decidir qué vista mostrar según la URL
            if (idPropiedad) {
                // Mostrar detalles de una sola propiedad
                const prop = propiedadesCargadas.find(p => p.id === idPropiedad);
                if (prop) {
                    if (contenedorLista) contenedorLista.style.display = 'none'; 
                    if (contenedorDetalle) contenedorDetalle.style.display = 'block'; 
                    renderizarDetalle(prop);
                    // Retrasar la inicialización del mapa hasta que la API esté lista
                    setTimeout(() => inicializarMapaConDatos(prop), 100); 
                } else {
                    if (contenedorDetalle) contenedorDetalle.innerHTML = "<p>Propiedad no encontrada.</p>";
                    if (contenedorLista) contenedorLista.style.display = 'none';
                }
                configurarFlechasNavegacion(propiedadesCargadas, idPropiedad);
            } else {
                // Mostrar resultados de búsqueda o todas las propiedades
                if (contenedorDetalle) contenedorDetalle.style.display = 'none'; 
                if (contenedorLista) contenedorLista.style.display = 'block'; 

                let resultados = propiedadesCargadas;
                const urlBarrio = params.get("barrio");
                const urlTipo = params.get("tipo");
                const urlOperacion = params.get("operacion");
                const urlAmbientes = params.get("ambientes");

                if (urlBarrio || urlTipo || urlOperacion || urlAmbientes) {
                    resultados = propiedadesCargadas.filter(prop => {
                        return (!urlBarrio || prop.barrio === urlBarrio) &&
                               (!urlTipo || prop.tipo === urlTipo) &&
                               (!urlOperacion || prop.operacion === urlOperacion) &&
                               (!urlAmbientes || prop.ambientes >= parseInt(urlAmbientes));
                    });
                }
                
                renderizarResultados(resultados);
            }
            renderUltimasPropiedades(propiedadesCargadas, idPropiedad);
        })
        .catch(error => {
            console.error("Error al cargar propiedades:", error);
            const mensajeError = "<p>Error al cargar las propiedades. Por favor, inténtelo de nuevo más tarde.</p>";
            if (contenedorDetalle) {
                contenedorDetalle.innerHTML = mensajeError;
            } else if (contenedorLista) {
                contenedorLista.innerHTML = mensajeError;
            }
        });

    function renderizarDetalle(prop) {
        imagenesPropiedad = prop.imagenes && Array.isArray(prop.imagenes) && prop.imagenes.length > 0 ? prop.imagenes : (prop.imagen ? [prop.imagen] : ['img/placeholder.jpg']);
        indiceActualImagen = 0;
        const miniaturasHtml = imagenesPropiedad.map((img, i) => `
            <img src="${img}" class="miniatura ${i === 0 ? 'activa' : ''}" data-index="${i}" alt="Miniatura ${i + 1}" />
        `).join("");

        const direccionCompleta = `${prop.direccion || ''}, ${prop.barrio || ''}, Capital Federal`;
        const direccionEncoded = encodeURIComponent(direccionCompleta);

        if (contenedorDetalle) { 
            contenedorDetalle.innerHTML = `
                <h2>${prop.titulo}</h2>
                <div class="galeria">
                    <div class="galeria-principal">
                        <button class="flecha izquierda" id="btn-prev-galeria">❮</button>
                        <img id="imagen-activa" src="${imagenesPropiedad[0] || 'img/placeholder.jpg'}" alt="Imagen principal" />
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
                    <a href="https://maps.google.com/?q=${direccionEncoded}" target="_blank" class="btn-mapa">Abrir en Google Maps</a>
                </div>
                <div class="info-bloque">
                    <h4>Detalles</h4>
                    <div class="detalle-grid">
                        <p><strong>Precio:</strong> U$S ${prop.precio ? prop.precio.toLocaleString('es-AR') : '-'}</p>
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
                    <div id="mapa-detalle-propiedad" style="height: 400px; width: 100%;"></div>
                </div>
            `;

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

            if (prevBtnGaleria) {
                prevBtnGaleria.addEventListener("click", () => cambiarImagen((indiceActualImagen - 1 + imagenesPropiedad.length) % imagenesPropiedad.length));
            }
            if (nextBtnGaleria) {
                nextBtnGaleria.addEventListener("click", () => cambiarImagen((indiceActualImagen + 1) % imagenesPropiedad.length));
            }

            function cambiarImagen(index) {
                if (imagenesPropiedad[index]) {
                    imagenActiva.src = imagenesPropiedad[index];
                    indiceActualImagen = index;
                    miniaturas.forEach(img => img.classList.remove("activa"));
                    if (miniaturas[index]) {
                        miniaturas[index].classList.add("activa");
                    }
                }
            }
        }
    }

    function renderizarResultados(propiedades) {
        if (!contenedorLista) return; 

        contenedorLista.innerHTML = '';
        if (!Array.isArray(propiedades) || propiedades.length === 0) {
            contenedorLista.innerHTML = '<p>No se encontraron propiedades que coincidan con su búsqueda.</p>';
            return;
        }

        propiedades.forEach(prop => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${prop.imagenes && prop.imagenes[0] ? prop.imagenes[0] : 'img/placeholder.jpg'}" alt="${prop.titulo}">
                <div class="card-body">
                    <h3 class="card-title">${prop.titulo}</h3>
                    <p class="card-text">${prop.barrio}</p>
                    <p class="card-price">$ ${prop.precio ? prop.precio.toLocaleString('es-AR') : '-'}</p>
                    <a href="detalle.html?id=${prop.id}" class="card-link">Ver detalles</a>
                </div>
            `;
            contenedorLista.appendChild(card);
        });
    }

    function renderUltimasPropiedades(propiedades, idActual) {
        if (!contenedorUltimas) return;
        
        // Mostrar las 4 propiedades más recientes que no sean la actual
        const ultimas = Array.isArray(propiedades) ? propiedades.filter(p => p.id !== idActual).slice(0, 4) : [];

        contenedorUltimas.innerHTML = `
            <h3>Últimas propiedades</h3>
            <ul class="lista-ultimas">
                ${ultimas.map(p => `
                    <li>
                        <a href="detalle.html?id=${p.id}">
                            <img src="${p.imagenes && p.imagenes[0] ? p.imagenes[0] : 'img/placeholder.jpg'}" alt="${p.titulo}" />
                            <p>${p.titulo.length > 40 ? p.titulo.slice(0, 40) + '...' : p.titulo}</p>
                            <p class="precio">U$S ${p.precio ? p.precio.toLocaleString('es-AR') : '-'}</p> 
                        </a>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    function configurarFlechasNavegacion(propiedades, idActual) {
        if (!Array.isArray(propiedades)) return; 

        const indexActual = propiedades.findIndex(p => p.id === idActual);
        if (indexActual === -1) {
            if (flechaIzq) flechaIzq.style.display = "none";
            if (flechaDer) flechaDer.style.display = "none";
            return;
        }

        if (flechaIzq) {
            flechaIzq.onclick = function (e) {
                e.preventDefault();
                const idAnterior = propiedades[indexActual === 0 ? propiedades.length - 1 : indexActual - 1].id;
                window.location.href = `detalle.html?id=${idAnterior}`;
            };
        }

        if (flechaDer) {
            flechaDer.onclick = function (e) {
                e.preventDefault();
                const idSiguiente = propiedades[indexActual === propiedades.length - 1 ? 0 : indexActual + 1].id;
                window.location.href = `detalle.html?id=${idSiguiente}`;
            };
        }
    }

    function inicializarMapaConDatos(prop) {
        const mapaDiv = document.getElementById("mapa-detalle-propiedad");
        if (!mapaDiv) return;

        const coordenadas = { lat: prop.lat, lng: prop.lng };
        
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
             console.error("Google Maps API no está cargada. Asegúrate de incluir el script con el callback initMapDetalle.");
             return;
        }
        
        const mapa = new google.maps.Map(mapaDiv, {
            center: coordenadas,
            zoom: 15,
        });
        const marker = new google.maps.Marker({
            position: coordenadas,
            map: mapa,
            title: prop.titulo
        });
        
        const imagenParaGlobo = prop.imagenes && prop.imagenes[0] ? prop.imagenes[0] : 'img/placeholder.jpg';
        
        const contenidoGlobo = `
            <div class="info-window-custom">
                <img src="${imagenParaGlobo}" alt="${prop.titulo}" class="info-window-img">
                <div class="info-content">
                    <h4>${prop.titulo}</h4>
                    <p class="precio">U$S ${prop.precio ? prop.precio.toLocaleString('es-AR') : 'Precio no disponible'}</p> 
                    <p>${prop.ambientes || '-'} amb. | ${prop.baños || '-'} baño/s | ${prop.metrosCuadrados || '-'} m²</p>
                    <a href="detalle.html?id=${prop.id}" class="info-window-link">Ver propiedad</a>
                </div>
            </div>
        `;
        const infoWindow = new google.maps.InfoWindow({
            content: contenidoGlobo,
        });
        
        infoWindow.open({
            anchor: marker,
            map: mapa
        });

        marker.addListener("click", () => {
            infoWindow.open({ anchor: marker, map });
        });
    }
});