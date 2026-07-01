const contenedor_libros = document.getElementById("contenedor_libros");
const btn_cargar_mas = document.getElementById("btn_cargar_mas");
const input_busqueda = document.getElementById("input_busqueda");
const btn_input_buscar = document.getElementById("btn_input_buscar");
const botones_letras = document.querySelectorAll("#abecedario button");
const botones_tabs = document.querySelectorAll(".tab");
const lista_generos = document.getElementById("lista_generos");


let url_actual = "https://gutendex.com/books/?sort=popular";
let letra_actual = "";

let filtro_actual = "autores";

const generos = [
    { nombre: "Aventura", consulta: "adventure" },
    { nombre: "Biografía", consulta: "biography" },
    { nombre: "Ciencia", consulta: "science" },
    { nombre: "Ciencia ficción", consulta: "science fiction" },
    { nombre: "Drama", consulta: "drama" },
    { nombre: "Fantasía", consulta: "fantasy" },
    { nombre: "Ficción", consulta: "fiction" },
    { nombre: "Filosofía", consulta: "philosophy" },
    { nombre: "Historia", consulta: "history" },
    { nombre: "Humor", consulta: "humor" },
    { nombre: "Infantil", consulta: "children" },
    { nombre: "Misterio", consulta: "mystery" },
    { nombre: "Poesía", consulta: "poetry" },
    { nombre: "Religión", consulta: "religion" },
    { nombre: "Romance", consulta: "romance" },
    { nombre: "Terror", consulta: "horror" },
    { nombre: "Viajes", consulta: "travel" }
];

function obtener_libros(url, limpiar = false, letra = "") {
    if (limpiar) {
        contenedor_libros.innerHTML = "";
    }

    contenedor_libros.innerHTML += `
        <p id="cargando">Cargando libros...</p>
    `;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al consultar la API");
            }

            return response.json();
        })
        .then((data) => {
            console.log(data.results);

            let libros_filtrados = data.results;

            if (letra !== "") {
                libros_filtrados = data.results.filter((libro) => {
                    return libro.authors.some((autor) => {
                        return autor.name
                            .trim()
                            .toUpperCase()
                            .startsWith(letra.toUpperCase());
                    });
                });
            }

            const mensaje_cargando =
                document.getElementById("cargando");

            if (mensaje_cargando) {
                mensaje_cargando.remove();
            }

            if (libros_filtrados.length === 0) {
                if (letra !== "") {
                    contenedor_libros.innerHTML = `
                        <p>
                            No se encontraron autores que empiecen con ${letra}.
                        </p>
                    `;
                } else {
                    contenedor_libros.innerHTML = `
                        <p>
                            No se encontraron libros para esa búsqueda.
                        </p>
                    `;
                }

                btn_cargar_mas.style.display = "none";
                return;
            }

            mostrar_libros(libros_filtrados);

            if (data.next) {
                url_actual = data.next;
                btn_cargar_mas.style.display = "block";

                console.log("URL actualizada:", url_actual);
            } else {
                btn_cargar_mas.style.display = "none";
            }
        })
        .catch((error) => {
            const mensaje_cargando =
                document.getElementById("cargando");

            if (mensaje_cargando) {
                mensaje_cargando.remove();
            }

            contenedor_libros.innerHTML += `
                <p>No se pudieron cargar los libros.</p>
            `;

            btn_cargar_mas.style.display = "none";

            console.error(
                "Error al obtener los libros:",
                error
            );
        });
}

function mostrar_libros(libros) {
    libros.forEach((element) => {
        const titulo =
            element.title || "Título desconocido";

        const autor =
            element.authors.length > 0
                ? element.authors[0].name
                : "Autor desconocido";

        const imagen =
            element.formats["image/jpeg"] ||
            "./img/portada-no-disponible.png";

        const descripcion =
            element.subjects.length > 0
                ? element.subjects[0]
                : "Libro disponible para descargar.";

        const link_descarga =
            element.formats["text/html"] ||
            element.formats["application/epub+zip"] ||
            element.formats["text/plain; charset=utf-8"] ||
            element.formats["text/plain"];

        const div_libro =
            document.createElement("div");

        div_libro.classList.add("libro");

        div_libro.innerHTML = `
    <img
        src="${imagen}"
        alt="${titulo}"
        onerror="this.onerror=null; this.src='./img/portada-no-disponible.png';"
    >

    <div class="info_libro">
                <h3>${titulo}</h3>

                <p class="autor">
                    Autor: ${autor}
                </p>

                <p class="descripcion">
                    Tema: ${descripcion}
                </p>

                ${link_descarga
                ? `
                            <a
                                class="descargar"
                                href="${link_descarga}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Leer o descargar
                            </a>
                        `
                : `
                            <p>
                                Descarga no disponible
                            </p>
                        `
            }
            </div>
        `;

        contenedor_libros.appendChild(div_libro);
    });
}

