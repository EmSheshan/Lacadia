/**
 * @file index.js
 * @description This file handles the loading and displaying of Pokémon data on the main page.
 * It loads data from an imported JavaScript module, displaying only the base form tile for Pokémon with multiple forms.
 *
 * @author Emily Sheahan (Revised for form consolidation)
 */

// --- Constants & Imports ---
import {pokedex} from "./pokedex.js";
const IMAGE_PATH = "pokemonArt/";
const TYPE_ICON_PATH = "typeIcons/";
const ERROR_IMAGE = `${IMAGE_PATH}missingno.png`;


/**
 * Loads Pokémon data from the imported module and filters it to display only base forms.
 */
function loadPokemonData() {
    console.log("Loaded Pokémon data from static module.");

    const allPokemon = Object.values(pokedex);
    const baseFormsMap = new Map();

    for (const pokemon of allPokemon) {
        const num = pokemon.num;
        let simplifiedName = pokemon.name;

        // 1. DYNAMICALLY DETERMINE SIMPLIFIED NAME:
        // Check if the name contains a hyphen, indicating a potential form name.
        if (pokemon.name.includes("-")) {
            // Split the name by the hyphen and take the first part as the species name.
            // e.g., "Tortarma-Solar" -> "Tortarma"
            // e.g., "Sacrabell-Hymn" -> "Sacrabell"
            simplifiedName = pokemon.name.split("-")[0];
        }

        // Add the simplified name to the Pokemon object.
        pokemon.displayName = simplifiedName;

        // 2. FILTER: ONLY ADD THE FIRST ENTRY FOR ANY GIVEN POKEDEX NUMBER (num):
        // This ensures that for a species with multiple forms (like Yakoyza, Tortarma, Sacrabell),
        // only the first form encountered in the JSON data is added to the map.
        // We rely on the JSON order (e.g., Tortarma-Solar being before Tortarma-Polar).
        if (!baseFormsMap.has(num)) {
            baseFormsMap.set(num, pokemon);
        }
    }

    // The final list for display contains only the base entries, now with the correct simplified name.
    const pokemonList = Array.from(baseFormsMap.values());

    displayPokemonData(pokemonList, "pokedex");
}


/**
 * Displays Pokémon data on the main page.
 * @param pokemonList - Filtered list of base-form Pokémon data.
 * @param containerId - ID of the container to display the Pokémon cards.
 */
function displayPokemonData(pokemonList, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear existing content

    pokemonList.forEach((pokemon, index) => {
        // Use the sequential index for card numbering (1-based), as per your original logic
        // This is only used for the card ID/class, the number shown is from pokemon.num
        const pokemonNumber = index + 1;

        // Use the custom displayName if available, otherwise use the regular name
        const displayTileName = pokemon.displayName || pokemon.name;

        // --- DATA EXTRACTION ---
        const type1 = pokemon.types[0];
        const type2 = pokemon.types[1];

        // Base image names use the species ID. For forms like Yakoyza-Ink, the image name is typically
        // the species ID followed by the forme, i.e., 'yakoyzaink.png'.
        const baseId = pokemon.id || pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        let regularImage = `${IMAGE_PATH}${baseId}.png`;
        let shinyImage = `${IMAGE_PATH}${baseId}_shiny.png`;
        let type1Image = `${TYPE_ICON_PATH}${type1}.png`;
        let type2Image = type2 ? `${TYPE_ICON_PATH}${type2}.png` : null;

        // --- Card Creation ---
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon");

        container.appendChild(pokemonCard);

        document.querySelectorAll('.pokemon').forEach((element) => {
            const randomDelay = (Math.random() * 0.4).toFixed(2);
            element.style.setProperty('--animation-delay', `${randomDelay}s`);
        });

        // ... (IntersectionObserver and error handling code) ...
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("slide-in");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1
        });

        observer.observe(pokemonCard);

        // Redirect uses the actual Pokedex 'num' field
        pokemonCard.addEventListener("click", () => {
            window.location.href = `cardPage.html?pokemonNumber=${pokemon.num}`;
        });

        pokemonCard.innerHTML = `
            <img src="${regularImage}"
                alt="${pokemon.name}"
                class="pokemon-image"
                id="pokemonCardImage${pokemon.num}"
                onerror="this.src='${ERROR_IMAGE}'">
            <div class="name">${`#${pokemon.num-1999} `}${displayTileName}</div>
            <div class="types">
                <img src="${type1Image}" alt="${type1}" class="type-image">
                ${type2Image ? `<img src="${type2Image}" alt="${type2}" class="type-image">` : ""}
            </div>
        `;

        // Add shiny hover effect using JS event listeners
        const cardImage = document.getElementById(`pokemonCardImage${pokemon.num}`);
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