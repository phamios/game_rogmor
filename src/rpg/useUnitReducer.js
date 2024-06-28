import { useTroll, actionFactory, kebabToCamelCase } from "react-troll";
import profession, { profTypes } from "./profession";

export const [actionSet, action] = actionFactory(kebabToCamelCase);

export const
  LEVEL_UP = action('level-up'),
  TRY_MOVE = action('try-move'),
  ESCAPE = action('escape'),
  ATTACK = action('attack'),
  RIPOST = action('ripost'),
  CHANGE_FACE = action('change-face')
;

export const initial = (level = 1, prof = profTypes.child, uidFac = _ => '_child_', props) => ({
  ...profession(level, prof, uidFac),
  ...props
});

export const reducer = (state, {type, payload}) => {
  switch (type) {
    case LEVEL_UP: return {...state, ...profession(state.level + 1, state.type, _ => state.uid)};
    case CHANGE_FACE: return {...state, avatar: payload}
    default: return state;
  }
}

export const useUnitReducer = (level, type, uidGen, props) => useTroll(reducer, initial(level, type, uidGen, props), actionSet);


