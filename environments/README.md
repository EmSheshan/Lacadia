# Environment backgrounds

Drop a photo of a Pokemon's habitat here and `scripts/build-carousel.mjs` uses
it, blurred, as the card background, with a soft glow outline around the art.
Pokemon without a photo get the type-tinted gradient instead.

- **One Pokemon:** name the file after its pokedex key, e.g. `stratoclysm.jpg`.
- **Shared habitat:** put e.g. `forest.jpg` here and map keys to it in
  `map.json`: `{ "larvos": "forest.jpg", "syrinsect": "forest.jpg" }`

Any size works. It is cover-cropped to 4:5 and blurred heavily, so a phone
photo is plenty. Use photos you took yourself or have the rights to.

Then: `node scripts/build-carousel.mjs <key>` and check `socialCarousel/`.
