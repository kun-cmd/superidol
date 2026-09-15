import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState, applyCommand, createPlayerView} from '../src/game.js';

const Speech=globalThis.SuperidolSpeech;
const Narrative=globalThis.SuperidolNarrative;
const card=(role,id,level=1,channel='fact')=>({id,role,originalAuthor:role,name:id,displayName:id,channel,level});
const pattern=(type,channel='fact',level=1)=>({type,channel,level});

test('the three second argument changes subject and tone across all three stages',()=>{
  for(const role of ['star','fan','anti'])for(const channel of ['fact','stance','spread']){
    const bodies=[];
    for(let issueIndex=0;issueIndex<3;issueIndex++){
      const state={themeKey:'sevenSecondServe',issueIndex,currentRole:role,narrative:{version:1,nextId:0,consumed:{},facts:{},posts:[]}};
      const selected=card(role,`${role}-${channel}-${issueIndex}`,1,channel);
      const resolved=Speech.resolve([selected],state,pattern('single',channel));
      assert.ok(Speech.cardFace(selected,state).zh);
      assert.ok(resolved.body.zh&&resolved.body.en);
      bodies.push(resolved.body.zh);
    }
    assert.equal(new Set(bodies).size,3);
  }
  assert.match(Narrative.posts[2].anti.stance.speech.zh,/本事|面子/);
  assert.match(Narrative.posts[2].star.stance.speech.zh,/我认/);
});

test('pair, run and loop each publish one authored response instead of concatenating cards',()=>{
  for(const type of ['pair','run','loop'])for(const role of ['star','fan','anti']){
    const state={themeKey:'sevenSecondServe',issueIndex:1,currentRole:role,narrative:{version:1,nextId:0,consumed:{},facts:{},posts:[]}};
    const cards=type==='loop'
      ? [card(role,'a',2,'fact'),card(role,'b',2,'stance'),card(role,'c',2,'spread')]
      : type==='run'
        ? [card(role,'a',1),card(role,'b',2),card(role,'c',3)]
        : [card(role,'a',2),card(role,'b',2)];
    const resolved=Speech.resolve(cards,state,pattern(type,type==='loop'?null:'fact',2));
    assert.ok(resolved.variantId?.startsWith(`combo:${type}`));
    assert.equal(new Set(Object.values(resolved.faces).map(face=>face.zh)).size,1);
    assert.ok(!resolved.body.zh.includes('\n'));
  }
});

test('selection is pure and a stage special is consumed only after a successful publish',()=>{
  const state={themeKey:'sevenSecondServe',issueIndex:0,currentRole:'fan',storyTime:'2026-01-01T00:00:00.000Z',narrative:{version:1,nextId:0,consumed:{},facts:{fullClipByFan:true},posts:[]}};
  const cards=[card('fan','f1',2),card('fan','f2',2)];
  const before=structuredClone(state.narrative);
  const first=Speech.resolve(cards,state,pattern('pair'));
  const second=Speech.resolve(cards,state,pattern('pair'));
  assert.equal(first.variantId,'fullclip-repeat');
  assert.equal(second.variantId,'fullclip-repeat');
  assert.deepEqual(state.narrative,before);
  Speech.recordPlay(state,cards,pattern('pair'),first,null);
  assert.equal(state.narrative.posts.length,1);
  assert.equal(state.narrative.consumed[0]['fullclip-repeat'],true);
  const after=Speech.resolve(cards,state,pattern('pair'));
  assert.notEqual(after.variantId,'fullclip-repeat');
  state.issueIndex=1;
  const nextStage=Speech.resolve(cards,state,pattern('pair'));
  assert.equal(nextStage.variantId,'fullclip-repeat');
});

test('the three channel response is also available only once in its stage',()=>{
  const state={themeKey:'sevenSecondServe',issueIndex:2,currentRole:'anti',storyTime:'2026-01-01T00:00:00.000Z',narrative:{version:1,nextId:0,consumed:{},facts:{},posts:[]}};
  const cards=[card('anti','e',3,'fact'),card('anti','p',3,'stance'),card('anti','r',3,'spread')];
  const loop=pattern('loop',null,3);
  const first=Speech.resolve(cards,state,loop);
  assert.equal(first.variantId,'combo:loop:anti:anti');
  Speech.recordPlay(state,cards,loop,first,null);
  const repeated=Speech.resolve(cards,state,loop);
  assert.equal(repeated.variantId,null);
  assert.equal(new Set(Object.values(repeated.faces).map(face=>face.zh)).size,3);
});

