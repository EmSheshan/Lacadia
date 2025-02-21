// cardPage.js
import { abilities } from './Abilities.js';

const moves = {
  "Ice Spikes": {
    type: "Ice",
    category: "Status",
    pp: 20,
    description: "The user lays a trap of levitating icicles around the opposing team. The trap damages opposing Pokémon that switch into battle.",
  },
  "Bean Barrage": {
    type: "Grass",
    category: "Special",
    accuracy: 100,
    power: 70,
    pp: 10,
    description: "The user attacks with a barrage of seeds that begin to sprout and steal some HP from the target every turn.",
  },
  "Bushido Flurry": {
    type: "Steel",
    category: "Physical",
    accuracy: 100,
    power: 18,
    pp: 10,
    description: "The user attacks flurry of sharp slashes. This attack hits five times in a row and every hit is always critical.",
  },
  "Zest Spray": {
    type: "Grass",
    category: "Special",
    accuracy: 100,
    power: 85,
    pp: 10,
    description: "The user attacks with a spray of acidic berry juice. If the user is holding a berry, the berry is consumed and the base power of this attack doubles.",
  },
  "Crushing Cleave": {
    type: "Ground",
    category: "Physical",
    accuracy: 100,
    power: 35,
    pp: 10,
    description: "The user attacks twice with two axes. The first hit lowers the target's Defense stat, and the second hit lowers the target's Sp. Def stat.",
  },
  "Venom Spear": {
    type: "Poison",
    category: "Physical",
    accuracy: 100,
    power: 60,
    pp: 10,
    description: "The user attacks with a venomous stinger that leaves the target badly poisoned. Its poison damage worsens every turn.",
  },
  "Final Act": {
    type: "Normal",
    category: "Status",
    accuracy: 100,
    pp: 20,
    description: "The user compels the target to keep using the move it encored for three turns. Then it switches places with a party Pokémon in waiting.",
  },
  "Agave Shot": {
    type: "Grass",
    category: "Special",
    accuracy: 100,
    power: 75,
    pp: 10,
    description: "The user shoots hot agave nectar at the target. This move sharply boosts the user's Attack stat but lowers its accuracy.",
  },
  "Freezing Tempo": {
    type: "Ice",
    category: "Status",
    pp: 10,
    description: "The user takes time to charge and concentrate its power. This raises its Attack and Speed stats and ensures the user's next move does not miss.",
  },
  "Icy Harpoon": {
    type: "Ice",
    category: "Physical",
    accuracy: 100,
    power: 90,
    pp: 10,
    description: "The user launches sharpened icicle at the target. It may also badly poison the target.",
  },
  "Ego Crush": {
    type: "Psychic",
    category: "Special",
    accuracy: 100,
    power: 80,
    pp: 15,
    description: "The user uses its psychic powers to directly attack the opponent's mind. This move is super effective on Psychic types.",
  },

};

function getPokemonNumberFromURL () {
  const urlParams = new URLSearchParams (window.location.search);
  return parseInt (urlParams.get ("pokemonNumber")) || 1; // Default to Pokémon #1 if no number is found
}

function updatePageTitle ( pokemonName, pokemonNumber ) {
  document.title = `#${ pokemonNumber } ${ pokemonName }` || "Pokémon Card"; // Fallback if name is missing
}

function displayStatBar ( stat, value, color, BST = false ) {
  let maxStatValue = 255;
  if ( BST ) {
    maxStatValue = 700;
  }
  const percentageWidth = (value / maxStatValue) * 100;

  return `
        <div class="stat-bar">
            <div class="stat-name">${ stat }</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${ percentageWidth }%; background-color: ${ color };"></div>
            </div>
            <div class="stat-value">${ value }</div>
        </div>
    `;
}

