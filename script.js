// Load and display Pokémon data from CSV
function loadPokemonData() {
    Papa.parse("pokemon_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true, // Ignore empty lines
      complete: function(results) {
        if (results.errors.length > 0) {
          console.error("Errors during CSV parsing:", results.errors);
        } else {
          console.log("CSV parsed successfully:", results.data); // Log to verify the data
          displayPokemon(results.data);
        }
      },
      error: function(error) {
        console.error("Failed to load the CSV file:", error);
      }
    });
  }
  
  
  // Display Pokémon in the Pokedex
  function displayPokemon(pokemonList) {
    const pokedex = document.getElementById("pokedex");
    pokedex.innerHTML = ""; // Clear existing content
  
    pokemonList.forEach(pokemon => {
      const pokemonCard = document.createElement("div");
      pokemonCard.classList.add("pokemon");
      pokemonCard.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}">
        <div class="name">${pokemon.name}</div>
        <div class="type">${pokemon.type}</div>
      `;
      pokedex.appendChild(pokemonCard);
    });
  }
  
  // Initialize Pokémon data loading
  loadPokemonData();
  
  // Search functionality
  document.getElementById("searchBar").addEventListener("input", event => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPokemon = pokemonData.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchTerm)
    );
    displayPokemon(filteredPokemon);
  });
  