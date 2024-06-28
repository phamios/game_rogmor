import { rnd, leveling, uid, pickOne } from './rpg';

export interface Ability { 
  title:string;
  body: number;
  reflex: number;
  soul: number;
  aura: number;
  stamina: number;
  focus: number;
  morale: number; 
}

export interface Condition {
  staminaState: number;
  focusState: number;
  moraleState: number;
  isOut?: boolean;
}

export enum Team { PLAYER, GOOD, BAD, UGLY };

export interface MobTraits {  
  level: number;
  professionType: ProfessionKey;
  ability: Ability;
  condition: Condition;
}
export interface MobPerson {  
  name: string;
  avatar: number;
  coord: number;
  uid: string;
  team: Team;
}

export interface Mob extends MobTraits, MobPerson {}

export type ProfessionKey =
  'fighter' |'priest' |'paladin' |'knight' |'assasin' |'rogue' |'mage' |'captain' |'noble' |
  'headHunter' |'witch' |'valkur' |'guard' |'gladiator' |'barbarian' |'wizard' |'sage' |
  'samurai' |'ninja' |'warlord' |'bishop' |'tracker' |'dementor' |'necromanta' |'summoner' |
  'shaman' |'thief' |'rouge' |'cavalier' |'pirate' |'inquisitor' |'icelander' |'heretic' |
  'nomad' |'bard' |'warlock' |'monk' |'druid' |'illusionist' |'wardancer' |'runeSmith' |
  'merchant' |'explorer' |'templar' |'spy' |'nun' |'mercenary' |'duelist' |'beastmaster' |
  'sorcerer' |'archer' |'psionic' |'alchemist' |'enginer' |'antiPaladin' |'chaosKnight' |
  'chief' |'maruder' |'rich' |'shapechanger' 

export type ProfessionLookup = Record<ProfessionKey, Ability>; 

