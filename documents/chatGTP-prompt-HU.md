# ChatGPT használata komplex fantasy történetek és program tartalmak létrehozására

*[borítót a DALL-E lab készítette](https://labs.openai.com/editor)*

## TLDR;
Bemutatom, hogyan lehet rövid fantasy történetet létrehozni eredeti karakternevekkel a ChatGPT sorozatos kéréseinek (prompt) használatával. Ez a folyamat használható tetszőleges (főleg program) tartalmak létrehozására is. A lényeg, hogy: több kis kérdésre adott válasz egy összetett eredményt eredményez.
*- ChatGPT fetch funkció a poszt végén JS-ben -*

![write a story](https://media3.giphy.com/media/kvrgDeHIghjWY7tpi1/giphy.gif?cid=ecf05e47qbfp1rta1uw0yy4bad4br3by347zz5qs2p2f4et3&rid=giphy.gif&ct=g)

Amikor próbáltam igazán véletlenszerű neveket generálni a chatGPT-vel, - mint az lejebb látható - gyorsan oda vezettett, hogy létrehoztam vele egy új történetet. A kezdő probléma az volt, hogy ha csak fantasy neveket kértem tőle akkor gyakran a legismertebb filmekből dobott fel neveket.
*a chatGPT-nek feltett kérdéseket angolul hagyom, de magyarul is ugyanúgy fel lehet tenni neki a kérdéseket, tulajdonképpen tetszőleges nyelven*

*[chatGPT](https://chat.openai.com/chat)*

## Cselekmény: főszereplők generálása

Ez a kérés már sokkal jobb eredményt adott, mert megadott stílusú neveket kértem tőle:

> 🥸 *Give me 32 fantasy names mixed by (Nordic: 25%, African: 25%, Saxon: 35%, left Old Persian)*

Arngrim, Ashafta, Brekkr, Aricius, Cynvelin, Dagna, Eirika, Eldred, Falkor, Gudruna, Haldor, Imani, Jorunn, Kianus, Leifr, Luminata, Nefertiti, Osvaldr, Penda, Ragnar, Safiya, Thalia, Ulfr, Varda, Wilfred, Xanthe, Yaa, Zaria, Arash, Bassir, Caius, Dagnus

De javítottam rajta, és még kereszt és vezetékneveket is kértem tőle:

> 🥸 *Generate again, but each name have sure and fore name too*

Arngrim Odinson, Ashafta Neferkare, Brekkr Ulfdottir, ...

A következő iteráció alkalmával fantasy "szakmákat" is rendeltettem vele a nevek mellé.
> 🥸 *Generat again extend fantasy class*

- 1) Arngrim Odinson, Warrior
- 2) Ashafta Neferkare, Mage
- 3) Brekkr Ulfdottir, Bard
- 4) Aricius Kwasi, Rogue
- 5) Cynvelin Astrid, Cleric
- 6) Dagna Jorunnson, Paladin
- 7) Eirika Leifsdottir, Druid
- 8) Eldred Luminata, Sorcerer
- 9) Falkor Thalia, Ranger
- 10) Gudruna Osvaldrson, Necromancer
....

( *A fordítást a gép generálta részeknél a chatGPT csinálta, olyan amilyen* )

... végül még hozzá csaptam egy becenevet és a karakterek 1 mondatos történetét:
> 🥸 *Generate only 7 but extended with nickname and 1 sentence of story about that character*

- 1) Arngrim Odinson, "A Villámisten", Harcos - Arngrim hírneve félelmetes harcosként előzi meg, és az ő bátorsága és gyors gondolkodása a csatában ismert.
- 2) Ashafta Neferkare, "A Napkirálynő", Varázsló - Ashafta varázslómestere és állhatatossága a jogosság iránt tette őt szeretett vezetővé a nép körében.
- 3) Brekkr Ulfdottir, "A Törhetetlen", Bard - Brekkr zene hatalma, hogy mozgassa még a legkeményebb szíveket, de a harcban is félelmetes, kétkezes baltájával.
- 4) Aricius Kwasi, "A Árnyékvadász", Rogue - Aricius láthatatlan és hallhatatlan mozog, támadva, amikor ellenségei legkevésbé várják.
- 5) Cynvelin Astrid, "A Fényhozó", Lélekgyógyász - Cynvelin hite a istenség iránt megingathatatlan, és nagyon sokat tesz az ártatlanokért és a gonosz legyőzéséért.
- 6) Dagna Jorunnson, "A Tűzgyújtó", Paladin - Dagna igazság védelmezője és hű követője istenének, és semmit sem fog eltekinteni az ártatlanok védelme érdekében és a gonosz legyőzése érdekében.
- 7) Eirika Leifsdottir, "A Vadászat vadásza", Druid - Eirika a természettel egy, képes hívni a elemek és a erdő állatai erejét, hogy parancsoljon nekik.

