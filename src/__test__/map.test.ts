import { generateName } from '../rpg/generateName';
import { mobFactory, professionList, Team, traitsFactory, Mob } from '../rpg/profession';
import { shuffle, uid, pickOne, rnd } from '../rpg/rpg';
import { dryLand } from '../rpg/rogmorMap';

test ('', () => {
  expect (
    dryLand
  ).toMatchSnapshot();
});

test('Random populate NPC on map', () => {
    const area = [...dryLand].sort(shuffle);
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
    expect(pickOne(entitiesArray)?.name?.length).toBeGreaterThan(2);
  }
);
