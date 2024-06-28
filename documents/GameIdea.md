> First start was some old UI elements, 1 map, 100 character few items. I need to make a minimal mmorpg game. 

# Game Progress

> Guest enter: Maybe guest player can be try the game but dont able to save her hero unless signup.

### login type: `guess`, `user`



## Goals:
- Ease modular GUI system.
- Fast image load under PWA - preload phase no problem
- [slice 9 grid] (http://snapbuilder.com/code_snippet_generator/border_image_generator)
- [sprite sheet](https://www.codeandweb.com/free-sprite-sheet-packer)
- Somme pluginable game in game solution.

## role play game rules:

main abilities:
  - Body
  - Soul
  - Reaction
  - Presence

main properities:
  - Stamina
  - focus
  - Joyful

profession
  - level 
  - type
  - (option) combine multi profession

## játék menet

- Mennyi karaktert irányítson a játékos ?

5 karakter / autó csata

# Anomaly the interesting parameter of character

Az anomália mint érték bizonyos határig megfelelő profizmusoknál előny lehet, 
de hajlamosíthat a betegségekre, gyengíti az állóképességet és az akaraterőt,
szóval egyszerre buff és debuff. 


# leveling <http://howtomakeanrpg.com/a/how-to-make-an-rpg-levels.html>

```jsx 
ll = (range = 10, mod = 0.5, pow = 4, add) => {
const leveling = (level, mod, ppp, add = 2 * level) => Math.round(
  mod * (level**ppp) + add
);

return Array.from({length:range}, (_, level) => add 
   ?  leveling(level, mod, pow, add).toLocaleString() 
   :  leveling(level, mod, pow).toLocaleString()
).join('\n')

}
```
