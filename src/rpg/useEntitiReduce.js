import { useTroll, actionFactory, kebabToCamelCase } from "react-troll";
import profession, { profTypes } from "./profession";

const [actionSet, action] = actionFactory(kebabToCamelCase);

export const
  LEVEL_UP = action('level-up')
;

const initial = (level = 1, prof = profTypes.child, uidFac = _ => '_entitiy_') => profession(level, prof, uidFac);

const reducer = (state, {type, payload}) => {
  switch (type) {
    case LEVEL_UP: return {...state, ...profession(state.level + 1, state.type, _ => state.uid)};
    default: return state;
  }
}

export const useEntitiReducer = (level, type, uidGen) => useTroll(reducer, initial(level, type, uidGen), actionSet);