function displaySelectedPokemon ( pokemonData, formIndex = 0 ) {
  const pokemonNumber = getPokemonNumberFromURL ();
  const selectedPokemon = pokemonData[pokemonNumber - 1];


  const previousPokemon = pokemonData[pokemonNumber - 2];
  const nextPokemon = pokemonData[pokemonNumber];

  if ( selectedPokemon ) {
    updatePageTitle (selectedPokemon.name, pokemonNumber);

    // Retrieve selected form's data
    const forms = selectedPokemon.forms ? selectedPokemon.forms.split ("|") : [];
    const chosenForm = forms.length > 0 ? forms[formIndex] : ""; // If no forms, `chosenForm` is an empty string

    // Dynamically handle form-specific images and types
    const type1 = selectedPokemon.type1.split ("|")[formIndex] || selectedPokemon.type1.split ("|")[0];
    const type2 = selectedPokemon.type2.split ("|")[formIndex] || selectedPokemon.type2.split ("|")[0];

    const regularImage = `Images/${ selectedPokemon.name }${ chosenForm ? `_${ chosenForm }` : "" }.png`;
    const shinyImage = `Images/${ selectedPokemon.name }${ chosenForm ? `_${ chosenForm }` : "" }_Shiny.png`;
    const errorImage = `Images/Missingno.png`;
    const type1Image = `TypeBars/${ type1 }.png`;
    const type2Image = type2 && type2.toLowerCase () !== "na" ? `TypeBars/${ type2 }.png` : null;

    const ability1 = selectedPokemon.ability1.split ("|")[formIndex] || selectedPokemon.ability1.split ("|")[0];
    const ability2 = selectedPokemon.ability2.split ("|")[formIndex] || selectedPokemon.ability2.split ("|")[0];
    const abilityh = selectedPokemon.abilityh.split ("|")[formIndex] || selectedPokemon.abilityh.split ("|")[0];

    const sigmove = selectedPokemon.sigmove;
    const sigmovedesc = moves[sigmove] ? `
  ${ moves[sigmove].type ? `<img src="TypeIcons/${ moves[sigmove].type }.png" alt="${ moves[sigmove].type }"style="width: 2rem; height: 2rem;">` : '' }
  ${ moves[sigmove].category ? `<img src="MoveCategories/${ moves[sigmove].category }.png" alt="${ moves[sigmove].category }"style="width: 2rem; height: 2rem;">` : '' }
  ${ moves[sigmove].power ? `Power: ${ moves[sigmove].power },` : '' }
  ${ moves[sigmove].accuracy ? `Accuracy: ${ moves[sigmove].accuracy },` : '' }
  ${ moves[sigmove].pp ? `${ moves[sigmove].pp } PP<br><br>` : '' }
  ${ moves[sigmove].description ? `${ moves[sigmove].description }` : '' }
` : '';

    // Update navigation links/names
    document.getElementById ("previousPokemonNumber").innerText = (pokemonNumber - 1).toString ();
    document.getElementById ("previousPokemonName").innerText = previousPokemon?.name || "";
    document.getElementById ("nextPokemonNumber").innerText = pokemonNumber + 1;
    document.getElementById ("nextPokemonName").innerText = nextPokemon?.name || "";

    // Hide or disable navigation buttons
    document.querySelector (".arrow-left").style.display = previousPokemon ? "block" : "none";
    document.querySelector (".arrow-right").style.display = nextPokemon ? "block" : "none";


    // Display the Pokémon card
    document.getElementById ("pokemonCard").innerHTML = `
            <div class="title-type-container">
                <h2>#${ pokemonNumber } ${ selectedPokemon.name }${ chosenForm ? ` (${ chosenForm })` : "" }</h2>
                <span class="type-stack">
                    <img src="${ type1Image }" alt="${ type1 }" class="type-bar" onerror="this.src='${ errorImage }'">
                    ${ type2Image ? `<img src="${ type2Image }" alt="${ type2 }" class="type-bar" onerror="this.src='${ errorImage }'">` : "" }
                </span>
                <div id="formSwitchContainer" class="form-switch-container"></div>
            </div>
            <p class="pokemon-title">The ${ selectedPokemon.title } Pokémon </p>
            


            <div class="pokemon-images-container">
    <div class="circle-background">
        <img src="${ regularImage }"
            alt="${ selectedPokemon.name }"
            class="pokemon-image-large"
            onerror="this.src='${ errorImage }'">
    </div>
    <div class="circle-background-shiny">
        <img src="${ shinyImage }"
            alt="${ selectedPokemon.name } Shiny"
            class="pokemon-image-shiny"
            onerror="this.src='${ errorImage }'">
    </div>
</div>




            <!--Pokemon description and abilities-->
            <div class="container">
                <p class="pokemon-description">${ selectedPokemon.description1 }<br><br>${ selectedPokemon.description2 }</p>
                ${ ability1 ? `<p class="pokemon-ability">◆ ${ ability1 } ◆<br><span class="ability-description"> ${ abilities[ability1] }</span></p>` : '' }
                ${ ability2 ? `<p class="pokemon-ability">◆ ${ ability2 } ◆<br><span class="ability-description"> ${ abilities[ability2] }</span></p>` : '' }
                ${ abilityh ? `<p class="pokemon-ability">◆ ${ abilityh } ◆<br><span class="ability-description"> ${ abilities[abilityh] }</span></p>` : '' }
            </div>
            
            <br>
            
            ${ sigmove ? `<p class="pokemon-sigmove">Signature Move: ${ sigmove }<br><span class="pokemon-sigmove-description"> ${ sigmovedesc }</span></p>` : '' }
            
                <br>
                
                
                <div class="pokemon-stats">
                    ${ displayStatBar ("HP", selectedPokemon.hp.split ("|")[formIndex], "#FF5959") }
                    ${ displayStatBar ("Atk", selectedPokemon.atk.split ("|")[formIndex], "#F5AC78") }
                    ${ displayStatBar ("Def", selectedPokemon.def.split ("|")[formIndex], "#FAE078") }
                    ${ displayStatBar ("Sp.Atk", selectedPokemon.spatk.split ("|")[formIndex], "#9DB7F5") }
                    ${ displayStatBar ("Sp.Def", selectedPokemon.spdef.split ("|")[formIndex], "#A7DB8D") }
                    ${ displayStatBar ("Speed", selectedPokemon.speed.split ("|")[formIndex], "#FA92B2") }
                    ${ displayStatBar (
      "BST",
      Number (selectedPokemon.hp.split ("|")[formIndex]) +
      Number (selectedPokemon.atk.split ("|")[formIndex]) +
      Number (selectedPokemon.def.split ("|")[formIndex]) +
      Number (selectedPokemon.spatk.split ("|")[formIndex]) +
      Number (selectedPokemon.spdef.split ("|")[formIndex]) +
      Number (selectedPokemon.speed.split ("|")[formIndex]),
      "#CA72F2",
      true
    ) }
                </div>
`;

    // Display single form change button
    const formSwitchContainer = document.getElementById ("formSwitchContainer");
    formSwitchContainer.innerHTML = ""; // Clear existing content

    if ( forms.length > 1 ) {
      // Create a button to change the form
      const changeFormButton = document.createElement ("button");
      changeFormButton.innerText = "Change\nForm";
      changeFormButton.classList.add ("form-switch-button");

      // Add an event listener to cycle through forms
      changeFormButton.onclick = () => {
        const nextFormIndex = (formIndex + 1) % forms.length; // Cycle to the next form
        displaySelectedPokemon (pokemonData, nextFormIndex); // Update the Pokémon display with the new form
      };

      // Append the button to the form switch container
      formSwitchContainer.appendChild (changeFormButton);
    }
  } else {
    console.error ("No Pokémon data found for this number.");
  }
}

