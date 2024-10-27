function loadPokemonData() {
    Papa.parse("pokemon_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.errors.length > 0) {
          console.error("Errors during CSV parsing:", results.errors);
        } else {
          const pokemonData = results.data;
          displayPokemon(pokemonData);
        }
      },
      error: function(error) {
        console.error("Failed to load the CSV file:", error);
      }
    });
  }
  
  function displayPokemon(pokemonList) {
    const pokedex = document.getElementById("pokedex");
    pokedex.innerHTML = ""; // Clear existing content
  
    pokemonList.forEach(pokemon => {
      // Construct the image paths for regular and shiny forms
      const regularImage = `Images/${pokemon.number}_${pokemon.name}.png`;
      const shinyImage = `Images/${pokemon.number}_${pokemon.name}_Shiny.png`;
  
      // Create a card for each Pokémon
      const pokemonCard = document.createElement("div");
      pokemonCard.classList.add("pokemon");
      pokemonCard.innerHTML = `
        <img src="${regularImage}" alt="${pokemon.name}" class="pokemon-image">
        <div class="name">${pokemon.name}</div>
        <div class="type">${pokemon.type}</div>
        <button onclick="toggleShiny('${pokemon.number}', '${pokemon.name}')">Toggle Shiny</button>
      `;
      pokedex.appendChild(pokemonCard);
    });
  }
  
  // Function to toggle shiny image
  function toggleShiny(number, name) {
    const imageElement = document.querySelector(`img[src*="${number}_${name}"]`);
    if (imageElement) {
      const isShiny = imageElement.src.includes("_Shiny");
      imageElement.src = isShiny 
        ? `images/${number}_${name}.png`
        : `images/${number}_${name}_Shiny.png`;
    }
  }
  
  loadPokemonData();
  