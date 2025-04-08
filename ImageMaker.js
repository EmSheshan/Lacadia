import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from 'canvas';
import { abilities } from './Abilities.js'
import { moves } from './Moves.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath (import.meta.url);
const __dirname = path.dirname (__filename);


// Add a method to draw rounded rectangles
CanvasRenderingContext2D.prototype.fillRoundRect = function ( x, y, width, height, radius ) {
  this.beginPath ();
  this.moveTo (x + radius, y);
  this.arcTo (x + width, y, x + width, y + height, radius);
  this.arcTo (x + width, y + height, x, y + height, radius);
  this.arcTo (x, y + height, x, y, radius);
  this.arcTo (x, y, x + width, y, radius);
  this.closePath ();
  this.fill ();
};

// Custom function to draw a rounded rectangle outline
function strokeRoundRect ( ctx, x, y, width, height, radius ) {
  ctx.beginPath ();
  ctx.moveTo (x + radius, y);
  ctx.lineTo (x + width - radius, y);
  ctx.quadraticCurveTo (x + width, y, x + width, y + radius);
  ctx.lineTo (x + width, y + height - radius);
  ctx.quadraticCurveTo (x + width, y + height, x + width - radius, y + height);
  ctx.lineTo (x + radius, y + height);
  ctx.quadraticCurveTo (x, y + height, x, y + height - radius);
  ctx.lineTo (x, y + radius);
  ctx.quadraticCurveTo (x, y, x + radius, y);
  ctx.closePath ();
  ctx.stroke ();
}

// Register the custom font
registerFont (path.join (__dirname, 'Graphics', 'revue.ttf'), { family: 'CustomFont' });
registerFont (path.join (__dirname, 'Graphics', 'Ubuntu-Regular.ttf'), { family: 'FrontPageNeue' });
registerFont(path.join(__dirname, 'Graphics', 'Ubuntu-Bold.ttf'), { family: 'FrontPageNeue', weight: 'bold' });


// Step 1: Read the CSV file
const pokemonData = [];
fs.createReadStream ('pokemon_data.csv')
  .pipe (csv ())
  .on ('data', ( row ) => {
    pokemonData.push (row);
  })
  .on ('end', () => {
    console.log ('CSV file successfully processed');
    // Create the output directory if it doesn't exist
    const outputDir = path.join (__dirname, 'pokemon_images');
    if ( !fs.existsSync (outputDir) ) {
      fs.mkdirSync (outputDir);
    }
    // Step 3: Generate images for each Pokémon and its forms
    pokemonData.forEach (( pokemon ) => {
      // If the Pokémon has forms, handle them
      if ( pokemon.forms ) {
        const forms = pokemon.forms.split ('|'); // Split forms by '|'
        forms.forEach (( form, index ) => {

          // Create a new object for each form, ensuring that data like stats and types are specific to the form
          const formPokemon = {
            ...pokemon,
            name: `${pokemon.name}_${form.trim()}`,
            type1: pokemon.type1.split('|')[index] || pokemon.type1,
            type2: pokemon.type2 ? pokemon.type2.split('|')[index] || pokemon.type2 : undefined,
            hp: pokemon.hp.split('|')[index] || pokemon.hp,
            atk: pokemon.atk.split('|')[index] || pokemon.atk,
            def: pokemon.def.split('|')[index] || pokemon.def,
            spatk: pokemon.spatk.split('|')[index] || pokemon.spatk,
            spdef: pokemon.spdef.split('|')[index] || pokemon.spdef,
            speed: pokemon.speed.split('|')[index] || pokemon.speed,
            sigmove: pokemon.sigmove || undefined,
            description1: pokemon.description1,
            description2: pokemon.description2,



            ability1: pokemon.ability1.split('|')[index] || pokemon.ability1, // Handle form-specific ability1
            ability2: pokemon.ability2 ? pokemon.ability2.split('|')[index] || pokemon.ability2 : undefined,
            abilityh: pokemon.abilityh ? pokemon.abilityh.split('|')[index] || pokemon.abilityh : undefined,
          };

          // Generate the main image and shiny image for each form
          // generateMainPokemonImage (formPokemon, outputDir); // TODO: uncomment this when new files need to be made
          generateShinyPokemonImage (formPokemon, outputDir);
        });
      } else {
        // If no forms, just generate the normal and shiny images
        // generateMainPokemonImage (pokemon, outputDir); // TODO: uncomment this when new files need to be made
        generateShinyPokemonImage (pokemon, outputDir);
      }
    });

  });

