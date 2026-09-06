import {ORDER,ROLES,CHANNELS,ISSUES,createGame,pattern,beats,legalPlays,claim,progress,exchanges,act,advance,chooseAI} from './perspective-rules.mjs?v=20260906';

const $=id=>document.getElementById(id);
let game=null,viewer='star',mode='solo',selected=[],draft=null,tradeOpen=false,tradePay=null,timer=null,showingResults=false;
const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avatar=role=>`<img class="avatar" src="assets/${ROLES[role].avatar}-avatar-20260812.webp" alt="">`;
const account=role=>`<div class="account">${avatar(role)}<strong>${ROLES[role].name} · ${ROLES[role].role}</strong></div>`;
const tags=c=>`<div class="tags">${c.keeps.map(r=>`<span class="tag">${ROLES[r].name} · ${ROLES[r].interest}</span>`).join('')}</div>`;
const describe=card=>`${CHANNELS[card.channel].symbol} ${CHANNELS[card.channel].name} ${card.level}`;
const personal=()=>mode==='local'||game.turn===viewer;

function start(role){
  clearTimeout(timer);viewer=role;mode=document.querySelector('[name=mode]:checked').value;game=createGame();resetSelection();showingResults=false;
  $('startDialog').close();$('resultDialog').close();$('handoffDialog').close();document.body.classList.remove('handoff');$('game').hidden=false;
  if(mode==='local')handoff();else{render();schedule();}
}
function resetSelection(){selected=[];draft=null;tradeOpen=false;tradePay=null;}
function handoff(){
  viewer=game.turn;document.body.classList.add('handoff');$('hand').replaceChildren();$('actions').replaceChildren();$('decision').replaceChildren();
  $('handoffTitle').textContent=`轮到 ${ROLES[viewer].name} · ${ROLES[viewer].role}`;
  if(!$('handoffDialog').open)$('handoffDialog').showModal();
}
function schedule(){
  clearTimeout(timer);
  if(!game||mode!=='solo'||game.phase!=='play'||game.turn===viewer||$('rulesDialog').open||$('startDialog').open)return;
  timer=setTimeout(()=>{timer=null;perform(chooseAI(game));},1600);
}
function perform(command){
  if(!game)return;
  const previous=game.turn;
  try{act(game,game.turn,command);}catch(error){$('feedback').textContent=error.message;return;}
  resetSelection();
  if(mode==='local'&&game.phase==='play'&&game.turn!==previous){handoff();return;}
  render();schedule();
}
function projectedText(c,owner){
  const before=progress(game)[viewer],after=progress(game,[...game.outcomes,{issue:game.issue,owner,claim:c}])[viewer];
  let text=owner===viewer?'若这句话定调：算你亲自定调一题。':'若这句话定调：由对方定调，不算你亲自发声。';
  if(viewer==='star')text+=game.issue===2?(c.keeps.includes('star')?' 它保住了你最后的改变空间。':' 它会把你固定成一种形象，你的最终目标将失败。'):(c.keeps.includes('star')?' 它承认人可以改变。':' 它没有保留你在意的改变空间。');
  else text+=c.keeps.includes(viewer)?` 你的「${ROLES[viewer].interest}」将从 ${before.kept}/2 推进到 ${after.kept}/2。`:` 它不保留你的「${ROLES[viewer].interest}」。`;
  if(after.won)text+=' 这将满足你本局的全部目标。';
  return text;
}
function render(){
  if(!game)return;
  $('feedback').textContent='';
  $('issues').innerHTML=ISSUES.map((issue,i)=>{const o=game.outcomes.find(x=>x.issue===i);return `<article class="issue-tab ${i===game.issue?'active':''}"><small>0${i+1} / ${o?`${ROLES[o.owner].name} 已定调`:i===game.issue?'正在争论':'尚未开始'}</small><strong>${issue.title}</strong>${o?`<p>${esc(o.claim.text)}</p>`:''}</article>`;}).join('');
  $('issueTitle').textContent=ISSUES[game.issue].title;$('fact').textContent=ISSUES[game.issue].fact;
  const top=game.top;
  $('top').style.setProperty('--role-color',top?ROLES[top.role].color:'#909587');
  $('top').innerHTML=top?`${account(top.role)}<blockquote>“${esc(top.claim.text)}”</blockquote><div class="top-footer">${tags(top.claim)}<small>${top.pattern.label} · <span class="mini-cards">${top.cards.map(c=>`${CHANNELS[c.channel].symbol}${c.level}`).join(' ')}</span> · 连续过牌 ${game.passes}/2</small></div>`:
    `<div class="kicker">${game.phase==='play'?`${ROLES[game.turn].name} 可以先开口`:'这道问题的争执已经结束'}</div><blockquote class="empty">${game.lastRound?`上一轮留下：“${esc(game.lastRound.claim.text)}”`:'没有人开口之前，事实还没有被压缩成一句话。'}</blockquote><div class="top-footer"><small>${ORDER.map(r=>`${ROLES[r].name} ${game.markers[r]}/2 标`).join('　')}</small></div>`;
  $('notice').textContent=game.notice;
  const scores=progress(game);
  $('goals').innerHTML=ORDER.map(r=>`<article class="goal ${r===viewer?'you':''}" style="--role-color:${ROLES[r].color}">${account(r)}<blockquote>${ROLES[r].want}</blockquote><p>${ROLES[r].goal}</p><div class="goal-progress">${r===viewer?'<b>你的目标</b> · ':''}亲自定调 ${scores[r].own}/1 · ${r==='star'?(scores[r].protectedGoal?'改变空间已留下':game.issue<2?'改变空间：看最后一题':'改变空间：最后争取'):ROLES[r].interest+' '+scores[r].kept+'/2'}<br>本题标记 <b>${game.markers[r]}/2</b> · 手牌 ${game.hands[r].length}${game.exchanged.includes(r)?' · 已整理':''}</div></article>`).join('');
  $('history').innerHTML=game.history.map(text=>`<li>${esc(text)}</li>`).join('');
  renderDecision();renderHand();renderActions();
  if(game.phase==='ended'&&!showingResults){showingResults=true;showResults();}
}
function renderDecision(){
  const panel=$('decision');
  if(game.phase==='between'){
    const outcome=game.outcomes.at(-1);
    panel.innerHTML=`<div class="transition"><strong>这句话留下来了，中间的争论开始被忘记。</strong><p>${esc(outcome.claim.leaves)}</p><p>你的手牌不会补充。下一题仍要决定值得为什么开口。</p><button id="nextIssue" class="primary">进入下一题 · ${ISSUES[game.issue+1].title}</button></div>`;
    $('nextIssue').onclick=()=>{advance(game);resetSelection();if(mode==='local'&&game.phase==='play')handoff();else{render();schedule();}};return;
  }
  if(game.phase==='ended'){panel.innerHTML='<button id="viewResults">再看留下的公共形象</button>';$('viewResults').onclick=showResults;return;}
  const locked=game.choices[viewer];
  if(locked!==undefined){const c=claim(game,viewer);panel.innerHTML=`<h2>本题你正在维护的说法 · 首次出牌后固定</h2><div class="locked"><p>“${esc(c.text)}”</p><small>这句话淡化了：${esc(c.leaves)}</small></div>`;}
  else if(!personal())panel.innerHTML=`<p>轮到 ${ROLES[game.turn].name}。你可以看自己的牌和三方目标；等你开口时，再选本题想坚持的说法。</p>`;
  else{
    panel.innerHTML=`<h2>这题，你准备让大家记住哪一部分？ <span class="fine">首次出牌时确定</span></h2><div class="choices">${ISSUES[game.issue].claims[viewer].map((c,i)=>`<button class="choice ${draft===i?'selected':''}" data-choice="${i}" aria-pressed="${draft===i}"><strong>${esc(c.text)}</strong>${tags(c)}<span class="omitted">淡化了：${esc(c.leaves)}</span></button>`).join('')}</div>`;
    panel.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{draft=Number(b.dataset.choice);render();});
  }
  const c=locked!==undefined?claim(game,viewer):draft!==null?claim(game,viewer,draft):null;
  if(c&&personal())panel.insertAdjacentHTML('beforeend',`<p>${projectedText(c,viewer)}</p>`);
}
function renderHand(){
  $('handLabel').textContent=`${ROLES[viewer].name} 的手牌`;$('handCount').textContent=`剩余 ${game.hands[viewer].length} 张`;
  const cards=[...game.hands[viewer]].sort((a,b)=>Object.keys(CHANNELS).indexOf(a.channel)-Object.keys(CHANNELS).indexOf(b.channel)||a.level-b.level);
  $('hand').innerHTML=cards.length?cards.map(c=>`<button class="card ${selected.includes(c.id)?'selected':''}" data-card="${c.id}" data-channel="${c.channel}" aria-label="${describe(c)}" aria-pressed="${selected.includes(c.id)}" ${personal()&&game.phase==='play'?'':'disabled'}><small>${CHANNELS[c.channel].name}</small><b>${c.level}</b><i>${CHANNELS[c.channel].symbol}</i></button>`).join(''):'<p class="hand-hidden">手牌已用尽。这些已经留下的说法，将决定你是否达到目标。</p>';
  $('hand').querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>{const id=b.dataset.card;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<3)selected.push(id);else{$('feedback').textContent='一次最多选择三张牌。';return;}render();});
}
function renderActions(){
  const panel=$('actions');
  if(game.phase!=='play'){panel.innerHTML='<span>本题使用过的牌不会自动回到手中。</span>';return;}
  if(!personal()){panel.innerHTML=`<span>${ROLES[game.turn].name} 正在决定要争取什么……</span>`;return;}
  const cards=selected.map(id=>game.hands[viewer].find(c=>c.id===id)),p=pattern(cards),choice=game.choices[viewer]??draft,canPlay=beats(p,game.top?.pattern)&&choice!==null;
  const legal=legalPlays(game),trades=exchanges(game);
  panel.innerHTML=`<button class="primary" id="playButton" ${canPlay?'':'disabled'}>${game.top?'用这句话回应':'用这句话开口'}${p?' · '+p.label:''}</button>${game.top||!cards.length&&!game.hands[viewer].length?'<button id="passButton">过牌 · 保留手牌</button>':''}${trades.length?'<button id="tradeButton">让步整理 ↔</button>':''}<span>${selected.length?`${selected.length} 张 · ${p?(beats(p,game.top?.pattern)?'牌型可以发布':'压不过当前牌型'):'未组成合法牌型'}`:legal.length?'选 1—3 张牌。等级争置顶，不判对错。':'没有能够反压的牌。'}</span>`;
  $('playButton').onclick=()=>perform({type:'play',ids:selected,choice});
  if($('passButton'))$('passButton').onclick=()=>perform({type:'pass'});
  if($('tradeButton'))$('tradeButton').onclick=()=>{tradeOpen=!tradeOpen;tradePay=null;render();};
  if(game.top){const warning=document.createElement('p');warning.className='fine';warning.textContent=`${game.markers[game.top.role]===1?'对方再守住这一轮，就会定调。':'对方守住这一轮，将得到一标。'} ${projectedText(game.top.claim,game.top.role)}`;panel.append(warning);}
  if(tradeOpen){
    const payIds=[...new Set(trades.map(t=>t.pay))];
    const box=document.createElement('div');box.className='exchange-picker';box.innerHTML=`<strong>放弃这一话轮，给后面的组合留牌。</strong><p>先选要耗尽的高牌，再选换回的低牌。确认后本轮不能再回应；每题一次。</p><div>${payIds.map(id=>`<button data-pay="${id}" class="${tradePay===id?'selected':''}">弃 ${describe(game.hands[viewer].find(c=>c.id===id))}</button>`).join('')}</div>${tradePay?`<p>选择要收回的牌并确认：</p>${trades.filter(t=>t.pay===tradePay).map(t=>`<button data-take="${t.take}">换回 ${describe(game.discard.find(c=>c.id===t.take))} · 让出本轮</button>`).join('')}`:''}`;panel.append(box);
    box.querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>{tradePay=b.dataset.pay;render();});
    box.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>perform({type:'exchange',pay:tradePay,take:b.dataset.take}));
  }
}
function showResults(){
  const scores=progress(game),viewerScore=scores[viewer];
  $('resultBody').innerHTML=`<div class="kicker">争执结束 / 留下的是一种选择过的解释</div><h1>事实没有变，<br>被记住的版本变了。</h1><p>${mode==='solo'?`${ROLES[viewer].name}，你${viewerScore.won?'达成了':'没有完全达成'}自己的目标。`:''}定调只代表哪句话留下，不表示其他人的经历或判断被证伪。</p><div class="result-goals">${ORDER.map(r=>`<article><strong>${ROLES[r].name} · ${scores[r].won?'目标达成':'目标未达成'}</strong><span>${ROLES[r].goal}</span><br>${scores[r].own?'✓':'✕'} 亲自定调 ${scores[r].own} 题<br>${scores[r].protectedGoal?'✓':'✕'} ${r==='star'?'最后留下改变的空间':ROLES[r].interest+'保住 '+scores[r].kept+' 题'}</article>`).join('')}</div>${ISSUES.map((issue,i)=>{const o=game.outcomes.find(x=>x.issue===i);return `<article class="result-story"><small>0${i+1} · ${o?ROLES[o.owner].name+' 留下的版本':'尚未定调'}</small><h3>${issue.title}</h3><blockquote>${o?'“'+esc(o.claim.text)+'”':'手牌耗尽，争论没有形成定调。'}</blockquote>${o?tags(o.claim):''}<p><strong>当时共同看到：</strong>${issue.fact}</p>${o?`<p><strong>留下的版本淡化了：</strong>${o.claim.leaves}</p>`:''}</article>`;}).join('')}<p>下一次换个阵营，试着保住另一样东西。同一段失误，会不会突然显得不一样？</p><div class="result-actions"><button id="swapRole" class="primary">换个阵营再玩</button><button id="closeResult">查看最终局面</button></div>`;
  if(!$('resultDialog').open)$('resultDialog').showModal();
  const heading=$('resultBody').querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});$('resultDialog').scrollTop=0;
  $('swapRole').onclick=restart;$('closeResult').onclick=()=>$('resultDialog').close();
}
function restart(){clearTimeout(timer);$('resultDialog').close();$('handoffDialog').close();document.body.classList.remove('handoff');$('game').hidden=true;game=null;showingResults=false;$('startDialog').showModal();}
$('rolePicks').innerHTML=ORDER.map(r=>`<button class="role-pick" data-role="${r}" style="--role-color:${ROLES[r].color}">${account(r)}<strong>${ROLES[r].interest}</strong><p>${ROLES[r].want}</p><span>以这个立场入场 →</span></button>`).join('');
$('rolePicks').querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>start(b.dataset.role));
$('rulesButton').onclick=()=>{clearTimeout(timer);$('rulesDialog').showModal();const heading=$('rulesDialog').querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});$('rulesDialog').scrollTop=0;};
$('closeRules').onclick=()=>{$('rulesDialog').close();schedule();};
$('rulesDialog').addEventListener('close',schedule);
$('restartButton').onclick=restart;
$('revealHand').onclick=()=>{$('handoffDialog').close();document.body.classList.remove('handoff');resetSelection();render();};
for(const id of ['startDialog','handoffDialog'])$(id).addEventListener('cancel',event=>event.preventDefault());
$('startDialog').showModal();
