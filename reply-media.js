(() => {
  const copy = (zh,en) => speechMarkup({zh,en});
  const modal = document.createElement('dialog');
  modal.id = 'fullClipDialog';
  modal.innerHTML = `<div class="opening-post"><h2>${copy('完整试镜','Full audition')}</h2><video controls playsinline preload="metadata" src="assets/audition/full-audition.mp4"></video><button type="button">${copy('关闭','Close')}</button></div>`;
  document.body.append(modal);
  const video = modal.querySelector('video');
  let viewingPost = null;
  modal.querySelector('button').onclick = () => modal.close();
  modal.addEventListener('close',()=>{video.pause();viewingPost=null;});
  const eligible = s => s?.themeKey === 'sevenSecondServe' && s.topPlay?.role === 'fan' && s.topPlay?.facts?.fullClip === true;
  function sync() {
    const post = state?.topPlay;
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
      if(next.disabled||window.__onlineActive||playAnimationActive||window.SuperidolEventPost?.isOpen()||modal.open)return;
      next.disabled=true;next.remove();
      if(state.phase==='old_story_choice'){const decision=chooseAIOldStoryTarget(role);chooseOldStoryTarget(decision.target,true,decision.reason);}
      else if(state.phase==='action'&&state.currentRole===role)aiTurn(role);
    };
    document.getElementById('actionButtons').append(next);
  }
  window.SuperidolReplyMedia={sync,eligible};
})();
