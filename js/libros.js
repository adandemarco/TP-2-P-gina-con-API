// =========================================
// ELEMENTOS DEL DOM
// =========================================
const contenedor_libros  = document.getElementById("contenedor_libros");
const btn_cargar_mas     = document.getElementById("btn_cargar_mas");
const input_busqueda     = document.getElementById("input_busqueda");
const btn_input_buscar   = document.getElementById("btn_input_buscar");
const botones_letras     = document.querySelectorAll("#abecedario button");
const botones_tabs       = document.querySelectorAll(".tab");
const lista_generos      = document.getElementById("lista_generos");
const btn_buscar_nav     = document.getElementById("btn_buscar");
const btn_ingresar       = document.getElementById("btn_ingresar");
const modal_overlay      = document.getElementById("modal_overlay");
const modal_cerrar       = document.getElementById("modal_cerrar");
const form_login         = document.getElementById("form_login");


// =========================================
// ESTADO
// =========================================
let url_actual   = "https://gutendex.com/books/?sort=popular";
let letra_actual = "";
let filtro_actual = "autores";


// =========================================
// DATOS DE GÉNEROS Y COLECCIONES
// =========================================
const generos = [
    { nombre: "Aventura",        consulta: "adventure" },
    { nombre: "Biografía",       consulta: "biography" },
    { nombre: "Ciencia",         consulta: "science" },
    { nombre: "Ciencia ficción", consulta: "science fiction" },
    { nombre: "Drama",           consulta: "drama" },
    { nombre: "Fantasía",        consulta: "fantasy" },
    { nombre: "Ficción",         consulta: "fiction" },
    { nombre: "Filosofía",       consulta: "philosophy" },
    { nombre: "Historia",        consulta: "history" },
    { nombre: "Humor",           consulta: "humor" },
    { nombre: "Infantil",        consulta: "children" },
    { nombre: "Misterio",        consulta: "mystery" },
    { nombre: "Poesía",          consulta: "poetry" },
    { nombre: "Religión",        consulta: "religion" },
    { nombre: "Romance",         consulta: "romance" },
    { nombre: "Terror",          consulta: "horror" },
    { nombre: "Viajes",          consulta: "travel" },
];

const colecciones = [
    { nombre: "Acción y Aventura",           consulta: "Action & Adventure" },
    { nombre: "Best Books Ever Listings",    consulta: "Best Books Ever Listings" },
    { nombre: "Children's Literature",       consulta: "Children's Literature" },
    { nombre: "Classic Literature",          consulta: "Classic Literature" },
    { nombre: "Crime Fiction",               consulta: "Crime Fiction" },
    { nombre: "Detective Fiction",           consulta: "Detective Fiction" },
    { nombre: "Fantasy",                     consulta: "Fantasy" },
    { nombre: "Gothic Fiction",              consulta: "Gothic Fiction" },
    { nombre: "Historical Fiction",          consulta: "Historical Fiction" },
    { nombre: "Horror",                      consulta: "Horror" },
    { nombre: "Humour",                      consulta: "Humour" },
    { nombre: "Love Stories",               consulta: "Love Stories" },
    { nombre: "Mystery Fiction",             consulta: "Mystery Fiction" },
    { nombre: "Mythology",                   consulta: "Mythology" },
    { nombre: "Philosophy",                  consulta: "Philosophy" },
    { nombre: "Poetry",                      consulta: "Poetry" },
    { nombre: "Political Science",           consulta: "Political Science" },
    { nombre: "Precursors of Science Fiction", consulta: "Precursors of Science Fiction" },
    { nombre: "Romance",                     consulta: "Romance" },
    { nombre: "Science Fiction",             consulta: "Science Fiction" },
    { nombre: "Short Stories",               consulta: "Short Stories" },
    { nombre: "Travel",                      consulta: "Travel" },
    { nombre: "Western Stories",             consulta: "Western Stories" },
];


