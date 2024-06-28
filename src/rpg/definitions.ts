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
