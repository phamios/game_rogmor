import { take, fork, call, all, delay, select, cancel, race } from 'redux-saga/effects';
import { 
  ENCOUNTER_RESULT, ENCOUNTER_BEGIN, ENCOUNTER_OUTCOME, FOCUS_ON, 
  HEART_BEAT, MainState, PLAY_FLOW, SET_AUTO_FIGHT, 
  SET_MOB_LIST, USE_SKILL, LEVEL_UP_HERO } from '../rpg/singlePlayerTroll';
import { putAction } from '../util/putAction';
import { Mob, Team, ProfessionKey, mobFactory, traitsFactory } from '../rpg/profession';
import { improved, dice, pickOne, uid } from '../rpg/rpg';
import { isCapableToAction, slashImprovedParser, SlashObject, getSkillResult, skillReducer, actionOrder} from '../rpg/slash';
import { OrderOfSeed } from '../rpg/definitions'
import { skillForProf } from '../rpg/limitedProfessionWithSkills';

const slash = p => p;

const BATTLE_SPEED = 222;

export function * mainSaga() {
  yield all([
    fork(combatZoneSaga),
  ]);
};

const makeMob = (lvl:number, prof:ProfessionKey, team:Team = Team.GOOD, avatar) => mobFactory(
  `${prof} level:${lvl}`, avatar, 1, uid(), team, traitsFactory(lvl, prof)
);

const getSkillObject = (m:Mob):Partial<SlashObject>[][] => skillForProf[m.professionType].map(slashImprovedParser);

export function * combatZoneSaga() {
  while (true) {
    yield take(ENCOUNTER_BEGIN);

    const {hero}:MainState = yield select();

    const pickProf = () => pickOne(Object.keys(skillForProf))

    const testTeams = [
      [hero.level, pickProf(), Team.BAD, dice(100)],
      [hero.level, pickProf(), Team.BAD, dice(100)],
      [hero.level, pickProf(), Team.BAD, dice(100)],
      
      [hero.level, pickProf(), Team.GOOD, dice(100)],
      [hero.level, hero.professionType, Team.GOOD, hero.avatar],
      [hero.level, pickProf(), Team.GOOD, dice(100)],
    ]
    
    const combatSetupMobList = testTeams.map(([lvl, type, team, avatar]:[number, ProfessionKey, Team, number]) => 
      makeMob(lvl, type, team, avatar)
    );

    yield putAction(SET_MOB_LIST, combatSetupMobList)
    let mobList = combatSetupMobList;

    _CombatIsOver_: while (true) {
      const order = actionOrder(mobList);

      while (order.length) {
        const [actor]:OrderOfSeed = order.shift();
        yield putAction(PLAY_FLOW, {who: actor.uid});
        const skillList = getSkillObject(actor);

        // mob always use A1
        const {isAutoFight} = yield select();
        const subList = yield call(userChoiceTheSkillSaga, skillList, actor, isAutoFight)
        if (subList === null) break _CombatIsOver_;

        _NextActor_: while (true) {
          if (subList.length < 1) break _NextActor_;

          const [, command] = yield race([
            delay(BATTLE_SPEED),
            take([HEART_BEAT, ENCOUNTER_OUTCOME]),
          ])

          if (command?.type === ENCOUNTER_OUTCOME) break _CombatIsOver_;

          const skill = subList.shift();
          const [aiTargetting, skillResult] = getSkillResult(actor, skill, mobList);
          yield putAction(PLAY_FLOW, aiTargetting);
          yield putAction(PLAY_FLOW, skillResult);
          mobList = yield call(skillReducer, mobList, skillResult);
          yield putAction(SET_MOB_LIST, mobList);

          const isTwoTeam = mobList
            .filter(isCapableToAction)
            .map(mob => mob.team)
            .find((item, _, arr) => arr.indexOf(item) !== 0)
          ;

          if(!isTwoTeam) {
            yield putAction(FOCUS_ON, null);
            break _CombatIsOver_;
          }
        }
      }
    }
    yield call(calculateEncounterResultSaga, mobList);
  }
}

function * userChoiceTheSkillSaga(skillList:Partial<SlashObject>[][], actor:Mob, isAutoFight: boolean) {
  if (actor.team !== Team.GOOD || isAutoFight) return skillList.at(0)
  const {payload: skillIndex, type} = yield take([USE_SKILL, SET_AUTO_FIGHT, ENCOUNTER_OUTCOME]); // TODO really bad solution!
  return (type !== ENCOUNTER_OUTCOME)
    ? skillList.at(skillIndex)
    : null
  ;
}

function * calculateEncounterResultSaga(mobList:Mob[]) {
  // const {hero} = yield select();
  yield putAction(SET_MOB_LIST, []);
  const survivors = mobList.filter(isCapableToAction);
  const heroTeams = survivors.filter(mob => mob.team === Team.GOOD)

  yield putAction(
    ENCOUNTER_RESULT, 
    survivors.length - heroTeams.length
  );
  yield putAction(LEVEL_UP_HERO, 1);
}