test('captured posts preserve the exact source and publish a new quoted response',()=>{
  const state=createInitialState();state.currentRole='star';state.heat=0;
  state.roles.star.hand=[card('star','source',1)];state.roles.anti.hand=[card('anti','counter',2)];
  applyCommand(state,'star',{type:'play',cardIds:['source']});
  const original=structuredClone(state.topPlay.body);
  applyCommand(state,'fan',{type:'pass'});
  applyCommand(state,'anti',{type:'play',cardIds:['counter'],captureAll:true});
  const captured=state.roles.anti.hand.find(c=>c.id==='source');
  assert.deepEqual(captured.capturedFrom.text,original);
  const restored=JSON.parse(JSON.stringify(state));Object.assign(restored,{issueIndex:1,topPlay:null,claimOwner:null,currentRole:'anti',heat:0,passes:0});
  assert.ok(JSON.stringify(createPlayerView(restored,'anti')).includes('capturedFrom'));
  applyCommand(restored,'anti',{type:'play',cardIds:['source']});
  assert.deepEqual(restored.topPlay.quoteSources[0].text,original);
  assert.ok(restored.topPlay.speech.zh.includes(restored.topPlay.quoteSources[0].excerpt.zh));
  assert.notDeepEqual(restored.topPlay.body,original);
  const replay=structuredClone(restored.topPlay.speech);
  applyCommand(restored,'star',{type:'pass'});applyCommand(restored,'fan',{type:'pass'});
  assert.deepEqual(restored.lastCompletedRound.speech,replay);
});

test('authored card faces and posts avoid disallowed post punctuation',()=>{
  const values=[];
  const walk=value=>{if(typeof value==='string')values.push(value);else if(value&&typeof value==='object')Object.values(value).forEach(walk);};
  [Narrative.posts,Narrative.combos,Narrative.variants,Narrative.support].forEach(walk);
  assert.deepEqual(values.filter(value=>/[:!()…]|\.\.\./.test(value)),[]);
});

test('selecting cards in the other events keeps their compact card faces',()=>{
  const state={themeKey:'voiceNote',issueIndex:0,currentRole:'anti'};
  const selected=card('anti','other',3,'stance');
  const compact=Speech.cardFace(selected,state);
  const resolved=Speech.resolve([selected],state,pattern('single','stance',3));
  assert.deepEqual(resolved.faces.other,compact);
  assert.notDeepEqual(resolved.body,compact);
});

test('every later event keeps channels distinct and publishes each combination as one response',()=>{
  for(const themeKey of ['voiceNote','comeback','roomTone'])for(const issueIndex of [0,1,2])for(const role of ['star','fan','anti']){
    const state={themeKey,issueIndex,currentRole:role};
    const channels=['fact','stance','spread'].map((channel,i)=>card(role,channel,i+1,channel));
    for(const lang of ['zh','en'])assert.equal(new Set(channels.map(c=>Speech.cardFace(c,state)[lang])).size,3);
    for(const type of ['pair','run','loop']){
      const cards=type==='loop'?channels:[1,2,3].slice(0,type==='pair'?2:3).map((level,i)=>card(role,`c${i}`,type==='pair'?2:level));
      const p=pattern(type,'fact',3), before=structuredClone(cards), resolved=Speech.resolve(cards,state,p);
      for(const lang of ['zh','en'])assert.equal(resolved.body[lang].includes('\n'),false);
      for(const c of cards)assert.deepEqual(resolved.faces[c.id],Speech.cardFace(c,state,p));
      assert.deepEqual(cards,before);
      assert.ok(Speech.freezeCards(cards,state,p).every(c=>JSON.stringify(c.speech)===JSON.stringify(resolved.body)));
    }
  }
});

test('advancing events discards the previous responses, captures and consumed specials',()=>{
  const state=createInitialState();
  state.narrative={version:1,nextId:9,consumed:{0:{'combo:run:anti:anti':true}},facts:{selfLaughReplayed:true},posts:[{postId:'old'}]};
  state.selectedIds=[state.roles.anti.hand[0].id];
  state.roles.anti.hand[0].capturedFrom={text:{zh:'旧帖',en:'Old post'}};
  state.topPlay={speech:{zh:'旧回应',en:'Old response'}};
  state.phase='ended';
  applyCommand(state,'anti',{type:'next_event'});
  assert.equal(state.themeKey,'voiceNote');
  assert.equal(state.topPlay,null);
  assert.equal(state.selectedIds,undefined); // Selection is client-only and must not survive on the server.
  assert.deepEqual(state.narrative,{version:1,nextId:0,consumed:{},facts:{},posts:[]});
  assert.ok(Object.values(state.roles).every(r=>r.hand.every(c=>!c.capturedFrom&&!c.speech)));
});
