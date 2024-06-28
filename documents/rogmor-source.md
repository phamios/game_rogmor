# rogmor mmorpg source 

> put together code is

```shell
bat */**/*.(js|ts|jsx|tsx)

# -o all.md

sed 's/\x1b\[[0-9;]*m//g' all.md > rogmor-source.md

# remove linenumbers ASCI arts in VSCode `ctrl+D` keystroke help

```

## File: __test__/character.test.tsx

```tsx

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

```
## File: __test__/map.test.ts

```ts

import { generateName } from '../rpg/generateName';
import { mobFactory, professionList, Team, traitsFactory, Mob } from '../rpg/profession';
import { shuffle, uid, pickOne, rnd } from '../rpg/rpg';
import { dryLand } from '../rpg/rogmorMap';

test ('', () => {
  expect (
    dryLand
  ).toMatchSnapshot();
});

test('Random populate NPC on map', () => {
    const area = [...dryLand].sort(shuffle);
    const entitiesArray:Mob[] = area
      .slice(-45)
      .map(coord => mobFactory(
        generateName(),
        rnd(100),
        coord,
        uid(),
        Team.BAD,
        traitsFactory(rnd(10), pickOne(professionList))
      ))
    expect(pickOne(entitiesArray)?.name?.length).toBeGreaterThan(2);
  }
);
```
## File: __test__/slash.test.ts

```ts

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


```
## File: components/Blog.tsx

```tsx

import { useState, useEffect, FC } from 'react';
import { FaceSprite } from '../gui/setOfGuiElements';
import ReactMarkdown from 'react-markdown';

interface InputEvent {
  target: {
    value: string;
  }
}

interface Message { 
  id:string; 
  msg: string; 
  name?: string;
  avatar?: string;
}
 
export interface IBlogWriter {
  name: string;
  avatar: string;
}

type TBlogMap = (content:Message, index:number, list:Message[]) => Message;
export const blogSameUserHeaderMap:TBlogMap 
= (content, index, postList) => postList?.[index - 1]?.name === content?.name
  ? ({msg:content.msg, id: content.id})
  : content
;

export const Blog:FC<IBlogWriter> = ({name, avatar}) => {

  const [message, setMessage] = useState("");
  const [list, setList] = useState<Message[]>([]);
  const handleChangeMessage = (event:InputEvent) => setMessage(event?.target?.value)

  useEffect(() => {
    fetch(`/api/blog`)
      .then(r => r.json())
      .then(setList)
  }, []);
  
  const sendMessageToSocket = async () => {
    if (!message || !avatar || !name) return;
    setMessage("");
    const [,ask] = message.match(/^:: (.*)/) ?? [];
    const [,pic] = message.match(/^.. (.*)/) ?? [];

    await fetch(`/api/blog?name=${name}&avatar=${avatar}&msg=${ask ?? pic ?? message}`)
      .then(r => r.json())
      .then(setList);

    if (ask) {
      // const answer = await fetch(`api/ai?seek=${encodeURIComponent(ask)}`).then(r => r.text());
      const answer = await fetch(`api/ai?seek=${encodeURIComponent(ask)}`).then(r => r.json());

      console.log(answer);

      await fetch(`/api/blog?name=Sage&avatar=${21}&msg=${JSON.stringify(answer)}`)
        .then(r => r.json())
        .then(setList);
    }

//     if (pic) {
//        const {data} = await fetch(`/api/ai-image?seek=${pic} paint&n=${1}&size=${'256x256'}`).then(r => r.json());
//        console.log(data);
// 
//       if (data?.[0]?.url) {
//         await fetch(`/api/blog?name=Oraculum&avatar=${22}&msg=![${pic}](${data[0].url})`)
//           .then(r => r.json())
//           .then(setList);
//       }
// 
//     }
  };

  return name ? (
    <section>
        <div className="m-2 flex gap-2 text-lg font-mono">
          <input onChange={handleChangeMessage} className="p-2 w-64 bg-black text-white focus:outline-0 text-2xl font-sans" type="text" value={message} /> 
          <button onClick={sendMessageToSocket} className="send-btn p-2">send</button>
        </div>

        <div style={{width:'100%'}}>{list
          .map(blogSameUserHeaderMap)
          .map(
            post => (
              <div key={post.id} className=''>
                {post?.avatar && post?.name && (
                  <section className="blog-header">
                    <FaceSprite data-face={post.avatar} style={{position: 'relative'}}/>
                    <span className='text-xl text-sky-500'>{post.name}</span>
                  </section>
                )}
                <p className='p-2 whitespace-normal text-base'>{(post.msg ?? "").replaceAll('"','').split('\\n').map((line, idx) => <p key={idx}>{line}</p>)}</p>
                {/* <pre className='p-2 whitespace-normal text-base'>{JSON.stringify(post.msg, null, 2)}</pre> */}

              </div>
            )
          )
        }</div>

    </section>
  ) : <></>;
}
```
## File: components/CombatZone.tsx

```tsx

import React from 'react';
import { Team } from 'src/rpg/profession';
import { MainState } from 'src/rpg/singlePlayerTroll';
import { EntityCard } from './EntityCard'; 

export const PlaceOfMob = () => (<div className='w-32' />); 

export default function CombatZone ({state, army}) {

  const {hero, focus, entities, flow, mobList, isAutoFight} = state as MainState;
  const {focusOn, fight, skill, talk, encounterOutcome, useSkill, setAutoFight} = army;
  
  return (
    <section className="absolute top-0 left-0 overflow-hidden --pointer-events-none grid justify-center w-screen items-center my-12">
      {mobList && mobList.length > 0 && (
        <main className="grid justify-center">
          <section className='scale-[0.6] grid gap-16'>
            <section className='flex gap-4'>
              {mobList
                .filter(({team}) => team === Team.BAD )
                .map(mob => (
                  <EntityCard key={mob.uid} tw="bg-[#675]" mob={mob} flow={flow}/>
              ))}
            </section>

            <section className='flex gap-4'>
              {mobList
                .filter(({team}) => team === Team.GOOD )
                .map(mob => (
                  <EntityCard key={mob.uid} tw="bg-[#288]" mob={mob} flow={flow} />
              ))}
            </section>
          </section>

          <section className="m-4">
            <section className="w-96 grid grid-cols-3 gap-2 p-4">
              <button className="rounded-lg p-2 text-lg text-white bg-sky-600 grayscale-[.7]" onClick={() => useSkill(0)}>Alfa</button>
              <button className="rounded-lg p-2 text-lg text-white bg-sky-600 grayscale-[.7]" onClick={() => useSkill(1)}>Beta</button>
              <button className="rounded-lg p-2 text-lg text-white bg-sky-600 grayscale-[.7]" onClick={() => useSkill(2)}>Delta</button>
            </section>
            <section className="w-96 grid grid-cols-3 gap-2 p-4">
              <button className="rounded-lg p-2 text-lg text-white bg-sky-700 grayscale-[.7]" onClick={() => setAutoFight(!isAutoFight)}>Auto: {isAutoFight ? "on" : "off"}</button>
              <div />
              <button className="rounded-lg p-2 text-lg text-white bg-sky-700 grayscale-[.7]" onClick={() => {focusOn(null); encounterOutcome()}}>Escape</button>
            </section>
          </section>
        </main>
      )}
    </section>

  );
}
```
## File: components/CreateHero.js