## A történet megírása

Ez a folymat nagy egyszeű, itt is a `kis lépések` módszerét használom.

Az első kérésemet mint rendező fogalmaztam meg, kiválasztottam két szereplőt a lehettséges 7 közül és kértem közöttük egy párbeszédet. Látványosan a chatGPT szépen kitalálta a helyszínt meg minden mást. ( *angolul sokkal jobbnak tűnt a történet* )
> 🥸 *Give me interaction between Kwasi and Dagna*

Kwasi és Dagna egy társalgóban találkozik, mindketten jó ételt és meleg italt keresnek egy hosszú utazás után. Kwasi sarkában ül, magában tartja magát és figyeli a többi vendéget, míg Dagna a pultnál áll, beszélget a pincérrel és élvezi a sörének egy poharát.

Az éjszaka haladtával Kwasi hallja, hogy Dagna beszél egy csoport banditáról, akik egy közeli falut terrorizálnak, és azzal a céllal van, hogy legyőzze őket. Érdeklődve, odamegy és bemutatkozik.

Kwasi: "Bocsánat, de nem tudtam nem hallgatni a beszélgetést. Lehet, hogy van néhány információm, amely hasznos lehet számodra."

Dagna: "Oh? És milyen információk lennének azok?"

Kwasi: "Egy ideje nyomon követem ezeket a banditákat. Ismerem a rejtekhelyüket, és megmutathatom neked az utat."

Dagna felhúzza a szemöldökét, gyanakodva Kwasi motivációira. De a megfontolás után dönt, hogy elfogadja ajánlatát.

Dagna: "Rendben van. Aztán menj elöl. Szükségem van minden segítségre, amit kaphatok."

Kwasi bólint, és a két őket az éjszakába indulnak, készen a banditák igazságérvényesítésére.

Tesztelve azt, hogy mennyire is emlékszik a chatGPT arra ammiról beszéltünk, tovább szóvettem vele a történet fonalát: Dagna és Kwasi találkozik Brekkr-el.
> 🥸 *Keep going the story when meet Brekkr*

Kwasi és Dagna az alvilág rejtekhelyére vezető úton egyedülálló alakot találnak az úton. Az alak Brekkr, a közeli faluból származó rettegett harcos, aki ugyanazt a bandahadat követi.

Kwasi: "Várjunk, ki vagy te?"

Brekkr: "Én vagyok Brekkr. És ti ketten nem vagytok az egyetlenek, akik ezeket a banditákat üldözik. Mit akartok tőlük?"

Dagna: "Felbéreltek minket, hogy bíróság elé állítsuk őket a falunkban elkövetett bűneik miatt. És te?"

Brekkr: "Van saját okom, hogy őket keressem. De nem fordulok el tőlük, ha plusz segítség jön. Ünnepezzünk együtt, és együtt végleg legyőzzük őket."

Kwasi és Dagna egymásra néznek, mindkettőjüknek tiszteletet és félelmet kelt a előttük álló harcosban. Mindketten egyetértenek abban, hogy együtt dolgozzanak Brekkerrel, és egy formidábil hármas formálódjon.

Ahogy tovább mennek az utjukon, beszélgetnek és megosztják történeteiket, egymásról többet megtudva. Felveszik a kihívásokat és legyőzik az akadályokat, fejlesztik képességeiket és jól működő géppé válnak.

Végül elérnek a banditák rejtekhelyére, készen a végső csata előtt. A harc intenzív, de végül győztesek maradnak. A banditák bíróság elé állításra kerülnek, és Kwasi, Dagna és Brekkr a falu megmentő hősei lesznek.