// =========================================
// OBTENER Y MOSTRAR LIBROS
// =========================================
function obtener_libros(url, limpiar = false, letra = "") {
    if (limpiar) {
        contenedor_libros.innerHTML = "";
    }

    contenedor_libros.innerHTML += `<p id="cargando"><i class="fa-solid fa-spinner fa-spin"></i> Cargando libros...</p>`;

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error("Error al consultar la API");
            return response.json();
        })
        .then((data) => {
            let libros_filtrados = data.results;

            if (letra !== "") {
                libros_filtrados = data.results.filter((libro) =>
                    libro.authors.some((autor) =>
                        autor.name.trim().toUpperCase().startsWith(letra.toUpperCase())
                    )
                );
            }

            const mensaje_cargando = document.getElementById("cargando");
            if (mensaje_cargando) mensaje_cargando.remove();

            if (libros_filtrados.length === 0) {
                contenedor_libros.innerHTML = letra !== ""
                    ? `<p>No se encontraron autores que empiecen con "${letra}".</p>`
                    : `<p>No se encontraron libros para esa búsqueda.</p>`;
                btn_cargar_mas.style.display = "none";
                return;
            }

            mostrar_libros(libros_filtrados);

            if (data.next) {
                url_actual = data.next;
                btn_cargar_mas.style.display = "inline-flex";
            } else {
                btn_cargar_mas.style.display = "none";
            }
        })
        .catch((error) => {
            const mensaje_cargando = document.getElementById("cargando");
            if (mensaje_cargando) mensaje_cargando.remove();
            contenedor_libros.innerHTML += `<p><i class="fa-solid fa-triangle-exclamation"></i> No se pudieron cargar los libros.</p>`;
            btn_cargar_mas.style.display = "none";
            console.error("Error al obtener los libros:", error);
        });
}

function mostrar_libros(libros) {
    libros.forEach((element) => {
        const titulo      = element.title || "Título desconocido";
        const autor       = element.authors.length > 0 ? element.authors[0].name : "Autor desconocido";
        const imagen      = element.formats["image/jpeg"] || "./img/portada-no-disponible.png";
        const descripcion = element.subjects.length > 0 ? element.subjects[0] : "Libro disponible para descargar.";
        const link_descarga =
            element.formats["text/html"] ||
            element.formats["application/epub+zip"] ||
            element.formats["text/plain; charset=utf-8"] ||
            element.formats["text/plain"];

        const div_libro = document.createElement("div");
        div_libro.classList.add("libro");

        div_libro.innerHTML = `
            <img
                src="${imagen}"
                alt="${titulo}"
                onerror="this.onerror=null; this.src='./img/portada-no-disponible.png';"
            >
            <div class="info_libro">
                <h3>${titulo}</h3>
                <p class="autor"><i class="fa-solid fa-user" style="opacity:0.5;margin-right:4px;"></i>${autor}</p>
                <p class="descripcion">${descripcion}</p>
                ${link_descarga
                    ? `<a class="descargar" href="${link_descarga}" target="_blank" rel="noopener noreferrer">
                           <i class="fa-solid fa-book-open"></i> Leer o descargar
                       </a>`
                    : `<p style="font-size:12px;color:#bbb;margin-top:10px;">Descarga no disponible</p>`
                }
            </div>
        `;

        contenedor_libros.appendChild(div_libro);
    });
}


// =========================================
// BÚSQUEDA POR TEXTO
// =========================================
function buscar_libros() {
    const texto_busqueda = input_busqueda.value.trim();

    if (texto_busqueda === "") {
        alert("Escribí un título o autor para buscar.");
        return;
    }

    letra_actual = "";
    url_actual = `https://gutendex.com/books/?search=${encodeURIComponent(texto_busqueda)}`;
    obtener_libros(url_actual, true);
}


// =========================================
// GÉNEROS (filtro por letra)
// =========================================
function mostrar_generos_por_letra(letra) {
    lista_generos.innerHTML = "";
    contenedor_libros.innerHTML = "";

    const generos_filtrados = generos.filter((g) =>
        g.nombre.toUpperCase().startsWith(letra.toUpperCase())
    );

    if (generos_filtrados.length === 0) {
        lista_generos.innerHTML = `<p>No hay géneros que empiecen con "${letra}".</p>`;
        return;
    }

    generos_filtrados.forEach((genero) => {
        const boton = document.createElement("button");
        boton.textContent = genero.nombre;
        boton.dataset.consulta = genero.consulta;
        boton.classList.add("boton_genero");
        boton.addEventListener("click", () =>
            buscar_libros_por_topic(genero.nombre, genero.consulta)
        );
        lista_generos.appendChild(boton);
    });
}

function buscar_libros_por_topic(nombre, consulta) {
    letra_actual = "";
    input_busqueda.value = nombre;
    url_actual = `https://gutendex.com/books/?topic=${encodeURIComponent(consulta)}`;
    lista_generos.innerHTML = "";
    obtener_libros(url_actual, true);
}


