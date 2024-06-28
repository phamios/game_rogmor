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