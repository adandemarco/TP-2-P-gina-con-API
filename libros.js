const contenedor_libros = document.getElementById("contenedor_libros");
const btn_cargar_mas = document.getElementById("btn_cargar_mas");

let url_actual = "https://gutendex.com/books/?sort=popular";

function obtener_libros(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            contenedor_libros.innerHTML += "<p id='cargando'>Cargando libros..............</p>";
            console.log(data.results);

            mostrar_libros(data.results);
            document.getElementById("cargando").remove();

            if (data.next) {
                url_actual = data.next;
                console.log("URL actualizada:", url_actual);
            } else{
                btn_cargar_mas.style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error al obtener los libros:", error);
    });
}

function mostrar_libros(libros) {
    libros.forEach(element => {
        const titulo = element.title;
        const autor = element.authors.length > 0 ? element.authors[0].name : "Autor desconocido";
        const imagen = element.formats["image/jpeg"] || "./img/logo.png";
        const descripcion = element.subjects.length > 0 ? element.subjects[0] : "Libro disponible para descargar.";
        const link_descarga = element.formats;

        div_libro = document.createElement("div");
        div_libro.classList.add("libro");

        div_libro.innerHTML = `
            <img src="${imagen}" alt="${titulo}">
            <div class="info_libro">
                <h3>${titulo}</h3>
                <p>Autor: ${autor}</p>
                <p>Descripción: ${descripcion}</p>
                <a href="${link_descarga}" target="_blank">Descargar</a>
            </div>
        `;
        contenedor_libros.appendChild(div_libro);
    });
}

btn_cargar_mas.addEventListener("click", () => {
    obtener_libros(url_actual);
    console.log("Cargando más libros...");
});

obtener_libros(url_actual);