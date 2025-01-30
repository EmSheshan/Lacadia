const abilities = {
  // Gen III
  "Air Lock": "Eliminates the effects of weather.",
  "Arena Trap": "Prevents non-Flying-type opposing Pokémon from fleeing.",
  "Battle Armor": "Protects the Pokémon from critical hits.",
  "Blaze": "Powers up Fire-type moves when the Pokémon's HP is low.",
  "Cacophony": "The Pokémon is immune to sound-based moves.",
  "Chlorophyll": "Boosts the Pokémon's Speed stat in harsh sunlight.",
  "Clear Body": "Prevents other Pokémon's moves or Abilities from lowering the Pokémon's stats.",
  "Cloud Nine": "Eliminates the effects of weather.",
  "Color Change": "The Pokémon's type becomes the type of the move used on it.",
  "Compound Eyes": "Boosts the Pokémon's Accuracy stat.",
  "Cute Charm": "Contact with the Pokémon may cause infatuation.",
  "Damp": "Prevents the use of Explosion and Self-Destruct.",
  "Drizzle": "Activates rain when the Pokémon enters battle.",
  "Drought": "Activates harsh sunlight when the Pokémon enters battle.",
  "Early Bird": "The Pokémon awakens twice as fast from sleep.",
  "Effect Spore": "Contact with the Pokémon may inflict poison, sleep, or paralysis on its attacker.",
  "Flame Body": "Contact with the Pokémon may inflict burn the attacker.",
  "Flash Fire": "Powers up the Pokémon's Fire-type moves if hit by a Fire-type move.",
  "Forecast": "The Pokémon transforms with the weather to change its type to Water, Fire, or Ice.",
  "Guts": "Boosts the Pokémon's Attack stat when it has a status condition.",
  "Huge Power": "Doubles the Pokémon's Attack stat.",
  "Hustle": "Boosts the Pokémon's Attack stat but lowers the Pokémon's Accuracy stat.",
  "Hyper Cutter": "The Pokémon's Attack stat cannot be lowered by other Pokémon.",
  "Illuminate": "Raises the likelihood of meeting wild Pokémon outside of battle.",
  "Immunity": "The Pokémon cannot be poisoned.",
  "Inner Focus": "The Pokémon cannot flinch.",
  "Insomnia": "The Pokémon cannot sleep.",
  "Intimidate": "When the Pokémon enters battle, it lowers opposing Pokémon's Attack stats.",
  "Keen Eye": "The Pokémon's Accuracy stat cannot be lowered by other Pokémon.",
  "Levitate": "The Pokémon is immune to Ground-type moves and Abilities.",
  "Lightning Rod": "The Pokémon draws in all Electric-type moves. Instead of receiving damage by Electric-type moves, it boosts the Pokémon's Sp. Atk.",
  "Limber": "The Pokémon cannot be paralyzed.",
  "Liquid Ooze": "HP draining moves used on the Pokémon damage instead of heal.",
  "Magma Armor": "The Pokémon cannot be frozen.",
  "Magnet Pull": "Prevents Steel-type opposing Pokémon from fleeing.",
  "Marvel Scale": "Boosts the Pokémon's Defense stat when it has a status condition.",
  "Minus": "Boosts the Pokémon's Sp. Atk if an ally with the Plus or Minus Ability is also in battle.",
  "Natural Cure": "The Pokémon loses any status condition after switching out.",
  "Oblivious": "The Pokémon cannot be infatuated or taunted.",
  "Overgrow": "Powers up Grass-type moves when the Pokémon's HP is low.",
  "Own Tempo": "The Pokémon cannot be confused.",
  "Pickup": "The Pokémon may pick up the item an opposing Pokémon used during a battle. The Pokémon may also pick up items outside of battle.",
  "Plus": "Boosts the Pokémon's Sp. Atk if an ally with the Plus or Minus Ability is also in battle.",
  "Poison Point": "Contact with the Pokémon may poison the attacker.",
  "Pressure": "Raises opposing Pokémon's PP usage.",
  "Pure Power": "Doubles the Pokémon's Attack stat.",
  "Rain Dish": "The Pokémon gradually regains HP in rain.",
  "Rock Head": "Protects the Pokémon from recoil damage.",
  "Rough Skin": "Contact with the Pokémon will damage the attacker.",
  "Run Away": "Enables a sure getaway from wild Pokémon.",
  "Sand Stream": "Activates sandstorm when the Pokémon enters battle.",
  "Sand Veil": "Boosts the Pokémon's Evasion stat in a sandstorm.",
  "Serene Grace": "Boosts the likelihood of additional effects occurring when attacking.",
  "Shadow Tag": "Prevents opposing Pokémon from fleeing.",
  "Shed Skin": "The Pokémon may heal its status condition.",
  "Shell Armor": "Protects the Pokémon from critical hits.",
  "Shield Dust": "Protects the Pokémon from additional effects.",
  "Soundproof": "The Pokémon is immune to sound-based moves.",
  "Speed Boost": "The Pokémon's Speed stat is boosted every turn.",
  "Static": "Contact with the Pokémon may paralyze the attacker.",
  "Stench": "Lowers the likelihood of meeting wild Pokémon outside of battle. The Pokémon may also cause a Pokémon to flinch after attacking it.",
  "Sticky Hold": "The Pokémon's item cannot be removed.",
  "Sturdy": "The Pokémon is immune to one-hit KO moves. The Pokémon cannot be knocked out with one hit while at full health either.",
  "Suction Cups": "The Pokémon cannot be forced to switch out or flee.",
  "Swarm": "Powers up Bug-type moves when the Pokémon's HP is low.",
  "Swift Swim": "Boosts the Pokémon's Speed stat in rain.",
  "Synchronize": "The attacker will receive the same status condition if it inflicts a burn, poison, or paralysis to the Pokémon.",
  "Thick Fat": "The Pokémon receives half damage from Fire and Ice-type moves.",
  "Torrent": "Powers up Water-type moves when the Pokémon's HP is low.",
  "Trace": "Copies an opposing Pokémon's Ability.",
  "Truant": "The Pokémon cannot use a move two turns in a row.",
  "Vital Spirit": "The Pokémon cannot sleep.",
  "Volt Absorb": "Restores the Pokémon's HP when hit by an Electric-type move, instead of taking damage.",
  "Water Absorb": "Restores the Pokémon's HP when hit by a Water-type move, instead of taking damage.",
  "Water Veil": "The Pokémon cannot be burned.",
  "White Smoke": "Prevents other Pokémon's moves or Abilities from lowering the Pokémon's stats.",
  "Wonder Guard": "The Pokémon is immune to damaging moves that are not super effective.",

  //Gen IV
  "Adaptability": "Powers up moves of the same type as the Pokémon.",
  "Aftermath": "Damages the attacker if it contacts the Pokémon with a finishing hit.",
  "Anger Point": "A critical hit maxes the Pokémon's Attack stat.",
  "Anticipation": "The Pokémon can sense an opposing Pokémon's super effective moves.",
  "Bad Dreams": "Damages sleeping opposing Pokémon.",
  "Download": "Boosts the Pokémon's Attack or Sp. Atk stat based on the opposing Pokémon's Defense and Sp. Def stats.",
  "Dry Skin": "Restores the Pokémon's HP in rain, or when hit by a Water-type move. Damages the Pokémon in harsh sunlight, and increases the damage received from Fire-type moves.",
  "Filter": "Reduces the damage taken from super effective moves.",
  "Flower Gift": "Boosts the Attack and Sp. Def stats of the Pokémon and its allies in harsh sunlight.",
  "Forewarn": "The Pokémon can tell one of the moves an opposing Pokémon has.",
  "Frisk": "The Pokémon knows opposing Pokémon's held items.",
  "Gluttony": "The Pokémon eats its held Berry at half HP or less.",
  "Heatproof": "The Pokémon receives half damage from Fire-type moves.",
  "Honey Gather": "The Pokémon may gather Honey after a battle.",
  "Hydration": "Heals the Pokémon's status condition in the rain.",
  "Ice Body": "Restores the Pokémon's HP in a hailstorm.",
  "Iron Fist": "Powers up the Pokémon's punching moves.",
  "Klutz": "The Pokémon cannot use any held items.",
  "Leaf Guard": "Prevents status conditions in sunny weather.",
  "Magic Guard": "The Pokémon only takes damage from attacks.",
  "Mold Breaker": "Moves can be used on the target regardless of its Abilities.",
  "Motor Drive": "Boosts its Speed stat if hit by an Electric-type, instead of taking damage.",
  "Multitype": "Changes the Pokémon's type to match the Plate or Z-Crystal it holds.",
  "No Guard": "The Pokémon employs no-guard tactics to ensure incoming and outgoing attacks always land.",
  "Normalize": "All the Pokémon's moves become Normal-type. The power of those moves is boosted a little.",
  "Poison Heal": "Restores HP if the Pokémon is poisoned, instead of losing HP.",
  "Quick Feet": "Boosts the Speed stat if the Pokémon has a status condition.",
  "Reckless": "Powers up moves that have recoil damage.",
  "Rivalry": "Becomes competitive and deals more damage to Pokémon of the same gender, but deals less to Pokémon of the opposite gender.",
  "Scrappy": "The Pokémon can hit Ghost-type Pokémon with Normal and Fighting-type moves.",
  "Simple": "The stat changes the Pokémon receives are doubled.",
  "Skill Link": "Increases the number of times multi-strike moves hit.",
  "Slow Start": "For five turns, the Pokémon's Attack and Speed stats are halved.",
  "Sniper": "Powers up moves if they become critical hits.",
  "Snow Cloak": "Boosts evasion in a hailstorm.",
  "Snow Warning": "The Pokémon summons a hailstorm when it enters a battle.",
  "Solar Power": "Boosts the Sp. Atk stat in sunny weather, but HP decreases every turn.",
  "Solid Rock": "Reduces the power of supereffective attacks taken.",
  "Stall": "The Pokémon moves after all other Pokémon do.",
  "Steadfast": "The Pokémon's determination boosts the Speed stat each time the Pokémon flinches.",
  "Storm Drain": "Draws in all Water-type moves. Instead of being hit by Water-type moves, it boosts its Sp. Atk.",
  "Super Luck": "The Pokémon is so lucky that the critical-hit ratios of its moves are boosted.",
  "Tangled Feet": "Raises evasion if the Pokémon is confused.",
  "Technician": "Powers up the Pokémon's weaker moves.",
  "Tinted Lens": "The Pokémon can use 'not very effective' moves to deal regular damage.",
  "Unaware": "When attacking, the Pokémon ignores the target Pokémon's stat changes.",
  "Unburden": "Boosts the Speed stat if the Pokémon's held item is used or lost.",

  // Gen V
  "Analytic": "Boosts move power when the Pokémon moves last.",
  "Big Pecks": "Protects the Pokémon from Defense-lowering effects.",
  "Contrary": "Makes stat changes have an opposite effect.",
  "Cursed Body": "May disable a move used on the Pokémon.",
  "Defeatist": "Halves the Pokémon's Attack and Sp. Atk stats when its HP becomes half or less.",
  "Defiant": "Boosts the Pokémon's Attack stat sharply when its stats are lowered.",
  "Flare Boost": "Powers up special attacks when the Pokémon is burned.",
  "Friend Guard": "Reduces damage done to allies.",
  "Harvest": "May create another Berry after one is used.",
  "Healer": "Sometimes heals an ally's status condition.",
  "Heavy Metal": "Doubles the Pokémon's weight.",
  "Illusion": "Comes out disguised as the Pokémon in the party's last spot.",
  "Imposter": "The Pokémon transforms itself into the Pokémon it's facing.",
  "Infiltrator": "Passes through the opposing Pokémon's barrier, substitute, and the like and strikes.",
  "Iron Barbs": "Inflicts damage to the attacker on contact with iron barbs.",
  "Justified": "Being hit by a Dark-type move boosts the Attack stat of the Pokémon, for justice.",
  "Light Metal": "Halves the Pokémon's weight.",
  "Magic Bounce": "Reflects status moves, instead of getting hit by them.",
  "Moody": "Raises one stat sharply and lowers another every turn.",
  "Moxie": "The Pokémon shows moxie, and that boosts the Attack stat after knocking out any Pokémon.",
  "Multiscale": "Reduces the amount of damage the Pokémon takes when its HP is full.",
  "Mummy": "Contact with the Pokémon changes the attacker's Ability to Mummy.",
  "Overcoat": "Protects the Pokémon from things like sand, hail, and powder.",
  "Pickpocket": "Steals an item from an attacker that made direct contact.",
  "Poison Touch": "May poison a target when the Pokémon makes contact.",
  "Prankster": "Gives priority to a status move.",
  "Rattled": "Dark, Ghost, and Bug-type moves scare the Pokémon and boost its Speed stat.",
  "Regenerator": "Restores a little HP when withdrawn from battle.",
  "Sand Force": "Boosts the power of Rock, Ground, and Steel-type moves in a sandstorm.",
  "Sand Rush": "Boosts the Pokémon's Speed stat in a sandstorm.",
  "Sap Sipper": "Boosts the Attack stat if hit by a Grass-type move, instead of taking damage.",
  "Sheer Force": "Removes additional effects to increase the power of moves when attacking.",
  "Telepathy": "Anticipates an ally's attack and dodges it.",
  "Teravolt": "Moves can be used on the target regardless of its Abilities.",
  "Toxic Boost": "Powers up physical attacks when the Pokémon is poisoned.",
  "Turboblaze": "Moves can be used on the target regardless of its Abilities.",
  "Unnerve": "Opponents cannot eat Berries.",
  "Victory Star": "Boosts the accuracy of the Pokémon and its allies.",
  "Weak Armor": "Physical attacks lower the Pokémon's Defense stat but raises its Speed stat.",
  "Wonder Skin": "Makes status moves more likely to miss.",
  "Zen Mode": "The Pokémon changes form when its HP is half or less.",

  // Gen VI
  "Aerilate": "Normal-type moves become Flying-type moves. The power of those moves is boosted a little.",
  "Aroma Veil": "Protects the Pokémon and its allies from attacks that limit their move choices.",
  "Aura Break": "Reverses the effects of Dark Aura and Fairy Aura.",
  "Bulletproof": "Protects the Pokémon from ball and bomb moves.",
  "Cheek Pouch": "Restores HP as well when the Pokémon eats a Berry.",
  "Competitive": "Boosts the Pokémon's Sp. Atk stat when a stat is lowered.",
  "Dark Aura": "Powers up every Pokémon's Dark-type moves.",
  "Delta Stream": "The Pokémon starts a mysterious air current when it enters battle.",
  "Desolate Land": "The Pokémon starts Extremely Harsh Sunlight when it enters battle.",
  "Fairy Aura": "Powers up every Pokémon's Fairy-type moves.",
  "Flower Veil": "Ally Grass-type Pokémon are protected from status conditions and the lowering of their stats.",
  "Fur Coat": "Halves the damage from physical moves.",
  "Gale Wings": "Gives priority to Flying-type moves when the Pokémon's HP is full.",
  "Gooey": "Contact with the Pokémon lowers the attacker's Speed stat.",
  "Grass Pelt": "Boosts the Pokémon's Defense stat in Grassy Terrain.",
  "Magician": "The Pokémon steals the held item of a Pokémon it hits with a move.",
  "Mega Launcher": "Powers up aura and pulse moves.",
  "Parental Bond": "The Pokémon attacks twice.",
  "Pixilate": "Normal-type moves become Fairy-type moves. The power of those moves is boosted a little.",
  "Primordial Sea": "The Pokémon starts Heavy Rain when it enters battle.",
  "Protean": "Changes the Pokémon's type to the type of the move it's about to use.",
  "Refrigerate": "Normal-type moves become Ice-type moves. The power of those moves is boosted a little.",
  "Stance Change": "The Pokémon changes its form to Blade Form when it uses an attack move, and changes to Shield Form when it uses King's Shield.",
  "Strong Jaw": "Boosts the power of The Pokémon's biting moves.",
  "Sweet Veil": "Prevents itself and ally Pokémon from falling asleep.",
  "Symbiosis": "The Pokémon passes its item to an ally that has used up an item.",
  "Tough Claws": "Powers up moves that make direct contact.",

  // Gen VII
  "Battery": "Powers up ally Pokémon's special moves.",
  "Battle Bond": "Defeating an opposing Pokémon strengthens the Pokémon's bond with its Trainer, and it becomes Ash-Greninja. Water Shuriken gets more powerful.",
  "Beast Boost": "The Pokémon boosts its most proficient stat each time it knocks out a Pokémon.",
  "Berserk": "Boosts the Pokémon's Sp. Atk stat when it takes a hit that causes its HP to become half or less.",
  "Comatose": "It's always drowsing and will never wake up. It can attack without waking up.",
  "Corrosion": "The Pokémon can poison the target even if it's a Steel or Poison-type.",
  "Dancer": "When another Pokémon uses a dance move, it can use a dance move following it regardless of its Speed.",
  "Dazzling": "Surprises the opposing Pokémon, making it unable to attack using priority moves.",
  "Disguise": "Once per battle, the shroud that covers the Pokémon can protect it from an attack.",
  "Electric Surge": "Turns the ground into Electric Terrain when the Pokémon enters a battle.",
  "Emergency Exit": "The Pokémon, sensing danger, switches out when its HP becomes half or less.",
  "Fluffy": "Halves the damage taken from moves that make direct contact, but doubles that of Fire-type moves.",
  "Full Metal Body": "Prevents other Pokémon's moves or Abilities from lowering the Pokémon's stats.",
  "Galvanize": "Normal-type moves become Electric-type moves. The power of those moves is boosted a little.",
  "Grassy Surge": "Turns the ground into Grassy Terrain when the Pokémon enters a battle.",
  "Innards Out": "Damages the attacker landing the finishing hit by the amount equal to its last HP.",
  "Liquid Voice": "All sound-based moves become Water-type moves.",
  "Long Reach": "The Pokémon uses its moves without making contact with the target.",
  "Merciless": "The Pokémon's attacks become critical hits if the target is poisoned.",
  "Misty Surge": "Turns the ground into Misty Terrain when the Pokémon enters a battle.",
  "Neuroforce": "Powers up moves that are super effective.",
  "Power Construct": "Other Cells gather to aid when its HP becomes half or less. Then the Pokémon changes its form to Complete Form.",
  "Power of Alchemy": "The Pokémon copies the Ability of a defeated ally.",
  "Prism Armor": "Reduces the power of supereffective attacks taken.",
  "Psychic Surge": "Turns the ground into Psychic Terrain when the Pokémon enters a battle.",
  "Queenly Majesty": "Its majesty pressures the opposing Pokémon, making it unable to attack using priority moves.",
  "Receiver": "The Pokémon copies the Ability of a defeated ally.",
  "RKS System": "Changes the Pokémon's type to match the memory disc it holds.",
  "Schooling": "When it has a lot of HP, the Pokémon forms a powerful school. It stops schooling when its HP is low.",
  "Shadow Shield": "Reduces the amount of damage the Pokémon takes while its HP is full.",
  "Shields Down": "When its HP becomes half or less, the Pokémon's shell breaks and it becomes aggressive.",
  "Slush Rush": "Boosts the Pokémon's Speed stat in a hailstorm.",
  "Soul-Heart": "Boosts its Sp. Atk stat every time a Pokémon faints.",
  "Stakeout": "Doubles the damage dealt to the target's replacement if the target switches out.",
  "Stamina": "Boosts the Defense stat when hit by an attack.",
  "Steelworker": "Powers up Steel-type moves.",
  "Surge Surfer": "Doubles the Pokémon's Speed stat on Electric Terrain.",
  "Tangling Hair": "Contact with the Pokémon lowers the attacker's Speed stat.",
  "Triage": "Gives priority to a healing move.",
  "Water Bubble": "Lowers the power of Fire-type moves done to the Pokémon and prevents the Pokémon from getting a burn.",
  "Water Compaction": "Boosts the Pokémon's Defense stat sharply when hit by a Water-type move.",
  "Wimp Out": "The Pokémon cowardly switches out when its HP becomes half or less.",

  // Gen VIII
  "As One (Calyrex and Glastrier)": "This Ability combines the effects of both Calyrex's Unnerve Ability and Glastrier's Chilling Neigh Ability.",
  "As One (Calyrex and Spectrier)": "This Ability combines the effects of both Calyrex's Unnerve Ability and Spectrier's Grim Neigh Ability.",
  "Ball Fetch": "If the Pokémon is not holding an item, it will fetch the Poké Ball from the first failed throw of the battle.",
  "Chilling Neigh": "When the Pokémon knocks out a target, it utters a chilling neigh, which boosts its Attack stat.",
  "Cotton Down": "When the Pokémon is hit by an attack, it scatters cotton fluff around and lowers the Speed stat of all Pokémon except itself.",
  "Curious Medicine": "When the Pokémon enters a battle, it scatters medicine from its shell, which removes all stat changes from allies.",
  "Dauntless Shield": "Boosts the Pokémon's Defense stat when the Pokémon enters a battle.",
  "Dragon's Maw": "Powers up Dragon-type moves.",
  "Gorilla Tactics": "Boosts the Pokémon's Attack stat but only allows the use of the first selected move.",
  "Grim Neigh": "When the Pokémon knocks out a target, it utters a terrifying neigh, which boosts its Sp. Atk stat.",
  "Gulp Missile": "When the Pokémon uses Surf or Dive, it will come back with prey. When it takes damage, it will spit out the prey to attack.",
  "Hunger Switch": "The Pokémon changes its form, alternating between its Full Belly Mode and Hangry Mode after the end of each turn.",
  "Ice Face": "The Pokémon's ice head can take a physical attack as a substitute, but the attack also changes the Pokémon's appearance. The ice will be restored when it hails.",
  "Ice Scales": "The Pokémon is protected by ice scales, which halve the damage taken from special moves.",
  "Intrepid Sword": "Boosts the Pokémon's Attack stat when the Pokémon enters a battle.",
  "Libero": "Changes the Pokémon's type to the type of the move it's about to use.",
  "Mimicry": "Changes the Pokémon's type depending on the terrain.",
  "Mirror Armor": "Bounces back only the stat-lowering effects that the Pokémon receives.",
  "Neutralizing Gas": "If the Pokémon with Neutralizing Gas is in the battle, the effects of all Pokémon's Abilities will be nullified or will not be triggered.",
  "Pastel Veil": "Protects the Pokémon and its ally Pokémon from being poisoned.",
  "Perish Body": "When hit by a move that makes direct contact, the Pokémon and the attacker will faint after three turns unless they switch out of battle.",
  "Power Spot": "Just being next to the Pokémon powers up moves.",
  "Propeller Tail": "Ignores the effects of opposing Pokémon's Abilities and moves that draw in moves.",
  "Punk Rock": "Boosts the power of sound-based moves. The Pokémon also takes half the damage from these kinds of moves.",
  "Quick Draw": "Enables the Pokémon to move first occasionally.",
  "Ripen": "Ripens Berries and doubles their effect.",
  "Sand Spit": "The Pokémon creates a sandstorm when it's hit by an attack.",
  "Screen Cleaner": "When the Pokémon enters a battle, the effects of Light Screen, Reflect, and Aurora Veil are nullified for both opposing and ally Pokémon.",
  "Stalwart": "Ignores the effects of opposing Pokémon's Abilities and moves that draw in moves.",
  "Steam Engine": "Boosts the Pokémon's Speed stat drastically if hit by a Fire- or Water-type move.",
  "Steely Spirit": "Powers up ally Pokémon's Steel-type moves.",
  "Transistor": "Powers up Electric-type moves.",
  "Unseen Fist": "If the Pokémon uses moves that make direct contact, it can attack the target even if the target protects itself.",
  "Wandering Spirit": "The Pokémon exchanges Abilities with a Pokémon that hits it with a move that makes direct contact.",

  // Gen IX
  "Lingering Aroma": "Pokemon making contact with this Pokemon will have their ability changed to Lingering Aroma.",
  "Well-Baked Body": "This Pokemon takes no damage from Fire-type moves. Instead, its defense sharply increases.",
  "Seed Sower": "Turns the ground into Grassy Terrain when hit by an attack.",
  "Purifying Salt": "This Pokemon's salt protects it from status conditions and halves the effect of Ghost-type moves.",
  "Electromorphosis": "After being hit by an attack, the power of its next Electric-type move is increased.",
  "Wind Power": "This Pokemon becomes charged after being hit by a wind move, boosting the power of the next Electric-type move the Pokemon uses. Also affected by Tailwind.",
  "Guard Dog": "Prevents the Pokemon from being forcefully swapped by enemy moves and items. The user can still swap out as normal from their own moves. If intimidated, increase attack by one stage instead.",
  "Wind Rider": "Boosts this Pokemon's attack when Tailwind takes effect or when hit by a wind move. This Pokemon takes no damage from wind moves.",
  "Mycelium Might": "The Pokemon will always act more slowly when using status moves, but these moves will be unimpeded by the ability of the target.",
  "Anger Shell": "When the user's HP drops to 50% or lower, its defense and special defense drop by one stage, but the user's attack, special attack and speed increase by one stage.",
  "Opportunist": "If an opponent's stats are boosted, the Pokemon seizes the opportunity to boost the same stat for itself.",
  "Rocky Payload": "Powers up Rock-type moves.",
  "Zero to Hero": "This Pokemon switches to Hero Forme when it switches out.",
  "Earth Eater": "If hit by a Ground-type move, the Pokemon heals instead of taking damage.",
  "Toxic Debris": "The Pokemon scatters poison spikes at the feet of the opposing team when the Pokemon takes damage from physical moves.",
  "Costar": "When this Pokemon switches in, it copies ally stat changes for itself.",
  "Sharpness": "Boosts the effect of this Pokemon's cutting moves.",
  "Commander": "When the Pokemon enters a battle, it goes inside the mouth of an ally Dondozo and issues commands from there.",
  "Armor Tail": "Prevents opposing Pokemon from using priority moves against the target.",
  "Cud Chew": "After using a berry, it will use it again to the same effect at the end of the trainer's turn.",
  "Supreme Overlord": "This Pokemon receives a 10% additive increase to the power of their moves for each ally Pokemon that is fainted in their party.",
  "Protosynthesis": "If the Pokemon is holding Booster Energy or the current weather is Harsh Sunlight, the Pokemon will boost their most proficient stat by one stage.",
  "Quark Drive": "If the Pokemon is holding Booster Energy or Electric Terrain is active, the Pokemon will boost their most proficient stat by one stage.",
  "Thermal Exchange": "Boosts the attack stat when the Pokemon is hit by a Fire-type move. This Pokemon also cannot be burned.",
  "Good as Gold": "A body of pure, solid gold gives the Pokemon full immunity to other Pokemon's status moves.",
  "Tablets of Ruin": "This Pokemon lowers the attack of all Pokemon except Wo-Chien.",
  "Sword of Ruin": "This Pokemon lowers the defense of all Pokemon except Chien-Pao.",
  "Vessel of Ruin": "This Pokemon lowers the special attack of all Pokemon except Ting-Lu.",
  "Beads of Ruin": "This Pokemon lowers the special defense of all Pokemon except Chi-Yu.",
  "Orichalcum Pulse": "Turns the sunlight harsh when the Pokemon enters the battle. The ancient pulse thrumming through the Pokemon also boosts its attack in Harsh Sunlight.",
  "Hadron Engine": "Turns the ground into Electric Terrain when the Pokemon enters the battle. The futuristic engine within the Pokemon also boosts its special attack on Electric Terrain.",
  "Embody Aspect": "The Pokémon's heart fills with memories, causing the (corresponding mask) to shine and the Pokémon's Speed/Defense/Attack/Special Defense stat to be boosted.",
  "Toxic Chain": "All of this Pokemon's moves have a 30% chance to badly poison the target.",
  "Hospitality": "Upon a switch, this Pokemon heals a small amount of its ally's HP.",
  "Supersweet Syrup": "This Pokemon lowers its opponent's evasiveness upon switch-in.",
  "Mind's Eye": "This Pokémon is immune to accuracy drops, opponent's evasiveness boosts, and can hit Ghost-types with Normal- and Fighting-type moves.",
  "Poison Puppeteer": "This Pokémon confuses any Pokémon it poisons.",

  // Lacadia
  "Parasitoid": "This Pokemon heals 25% of the damage dealt with direct attacks.",
  "Ancient Guard": "Rock-type moves are not very effective against this Pokemon. This Pokemon is also immune to Stealth Rock.",
  "Pollyanna": "Raises this Pokémon's HP when hit by a Dark-type move, instead of taking damage.",
  "Overload": "This Pokemon skips charge and recharge turns for moves.",
  "Stoicism": "This Pokemon is immune to attack drops, burns, and flinches.",
  "Lockdown": "This Pokemon is immune to pivot moves and blocks switch effects.",
  "Withering": "Prevents all Pokemon from restoring health.",
  "Verdant Hunger": "The power of draining moves and Leech Seed is doubled.",
  "Noble Bearing": "Boosts defense, special defense, and speed when this Pokemon successfully inflicts a status condition.",
  "Ruthless": "This Pokemon's attacks always result in critical hits when the opponent has lowered stats."
};

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

// Load Pokémon data for the card page
loadPokemonDataForCardPage ();