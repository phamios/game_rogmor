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