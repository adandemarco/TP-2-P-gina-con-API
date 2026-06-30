const contenedor_libros = document.getElementById("contenedor_libros");
const btn_cargar_mas = document.getElementById("btn_cargar_mas");
const input_busqueda = document.getElementById("input_busqueda");
const btn_input_buscar = document.getElementById("btn_input_buscar");
const botones_letras = document.querySelectorAll("#abecedario button");

let url_actual = "https://gutendex.com/books/?sort=popular";
let letra_actual = "";

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
            "./img/logo.png";

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
            >

            <div class="info_libro">
                <h3>${titulo}</h3>

                <p class="autor">
                    Autor: ${autor}
                </p>

                <p class="descripcion">
                    Tema: ${descripcion}
                </p>

                ${
                    link_descarga
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

botones_letras.forEach((boton) => {
    boton.addEventListener("click", () => {
        const letra =
            boton.textContent.trim();

        letra_actual = letra;
        input_busqueda.value = letra;

        url_actual =
            `https://gutendex.com/books/?search=${encodeURIComponent(
                letra
            )}`;

        obtener_libros(
            url_actual,
            true,
            letra_actual
        );
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