```js

import { rnd, uid, pickOne } from '../rpg/rpg';
import HeroCard from '../gui/HeroCard';
import getConfig from 'next/config';

import { FaceSprite, LoginWindow, Button } from '../gui/setOfGuiElements';
import { GameMode } from '../rpg/singlePlayerTroll';
import { mobFactory, Team, traitsFactory } from '../rpg/profession';
import { generateName } from '../rpg/generateName';
import { limitedProfessionWithSkills } from '../rpg/limitedProfessionWithSkills';
import { MainState } from 'src/rpg/singlePlayerTroll';
import { skillForProf } from 'src/rpg/limitedProfessionWithSkills';

export default function CreateHero({state, army}) {
  const { hero } = state;
  const { setHero, setGameState } = army;

  const { publicRuntimeConfig:{version} } = getConfig();

  const handleRollHero = () => setHero(mobFactory(
    generateName(),
    rnd(100),
    0,
    uid(),
    Team.PLAYER,
    traitsFactory(1, pickOne(limitedProfessionWithSkills))
  ));
  
  const handleLetsAdventure = () => {
    setGameState(GameMode.ADVENTURE_ON_MAP);
    return;
  };

  const heroSkillDescription = (hero)
    ? skillForProf[hero.professionType]
    : []
  ;

  return (<>
    <LoginWindow style={{margin:'0 auto'}}>
      <h1 style={{padding:30, color:'#000'}}>Rogmor the Next:RPG</h1>
    </LoginWindow>
    <article className="text-base">
      <p>Welcome young <strong>adventurer</strong>!</p>
      <p>You are stepp into another dimension, called: <strong>Rogmor</strong> and ther is a lot of opportunity to fullfill your dreams, at first stepp is choice your character.</p>
      <p>Don't afraid there is no worst choice, and you can learn something different.</p>
      <p>Rogmor under chaotic statement at moment so prophecy talking about a skillfull hero, who <strong>focus be restor odrer and peace</strong> to this land.</p>
      <br/>
      <p>version: {version}</p>
    </article>

    <button className="bg-sky-800 hover:bg-sky-600 p-2 text-lg rounded-lg w-full my-4" onClick={handleRollHero}>Roll your character</button>
    {hero && <HeroCard hero={hero} style={{fontSize:17}}/>}
    {hero && (<section>{heroSkillDescription.map((descript, index) => <p className='m-2' key={index}><span className="text-sky-500">{["Alfa","Beta","Gamma","Delta","Epsilon"][index]}: </span>{des
cript}</p>)}</section>)}
    {hero && (
      <section className="my-4">
        <figure className="face-sprite absolute left-8 z-20 scale-150" data-face={hero.avatar} />
        <button className="bg-sky-800 hover:bg-sky-600 p-2 text-lg rounded-lg w-full my-4" onClick={handleLetsAdventure}>Let adventure!</button>
      </section>
      )}
  </>);
}
```
## File: components/EntityCard.tsx

```tsx

import React, {FC, useCallback, useState, useEffect} from 'react';
import { Doit, FlowAction, HitType } from 'src/rpg/slash';
import { InteractionKind } from '../gui/battleSaga';
import { Mob } from '../rpg/profession';
import { VerticalValue } from './VerticalValue';
import { uid as uidFactory } from '../rpg/rpg';

export const DamageAnimation = ({dmg, woundColor}) => (
  <figure className={`fading-to-top text-white ${woundColor} transition  rounded-full p-3 absolute text-3xl`}>{dmg}</figure>
);

export interface IEntityCard {
  mob:Mob;
  tw: string;
  flow: FlowAction;
}
export const EntityCard:FC<IEntityCard> = ({mob, tw="", flow}) => {

  const {
    avatar, level, uid,
    ability:{stamina, focus, morale, title}, 
    condition:{staminaState, focusState, moraleState, isOut}
  } = mob as Mob;

  const [isTarget, dmg] = flow?.amount && flow.amount.find(([id]) => id === uid) || [];

  const [stream, setStream] = useState([]);

  const woundColor = {
    [HitType.BODY]: dmg < 0 ? 'bg-rose-800' : 'bg-green-800',
    [HitType.SOUL]: dmg < 0 ? 'bg-yellow-600' : 'bg-green-800',
    [HitType.AURA]: dmg < 0 ? 'bg-sky-800' : 'bg-green-800',
  }?.[flow?.type] || '';

  useEffect(() => {
    if (isTarget) {
      setStream(str => [...str, {dmg, woundColor, key:uidFactory()}].slice(-5))
    }
    // return () => setStream([]);
  }, [isTarget, flow])

  return (
    <figure className={`flex gap-0 w-32 h-64 rounded-3xl justify-center flex-wrap items-center shadow-lg ${tw} ${flow?.who === mob.uid ? "brightness-150" : ""}`} style={{opacity: isOut ? ".2" : "
1"}}>
      <section className='grid items-center justify-center w-24 h-24 relative'>
        <figure className='face-sprite big-face' data-face={avatar} />
        <div className="absolute rounded-full bg-red-800 p-3 text-lg text-white w-9 h-8 flex items-center justify-center right-24 shadow-lg">
          <span>{level}</span>
        </div>
      </section>
      <div className='text-white p-2 text-lg'>{title}</div>
      <section className='flex gap-2 w-max m-4 items-end justify-end'>
        <VerticalValue tw='bg-rose-900' value={staminaState/stamina}/>
        <VerticalValue tw='bg-yellow-200' value={focusState/focus} />
        <VerticalValue tw='bg-emerald-900' value={moraleState/morale} />
        
      </section>
      {/* {!!isTarget && <DamageAnimation dmg={dmg} woundColor={woundColor} />} */}
      {stream.map(({key, dmg, woundColor}) => <DamageAnimation key={key} dmg={dmg} woundColor={woundColor} />)}
    </figure>
  );
};
```
## File: components/LootScreen.tsx

