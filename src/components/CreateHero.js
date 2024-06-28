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
    {hero && (<section>{heroSkillDescription.map((descript, index) => <p className='m-2' key={index}><span className="text-sky-500">{["Alfa","Beta","Gamma","Delta","Epsilon"][index]}: </span>{descript}</p>)}</section>)}
    {hero && (
      <section className="my-4">
        <figure className="face-sprite absolute left-8 z-20 scale-150" data-face={hero.avatar} />
        <button className="bg-sky-800 hover:bg-sky-600 p-2 text-lg rounded-lg w-full my-4" onClick={handleLetsAdventure}>Let adventure!</button>
      </section>
      )}
  </>);
}