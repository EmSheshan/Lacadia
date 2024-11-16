function loadPokemonData() {
  Papa.parse("pokemon_data.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors.length > 0) {
        console.error("Errors during CSV parsing:", results.errors);
      } else {
        const pokemonData = results.data;
        displayPokemon(pokemonData);
      }
    },
    error: function (error) {
      console.error("Failed to load the CSV file:", error);
    }
  });
}

function displayPokemon(pokemonList) {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = ""; // Clear existing content

  pokemonList.forEach((pokemon, index) => {
    const pokemonNumber = index + 1;

    const regularImage = `Images/${pokemon.name}.png`;
    const shinyImage = `Images/${pokemon.name}_Shiny.png`;
    const errorImage = `Images/Missingno.png`;
    const type1Image = `TypeIcons/${pokemon.type1}.png`;
    const type2Image = pokemon.type2 && pokemon.type2.toLowerCase() !== "na" ? `TypeIcons/${pokemon.type2}.png` : null;

    // Create the Pokémon card
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon");

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

loadPokemonData();
