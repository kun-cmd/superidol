import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createInitialState, applyCommand, binaryVictoryResults, createPlayerView, chooseBotCommand} from '../src/game.js';
const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function runAutomatedSimulations')).replace('    setup();','');
const solo=vm.createContext({setTimeout,clearTimeout,console,URLSearchParams,location:{search:''},window:{},document:{}});
vm.runInContext(fs.readFileSync(new URL('../../speech.js',import.meta.url),'utf8'),solo);vm.runInContext(script,solo);
const card=(id,role,level=1,channel='fact')=>({id,role,originalAuthor:role,name:id,channel,level});
test('solo and online agree on every legal end-state, including pressure 3 and no triple win',()=>{
 for(let star=0;star<=3;star++)for(let fan=0;fan<=3-star;fan++)for(let anti=0;anti<=3-star-fan;anti++)for(let pressure=0;pressure<=4;pressure++)for(const silenced of [false,true]){
  if(pressure<=2&&silenced||pressure===4&&!silenced)continue;
  const seats=Object.entries({star,fan,anti}).flatMap(([owner,n])=>Array.from({length:n},()=>({owner})));
  const state=createInitialState();Object.assign(state,{seats,pressure,silenced});
  solo.fixture=state;const local=vm.runInContext('state=fixture; binaryVictoryResults()',solo);const remote=binaryVictoryResults(state);
  const expected={star:star>=2&&pressure<=2,fan:fan>=1&&star+fan>=2&&!silenced,anti:anti>=1&&(star<=1||pressure>=3)};
  for(const role of ['star','fan','anti']){assert.equal(remote[role].won,expected[role]);assert.equal(local[role].won,expected[role]);}
  assert.ok(Object.values(expected).filter(Boolean).length<=2);
 }
});
test('support consumes Maya cards, locks mode, survives serialization and needs two wins to rescue at 4',()=>{
 let state=createInitialState();state.currentRole='fan';state.pressure=4;state.silenced=true;state.heat=0;
 state.roles.anti.hand=[card('a2','anti',2)];state.roles.fan.hand=[card('f1','fan'),card('f2','fan',2),card('f3','fan',3,'stance')];
 applyCommand(state,'fan',{type:'play',cardIds:['f1'],fanVoice:'star'});
 assert.equal(state.roles.fan.hand.length,2);assert.equal(state.pressure,4);assert.equal(state.topPlay.role,'fan');assert.equal(state.claimOwner,'star');
 assert.ok(state.topPlay.speech.en.includes('Haru'));
 applyCommand(state,'anti',{type:'play',cardIds:[state.roles.anti.hand.find(c=>c.level>=2).id]});
 applyCommand(state,'star',{type:'pass'});
 const snapshot=JSON.stringify(state);
 assert.throws(()=>applyCommand(state,'fan',{type:'play',cardIds:['f3'],fanVoice:'fan'}),/模式已锁定/);
 assert.equal(JSON.stringify(state),snapshot);
 // Continue the same support Round from a serializable public top reply.
 state.topPlay=null;state.claimOwner=null;state.passes=0;
 applyCommand(state,'fan',{type:'play',cardIds:['f2'],fanVoice:'star'});
 state=JSON.parse(JSON.stringify(state));assert.equal(createPlayerView(state,'fan').fanVoiceChoice,'star');
 applyCommand(state,'anti',{type:'pass'});applyCommand(state,'star',{type:'pass'});
 assert.equal(state.pressure,3);assert.equal(state.silenced,true);assert.equal(state.issueMarkers.star,1);assert.equal(state.supportedThisRound,false);
 state.currentRole='fan';applyCommand(state,'fan',{type:'continue'});
 applyCommand(state,'fan',{type:'play',cardIds:['f3'],fanVoice:'star'});
 applyCommand(state,'anti',{type:'pass'});applyCommand(state,'star',{type:'pass'});
 assert.equal(state.pressure,2);assert.equal(state.silenced,false);assert.equal(state.seats[0].owner,'star');
});
test('own interpretation still adds pressure; losing support does not relieve it',()=>{
 const state=createInitialState();state.currentRole='fan';state.heat=0;state.roles.fan.hand=[card('f','fan')];state.roles.anti.hand=[card('a','anti',2)];
 applyCommand(state,'fan',{type:'play',cardIds:['f'],fanVoice:'fan'});assert.equal(state.pressure,1);assert.equal(state.claimOwner,'fan');
 const support=createInitialState();support.currentRole='fan';support.pressure=2;support.heat=0;support.roles.fan.hand=[card('f','fan')];support.roles.anti.hand=[card('a','anti',2)];
 applyCommand(support,'fan',{type:'play',cardIds:['f'],fanVoice:'star'});applyCommand(support,'anti',{type:'play',cardIds:['a']});applyCommand(support,'star',{type:'pass'});applyCommand(support,'fan',{type:'pass'});
 assert.equal(support.pressure,3);assert.equal(support.supportedThisRound,false);
});
test('online Haru bot chooses the final Position relief and Maya bot can rescue with Evidence',()=>{
 const state=createInitialState();state.currentRole='star';state.heat=0;state.pressure=3;state.seats=[{owner:'star'},{owner:'anti'}];state.issueIndex=2;state.issueMarkers.star=1;
 state.skills.star.status='lost';state.roles.star.hand=[card('fact','star',2),card('stance','star',2,'stance')];
 assert.deepEqual(chooseBotCommand(state,'star').cardIds,['stance']);
 const fan=createInitialState();fan.currentRole='fan';fan.pressure=4;fan.silenced=true;fan.roles.fan.hand=[card('help','fan')];
 assert.equal(chooseBotCommand(fan,'fan').fanVoice,'star');
});