export const professionLookup:ProfessionLookup = {
    fighter:      { title:'Fighter',      body: 7, reflex: 4, soul: 2, aura: 4, stamina: 55, focus: 45, morale: 40 },
    priest:       { title:'Priest',       body: 3, reflex: 3, soul: 7, aura: 8, stamina: 35, focus: 65, morale: 40 },
    paladin:      { title:'Paladin',      body: 6, reflex: 3, soul: 6, aura: 6, stamina: 50, focus: 50, morale: 40 },
    knight:       { title:'Knight',       body: 7, reflex: 3, soul: 3, aura: 5, stamina: 60, focus: 50, morale: 40 },
    assasin:      { title:'Assasin',      body: 5, reflex: 7, soul: 1, aura: 3, stamina: 45, focus: 55, morale: 40 },
    rogue:        { title:'Rogue',        body: 4, reflex: 6, soul: 3, aura: 5, stamina: 55, focus: 40, morale: 40 },
    mage:         { title:'Mage',         body: 3, reflex: 4, soul: 6, aura: 2, stamina: 25, focus: 70, morale: 40 },
    captain:      { title:'Captain',      body: 5, reflex: 5, soul: 5, aura: 6, stamina: 55, focus: 55, morale: 40 },
    noble:        { title:'Noble',        body: 4, reflex: 5, soul: 6, aura: 7, stamina: 45, focus: 60, morale: 40 },
    headHunter:   { title:'Head hunter',  body: 5, reflex: 7, soul: 3, aura: 4, stamina: 60, focus: 45, morale: 40 },
    witch:        { title:'Witch',        body: 2, reflex: 5, soul: 6, aura: 2, stamina: 25, focus: 65, morale: 40 },
    valkur:       { title:'Valkur',       body: 5, reflex: 6, soul: 4, aura: 2, stamina: 60, focus: 60, morale: 40 },
    guard:        { title:'Guard',        body: 6, reflex: 5, soul: 2, aura: 4, stamina: 65, focus: 40, morale: 40 },
    gladiator:    { title:'Gladiator',    body: 7, reflex: 5, soul: 2, aura: 2, stamina: 75, focus: 25, morale: 40 },
    barbarian:    { title:'Barbarian',    body: 8, reflex: 6, soul: 2, aura: 2, stamina: 80, focus: 35, morale: 40 },
    wizard:       { title:'Wizard',       body: 1, reflex: 2, soul: 8, aura: 2, stamina: 25, focus: 80, morale: 40 },
    sage:         { title:'Sage',         body: 4, reflex: 5, soul: 6, aura: 5, stamina: 45, focus: 60, morale: 40 },
    samurai:      { title:'Samurai',      body: 6, reflex: 7, soul: 4, aura: 5, stamina: 70, focus: 55, morale: 40 },
    ninja:        { title:'Ninja',        body: 4, reflex: 8, soul: 3, aura: 3, stamina: 55, focus: 45, morale: 40 },
    warlord:      { title:'Warlord',      body: 4, reflex: 5, soul: 6, aura: 8, stamina: 45, focus: 60, morale: 40 },
    bishop:       { title:'Bishop',       body: 4, reflex: 5, soul: 6, aura: 8, stamina: 45, focus: 60, morale: 40 },
    tracker:      { title:'Tracker',      body: 4, reflex: 5, soul: 6, aura: 5, stamina: 45, focus: 60, morale: 40 },
    dementor:     { title:'Dementor',     body: 6, reflex: 4, soul: 1, aura: 1, stamina: 75, focus: 70, morale: 40 },
    necromanta:   { title:'Necromanta',   body: 2, reflex: 5, soul: 6, aura: 1, stamina: 45, focus: 60, morale: 40 },
    summoner:     { title:'Summoner',     body: 3, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    shaman:       { title:'Shaman',       body: 4, reflex: 5, soul: 6, aura: 6, stamina: 45, focus: 60, morale: 40 },
    thief:        { title:'Thief',        body: 4, reflex: 5, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    rouge:        { title:'Rouge',        body: 4, reflex: 5, soul: 6, aura: 5, stamina: 45, focus: 60, morale: 40 },
    cavalier:     { title:'Cavalier',     body: 6, reflex: 5, soul: 6, aura: 4, stamina: 45, focus: 60, morale: 40 },
    pirate:       { title:'Pirate',       body: 4, reflex: 5, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    inquisitor:   { title:'Inquisitor',   body: 4, reflex: 5, soul: 6, aura: 4, stamina: 45, focus: 60, morale: 40 },
    icelander:    { title:'Icelander',    body: 7, reflex: 6, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    heretic:      { title:'Heretic',      body: 4, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    nomad:        { title:'Nomad',        body: 4, reflex: 5, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    bard:         { title:'Bard',         body: 4, reflex: 5, soul: 6, aura: 6, stamina: 45, focus: 60, morale: 40 },
    warlock:      { title:'Warlock',      body: 4, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    monk:         { title:'Monk',         body: 6, reflex: 6, soul: 6, aura: 5, stamina: 45, focus: 60, morale: 40 },
    druid:        { title:'Druid',        body: 4, reflex: 5, soul: 6, aura: 4, stamina: 45, focus: 60, morale: 40 },
    illusionist:  { title:'Illusionist',  body: 3, reflex: 6, soul: 5, aura: 5, stamina: 35, focus: 50, morale: 40 },
    wardancer:    { title:'Wardancer',    body: 5, reflex: 7, soul: 6, aura: 2, stamina: 60, focus: 40, morale: 40 },
    runeSmith:    { title:'Rune smith',   body: 4, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    merchant:     { title:'Merchant',     body: 3, reflex: 3, soul: 6, aura: 6, stamina: 55, focus: 65, morale: 40 },
    explorer:     { title:'Explorer',     body: 4, reflex: 5, soul: 6, aura: 7, stamina: 45, focus: 60, morale: 40 },
    templar:      { title:'Templar',      body: 6, reflex: 3, soul: 6, aura: 5, stamina: 60, focus: 55, morale: 40 },
    spy:          { title:'Spy',          body: 4, reflex: 5, soul: 6, aura: 5, stamina: 45, focus: 60, morale: 40 },
    nun:          { title:'Nun',          body: 4, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    mercenary:    { title:'Mercenary',    body: 4, reflex: 5, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    duelist:      { title:'Duelist',      body: 3, reflex: 8, soul: 5, aura: 5, stamina: 50, focus: 60, morale: 40 },
    beastmaster:  { title:'Beastmaster',  body: 6, reflex: 5, soul: 7, aura: 1, stamina: 45, focus: 70, morale: 40 },
    sorcerer:     { title:'Sorcerer',     body: 3, reflex: 5, soul: 6, aura: 2, stamina: 45, focus: 60, morale: 40 },
    archer:       { title:'Archer',       body: 4, reflex: 7, soul: 6, aura: 3, stamina: 45, focus: 60, morale: 40 },
    psionic:      { title:'Psionic',      body: 4, reflex: 4, soul: 7, aura: 3, stamina: 45, focus: 60, morale: 40 },
    alchemist:    { title:'Alchemist',    body: 3, reflex: 5, soul: 7, aura: 2, stamina: 35, focus: 70, morale: 40 },
    enginer:      { title:'Enginer',      body: 3, reflex: 5, soul: 4, aura: 4, stamina: 35, focus: 65, morale: 40 },
    antiPaladin:  { title:'Anti Paladin', body: 7, reflex: 3, soul: 1, aura: 5, stamina: 60, focus: 60, morale: 10 },
    chaosKnight:  { title:'Chaos Knight', body: 7, reflex: 4, soul: 6, aura: 1, stamina: 50, focus: 60, morale: 10 },
    chief:        { title:'Chief',        body: 5, reflex: 5, soul: 4, aura: 7, stamina: 55, focus: 60, morale: 40 },
    maruder:      { title:'Maruder',      body: 7, reflex: 4, soul: 2, aura: 4, stamina: 60, focus: 40, morale: 40 },
    rich:         { title:'Rich',         body: 3, reflex: 4, soul: 3, aura: 8, stamina: 30, focus: 70, morale: 30 },
    shapechanger: { title:'Shapechanger', body: 6, reflex: 4, soul: 4, aura: 2, stamina: 55, focus: 45, morale: 30 },
}

// https://en.wikipedia.org/wiki/Character_class_(Dungeons_%26_Dragons)
// https://wfrp1e.fandom.com/wiki/List_Of_Advanced_Careers

export const professionList = Object.values(professionLookup);
export const professionKeyList = Object.keys(professionLookup) as ProfessionKey[];

export const traitsFactory = (level:number = 1,  professionType:ProfessionKey) => {

  const ability:Ability = professionLookup?.[professionType] ?? pickOne(professionList);

  const stamina = leveling(level, ability.stamina  / 10, 2);
  const focus    = leveling(level, ability.focus     / 10, 2);
  const morale  = leveling(level, ability.morale   / 10, 2);

  const mobTraits:MobTraits = {
    level,
    professionType,
    ability: {
      title        : ability.title,
      body         : leveling(level, ability.body     / 10, 2),
      reflex     : leveling(level, ability.reflex / 10, 2),
      soul         : leveling(level, ability.soul     / 10, 2),
      aura      : leveling(level, ability.aura  / 10, 2),
      stamina,
      focus,
      morale,
    },
    condition: {
      staminaState : stamina,
      focusState    : focus,
      moraleState  : morale,
    }
  };

  return mobTraits;
}

export const mobFactory = (name, avatar, coord, uid, team, traits:MobTraits):Mob => ({
  name,
  avatar,
  coord,
  uid,
  team,
  ...traits
});

export const increaseLevel = (amount:number = 1) => ({
  level, 
  professionType, 
  ability, 
  condition, 
  ...rest
}:Mob):Mob => ({
  ...traitsFactory(level + amount, professionType),
  ...rest
});

export const oneLevelUp = increaseLevel(1);