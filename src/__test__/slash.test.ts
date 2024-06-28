import { Mob, mobFactory, Team, traitsFactory, ProfessionKey } from "../rpg/profession";
import { 
  actionOrder, Target, HitType, SlashObject, SlashParser, slashParse,
  Doit, FlowAction, getSkillResult, skillReducer,
 } from "../rpg/slash";

const makeMob = (lvl:number, prof:ProfessionKey, team:Team = Team.GOOD) => mobFactory(
  `${prof} level:${lvl}`, 2, 1, `id:${prof}-${lvl}`, team, traitsFactory(lvl, prof)
);

const skillForProf:Partial<Record<ProfessionKey, string[]>> = {
  'assasin': ['instant target hit-body','fill-3 hit-body power-4','fill-4 target-all hit-soul power-2'],
  'bishop': ['instant target hit-soul power-2','f-3 tsa heal-2','fill-4 target-all-ally bless-body power-2'],
  'icelander': ['instant target-all hit-body','fill-3 target-all hit-body','fill-4 target-rnd power-4'],
  'ninja': ['instant target hit-body power-[2.4]','fill-4 target-all hit-body power-2','fill-2 target hit-body stun-2 power-4'],
  'samurai': ['instant target hit-body power-2','fill-2 target hit-body power-4','fill-4 target-all hit-body power-2'],
  'merchant': ['instant target hit-body weak','fill-2 hit-aura power-2','fill-4 target-all bribe-2'],
};

const getSkillObject = (m:Mob):Partial<SlashObject>[] => skillForProf[m.professionType].map(slashParse);

const testTeams = [
  [5, 'icelander', Team.BAD],
  [6, 'bishop', Team.BAD],
  [5, 'assasin', Team.BAD],
  [4, 'ninja', Team.GOOD],
  [7, 'samurai', Team.GOOD],
  [4, 'merchant', Team.GOOD],
]

const encounter = {
  mobList: testTeams.map(([lvl, type, team]:[number, ProfessionKey, Team]) => makeMob(lvl, type, team))
}

const slashPreParse = (slashSource:string) => slashSource.split(' ')
  .map(command => command.split('-'))
  .map(([c,m]) => m ? {c,m} : {c}) // c: command, m: modification
;

export function * combatFlowSaga(mobList:Mob[]):any {
  while (true) {
    const order = actionOrder(mobList);
    yield order;
    while (order.length) {
      const [actor]:[Mob] = order.shift();
      yield actor.uid;
      const skillList = getSkillObject(actor);
      yield skillList;
      const [A1] = skillList;
      const [aiTargetting, skillResult] = getSkillResult(actor, A1, mobList);
      mobList = skillReducer(mobList, skillResult);
      yield aiTargetting;
      yield skillResult;
    }
    // yield mobList.map((mob:Mob) => [mob.uid,mob.condition])
  }
}

test ('samurai lvl 5', () => {
  expect (makeMob(5, 'samurai', Team.GOOD)).toMatchSnapshot();
});

test ('encounter setup', () => {
  expect (encounter).toMatchSnapshot();
});

test ('simple strike test', () => {  
  expect (
    slashPreParse('instant target hit-body power-2')
  ).toStrictEqual([
    {c:'instant'},
    {c:'target'},
    {c:'hit', m:'body'},
    {c:'power', m:'2'},
  ]);
});

test.skip ('simple strike test', () => {  
  expect (
    slashParse('i target hb power-[2.4] extra-[teleport]')
  ).toStrictEqual({
    fill:0,
    select: Target.SELECTED_ENEMY,
    type: HitType.BODY,
    doit: Doit.HIT,
    mul: 2.4,
    extra: 'teleport',
  });
});

test ('search unexsist skill', () => {

  const skillList = encounter.mobList.map((hero:Mob) => skillForProf[hero.professionType]
    .map(slashParse)
  ).flat()
  
  expect (
    skillList.filter((skill:any) => skill._ERROR_)
  ).toStrictEqual(
    []
  );
});