function loadPokemonDataForCardPage () {
  const cachedData = false // localStorage.getItem("pokemonData"); // Check if data is cached

  if ( cachedData ) {
    const parsedData = JSON.parse (cachedData);
    displaySelectedPokemon (parsedData);
  } else {
    Papa.parse ("pokemon_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function ( results ) {
        if ( results.errors.length > 0 ) {
          console.error ("Errors during CSV parsing:", results.errors);
        } else {
          const pokemonData = results.data;
          localStorage.setItem ("pokemonData", JSON.stringify (pokemonData)); // Cache for future use
          displaySelectedPokemon (pokemonData);
        }
      },
      error: function ( error ) {
        console.error ("Failed to load the CSV file:", error);
      },
    });
  }
}

function navigatePokemon ( direction ) {
  const currentNumber = getPokemonNumberFromURL ();
  const newNumber = direction === "next" ? currentNumber + 1 : currentNumber - 1;

  const cachedData = localStorage.getItem ("pokemonData"); // Use cached data to find the total count
  if ( cachedData ) {
    const pokemonData = JSON.parse (cachedData);
    const totalLines = pokemonData.length;

    if ( newNumber <= 0 || newNumber > totalLines ) {
      console.warn ("No Pokémon exists in this direction!");
      return; // Prevent navigation
    }

    // Navigate to the valid Pokémon
    window.location.href = `pokemon_card.html?pokemonNumber=${ newNumber }`;
  } else {
    // Fallback if cache is not available
    Papa.parse ("pokemon_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function ( results ) {
        const totalLines = results.data.length;

        if ( newNumber <= 0 || newNumber > totalLines ) {
          console.warn ("No Pokémon exists in this direction!");
          return; // Prevent navigation
        }

        // Navigate to the valid Pokémon
        window.location.href = `pokemon_card.html?pokemonNumber=${ newNumber }`;
      },
      error: function ( error ) {
        console.error ("Failed to load the CSV file:", error);
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

// Load Pokémon data for the card page
loadPokemonDataForCardPage ();