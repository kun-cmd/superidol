/* Shared authored responses. Levels change rhetorical force, never establish truth. */
(() => {
  const pair = (zh, en) => ({ zh, en });
  const narrative = context => globalThis.SuperidolNarrative?.isActive?.(context) ? globalThis.SuperidolNarrative : null;
  const topics = {
    sevenSecondServe: [
      {
        fact: pair("流传的是七年前试镜里截出的三秒", "The viral clip is three seconds cut from an audition seven years ago"),
        star: pair("十七岁的失误不能替现在的我发言", "A mistake at seventeen cannot speak for who I am now"),
        fan: pair("那段笨拙的尝试里已经有他的才华", "His talent was already there in that awkward experiment"),
        anti: pair("大家笑的恰恰是包装之前的他", "People are laughing at who he was before the packaging"),
      },
      {
        fact: pair("版权下架和团队的强硬声明都已经发生", "The copyright takedowns and the team's hard-line statement have already happened"),
        star: pair("我可以被开玩笑，团队无权替我威胁别人", "People can joke about me; my team cannot threaten them in my name"),
        fan: pair("几百万人重复一个笑话，对他就是围攻", "Millions repeating one joke amounts to a pile-on against him"),
        anti: pair("大明星连别人怎么玩梗都要管", "A megastar even wants control over how people make memes"),
      },
      {
        fact: pair("被反复转发的还是那段三秒旧视频", "The same three seconds of old footage keep being reposted"),
        star: pair("接下来做什么，应该由我自己决定", "What I do next should be mine to decide"),
        fan: pair("热梗会过去，我们认识的那个他不会变", "The meme will pass; the person we know will not change"),
        anti: pair("这个梗比他的明星人设更像他", "This meme looks more like him than his star persona does"),
      },
    ],
    voiceNote: [
      {
        fact: pair("他承认交往和支付医疗费，但否认胁迫", "He admits the relationship and medical payments, but denies coercion"),
        star: pair("我确认自己的行为，不替她公开私生活", "I can confirm my actions without exposing her private life"),
        fan: pair("愿意付钱照顾她，说明他没有逃避责任", "Paying to care for her shows he did not run from responsibility"),
        anti: pair("承认时间线以后，别再把整件事叫谣言", "After admitting the timeline, he cannot dismiss the whole story as a rumor"),
      },
      {
        fact: pair("回应晚于录音传播，双方的权力也不对等", "His response came after the recording spread, and the two parties do not have equal power"),
        star: pair("她不是公众人物，我不能拿她的隐私自证", "She is not a public figure; her privacy is not mine to trade for a defense"),
        fan: pair("他宁愿被骂，也没有把她推到聚光灯下", "He took the abuse instead of pushing her into the spotlight"),
        anti: pair("有团队的人越沉默，就越有时间安排说法", "Someone with a team can use silence to get their story in order"),
      },
      {
        fact: pair("他承认自私和逃避，却没有承认所有指控", "He admits selfishness and avoidance, but not every allegation"),
        star: pair("我该负责的由我负责，不实的指控不会因此成真", "I must own what I did; that does not make every allegation true"),
        fan: pair("一次私生活里的错误不能抹掉他整个人", "One private mistake cannot erase the whole person"),
        anti: pair("一份体面的道歉没有回答谁掌握权力", "A polished apology does not answer who held the power"),
      },
    ],
    comeback: [
      {
        fact: pair("完整混音里有人声主轨，也有伴唱轨", "The full mix contains both a live lead vocal and a backing track"),
        star: pair("使用伴唱是我的选择，我愿意说明怎么演的", "Using a backing track was my choice; I will explain how we performed"),
        fan: pair("保护嗓子不能被说成欺骗观众", "Protecting his voice should not be called deceiving the audience"),
        anti: pair("拿真实当卖点，就别在伴唱上含糊其辞", "If honesty is the selling point, stop being vague about the backing track"),
      },
      {
        fact: pair("原始小样另有作者，他参与改写和制作", "The original demo has another writer; he worked on rewriting and production"),
        star: pair("这是我和团队一起做的，不是独自创造的神话", "I made this with a team; it is not a myth of solitary genius"),
        fan: pair("别人也能合作，只有他能把它做成这样", "Others can collaborate; only he could have made it turn out like this"),
        anti: pair("小样让人看见这个天才人设是怎么组装的", "The demo shows how the genius persona gets assembled"),
      },
      {
        fact: pair("复出舞台已经回到聚光灯中心", "The comeback performance has already put him back in the spotlight"),
        star: pair("请评价我接下来做的事，别替我宣布洗白", "Judge what I do next; do not declare me redeemed"),
        fan: pair("他已经吃够苦，该拿回属于他的位置了", "He has suffered enough; he deserves his place back"),
        anti: pair("少上几次舞台不等于已经付出代价", "Missing a few stages does not mean he has faced consequences"),
      },
    ],
    roomTone: [
      {
        fact: pair("十首歌里他制作了八首，也保留了不完美的人声", "He produced eight of ten tracks and kept imperfect vocals on the record"),
        star: pair("先听作品，别急着把它写成我的救赎", "Listen to the work before writing my redemption story"),
        fan: pair("这证明我们一直守护的就是真正的艺术家", "This proves the person we always defended was a real artist"),
        anti: pair("音乐变好，照样可以是一场形象修复", "Better music can still be image repair"),
      },
      {
        fact: pair("歌词写了他的选择，却没有把她写成角色", "The lyrics address his choices without turning her into a character"),
        star: pair("我可以写自己，不能把别人的人生当素材", "I can write about myself without making someone else's life my material"),
        fan: pair("歌词里藏着他终于肯说出的真心", "The lyrics hold the hidden truth he is finally willing to share"),
        anti: pair("含糊的自白既能收获同情，又不用交代细节", "An ambiguous confession earns sympathy without giving specifics"),
      },
      {
        fact: pair("新专辑已经发行，过去的事件也没有消失", "The new album is out; the earlier events have not disappeared"),
        star: pair("让我选择的作品定义我，不要用替我辩护的故事定义我", "Let the work I chose define me, not the stories told in my defense"),
        fan: pair("他终于让所有人看到了我们早就认识的他", "He has finally shown everyone the person we always knew"),
        anti: pair("专辑只是添进记录，不能替换过去", "The album adds to the record; it does not replace the past"),
      },
    ],
  };
  const names = { star: "Haru", fan: "Maya", anti: "Ben" };
  const end = (s, lang) => s.replace(/[。.?!！]$/, "") + (lang === "zh" ? "。" : ".");
  function ordinary(card, context, pattern) {
    const role = card.originalAuthor || card.role || context.currentRole || "star";
    const topic = (topics[context.themeKey] || topics.sevenSecondServe)[Math.min(context.issueIndex || 0, 2)];
    const assignment = pattern?.wildAssignments?.find(item => item.id === card.id);
    const level = Math.max(1, Math.min(5, assignment?.level ?? card.level ?? 1));
    const channel = assignment?.channel || card.channel;
    if (card.isWork || card.id === "star-work") return pair(
      card.level >= 6 ? "作品就在这里。这次让我自己做的东西说话。" : "我还在把自己的回应做成作品，先把这一部分交给你们。",
      card.level >= 6 ? "Here is the work. Let something I made speak for me this time." : "I am still turning my response into work. Here is what I can share now.");
    const result = {};
    for (const lang of ["zh", "en"]) {
      const f = topic.fact[lang], s = topic[role][lang], zh = lang === "zh";
      const variants = channel === "fact" ? (zh ? [
        `先看这一处：${f}。我看到的是，${s}`, `别漏掉这个背景：${f}。这也是我为什么说，${s}`,
        `${f}。所以我的解释是：${s}`, `把公开的内容和结论分开：${f}；我由此认为，${s}`,
        `把记录摆在一起再下结论：${f}。我的判断很明确，${s}`,
      ] : [
        `Start with this detail: ${f}. What I see is: ${s}`, `Keep this context: ${f}. That is why I say: ${s}`,
        `${f}. My reading is: ${s}`, `Separate the public record from the conclusion: ${f}. What I take from it is: ${s}`,
        `Put the record together before deciding: ${f}. My conclusion is clear: ${s}`,
      ]) : channel === "spread" ? (zh ? [
        `别只转那一边，也看看这句：${s}`, `把这句转给还没看到的人：${s}`,
        `别让这句话沉下去：${s}`, `转发的时候把重点放在这里：${s}`,
        `让每个刷到这件事的人都看到：${s}`,
      ] : [
        `Before reposting only their side, read this too: ${s}`, `Send this to someone who has not seen it: ${s}`,
        `Do not let this get buried: ${s}`, `When you repost, make this the point: ${s}`,
        `Put this in front of everyone seeing this story: ${s}`,
      ]) : (zh ? [
        `我更愿意这样理解：${s}`, `我不同意现在的定性：${s}`, `这件事的重点是：${s}`,
        `别再绕开真正的问题：${s}`, `我不会接受另一套定性：${s}`,
      ] : [
        `This is how I read it: ${s}`, `I disagree with the current framing: ${s}`, `This is what matters: ${s}`,
        `Stop talking around the real issue: ${s}`, `I will not accept a different framing: ${s}`,
      ]);
      result[lang] = end(variants[level - 1], lang);
    }
    return result;
  }
  function cardSpeech(card, context, pattern) {
    const authored = narrative(context);
    if (authored) return authored.ordinary(card, context, pattern).speech;
    if (!card.capturedFrom) {
      if(card.role === "fan" && (context.fanVoiceThisRound || context.fanVoiceChoice) === "star") {
        const text = ordinary({...card, originalAuthor:"star"}, context, pattern);
        return pair(`请把Haru的回应也看完：“${text.zh}”`, `Read Haru's response too: “${text.en}”`);
      }
      return ordinary(card, context, pattern);
    }
    const quote = card.capturedFrom.excerpt || card.capturedFrom.text;
    const topic = (topics[context.themeKey] || topics.sevenSecondServe)[Math.min(context.issueIndex || 0, 2)];
    const source = names[card.capturedFrom.role] || "Haru";
    return pair(`${source}自己说过：“${quote.zh}”——在我看来，${topic.anti.zh}。`,
      `${source} said: “${quote.en}” To me, that is exactly the point: ${topic.anti.en}.`);
  }
  function compose(cards, context, pattern) {
    const authored = narrative(context);
    if (authored) return authored.resolve(cards, context, pattern).speech;
    // Every legal group is one post, including events without a bespoke narrative pack.
    if (['pair', 'run', 'loop'].includes(pattern?.type) && cards.length) {
      const representative = cards.find(card => card.capturedFrom)
        || [...cards].sort((a, b) => (b.level || 0) - (a.level || 0))[0];
      return cardSpeech(representative, context, pattern);
    }
    const parts = [], seen = new Set();
    for (const card of cards) {
      const text = cardSpeech(card, context, pattern), key = JSON.stringify(text);
      if (!seen.has(key)) { seen.add(key); parts.push(text); }
    }
    return pair(parts.map(p => p.zh).join("\n"), parts.map(p => p.en).join("\n"));
  }
  function freezeCards(cards, context, pattern, resolved) {
    const authored = narrative(context);
    if (authored) {
      const post = resolved || authored.resolve(cards, context, pattern);
      return cards.map(card => ({ ...card, speech: { ...post.body } }));
    }
    const shared = ['pair', 'run', 'loop'].includes(pattern?.type) ? compose(cards, context, pattern) : null;
    return cards.map(card => ({ ...card, speech: shared || cardSpeech(card, context, pattern) }));
  }
  function capture(cards, top, context) {
    const authored = narrative(context);
    if (authored) {
      const text = top.body || top.speech || pair("", "");
      for (const card of cards) {
        card.capturedFrom = { role: top.role, owner: top.owner, postId: top.postId,
          themeKey: context.themeKey, issueIndex: context.issueIndex, publishedAt: top.publishedAt,
          text: { ...text }, excerpt: {
            zh: text.zh.split(/[。？]/).find(part => part.trim()) || text.zh,
            en: text.en.split(/[.?]/).find(part => part.trim()) || text.en,
          } };
      }
      return;
    }
    for (const card of cards) {
      const published = top.cards.find(item => item.id === card.id);
      const text = published?.speech || cardSpeech(published || card, context, top.pattern);
      card.capturedFrom = { role: top.role, themeKey: context.themeKey, issueIndex: context.issueIndex,
        publishedAt: top.publishedAt, text: { ...text }, excerpt: {
          zh: text.zh.split(/[。；]/).find(part => part.trim()) || text.zh,
          en: text.en.split(/[.;]/).find(part => part.trim()) || text.en,
        } };
    }
  }
  function cardFace(card, context, pattern) {
    const authored = narrative(context);
    if (authored) return authored.cardFace(card, context, pattern);
    if (card.isWork || card.id === "star-work") return cardSpeech(card, context, pattern);
    const topic = (topics[context.themeKey] || topics.sevenSecondServe)[Math.min(context.issueIndex || 0, 2)];
    const voice = card.capturedFrom ? "anti" : card.role === "fan" && (context.fanVoiceThisRound || context.fanVoiceChoice) === "star" ? "star" : card.originalAuthor || card.role || context.currentRole;
    if (card.capturedFrom) return pair('这句话也在原帖里。', 'That was in the original post too.');
    const channel = pattern?.wildAssignments?.find(item => item.id === card.id)?.channel || card.channel;
    if (channel === 'fact') return pair(end(topic.fact.zh, 'zh'), end(topic.fact.en, 'en'));
    const stance = topic[voice];
    if (!stance) return cardSpeech(card, context, pattern);
    if (channel === 'spread') return pair(`转发前也看看这句。${end(stance.zh, 'zh')}`, `Read this before reposting. ${end(stance.en, 'en')}`);
    return pair(end(stance.zh, 'zh'), end(stance.en, 'en'));
  }
  function resolve(cards, context, pattern) {
    const authored = narrative(context);
    if (authored) return authored.resolve(cards, context, pattern);
    const speech = compose(cards, context, pattern);
    return { speech, body: speech, faces: Object.fromEntries(cards.map(card => [card.id, cardFace(card, context, pattern)])),
      variantId: null, postId: null, quoteSources: [], facts: {}, author: context.currentRole || cards[0]?.role, owner: context.currentRole || cards[0]?.role };
  }
  function recordPlay(context, cards, pattern, resolved, previousTop) {
    return narrative(context)?.recordPlay(context, cards, pattern, resolved, previousTop) || null;
  }
  globalThis.SuperidolSpeech = { topics, cardSpeech, cardFace, compose, freezeCards, capture, resolve, recordPlay };
})();
