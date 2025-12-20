// cardPage.js
import {abilities} from './abilities.js';
import {moves} from './moves.js';
import {pokedex} from './pokedex.js';
import {hyperdex} from './hyperdex.js';

// Map where Key = Pokedex Number, Value = ARRAY of Pokémon Objects
let pokemonNumMap = new Map();
let uniquePokedexNumbers = [];

function initializePokemonData() {
    const rawData = Object.values(pokedex);
    const hyperData = Object.values(hyperdex);

    rawData.forEach((pokemon) => {
        const num = parseInt(pokemon.num);

        if (!pokemonNumMap.has(num)) {
            pokemonNumMap.set(num, []);
            uniquePokedexNumbers.push(num);
        }
        pokemonNumMap.get(num).push(pokemon);
    });

    hyperData.forEach((pokemon) => {
        const num = parseInt(pokemon.num);
        pokemonNumMap.set(num, []);
        uniquePokedexNumbers.push(num);
        pokemonNumMap.get(num).push(pokemon);
    });

    uniquePokedexNumbers.sort((a, b) => a - b);
    console.log("Pokedex data initialized.");
}

initializePokemonData();


// --- Data Access ---

function getPokemonNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("pokemonNumber")) || -1;
}

function getPokemonFormsByNum(pokemonNumber) {
    return pokemonNumMap.get(pokemonNumber);
}


// --- Display Logic ---

function displayStatBar(stat, value, color, BST = false) {
    let maxStatValue = 255;
    if (BST) maxStatValue = 700;
    const percentageWidth = (value / maxStatValue) * 100;

    return `
        <div class="stat-bar">
            <div class="stat-name">${stat}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${percentageWidth}%; background-color: ${color};"></div>
            </div>
            <div class="stat-value">${value}</div>
        </div>
    `;
}

