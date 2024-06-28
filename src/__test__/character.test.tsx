import { oneLevelUp, increaseLevel, Mob, mobFactory, Team, traitsFactory, professionKeyList } from "../rpg/profession";
import { improved, rnd, amount } from "../rpg/rpg";

const fighter1Trait = traitsFactory(1, 'fighter');
const fighterMob:Mob = {...fighter1Trait, 
  name: 'Mr. Foo',
  coord: 0,
  avatar: 22,
  uid: 'dfx532',
  team: Team.BAD,
};

const actionOrder = (mobList:Mob[]) => mobList
  .map(mob => [mob, improved(
      (
        mob.ability.reflex 
      + (mob.condition.staminaState / 10)
      + (mob.condition.focusState / 10)
      ) / mob.level
    )])
  .sort(([a, aSpeed],[b, bSpeed]) => aSpeed > bSpeed ? -1 : 1 )
;

test ('create lvl 1 fighter', () => {  
  expect(fighter1Trait).toMatchSnapshot();
});


test ('Personalize lvl 1 fighter', () => {
  expect(fighterMob).toMatchSnapshot();
});

test ('Standard Personalize lvl 1 fighter', () => {
  const mobBymobFactory:Mob = mobFactory('Mr. Foo', 22, 0, 'dfx532', Team.BAD, fighter1Trait)
  expect(mobBymobFactory).toStrictEqual(fighterMob); 
});

test ('Level Up to fighter 2', () => {
  const MrFooLevel2 = increaseLevel(1)(fighterMob);
  expect(MrFooLevel2).toMatchSnapshot();
});

test ('Level Up to fighter 2 standard', () => {
  const mrFooLevel2 = increaseLevel(1)(fighterMob);
  const mrFooLevel2v2 = oneLevelUp(fighterMob);
  expect(mrFooLevel2).toStrictEqual(mrFooLevel2v2);
});

test('order of speed', () => {
  const MrFooLevel2 = increaseLevel(10)(fighterMob);
  const list = [fighterMob, MrFooLevel2];
  const order = actionOrder(list);
  
  expect(order).toEqual([[MrFooLevel2, 20], [fighterMob, 4]])
})

test('speed order of different profession lvl 10', () => {
  const list:Mob[] = professionKeyList.map(
    (key, index) => mobFactory(
      `Mr. ${key}`,7,0,index,Team.GOOD,
      traitsFactory(100, key)
    )
  )

  const order = actionOrder(list);
  
  expect(
    order.map(([mob, speed]:[Mob, number]) => `${mob.professionType}`)
  ).toMatchSnapshot();
})

test('Samurai speed number by levels', () => {
  const makeSamurai = (lvl) => 
    mobFactory(
      `Samurai level:${lvl}`,1,2,`id:${lvl}`,Team.GOOD,
      traitsFactory(lvl, 'samurai')
    )
  ;

  const samuraiList = amount(20).map(lvl => makeSamurai((lvl + 1) * 5));

  expect(
    actionOrder(samuraiList).map(
      ([mob, speed]:[Mob, number]) => `${mob.name} ${speed}`
    )
  ).toMatchSnapshot();
})

test('Fighter speed number by levels', () => {
  const makeFighter = (lvl) => 
    mobFactory(
      `Fighter level:${lvl}`,1,2,`id:${lvl}`,Team.GOOD,
      traitsFactory(lvl, 'fighter')
    )
  ;

  const fighterList = amount(20).map(lvl => makeFighter((lvl + 1) * 5));

  expect(
    actionOrder(fighterList).map(
      ([mob, speed]:[Mob, number]) => `${mob.name} ${speed}`
    )
  ).toMatchSnapshot();
})

