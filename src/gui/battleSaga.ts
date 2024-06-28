import { Mob } from "../rpg/profession";
import { improved } from "../rpg/rpg";

export enum InteractionKind {
  STRIKE, SKILL, TALK
}
export interface DamageResult {
  dmg: number;
  striker: any;
  target: any;
  kind: InteractionKind;
}

// too much decision in a single function
export const physicalStrike = (a:Mob, b:Mob, round:number) => {
  const astart = improved(a.ability.reflex) 
  const bstart = improved(b.ability.reflex)
  const [atk, def] = astart > bstart ? [a, b] : [b, a];
  let [striker, target] = round % 2 ? [atk, def] : [def, atk];
  let dmg = improved(striker.ability.body / 2);
  target.condition.staminaState -= Math.min(dmg, target.condition.staminaState);
  return [a, b, {dmg, striker, target, kind: InteractionKind.STRIKE }];
}

export const soulSkill = (a:Mob, b:Mob, round:number) => {
  const astart = improved(a.ability.soul + a.ability.reflex) 
  const bstart = improved(b.ability.soul + b.ability.reflex)
  const [atk, def] = astart > bstart ? [a, b] : [b, a];
  let [striker, target] = round % 2 ? [atk, def] : [def, atk];
  let dmg = improved(striker.ability.soul / 2);
  target.condition.focusState -= Math.min(dmg, target.condition.focusState);
  return [a, b, {dmg, striker, target, kind: InteractionKind.SKILL}];
}

export const socialTalk = (a:Mob, b:Mob, round:number) => {
  const astart = improved(a.ability.aura + a.ability.reflex) 
  const bstart = improved(b.ability.aura + b.ability.reflex)
  const [atk, def] = astart > bstart ? [a, b] : [b, a];
  let [striker, target] = round % 2 ? [atk, def] : [def, atk];
  let dmg = improved(striker.ability.aura / 2);
  target.condition.moraleState -= Math.min(dmg, target.condition.moraleState);
  return [a, b, {dmg, striker, target, kind: InteractionKind.TALK}];
}

export const strikeDamage = ({ability}, imp = improved) => imp(ability.body / 2);
export const mentalDamage = ({ability}, imp = improved) => imp(ability.soul / 2);
export const persuasion   = ({aura}, imp = improved) => imp(aura / 2);
export const strikeOrder = (imp = improved) => (...entities) => entities
  .map(entiti => [entiti, imp(entiti.ability.reflex + (entiti.condition.staminaState / 10))])
  .sort(([a, aQuick],[b, bQuick]) => aQuick > bQuick ? 1 : -1 );
export const strikeFirst = (imp = improved) => (a:Mob, b:Mob) => 
  imp(a.ability.reflex + (a.condition.staminaState / 10)) > imp(b.ability.reflex + (b.condition.staminaState / 10))
  ? a
  : b;