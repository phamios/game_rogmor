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
    <figure className={`flex gap-0 w-32 h-64 rounded-3xl justify-center flex-wrap items-center shadow-lg ${tw} ${flow?.who === mob.uid ? "brightness-150" : ""}`} style={{opacity: isOut ? ".2" : "1"}}>
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