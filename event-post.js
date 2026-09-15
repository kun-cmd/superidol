/* Local presentation only: watching never spends a card or changes server state. */
(() => {
  let seen = false;
  const copy = (zh, en) => speechMarkup({zh, en});
  const dialog = document.createElement('dialog');
  dialog.id = 'eventPostDialog';
  dialog.innerHTML = `<article class="opening-post" aria-labelledby="openingPostTitle">
    <div class="opening-kicker">${copy('事件原帖 · 旧视频','ORIGINAL POST · OLD FOOTAGE')}</div>
    <h2 id="openingPostTitle">${copy('Haru 七年前的试镜突然被翻出来了。','Haru’s audition from seven years ago has resurfaced.')}</h2>
    <p>${copy('现在大家转得最多的是其中三秒。有人觉得只是好笑，有人拿它证明他根本不会跳。','A three-second cut is spreading. Some people find it funny. Others say it proves he cannot dance.')}</p>
    <video controls playsinline preload="metadata" poster="assets/audition/clip-poster.jpg" aria-label="Haru audition clip"><source src="assets/audition/clip-3s.mp4" type="video/mp4"></video>
    <small>${copy('三秒剪辑','Three-second clip')}</small>
    <div class="opening-motive" id="openingMotive"></div>
    <button type="button" id="openingContinue">${copy('进入对局','Enter the discussion')}</button>
  </article>`;
  document.body.append(dialog);
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'event-original-button'; button.hidden = true;
  button.innerHTML = copy('▶ 事件原帖','▶ Original post');
  document.getElementById('roundStatus').after(button);
  const motives = {
    star: ['那几下确实没跳好，但你不想让它代表现在的自己。','Those moves were rough, but you do not want them to define who you are now.'],
    fan: ['Haru 当时跳得非常好，你们不能只认识这个剪辑。','Haru danced really well back then. You cannot judge him only by this clip.'],
    anti: ['虽然是之前的视频，但是他现在水平也和之前一样差。','The video is old, but he is still just as bad now.']
  };
  function open() {
    if (!state || state.themeKey !== 'sevenSecondServe') return;
    const role = state.userRole;
    const motive = motives[role] || motives.star;
    document.getElementById('openingMotive').innerHTML = `<strong>${ROLES[role].short}</strong><p>${copy(...motive)}</p>`;
    if (!window.__onlineActive) clearAITimer();
    if (!dialog.open) dialog.showModal();
  }
  button.onclick = open;
  document.getElementById('openingContinue').onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    dialog.querySelector('video').pause();
    if (state && !window.__onlineActive) queueAutomaticTurn();
  });
  window.SuperidolEventPost = {
    isOpen: () => dialog.open,
    reset() { seen = false; if (dialog.open) dialog.close(); dialog.querySelector('video').pause(); },
    sync() {
      const active = state?.themeKey === 'sevenSecondServe';
      button.hidden = !active;
      if (active && !seen) { seen = true; open(); }
      if (!active && dialog.open) dialog.close();
    }
  };
})();