```tsx

import React from 'react';
import { Team } from 'src/rpg/profession';
import { MainState } from 'src/rpg/singlePlayerTroll';
import { EntityCard } from './EntityCard'; 

export default function LootScreen ({state, army}) {

  const {hero, focus, entities, flow, mobList, isAutoFight} = state as MainState;
  const {focusOn, fight, skill, talk, encounterOutcome, useSkill, setAutoFight} = army;
  
  return (
    <section className="absolute top-0 left-0 overflow-hidden --pointer-events-none grid justify-center w-screen items-center my-12">
      <pre>
        <h1>--- LOOT SCREEN ---</h1>
      </pre>  
    </section>
  );
}
```
## File: components/SingleAdventure.tsx

```tsx

import {  useEffect, useRef } from "react";

import { dryLand, coordToStyle } from "../rpg/rogmorMap";
import {  rnd, shuffle, uid, pickOne } from "../rpg/rpg";

import HeroCard from "../gui/HeroCard";
import { FaceSprite } from "../gui/setOfGuiElements";
import { CombatOutcome, GameMode, MainState } from "../rpg/singlePlayerTroll";
import { mobFactory, professionList, traitsFactory, Team, Mob } from "../rpg/profession";
import { generateName } from "../rpg/generateName";

const capableOfAction = ({condition:{staminaState, focusState, moraleState}}:Mob) => staminaState && focusState && moraleState;

const HERO_STARTING_COORD = 6005;

export default function SingleAdventure({state, army}) {
  const {hero, entities, focus, actionAnim, combatResult} = state as MainState;
  const {modHero, setGameState, setupEntities, focusOn, playActionAnim, setHero, levelUpHero, encounterBegin} = army;

  const mapRef = useRef(null);

  useEffect(() => { 
    if (!mapRef.current) return;
    const autoScroll = () => {
      mapRef.current.scrollLeft = 100;
    };
    mapRef.current.addEventListener("scroll", autoScroll);
    return () => mapRef?.current && mapRef.current.removeEventListener("scroll", autoScroll);
  }, [mapRef, hero?.coord])

  const playAnim = anim => {
    playActionAnim(anim);
    setTimeout(_ => playActionAnim(null) , 330);
  };

  useEffect( () => {
    const area = dryLand
      .filter(coord => coord !== HERO_STARTING_COORD)
      .sort(shuffle)
    ;
    const entitiesArray:Mob[] = area
      .slice(-45)
      .map(coord => mobFactory(
        generateName(),
        rnd(100),
        coord,
        uid(),
        Team.BAD,
        traitsFactory(rnd(10), pickOne(professionList))
      ))

    const entitiesLookup:Record<string, Mob> = Object.fromEntries(entitiesArray.map(mob => [mob.uid, mob]));

    setupEntities(entitiesLookup);

    modHero(h => ({...h, coord: HERO_STARTING_COORD}));
  }, []);

  useEffect(() => {
    if (combatResult === CombatOutcome.HERO_DIE) {
      setHero(null);
      setGameState(GameMode.ROLL_CHARACTER);
    }

    if (combatResult?.outcome === CombatOutcome.NPC_DIE) {
      levelUpHero();
    }
  }, [combatResult]);

  const infoAbout = npc => () => focusOn(npc.uid);
  const handleToStart = () => setGameState(GameMode.ROLL_CHARACTER)
  const moveHero = direction => ({coord, ...rest}) => {
    const target = coord + direction;
    focusOn(null);
    if (dryLand.includes(target)) {
      const who = Object.values(entities).filter(capableOfAction).find(({coord}) => coord === target );
      if (who) {
        focusOn(who?.uid);
        encounterBegin();
        return ({coord, ...rest});
      }
      return ({coord: target, ...rest});
    }
    return ({coord, ...rest});
  }

  return (<>
    <section style={{overflowX:'auto', position:'relative'}}>
      <div 
        className="norebo-map-r-90" 
        style={!entities[focus] ? {position:'relative'}  : {position:'absolute', visibility:'hidden'}}
        ref={mapRef}
      >
        {Object.values(entities).filter(capableOfAction).map(
          ({uid, avatar, professionType, coord}) => (
            <FaceSprite 
              key={uid} 
              data-face={avatar} 
              data-prof={professionType} 
              style={coordToStyle(coord)} 
            />
          )
        )}
        {hero?.coord && (
          <FaceSprite 
            data-face={hero?.avatar} 
            style={coordToStyle(hero.coord)} 
            onClick={() => focusOn(null)}
          />
        )}
      </div>
    </section>
    {!entities[focus] && (
      <section className="m-4 grid grid-cols-3 gap-2">
        <div></div>
        <button className="rounded-lg p-2 text-lg bg-sky-600" onClick={ _ => modHero(moveHero(-1000))}>north</button>
        <div></div>
        <button className="rounded-lg p-2 text-lg bg-sky-600" onClick={ _ => modHero(moveHero(   -1))}>west</button>
        <button className="rounded-lg p-2 text-lg bg-sky-600" onClick={ _ => modHero(moveHero( 1000))}>south</button>
        <button className="rounded-lg p-2 text-lg bg-sky-600" onClick={ _ => modHero(moveHero(    1))}>east</button>
      </section>
    )}

    {false && entities && entities[focus] && (
      <section>
        <HeroCard hero={entities[focus]} style={{fontSize:17}}/>
      </section>
    )}

    { !focus && (
      <>
        <HeroCard hero={hero} style={{fontSize:17}}/>
        <button className="bg-sky-800 hover:bg-sky-600 p-2 text-lg rounded-lg w-full my-4" onClick={handleToStart}>Back to start</button>
      </>
    )}


  </>);
}
```
## File: components/VerticalValue.tsx

```tsx

export const VerticalValue = ({value=1, tw="bg-white"}) => (
  <div className='relative'>
    <div className="w-4 h-24 absolute bg-[#0004]" />
    <div 
      className={`w-4 h-24 origin-bottom transition ${tw}`}
      style={{transform:`scaleY(${value})`}} 
    />
  </div>
);
```
## File: graphql/resolvers.ts

```ts

import { professionLookup } from '../rpg/profession';

export const resolvers = {
  Query: {
    professions: () => Object.entries(professionLookup)
      .map(([id, prof]) => ({id, ...prof, sum: prof.body + prof.reflex + prof.soul + prof.aura}))
    ,
  }
}; 
```
## File: graphql/schema.ts

```ts

import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Profession {
    id: String,
    title: String,
    body: Int,
    reflex: Int,
    soul: Int,
    aura: Int,
    stamina: Int,
    focus: Int,
    morale: Int,
    sum: Int,
  }

  type Query {
    professions: [Profession]!
  }
`
```
## File: gui/CompactHeroCard.js

```js