function displaySelectedPokemon(formIndex = 0) {


    const pokemonNumber = getPokemonNumberFromURL();

    const availableForms = getPokemonFormsByNum(pokemonNumber);

    if (!availableForms || availableForms.length === 0) {
        console.error(`No Pokémon found for number: ${pokemonNumber}`);
        return;
    }

    const currentFormIndex = formIndex % availableForms.length;
    const selectedPokemon = availableForms[currentFormIndex];

    const isHyper = selectedPokemon.num >= 3000


    document.body.classList.toggle("hyper-pokemon", isHyper);

    // --- Navigation Logic ---
    const currentSeqIndex = uniquePokedexNumbers.indexOf(pokemonNumber);
    const prevNum = uniquePokedexNumbers[currentSeqIndex - 1];
    const nextNum = uniquePokedexNumbers[currentSeqIndex + 1];

    const prevPokemon = prevNum ? pokemonNumMap.get(prevNum)[0] : null;
    const nextPokemon = nextNum ? pokemonNumMap.get(nextNum)[0] : null;

    // --- 1. TITLE FORMATTING (Yakoyza-Oni -> Yakoyza (Oni)) ---
    let displayName = selectedPokemon.name;
    if (displayName.includes("-") && !isHyper) {
        const parts = displayName.split("-");
        // "Yakoyza" + " (" + "Oni" + ")"
        displayName = `${parts[0]} (${parts[1]})`;
    }

    // --- Set Page Title & Nav ---
    document.title = isHyper ? `${displayName}` : `#${pokemonNumber - 1999} ${displayName}`;

    if (prevPokemon && prevPokemon.num >= 3000) { // Hyper form
        document.getElementById("previousPokemonNumber").innerText = prevPokemon ? "" : "";
        document.getElementById("previousPokemonName").innerText = prevPokemon ? prevPokemon.name : ""; // Simple name for nav
    } else {
        document.getElementById("previousPokemonNumber").innerText = prevPokemon ? `#${prevPokemon.num - 1999}` : "";
        document.getElementById("previousPokemonName").innerText = prevPokemon ? prevPokemon.name.split("-")[0] : ""; // Simple name for nav
    }

    if (nextPokemon && nextPokemon.num >= 3000) { // Hyper form
        document.getElementById("nextPokemonNumber").innerText = nextPokemon ? `` : "";
        document.getElementById("nextPokemonName").innerText = nextPokemon ? nextPokemon.name : "";
    } else {
        document.getElementById("nextPokemonNumber").innerText = nextPokemon ? `#${nextPokemon.num - 1999}` : "";
        document.getElementById("nextPokemonName").innerText = nextPokemon ? nextPokemon.name.split("-")[0] : "";
    }

    document.querySelector(".arrow-left").style.display = prevPokemon ? "block" : "none";
    document.querySelector(".arrow-right").style.display = nextPokemon ? "block" : "none";


    // --- 2. IMAGE FILENAME FORMATTING (Yakoyza-Oni -> yakoyzaoni) ---
    // Convert to lowercase and remove hyphens/spaces
    const imageBaseName = selectedPokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const regularImage = `pokemonArt/${imageBaseName}.png`;
    const shinyImage = `pokemonArt/${imageBaseName}_shiny.png`;


    // Handle Types
    const type1 = selectedPokemon.types[0];
    const type2 = selectedPokemon.types[1];
    const type1Image = `typeBars/${type1}.png`;
    const type2Image = type2 ? `typeBars/${type2}.png` : null;

    // Handle Abilities
    const ability1 = selectedPokemon.abilities["0"];
    const ability2 = selectedPokemon.abilities["1"];
    const abilityh = selectedPokemon.abilities["H"];

    // Handle Signature Move
    const sigmove = selectedPokemon.signatureMove;
    const sigmovedesc = moves[sigmove] ? `
        ${moves[sigmove].type ? `<img src="typeIcons/${moves[sigmove].type}.png" style="width:1.8rem;height:1.8rem;vertical-align:middle;" alt="">` : ''}
        ${moves[sigmove].category ? `<img src="moveIcons/${moves[sigmove].category}.png" style="width:1.8rem;height:1.8rem;vertical-align:middle;" alt="">` : ''}
        ${moves[sigmove].power ? `Power: ${moves[sigmove].power},` : ''}
        ${moves[sigmove].accuracy ? `Accuracy: ${moves[sigmove].accuracy},` : ''}
        ${moves[sigmove].pp ? `${moves[sigmove].pp} PP<br><br>` : ''}
        ${moves[sigmove].description || ''}
    ` : '';


    // --- Render to DOM ---

    document.getElementById("pokemonTitleTypeContainer").innerHTML = `
        <div class="title-type-container">
            <h2>${document.title}</h2>
            <span class="type-stack">
                <img src="${type1Image}" alt="${type1}" class="type-bar">
                ${type2Image ? `<img src="${type2Image}" alt="${type2}" class="type-bar">` : ""}
            </span>
        </div>
        <p class="pokemon-title">The ${selectedPokemon.kind} Pokémon</p>
        <div id="formSwitchContainer" class="form-switch-container"></div>
    `;

    document.getElementById("pokemonCardLeft").innerHTML = `
        <div class="pokemon-images-container">
            <div class="circle-background">
                <img src="${regularImage}" class="pokemon-image-large" id="pokemonMainImage"  alt=""/>
            </div>
        </div>
        <div class="pokemon-description">
            <p>${selectedPokemon.description ? selectedPokemon.description[0] : "No description available."}<br><br>
            ${selectedPokemon.description && selectedPokemon.description[1] ? selectedPokemon.description[1] : ""}</p>
        </div>
    `;

    // Shiny Hover Logic
    const mainImage = document.getElementById("pokemonMainImage");
    if (mainImage) {
        mainImage.addEventListener("mouseover", () => {
            mainImage.src = shinyImage;
        });
        mainImage.addEventListener("mouseout", () => {
            mainImage.src = regularImage;
        });
    }

    document.getElementById("pokemonCardRight").innerHTML = `
        <div class="pokemon-stats">
            ${displayStatBar("HP", selectedPokemon.baseStats.hp, "#FF5959")}
            ${displayStatBar("Atk", selectedPokemon.baseStats.atk, "#F5AC78")}
            ${displayStatBar("Def", selectedPokemon.baseStats.def, "#FAE078")}
            ${displayStatBar("Sp.Atk", selectedPokemon.baseStats.spa, "#9DB7F5")}
            ${displayStatBar("Sp.Def", selectedPokemon.baseStats.spd, "#A7DB8D")}
            ${displayStatBar("Speed", selectedPokemon.baseStats.spe, "#FA92B2")}
            ${displayStatBar("BST",
        Object.values(selectedPokemon.baseStats).reduce((a, b) => a + b, 0),
        "#CA72F2", true
    )}
        </div>
        <div class="pokemon-abilities">
            <div class="ability-list">
                ${[ability1, ability2, abilityh].filter(Boolean).map(a => {
        const isLacadia = abilities[a]?.tag === 'lacadia' || abilities[a]?.tag === 'hyper';
        return `
                    <div class="pokemon-ability${isLacadia ? ' lacadia-ability' : ''}" tabindex="0">
                        ${isLacadia ? '◆ ' : ''}${a}${isLacadia ? ' ◆' : ''}
                        <span class="ability-description-popup">
                            ${typeof abilities[a] === 'object' ? abilities[a].description : (abilities[a] || "No Description")}
                        </span>
                    </div>`;
    }).join('')}
            </div>
        </div>
        ${sigmove ? `<p class="pokemon-sigmove">Signature Move: ${sigmove}<br><span class="pokemon-sigmove-description">${sigmovedesc}</span></p>` : ''}
    `;


    // --- Form Switch Button ---
    const formSwitchContainer = document.getElementById("formSwitchContainer");
    formSwitchContainer.innerHTML = "";

    if (availableForms.length > 1) {
        const changeFormButton = document.createElement("button");
        changeFormButton.innerText = "Change\nForm";
        changeFormButton.classList.add("form-switch-button");

        changeFormButton.onclick = () => {
            displaySelectedPokemon(currentFormIndex + 1);
        };

        formSwitchContainer.appendChild(changeFormButton);
    }
}


