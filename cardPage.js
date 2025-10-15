// cardPage.js
import {abilities} from './abilities.js';
import {moves} from './moves.js';

function getPokemonNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("pokemonNumber")) || -1; // Default to Pokémon #1 if no number is found
}

function updatePageTitle(pokemonNumber, pokemonName) {
    document.title = `#${pokemonNumber} ${pokemonName}` || "Pokémon Card"; // Fallback if name is missing
}

function displayStatBar(stat, value, color, BST = false) {
    let maxStatValue = 255;
    if (BST) {
        maxStatValue = 700;
    }
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

function displaySelectedPokemon(pokemonData, formIndex = 0) {
    const pokemonNumber = getPokemonNumberFromURL();
    const selectedPokemon = pokemonData[pokemonNumber - 1];
    const previousPokemon = pokemonData[pokemonNumber - 2];
    const nextPokemon = pokemonData[pokemonNumber];


    // Update navigation links/names
    document.getElementById("previousPokemonNumber").innerText = (pokemonNumber - 1).toString();
    document.getElementById("previousPokemonName").innerText = previousPokemon?.name || "";
    document.getElementById("nextPokemonNumber").innerText = pokemonNumber + 1;
    document.getElementById("nextPokemonName").innerText = nextPokemon?.name || "";

    // Hide or disable navigation buttons
    document.querySelector(".arrow-left").style.display = previousPokemon ? "block" : "none";
    document.querySelector(".arrow-right").style.display = nextPokemon ? "block" : "none";


    updatePageTitle(pokemonNumber, selectedPokemon.name);

    // Retrieve selected form's data
    const forms = selectedPokemon.forms ? selectedPokemon.forms.split("|") : [];
    const chosenForm = forms.length > 0 ? forms[formIndex] : ""; // If no forms, `chosenForm` is an empty string

    // Dynamically handle form-specific images and types
    const type1 = selectedPokemon.type1.split("|")[formIndex] || selectedPokemon.type1.split("|")[0];
    const type2 = selectedPokemon.type2.split("|")[formIndex] || selectedPokemon.type2.split("|")[0];

    const regularImage = `pokemonArt/${selectedPokemon.name}${chosenForm ? `_${chosenForm}` : ""}.png`;
    const shinyImage = `pokemonArt/${selectedPokemon.name}${chosenForm ? `_${chosenForm}` : ""}_Shiny.png`;

    console.log(`was the shiny image loaded? ${shinyImage}`);
    const errorImage = `pokemonArt/Missingno.png`;
    const type1Image = `typeBars/${type1}.png`;
    const type2Image = type2 && type2.toLowerCase() !== "na" ? `typeBars/${type2}.png` : null;

    const ability1 = selectedPokemon.ability1.split("|")[formIndex] || selectedPokemon.ability1.split("|")[0];
    const ability2 = selectedPokemon.ability2.split("|")[formIndex] || selectedPokemon.ability2.split("|")[0];
    const abilityh = selectedPokemon.abilityh.split("|")[formIndex] || selectedPokemon.abilityh.split("|")[0];


    const sigmove = selectedPokemon.sigmove;
    const sigmovedesc = moves[sigmove] ? `
  ${moves[sigmove].type ? `<img src="typeIcons/${moves[sigmove].type}.png" alt="${moves[sigmove].type}" style="width:1.8rem;height:1.8rem;vertical-align:middle;">` : ''}
  ${moves[sigmove].category ? `<img src="moveIcons/${moves[sigmove].category}.png" alt="${moves[sigmove].category}" style="width:1.8rem;height:1.8rem;vertical-align:middle;">` : ''}
  ${moves[sigmove].power ? `Power: ${moves[sigmove].power},` : ''}
  ${moves[sigmove].accuracy ? `Accuracy: ${moves[sigmove].accuracy},` : ''}
  ${moves[sigmove].pp ? `${moves[sigmove].pp} PP<br><br>` : ''}
  ${moves[sigmove].description ? `${moves[sigmove].description}` : ''}
` : '';

    // Update navigation links/names
    document.getElementById("previousPokemonNumber").innerText = '#' + (pokemonNumber - 1).toString();
    document.getElementById("previousPokemonName").innerText = previousPokemon?.name || "";
    document.getElementById("nextPokemonNumber").innerText = '#' + (pokemonNumber + 1).toString();
    document.getElementById("nextPokemonName").innerText = nextPokemon?.name || "";

    // Hide or disable navigation buttons
    document.querySelector(".arrow-left").style.display = previousPokemon ? "block" : "none";
    document.querySelector(".arrow-right").style.display = nextPokemon ? "block" : "none";


    document.getElementById("pokemonTitleTypeContainer").innerHTML = `
    <div class="title-type-container">
        <h2>#${pokemonNumber} ${selectedPokemon.name}${chosenForm ? ` (${chosenForm})` : ""}</h2>
        <span class="type-stack">
            <img src="${type1Image}" alt="${type1}" class="type-bar" onerror="this.src='${errorImage}'">
            ${type2Image ? `<img src="${type2Image}" alt="${type2}" class="type-bar" onerror="this.src='${errorImage}'">` : ""}
        </span>
    </div>
    <p class="pokemon-title">The ${selectedPokemon.title} Pokémon</p>
    <div id="formSwitchContainer" class="form-switch-container"></div>
    
`;

    document.getElementById("pokemonCardLeft").innerHTML = `
    <div class="pokemon-images-container">
        <div class="circle-background">
            <img 
    src="${regularImage}" 
    class="pokemon-image-large"
    alt="${selectedPokemon.name}"
    id="pokemonMainImage"
    onerror="this.src='${errorImage}'"
/>
        </div>
    </div>
    <div class="pokemon-description">
  <p>${selectedPokemon.description1}<br>  </br>${selectedPokemon.description2}</p>
</div>
    `;

    // Add shiny hover effect using JS event listeners
    const mainImage = document.getElementById("pokemonMainImage");
    if (mainImage) {
        mainImage.addEventListener("mouseover", () => {
            mainImage.src = shinyImage;
        });
        mainImage.addEventListener("mouseout", () => {
            mainImage.src = regularImage;
        });
    }

    // RIGHT COLUMN: Stats, abilities, signature move
    document.getElementById("pokemonCardRight").innerHTML = `
        <div class="pokemon-stats">
            ${displayStatBar("HP", selectedPokemon.hp.split("|")[formIndex] || selectedPokemon.hp.split("|")[0], "#FF5959")}
            ${displayStatBar("Atk", selectedPokemon.atk.split("|")[formIndex] || selectedPokemon.atk.split("|")[0], "#F5AC78")}
            ${displayStatBar("Def", selectedPokemon.def.split("|")[formIndex] || selectedPokemon.def.split("|")[0], "#FAE078")}
            ${displayStatBar("Sp.Atk", selectedPokemon.spatk.split("|")[formIndex] || selectedPokemon.spatk.split("|")[0], "#9DB7F5")}
            ${displayStatBar("Sp.Def", selectedPokemon.spdef.split("|")[formIndex] || selectedPokemon.spdef.split("|")[0], "#A7DB8D")}
            ${displayStatBar("Speed", selectedPokemon.speed.split("|")[formIndex] || selectedPokemon.speed.split("|")[0], "#FA92B2")}
            ${displayStatBar(
        "BST",
        Number(selectedPokemon.hp.split("|")[formIndex] || selectedPokemon.hp.split("|")[0]) +
        Number(selectedPokemon.atk.split("|")[formIndex] || selectedPokemon.atk.split("|")[0]) +
        Number(selectedPokemon.def.split("|")[formIndex] || selectedPokemon.def.split("|")[0]) +
        Number(selectedPokemon.spatk.split("|")[formIndex] || selectedPokemon.spatk.split("|")[0]) +
        Number(selectedPokemon.spdef.split("|")[formIndex] || selectedPokemon.spdef.split("|")[0]) +
        Number(selectedPokemon.speed.split("|")[formIndex] || selectedPokemon.speed.split("|")[0]),
        "#CA72F2",
        true
    )}
        </div>
        <div class="pokemon-abilities">
<div class="ability-list">
  ${ability1 ? `
    <div class="pokemon-ability${abilities[ability1] && typeof abilities[ability1] === 'object' && abilities[ability1].tag === 'lacadia' ? ' lacadia-ability' : ''}" tabindex="0">
      ${abilities[ability1] && typeof abilities[ability1] === 'object' && abilities[ability1].tag === 'lacadia' ? '◆ ' : ''}
      ${ability1}
      ${abilities[ability1] && typeof abilities[ability1] === 'object' && abilities[ability1].tag === 'lacadia' ? ' ◆' : ''}
      <span class="ability-description-popup">
        ${typeof abilities[ability1] === 'object' ? abilities[ability1].description : abilities[ability1]}
      </span>
    </div>` : ''}
  
  ${ability2 ? `
    <div class="pokemon-ability${abilities[ability2] && typeof abilities[ability2] === 'object' && abilities[ability2].tag === 'lacadia' ? ' lacadia-ability' : ''}" tabindex="0">
      ${abilities[ability2] && typeof abilities[ability2] === 'object' && abilities[ability2].tag === 'lacadia' ? '◆ ' : ''}
      ${ability2}
      ${abilities[ability2] && typeof abilities[ability2] === 'object' && abilities[ability2].tag === 'lacadia' ? ' ◆' : ''}
      <span class="ability-description-popup">
        ${typeof abilities[ability2] === 'object' ? abilities[ability2].description : abilities[ability2]}
      </span>
    </div>` : ''}

  ${abilityh ? `
    <div class="pokemon-ability${abilities[abilityh] && typeof abilities[abilityh] === 'object' && abilities[abilityh].tag === 'lacadia' ? ' lacadia-ability' : ''}" tabindex="0">
      ${abilities[abilityh] && typeof abilities[abilityh] === 'object' && abilities[abilityh].tag === 'lacadia' ? '◆ ' : ''}
      ${abilityh}
      ${abilities[abilityh] && typeof abilities[abilityh] === 'object' && abilities[abilityh].tag === 'lacadia' ? ' ◆' : ''}
      <span class="ability-description-popup">
        ${typeof abilities[abilityh] === 'object' ? abilities[abilityh].description : abilities[abilityh]}
      </span>
    </div>` : ''}
</div>

        </div>
        ${sigmove ? `<p class="pokemon-sigmove">Signature Move: ${sigmove}<br><span class="pokemon-sigmove-description">${sigmovedesc}</span></p>` : ''}
    `;

    // Display single form change button
    const formSwitchContainer = document.getElementById("formSwitchContainer");
    formSwitchContainer.innerHTML = ""; // Clear existing content


    if (forms.length > 1) {
        // Create a button to change the form
        const changeFormButton = document.createElement("button");
        changeFormButton.innerText = "Change\nForm";
        changeFormButton.classList.add("form-switch-button");

        // Add an event listener to cycle through forms
        changeFormButton.onclick = () => {
            const nextFormIndex = (formIndex + 1) % forms.length; // Cycle to the next form
            displaySelectedPokemon(pokemonData, nextFormIndex); // Update the Pokémon display with the new form
        };

        // Append the button to the form switch container
        formSwitchContainer.appendChild(changeFormButton);
    }
}

/**
 * Loads Pokémon data for the card page, using cached data if available.
 * If not cached, it fetches and parses the CSV file, then caches the data.
 */
function loadPokemonDataForCardPage() {
    const cachedData = localStorage.getItem("pokemonData");

    if (cachedData) {
        const pokemonData = JSON.parse(cachedData);
        displaySelectedPokemon(pokemonData);
    } else {
        Papa.parse("pokemon_data.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.errors.length > 0) {
                    console.error("Errors during CSV parsing:", results.errors);
                } else {
                    const pokemonData = results.data;
                    localStorage.setItem("pokemonData", JSON.stringify(pokemonData));


                }
            },
            error: function (error) {
                console.error("Failed to load the CSV file:", error);
            }
        });
    }
}