export default ({hero, children, ...props}) => {
  const {avatar, profession, staminaState } = hero;

  return (
    <figure className='small-card gui gui-loginw' {...props}>
      <image className='face-sprite' data-face={avatar} />
      <span>
        <span>{`lvl: ${level} - ${profession}`}</span>
        <div>
          <svg className="small-card-svg">
            <rect fill="rgba(0,0,0,0.2)" width={100} height={4} x={0} y={0}/>
            <rect fill="green" width={100 * staminaState / stamina} height={4} x={0} y={0}/>
          </svg>
        </div>
      </span>
      {/* <ProcessBar process={staminaState / stamina} style={{width: 160, marginLeft: 15}} /> */}
      {children}
    </figure>
  );
}
```
## File: gui/GothicWindow.js

```js

export default ({children, ...props}) => {
  return (    
    <figure className='slice-9-grid-holder retro' id="__rogmor__">
      <figure className="slice-content">
        {children}
      </figure>
      <figure className="modal-window slice-extra" {...props}/>
    </figure>
  );
}
```
## File: gui/HeroCard.tsx

```tsx

import React from 'react';
import { Mob } from '../rpg/profession';

export const ProcessBar = ({process = 1, ...props}) => (
  <figure className='button-b' {...props}>
    <div className='process-bar-indicator' style={{width: process * 254}}/>
  </figure>
);

export const MultiProcessBar = ({process = [1,1,1], ...props}) => {
  const [stm, wil, mry] = process;
  return (
    <figure className='button-b' {...props}>
      <div className='process-bar-indicator' data-process="stm" style={{width: (stm || 0) * 254}}/>
      <div className='process-bar-indicator' data-process="wil" style={{width: (wil || 0) * 254}}/>
      <div className='process-bar-indicator' data-process="mry" style={{width: (mry || 0) * 254}}/>
    </figure>
  );
}

export default ({hero, ...props}) => {
  const {
    avatar, name, level, 
    ability:{body, soul, reflex, aura, stamina, focus, morale, title}, 
    condition:{staminaState, focusState, moraleState}
  } = hero as Mob;

  const maxLength = [focus, morale, stamina]
    .map((n:number) => n.toString().length)
    .reduce((col:number, val:number) => val > col ? val : col, 3)
  ;

  const padAlign = (n:number) => n.toString().padStart(maxLength, ' ');

  return (
    <section className='gui gui-storyw' {...props}>
      <figure className='face-sprite' data-face={avatar} />
      <span className='text-lg leading-4'>{name} the {title}</span>
      <pre className='leading-[1em] text-[1.15em] m-2'>{`

      level: ${level}

      body: ${padAlign(body)} stamina: ${padAlign(stamina)}
      soul: ${padAlign(soul)}   focus: ${padAlign(focus)}
      aura: ${padAlign(aura)}  morale: ${padAlign(morale)}
     reflex: ${padAlign(reflex)}
      `}
      </pre>
    </section>
  );
}
```
## File: gui/HeroCardLine.js

```js

import React from 'react';

import { FaceSprite } from './setOfGuiElements';

export default ({hero, children, color = 'white', ...props}) => {
  const {avatar, name, profession, level, physique, reflex, soul, stamina, focus, staminaState, focusState, morale, moraleState } = hero;

  return (
    <section className="hero-line" {...props}>
      <div className='face-sprite adventure--hero big-face-line' data-face={avatar} />

      <svg className="hero-line-bars" viewBox="0 0 140 40">
        <text fill={color} x={45} y={16}>level {level} {profession}</text>
        <rect fill="rgba(0,0,0,0.2)" width={100} height={4} x={45} y={22}/>
        <rect fill="rgb(138, 85, 25)" width={100 * staminaState / stamina} height={4} x={45} y={22}/>

        <rect fill="rgba(0,0,0,0.2)" width={100} height={4} x={45} y={28}/>
        <rect fill="rgb(202, 200, 69)" width={100 * focusState / focus} height={4} x={45} y={28}/>

        <rect fill="rgba(0,0,0,0.2)" width={100} height={4} x={45} y={34}/>
        <rect fill="rgb(22, 100, 15)" width={100 * moraleState / morale} height={4} x={45} y={34}/>
      </svg>
    </section>
  );
}
```
## File: gui/MobilFrame.js

```js


import GothicWindow from './GothicWindow';

export const MobilFrame = ({children}) => (
  <GothicWindow style={{filter:'brightness(.7)'}}>
    <section className="mobil-font-setup">
      {children}
    </section>
  </GothicWindow>
);
```
## File: gui/battleSaga.ts

```ts

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
```
## File: gui/scss/asset.js

```js

export default "/assets/";
```
## File: gui/setOfGuiElements.js

```js

export const ModalWindow = props => <div className='modal-window' {...props} />;
export const Page = props => <div className='page' {...props} />;
export const FaceSprite = props => <div className='face-sprite adventure--hero' {...props} />;
export const FaceGallery = props => <div className='face-gallery' {...props} />;
export const ItemSprite = props => <div className='item-sprite adventure--item' {...props} />;
export const BaseOfAdventure = props => <div className='mobil-page' {...props} />;
export const LoginWindow = props => <div className='gui gui-loginw' {...props} />;
export const FaceWindow = props => <div className='gui gui-storyw' {...props} />;
export const ChatWindow = props => <div className='gui gui-chatWindow' {...props} />;
export const DarkPanel = props => <div className='gui gui-transPanelDark z300' {...props} />;
export const InfoPanel = props => <div className='gui gui-infow' {...props} />;
export const RogmorLogo = props => <div className='gui gui-rogmor_198x63' {...props} />;
export const NoreboMap = props => <div className='norebo-map-r-90' {...props} />;
export const Button = props => <div className='gui button-9-slice' {...props} />;
export const Button70 = props => <div className='gui button-70' {...props} />;
```
## File: lib/mainSaga.ts

```ts

import { take, fork, call, all, delay, select, cancel, race } from 'redux-saga/effects';
import { 
  ENCOUNTER_RESULT, ENCOUNTER_BEGIN, ENCOUNTER_OUTCOME, FOCUS_ON, 
  HEART_BEAT, MainState, PLAY_FLOW, SET_AUTO_FIGHT, 
  SET_MOB_LIST, USE_SKILL, LEVEL_UP_HERO } from '../rpg/singlePlayerTroll';
import { putAction } from '../util/putAction';
import { Mob, Team, ProfessionKey, mobFactory, traitsFactory } from '../rpg/profession';
import { improved, dice, pickOne, uid } from '../rpg/rpg';
import { isCapableToAction, slashImprovedParser, SlashObject, getSkillResult, skillReducer, actionOrder} from '../rpg/slash';
import { OrderOfSeed } from '../rpg/definitions'
import { skillForProf } from '../rpg/limitedProfessionWithSkills';

