// A deliberately bounded ruleset: one event, three public interpretations.
export const ORDER = ['anti', 'star', 'fan'];
export const ROLES = {
  star: {name:'Haru', role:'明星本人', color:'#d77c57', avatar:'haru-venn', interest:'改变的空间', want:'我承认出过丑，但我不想一辈子由别人替我定义。', goal:'至少亲自定调一题；最后一题留下「人可以改变」的空间。'},
  fan: {name:'Maya', role:'真爱粉', color:'#629783', avatar:'maya-reed', interest:'对人的尊重', want:'我支持的人有缺点，也不应该因此成为所有人的笑柄。', goal:'至少亲自定调一题；三题中至少两题保住对人的尊重。'},
  anti: {name:'Ben', role:'质疑者', color:'#868dc0', avatar:'ben-carter', interest:'质疑的权利', want:'明星和粉丝不能把不喜欢的声音都说成恶意。', goal:'至少亲自定调一题；三题中至少两题保住公众质疑的权利。'},
};
export const CHANNELS = {fact:{name:'材料', symbol:'□'}, stance:{name:'立场', symbol:'△'}, spread:{name:'传播', symbol:'○'}};
const line = (text, keeps, leaves) => ({text, keeps, leaves});
export const ISSUES = [
  {title:'七秒，能代表什么？', fact:'七年前，十七岁的 Haru 在试镜中失误，又把表演完成了。现在流传的七秒剪辑只保留了失误。', claims:{
    star:[line('那确实是一次失误，但十七岁的七秒不是今天的全部。',['star','fan'],'没有回应大家为什么仍然觉得好笑。'),line('表演确实尴尬，你们可以笑；我会用后来的表现回答。',['star','anti'],'没有要求围观者停止对自己的嘲笑。')],
    fan:[line('失误后继续演完的人，也值得被看见。',['fan','star'],'没有正面谈那段表演究竟好不好。'),line('可以笑这个表演，但别把人当成笑话。',['fan','anti'],'接受了这段失误继续被传播。')],
    anti:[line('他后来可以进步，不等于这段旧表演不能被笑。',['anti','star'],'没有要求玩梗的人顾及他的感受。'),line('我不评价他整个人，但失误不能被「努力」两个字抹掉。',['anti','fan'],'没有把失误之后的坚持放在重点。')],
  }},
  {title:'谁能决定这个梗该停了？', fact:'团队发出版权下架通知，也有人借这个梗辱骂 Haru。Haru 公开要求团队停止威胁二创者。', claims:{
    star:[line('下架是团队做的。我已经叫停，请听我自己的态度。',['star','anti'],'没有替被辱骂的人划出保护边界。'),line('我会为团队的做法负责，也希望你们别继续羞辱任何人。',['star','fan'],'没有明确保证这个梗还能继续被创作。')],
    fan:[line('他已经叫停下架，别再把团队的每个决定算成他的本意。',['fan','star'],'弱化了明星需要承担的团队责任。'),line('二创可以继续，但辱骂不是创作自由。',['fan','anti'],'没有替 Haru 争取亲自解释团队决定的空间。')],
    anti:[line('既然他叫停了下架，就让他用后续行动兑现。',['anti','star'],'没有把粉丝受到的伤害放在重点。'),line('别攻击普通粉丝，但版权不能成为禁止嘲讽的工具。',['anti','fan'],'没有区分团队的行为和 Haru 本人的态度。')],
  }},
  {title:'热搜退去，留下谁的 Haru？', fact:'那次失误、后来的作品、团队的下架通知和他叫停下架的声明都真实存在。热搜正在退去。', claims:{
    star:[line('我不是永远正确的人。请给我继续改变、继续创作的空间。',['star','fan'],'没有承诺以后每次质疑都会得到公开答复。'),line('旧事可以继续被问，下一步怎么走由我自己回答。',['star','anti'],'没有替一路维护自己的人证明他们始终正确。')],
    fan:[line('你们可以继续质疑，我们也有权继续支持自己认识的那个他。',['fan','anti'],'争取了双方表达的空间，却仍用粉丝熟悉的形象替他作答。'),line('不必证明他从没出错，我们仍然可以支持他改变。',['fan','star'],'没有保证今后的批评者也能被粉圈接纳。')],
    anti:[line('造星生意当然可以被质疑，普通粉丝不该替它承担所有骂名。',['anti','fan'],'把他放进造星生意的框架，没有留意他本人如何改变。'),line('新的作品可以改变评价，旧的问题也仍然可以追问。',['anti','star'],'没有给希望争论彻底结束的粉丝一个交代。')],
  }},
];
export function seeded(seed) {return () => {seed = (seed + 0x6D2B79F5)|0; let t=Math.imul(seed^(seed>>>15),1|seed); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296;};}
export function createGame(random=Math.random) {
  const deck=[];
  for(const channel of Object.keys(CHANNELS)) for(let level=1;level<=5;level++) for(let n=0;n<(level===5?1:3);n++) deck.push({id:`${channel}-${level}-${n}`,channel,level});
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  const hands=Object.fromEntries(ORDER.map(r=>[r,[]]));
  // Each side starts with at least two cards in each channel, as in the existing game.
  for(const r of ORDER) for(const c of Object.keys(CHANNELS)) for(let n=0;n<2;n++) hands[r].push(deck.splice(deck.findIndex(x=>x.channel===c),1)[0]);
  for(const r of ORDER) hands[r].push(...deck.splice(0,6));
  return {hands,undealt:deck,discard:[],spent:[],issue:0,turn:'anti',phase:'play',top:null,passes:0,markers:zeros(),choices:{},conceded:[],exchanged:[],outcomes:[],history:[],notice:'同一组事实，三个人想保住不同的东西。',lastRound:null};
}
const zeros=()=>Object.fromEntries(ORDER.map(r=>[r,0]));
export function pattern(cards) {
  if(!cards.length||cards.length>3)return null;
  const levels=cards.map(c=>c.level).sort((a,b)=>a-b),same=cards.every(c=>c.channel===cards[0].channel);
  if(cards.length===1)return {type:'single',level:levels[0],label:'单张'};
  if(cards.length===2&&same&&levels[0]===levels[1])return {type:'pair',level:levels[0],label:'同调对子'};
  if(cards.length===3&&same&&levels[1]===levels[0]+1&&levels[2]===levels[1]+1)return {type:'run',level:levels[2],label:'连续论证'};
  if(cards.length===3&&new Set(cards.map(c=>c.channel)).size===3&&levels.every(n=>n===levels[0]))return {type:'loop',level:levels[0],label:'闭环叙事'};
  return null;
}
export function beats(p,top) {return !!p&&(!top||(p.type==='loop'&&top.type!=='loop')||(p.type===top.type&&p.level>top.level));}
export function legalPlays(g,role=g.turn) {
  const hand=g.hands[role],out=[];
  function add(cards){const p=pattern(cards);if(beats(p,g.top?.pattern))out.push({ids:cards.map(c=>c.id),pattern:p,cost:cards.reduce((s,c)=>s+c.level,0)});}
  for(let a=0;a<hand.length;a++){add([hand[a]]);for(let b=a+1;b<hand.length;b++){add([hand[a],hand[b]]);for(let c=b+1;c<hand.length;c++)add([hand[a],hand[b],hand[c]]);}}
  return out;
}
export function claim(g,role,choice=g.choices[role]??0){return ISSUES[g.issue].claims[role][choice];}
export function progress(g,outcomes=g.outcomes) {
  return Object.fromEntries(ORDER.map(role=>{
    const own=outcomes.filter(o=>o.owner===role).length,kept=outcomes.filter(o=>o.claim.keeps.includes(role)).length;
    const final=outcomes.find(o=>o.issue===2),protectedGoal=role==='star'?!!final?.claim.keeps.includes(role):kept>=2;
    return [role,{own,kept,protectedGoal,won:own>=1&&protectedGoal}];
  }));
}
export function exchanges(g,role=g.turn) {
  if(!g.top||g.exchanged.includes(role))return [];
  return g.hands[role].flatMap(pay=>g.discard.filter(card=>card.by===role&&card.level<pay.level&&!g.top.cards.some(c=>c.id===card.id)).map(take=>({pay:pay.id,take:take.id})));
}
function log(g,text){g.notice=text;g.history.unshift(text);g.history=g.history.slice(0,30);}
function settle(g){
  const role=g.top.role;g.markers[role]++;
  g.lastRound={role,claim:g.top.claim,markers:{...g.markers}};
  log(g,`${ROLES[role].name}的说法留下了一轮（${g.markers[role]}/2）。${g.top.claim.text}`);
  if(g.markers[role]===2){
    g.outcomes.push({issue:g.issue,owner:role,claim:g.top.claim,choices:{...g.choices}});
    g.phase=g.issue===2?'ended':'between';
    log(g,`这道问题留下的说法：${g.top.claim.text}`);
  }
  g.top=null;g.passes=0;g.conceded=[];g.turn=role;
  if(g.phase==='play'&&!ORDER.some(r=>g.hands[r].length))endExhausted(g);
}
function endExhausted(g){g.phase='ended';log(g,'所有人都已用尽手牌。尚未定调的问题保持悬而未决。');}
function next(g){
  if(g.passes>=2&&g.top){settle(g);return;}
  g.turn=ORDER[(ORDER.indexOf(g.turn)+1)%3];
  // A concession lasts for this round; ordinary passes can re-enter after a new play.
  let skipped=0;
  while(g.phase==='play'&&(g.conceded.includes(g.turn)||!g.hands[g.turn].length)){
    if(g.top&&g.turn===g.top.role){settle(g);return;}
    g.passes++;
    if(g.top&&g.passes>=2){settle(g);return;}
    if(++skipped>=3){endExhausted(g);return;}
    g.turn=ORDER[(ORDER.indexOf(g.turn)+1)%3];
  }
}
export function act(g,role,command) {
  if(g.phase!=='play'||g.turn!==role)throw new Error('还没轮到你。');
  if(command.type==='play'){
    if(!Array.isArray(command.ids)||new Set(command.ids).size!==command.ids.length)throw new Error('请选择不同的手牌。');
    const cards=command.ids.map(id=>g.hands[role].find(c=>c.id===id));
    if(cards.some(c=>!c))throw new Error('这张牌不在手中。');
    const p=pattern(cards);if(!beats(p,g.top?.pattern))throw new Error('需要更高的同牌型，或闭环叙事。');
    const choice=g.choices[role]??command.choice;
    if(choice!==0&&choice!==1)throw new Error('先选定本题要坚持的说法。');
    g.choices[role]=choice;
    g.hands[role]=g.hands[role].filter(c=>!command.ids.includes(c.id));
    g.discard.push(...cards.map(c=>({...c,by:role})));
    g.top={role,cards,pattern:p,claim:claim(g,role)};g.passes=0;
    log(g,`${ROLES[role].name}：${g.top.claim.text}`);
  }else if(command.type==='pass'){
    if(!g.top&&g.hands[role].length)throw new Error('你领出这一轮，需要先出牌。');
    g.passes++;log(g,`${ROLES[role].name}暂时不回应，保留手牌。`);
  }else if(command.type==='exchange'){
    if(!exchanges(g,role).some(p=>p.pay===command.pay&&p.take===command.take))throw new Error('只能用高牌换回自己已用过的低牌，每题一次。');
    const pay=g.hands[role].find(c=>c.id===command.pay),take=g.discard.find(c=>c.id===command.take);
    g.hands[role]=g.hands[role].filter(c=>c.id!==pay.id);g.hands[role].push({id:take.id,channel:take.channel,level:take.level});
    g.spent.push(pay);g.discard=g.discard.filter(c=>c.id!==take.id);g.exchanged.push(role);g.conceded.push(role);g.passes++;
    log(g,`${ROLES[role].name}让出这一轮，用${pay.level}级换回${take.level}级，准备后面的组合。`);
  }else throw new Error('未知行动。');
  next(g);
}
export function advance(g){
  if(g.phase!=='between')throw new Error('当前问题还没结束。');
  g.issue++;g.markers=zeros();g.choices={};g.exchanged=[];g.conceded=[];g.phase='play';g.lastRound=null;
  log(g,'新的问题。手牌沿用，上一题留下的说法已经计入各方目标。');
  if(!ORDER.some(r=>g.hands[r].length))endExhausted(g);
  else if(!g.hands[g.turn].length){g.turn=ORDER.find(r=>g.hands[r].length);}
}
function utility(g,role,owner,c){
  const before=progress(g)[role],after=progress(g,[...g.outcomes,{issue:g.issue,owner,claim:c}])[role];
  let value=(c.keeps.includes(role)?(role==='star'?(g.issue===2?10:1):(before.kept<2?5:1)):0)+(owner===role&&before.own===0?6:0);
  if(after.won)value+=12;
  return value;
}
export function chooseAI(g,role=g.turn){
  const options=legalPlays(g,role);
  const choices=[0,1].map(choice=>({choice,value:utility(g,role,role,claim(g,role,choice))-
    ORDER.filter(r=>r!==role).reduce((sum,r)=>sum+(progress(g,[...g.outcomes,{issue:g.issue,owner:role,claim:claim(g,role,choice)}])[r].won?1.5:0),0)}));
  const choice=g.choices[role]??choices.sort((a,b)=>b.value-a.value)[0].choice;
  if(!options.length)return {type:'pass'};
  const myValue=utility(g,role,role,claim(g,role,choice)),topValue=g.top?utility(g,role,g.top.role,g.top.claim):0;
  const urgent=g.top&&g.markers[g.top.role]===1&&(topValue<myValue||(!progress(g)[role].own&&g.issue===2));
  options.sort((a,b)=>{
    const score=o=>o.cost+o.ids.length*1.2+(o.pattern.type==='loop'?4:0)-((urgent||g.markers[role]===1)?o.pattern.level*1.1:0);
    return score(a)-score(b);
  });
  const best=options[0];
  if(g.top&&!urgent&&(topValue>=myValue-2||(g.issue<2&&best.cost>=9&&g.hands[role].length<=6))){
    const trade=exchanges(g,role).find(p=>{
      const take=g.discard.find(c=>c.id===p.take),pay=g.hands[role].find(c=>c.id===p.pay);
      return pay.level-take.level<=2&&g.hands[role].some(c=>c.id!==pay.id&&c.channel===take.channel&&c.level===take.level);
    });
    return trade?{type:'exchange',...trade}:{type:'pass'};
  }
  return {type:'play',ids:best.ids,choice};
}
