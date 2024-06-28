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