// =========================================
// COLECCIONES (filtro por letra sobre bookshelves)
// =========================================
function mostrar_colecciones_por_letra(letra) {
    lista_generos.innerHTML = "";
    contenedor_libros.innerHTML = "";

    const colecciones_filtradas = colecciones.filter((c) =>
        c.nombre.toUpperCase().startsWith(letra.toUpperCase())
    );

    if (colecciones_filtradas.length === 0) {
        lista_generos.innerHTML = `<p>No hay colecciones que empiecen con "${letra}".</p>`;
        return;
    }

    colecciones_filtradas.forEach((col) => {
        const boton = document.createElement("button");
        boton.textContent = col.nombre;
        boton.classList.add("boton_genero");
        boton.addEventListener("click", () =>
            buscar_libros_por_bookshelf(col.nombre, col.consulta)
        );
        lista_generos.appendChild(boton);
    });
}

function buscar_libros_por_bookshelf(nombre, consulta) {
    letra_actual = "";
    input_busqueda.value = nombre;
    url_actual = `https://gutendex.com/books/?topic=${encodeURIComponent(consulta)}`;
    lista_generos.innerHTML = "";
    obtener_libros(url_actual, true);
}


// =========================================
// LUPA NAV — scroll + focus al buscador
// =========================================
btn_buscar_nav.addEventListener("click", () => {
    input_busqueda.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input_busqueda.focus(), 400);
});


// =========================================
// MODAL "INGRESAR"
// =========================================
function abrir_modal() {
    modal_overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    document.getElementById("login_email").focus();
}

function cerrar_modal() {
    modal_overlay.setAttribute("hidden", "");
    document.body.style.overflow = "";
}

btn_ingresar.addEventListener("click", abrir_modal);
modal_cerrar.addEventListener("click", cerrar_modal);

modal_overlay.addEventListener("click", (e) => {
    if (e.target === modal_overlay) cerrar_modal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal_overlay.hasAttribute("hidden")) {
        cerrar_modal();
    }
});

form_login.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn_submit_login");
    btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Bienvenido! (demo)`;
    btn.style.background = "linear-gradient(135deg, #27ae60, #1e8449)";
    setTimeout(() => {
        cerrar_modal();
        btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Ingresar`;
        btn.style.background = "";
        form_login.reset();
    }, 1800);
});


// =========================================
// BOTÓN BUSCAR (texto)
// =========================================
btn_input_buscar.addEventListener("click", buscar_libros);

input_busqueda.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscar_libros();
});


// =========================================
// TABS
// =========================================
botones_tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        botones_tabs.forEach((t) => t.classList.remove("activo"));
        tab.classList.add("activo");
        filtro_actual = tab.dataset.filtro;

        lista_generos.innerHTML = "";
        input_busqueda.value    = "";
        letra_actual            = "";

        if (filtro_actual === "autores") {
            input_busqueda.placeholder = "Buscar libro o autor...";
            url_actual = "https://gutendex.com/books/?sort=popular";
            obtener_libros(url_actual, true);
        }

        if (filtro_actual === "generos") {
            input_busqueda.placeholder = "Seleccioná una letra y un género";
            contenedor_libros.innerHTML = "";
            btn_cargar_mas.style.display = "none";
        }

        if (filtro_actual === "colecciones") {
            input_busqueda.placeholder = "Seleccioná una letra para ver colecciones";
            contenedor_libros.innerHTML = "";
            btn_cargar_mas.style.display = "none";
        }
    });
});


// =========================================
// ABECEDARIO
// =========================================
botones_letras.forEach((boton) => {
    boton.addEventListener("click", () => {
        const letra = boton.textContent.trim();
        input_busqueda.value = letra;

        if (filtro_actual === "autores") {
            letra_actual = letra;
            url_actual = `https://gutendex.com/books/?search=${encodeURIComponent(letra)}`;
            lista_generos.innerHTML = "";
            obtener_libros(url_actual, true, letra_actual);
        }

        if (filtro_actual === "generos") {
            letra_actual = "";
            mostrar_generos_por_letra(letra);
        }

        if (filtro_actual === "colecciones") {
            letra_actual = "";
            mostrar_colecciones_por_letra(letra);
        }
    });
});


// =========================================
// CARGAR MÁS
// =========================================
btn_cargar_mas.addEventListener("click", () => {
    obtener_libros(url_actual, false, letra_actual);
});


// =========================================
// CARGA INICIAL
// =========================================
obtener_libros(url_actual);