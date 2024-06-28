import { Condition, Mob, Team, ProfessionKey } from "./profession";
import { improved, pickOne, selectRandomPick } from "./rpg";


export const actionOrder = (mobList) => mobList
  .filter(isCapableToAction)
  .map(mob => [mob, 
    improved(
      (
        mob.ability.reflex 
      + (mob.condition.staminaState / 10)
      + (mob.condition.focusState / 10)
      ) / mob.level
    )])
  .sort(([a, aSpeed],[b, bSpeed]) => aSpeed > bSpeed ? -1 : 1 )
;

export enum Target {
  RANDOM_ENEMY,
  SELECTED_ENEMY,
  ALL_ENEMY,
  RANDOM_ALLY,
  SELECTED_ALLY,
  ALL_ALLY,
  SELF,
}

export enum HitType {
  BODY = 1, 
  SOUL = 2, 
  AURA = 4,
  REFLEX = 8,
}

export interface SlashObject {
  fill: number;
  select: Target;
  doit: Doit;
  type: HitType;
  mul: number;
  score: number;
  extra: string;
  _ERROR_: string;
}

export type SlashParser = (source:string) => Partial<SlashObject>;

export type SlashImprovedParser = (source:string) => Partial<SlashObject>[];

const slashCustomParse:SlashParser = command => {
  const baseCommand = command.split('-[')[0];
  const numeric = command.match(/-\[([\d|\.]+)\]/)?.[1];
  const words = command.match(/-\[([\d|a-z|A-Z|\.]+)\]/)?.[1];
  if (numeric) {
    switch (baseCommand) {
      case 'power': return {mul: + numeric};
      case 'weak': return {mul: + numeric};
    }
  } 
  else 
  if (words) {
    switch (baseCommand) {
      case 'extra': return {extra: words};
    }
  }
  return {_ERROR_:command};
}

export const slashImprovedParser:SlashImprovedParser = slashSource => slashSource
  .split(';')
  .map(source => slashParse(source))
;

export const slashParse:SlashParser = slashSource => slashSource
  .split(' ')
  .map(command => {
    switch (command) {
      case 'instant': case 'i': return {fill:0};
      case 'fill-1': case 'f-1': return {fill:1};
      case 'fill-2': case 'f-2': return {fill:2};
      case 'fill-3': case 'f-3': return {fill:3};
      case 'fill-4': case 'f-4': return {fill:4};
      case 'fill-5': case 'f-5': return {fill:5};
      case 'fill-6': case 'f-6': return {fill:6};
      case 'target': case 'tse': return {select: Target.SELF};
      case 'target-self': case 'tsf': return {select: Target.SELECTED_ENEMY};
      case 'target-all': case 'tae': return {select: Target.ALL_ENEMY};
      case 'target-rnd': case 'tre': return {select: Target.RANDOM_ENEMY};
      case 'target-rnd-ally': case 'tra': return {select: Target.RANDOM_ALLY};
      case 'target-ally': case 'tsa': return {select: Target.SELECTED_ALLY};
      case 'target-all-ally': case 'taa': return {select: Target.ALL_ALLY};
      case 'hit-body': case 'hb': return {doit:Doit.HIT, type: HitType.BODY, mul: 1};
      case 'hit-soul': case 'hs': return {doit:Doit.HIT, type: HitType.SOUL, mul: 1};
      case 'hit-aura': case 'hp': return {doit:Doit.HIT, type: HitType.AURA, mul: 1};
      case 'hit-combat': case 'hc': return {doit:Doit.DRAIN, type: HitType.BODY | HitType.SOUL, mul: 1};
      case 'drain-body': case 'hb': return {doit:Doit.DRAIN, type: HitType.BODY, mul: 1};
      case 'drain-soul': case 'hs': return {doit:Doit.DRAIN, type: HitType.SOUL, mul: 1};
      case 'drain-aura': case 'hp': return {doit:Doit.DRAIN, type: HitType.AURA, mul: 1};
      case 'drain-combat': case 'hc': return {doit:Doit.HIT, type: HitType.BODY | HitType.SOUL, mul: 1};
      case 'power': case 'power-1': case 'p-1': return {mul: 1};
      case 'power-2': case 'p-2': return {mul: 2};
      case 'power-3': case 'p-3': return {mul: 3};
      case 'power-4': case 'p-4': return {mul: 4};
      case 'weak': case 'w': return {mul: .9};
      case 'weak-1': case 'w-1': return {mul: .8};
      case 'weak-2': case 'w-2': return {mul: .7};
      case 'weak-3': case 'w-3': return {mul: .6};
      case 'weak-4': case 'w-4': return {mul: .5};
      case 'heal': case 'heal-1': return {doit:Doit.HEAL, mul: 1, type: HitType.BODY};
      case 'heal-2': return {doit:Doit.HEAL, mul: 2, type: HitType.BODY};
      case 'heal-3': return {doit:Doit.HEAL, mul: 3, type: HitType.BODY};
      case 'heal-4': return {doit:Doit.HEAL, mul: 4, type: HitType.BODY};
      case 'stun': return {doit: Doit.STUN , mul:1};
      case 'stun-2': return {doit: Doit.STUN , mul:2};
      case 'stun-3': return {doit: Doit.STUN , mul:3};
      case 'stun-4': return {doit: Doit.STUN , mul:4};
      case 'bribe': case 'bribe-1': return {doit:Doit.BRIBE, mul: 1};
      case 'bribe-2': return {doit:Doit.BRIBE, mul: 2};
      case 'bribe-3': return {doit:Doit.BRIBE, mul: 3};
      case 'bribe-4': return {doit:Doit.BRIBE, mul: 4};
      case 'bless-body': return {doit:Doit.BLESS, mul:1, type: HitType.BODY};
      case 'bless-soul': return {doit:Doit.BLESS, mul:1, type: HitType.SOUL};
      case 'bless-aura': return {doit:Doit.BLESS, mul:1, type: HitType.AURA};
      case 'ressurection': return {doit:Doit.RESSURECT};
      case 'shield-body': return {doit:Doit.SHIELD, type: HitType.BODY, mul: 1};
      case 'shield-soul': return {doit:Doit.SHIELD, type: HitType.SOUL, mul: 1};
      case 'shield-aura': return {doit:Doit.SHIELD, type: HitType.AURA, mul: 1};
      case 'shield-reflex': return {doit:Doit.SHIELD, type: HitType.REFLEX, mul: 1};
      case 'score-1': case 's-1': return {score:1};
      case 'score-2': case 's-2': return {score:2};
      case 'score-3': case 's-3': return {score:3};
      case 'score-4': case 's-4': return {score:4};
      case 'score-5': case 's-5': return {score:5};
      case 'score-6': case 's-6': return {score:6};
      default: return slashCustomParse(command);
    }
  })
  .reduce((acu, item) => ({...acu, ...item}),{})
