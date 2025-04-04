const Category = Object.freeze({
  STATUS: "Status",
  PHYSICAL: "Physical",
  SPECIAL: "Special"
});

const Type = Object.freeze({
  NORMAL: "Normal",
  FIRE: "Fire",
  WATER: "Water",
  GRASS: "Grass",
  ELECTRIC: "Electric",
  ICE: "Ice",
  FIGHTING: "Fighting",
  POISON: "Poison",
  GROUND: "Ground",
  FLYING: "Flying",
  PSYCHIC: "Psychic",
  BUG: "Bug",
  ROCK: "Rock",
  GHOST: "Ghost",
  DRAGON: "Dragon",
  DARK: "Dark",
  STEEL: "Steel",
  FAIRY: "Fairy"
});


export const moves = {
  "Ice Splinters": {
    type: Type.ICE,
    category: Category.STATUS,
    pp: 20,
    description: "The user lays a trap of levitating icicles around the opposing team. The trap damages opposing Pokémon that switch into battle.",
  },
  "Bean Barrage": {
    type: Type.GRASS,
    category: Category.SPECIAL,
    accuracy: 100,
    power: 70,
    pp: 10,
    description: "The user attacks with a barrage of seeds that begin to sprout and steal some HP from the target every turn.",
  },
  "Bushido Flurry": {
    type: Type.STEEL,
    category: Category.PHYSICAL,
    accuracy: 100,
    power: 15,
    pp: 10,
    description: "The user attacks flurry of sharp slashes. This attack hits five times in a row and every hit is always critical.",
  },
  "Zest Spray": {
    type: Type.GRASS,
    category: Category.SPECIAL,
    accuracy: 100,
    power: 85,
    pp: 10,
    description: "The user attacks with a spray of acidic berry juice. If the user is holding a berry, the berry is consumed and the base power of this attack doubles.",
  },
  "Crushing Cleave": {
    type: Type.GROUND,
    category: Category.PHYSICAL,
    accuracy: 100,
    power: 35,
    pp: 10,
    description: "The user attacks twice with two axes. The first hit lowers the target's Defense stat, and the second hit lowers the target's Sp. Def stat.",
  },
  "Venom Spear": {
    type: Type.POISON,
    category: Category.PHYSICAL,
    accuracy: 100,
    power: 60,
    pp: 10,
    description: "The user attacks with a venomous stinger that leaves the target badly poisoned. Its poison damage worsens every turn.",
  },
  "Final Act": {
    type: Type.NORMAL,
    category: Category.STATUS,
    accuracy: 100,
    pp: 20,
    description: "The user compels the target to keep using the move it encored for three turns. Then it switches places with a party Pokémon in waiting.",
  },
  "Agave Shot": {
    type: Type.GRASS,
    category: Category.SPECIAL,
    accuracy: 100,
    power: 75,
    pp: 10,
    description: "The user shoots hot agave nectar at the target. This move sharply boosts the user's Attack stat but lowers its accuracy.",
  },
  "Freezing Tempo": {
    type: Type.ICE,
    category: Category.STATUS,
    pp: 10,
    description: "The user takes time to charge and concentrate its power. This raises its Attack and Speed stats and ensures the user's next moves do not miss against the current opponent.",
  },
  "Icy Harpoon": {
    type: Type.ICE,
    category: Category.PHYSICAL,
    accuracy: 100,
    power: 90,
    pp: 10,
    description: "The user launches sharpened icicle at the target. It may also badly poison the target.",
  },
  "Ego Crush": {
    type: Type.PSYCHIC,
    category: Category.SPECIAL,
    accuracy: 100,
    power: 80,
    pp: 15,
    description: "The user uses its psychic powers to directly attack the opponent's mind. This move is super effective on Psychic types.",
  },
  "Power Scale": {
    type: Type.NORMAL,
    category: Category.PHYSICAL,
    accuracy: 90,
    power: 140,
    pp: 5,
    description: "The user attacks the target by charging into the opponent to cut it with it scales. The user's secondary type determines the type of this move. This also damages the user terribly.",
  },
  "Snack Break": {
    type: Type.FAIRY,
    category: Category.STATUS,
    pp: 20,
    description: "The user takes a break from battle to enjoy some berries. This switches out the user and heals the Pokemon that switched in for a quarter of their max HP.",
  }
};