// Function to generate the type background
function generateBackground ( ctx, type1, type2 ) {
  const typeColors = {
    Normal: '#8f98a0',
    Fire: '#fd9b53',
    Water: '#4c8fd3',
    Electric: '#f1d03b',
    Grass: '#62ba5a',
    Ice: '#73ccbe',
    Fighting: '#cc3f68',
    Poison: '#aa69c6',
    Ground: '#d77645',
    Flying: '#8ea7db',
    Psychic: '#f77075',
    Bug: '#8fbf2c',
    Rock: '#c5b68a',
    Ghost: '#5168ab',
    Dragon: '#0a6cc2',
    Dark: '#595265',
    Steel: '#598da0',
    Fairy: '#ea8ee4'
  };

  // Fill the top half with the primary type color
  ctx.fillStyle = typeColors[type1] || '#000000'; // Default to black if type1 is not found
  ctx.fillRect (0, 0, 1000, 1000);

  // Fill the bottom half with the secondary type color if it exists
  if ( type2 ) {
    ctx.fillStyle = typeColors[type2] || '#000000'; // Default to black if type2 is not found
    ctx.fillRect (0, 500, 1000, 500);
  }
}

// Function to generate the main image
function generateMainPokemonImage ( pokemon, outputDir ) {
  const canvas = createCanvas (1000, 1000);
  const ctx = canvas.getContext ('2d');

  // Generate the type background
  generateBackground (ctx, pokemon.type1, pokemon.type2);

  // Load and add the background image
  const bgPath = path.join (__dirname, 'Graphics', 'Main_Bg.png');
  loadImage (bgPath).then (( bgImage ) => {
    ctx.drawImage (bgImage, 0, 0, 1000, 1000); // Draw the background image to cover the entire canvas
  });

  // Load and add the Pokémon image
  const imagePath = path.join (__dirname, 'Images', `${ pokemon.name }.png`);
  loadImage (imagePath).then (( image ) => {

    let pokemonName = pokemon.name;
    if ( pokemonName.includes ('_') ) {
      const [baseName, formName] = pokemonName.split ('_');
      pokemonName = `${ baseName } (${ formName })`;
    }

    // Load and add the type icons (top-right corner)
    const type1Path = path.join (__dirname, 'TypeIcons', `${ pokemon.type1 }.png`);
    const type2Path = pokemon.type2 ? path.join (__dirname, 'TypeIcons', `${ pokemon.type2 }.png`) : null;

    const typeIconPromises = [loadImage (type1Path)];
    if ( type2Path ) {
      typeIconPromises.push (loadImage (type2Path));
    }

    Promise.all (typeIconPromises).then (( [type1Image, type2Image] ) => {
      // Draw a white circle behind the type1 icon
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath ();
      ctx.arc (765, 70, 60, 0, Math.PI * 2); // Adjust position and radius as needed
      ctx.fill ();

      ctx.drawImage (type1Image, 715, 20, 100, 100); // Adjust the position and size as needed

      if ( type2Image ) {
        // Draw a white circle behind the type2 icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath ();
        ctx.arc (900, 70, 60, 0, Math.PI * 2);
        ctx.fill ();

        ctx.drawImage (type2Image, 850, 20, 100, 100);
      }

      // Proceed with rendering the Pokémon image and other elements
      ctx.drawImage (image, 125, 125, 750, 750); // Center the image and adjust the size as needed
      renderPokemonName (ctx, pokemonName);
      saveImage (canvas, outputDir, `${ pokemon.name }_main`);
    }).catch (( err ) => {
      console.error (`Error loading type icons for ${ pokemon.name }:`, err);
    });
  });
}

