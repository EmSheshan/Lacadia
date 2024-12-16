function getPokemonNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("pokemonNumber")) || 1; // Default to Pokémon #1 if no number is found
}

function updatePageTitle(pokemonName, pokemonNumber) {
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

    const totalPokemon = pokemonData.length;
    const previousPokemon = pokemonData[pokemonNumber - 2];
    const nextPokemon = pokemonData[pokemonNumber];

    if (selectedPokemon) {
        updatePageTitle(selectedPokemon.name, pokemonNumber);

        // Retrieve selected form's data
        const forms = selectedPokemon.forms ? selectedPokemon.forms.split("|") : [];
        const chosenForm = forms.length > 0 ? forms[formIndex] : ""; // If no forms, `chosenForm` is an empty string

        // Dynamically handle form-specific images and types
        const type1 = selectedPokemon.type1.split("|")[formIndex] || selectedPokemon.type1.split("|")[0];
        const type2 = selectedPokemon.type2.split("|")[formIndex] || selectedPokemon.type2.split("|")[0];

        const regularImage = `Images/${selectedPokemon.name}${chosenForm ? `_${chosenForm}` : ""}.png`;
        const shinyImage = `Images/${selectedPokemon.name}${chosenForm ? `_${chosenForm}` : ""}_Shiny.png`;
        const errorImage = `Images/Missingno.png`;
        const type1Image = `TypeBars/${type1}.png`;
        const type2Image = type2 && type2.toLowerCase() !== "na" ? `TypeBars/${type2}.png` : null;

        // Update navigation links/names
        document.getElementById("previousPokemonNumber").innerText = pokemonNumber - 1;
        document.getElementById("previousPokemonName").innerText = previousPokemon?.name || "";
        document.getElementById("nextPokemonNumber").innerText = pokemonNumber + 1;
        document.getElementById("nextPokemonName").innerText = nextPokemon?.name || "";

        // Hide or disable navigation buttons
        document.querySelector(".arrow-left").style.display = previousPokemon ? "block" : "none";
        document.querySelector(".arrow-right").style.display = nextPokemon ? "block" : "none";

        // Display the Pokémon card
        document.getElementById("pokemonCard").innerHTML = `
            <div class="title-type-container">
                <h2>#${pokemonNumber} ${selectedPokemon.name}${chosenForm ? ` (${chosenForm})` : ""}</h2>
                <span class="type-stack">
                    <img src="${type1Image}" alt="${type1}" class="type-bar" onerror="this.src='${errorImage}'">
                    ${
            type2Image
                ? `<img src="${type2Image}" alt="${type2}" class="type-bar" onerror="this.src='${errorImage}'">`
                : ""
        }
                </span>
                <div id="formSwitchContainer" class="form-switch-container"></div>
            </div>
            <p class="pokemon-title">The ${selectedPokemon.title} Pokémon </p>
            
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; margin-left: 10rem; margin-right: 10rem;
             ">

            
            <img src="${regularImage}" 
                alt="${selectedPokemon.name}" 
                class="pokemon-image-large"
                onerror="this.src='${errorImage}'">
            <img src="${shinyImage}" 
                alt="${selectedPokemon.name} Shiny" 
                class="pokemon-image-shiny"
                onerror="this.src='${errorImage}'">
                
               <div></div>
            <div class="pokemon-details">
                <p class="pokemon-description">${selectedPokemon.description}</p>
                <div class="pokemon-stats">
                    ${displayStatBar("HP", selectedPokemon.hp.split("|")[formIndex], "#FF5959")}
                    ${displayStatBar("Atk", selectedPokemon.atk.split("|")[formIndex], "#F5AC78")}
                    ${displayStatBar("Def", selectedPokemon.def.split("|")[formIndex], "#FAE078")}
                    ${displayStatBar("Sp.Atk", selectedPokemon.spatk.split("|")[formIndex], "#9DB7F5")}
                    ${displayStatBar("Sp.Def", selectedPokemon.spdef.split("|")[formIndex], "#A7DB8D")}
                    ${displayStatBar("Speed", selectedPokemon.speed.split("|")[formIndex], "#FA92B2")}
                    ${displayStatBar(
            "BST",
            Number(selectedPokemon.hp.split("|")[formIndex]) +
            Number(selectedPokemon.atk.split("|")[formIndex]) +
            Number(selectedPokemon.def.split("|")[formIndex]) +
            Number(selectedPokemon.spatk.split("|")[formIndex]) +
            Number(selectedPokemon.spdef.split("|")[formIndex]) +
            Number(selectedPokemon.speed.split("|")[formIndex]),
            "#CA72F2",
            true
        )}
                </div>
            </div>
            </div>
        `;

        // Display single form change button
        const formSwitchContainer = document.getElementById("formSwitchContainer");
        formSwitchContainer.innerHTML = ""; // Clear existing content

        if (forms.length > 1) {
            // Create a button to change the form
            const changeFormButton = document.createElement("button");
            changeFormButton.innerText = "Change Form";
            changeFormButton.classList.add("form-switch-button");

            // Add an event listener to cycle through forms
            changeFormButton.onclick = () => {
                const nextFormIndex = (formIndex + 1) % forms.length; // Cycle to the next form
                displaySelectedPokemon(pokemonData, nextFormIndex); // Update the Pokémon display with the new form
            };

            // Append the button to the form switch container
            formSwitchContainer.appendChild(changeFormButton);
        }
    } else {
        console.error("No Pokémon data found for this number.");
    }
}

function loadPokemonDataForCardPage() {
    const cachedData = false // localStorage.getItem("pokemonData"); // Check if data is cached

    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        displaySelectedPokemon(parsedData);
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
                    localStorage.setItem("pokemonData", JSON.stringify(pokemonData)); // Cache for future use
                    displaySelectedPokemon(pokemonData);
                }
            },
            error: function (error) {
                console.error("Failed to load the CSV file:", error);
            },
        });
    }
}

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
        window.location.href = `pokemon_card.html?pokemonNumber=${newNumber}`;
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
                window.location.href = `pokemon_card.html?pokemonNumber=${newNumber}`;
            },
            error: function (error) {
                console.error("Failed to load the CSV file:", error);
            },
        });
    }
}

// Load Pokémon data for the card page
loadPokemonDataForCardPage();