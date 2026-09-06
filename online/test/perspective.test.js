import test from 'node:test';
import assert from 'node:assert/strict';
import {ORDER,ISSUES,createGame,seeded,pattern,beats,act,advance,exchanges,chooseAI,progress,legalPlays} from '../../perspective-rules.mjs';

const card=(id,channel,level)=>({id,channel,level});
function fixture(){const g=createGame(seeded(7));g.hands={anti:[card('a1','fact',1),card('a5','fact',5)],star:[card('s2','fact',2),card('s4','stance',4)],fan:[card('f3','fact',3),card('f4','spread',4)]};g.undealt=[];return g;}

test('twelve private cards each, three undealt; original four patterns and cross-channel responses',()=>{
  const g=createGame(seeded(1));assert.deepEqual(ORDER.map(r=>g.hands[r].length),[12,12,12]);assert.equal(g.undealt.length,3);
  for(const role of ORDER)for(const channel of ['fact','stance','spread'])assert.ok(g.hands[role].filter(c=>c.channel===channel).length>=2);
  const pair=pattern([card('p','fact',2),card('q','fact',2)]);assert.equal(pair.type,'pair');
  assert.ok(beats(pattern([card('p','spread',3),card('q','spread',3)]),pair));
  const loop=pattern(['fact','stance','spread'].map((c,i)=>card(i,c,1)));assert.ok(beats(loop,pair));
  assert.equal(beats(pattern([card('p','fact',5)]),loop),false);
  assert.equal(pattern([card('p','fact',1),card('q','fact',2),card('r','fact',3)]).type,'run');
});

test('first published choice locks; own narrative is not substituted after another play',()=>{
  const g=fixture();act(g,'anti',{type:'play',ids:['a1'],choice:1});
  act(g,'star',{type:'pass'});act(g,'fan',{type:'pass'});
  assert.equal(g.markers.anti,1);assert.equal(g.phase,'play');
  act(g,'anti',{type:'play',ids:['a5'],choice:0});assert.equal(g.top.claim.text,ISSUES[0].claims.anti[1].text);
  act(g,'star',{type:'pass'});act(g,'fan',{type:'pass'});
  assert.equal(g.phase,'between');assert.equal(g.outcomes[0].claim.text,ISSUES[0].claims.anti[1].text);
  const hands=JSON.stringify(g.hands);advance(g);assert.equal(JSON.stringify(g.hands),hands);assert.deepEqual(g.choices,{});
});

test('normal pass can re-enter after a new response',()=>{
  const g=fixture();act(g,'anti',{type:'play',ids:['a1'],choice:0});act(g,'star',{type:'pass'});
  act(g,'fan',{type:'play',ids:['f3'],choice:1});act(g,'anti',{type:'pass'});
  assert.equal(g.turn,'star');assert.ok(legalPlays(g).some(p=>p.ids.includes('s4')));
});

test('concession trades only a lower own public card, spends high card, and locks out re-entry',()=>{
  const g=fixture();g.discard.push({...card('old','stance',1),by:'star'}, {...card('other','spread',1),by:'anti'});
  act(g,'anti',{type:'play',ids:['a1'],choice:0});
  assert.ok(exchanges(g).some(t=>t.take==='old'));assert.ok(!exchanges(g).some(t=>['a1','other'].includes(t.take)));
  act(g,'star',{type:'exchange',pay:'s2',take:'old'});
  assert.equal(g.spent[0].id,'s2');assert.ok(!g.discard.some(c=>c.id==='old'));assert.equal(g.hands.star.filter(c=>c.id==='old').length,1);
  act(g,'fan',{type:'play',ids:['f3'],choice:0});assert.equal(g.turn,'anti');
  act(g,'anti',{type:'play',ids:['a5'],choice:0});assert.equal(g.turn,'fan'); // Star is skipped despite holding a legal card earlier.
  assert.equal(exchanges(g,'star').length,0);
  act(g,'fan',{type:'pass'});assert.equal(g.markers.anti,1);assert.deepEqual(g.conceded,[]);
});

test('unauthorized and malformed actions do not mutate the state',()=>{
  const g=fixture(),before=JSON.stringify(g);
  for(const [role,command] of [['fan',{type:'play',ids:['f3'],choice:0}],['anti',{type:'play',ids:['a1','a1'],choice:0}],['anti',{type:'play',ids:['a1'],choice:5}],['anti',{type:'exchange',pay:'a5',take:'s2'}]])assert.throws(()=>act(g,role,command));
  assert.equal(JSON.stringify(g),before);
});

test('public content advances another faction, but cannot replace personal authorship; Ben needs a second topic',()=>{
  const g=fixture();g.outcomes=[{issue:0,owner:'anti',claim:ISSUES[0].claims.anti[0]}];
  assert.equal(progress(g).anti.won,false);
  g.outcomes.push({issue:1,owner:'fan',claim:ISSUES[1].claims.fan[1]});
  assert.equal(progress(g).anti.won,true);assert.equal(progress(g).fan.won,false);
  g.outcomes.push({issue:2,owner:'star',claim:ISSUES[2].claims.star[0]});
  assert.ok(ORDER.every(r=>progress(g)[r].won));
  g.outcomes[2]={issue:2,owner:'fan',claim:ISSUES[2].claims.fan[0]};assert.equal(progress(g).star.won,false);
});

test('card conservation, legal bot actions, and finite termination across seeded games',()=>{
  let complete=0,voluntary=0,trades=0;const wins={star:0,fan:0,anti:0};
  for(let seed=1;seed<=300;seed++){
    const g=createGame(seeded(seed));let steps=0;
    while(g.phase!=='ended'&&steps++<250){
      if(g.phase==='between'){advance(g);continue;}
      const action=chooseAI(g);if(action.type==='pass'&&legalPlays(g).length)voluntary++;if(action.type==='exchange')trades++;
      act(g,g.turn,action);
      const all=[...ORDER.flatMap(r=>g.hands[r]),...g.discard,...g.spent,...g.undealt];
      assert.equal(all.length,39);assert.equal(new Set(all.map(c=>c.id)).size,39);
    }
    assert.equal(g.phase,'ended',`seed ${seed} did not terminate`);if(g.outcomes.length===3)complete++;
    for(const r of ORDER)if(progress(g)[r].won)wins[r]++;
  }
  console.log(JSON.stringify({games:300,completedTopics:complete,voluntaryPasses:voluntary,concessionTrades:trades,wins}));
  assert.ok(complete>270,'too many matches run out of cards before the three topics settle');
  assert.ok(voluntary>0);assert.ok(trades>0);
});