// Function to render the Pokémon name
function renderPokemonName ( ctx, pokemonName ) {
  // Add gradient to the text with harsher transitions
  const gradient = ctx.createLinearGradient (50, 0, 50, 200); // Adjust gradient dimensions as needed
  gradient.addColorStop (0, '#ffffff'); // Start color
  gradient.addColorStop (0.45, '#ffffff'); // Keep white until almost halfway
  gradient.addColorStop (0.55, '#919191'); // Sharp transition to gray
  gradient.addColorStop (0.65, '#bebebe'); // End color
  gradient.addColorStop (1, '#d7d7d7'); // End color
  ctx.fillStyle = gradient;

  // Add text to the image (name in the top-left corner)
  ctx.font = '85px CustomFont'; // Use CustomFont
  ctx.fillText (`${ pokemonName }`, 50, 130);

  // Add an outline to the text
  ctx.lineWidth = 3; // Outline thickness
  ctx.strokeStyle = '#383838'; // Outline color (black for contrast)
  ctx.strokeText (`${ pokemonName }`, 50, 130); // Adjusted position for top-left corner
}

// Function to render the Pokémon description within a box
function renderDescription ( ctx, description1, description2 ) {
  const boxX = 45; // X-coordinate of the box
  const boxY = 570; // Y-coordinate of the box
  const boxWidth = 450; // Width of the box
  const boxHeight = 220; // Height of the box
  const padding = 20; // Padding inside the box

  // Draw the box background with a light grey outline
  ctx.fillStyle = '#FFFFFF'; // White background
  ctx.fillRoundRect (boxX, boxY, boxWidth, boxHeight, 20);

  // Draw the light grey outline using custom function
  ctx.strokeStyle = '#D3D3D3'; // Light grey outline
  ctx.lineWidth = 12; // Outline width
  strokeRoundRect (ctx, boxX, boxY, boxWidth, boxHeight, 20); // Draw the outline

  // Set text properties
  let fontSize = 25; // Default font size
  let lineHeight = 30; // Default line height
  let font = 'FrontPageNeue';

  // Check if the text fits within the box and adjust font size
  let maxTextHeight = boxHeight - 2 * padding; // Max available height for text
  let testText = description1 + ' ' + description2;
  let linesCount = getLineCount (ctx, testText, font, fontSize, boxWidth - 2 * padding, lineHeight);

  while ( linesCount * lineHeight > maxTextHeight && fontSize > 10 ) {
    fontSize -= 1; // Reduce font size if text overflows
    lineHeight = fontSize * 1.2; // Adjust line height based on font size
    linesCount = getLineCount (ctx, testText, font, fontSize, boxWidth - 2 * padding, lineHeight);
  }

  ctx.fillStyle = '#000000'; // Black text
  ctx.font = `${ fontSize }px ${ font }`; // Set font with dynamic size
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Split the description into lines that fit within the box
  const words = testText.split (' ');
  let line = '';
  let y = boxY + padding;

  for ( let i = 0; i < words.length; i++ ) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText (testLine).width;

    if ( testWidth > boxWidth - 2 * padding && line !== '' ) {
      ctx.fillText (line, boxX + padding, y);
      line = words[i] + ' ';
      y += lineHeight;

      // Stop rendering if the text exceeds the box height
      if ( y + lineHeight > boxY + boxHeight - padding ) {
        ctx.fillText ('...', boxX + padding, y); // Add ellipsis if text is truncated
        break;
      }
    } else {
      line = testLine;
    }
  }

  // Render the last line
  if ( y + lineHeight <= boxY + boxHeight - padding ) {
    ctx.fillText (line, boxX + padding, y);
  }
}



