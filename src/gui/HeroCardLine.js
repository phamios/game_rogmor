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