/**
 * Navigates to the next or previous Pokémon card based on which arrow is pressed at the top of the screen.
 * @param direction
 */
function navigatePokemon(direction) {
    const currentNumber = getPokemonNumberFromURL();


    const newNumber = direction === "next" ? currentNumber + 1 : currentNumber - 1;

    const cachedData = localStorage.getItem("pokemonData"); // Use cached data to find the total count
    if (cachedData) {
        const pokemonData = JSON.parse(cachedData);
        const totalLines = pokemonData.length;

        if (newNumber <= 0 || newNumber > totalLines) {
            console.warn("No Pokémon exists in this direction!");
            return; // Prevent navigation
        }

        // Navigate to the valid Pokémon
        window.location.href = `cardPage.html?pokemonNumber=${newNumber}`;
    } else {
        // Fallback if cache is not available
        Papa.parse("pokemon_data.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const totalLines = results.data.length;

                if (newNumber <= 0 || newNumber > totalLines) {
                    console.warn("No Pokémon exists in this direction!");
                    return; // Prevent navigation
                }

                // Navigate to the valid Pokémon
                window.location.href = `cardPage.html?pokemonNumber=${newNumber}`;
            },
            error: function (error) {
                console.error("Failed to load the CSV file:", error);
            },
        });
    }

}