function renderAbilities(ctx, abilityList) {
  // Filter out empty strings from the abilities list
  const filteredAbilities = abilityList.filter(ability => ability.trim() !== '');

  const boxX = 574; // X-coordinate of the first box
  const boxY = 170; // Starting Y-coordinate for the first box
  const boxWidth = 390; // Width of each box
  const boxHeight = 120; // Height of each box
  const padding = 10; // Padding inside each box
  const spacing = 30; // Spacing between boxes

  // Loop through the abilities and render a box for each
  filteredAbilities.forEach((ability, index) => {
    const currentBoxY = boxY + index * (boxHeight + spacing); // Calculate Y-coordinate for the current box

    // Draw the box background
    ctx.fillStyle = '#FFFFFF'; // White background
    ctx.fillRoundRect(boxX, currentBoxY, boxWidth, boxHeight, 20);

    // Draw the light grey outline
    ctx.strokeStyle = '#D3D3D3'; // Light grey outline
    ctx.lineWidth = 12; // Outline width
    strokeRoundRect(ctx, boxX, currentBoxY, boxWidth, boxHeight, 20);

    // Set text properties for the ability name
    ctx.fillStyle = '#000000'; // Black text
    ctx.font = 'bold 20px FrontPageNeue'; // Font size and family
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Align text vertically to the middle

    // Render the ability name at the center of the box
    const textX = boxX + boxWidth / 2; // Center X-coordinate
    const textY = currentBoxY + boxHeight / 2 - 30; // Center Y-coordinate, adjusted for padding
    ctx.fillText(`- ${ability} -`, textX, textY);

    // Render the ability description below the name
    const description =`${abilities[ability]}`; // Get the description for the ability
    const descriptionY = textY + 20; // Position below the name
    ctx.font = '20px FrontPageNeue'; // Font size and family
    renderTextBlock(ctx, description, boxX - padding+boxWidth/2, descriptionY, boxWidth - 0.5 * padding, 20);
  });
}

// Helper function to count the number of lines that the text will occupy
function getLineCount ( ctx, text, font, fontSize, maxWidth, lineHeight ) {
  ctx.font = `${ fontSize }px ${ font }`;
  const words = text.split (' ');
  let line = '';
  let lines = 1;

  for ( let i = 0; i < words.length; i++ ) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText (testLine).width;

    if ( testWidth > maxWidth ) {
      lines++;
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }

  return lines;
}