const slash = p => p;

const BATTLE_SPEED = 222;

export function * mainSaga() {
  yield all([
    fork(combatZoneSaga),
  ]);
};

const makeMob = (lvl:number, prof:ProfessionKey, team:Team = Team.GOOD, avatar) => mobFactory(
  `${prof} level:${lvl}`, avatar, 1, uid(), team, traitsFactory(lvl, prof)
);

const getSkillObject = (m:Mob):Partial<SlashObject>[][] => skillForProf[m.professionType].map(slashImprovedParser);

export function * combatZoneSaga() {
  while (true) {
    yield take(ENCOUNTER_BEGIN);

    const {hero}:MainState = yield select();

    const pickProf = () => pickOne(Object.keys(skillForProf))

    const testTeams = [
      [hero.level, pickProf(), Team.BAD, dice(100)],
      [hero.level, pickProf(), Team.BAD, dice(100)],
      [hero.level, pickProf(), Team.BAD, dice(100)],
      
      [hero.level, pickProf(), Team.GOOD, dice(100)],
      [hero.level, hero.professionType, Team.GOOD, hero.avatar],
      [hero.level, pickProf(), Team.GOOD, dice(100)],
    ]
    
    const combatSetupMobList = testTeams.map(([lvl, type, team, avatar]:[number, ProfessionKey, Team, number]) => 
      makeMob(lvl, type, team, avatar)
    );

    yield putAction(SET_MOB_LIST, combatSetupMobList)
    let mobList = combatSetupMobList;

    _CombatIsOver_: while (true) {
      const order = actionOrder(mobList);

      while (order.length) {
        const [actor]:OrderOfSeed = order.shift();
        yield putAction(PLAY_FLOW, {who: actor.uid});
        const skillList = getSkillObject(actor);

        // mob always use A1
        const {isAutoFight} = yield select();
        const subList = yield call(userChoiceTheSkillSaga, skillList, actor, isAutoFight)
        if (subList === null) break _CombatIsOver_;

        _NextActor_: while (true) {
          if (subList.length < 1) break _NextActor_;

          const [, command] = yield race([
            delay(BATTLE_SPEED),
            take([HEART_BEAT, ENCOUNTER_OUTCOME]),
          ])

          if (command?.type === ENCOUNTER_OUTCOME) break _CombatIsOver_;

          const skill = subList.shift();
          const [aiTargetting, skillResult] = getSkillResult(actor, skill, mobList);
          yield putAction(PLAY_FLOW, aiTargetting);
          yield putAction(PLAY_FLOW, skillResult);
          mobList = yield call(skillReducer, mobList, skillResult);
          yield putAction(SET_MOB_LIST, mobList);

          const isTwoTeam = mobList
            .filter(isCapableToAction)
            .map(mob => mob.team)
            .find((item, _, arr) => arr.indexOf(item) !== 0)
          ;

          if(!isTwoTeam) {
            yield putAction(FOCUS_ON, null);
            break _CombatIsOver_;
          }
        }
      }
    }
    yield call(calculateEncounterResultSaga, mobList);
  }
}

function * userChoiceTheSkillSaga(skillList:Partial<SlashObject>[][], actor:Mob, isAutoFight: boolean) {
  if (actor.team !== Team.GOOD || isAutoFight) return skillList.at(0)
  const {payload: skillIndex, type} = yield take([USE_SKILL, SET_AUTO_FIGHT, ENCOUNTER_OUTCOME]); // TODO really bad solution!
  return (type !== ENCOUNTER_OUTCOME)
    ? skillList.at(skillIndex)
    : null
  ;
}

function * calculateEncounterResultSaga(mobList:Mob[]) {
  // const {hero} = yield select();
  yield putAction(SET_MOB_LIST, []);
  const survivors = mobList.filter(isCapableToAction);
  const heroTeams = survivors.filter(mob => mob.team === Team.GOOD)

  yield putAction(
    ENCOUNTER_RESULT, 
    survivors.length - heroTeams.length
  );
  yield putAction(LEVEL_UP_HERO, 1);
}
```
## File: lib/mongodb.js

```js

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

let cachedClient;
let cachedDb;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb,
    };
  }

  if (!MONGODB_URI) {
    throw new Error("Define the MONGODB_URI environmental variable");
  }
  if (!MONGODB_DB) {
    throw new Error("Define the MONGODB_DB environmental variable");
  }

  let client = new MongoClient(MONGODB_URI);
  await client.connect();
  let db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
}
```
## File: pages/ImageRequest.tsx

```tsx

import { useState } from 'react';
import { MobilFrame } from 'src/gui/MobilFrame';
import { select } from 'redux-saga/effects';

export default () => {
  // get image from api
  const [image, setImage] = useState(null); // image url
  const [seek, setSeek] = useState(''); // image url
  const [n, setN] = useState(1); // image url 
  const [size, setSize] = useState('256x256'); // image url

  const getImage = async () => {
    const res = await fetch(`/api/ai-image?seek=${seek}&n=${n}&size=${size}`);
    const json = await res.json();
    setImage(json);
  };


  return (
    <section className='portal-root m-2'>
      <MobilFrame>

        <h1 className='text-[2em] text-center'>Design Something</h1>
        <div className='grid'>
          <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="text" placeholder='prompt' value={seek} onChange={e => setSeek(e.target.value)} />
          <section className='grid grid-cols-2'>
            <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="number" value={n} min={1} max={8} onChange={e => setN(+ e.target.value)} />
            <select className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" value={size} onChange={e => setSize(e.target.value)}>
              <option value="256x256">256x256</option>
              <option value="512x512">512x512</option>
              <option value="1024x1024">1024x1024</option>
            </select>
          </section>

          <button className='bg-sky-800 hover:bg-sky-600 m-2 p-2 rounded-md' onClick={getImage} >Get Image</button>
          {/* <a className='bg-sky-800 hover:bg-sky-600 m-2 p-4 rounded-md text-center text-lg' href={`/`} target='_blank' >Back to play</a> */}

        </div>
        <div>
          {/* <pre>{JSON.stringify(image, null, 2)}</pre> */}
          <section className='grid gap-2 place-items-center'>
            {image?.data?.map && image.data.map(({ url }, idx) => <img key={idx} src={url} />)}
          </section>
        </div>
      </MobilFrame>
    </section>
  );
}
```
## File: pages/RogmorFrame.js

```js

