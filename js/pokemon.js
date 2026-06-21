


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


// Busca el <input id="buscador"> del HTML y lo guarda
const buscador = document.getElementById("buscador");

// Cada vez que el usuario ESCRIBE algo en el buscador, se ejecuta esta función
buscador.addEventListener("input", function () {

  // Agarra lo que escribió y lo pone en minúsculas (para comparar sin importar mayúsculas)
  const texto = buscador.value.toLowerCase();

  // Filtra el array: solo se queda con los pokémon cuyo nombre CONTIENE lo que escribiste
  // ej: escribes "pika" → solo queda pikachu
  const filtrados = pokedex.filter(p => p.nombre.includes(texto));

  // Pinta SOLO los pokémon filtrados (no los 6, solo los que coinciden)
  render(filtrados);
});









//fetch → pide datos a una URL. Devuelve una promesa.
//.then → "cuando la promesa anterior se cumpla, haz esto con el resultado". Cada .then recibe lo que entregó el paso anterior.
//response → parámetro del primer .then. Es lo que entrega fetch: la respuesta cruda, sin abrir (todavía no es el objeto usable).
//data → parámetro del segundo .then. Es lo que entrega response.json(): el objeto JS final, ya listo para usar (name, sprites, types, etc.).
//.catch → "si algo falla en cualquier punto de la cadena, haz esto en vez".


function adaptarPokemon(data) {
  // recibe el objeto crudo de la API y lo convierte a tu formato

  return {
  // devuelve un objeto nuevo, con tus propios nombres

    nombre: data.name,  //data es del anterior de donde se saca toda la info
    // la API lo llama "name", tú lo llamas "nombre"

    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",

// ?.  → entra a "sprites" SOLO si existe (si no existe, no rompe, da undefined)
// ??  → si todo lo de la izquierda dio undefined/null, usa el respaldo de la derecha

    tipos:  data.types.map(t => t.type.name)
    // saca solo el nombre de cada tipo, ej: ["electric"]
    // t = cada elemento del array tipos (ej: {type: {name: "electric"}})
// t.type.name = entra a "type", luego a "name", y lo devuelve
// es lo mismo que: function(t) { return t.type.name; }
  };
}





// Array con los nombres de los 6 pokémon que quieres traer de la API
const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];

// Array vacío donde se guardarán los pokémon ya adaptados (para el buscador)
let pokedex = [];

// Por cada nombre, hace UN fetch a la API y convierte la respuesta a JSON
// Resultado: un array de 6 promesas (una por cada pokémon)
const promesas = nombres.map(function (nombre) {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`).then(r => r.json());
});

// Promise.all = "espera a que las 6 promesas se cumplan TODAS"
Promise.all(promesas)

  // Cuando las 6 llegaron, "datos" = array con los 6 objetos crudos de la API
  .then(function (datos) {

    // Adapta cada objeto crudo al formato limpio (nombre, imagen, tipos)
    pokedex = datos.map(adaptarPokemon);

    // Pinta las 6 tarjetas en pantalla
    render(pokedex);
  })

  // Si CUALQUIERA de los 6 fetch falla, muestra error
  .catch(function () {
    contenedor.innerHTML = `<p class="col-span-full text-center text-red-600">No se pudo cargar la Pokédex.</p>`;
  });