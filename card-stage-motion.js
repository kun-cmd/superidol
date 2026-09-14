/* Presentation only: canonical bilingual faces are never edited or stored as game speech. */
(() => {
  let previous = null;
  let frame = 0;
  const effects = new Map();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const language = () => document.documentElement.lang === "en" ? "en" : "zh";
  const split = text => typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), item => item.segment)
    : Array.from(text);

  function finish(effect) {
    effect.heading?.classList.remove("card-text-changing");
    effect.overlay?.remove();
  }

  function cancel() {
    cancelAnimationFrame(frame);
    frame = 0;
    effects.forEach(finish);
    effects.clear();
  }

  function reset() {
    cancel();
    previous = null;
  }

  function attach(effect, heading) {
    if (effect.heading === heading && effect.overlay?.isConnected) return;
    finish(effect);
    effect.heading = heading;
    heading.classList.add("card-text-changing");
    effect.overlay = document.createElement("span");
    effect.overlay.className = "card-motion-text";
    effect.overlay.setAttribute("aria-hidden", "true");
    effect.overlay.setAttribute("data-i18n-skip", "");
    heading.appendChild(effect.overlay);
  }

  function paint(now) {
    frame = 0;
    for (const [id, effect] of effects) {
      if (!effect.heading.isConnected || language() !== effect.lang || reducedMotion.matches) {
        finish(effect);
        effects.delete(id);
        continue;
      }
      const elapsed = now - effect.started;
      if (elapsed >= effect.duration) {
        finish(effect);
        effects.delete(id);
        continue;
      }
      if (elapsed < effect.eraseMs) {
        const left = Math.max(0, effect.from.length - Math.floor(elapsed / effect.eraseMs * effect.from.length));
        effect.displayText = effect.from.slice(0, left).join("");
      } else if (elapsed < effect.eraseMs + 70) {
        effect.displayText = "";
      } else {
        const typed = Math.min(effect.to.length, Math.floor((elapsed - effect.eraseMs - 70) / effect.typeMs * effect.to.length));
        effect.displayText = effect.to.slice(0, typed).join("");
      }
      effect.overlay.textContent = effect.displayText + "_";
    }
    if (effects.size) frame = requestAnimationFrame(paint);
  }

  function update(hand, context) {
    // Round-break rendering advances the rules state while a modal covers the hand.
    // Keep the old stage snapshot so the player sees the rewrite after continuing.
    if (context.active === false) {
      cancel();
      return;
    }
    const lang = language();
    const entries = new Map(Array.from(hand.querySelectorAll("[data-card]"), card => {
      const heading = card.querySelector("h3.card-speech");
      const text = heading?.querySelector(`.card-canonical-speech .speech-${lang}`)?.textContent || "";
      return [card.dataset.card, { heading, text }];
    }).filter(([, value]) => value.heading));
    const sameEvent = previous && previous.eventKey === context.eventKey && context.progress >= previous.progress;
    const stageChanged = sameEvent && previous.lang === lang && previous.stageKey !== context.stageKey;

    if (!sameEvent || previous?.lang !== lang || reducedMotion.matches) cancel();
    if (stageChanged && !reducedMotion.matches) {
      const visibleBefore = new Map(Array.from(effects, ([id, effect]) => [id, effect.displayText]));
      cancel();
      const started = performance.now();
      for (const [id, entry] of entries) {
        const before = previous.entries.get(id);
        if (!before || before.text === entry.text) continue;
        const from = split(visibleBefore.get(id) ?? before.text), to = split(entry.text);
        const eraseMs = Math.min(500, Math.max(180, from.length * 14));
        const typeMs = Math.min(850, Math.max(320, to.length * 22));
        const effect = { from, to, text: entry.text, lang, started, eraseMs, typeMs, duration: eraseMs + 70 + typeMs, displayText: from.join("") };
        attach(effect, entry.heading);
        effect.overlay.textContent = effect.displayText + "_";
        effects.set(id, effect);
      }
    } else {
      // A normal render may replace every hand node. Continue only unchanged targets;
      // selection, deselection, gifting and voice changes show their new face immediately.
      for (const [id, effect] of effects) {
        const entry = entries.get(id);
        if (!entry || entry.text !== effect.text) {
          finish(effect);
          effects.delete(id);
        } else {
          attach(effect, entry.heading);
          effect.overlay.textContent = effect.displayText + "_";
        }
      }
    }
    previous = { ...context, lang, entries: new Map(Array.from(entries, ([id, entry]) => [id, { text: entry.text }])) };
    if (effects.size && !frame) frame = requestAnimationFrame(paint);
  }

  new MutationObserver(() => { if (previous && previous.lang !== language()) cancel(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  const startDialog = document.getElementById("startDialog");
  if (startDialog) new MutationObserver(() => { if (startDialog.open) reset(); })
    .observe(startDialog, { attributes: true, attributeFilter: ["open"] });
  reducedMotion.addEventListener("change", cancel);
  window.SuperidolCardMotion = { update, reset };
})();
