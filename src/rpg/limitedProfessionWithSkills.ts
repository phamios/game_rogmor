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
  'chaosKnight': ['instant target-rnd hit-soul power-1; instant target-rnd hit-body power-1; instant target-rnd hit-aura power-1','fill-3 target hit-body power-4','fill-4 target-all hit-soul power-2'],
  'bishop': ['instant target-ally heal; instant target-rnd hit-body', 'instant target hit-soul power-2','fill-3 tsa heal-2','fill-4 target-all-ally heal-3'],
  'icelander': ['instant target-all hit-body','fill-3 target-all hit-body power-2','fill-4 target-rnd hit-body power-4'],
  'ninja': ['instant target hit-body power-[2.4]','fill-4 target-all hit-body power-2','fill-2 target hit-body power-4'],
  'samurai': ['instant target hit-body power-2','fill-2 target hit-body power-4','fill-4 target-all hit-body power-2'],
  'merchant': ['instant target hit-aura; instant target-rnd hit-soul power-2','fill-2 target hit-aura power-2','fill-4 target-all hit-aura'],
};