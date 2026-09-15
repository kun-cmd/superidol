import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('solo restart and starting after an online event restore the first event and clean responses',()=>{
  const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
  const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function runAutomatedSimulations')).replace('    setup();','');
  let resets=0;
  const dialog={open:false,close(){this.open=false;},showModal(){this.open=true;},classList:{remove(){}}};
  const context=vm.createContext({setTimeout,clearTimeout,console,URLSearchParams,location:{search:''},window:{SuperidolCardMotion:{reset(){resets++;}}},document:{getElementById(){return dialog;},querySelector(){return null;},querySelectorAll(){return [];}}});
  vm.runInContext(script,context);
  vm.runInContext('render=()=>{};showEventIntro=()=>{};queueAutomaticTurn=()=>{};publishBystanderComment=()=>{};',context);
  const dirty=`campaign.eventNumber=3;campaign.activeTheme='roomTone';campaign.albumFragments=[{old:true}];campaign.permanentMemory={owner:'anti'};state=initialState('anti');state.narrative.facts.selfLaughReplayed=true;state.narrative.consumed[0]={old:true};state.selectedIds=['old'];`;
  for(const action of ['restart();startGame("fan")','restartCampaign()','startGame("anti")']){
    vm.runInContext(dirty+action,context);
    const current=JSON.parse(vm.runInContext('JSON.stringify({state,campaign})',context));
    assert.equal(current.campaign.eventNumber,1);
    assert.equal(current.state.themeKey,'sevenSecondServe');
    assert.equal(current.state.issueIndex,0);
    assert.equal(current.state.topPlay,null);
    assert.deepEqual(current.state.selectedIds,[]);
    assert.deepEqual(current.state.narrative,{version:1,nextId:0,consumed:{},facts:{},posts:[]});
    assert.deepEqual(current.campaign.albumFragments,[]);
  }
  assert.equal(resets,4);
});

test('online event transition clears local selection before applying reused card ids',()=>{
  const source=fs.readFileSync(new URL('../../online-client.js',import.meta.url),'utf8');
  const fresh=source.slice(source.indexOf('  function freshLocalSelection()'),source.indexOf('  function normalizeServer('));
  const enter=source.slice(source.indexOf('  function enterOnlineGame('),source.indexOf('  function renderOnlinePhaseDialog('));
  let resets=0;
  const context=vm.createContext({window:{__onlineActive:true,SuperidolCardMotion:{reset(){resets++;}}},document:{body:{classList:{add(){}}}},el:()=>({open:false}),normalizeServerState:s=>s,render(){},renderOnlinePhaseDialog(){}});
  vm.runInContext(fresh+enter+`;
    let session={role:'anti'}, campaign={}, state={eventStartedAt:1,themeKey:'sevenSecondServe',phase:'action'};
    let localSelection={...freshLocalSelection(),ids:['reused'],captureAll:true,wildChoice:'fact',coolingMode:true,coolingCardId:'reused'};
    const next={eventStartedAt:2,themeKey:'voiceNote',phase:'action',roles:{anti:{hand:[{id:'reused'}]}},skills:{star:{},anti:{},fan:{}}};
    enterOnlineGame(next);
  `,context);
  const selection=JSON.parse(vm.runInContext('JSON.stringify({ids:state.selectedIds,capture:state.skills.anti.captureArmed,wild:state.wildChannelChoice,cooling:state.coolingMode})',context));
  assert.deepEqual(selection,{ids:[],capture:false,wild:null,cooling:false});
  assert.equal(resets,1);
});
