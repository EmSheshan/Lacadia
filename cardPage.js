function getPokemonNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("pokemonNumber"));
}

function displayStatBar(stat, value, color) {
    const maxStatValue = 255;
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


function displaySelectedPokemon(pokemonData) {
    const pokemonNumber = getPokemonNumberFromURL();
    const selectedPokemon = pokemonData[pokemonNumber - 1];

    if (selectedPokemon) {
        
        const regularImage = `Images/${selectedPokemon.name}.png`;
        const shinyImage = `Images/${selectedPokemon.name}_Shiny.png`;
        const errorImage = `Images/Missingno.png`;
        const type1Image = `Types/${selectedPokemon.type1}.png`;
        const type2Image = selectedPokemon.type2 && selectedPokemon.type2.toLowerCase() !== "na" ? `Types/${selectedPokemon.type2}.png` : null; 

        document.getElementById("previousPokemonNumber").innerText = pokemonNumber - 1; // For previous Pokémon
        document.getElementById("previousPokemonName").innerText = pokemonData[pokemonNumber - 2]?.name || ''; // If a previous Pokémon exists
        document.getElementById("nextPokemonNumber").innerText = pokemonNumber + 1; // For next Pokémon
        document.getElementById("nextPokemonName").innerText = pokemonData[pokemonNumber]?.name || ''; // If a next Pokémon exists


        document.getElementById("pokemonCard").innerHTML = `
            <div class="pokemon-details">
                <div class="pokemon-info">
                    <h1>#${pokemonNumber} ${selectedPokemon.name}</h1>
                    <img src="${regularImage}" 
                        alt="${selectedPokemon.name}" 
                        class="pokemon-image-large"
                        onmouseover="this.src='${shinyImage}'"
                        onmouseout="this.src='${regularImage}'"
                        onerror="this.src='${errorImage}'">
                    <div class="types">
                        <img src="${type1Image}" alt="${selectedPokemon.type1}" class="type-image" onerror="this.src='${errorImage}'"> 
                        ${type2Image ? `<img src="${type2Image}" alt="${selectedPokemon.type2}" class="type-image" onerror="this.src='${errorImage}'">` : ''}
                    </div>
                </div>
                <div class="pokemon-stats">
                    ${displayStatBar("HP", selectedPokemon.hp, "#FF5959")}
                    ${displayStatBar("Attack", selectedPokemon.atk, "#F5AC78")}
                    ${displayStatBar("Defense", selectedPokemon.def, "#FAE078")}
                    ${displayStatBar("Special Attack", selectedPokemon.spatk, "#9DB7F5")}
                    ${displayStatBar("Special Defense", selectedPokemon.spdef, "#A7DB8D")}
                    ${displayStatBar("Speed", selectedPokemon.speed, "#FA92B2")}
                </div>
            </div>
        `;
    } else {
        console.error("No Pokémon data found for this number.");
    }
}



function loadPokemonDataForCardPage() {
    Papa.parse("pokemon_data.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                console.error("Errors during CSV parsing:", results.errors);
            } else {
                displaySelectedPokemon(results.data);
            }
        },
        error: function(error) {
            console.error("Failed to load the CSV file:", error);
        }
    });
}

function navigatePokemon(direction) {
    const currentNumber = getPokemonNumberFromURL();
    const newNumber = direction === 'next' ? currentNumber + 1 : currentNumber - 1;

    // Adjust bounds if needed (e.g., if there's a max number of Pokémon in your dataset)
    if (newNumber > 0) {
        window.location.href = `pokemon_card.html?pokemonNumber=${newNumber}`;
    }
}

loadPokemonDataForCardPage();