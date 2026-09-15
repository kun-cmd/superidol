(() => {
  const copy = (zh,en) => speechMarkup({zh,en});
  const modal = document.createElement('dialog');
  modal.id = 'fullClipDialog';
  modal.innerHTML = `<div class="opening-post"><h2>${copy('完整试镜','Full audition')}</h2><video controls playsinline preload="metadata" src="assets/audition/full-audition.mp4"></video><button type="button" class="media-back" data-i18n-skip>Back</button></div>`;
  document.body.append(modal);
  const video = modal.querySelector('video');
  let viewingPost = null;
  modal.querySelector('button').onclick = () => modal.close();
  modal.addEventListener('close',()=>{video.pause();viewingPost=null;});
  const eligible = s => s?.themeKey === 'sevenSecondServe' && s.topPlay?.role === 'fan' && s.topPlay?.facts?.fullClip === true;
  const memes = {B1R:'loading',B2R:'loading',B3R:'airplanes',BL1:'airplanes',BL2:'airplanes',BL3:'loading','quote-self-laugh':'airplanes','quote-fan-laugh':'loading'};
  const memeFor = s => {
    if(s?.themeKey!=='sevenSecondServe'||s.topPlay?.role!=='anti')return null;
    const post=s.topPlay,body=post.body||post.speech;
    if(memes[post.contentId])return memes[post.contentId];
    const narrative=globalThis.SuperidolNarrative;
    const rows=[...(narrative?.posts||[]).flatMap(stage=>Object.values(stage.anti)),...(narrative?.combos||[]).flatMap(stage=>stage.anti||[])];
    const row=rows.find(r=>r.speech.zh===body?.zh&&r.speech.en===body?.en);
    return memes[row?.id]||null;
  };
  const memeModal=document.createElement('dialog');memeModal.id='memeDialog';
  memeModal.innerHTML=`<div class="opening-post"><img class="expanded-meme" alt="Haru meme"><button type="button" class="media-back" data-i18n-skip>Back</button></div>`;
  document.body.append(memeModal);
  let memePost=null,preloaded=false;
  memeModal.querySelector('button').onclick=()=>memeModal.close();
  memeModal.addEventListener('close',()=>{memePost=null;});
  function preload(){
    if(preloaded||!state||simulationMode||typeof fetch!=='function')return;
    preloaded=true;
    for(const file of ['clip-3s.mp4','full-audition.mp4','meme-loading.png','meme-airplanes.png'])
      fetch(`assets/audition/${file}`,{cache:'force-cache'}).then(r=>r.arrayBuffer()).catch(()=>{});
    video.preload='auto';
    const clip=document.querySelector?.('#eventPostDialog video');if(clip)clip.preload='auto';
  }
  function sync() {
    preload();
    const post = state?.topPlay;
    const meme=memeFor(state),memeKey=meme?JSON.stringify([post.postId,post.publishedAt,post.cardIds,meme]):null;
    if(memeModal.open&&memeKey!==memePost)memeModal.close();
    document.getElementById('memeAttachment')?.remove();
    if(meme){
      const attachment=document.createElement('button');attachment.id='memeAttachment';attachment.type='button';attachment.className='event-original-button';
      attachment.innerHTML=copy('😂 梗图','😂 Meme');
      attachment.onclick=()=>{if(memeFor(state)!==meme)return;memePost=memeKey;memeModal.querySelector('img').src=`assets/audition/meme-${meme}.png`;memeModal.showModal();};
      document.getElementById('threadTop').after(attachment);
    }
    const key = eligible(state) ? JSON.stringify([post.postId,post.publishedAt,post.cardIds]) : null;
    if(modal.open && key !== viewingPost) modal.close();
    document.getElementById('fullClipAttachment')?.remove();
    if(key) {
      const attachment=document.createElement('button');
      attachment.id='fullClipAttachment';attachment.type='button';attachment.className='event-original-button';
      attachment.innerHTML=copy('▶ 完整试镜','▶ Full audition');
      attachment.onclick=()=>{if(!eligible(state))return;viewingPost=key;video.currentTime=0;modal.showModal();video.play().catch(()=>{});};
      document.getElementById('threadTop').after(attachment);
    }
    document.getElementById('allowNextAI')?.remove();
    const role=state?.phase==='old_story_choice'?state.oldStoryCall?.chooser:state?.currentRole;
    if(!state||window.__onlineActive||simulationMode||playAnimationActive||!['action','old_story_choice'].includes(state.phase)||role===state.userRole||!role)return;
    const next=document.createElement('button');next.id='allowNextAI';next.type='button';next.className='primary-button';
    next.innerHTML=copy(`让 ${ROLES[role].short} 行动`,`Let ${ROLES[role].short} act`);
    next.onclick=()=>{
      if(next.disabled||window.__onlineActive||playAnimationActive||window.SuperidolEventPost?.isOpen()||modal.open||memeModal.open)return;
      next.disabled=true;next.remove();
      if(state.phase==='old_story_choice'){const decision=chooseAIOldStoryTarget(role);chooseOldStoryTarget(decision.target,true,decision.reason);}
      else if(state.phase==='action'&&state.currentRole===role)aiTurn(role);
    };
    document.getElementById('actionButtons').append(next);
  }
  window.SuperidolReplyMedia={sync,eligible,memeFor};
})();
