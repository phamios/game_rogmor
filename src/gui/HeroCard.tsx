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