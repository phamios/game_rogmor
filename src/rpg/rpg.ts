export const leveling = (level:number, mod:number = 0.5, pow:number = 4, madd:number = 2) => Math.round(
  mod * Math.pow(level, pow) + (madd * level)
);

export const rnd = (dice:number) => dice * Math.random() | 0;

export const dice = (roll:number) => rnd(roll - 1) + 1;

// export const improved = ( attribute = 1, percent = 0.2 ) => (attribute + (Math.random() * percent * attribute)) | 0;
export const improved = ( attribute:number = 1 ) => attribute * 1.15 | 0;

export const shuffle = () => Math.random() > 0.5 ? 1 : -1;

export const pickOne = (arr:any[]) => arr[rnd(arr.length)];

export const selectRandomPick = (element:any, index:number, arr:any[], pickIndex = Math.random() * arr.length | 0) => index === pickIndex;

export const uid = () => Math.random().toString(32).slice(-8);

export const amount = (n:number) => Array(n).fill(0).map((_, index) => index);
