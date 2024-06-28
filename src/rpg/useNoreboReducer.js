import { useTroll, actionFactory, kebabToCamelCase } from "react-troll";
import { strikeDamage, strikeFirst } from "../gui/battleSaga";
import profession from "./profession";
import { dice,  rnd, shuffle } from "./rpg";

export const [actionSet, action] = actionFactory(kebabToCamelCase);

export const
  ADD_UNIT = action('add-unit'),
  ADD_RANDOM = action('add-random'),
  REMOVE_UNIT = action('remove-unit'),
  ATTACK = action('attack'),
  RIPOST = action('ripost'),
  SELECT_HERO = action('select-hero'),
  NEXT_ROUND = action('next-round'),
  ADVENTURE = action('adventure')
;

export const initial = {
  units: [],
  hero: null,
  quest: null,
  story: [],
}

export const reducer = (state, {type, payload}) => {

  console.log(type, payload, state)
  switch (type) {
    case ADD_UNIT: return {...state, units: [...state.units, payload]};
    case ADD_RANDOM: {
      const random = {
        ...profession(dice(payload ? payload : dice(12))),
        avatar: rnd(100)
      }
      return {...state, units: [...state.units, random]}}
    ;
    case REMOVE_UNIT: return {...state, units: state.units.filter( ({uid}) => uid !== payload.uid)};
    case ATTACK: {
      const [atk, def] = payload || [];
      if (!atk || !def) return state;
      return state;
    };
    case ADVENTURE: {
      if (!state.hero) return state;
      const allEnemys = [...state.units].sort(shuffle) ;
      const enemys =  allEnemys.slice(-4);
      const [mob] = enemys;
      console.log(`--- mob:: ${mob.profession}`)
      return {...state, quest: {hero: state.hero, enemys, mob, actor: null }};
    };
    case NEXT_ROUND: return nextRoundReducer(state, payload);
    case SELECT_HERO: return {...state, hero:payload};

    default: return state;
  }
}

export const useNoreboReducer = () => useTroll(reducer, initial, actionSet);

export const nextRoundReducer = (state, payload) => {
  const result = (msg, actor, hero, mob) => ({...state, story: [...state.story, ...msg], quest: {...state.quest, actor, hero, mob}});
  console.log(state, payload)
  if (!state.quest) return state;
  const {hero, enemys, mob, actor} = state.quest;
  switch (true) {
    case actor === null: {
        const actor = strikeFirst()(hero, mob);
        console.log('faster :: ', actor)
        return result([`actor is: ${actor?.profession}`], actor, hero, mob)
      };
    case actor?.uid === hero?.uid: {
      const dmg = strikeDamage(hero);
      const def = {...mob, staminaState: Math.max(mob.staminaState - dmg, 0)};
      console.log('hero strike:', dmg, mob.staminaState - dmg);
      return dmg >= mob.staminaState
        ? ({
            ...state, 
            story: [...state.story, `hero strike: ${dmg}`, `${mob.profession} killed`], 
            quest: null,
          })
        : result([`hero strike: ${dmg}`], mob, hero, def)
    }
    case actor?.uid === mob?.uid: {
      const dmg = strikeDamage(mob);
      const def = {...hero, staminaState: Math.max(hero.staminaState - dmg, 0)};
      console.log('mob strike:', dmg, mob.staminaState - dmg);
      return dmg >= hero.staminaState
        // ? result([`mob strike: ${dmg}`, `hero killed`], null, def, mob)
        ? {...state, hero: null, story: [...state.story, `mob strike: ${dmg}`, `hero killed`], quest: null}
        : result([`mob strike: ${dmg}`], def, def, mob)
    }
    
  }
  return state;
}