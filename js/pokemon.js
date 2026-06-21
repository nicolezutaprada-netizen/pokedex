const pokemonLocal = [
  { nombre: "bulbasaur",  imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",  tipos: ["grass", "poison"] },
  { nombre: "charmander", imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",  tipos: ["fire"] },
  { nombre: "squirtle",   imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",  tipos: ["water"] },
  { nombre: "pikachu",    imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", tipos: ["electric"] },
  { nombre: "jigglypuff", imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", tipos: ["normal", "fairy"] },
  { nombre: "gengar",     imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",  tipos: ["ghost", "poison"] }
];




const contenedor=document.getElementById("resultado");


function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos } = pokemon;   // ← destructuring de objeto
  // ahora usas nombre, imagen, tipos directo



  const img = imagen ?? "https://via.placeholder.com/96?text=?";
// Si "imagen" es null o undefined (no tiene URL), usa la imagen de respaldo (un cuadro gris con "?")
// ?? = "si lo de la izquierda no existe, usa lo de la derecha"

const cuantos = tipos?.length ?? 0;
// tipos?.length = si "tipos" existe, dame su cantidad. Si no existe, dame undefined (sin error)
// ?? 0 = si dio undefined, usa 0
// ?. = "accede a la propiedad SOLO si el objeto existe, si no, no revientes"




  const badges = tipos
// "tipos" es el array de tipos del pokémon, ej: ["grass", "poison"]

  .map(function (tipo) {
  // recorre cada tipo uno por uno, "tipo" = el tipo actual (ej: "grass")

    return `<span class="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">${tipo}</span>`;
    // por cada tipo, devuelve un <span> con estilos (cajita gris redondeada con el nombre del tipo)
  })
  // resultado del map: ["<span>grass</span>", "<span>poison</span>"]

  .join("");
  // une los 2 strings en uno solo: "<span>grass</span><span>poison</span>"
  // sin join, quedarían separados por coma: "<span>grass</span>,<span>poison</span>"



  // Crea un elemento NUEVO <article></article>, vacío, todavía NO está en la página
  const articulo = document.createElement("article");   // crea el nodo <article>

  // className = le pone clases de Tailwind al elemento (igual que escribir class="..." en HTML)
  // Antes: <article></article>
  // Después: <article class="bg-white rounded-xl shadow p-4 text-center"></article>
  articulo.className = "bg-white rounded-xl shadow p-4 text-center";




// innerHTML = mete CONTENIDO dentro del elemento (lo que va ENTRE las etiquetas <article>...</article>)
// Es un template literal (backtick) para poder escribir varias líneas e insertar variables con ${...}


articulo.innerHTML = `  
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
       <div class="flex gap-2 justify-center mt-2">${badges}</div>
`;

  // Devuelve el <article> YA armado (con clases y contenido) para que quien llamó
  // a esta función pueda usarlo (ej: pegarlo en la página con appendChild)
  return articulo;
}





// Función que pinta TODAS las tarjetas en pantalla, recibe un array de pokémon
function render(lista) {

  // Vacía el contenedor (borra lo que haya antes de volver a pintar)
  contenedor.innerHTML = "";

  // Recorre cada pokémon del array uno por uno
  lista.forEach(function (pokemon) {

    // Crea la tarjeta de ESE pokémon (usando la función que ya viste)
    const tarjeta = crearTarjeta(pokemon);

    // Pega esa tarjeta DENTRO del contenedor, en la página
    contenedor.appendChild(tarjeta);
  });
}

// Llama a render(), pasándole el array completo → arranca todo el proceso
render(pokemonLocal);


// Busca el <input id="buscador"> del HTML y lo guarda
const buscador = document.getElementById("buscador");

// Cada vez que el usuario ESCRIBE algo en el buscador, se ejecuta esta función
buscador.addEventListener("input", function () {

  // Agarra lo que escribió y lo pone en minúsculas (para comparar sin importar mayúsculas)
  const texto = buscador.value.toLowerCase();

  // Filtra el array: solo se queda con los pokémon cuyo nombre CONTIENE lo que escribiste
  // ej: escribes "pika" → solo queda pikachu
  const filtrados = pokemonLocal.filter(p => p.nombre.includes(texto));

  // Pinta SOLO los pokémon filtrados (no los 6, solo los que coinciden)
  render(filtrados);
});