import { MobilFrame } from '../gui/MobilFrame';
import { GameMode, gameReducer, getActionsLookup, initialState } from '../rpg/singlePlayerTroll';
import SingleAdventure from '../components/SingleAdventure';
import CreateHero from '../components/CreateHero';
import Head from 'next/head';
import { Blog } from '../components/Blog';
import { useSagaReducer } from 'use-saga-reducer';
import { getDispatchedActions } from 'react-troll';
import { mainSaga } from '../lib/mainSaga';
import CombatZone from 'src/components/CombatZone';

const RogmorFrame = () => {
  const [state, dispatch] = useSagaReducer(mainSaga, gameReducer, initialState);
  const army = getDispatchedActions(getActionsLookup(), dispatch);
  const {game, hero} = state;

  return (
    <section className='portal-root m-2'>
      <MobilFrame>
        <Head>
          <title>The Next Hero</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="manifest" href="manifest.json"></link>
        </Head>

        {game === GameMode.ROLL_CHARACTER && <CreateHero state={state} army={army} />}
        {game === GameMode.ADVENTURE_ON_MAP && <SingleAdventure state={state} army={army} />}
        {game === GameMode.ROLL_CHARACTER && <Blog name={hero?.name} avatar={hero?.avatar} />}
      </MobilFrame>
      {game === GameMode.ADVENTURE_ON_MAP && <CombatZone state={state} army={army} />}
    </section>
  );
}; 

export default RogmorFrame;
```
## File: pages/_app.tsx

```tsx

import './tailwind-import.css';
import '../gui/scss/rogmor-style.scss';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```
## File: pages/api/ai-image.ts

```ts

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
req: NextApiRequest,
  res: NextApiResponse
) {

  if (!req.query?.seek) return res.status(404).json({msg:"- - Seek something? - -"});

  const key = process.env.GPT_3_KEY || '- - -';

  const headers = new Headers({
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  });

  fetch(
    "https://api.openai.com/v1/images/generations",
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        "prompt": req.query.seek,
        "n": +req.query.n ?? 1,
        "size": req.query.size || "256x256",
      })
    }
  )
  .then(r => r.json())
  .then(msg => res.status(200).json(msg))
  .catch(error => res.status(404).json(error))
}
```
## File: pages/api/ai.ts

```ts

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
req: NextApiRequest,
  res: NextApiResponse
) {

  if (!req.query?.seek) return res.status(404).json({msg:"- - Seek something? - -"});

  const key = process.env.GPT_3_KEY || '- - -';

  const headers = new Headers({
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  });

  fetch(
    "https://api.openai.com/v1/completions",
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        "model": "text-davinci-003",
        "prompt": req.query.seek,
        "max_tokens": 4000,
        "temperature": 1.0
      })
    }
  )
  .then(r => r.json())
  .then(msg => res.status(200).json(msg?.choices?.[0]?.text || '- - no answer - -'))
  .catch(error => res.status(404).json(error))
}
```
## File: pages/api/blog.js

```js

import { connectToDatabase } from "../../lib/mongodb";
// import sha256 from 'crypto-js/sha256';

const blogCollection = process.env.BLOG_COLLECTION

export default async function handler(
  req,
  res,
) {
  let { db } = await connectToDatabase();
  
  const {query:{msg, avatar, name} = {}} = req;

  if (msg && avatar && name) {
    await db.collection(blogCollection).insertOne({
      msg, 
      avatar, 
      name
    });
  }

  const result = await db.collection(blogCollection)
    .find({})
    .sort({$natural:-1})
    .limit(22)
    .toArray()
  ;
 
  const resultWithId = result
    .map(({_id, ...rest}) => ({id: _id.toString(), ...rest}))
  ;

  res.status(200).json(resultWithId);
}
```
## File: pages/api/graphql.ts

```ts

import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from '../../graphql/schema';
import { resolvers } from '../../graphql/resolvers';
import Cors from 'micro-cors';

const cors = Cors();

const apolloServer = new ApolloServer({typeDefs, resolvers});

const startServer = apolloServer.start();

export default cors( 
  async function handler(req, res) {

    if (req.method === 'OPTIONS') {
      res.end();
      return false;
    }

    await startServer;

    await apolloServer.createHandler({
      path: '/api/graphql'
    })(req, res);
  }
);

export const config = {
  api: {
    bodyParser: false
  }
};
```
## File: pages/api/mdb.ts

```ts

import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(
  req,
  res
) {
  let { db } = await connectToDatabase();
  
  const {query} = req;

  if (Object.keys(query).length) {
    await db.collection("second-hand").insertOne(query);
  }

  const result = await db.collection("second-hand")
    .find({})
    .toArray()
  ;
 
  const resultWithId = result
    .map(({_id, ...rest}) => ({id: _id.toString(), ...rest}))
    .reverse()
  ;

  res.status(200).json(resultWithId);
}
```
## File: pages/imagine.tsx

```tsx

import { useState } from 'react';
import { MobilFrame } from 'src/gui/MobilFrame';
import { select } from 'redux-saga/effects';
import Dream from 'dream-api';

export default () => {
  // get image from api
  const [image, setImage] = useState(null); // image url
  const [seek, setSeek] = useState(''); // image url
  const [n, setN] = useState(1); // image url 
  const [size, setSize] = useState('256x256'); // image url
  const [debug, trace] = useState({});

  const getImage = async () => {
    // const res = await fetch(`/api/ai-image?seek=${seek}&n=${n}&size=${size}`);
    // const json = await res.json();
    // trace(json);
    // const image = await Dream.generateImage(1, seek);
    const token = await Dream.signIn(['csakracsongor@gmail.com','ccsongor'])
    trace(token);
  };


  return (

      <div className='grid'>
        <input className="bg-black text-white m-2 text-center p-1 rounded-md border-sky-800 border" type="text" placeholder='prompt' value={seek} onChange={e => setSeek(e.target.value)} />
  
        <button className='bg-sky-800 hover:bg-sky-600 m-2 p-2 rounded-md' onClick={getImage} >Get Image</button>
        <pre>{JSON.stringify(debug,null,2)}</pre>
      </div>
  );
}
```
## File: pages/index.tsx

```tsx

import RogmorFrame from './RogmorFrame';
const Home = () => <RogmorFrame />;
export default Home;
```
## File: rpg/definitions.ts

```ts

import { Mob } from "./profession";

export interface Effect {
  id: string;
  type: string;
}
export interface Act {
  id: string;
  type: string;
  cooldown: number;
  tick: number;
  script: string;
}

export interface ActInstance {
  act: Act;
  actor: Mob;
  targetList: Mob[];
  timestamp?: number;
}

export interface Encounter {
  mobList: Mob[];
  actList: ActInstance[];
  targetList: Mob[];
  showTime: Effect[];
}