function loadPokemonDataForCardPage() {
    displaySelectedPokemon();
}

function navigatePokemon(direction) {
    const currentNumber = getPokemonNumberFromURL();
    const currentSeqIndex = uniquePokedexNumbers.indexOf(currentNumber);

    if (currentSeqIndex === -1) return;

    const newIndex = direction === "next" ? currentSeqIndex + 1 : currentSeqIndex - 1;

    if (newIndex >= 0 && newIndex < uniquePokedexNumbers.length) {
        window.location.href = `cardPage.html?pokemonNumber=${uniquePokedexNumbers[newIndex]}`;
    }
}

window.navigatePokemon = navigatePokemon;
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') navigatePokemon('previous');
    if (event.key === 'ArrowRight') navigatePokemon('next');
});

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.toggle-dark-mode-card');
    const changeFavicon = window.changeFavicon || (() => {
    });
    const isDark = localStorage.getItem('darkMode') === 'enabled';

    if (isDark) {
        document.body.classList.add('dark-mode');
        if (button) button.innerHTML = '<i class="fas fa-moon"></i>';
        changeFavicon("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/1999/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌌</text></svg>");
    } else {
        if (button) button.innerHTML = '<i class="fas fa-sun"></i>';
        changeFavicon("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/1999/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>");
    }

    // Popup Logic
    document.querySelectorAll('.pokemon-ability').forEach(abilityEl => {
        abilityEl.addEventListener('mouseenter', handleAbilityPopupPosition);
        abilityEl.addEventListener('focus', handleAbilityPopupPosition);
        abilityEl.addEventListener('mouseleave', removeAbilityPopupLeftClass);
        abilityEl.addEventListener('blur', removeAbilityPopupLeftClass);
    });

    function handleAbilityPopupPosition(e) {
        const popup = e.currentTarget.querySelector('.ability-description-popup');
        if (!popup) return;
        popup.classList.remove('left');
        popup.style.display = 'block';
        const rect = popup.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            popup.classList.add('left');
        }
        popup.style.display = '';
    }

    function removeAbilityPopupLeftClass(e) {
        const popup = e.currentTarget.querySelector('.ability-description-popup');
        if (popup) popup.classList.remove('left');
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW registration failed:', err));
    });
}

loadPokemonDataForCardPage();