// === DOM ===
const contenedor = document.getElementById("resultado");
const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");
const mensaje = document.getElementById("mensaje");
const spinner = document.getElementById("spinner");

// === ESTADO ===
const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
let pokedex = [];
let offset = 0;

// === RENDER ===
function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos } = pokemon;
  const img = imagen ?? "https://via.placeholder.com/96?text=?";

  const badges = tipos
    .map(tipo => `<span class="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">${tipo}</span>`)
    .join("");

  const articulo = document.createElement("article");
  articulo.className = "bg-white rounded-xl shadow p-4 text-center"; 
  
//lo que va entre article
  articulo.innerHTML = `   
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
    <div class="flex gap-2 justify-center mt-2">${badges}</div>
  `;

  return articulo;
}

function render(lista) {
  contenedor.innerHTML = "";
  lista.forEach(pokemon => contenedor.appendChild(crearTarjeta(pokemon)));  //appendChild pega el contenido

}

// === API ===
function adaptarPokemon(data) {
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos: data.types.map(t => t.type.name),
    stats: data.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat }))
  };
}



async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);

 if (!response.ok) {
  // response.ok = true si la API respondió bien (código 200, todo correcto)
  // response.ok = false si hubo un problema (404 "no existe", 500 "error del servidor", etc.)
  // el "!" invierte: "si NO está OK" → "si hubo un problema"
  // OJO: fetch NO considera un 404 como error por sí solo, por eso hay que revisarlo a mano aquí

  throw new Error(`No se encontró "${idONombre}"`);
  // "throw" fuerza un error A PROPÓSITO, interrumpiendo la función en este punto
  //   ej: si buscó "pikachuu" → el mensaje queda: 'No se encontró "pikachuu"'
  // sin este throw, el código seguiría como si nada, sin avisar que algo salió mal
}

  return response.json();
}





// === CARGA INICIAL ===


async function cargarPokedex() {
  spinner.classList.remove("hidden");
  try {
    const datos = await Promise.all(nombres.map(obtenerPokemon));  //CADA URL CON NOMBRE DEL ARRAY NOMBRES
    pokedex = datos.map(adaptarPokemon);
    render(pokedex);
  } catch (error) {
    mensaje.textContent = "No se pudo cargar la Pokédex."; //TEXTCONTENT ESCRIBE O LEE LO Q VA DENTRO DE UN ELEMENTO HTML  (REEMPLAZA LO Q HAY DENTRO)
    mensaje.classList.remove("hidden");  //CLASSLIST MANEEJA CLASES ACA QUITA HIDDEN (OCULTA VISUALMENTE)
  } finally {
    spinner.classList.add("hidden");
  }
}


cargarPokedex(); //para q se ejecute










// === CARGAR MÁS (paginación) ===
async function cargarMas() {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${offset}`);
  const lista = await respuesta.json();

  const datos = await Promise.all(  //promise all cuando son varias promesas las que quieren agrupar
    lista.results.map(item => fetch(item.url).then(r => r.json()))  //pide url de results y lo transforma a texto que entienda js
  );

  datos.map(adaptarPokemon).forEach(function (pokemon) { //usar el formatp de adaptarpokedex con esa url cruda de datos 
    if (!pokedex.some(p => p.nombre === pokemon.nombre)) {  //compara si son igaule el nombre, si no son iguales lo sube
      pokedex.push(pokemon);
    }
  });

  offset += 12; // empieza en 0 y va avanzando de 12  en 12(cargando de 12 en 12)
  render(pokedex); //pintar
}





document.getElementById("cargar-mas").addEventListener("click", cargarMas);  //CUANDO EL USUARIO HAGA "CLICK" EJECUTA CARGAR MAS

// === BÚSQUEDA ===
async function buscarPokemon(nombre) {
  const data2 = await obtenerPokemon(nombre.toLowerCase()); // TOLOWERCASE convertir todo a minuscula para q si el usuario escrib con C  o c igual lo valga
  return adaptarPokemon(data2);//le da un parametro ya q adaptarpokemon funciona con un parametro 
}



function capturar(pokemon) {  //REVISA SI YA TIENE UN POKEDEX EN SU COLECCION
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);
  }
  render(pokedex);
  buscador.value = "";  //Limpia el campo de texto del buscador, dejándolo vacío para la próxima búsqueda.
}



function mostrarResultado(pokemon) {
  const tarjeta = crearTarjeta(pokemon);

  const stats = document.createElement("div");
  stats.className = "mt-2 text-left text-xs space-y-1";
  stats.innerHTML = pokemon.stats.map(s => `
    <div class="flex justify-between"><span class="capitalize">${s.nombre}</span><span class="font-semibold">${s.valor}</span></div>
  `).join("");
  tarjeta.appendChild(stats);

  const botonCapturar = document.createElement("button");
  botonCapturar.textContent = "⚡ Capturar";
  botonCapturar.className = "mt-2 w-full bg-yellow-400 font-semibold rounded-lg py-1 hover:bg-yellow-500";
  botonCapturar.addEventListener("click", () => capturar(pokemon));
  tarjeta.appendChild(botonCapturar);

  contenedor.innerHTML = "";
  contenedor.appendChild(tarjeta);
}


const mensaje = document.getElementById("mensaje");        // conecta con el div de error
const spinner = document.getElementById("spinner");        // conecta con el div de "Cargando..."


async function mostrarBusqueda(nombre) {

  // ANTES de buscar: prepara la pantalla
  spinner.classList.remove("hidden");   // ⏳ muestra "Cargando..."
  mensaje.classList.add("hidden");      // limpia cualquier error de una búsqueda anterior

  try {
    // intenta hacer la búsqueda; si algo falla, salta al catch

    const pokemon = await buscarPokemon(nombre);
    // pide el pokémon a la API (esto puede TARDAR y puede FALLAR)

    mostrarResultado(pokemon);
    // si llegó hasta aquí, todo salió bien → pinta la tarjeta

  } catch (error) {
    // solo entra aquí si algo de arriba (dentro del try) falló

    mensaje.textContent = error.message;
    // escribe en el div rojo el motivo exacto del fallo sacadode de response.ok cuando se creo new Error

    mensaje.classList.remove("hidden");
    // hace VISIBLE ese cartel rojo de error

  } finally {
    // esto se ejecuta SIEMPRE, sin importar si hubo error o no

    spinner.classList.add("hidden");
    // oculta el "Cargando..." porque la búsqueda ya terminó (bien o mal)
  }
}





boton.addEventListener("click", function () {
  const nombre = buscador.value.trim();
  if (nombre !== "") mostrarBusqueda(nombre);
});

buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") boton.click();
});