export type OrderOfSeed = [Mob, number];

export enum Outcome { ENDED };
export type OutcomeList = Outcome[];
```
## File: rpg/generateName.ts

```ts

import { rnd } from "./rpg";

export const ROGMOR_NAME_SOURCE = 'proedmorainowerialaenderomanulnivosudanterill';

export const generateName = (source = ROGMOR_NAME_SOURCE) => {
  const name:string = Array.from(
      {length:2 + rnd(3)}, 
      (s:number = rnd(source.length)) => source.slice(s, s + 2 + rnd(3))
    )
    .join('')
  ;
  const [capital, ...rest] = name.split('');
  return [capital.toUpperCase(),...rest].join('');
}
```
## File: rpg/limitedProfessionWithSkills.ts

```ts

import { ProfessionKey } from "./profession";

export const limitedProfessionWithSkills:ProfessionKey[] = [
  'chaosKnight',
  'bishop',
  'icelander',
  'ninja',
  'samurai',
  'merchant',
];

export const skillForProf:Partial<Record<ProfessionKey, string[]>> = {
  'chaosKnight': ['instant target-rnd hit-soul power-1; instant target-rnd hit-body power-1; instant target-rnd hit-aura power-1','fill-3 target hit-body power-4','fill-4 target-all hit-soul powe
r-2'],
  'bishop': ['instant target-ally heal; instant target-rnd hit-body', 'instant target hit-soul power-2','fill-3 tsa heal-2','fill-4 target-all-ally heal-3'],
  'icelander': ['instant target-all hit-body','fill-3 target-all hit-body power-2','fill-4 target-rnd hit-body power-4'],
  'ninja': ['instant target hit-body power-[2.4]','fill-4 target-all hit-body power-2','fill-2 target hit-body power-4'],
  'samurai': ['instant target hit-body power-2','fill-2 target hit-body power-4','fill-4 target-all hit-body power-2'],
  'merchant': ['instant target hit-aura; instant target-rnd hit-soul power-2','fill-2 target hit-aura power-2','fill-4 target-all hit-aura'],
};
```
## File: rpg/mobAndItemsDefinitions.js

```js

export const SEX = {
  male: 'male',
  female: 'female',
};

export const mobDefinitions = [
  {title: "", descript: "elf girl", sex: SEX.female },
  {title: "", descript: "box face", sex: SEX.male },
  {title: "", descript: "chaotic hair", sex: SEX.male },
  {title: "", descript: "bold face", sex: SEX.male },
  {title: "", descript: "fat face", sex: SEX.male },
  {title: "", descript: "charming knight", sex: SEX.male },
  {title: "", descript: "elf merchant", sex: SEX.male },
  {title: "", descript: "cow one", sex: SEX.female },
  {title: "", descript: "elf bard", sex: SEX.male },
  {title: "", descript: "elf girl with dark hair", sex: SEX.female },
  {title: "", descript: "young troll", sex: SEX.male },
  {title: "", descript: "horned inspector", sex: SEX.male },
  {title: "", descript: "citizen", sex: SEX.male },
  {title: "", descript: "blond hair", sex: SEX.female },
  {title: "", descript: "pig one", sex: SEX.male },
  {title: "", descript: "sqared orc", sex: SEX.male },
  {title: "", descript: "bar tender ogre", sex: SEX.male },
  {title: "", descript: "wizard", sex: SEX.male },
  {title: "", descript: "handsome human", sex: SEX.male },
  {title: "", descript: "neighbour", sex: SEX.male },
  {title: "", descript: "long hair", sex: SEX.male },
  {title: "", descript: "six horn", sex: SEX.male },
  {title: "", descript: "desert warrior", sex: SEX.male },
  {title: "", descript: "sad fighter", sex: SEX.male },
  {title: "", descript: "trader", sex: SEX.male },
  {title: "", descript: "paladin", sex: SEX.male },
  {title: "", descript: "knight girl", sex: SEX.female },
  {title: "", descript: "adventurer", sex: SEX.male },
  {title: "", descript: "psycho", sex: SEX.male },
];

export const itemDefinitions = [
  {title: "", descript: "saw knife"},
  {title: "", descript: "short sword"},
  {title: "", descript: "halberd"},
  {title: "", descript: "bow"},
  {title: "", descript: "iron shield"},
  {title: "", descript: "rounded shield"},
  {title: "", descript: "sword"},
  {title: "", descript: "dagger"},
  {title: "", descript: "spiked jerk"},
  {title: "", descript: "staff"},
  {title: "", descript: "bishop staff"},
  {title: "", descript: "axe"},
  {title: "", descript: "ring"},
  {title: "", descript: "bold blade"},
  {title: "", descript: "rapier"},
  {title: "", descript: "hammer"},
  {title: "", descript: "recoil bow"},
  {title: "", descript: "xiphos"},
  {title: "", descript: "harpoon"},
  {title: "", descript: "spear"},
  {title: "", descript: "great shield"},
  {title: "", descript: "knife"},
  {title: "", descript: "mallet"},
  {title: "", descript: "long sword"},
  {title: "", descript: "dual axe"},
  {title: "", descript: "sabre"},
  {title: "", descript: "knight sword"},
  {title: "", descript: "crossbow"},
  {title: "", descript: "claw"},
  {title: "", descript: "broad sword"},
  {title: "", descript: "barbarian axe"},
  {title: "", descript: "saw dagger"},
  {title: "", descript: "cup"},
  {title: "", descript: "material"},
  {title: "", descript: "chest"},
  {title: "", descript: "bag"},
  {title: "", descript: "coin"},
  {title: "", descript: "anvil"},
  {title: "", descript: "box"},
  {title: "", descript: "potion"},
  {title: "", descript: "stone"},
  {title: "", descript: "chicken"},
  {title: "", descript: "goblet"},
  {title: "", descript: "flag"},
  {title: "", descript: "point of interest"},
];
```
## File: rpg/profession.ts

```ts

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
```
## File: rpg/rogmorMap.ts

```ts

// y * 1000 + x
export const toCoord = ({x, y}) => y * 1000 + x;
export const abToCoord = (a, b) => b * 1000 + a;
export const coordTo = coord => ({x: coord % 1000 , y: coord / 1000 | 0 }); 
export const coordToStyle = coord => ({left: (coord % 1000) * 40, top: (coord / 1000 | 0) * 40}); 
export const dryLand:number[] = [8007,8008,8009,8010,7010,6010,5010,4010,3010,3009,2009,1009,1010,1011,1012,1013,1014,2014,2013,2012,2011,2010,3011,3012,3013,3014,3015,4011,4012,4013,5013,5014,40
14,4015,4016,4017,3017,3018,4018,4019,5019,6019,7019,8019,9019,9018,9017,9016,10016,11016,11015,11014,11013,12014,12015,10015,10014,9014,9015,10017,11017,8018,8017,7017,7018,6018,5018,5017,5016,5
015,6015,6016,6017,7016,7015,7014,7013,7012,7011,6011,5011,5012,6012,6013,6014,8015,8014,8013,8012,8011,9011,9012,10011,10010,10009,9009,9010,9008,9007,9006,10008,10007,11007,12007,13007,13008,12
006,13006,13005,13004,12004,12003,11003,11002,10002,9002,9001,8001,7001,7000,6001,6002,5002,4002,3002,3001,2001,1001,1002,2002,3003,2003,2004,3004,4004,5004,5003,4003,6003,6004,7004,7005,6005,800
5,9005,9004,10004,11004,11005,11006,12005,10005,10006,10003,9003,8003,7003,7002,8002,8004,8006,7006,7007,7008,7009,6009,5009,5008,6008,6007,5007,5006,4006,4007,4008,3006,2006,2007,10013,12013,120
12,12011,13011,13012,13010,12010,12009];
```
## File: rpg/rpg.ts

```ts

export const leveling = (level:number, mod:number = 0.5, pow:number = 4, madd:number = 2) => Math.round(
  mod * Math.pow(level, pow) + (madd * level)
);

export const rnd = (dice:number) => dice * Math.random() | 0;

export const dice = (roll:number) => rnd(roll - 1) + 1;

// export const improved = ( attribute = 1, percent = 0.2 ) => (attribute + (Math.random() * percent * attribute)) | 0;
export const improved = ( attribute:number = 1 ) => attribute * 1.15 | 0;

export const shuffle = () => Math.random() > 0.5 ? 1 : -1;

export const pickOne = (arr:any[]) => arr[rnd(arr.length)];

export const selectRandomPick = (element:any, index:number, arr:any[], pickIndex = Math.random() * arr.length | 0) => index === pickIndex;

export const uid = () => Math.random().toString(32).slice(-8);

export const amount = (n:number) => Array(n).fill(0).map((_, index) => index);
```
## File: rpg/singlePlayerTroll.ts

```ts

import { actionFactory, kebabToCamelCase } from 'react-troll';
import { increaseLevel, Mob } from './profession';
import { FlowAction } from './slash';

export const [getActionsLookup, action] = actionFactory(kebabToCamelCase);

export enum GameMode {
  ROLL_CHARACTER,
  ADVENTURE_ON_MAP,
}

export enum CombatOutcome {
  HERO_DIE,
  NPC_DIE,
  OVER_WITHOUT_LOSS,
}

export interface MainState {
  round : number;
  hero: Mob;
  focus: string;
  game: GameMode;
  entities: Record<string, Mob>;
  actionAnim: any;
  combatResult: any;
  damegeResult: any;
  encounterOutcome: any[];
  mobList: Mob[];
  flow?: FlowAction;
  isAutoFight: boolean;
  encounterResult: any;
}

export const initialState:MainState = {
  round : 0,
  hero: null,
  focus: null,
  game: GameMode.ROLL_CHARACTER,
  entities: {},
  actionAnim: null,
  combatResult: null,
  damegeResult: null,
  encounterOutcome: [],
  mobList: [],
  flow: null,
  isAutoFight: false,
  encounterResult: null,
};

export const 
  SET_HERO = action('set-hero'),
  MOD_HERO = action('mod-hero'),
  NEXT_ROUND = action('next-round'),
  HEART_BEAT = action('heart-beat'),
  USE_SKILL = action('use-skill'),
  SET_GAME_STATE = action('set-game-state'),
  SET_AUTO_FIGHT = action('set-auto-fight'),
  SETUP_ENTITIES = action('setup-entities'),
  MOD_ENTITI = action('mod-entiti'),
  ADD_ENTITI = action('add-entiti'),
  REMOVE_ENTITI = action('remove-entiti'),
  FOCUS_ON = action('focus-on'),
  FIGHT = action('fight'),
  SKILL = action('skill'),
  TALK  = action('talk'),
  ENCOUNTER_BEGIN  = action('encounter-begin'),
  ENCOUNTER_OUTCOME  = action('encounter-outcome'),
  ENCOUNTER_RESULT  = action('encounter-result'),
  LEVEL_UP_HERO  = action('level-up-hero'),
  USER_ACT = action("user-act"),
  PLAY_ACTION = action("play-action"),
  PLAY_OUTCOME = action("play-outcome"),
  ANIMATION_ENDED = action("animation-ended"),
  ANIMATION_SKIPPED = action("animation-skipped"),

  SET_MOB_LIST = action('set-mob-list'),
  PLAY_FLOW = action('play-flow'),

  PLAY_ACTION_ANIM = action('play-action-anim')
;

export const gameReducer = (state:MainState, {type, payload}):MainState => {
  switch (type) {
    case SET_HERO: return {...state, hero: payload};
    case MOD_HERO: return {...state, hero: payload(state.hero), combatResult:null};
    case NEXT_ROUND: return {...state, round: payload(state.round)};
    case SET_GAME_STATE: return {...state, game:payload};
    case SETUP_ENTITIES: return {...state, entities: payload};
    case SET_MOB_LIST: return {...state, mobList: payload};
    case MOD_ENTITI: {
      const {entities} = state;
      return entities[payload?.uid] 
        ? {...state, entities: {...entities, [payload?.uid]: payload} }
        : state;
    };
    case FOCUS_ON: return {...state, focus: payload};
    case PLAY_ACTION_ANIM: return {...state, actionAnim: payload};
    case PLAY_FLOW: return {...state, flow: payload};
    case ENCOUNTER_BEGIN: return {...state, encounterResult: null};
    case ENCOUNTER_RESULT: return {...state, encounterResult: payload};
    case SET_AUTO_FIGHT: return {...state, isAutoFight: payload};

    case LEVEL_UP_HERO: return {...state, hero: increaseLevel(1)(state.hero)}
    default: return state;
  }
};

const lostFocus = s => s

const checkIsLive = ({condition}:Mob) => (
     condition.staminaState > 0 
  && condition.focusState > 0 
  && condition.moraleState > 0
);
```
## File: rpg/slash.ts

```ts

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
```
## File: rpg/useEntitiReduce.js

```js

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
```
## File: rpg/useNoreboReducer.js

```js

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
```
## File: rpg/useUnitReducer.js

```js

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


```
## File: util/putAction.ts

```ts

import { put } from 'redux-saga/effects';
export const putAction = (type, payload) => put({type, payload});
```