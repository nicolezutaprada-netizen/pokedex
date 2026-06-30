// ============================================
// REFERENCIAS AL DOM
// ============================================
const contenedor = document.getElementById("resultado");
const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");

// ============================================
// ESTADO GLOBAL
// ============================================
const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
let pokedex = [];   // array con los pokémon ya adaptados
let offset = 0;     // desde qué pokémon empieza "cargar más"

// ============================================
// ADAPTAR DATOS DE LA API A NUESTRO FORMATO
// ============================================
function adaptarPokemon(data) {
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos: data.types.map(t => t.type.name),
    stats: data.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat }))
  };
}

// ============================================
// CREAR TARJETA DE UN POKÉMON (nodo HTML)
// ============================================
function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos } = pokemon;

  const img = imagen ?? "https://via.placeholder.com/96?text=?";

  const badges = tipos
    .map(function (tipo) {
      return `<span class="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">${tipo}</span>`;
    })
    .join("");

  const articulo = document.createElement("article");
  articulo.className = "bg-white rounded-xl shadow p-4 text-center";

  articulo.innerHTML = `
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
    <div class="flex gap-2 justify-center mt-2">${badges}</div>
  `;

  return articulo;
}

// ============================================
// PINTAR TODAS LAS TARJETAS EN PANTALLA
// ============================================
function render(lista) {
  contenedor.innerHTML = "";
  lista.forEach(function (pokemon) {
    const tarjeta = crearTarjeta(pokemon);
    contenedor.appendChild(tarjeta);
  });
}

// ============================================
// CARGA INICIAL DE LA POKÉDEX (6 pokémon)
// ============================================
async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);
  return response.json();
}

async function cargarPokedex() {
  const datos = await Promise.all(nombres.map(obtenerPokemon));
  pokedex = datos.map(adaptarPokemon);
  render(pokedex);
}

cargarPokedex();

// ============================================
// CARGAR MÁS POKÉMON (paginación)
// ============================================
async function cargarMas() {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${offset}`);
  const lista = await respuesta.json();

  const datos = await Promise.all(
    lista.results.map(item => fetch(item.url).then(r => r.json()))
  );

  datos.map(adaptarPokemon).forEach(function (pokemon) {
    if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
      pokedex.push(pokemon);
    }
  });

  offset += 12;
  render(pokedex);
}

document.getElementById("cargar-mas").addEventListener("click", cargarMas);

// ============================================
// BÚSQUEDA DE UN POKÉMON ESPECÍFICO
// ============================================
async function buscarPokemon(nombre) {
  const data = await obtenerPokemon(nombre.toLowerCase());
  return adaptarPokemon(data);
}

function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);
  }
  render(pokedex);
  buscador.value = "";
}

function mostrarResultado(pokemon) {
  const tarjeta = crearTarjeta(pokemon);

  // estadísticas (solo en el resultado de búsqueda)
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

async function mostrarBusqueda(nombre) {
  const pokemon = await buscarPokemon(nombre);
  mostrarResultado(pokemon);
}

boton.addEventListener("click", function () {
  const nombre = buscador.value.trim();
  if (nombre !== "") mostrarBusqueda(nombre);
});

buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") boton.click();
});