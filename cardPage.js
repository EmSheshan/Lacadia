function getPokemonNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("pokemonNumber")) || 1; // Default to Pokémon #1 if no number is in the URL
}

function updatePageTitle(pokemonName, pokemonNumber) {
    document.title = `#${pokemonNumber} ${pokemonName}` || "Pokémon Card"; // Fallback if name is missing
}

function displayStatBar(stat, value, color, BST=false) {
    let maxStatValue = 255;
    if (BST) {
        maxStatValue = 700
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

function displaySelectedPokemon(pokemonData) {
    const pokemonNumber = getPokemonNumberFromURL();
    const selectedPokemon = pokemonData[pokemonNumber - 1];

    const totalPokemon = pokemonData.length;
    const previousPokemon = pokemonData[pokemonNumber - 2];
    const nextPokemon = pokemonData[pokemonNumber];

    if (selectedPokemon) {
        updatePageTitle(selectedPokemon.name, getPokemonNumberFromURL());

        const regularImage = `Images/${selectedPokemon.name}.png`;
        const shinyImage = `Images/${selectedPokemon.name}_Shiny.png`;
        const errorImage = `Images/Missingno.png`;
        const type1Image = `TypeBars/${selectedPokemon.type1}.png`;
        const type2Image =
            selectedPokemon.type2 && selectedPokemon.type2.toLowerCase() !== "na"
                ? `TypeBars/${selectedPokemon.type2}.png`
                : null;

        document.getElementById("previousPokemonNumber").innerText = pokemonNumber - 1;
        document.getElementById("previousPokemonName").innerText = previousPokemon?.name || "";
        document.getElementById("nextPokemonNumber").innerText = pokemonNumber + 1;
        document.getElementById("nextPokemonName").innerText = nextPokemon?.name || "";

        // Hide or disable navigation buttons
        document.querySelector(".arrow-left").style.display = previousPokemon ? "block" : "none";
        document.querySelector(".arrow-right").style.display = nextPokemon ? "block" : "none";

        document.getElementById("pokemonCard").innerHTML = `
            <div class="pokemon-details">
                <div class="pokemon-info">
<div class="title-type-container">
    <h2>#${pokemonNumber} ${selectedPokemon.name}</h2>
    <div class="type-stack">
        <img src="${type1Image}" alt="${selectedPokemon.type1}" class="type-bar" onerror="this.src='${errorImage}'">
        ${type2Image ? `<img src="${type2Image}" alt="${selectedPokemon.type2}" class="type-bar" onerror="this.src='${errorImage}'">` : ""}
    </div>
</div>

                    <img src="${regularImage}" 
                        alt="${selectedPokemon.name}" 
                        class="pokemon-image-large"
                        onmouseover="this.src='${shinyImage}'"
                        onmouseout="this.src='${regularImage}'"
                        onerror="this.src='${errorImage}'">
                </div>
                <div class="pokemon-stats">
                    ${displayStatBar("HP", selectedPokemon.hp, "#FF5959")}
                    ${displayStatBar("Atk", selectedPokemon.atk, "#F5AC78")}
                    ${displayStatBar("Def", selectedPokemon.def, "#FAE078")}
                    ${displayStatBar("Sp.Atk", selectedPokemon.spatk, "#9DB7F5")}
                    ${displayStatBar("Sp.Def", selectedPokemon.spdef, "#A7DB8D")}
                    ${displayStatBar("Speed", selectedPokemon.speed, "#FA92B2")}
                    ${displayStatBar("BST", Number(
                        selectedPokemon.hp
                    ) + Number(
                        selectedPokemon.atk
                    ) + Number(
                        selectedPokemon.def
                    ) + Number(
                        selectedPokemon.spatk
                    ) + Number(
                        selectedPokemon.spdef
                    ) + Number(
                        selectedPokemon.speed
                    ), "#CA72F2", true)}
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
        complete: function (results) {
            if (results.errors.length > 0) {
                console.error("Errors during CSV parsing:", results.errors);
            } else {
                displaySelectedPokemon(results.data);
            }
        },
        error: function (error) {
            console.error("Failed to load the CSV file:", error);
        }
    });
}

function navigatePokemon(direction) {
    const currentNumber = getPokemonNumberFromURL();
    const newNumber = direction === "next" ? currentNumber + 1 : currentNumber - 1;

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
            window.location.href = `pokemon_card.html?pokemonNumber=${newNumber}`;
        },
        error: function (error) {
            console.error("Failed to load the CSV file:", error);
        },
    });
}

loadPokemonDataForCardPage();