window.navigatePokemon = navigatePokemon;
// Add event listener for keydown event
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        navigatePokemon('previous');
    } else if (event.key === 'ArrowRight') {
        navigatePokemon('next');
    }
});

// Remove local dark mode logic, rely on darkMode.js for all dark mode handling
// Set initial icon and mode based on the saved state
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.toggle-dark-mode-card');
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        button.innerHTML = '<i class="fas fa-moon"></i>';
        changeFavicon("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌌</text></svg>");
    } else {
        button.innerHTML = '<i class="fas fa-sun"></i>';
        changeFavicon("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>");
    }

    // Ability popup positioning logic
    document.querySelectorAll('.pokemon-ability').forEach(abilityEl => {
        abilityEl.addEventListener('mouseenter', handleAbilityPopupPosition);
        abilityEl.addEventListener('focus', handleAbilityPopupPosition);
        abilityEl.addEventListener('mouseleave', removeAbilityPopupLeftClass);
        abilityEl.addEventListener('blur', removeAbilityPopupLeftClass);
    });

    function handleAbilityPopupPosition(e) {
        const popup = e.currentTarget.querySelector('.ability-description-popup');
        if (!popup) return;
        // Reset
        popup.classList.remove('left');
        // Temporarily show to measure
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





// Register service worker for image caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    });
}
// Load Pokémon data for the card page
loadPokemonDataForCardPage();