;

export enum Doit {
  SELECT, TARGET, HIT, HEAL, BLESS, RESSURECT, SHIELD, STUN, DIE, BRIBE, DRAIN,
}

export type TargetMobId = string;

export type AmountCause = number;
export type AmountReach = number;

export type AmountItem = [TargetMobId, AmountCause, AmountReach, Condition];

export interface FlowAction {
  who: TargetMobId;
  doit: Doit;
  type?: HitType;
  select?: Target;
  target?: TargetMobId[];
  amount?: AmountItem[];
}

export interface ComplexFlow {
  
  stream: FlowAction[];
  
} 

export const isCapableToAction = (m:Mob):boolean => !m?.condition?.isOut;

export const aiTarget = (actor:Mob, actorSkill:Partial<SlashObject>, mobList:Mob[]):FlowAction => {
  
  const {team:actorTeam} = actor;
  const seekEnemy = ({team}) => team !== actorTeam;
  const seekAlly = ({team}) => team === actorTeam;
  const selectUid = ({uid}) => uid;
  const getAffinity = ({condition:{staminaState, focusState, moraleState}}:Partial<Mob>) => {
    switch(actorSkill?.type) {
      case HitType.BODY: return staminaState;
      case HitType.SOUL: return focusState;
      case HitType.AURA: return moraleState;
      case HitType.REFLEX: return staminaState + focusState;
    }
  }
  const weakByAffinity = (a:Mob, b:Mob) => getAffinity(a) > getAffinity(b) ? 1 : -1;
  const matchTarget = (select:Target, type:HitType):TargetMobId[] => {
    switch(select) {
      case Target.SELECTED_ENEMY: return mobList
        .filter(isCapableToAction)
        .filter(seekEnemy)
        .sort(weakByAffinity)
        .map(selectUid)
        .slice(0,1)
      ;
      case Target.ALL_ENEMY: return mobList
        .filter(isCapableToAction)
        .filter(seekEnemy)
        .map(selectUid)
      ;
      case Target.RANDOM_ENEMY: return mobList
        .filter(isCapableToAction)
        .filter(seekEnemy)
        .filter(selectRandomPick)
        .map(selectUid)
      ;
      case Target.SELECTED_ALLY: return mobList
        .filter(isCapableToAction)
        .filter(seekAlly)
        .sort(weakByAffinity)
        .map(selectUid)
        .slice(0,1)
      ;
      case Target.ALL_ALLY: return mobList
        .filter(isCapableToAction)
        .filter(seekAlly)
        .map(selectUid)
      ;
      case Target.SELF: return [actor.uid];
    }
  };
  
  const target:TargetMobId[] = matchTarget(actorSkill?.select, actorSkill?.type);
  
  return {
    who: actor.uid,
    doit: Doit.TARGET,
    select: actorSkill?.select,
    target
  };
}

