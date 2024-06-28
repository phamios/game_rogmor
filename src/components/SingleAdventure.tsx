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