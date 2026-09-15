import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('opening post supports every role, repeat viewing, local pause and online updates', () => {
  const nodes = new Map(); let resumed = 0, paused = 0;
  function element() { return {open:false, hidden:false, innerHTML:'', listeners:{},
    after(){}, querySelector(){return {pause(){paused++;}};},
    showModal(){this.open=true;}, close(){this.open=false;this.listeners.close?.();},
    addEventListener(name, fn){this.listeners[name]=fn;}}; }
  const document = {body:{append(n){nodes.set(n.id,n);}},createElement:element,
    getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);}};
  const c = {document, window:{}, state:{themeKey:'sevenSecondServe',userRole:'star'},
    speechMarkup:({zh,en})=>`${zh}|${en}`, ROLES:{star:{short:'Haru'},fan:{short:'Maya'},anti:{short:'Ben'}},
    clearAITimer(){paused++;},queueAutomaticTurn(){resumed++;}};
  vm.runInNewContext(readFileSync(new URL('../../event-post.js',import.meta.url),'utf8'),c);
  const api=c.window.SuperidolEventPost, dialog=nodes.get('eventPostDialog');
  for(const [role,text] of [['star','现在的自己'],['fan','非常好'],['anti','一样差']]) {
    api.reset();c.state.userRole=role;api.sync();assert.equal(dialog.open,true);
    assert.ok(nodes.get('openingMotive').innerHTML.includes(text));
    nodes.get('openingContinue').onclick();assert.equal(dialog.open,false);
    api.sync();assert.equal(dialog.open,false);
  }
  assert.ok(resumed>=3);assert.ok(paused>=3);
  c.window.__onlineActive=true;api.reset();api.sync();const count=resumed;
  nodes.get('openingContinue').onclick();assert.equal(resumed,count);
  c.state={...c.state};api.sync();assert.equal(dialog.open,false);
  api.reset();api.sync();assert.equal(dialog.open,true);
  c.state.themeKey='comeback';api.sync();assert.equal(dialog.open,false);
  assert.ok(dialog.innerHTML.includes('controls playsinline'));
  assert.ok(!dialog.innerHTML.includes('autoplay'));
});