function renderMove(ctx, sigmove) {
  const boxX = 45; // X-coordinate of the box
  const boxY = 780; // Y-coordinate of the box
  const boxWidth = 450; // Width of the box
  const boxHeight = 145; // Height of the box
  const padding = 20; // Padding inside the box

  // Draw the box background
  ctx.fillStyle = '#FFFFFF'; // White background
  ctx.fillRoundRect(boxX, boxY, boxWidth, boxHeight, 20);

  // Draw the outline
  ctx.strokeStyle = '#D3D3D3'; // Light grey outline
  ctx.lineWidth = 12; // Outline width
  strokeRoundRect(ctx, boxX, boxY, boxWidth, boxHeight, 20);

  // Set text properties
  const font = 'FrontPageNeue';
  let fontSize = 25;
  let lineHeight = 30;
  const titleText = `Signature Move: ${sigmove}`;
  const infoText = `${moves[sigmove].type} Type, ${moves[sigmove].category}, PP: ${moves[sigmove].pp}${moves[sigmove].power ? `, BP: ${moves[sigmove].power}` : ''}`;
  const descriptionText = moves[sigmove].description;

  // Prepare full text for each section
  const fullTitleText = titleText;
  const fullInfoText = infoText;
  const fullDescriptionText = descriptionText;

  // Calculate the number of lines each section takes
  let maxTextHeight = boxHeight - 2 * padding;
  let titleLineCount = getLineCount(ctx, fullTitleText, font, fontSize, boxWidth - 2 * padding, lineHeight);
  let infoLineCount = getLineCount(ctx, fullInfoText, font, fontSize, boxWidth - 2 * padding, lineHeight);
  let descriptionLineCount = getLineCount(ctx, fullDescriptionText, font, fontSize, boxWidth - 2 * padding, lineHeight);

  // Check if the text fits inside the box
  while (
    titleLineCount * lineHeight + infoLineCount * lineHeight + descriptionLineCount * lineHeight > maxTextHeight &&
    fontSize > 10
    ) {
    fontSize -= 1; // Reduce font size if text overflows
    lineHeight = fontSize * 1.2;
    titleLineCount = getLineCount(ctx, fullTitleText, font, fontSize, boxWidth - 2 * padding, lineHeight);
    infoLineCount = getLineCount(ctx, fullInfoText, font, fontSize, boxWidth - 2 * padding, lineHeight);
    descriptionLineCount = getLineCount(ctx, fullDescriptionText, font, fontSize, boxWidth - 2 * padding, lineHeight);
  }

  // Render text
  ctx.fillStyle = '#000000'; // Black text
  ctx.font = `${fontSize}px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  let y = boxY + padding;

  // Render Title
  renderTextBlock(ctx, fullTitleText, boxX -20 + boxWidth/2, y, boxWidth, lineHeight);
  y += titleLineCount * lineHeight;

  // Render Info
  renderTextBlock(ctx, fullInfoText, boxX -20+ boxWidth/2, y, boxWidth, lineHeight);
  y += infoLineCount * lineHeight;

  // Render Description
  renderTextBlock(ctx, fullDescriptionText, boxX -20+ boxWidth/2, y, boxWidth, lineHeight);
}

function renderTextBlock(ctx, text, boxX, boxY, boxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let y = boxY;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > boxWidth - 2 * 20 && line !== '') {
      ctx.fillText(line, boxX + 20, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  // Render the last line
  if (line !== '') {
    ctx.fillText(line, boxX + 20, y);
  }
}





// Function to generate the shiny image
function generateShinyPokemonImage ( pokemon, outputDir ) {
  const canvas = createCanvas (1000, 1000);
  const ctx = canvas.getContext ('2d');

  // Generate the type background
  generateBackground (ctx, pokemon.type1, pokemon.type2);


  // Load and add the background image
  const bgPath = path.join (__dirname, 'Graphics', 'Second_Bg.png');
  loadImage (bgPath).then (( bgImage ) => {
    ctx.drawImage (bgImage, 0, 0, 1000, 1000); // Draw the background image to cover the entire canvas

    let pokemonName = pokemon.name;
    if ( pokemonName.includes ('_') ) {
      const [baseName, formName] = pokemonName.split ('_');
      pokemonName = `${ baseName } (${ formName })`;
    }

    // Load and add the type icons (top-right corner)
    const type1Path = path.join (__dirname, 'TypeIcons', `${ pokemon.type1 }.png`);
    const type2Path = pokemon.type2 ? path.join (__dirname, 'TypeIcons', `${ pokemon.type2 }.png`) : null;

    const typeIconPromises = [loadImage (type1Path)];
    if ( type2Path ) {
      typeIconPromises.push (loadImage (type2Path));
    }

    Promise.all (typeIconPromises).then (( [type1Image, type2Image] ) => {
      // Draw a white circle behind the type1 icon
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath ();
      ctx.arc (765, 70, 60, 0, Math.PI * 2); // Adjust position and radius as needed
      ctx.fill ();

      ctx.drawImage (type1Image, 715, 20, 100, 100); // Adjust the position and size as needed

      if ( type2Image ) {
        // Draw a white circle behind the type2 icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath ();
        ctx.arc (900, 70, 60, 0, Math.PI * 2);
        ctx.fill ();

        ctx.drawImage (type2Image, 850, 20, 100, 100);
      }

      // Render the Pokémon name after the type icons
      renderPokemonName (ctx, pokemonName);

      // Add text to the image after the background is loaded
      ctx.fillStyle = '#000000';
      ctx.font = '30px FrontPageNeue';



      // Function to draw stat bars
      function drawStatBar ( label, value, yPosition, maxStat ) {
        const barWidth = 230;
        const barHeight = 25;
        const filledWidth = (value / maxStat) * barWidth;

        // Assign unique colors to each stat
        const statColors = {
          HP: '#fd5858', // Red
          Atk: '#f3ab77', // Orange
          Def: '#f8de77', // Yellow
          'Sp.Atk': '#9cb6f3', // Green
          'Sp.Def': '#a6d98c', // Cyan
          Speed: '#f891b1', // Blue
          BST: '#c871f0' // Purple
        };

        // Draw the empty part of the bar
        ctx.fillStyle = '#D3D3D3'; // Light grey color
        ctx.fillRoundRect (670, yPosition - barHeight, barWidth, barHeight, 10);

        // Draw the filled part of the bar
        ctx.fillStyle = statColors[label]
        ctx.fillRoundRect (670, yPosition - barHeight, filledWidth, barHeight, 10);

        // Draw the label and value
        ctx.fillStyle = '#000000'; // Black color
        ctx.font = '27px FrontPageNeue,';
        ctx.textAlign = 'right';
        ctx.fillText (`${ label }`, 660, yPosition);
        ctx.font = '27px FrontPageNeue,';
        ctx.textAlign = 'left';
        ctx.fillText (`${ value }`, 910, yPosition);
      }

      // Draw the box background with a light grey outline
      ctx.fillStyle = '#FFFFFF'; // White background4
      ctx.fillRect(570, 450, 395, 480);

      renderAbilities(ctx,
        [pokemon.ability1, pokemon.ability2, pokemon.abilityh]
          .filter(ability => ability && ability !== 'undefined')
          .map(String)
      );

      // Draw stat bars
      drawStatBar ('HP', pokemon.hp, 660, 255);
      drawStatBar ('Atk', pokemon.atk, 700, 255);
      drawStatBar ('Def', pokemon.def, 740, 255);
      drawStatBar ('Sp.Atk', pokemon.spatk, 780, 255);
      drawStatBar ('Sp.Def', pokemon.spdef, 820, 255);
      drawStatBar ('Speed', pokemon.speed, 860, 255);

      // Calculate and draw BST bar
      const bst = parseInt (pokemon.hp) + parseInt (pokemon.atk) + parseInt (pokemon.def) + parseInt (pokemon.spatk) + parseInt (pokemon.spdef) + parseInt (pokemon.speed);
      drawStatBar ('BST', bst, 900, 700);

      // Add signature move if it exists
      if ( pokemon.sigmove ) {
        // Render the Pokémon description in the bottom-left box
        renderMove (ctx, pokemon.sigmove);
      }

      // Render the Pokémon description in the bottom-left box
      renderDescription (ctx, pokemon.description1, pokemon.description2);

      // Load and add the shiny Pokémon image
      const shinyImagePath = path.join (__dirname, 'Images', `${ pokemon.name }_shiny.png`);
      loadImage (shinyImagePath).then (( image ) => {
        ctx.drawImage (image, 50, 160, 400, 400); // Adjust the position and size as needed

        // Save the shiny image
        saveImage (canvas, outputDir, `${ pokemon.name }_shiny`);
      }).catch (( err ) => {
        console.error (`Error loading shiny image for ${ pokemon.name }:`, err);
      });
    }).catch (( err ) => {
      console.error (`Error loading type icons for ${ pokemon.name }:`, err);
    });
  }).catch (( err ) => {
    console.error (`Error loading background image for ${ pokemon.name }:`, err);
  });
}


// Step 3: Function to save the image
function saveImage ( canvas, outputDir, name ) {
  const buffer = canvas.toBuffer ('image/png');
  fs.writeFileSync (path.join (outputDir, `${ name }.png`), buffer);
}


