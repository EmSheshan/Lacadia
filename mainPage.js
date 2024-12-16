function loadPokemonData() {
  const cachedData = false // localStorage.getItem("pokemonData"); // Check if data is cached

  if (cachedData) {
    // If cached data is found, parse it and display Pokémon
    const parsedData = JSON.parse(cachedData);
    console.log("Loaded Pokémon data from cache.");
    displayPokemon(parsedData);
  } else {
    // If no cached data, fetch the CSV file and parse it
    console.log("No cache found. Loading data from CSV...");
    Papa.parse("pokemon_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          console.error("Errors during CSV parsing:", results.errors);
        } else {
          const pokemonData = results.data;
          // Cache the parsed data in localStorage
          localStorage.setItem("pokemonData", JSON.stringify(pokemonData));
          console.log("Cached Pokémon data.");
          displayPokemon(pokemonData);
        }
      },
      error: function (error) {
        console.error("Failed to load the CSV file:", error);
      }
    });
  }
}

function displayPokemon(pokemonList) {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = ""; // Clear existing content

  pokemonList.forEach((pokemon, index) => {
    const pokemonNumber = index + 1;

    let regularImage = `Images/${pokemon.name}.png`;
    let shinyImage = `Images/${pokemon.name}_Shiny.png`;
    const errorImage = `Images/Missingno.png`;
    let type1Image = `TypeIcons/${pokemon.type1}.png`;
    let type2Image = pokemon.type2 && pokemon.type2.toLowerCase() !== "na" ? `TypeIcons/${pokemon.type2}.png` : null;


    if (pokemon.forms) {
      const baseForm = pokemon.forms.split("|")[0];
      const type1 = pokemon.type1.split("|")[0]
      const type2 = pokemon.type2.split("|")[0]

      regularImage = `Images/${pokemon.name}_${baseForm}.png`;
      shinyImage = `Images/${pokemon.name}_${baseForm}_Shiny.png`;
      type1Image = `TypeIcons/${type1}.png`;
      type2Image = type2 && type2.toLowerCase() !== "na" ? `TypeIcons/${type2}.png` : null;

    }


    // Create the Pokémon card
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon");

    pokemonCard.style.animationDelay = `${0.1 * (index + 1)}s`; // Add delay to create staggered animation

    // Redirect to card page with pokemonNumber parameter on click
    pokemonCard.addEventListener("click", () => {
      window.location.href = `pokemon_card.html?pokemonNumber=${pokemonNumber}`;
    });

    pokemonCard.innerHTML = `
      <img src="${regularImage}" 
           alt="${pokemon.name}" 
           class="pokemon-image"
           onmouseover="this.src='${shinyImage}'"
           onmouseout="this.src='${regularImage}'"
           onerror="this.src='${errorImage}'">
      <div class="name">#${pokemonNumber} ${pokemon.name}</div>
      <div class="types">
        <img src="${type1Image}" alt="${pokemon.type1}" class="type-image" onerror="this.src='${errorImage}'"> 
        ${type2Image ? `<img src="${type2Image}" alt="${pokemon.type2}" class="type-image" onerror="this.src='${errorImage}'">` : ''}
      </div>
    `;

    pokedex.appendChild(pokemonCard);
  });
}


// Load Pokémon data on page load
loadPokemonData();