export const calcHeal = (actor:Mob, target:Mob, actorSkill:Partial<SlashObject>):AmountItem => {
  switch(actorSkill?.type) {
    case HitType.BODY: {
      const maxHeal = improved(actor.ability.soul / 2 * actorSkill.mul);
      const heal:number = Math.min(maxHeal, target.ability.stamina - target.condition.staminaState);
      const healTo:number = target.condition.staminaState + heal;
      return [target.uid, heal, healTo, {...target.condition, staminaState: healTo}];
    };
    default: [target.uid, 0, 0, target.condition]; // TODO
  }
}
export const calcHit = (actor:Mob, target:Mob, actorSkill:Partial<SlashObject>):AmountItem => {
  switch(actorSkill?.type) {
    case HitType.BODY: {
      const dmg:number = Math.min(improved(actor.ability.body / 2 * actorSkill.mul), target.condition.staminaState);
      const left:number = target.condition.staminaState - dmg;
      return [target.uid, - dmg, left, {...target.condition, staminaState: left}];
    };
    case HitType.SOUL: {
      const dmg:number = Math.min(improved(actor.ability.soul / 2 * actorSkill.mul), target.condition.focusState);
      const left:number = target.condition.focusState - dmg;
      return [target.uid, - dmg, left, {...target.condition, focusState: left}];
    }
    case HitType.AURA: {
      const dmg:number = Math.min(improved(actor.ability.aura / 2 * actorSkill.mul), target.condition.moraleState);
      const left:number = target.condition.moraleState - dmg;
      return [target.uid, - dmg, left, {...target.condition, moraleState: left}];
    }

    case HitType.REFLEX: {
      const dmg:number = Math.min(improved(actor.ability.reflex / 2 * actorSkill.mul), target.condition.staminaState);
      const left:number = target.condition.staminaState + dmg;
      return [target.uid, - dmg, left, {...target.condition, staminaState: left}];
    }
  }
}

export const checkIsOut = ([tMobId, aCause, aReach, condition]:AmountItem):AmountItem => 
     condition.staminaState > 0
  && condition.focusState > 0
  && condition.moraleState > 0
    ? [tMobId, aCause, aReach, condition]
    : [tMobId, aCause, aReach, {...condition, isOut:true}]
;

export const calcResult = (actor:Mob, actorSkill:Partial<SlashObject>, mobList:Mob[], targetting:FlowAction):FlowAction => {
  const {doit, type } = actorSkill;
  const {who, target = []} = targetting;
  const amount:AmountItem[] = target
    .map(
      (enemyId:TargetMobId) => doit === Doit.HIT
        ? calcHit(actor, mobList.find(({uid}) => uid === enemyId), actorSkill)
        : calcHeal(actor, mobList.find(({uid}) => uid === enemyId), actorSkill)
    )
    .map(checkIsOut);
  return {
    who,
    doit,
    type,
    target,
    amount,
  }
}

export const getSkillResult = (actor:Mob, actorSkill:Partial<SlashObject>, mobList:Mob[]):FlowAction[] => {
  
  const targetting:FlowAction = aiTarget(actor, actorSkill, mobList);

  const result:FlowAction = calcResult(actor, actorSkill, mobList, targetting);

  return [targetting, result];
};

export const skillReducer = (mobList:Mob[], result:FlowAction):Mob[] => {
  switch (result.doit) {
    case Doit.HEAL:
    case Doit.HIT: {
      const affectedMobList:Mob[] = result.amount
        .map(([id, dmg, left, condition]) => {
          const mob = mobList.find(({uid}) => uid === id);
          return [mob, condition];
        })
        .map(([mob, condition]:[Mob, Condition]) => {
          return [mob, condition];
        })
        .map(([mob, condition]:[Mob, Condition]) => ({...mob, condition}));

      return mobList.map(mob => {
        const affected:Mob = affectedMobList.find((m:Mob) => m.uid === mob.uid);
        if (!affected) return mob
        return affected 
      });
    }
    default: mobList;
  }
};