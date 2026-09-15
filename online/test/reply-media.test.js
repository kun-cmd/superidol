import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read = file => readFileSync(new URL('../../'+file,import.meta.url),'utf8');
test('Maya attachment vanishes with its post and each click allows only one AI action',()=>{
  const nodes=new Map();let actions=0,pauses=0;const fetched=[];
  const video={pause(){pauses++;},play(){return Promise.resolve();}};
  function element(){return {open:false,disabled:false,listeners:{},innerHTML:'',
    after(n){nodes.set(n.id,n);},append(n){nodes.set(n.id,n);},remove(){nodes.delete(this.id);},
    showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();},
    addEventListener(n,f){this.listeners[n]=f;},querySelector(s){return s==='video'?video:this.closeButton??={};}};}
  nodes.set('threadTop',element());nodes.set('actionButtons',element());
  const c={document:{createElement:element,body:{append(n){nodes.set(n.id,n);}},getElementById(id){return nodes.get(id);}},
    fetch(url){fetched.push(url);return Promise.resolve({arrayBuffer(){return Promise.resolve();}});},window:{},state:{themeKey:'sevenSecondServe',phase:'action',userRole:'star',currentRole:'anti',topPlay:{role:'fan',facts:{fullClip:true},postId:1}},
    simulationMode:false,playAnimationActive:false,speechMarkup:({zh,en})=>zh+en,ROLES:{anti:{short:'Ben'}},aiTurn(){actions++;}};
  vm.runInNewContext(read('narrative-seven.js'),c);vm.runInNewContext(read('reply-media.js'),c);const api=c.window.SuperidolReplyMedia;
  api.sync();assert.equal(actions,0);const next=nodes.get('allowNextAI');next.onclick();next.onclick();assert.equal(actions,1);
  nodes.get('fullClipAttachment').onclick();assert.equal(nodes.get('fullClipDialog').open,true);
  c.state.topPlay={role:'anti',facts:{fullClip:true},postId:2};api.sync();assert.equal(nodes.get('fullClipDialog').open,false);assert.ok(pauses);assert.equal(nodes.has('fullClipAttachment'),false);
  c.state.topPlay={role:'fan',facts:{fullClip:false},postId:3};api.sync();assert.equal(nodes.has('fullClipAttachment'),false);
  c.state.topPlay={role:'fan',facts:{fullClip:true},postId:4};api.sync();assert.equal(nodes.has('fullClipAttachment'),true);
  c.state.topPlay={role:'anti',body:c.SuperidolNarrative.posts[0].anti.spread.speech,postId:5};api.sync();
  assert.equal(api.memeFor(c.state),'loading');assert.ok(nodes.has('memeAttachment'));
  nodes.get('memeAttachment').onclick();assert.equal(nodes.get('memeDialog').open,true);
  c.state.topPlay={role:'anti',body:c.SuperidolNarrative.combos[1].anti[2].speech,postId:6};api.sync();
  assert.equal(nodes.get('memeDialog').open,false);assert.equal(api.memeFor(c.state),'airplanes');
  c.state.topPlay={role:'anti',body:c.SuperidolNarrative.posts[0].anti.fact.speech,postId:7};api.sync();assert.equal(nodes.has('memeAttachment'),false);
  assert.equal(fetched.length,4);assert.ok(fetched.some(url=>url.endsWith('full-audition.mp4')));
  assert.ok(nodes.get('fullClipDialog').innerHTML.includes('media-back'));assert.ok(nodes.get('memeDialog').innerHTML.includes('>Back<'));
  c.window.__onlineActive=true;api.sync();assert.equal(nodes.has('allowNextAI'),false);
  const html=read('index.html'),queue=html.slice(html.indexOf('function queueAutomaticTurn(){'),html.indexOf('function objectiveChecks()'));
  assert.ok(!queue.includes('setTimeout'));
});
test('English settlement translates the complete intervention sentence',()=>{
  let src=read('i18n.js');src=src.slice(0,src.indexOf('  function skipped('))+'globalThis.translate=toEnglish;})();';
  const c={localStorage:{getItem(){return 'en';}}};vm.runInNewContext(src,c);
  for(const sentence of ['路人介入：消耗1枚；Maya保留标记，但下一话轮改由Ben领出。','消耗1枚；Maya保留标记，但下一话轮改由Ben领出。','闭环定调：核心基线暂无频道额外效果。 粉丝援护守住话轮，压力-1']){
    const text=c.translate(sentence);assert.ok(!/[\u3400-\u9fff]/.test(text),text);
  }
});
