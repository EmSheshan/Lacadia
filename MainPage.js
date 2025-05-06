/**
 * @file MainPage.js
 * @description This file handles the loading and displaying of Pokémon data on the main page.
 * It fetches data from a CSV file, caches it in localStorage, and displays the Pokémon cards with images and types.
 *
 * @requires PapaParse
 *
 * @author Emily Sheahan
 */

const IMAGE_PATH = "Images/";
const TYPE_ICON_PATH = "TypeIcons/";
const ERROR_IMAGE = `${ IMAGE_PATH }Missingno.png`;

//comment

/**
 * Loads Pokémon data from localStorage or fetches it from a CSV file if not cached.
 */
function loadPokemonData () {
  const cachedData = localStorage.getItem ("pokemonData");
  const cachedHyperData = localStorage.getItem ("hyperData");

  //if (cachedData && cachedHyperData) {
  if ( false ) {
    // If cached data is found, parse it and display Pokémon
    console.log ("Loaded Pokémon data from cache.");
    displayPokemonData (JSON.parse (cachedData), "pokedex", false)
    displayPokemonData (JSON.parse (cachedHyperData), "hypers", true)
  } else {
    // If no cached data, fetch the CSV files and parse them
    console.log ("No cache found. Loading data from CSV...");
    parseCSV ("pokemon_data.csv", "pokemonData", "pokedex", false);
    parseCSV ("hyper_pokemon_data.csv", "hyperData", "hypers", true);
  }
}


/**
 * Parses a CSV file and caches the data in localStorage.
 * @param filePath - Path to the CSV file.
 * @param cacheKey - Key to store the data in localStorage.
 * @param containerId - ID of the container to display the Pokémon cards.
 * @param isHyper - Boolean indicating if the data is for Hyper Pokémon.
 */
function parseCSV ( filePath, cacheKey, containerId, isHyper ) {
  Papa.parse (filePath, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function ( results ) {
      if ( results.errors.length > 0 ) {
        console.error ("Errors during CSV parsing:", results.errors);
      } else {
        const data = results.data;
        // Cache the parsed data in localStorage
        localStorage.setItem (cacheKey, JSON.stringify (data));
        console.log (`Cached data for ${ filePath }.`);
        displayPokemonData (data, containerId, isHyper);
      }
    },
    error: function ( error ) {
      console.error (`Failed to load the CSV file (${ filePath }):`, error);
    }
  });
}


/**
 * Displays Pokémon data on the main page.
 * @param pokemonList - List of Pokémon data.
 * @param containerId - ID of the container to display the Pokémon cards.
 * @param isHyper - Boolean indicating if the data is for Hyper Pokémon.
 */
function displayPokemonData ( pokemonList, containerId, isHyper ) {
  const container = document.getElementById (containerId);
  container.innerHTML = ""; // Clear existing content

  pokemonList.forEach (( pokemon, index ) => {
    const pokemonNumber = isHyper ? index + 2001 : index + 1;

    let regularImage = `${ IMAGE_PATH }${ isHyper ? "Hyper_" : "" }${ pokemon.name }.png`;
    let shinyImage = `${ IMAGE_PATH }${ isHyper ? "Hyper_" : "" }${ pokemon.name }_Shiny.png`;
    let type1Image = `${ TYPE_ICON_PATH }${ pokemon.type1 }.png`;
    let type2Image = pokemon.type2 && pokemon.type2.toLowerCase () !== "na" ? `${ TYPE_ICON_PATH }${ pokemon.type2 }.png` : null;

    if ( pokemon.forms ) {
      const baseForm = pokemon.forms.split ("|")[0];
      const type1 = pokemon.type1.split ("|")[0];
      const type2 = pokemon.type2.split ("|")[0];

      regularImage = `${ IMAGE_PATH }${ isHyper ? "Hyper_" : "" }${ pokemon.name }_${ baseForm }.png`;
      shinyImage = `${ IMAGE_PATH }${ isHyper ? "Hyper_" : "" }${ pokemon.name }_${ baseForm }_Shiny.png`;
      type1Image = `${ TYPE_ICON_PATH }${ type1 }.png`;
      type2Image = type2 && type2.toLowerCase () !== "na" ? `${ TYPE_ICON_PATH }${ type2 }.png` : null;
    }

// Create the Pokémon card
    const pokemonCard = document.createElement("div");
    pokemonCard.classList.add("pokemon");

// Add the card to the container first
    container.appendChild(pokemonCard);

    document.querySelectorAll('.pokemon').forEach((element) => {
      const randomDelay = (Math.random() * 0.4).toFixed(2); // Random value between 0.1 and 0.5
      element.style.setProperty('--animation-delay', `${randomDelay}s`);
    });

// Use IntersectionObserver to trigger animation
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("slide-in"); // Add animation class
          observer.unobserve(entry.target); // Stop observing after animation
        }
      });
    }, {
      root: null, // Use the viewport as the root
      threshold: 0.1 // Trigger when 10% of the card is visible
    });

// Observe the Pokémon card
    observer.observe(pokemonCard);

    // Redirect to card page with pokemonNumber parameter on click
    pokemonCard.addEventListener ("click", () => {
      window.location.href = `pokemon_card.html?pokemonNumber=${ pokemonNumber }`;
    });

    pokemonCard.innerHTML = `
      <img src="${ regularImage }" 
           alt="${ pokemon.name }" 
           class="pokemon-image"
           onmouseover="this.src='${ shinyImage }'"
           onmouseout="this.src='${ regularImage }'"
           onerror="this.src='${ ERROR_IMAGE }'">
      <div class="name">${ isHyper ? "" : `#${ pokemonNumber } ` }${ pokemon.name }</div>
      <div class="types">
        <img src="${ type1Image }" alt="${ pokemon.type1 }" class="type-image" onerror="this.src='${ ERROR_IMAGE }'"> 
        ${ type2Image ? `<img src="${ type2Image }" alt="${ pokemon.type2 }" class="type-image" onerror="this.src='${ ERROR_IMAGE }'">` : "" }
      </div>
    `;

    container.appendChild (pokemonCard);
  });
}


// Load Pokémon data on page load
loadPokemonData ();