Végül próbáltam egy csavart belevinni a történetbe, a hősök felfedezik, hogy a jóságos pap a banditák vezére:
> 🥸 *Finally the party will found the leader of bandits was Astrid, which was change the plans*

Kwasi, Dagna és Brekkr végül megtalálják a banditák vezetőjét, és megdöbbennek, amikor felfedezik, hogy ez Astrid, egy korábbi társaik volt az előző kalandjaikon.

Astrid: "Ha! Soha nem gondoltam volna, hogy látlak titeket hárman itt. Mi hozott ide?"

Brekkr: "Eljöttünk, hogy igazságot szolgáltassunk, Astrid. Te és a banditáid túl sok rosszat okoztak a falvainkban."

Astrid: "Igazság? Milyen naiv vagy, Brekkr. Ebben a világban csak hatalom van, és azok, akiknek van. És most én rendelkezem vele, ezzel a hű követőknek."

Kwasi: "Miért, Astrid? Mi történt veled? Barátok voltunk."

Astrid: "Barátok? Csak kényelmes szövetségesei voltatok, semmi több. Amikor láttam az alkalmat a hatalom és erőforrások összegyűjtésére, megragadtam. És most minden van, amit akarok."

Dagna: "Nem hagyhatjuk, hogy folytasd ezt. Nem helyes."

Astrid: "Helyes vagy helytelen, nem számít. Rendelkezem egy követőknek álló sereggel, és ti hárman nem vagytok ellenfelünk. Adjátok meg magatokat most, vagy enyhítsétek a következményeket."

A három hős elszánt tekintettel néz egymásra, tudva, hogy nem hagyhatják, hogy Astrid megússza bűneit. Egy kemény harc alakul ki, mindkét oldal adja a legjobbját. Végül a hősök győzedelmeskednek, elfogják Astridet, és véget vetnek terrorjának.

De a győzelem édes-keserű, amikor rájönnek Astrid korrupciójának és az általa befutott útnak a valós mértékére. Biztosítják magukat arról, hogy igazságot szolgáltassanak, és dolgoznak a megsértett falvak békéjének helyreállításán. És bár sosem fogják teljesen elfelejteni volt barátjuk csalását, folytatják utazásukat, mindig új kalandokat keresve.

![the end](https://media3.giphy.com/media/rPuuCF2SCiRl6/giphy.gif?cid=ecf05e47xrvdhh9fbcej7nnpjpgb20u2nxqllf2m8bqc7q77&rid=giphy.gif&ct=g)

## A rendezői zárszó

Érdekes, hogy ebben a kis történetben is végül a jó és a rossz küzdelméről ír az AI. Tulajdonképpen csak az eddig megírt könyvek és novelláknak valamiféle szintézise ez. Igazából nem gondolja át a történetet. De gondolom (még nem teszteltem), de ha összefüggés rendszert is leírunk neki a történet elején, mint rendező akkor sokkal specifikáltabb eredményt kapunk.

## Ráadás

Ha szeretnéd programból szeretnéd használni a ChatGPT-t JavaScript-el, próbáld ki ezt a egyszerű scriptet: 

```javascript
// get from :: https://platform.openai.com/account/api-keys
const getHeader = key => new Headers({
  'Authorization': `Bearer ${key}`, 
  'Content-Type': 'application/json'
});
const getAI = (headers=getHeader(prompt()), view=console.log) => (seek) => fetch(
  "https://api.openai.com/v1/completions",
  {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: seek,
      max_tokens: 500,
      temperature: 0.5
    })
  }
)
  .then(res => res.json())
  .then(res => res.choices[0].text)
  .then(view)
  .catch(console.error)
;
```

Mielőtt legenerálnád a kérdező funkciót, be kell szerezned az openAI kulcsát, amit kérni fog tőled a függvény.
[openai get api keys](https://platform.openai.com/account/api-keys)

```javascript
let ai = getAI()
```

... Ha ez megvan akkor utána már tetszőleges kérdést feltehetsz neki a chrome dev-tools konzoljában, például:

```
ai('generate 10 names sure and last name too in JSON format')
```