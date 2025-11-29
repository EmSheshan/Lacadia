/**
 * @file index.js
 * @description This file handles the loading and displaying of Pokémon data on the main page.
 * It fetches data from a CSV file, caches it in localStorage, and displays the Pokémon cards with images and types.
 *
 * @author Emily Sheahan
 */

const IMAGE_PATH = "pokemonArt/";
const TYPE_ICON_PATH = "typeIcons/";
const ERROR_IMAGE = `${IMAGE_PATH}Missingno.png`;


/**
 * Loads Pokémon data from localStorage or fetches it from a CSV file if not cached.
 */
function loadPokemonData() {
    const cachedData = localStorage.getItem("pokemonData");

    if (false) {
        console.log("Loaded Pokémon data from cache.");
        displayPokemonData(JSON.parse(cachedData), "pokedex")
    } else {
        console.log("No cache found. Loading data from CSV...");
        parseCSV("pokemon_data.csv", "pokemonData", "pokedex");
    }
}


/**
 * Parses a CSV file and caches the data in localStorage.
 * @param filePath - Path to the CSV file.
 * @param cacheKey - Key to store the data in localStorage.
 * @param containerId - ID of the container to display the Pokémon cards.
 */
function parseCSV(filePath, cacheKey, containerId) {
    Papa.parse(filePath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            if (results.errors.length > 0) {
                console.error("Errors during CSV parsing:", results.errors);
            } else {
                const data = results.data;
                // Cache the parsed data in localStorage
                localStorage.setItem(cacheKey, JSON.stringify(data));
                console.log(`Cached data for ${filePath}.`);
                displayPokemonData(data, containerId);
            }
        },
        error: function (error) {
            console.error(`Failed to load the CSV file (${filePath}):`, error);
        }
    });
}


/**
 * Displays Pokémon data on the main page.
 * @param pokemonList - List of Pokémon data.
 * @param containerId - ID of the container to display the Pokémon cards.
 */
function displayPokemonData(pokemonList, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear existing content

    pokemonList.forEach((pokemon, index) => {
        const pokemonNumber = index + 1;

        let regularImage = `${IMAGE_PATH}${pokemon.name}.png`;
        let shinyImage = `${IMAGE_PATH}${pokemon.name}_Shiny.png`;
        let type1Image = `${TYPE_ICON_PATH}${pokemon.type1}.png`;
        let type2Image = pokemon.type2 && pokemon.type2.toLowerCase() !== "na" ? `${TYPE_ICON_PATH}${pokemon.type2}.png` : null;

        if (pokemon.forms) {
            const baseForm = pokemon.forms.split("|")[0];
            const type1 = pokemon.type1.split("|")[0];
            const type2 = pokemon.type2.split("|")[0];

            regularImage = `${IMAGE_PATH}${pokemon.name}_${baseForm}.png`;
            shinyImage = `${IMAGE_PATH}${pokemon.name}_${baseForm}_Shiny.png`;
            type1Image = `${TYPE_ICON_PATH}${type1}.png`;
            type2Image = type2 && type2.toLowerCase() !== "na" ? `${TYPE_ICON_PATH}${type2}.png` : null;
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
        pokemonCard.addEventListener("click", () => {
            window.location.href = `cardPage.html?pokemonNumber=${pokemonNumber}`;
        });

        pokemonCard.innerHTML = `
      <img src="${regularImage}" 
           alt="${pokemon.name}" 
           class="pokemon-image"
           id="pokemonCardImage${pokemonNumber}"
           onerror="this.src='${regularImage}'">
      <div class="name">${`#${pokemonNumber} `}${pokemon.name}</div>
      <div class="types">
        <img src="${type1Image}" alt="${pokemon.type1}" class="type-image">
        ${type2Image ? `<img src="${type2Image}" alt="${pokemon.type2}" class="type-image">` : ""}
      </div>
    `;

        // Add shiny hover effect using JS event listeners
        const cardImage = document.getElementById(`pokemonCardImage${pokemonNumber}`);
        if (cardImage) {
            cardImage.addEventListener("mouseover", () => {
                cardImage.src = shinyImage;
            });
            cardImage.addEventListener("mouseout", () => {
                cardImage.src = regularImage;
            });
        }

        // Add error handling for images using JavaScript instead of onerror attribute
        const images = pokemonCard.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', function () {
                this.src = ERROR_IMAGE;
            });
        });

        container.appendChild(pokemonCard);
    });
}


// Register service worker for image caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    });
}

// Load Pokémon data on page load
loadPokemonData();
