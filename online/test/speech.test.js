import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState, applyCommand, getLegalPlayOptions, createPlayerView} from '../src/game.js';
const Speech=globalThis.SuperidolSpeech;
test('all authored contexts have distinct bilingual ranks; pairs publish one sentence',()=>{
 for(const themeKey of Object.keys(Speech.topics))for(let issueIndex=0;issueIndex<3;issueIndex++)for(const role of ['star','fan','anti'])for(const channel of ['fact','stance','spread']){
  const context={themeKey,issueIndex};const texts=[];
  for(let level=1;level<=5;level++){
   const card={id:'a',role,originalAuthor:role,channel,level};const pattern={type:'pair',channel,level};
   const text=Speech.cardSpeech(card,context);assert.ok(text.zh&&text.en);texts.push(text);
   assert.deepEqual(Speech.compose([card,{...card,id:'b'}],context,pattern),text);
  }
  assert.equal(new Set(texts.map(t=>t.zh)).size,5);assert.equal(new Set(texts.map(t=>t.en)).size,5);
 }
});
test('captured public speech survives serialization, private view and a new topic; replay settles with the exact new speech',()=>{
 const state=createInitialState();state.currentRole='star';state.heat=0;
 const card=(role,id,level)=>({id,role,originalAuthor:role,name:id,displayName:id,channel:'fact',level});
 state.roles.star.hand=[card('star','source',1)];state.roles.anti.hand=[card('anti','counter',2)];
 applyCommand(state,'star',{type:'play',cardIds:['source']});
 const original=structuredClone(state.topPlay.speech);
 applyCommand(state,'fan',{type:'pass'});
 applyCommand(state,'anti',{type:'play',cardIds:['counter'],captureAll:true});
 const captured=state.roles.anti.hand.find(c=>c.id==='source');assert.deepEqual(captured.capturedFrom.text,original);
 assert.ok(original.zh.includes(captured.capturedFrom.excerpt.zh));assert.ok(original.en.includes(captured.capturedFrom.excerpt.en));
 const restored=JSON.parse(JSON.stringify(state));restored.issueIndex=1;restored.topPlay=null;restored.claimOwner=null;restored.currentRole='anti';restored.heat=0;restored.passes=0;
 assert.ok(JSON.stringify(createPlayerView(restored,'anti')).includes('capturedFrom'));
 applyCommand(restored,'anti',{type:'play',cardIds:['source']});
 assert.ok(restored.topPlay.speech.zh.includes(captured.capturedFrom.excerpt.zh));assert.ok(restored.topPlay.speech.zh.includes('Haru自己说过'));
 const replay=structuredClone(restored.topPlay.speech);
 applyCommand(restored,'star',{type:'pass'});applyCommand(restored,'fan',{type:'pass'});
 assert.deepEqual(restored.lastCompletedRound.speech,replay);
});