function buscar_libros() {
    const texto_busqueda =
        input_busqueda.value.trim();

    if (texto_busqueda === "") {
        alert(
            "Escribí un título o autor para buscar."
        );

        return;
    }

    letra_actual = "";

    url_actual =
        `https://gutendex.com/books/?search=${encodeURIComponent(
            texto_busqueda
        )}`;

    obtener_libros(url_actual, true);
}

function mostrar_generos_por_letra(letra) {
    lista_generos.innerHTML = "";
    contenedor_libros.innerHTML = "";

    const generos_filtrados = generos.filter((genero) => {
        return genero.nombre
            .toUpperCase()
            .startsWith(letra.toUpperCase());
    });

    if (generos_filtrados.length === 0) {
        lista_generos.innerHTML = `
            <p>No hay géneros que empiecen con ${letra}.</p>
        `;

        return;
    }

    generos_filtrados.forEach((genero) => {
        const boton_genero = document.createElement("button");

        boton_genero.textContent = genero.nombre;
        boton_genero.dataset.consulta = genero.consulta;
        boton_genero.classList.add("boton_genero");

        boton_genero.addEventListener("click", () => {
            buscar_libros_por_genero(
                genero.nombre,
                genero.consulta
            );
        });

        lista_generos.appendChild(boton_genero);
    });
}

function buscar_libros_por_genero(nombre, consulta) {
    letra_actual = "";
    input_busqueda.value = nombre;

    url_actual =
        `https://gutendex.com/books/?topic=${encodeURIComponent(
            consulta
        )}`;

    lista_generos.innerHTML = "";

    obtener_libros(url_actual, true);
}

btn_input_buscar.addEventListener(
    "click",
    buscar_libros
);

input_busqueda.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            buscar_libros();
        }
    }
);

botones_tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        botones_tabs.forEach((otro_tab) => {
            otro_tab.classList.remove("activo");
        });

        tab.classList.add("activo");
        filtro_actual = tab.dataset.filtro;

        lista_generos.innerHTML = "";
        input_busqueda.value = "";
        letra_actual = "";

        if (filtro_actual === "autores") {
            input_busqueda.placeholder = "Buscar libro o autor...";

            //genero_actual = "";
            letra_actual = "";

            url_actual = "https://gutendex.com/books/?sort=popular";

            lista_generos.innerHTML = "";
            obtener_libros(url_actual, true);
        }

        if (filtro_actual === "generos") {
            input_busqueda.placeholder = "Seleccioná una letra y un género";

            contenedor_libros.innerHTML = "";
            btn_cargar_mas.style.display = "none";
        }

        if (filtro_actual === "series") {
            input_busqueda.placeholder = "Series todavía no disponible";
        }
    });
});



botones_letras.forEach((boton) => {
    boton.addEventListener("click", () => {
        const letra = boton.textContent.trim();

        input_busqueda.value = letra;

        if (filtro_actual === "autores") {
            letra_actual = letra;

            url_actual =
                `https://gutendex.com/books/?search=${encodeURIComponent(
                    letra
                )}`;

            lista_generos.innerHTML = "";

            obtener_libros(
                url_actual,
                true,
                letra_actual
            );
        }

        if (filtro_actual === "generos") {
            letra_actual = "";
            mostrar_generos_por_letra(letra);
        }

        if (filtro_actual === "series") {
            lista_generos.innerHTML = `
                <p>La sección Series todavía no está disponible.</p>
            `;
        }
    });
});

btn_cargar_mas.addEventListener(
    "click",
    () => {
        obtener_libros(
            url_actual,
            false,
            letra_actual
        );

        console.log(
            "Cargando más libros..."
        );
    }
);

obtener_libros(url_actual);