describe ('First full combat round', () => {

  const mobList = testTeams.map(([lvl, type, team]:[number, ProfessionKey, Team]) => makeMob(lvl, type, team));
  const flow = combatFlowSaga(mobList)
  const nextRound = (generator) => generator.next().value; 
  const skippRound = (amount:number) => Array(amount).fill(1).forEach(() => nextRound(flow))

  test('initial order', () => {
  
    expect ( 
      nextRound(flow).map(([m]:[Mob])=>[m.uid, m.condition])
    ).toStrictEqual(
      [
        ['id:samurai-7', {staminaState: 357, focusState: 284, moraleState: 210}],
        ['id:bishop-6', {staminaState: 174, focusState: 228, moraleState: 156}],
        ['id:icelander-5', {staminaState: 123, focusState: 160, moraleState: 110}],
        ['id:assasin-5', {staminaState: 123, focusState: 148, moraleState: 110}],
        ['id:ninja-4', {staminaState: 96, focusState: 80, moraleState: 72}],
        ['id:merchant-4', {staminaState: 96, focusState: 112, moraleState: 72}],
      ]
    );
  })

  test ('first is the samurai', () => {
    expect(nextRound(flow)).toStrictEqual('id:samurai-7');
  });

  test ('samurai skill object list is', () => {
    expect(nextRound(flow)).toMatchSnapshot() 
  });

  test ('samurai select one enemy for A1', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:samurai-7',
        doit: Doit.TARGET,
        select: Target.SELECTED_ENEMY,
        target: ['id:assasin-5'],
      } as FlowAction
    )
  });

  test ('samurai hit weakest enemy', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:samurai-7',
        doit: Doit.HIT,
        type: HitType.BODY,
        target: ['id:assasin-5'],
        amount: [['id:assasin-5', -49, 74, {staminaState: 74, moraleState: 110, focusState: 148}]],
      } as FlowAction
    )
  });

  test ('samurai A2 and A3 fiiled up bye one', () => {});

  test ('next one is the bishop', () => {
    expect (nextRound(flow)).toStrictEqual('id:bishop-6');
    nextRound(flow)
  });

  test ('bishop select one enemy for A1', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:bishop-6',
        doit: Doit.TARGET,
        select: Target.SELECTED_ENEMY,
        target: ['id:ninja-4'],
      } as FlowAction
    )
  });

  test ('bishop hit weakest enemy', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:bishop-6',
        doit: Doit.HIT,
        type: HitType.SOUL,
        target: ['id:ninja-4'],
        amount: [['id:ninja-4', -39, 41, {staminaState: 96, moraleState: 72, focusState: 41}]],
      } as FlowAction
    )
  });

  test ('next one is the icelander', () => {
    expect (nextRound(flow)).toStrictEqual('id:icelander-5');
    nextRound(flow)
  });

  test ('icelander select one enemy for A1', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:icelander-5',
        doit: Doit.TARGET,
        select: Target.ALL_ENEMY,
        target: [
          'id:ninja-4',  
          'id:samurai-7',
          'id:merchant-4',
        ],
      } as FlowAction
    )
  });

  test ('icelander hit all enemy', () => {
    expect(nextRound(flow)).toStrictEqual(
      {
        who: 'id:icelander-5',
        doit: Doit.HIT,
        type: HitType.BODY,
        target: [
          'id:ninja-4',
          'id:samurai-7',
          'id:merchant-4',
        ],
        amount: [
          ['id:ninja-4', -16, 80, {staminaState: 80, moraleState: 72, focusState: 41}],
          ['id:samurai-7', -16, 341, {staminaState: 341, moraleState: 210, focusState: 284}], 
          ['id:merchant-4', -16, 80, {staminaState: 80, moraleState: 72, focusState: 112}],
        ],
      } as FlowAction
    )
  });
  
  test ('end of the round', () => {
    skippRound(12);
    expect (
      nextRound(flow).map(([m]:[Mob])=>[m.uid, m.condition])
    ).toStrictEqual(
      [
        ['id:samurai-7', {staminaState: 341, focusState: 284, moraleState: 210}],
        ['id:bishop-6', {staminaState: 174, focusState: 228, moraleState: 156}],
        ['id:icelander-5', {staminaState: 123, focusState: 160, moraleState: 110}],
        ['id:assasin-5', {staminaState: 49, focusState: 148, moraleState: 110}],
        ['id:ninja-4', {staminaState: 80, focusState: 41, moraleState: 72}],
        ['id:merchant-4', {staminaState: 67, focusState: 112, moraleState: 72}],
      ]
    );
  });

  test ('assasin knocked out of fight', () => {    
    skippRound(3)
    expect (
      nextRound(flow)
    ).toStrictEqual(
      {
        who: 'id:samurai-7',
        doit: Doit.HIT,
        type: HitType.BODY,
        target: ['id:assasin-5'],
        amount: [['id:assasin-5', -49, 0, {staminaState: 0, moraleState: 110, focusState: 148, isOut: true}]],
      } as FlowAction

    );
    skippRound(2);
  });

  test ('end of the second', () => {
    skippRound(6 * 3)
    expect (
      nextRound(flow).map(([m]:[Mob])=>[m.uid, m.condition])
    ).toStrictEqual(
      [
        ['id:samurai-7', {staminaState: 325, focusState: 284, moraleState: 210}],
        ['id:bishop-6', {staminaState: 174, focusState: 228, moraleState: 156}],
        ['id:icelander-5', {staminaState: 98, focusState: 160, moraleState: 110}],
        // ['id:assasin-5', {staminaState: 0, focusState: 148, moraleState: 110, isOut: true}],
        ['id:merchant-4', {staminaState: 38, focusState: 112, moraleState: 72}],
        ['id:ninja-4', {staminaState: 64, focusState: 2, moraleState: 72}],
      ]
    );
  });

  test ('assasin already out of combat so the last is merchant', () => {
    skippRound(12)
    expect (
      nextRound(flow) //.map(([m]:[Mob])=>[m.uid, m.condition])
    ).toStrictEqual(
      "id:merchant-4"
    );
  });

});


