/* Authored seven second posts. Resolve is pure. Only recordPlay writes history. */
(() => {
  const bi = (zh, en) => ({zh, en});
  const row = (id, faceZh, faceEn, zh, en, fullClip = false) => ({id,face:bi(faceZh,faceEn),speech:bi(zh,en),fullClip});
  const posts = [
    {
      star: {
        fact: row('H1E','十七岁，试镜。','Seventeen. An audition.','七年前试镜拍的，那年十七。现在看，确实有点不敢认。','An audition from seven years ago. I was seventeen. Watching it now is rough.'),
        stance: row('H1P','那几下是没跳好。','Those moves were bad.','那几下是没跳好。我自己也笑，就是没想到七年后还在循环。','Those moves were bad. I laughed too. Did not expect them to be on a loop seven years later.'),
        spread: row('H1R','给我留点别的代表作吧。','Leave room for my other work.','视频随便看。给我留点别的代表作吧。','Watch all you like. Just leave room for some of my other work.')
      },
      fan: {
        fact: row('M1E','完整版在这，是试镜。','The full audition is here.','完整版在这。那是试镜，不是正式演出，日期也在。','Here is the full clip. An audition, not a stage performance. The date is there too.',true),
        stance: row('M1P','我也笑了，别全算进去。','I laughed too. That is not everything.','我也笑了。但拿这七秒说他一直不会跳，就有点省事了。','I laughed too. Deciding he could never dance from seven seconds is pretty convenient.'),
        spread: row('M1R','转七秒的时候带上原片。','Share the original with the clip.','转那七秒的时候，把原片也带上吧。愿意看的人不用再到处找。','Share the original with those seven seconds. People who want to watch should not have to hunt for it.')
      },
      anti: {
        fact: row('B1E','年份没错，动作也是他跳的。','Old footage. Still his moves.','七年前的试镜，没错。那几个动作也确实是他自己跳的。','An audition from seven years ago, sure. He still did those moves himself.'),
        stance: row('B1P','我觉得他跳得不行。','I think he dances badly.','我觉得他跳得不行。怎么穿上舞台服，就得换个评价了。','I think he dances badly. Does putting on a stage outfit mean I have to change my review?'),
        spread: row('B1R','七秒版舞蹈鉴赏。','Seven seconds of dance criticism.','七秒版舞蹈鉴赏。不懂技术的也能看懂哪里好笑。','Seven seconds of dance criticism. No training needed to spot the funny part.')
      }
    },
    {
      star: {
        fact: row('H2E','视频还是那段旧试镜。','Still the old audition.','视频还是七年前那段试镜。再怎么转，也不会变成我昨天的演出。','It is still the audition from seven years ago. Reposting it will not turn it into a recent performance.'),
        stance: row('H2P','我觉得好笑，不等于我认了。','I laughed. That is not a verdict.','我觉得当年那几下好笑，不等于我觉得自己只会跳成那样。','I think those old moves are funny. That does not mean I think they are all I can do.'),
        spread: row('H2R','截我的话，后半句也带上。','Keep the second half too.','要截这条也行，以前没跳好的我认，现在的我请另看。后半句也带上。','Screenshot this if you want. I own those bad moves. Judge the present separately. Keep that last part too.')
      },
      fan: {
        fact: row('M2E','日期跟原片一起放这里。','The date and original are here.','原片和日期放在一起了。那时的试镜，别算成现在的舞台。','The original and date are here together. An old audition is not a current performance.',true),
        stance: row('M2P','笑视频，别装懂他整个人。','Laugh at the clip. You do not know him.','觉得好笑是一回事。看七秒就敢替他这些年下结论，你倒是真省事。','Finding it funny is one thing. Seven seconds and you can judge his whole career. Convenient.'),
        spread: row('M2R','带日期的版本也转一转。','Share the version with the date.','带日期的版本也转一转吧。不是所有刷到的人都知道这是七年前。','Share the version with the date too. Not everyone knows this is seven years old.')
      },
      anti: {
        fact: row('B2E','七年前能解释，不能证明实力。','The date does not fix the dancing.','日期我看到了，七年前。所以呢，这几个动作就跳好了？','I saw the date. Seven years ago. Does that make the moves good?'),
        stance: row('B2P','舞跳成这样，架子倒挺足。','Bad dancing. Plenty of ego.','舞跳成这样，明星架子倒挺足。水平不能跟名气一起涨吗？','He dances like that but gets to carry himself like a star. Could the skills catch up with the fame?'),
        spread: row('B2R','这几下也算实力派？','That is what talent looks like?','这几下换个人跳，你们自己都得笑。脸换成Haru就突然看懂艺术了。','You would laugh if anyone else danced like this. Put Haru on it and suddenly it is art.')
      }
    },
    {
      star: {
        fact: row('H3E','七年前的试镜，日期还在。','The date is still on the audition.','原视频的日期还在。试镜那年的我，不是此后每一年的我。','The date is still on the original. That audition is not every year of my life after it.'),
        stance: row('H3P','当年的难看我认。','I own how bad it looked then.','当年的难看我认。一辈子只会那几下，这个我不认。','I own how bad it looked then. That being all I will ever do, no.'),
        spread: row('H3R','下次也看看我现在跳的。','Watch a current performance too.','下次看到我的舞台，也点进去看一眼。看完还是觉得不行，再说。','Next time you see a performance of mine, watch it. If you still think it is bad, say so.')
      },
      fan: {
        fact: row('M3E','原片留着，谁想看就看。','The original stays here.','原片留在这里，日期也留着。以后谁想知道这七秒是哪来的，能找得到。','The original stays here with the date. Anyone who wants to know where the clip came from can find it.',true),
        stance: row('M3P','我喜欢他，也看得出失误。','I like him. I can see bad moves.','我喜欢他，又不是没见过这段。倒是拿七秒显得自己特别清醒的人，挺把自己当回事。','I like him. I have seen the clip. Acting clever because you watched seven seconds is quite an ego trip.'),
        spread: row('M3R','原片也留着，别只剩烂梗。','Save the original, not just the joke.','原片也留一份吧。别以后搜出来的全是几个自以为幽默的人在复读。','Keep a copy of the original too. Otherwise all that turns up will be the same joke from people who think they are hilarious.')
      },
      anti: {
        fact: row('B3E','旧归旧，这也是他跳的。','Old or not, he danced it.','这段是旧的，我知道。包装之前跳成这样，包装之后就不许人提了？','I know it is old. He danced like this before the branding. Once the branding arrives, nobody can mention it?'),
        stance: row('B3P','本事没看出来，面子倒挺贵。','Hard to see the talent. Easy to see the ego.','本事没看出来，面子倒挺贵。一个舞跳得这么搞笑的人，还得供着评价。','Hard to see the talent. Easy to see the ego. Someone dances this badly and I am meant to review him like royalty.'),
        spread: row('B3R','下次夸实力，想想这七秒。','Remember this when they say talent.','下次又有人说实力不用多说，就把这七秒放上去。确实不用多说了。','Next time someone says his talent speaks for itself, post these seven seconds. It really does.')
      }
    }
  ];
  // A combo is one authored post, not a concatenation of individual cards.
  const combos = [
    {
      star: [row('HP1','笑归笑，年份别省。','Laugh, but keep the date.','笑归笑，年份别省，我十七岁那场试镜不是现在的成绩单。','Laugh, but keep the date, my audition at seventeen is not my current report card.'),row('HR1','原片和日期一起看。','Watch it with the date.','先看原片，再看日期。那几下我没跳好，但别把七年一起剪掉。','Watch the original and check the date. Those moves were bad. Do not crop out seven years with them.'),row('HL1','试镜是我的，失误也认。','My audition. My mistakes.','试镜是我，没跳好也是我。年份放在那里，愿意看完整版的就看。','My audition, my bad moves. The date is there. The full clip is there if you want it.')],
      fan: [row('MP1','看得出失误，不等于不会跳。','A bad move is not a whole career.','那几下没跳好我看得出来，但你是把后面七年都看完了，才敢说他一直不会跳？','I can see the bad moves, but did you watch all seven years before deciding he could never dance?'),row('MR1','原片和日期都给你。','Here are the clip and date.','原片和日期都给你。看完可以不喜欢，别连是哪年的都懒得看。','Here are the original and date. You can dislike it. At least check what year it was.',true),row('ML1','七秒有失误，七年别一起删。','Bad moves, not seven missing years.','那几下确实好笑，原片也在这里。但他后面七年，不是你剪掉就不存在了。','Those moves are funny. The original is here too. Cropping out the next seven years does not erase them.',true)],
      anti: [row('BP1','看两遍，还是跳得差。','Watch twice. Still bad.','看了两遍还是跳得差，粉丝别光数年份，也数数他有几个动作像样。','I watched twice and he still dances badly, count his decent moves instead of counting years.'),row('BR1','试镜，旧视频，动作难看。','An old audition. Bad moves.','试镜，旧视频，十七岁。背景全带上了，现在能说动作难看了吗？','An audition. Old footage. Seventeen. All the context is here. Can I say the moves look bad now?'),row('BL1','背景没少，水平也没多。','More context. Same dancing.','七年前试镜这件事我记住了。动作难看也记住了，一起转，谁也别漏。','I remember that it was an audition seven years ago. I remember the bad moves too. Share both.')]
    },
    {
      star: [row('HP2','回应归回应，舞台另看。','A response is not a performance.','我可以认当年没跳好，但现在也只配那七秒，这句话我不接。','I can own the bad moves back then, but I will not accept being worth only those seven seconds now.'),row('HR2','把我说的话留完整。','Keep the whole sentence.','以前没跳好的我认，现在怎么样另看。这两句是一起的，别替我选。','I own what I did badly then. Judge the present separately. Those sentences go together. Do not choose for me.'),row('HL2','旧视频和现在，分开看。','Look at then and now separately.','旧视频是我拍的，解释也是我给的。我能说清楚的说清楚，舞台上的事留在舞台看。','I made the old video. I can give my own explanation. What I do on stage can be judged on stage.')],
      fan: [row('MP2','看懂年份很难吗？','Is reading the date that hard?','看懂年份很难吗，还是你就想拿这段说他不行，什么背景都嫌碍事？','Is reading the date that hard, or do you just want this to prove he is bad with context getting in the way?'),row('MR2','原片在这，别装找不到。','The original is here. No excuses.','原片在这，日期也在。再拿试镜当现在的舞台，是真看不懂还是装的？','The original and date are here. If an audition is still a current performance to you, are you confused or pretending?',true),row('ML2','看完再骂，别光挑省事的。','Watch it before judging.','视频可以笑，原片也在这。看七秒就装成什么都懂，倒是比看完整版省事。','Laugh at the video. The original is here. Acting like an expert after seven seconds is easier than watching it.',true)],
      anti: [row('BP2','这么会解释，不如练舞。','All that explaining. Try dancing.','这么会解释不如把舞练好点，粉丝替你忙成这样，你倒是争点气。','Try practising the dance instead of explaining it, your fans are working this hard, give them something.'),row('BR2','背景背完了，舞还是难看。','Context learned. Dancing still bad.','年份背了，试镜记了。舞还是难看，怎么还没轮到评价这个。','I learned the date. I remember it was an audition. The dance still looks bad. When do we get to that part?'),row('BL2','话说得漂亮，舞跳得搞笑。','Good words. Funny moves.','话可以说得漂亮，背景也可以给全。可看视频的时候，我笑的还是他那几个动作。','The words can sound good. The context can be complete. When I watch the video, I still laugh at his moves.')]
    },
    {
      star: [row('HP3','那年没跳好，不是一辈子。','That year is not my whole life.','那年没跳好不等于一辈子都没跳好，这个区别我还是要说。','Dancing badly then does not mean dancing badly forever, I am still going to make that distinction.'),row('HR3','旧视频留着，现在也看看。','Keep the old clip. Watch the present.','旧视频不用删。以后我再站上舞台，你也可以来看。别替我提前跳完。','Keep the old clip. When I am on stage again, you can watch. Do not decide how I dance before I do.'),row('HL3','旧的我认，现在我自己来。','I own the old. Let me do the new.','那几下我认，年份也留着。以后跳成什么样，我自己去跳，你们看完再说。','I own those moves. Keep the date too. I will do the dancing from here. Watch it and then judge.')],
      fan: [row('MP3','你不是清醒，是嫌看全太累。','Not insightful. Just too lazy to watch.','拿七秒当全部还觉得自己特别清醒，你只是嫌看全太累，别给自己加戏。','Seven seconds for the whole story and you think that makes you insightful, you just cannot be bothered to watch.'),row('MR3','原片给了，脑子自己带。','The clip is here. Bring a brain.','原片给了，日期也给了。脑子得自己带，这个我真帮不了。','The original and date are here. Bring your own brain. I really cannot help with that.',true),row('ML3','喜欢他，也比复读七秒强。','Liking him beats repeating seven seconds.','我喜欢他，也看得出失误。比起拿七秒复读一辈子，还觉得自己很幽默的人，我没什么不好意思的。','I like him and I can see mistakes. I am not embarrassed next to people repeating seven seconds forever and calling it comedy.')],
      anti: [row('BP3','水平没看见，脾气先上来了。','No talent in sight. Plenty of attitude.','水平没看见脾气先上来了，舞跳成这样还这么要面子，粉丝真挺辛苦。','No talent in sight but plenty of attitude, dancing like that with an ego this big must be exhausting for his fans.'),row('BR3','删掉名字，还剩什么水平？','Take off the name. What talent remains?','把名字和舞台服都拿掉，再看这几个动作。还觉得是实力派，那你要求真挺低。','Take away the name and stage outfit. Watch those moves again. If that is talent, your standards are low.'),row('BL3','七秒够记住这个水平。','Seven seconds to remember the standard.','原片旧，日期早，粉丝很喜欢。都记下了。可我提起他的舞蹈，还是先想起这七秒。','Old clip, early date, devoted fans. All noted. When I think of his dancing, these seven seconds still come first.')]
    }
  ];
  const variants = {
    repeat: row('fullclip-repeat','完整版我已经贴过了。','I already posted the full clip.','完整版我已经贴过了。日期就在上面，真不用猜是哪场演出。','I already posted the full clip. The date is on it. No need to guess which performance.',true),
    rebutted: row('fullclip-rebutted','原片又放上来了。','The original is back up.','原片又放上来了。把帖子压下去挺快，看一眼日期倒是费劲。','The original is back up. Quick to bury the post. Reading the date seems harder.',true),
    late: row('fullclip-late','原片给过了，脑子自己带。','The clip is here. Bring a brain.','原片和日期都给过了。还拿那七秒当全部，脑子是只够装七秒吗？','You already got the original and date. Still taking seven seconds for everything. Is that all your brain can hold?',true),
    selfQuote: row('selfquote-replayed','我笑的是当年的自己。','I laughed at my past self.','我笑的是当年的自己。不是替你认了我一直都不行。','I laughed at my past self. I did not agree that I was always bad.'),
    fanQuote: row('fanquote-replayed','后半句放回去很难吗？','Is putting the rest back that hard?','我没说他一直不会跳。把后半句放回去很难吗？','I did not say he could never dance. Is putting the rest back that hard?')
  };
  const support = [
    row('MS1','Haru十七岁，现在另看。','Haru was seventeen. Judge now separately.','那是Haru十七岁的试镜。没跳好的可以说，现在的他也该另看。','That is Haru at an audition when he was seventeen. Call out the bad moves. Judge him now separately.'),
    row('MS2','别替Haru把现在也认了。','Do not make Haru concede the present.','以前那几下没跳好，不等于Haru现在也只能那样。别替他把现在也认了。','Bad moves back then do not mean that is all Haru can do now. Do not concede the present for him.'),
    row('MS3','以后怎么跳，让Haru自己来。','Let Haru do the dancing from here.','旧视频留着，以后怎么跳让Haru自己来。别拿七秒替他跳完一辈子。','Keep the old video. Let Haru dance from here. Seven seconds cannot perform the rest of his life for him.')
  ];
  const stage = c => Math.max(0,Math.min(2,Number(c.issueIndex)||0));
  const isActive = c => c?.themeKey === 'sevenSecondServe';
  const authorOf = (card,c) => card.originalAuthor || card.role || c.currentRole || 'star';
  const channelOf = (card,pattern) => pattern?.wildAssignments?.find(x=>x.id===card.id)?.channel || card.channel || 'stance';
  const used = (c,id) => Boolean(c.narrative?.consumed?.[stage(c)]?.[id]);
  function ordinary(card,c,pattern) {
    if(card.isWork || card.id === 'star-work') return row('work','作品放这里。','Here is the work.',card.level>=6?'作品放这里。这次看我做的东西。':'还没做完，先把这部分放这里。',card.level>=6?'Here is the work. Look at what I made this time.':'It is not finished. Here is this part for now.');
    if(card.role==='fan' && (c.fanVoiceChoice || c.fanVoiceThisRound)==='star') return support[stage(c)];
    return posts[stage(c)][authorOf(card,c)]?.[channelOf(card,pattern)] || posts[stage(c)].star.stance;
  }
  function exactSource(card) {
    const src=card.capturedFrom, text={...src.text}, excerpt={};
    for(const lang of ['zh','en']) {
      const original=text[lang] || '', candidate=src.excerpt?.[lang];
      excerpt[lang]=candidate && original.includes(candidate) ? candidate : original.split(/[。.!?？]/).find(s=>s.trim()) || original;
    }
    return {...src,text,excerpt};
  }
  function quoteRow(src,c) {
    const raw=src.text.zh;
    if(raw.includes('给我留点别的代表作')) return row('quote-work','新代表作能超过七秒版吗？','Can the new work beat seven seconds?','新代表作什么时候能超过七秒版？','When will the new work beat the seven second version?');
    if(raw.includes('当年的难看我认')) return row('quote-admit','难看不是黑粉替他说的。','He supplied the word bad.','难看不是黑粉替他说的。这个词，大家记一下。','He supplied the word bad himself. Remember that word.');
    if(raw.includes('我也笑了') && src.role==='fan') return row('quote-fan-laugh','原来大家笑的是同一段。','We laughed at the same bit.','原来大家笑的是同一段。至少这七秒没冤枉剪辑。','We laughed at the same bit. At least these seven seconds did the edit justice.');
    if(raw.includes('我喜欢他')) return row('quote-fan-like','喜欢当然没问题。','Liking him is fine.','喜欢当然没问题。但我在说他跳得怎么样。','Liking him is fine. I am talking about how he dances.');
    if(src.role==='star' && /笑|没跳好/.test(raw)) return row('quote-self-laugh','连本人都看笑了。','Even he laughed at it.','这七秒连本人都看笑了。','Even he laughed at these seven seconds.');
    return row('quote-general','这句没改变我的评价。','That does not change my review.',stage(c)===2?'说得再好听，那几个动作也还是难看。':'我看的是他跳得怎么样。这句没改变我的评价。',stage(c)===2?'Pretty words. Those moves still look bad.':'I am looking at how he dances. That does not change my review.');
  }
  function cardFace(card,c,pattern) {
    return card.capturedFrom ? quoteRow(exactSource(card),c).face : ordinary(card,c,pattern).face;
  }
  function resolve(cards,c,pattern) {
    const chosen=cards || [], role=c.currentRole || chosen[0]?.role || 'star', author=role;
    const owner=role==='fan' && (c.fanVoiceChoice || c.fanVoiceThisRound)==='star' ? 'star' : role;
    const originals=chosen.map(card=>ordinary(card,c,pattern));
    const captured=chosen.filter(card=>card.capturedFrom), quoteSources=captured.map(exactSource);
    let selected=originals[0] || row('empty','','','',''), variantId=null;
    if(captured.length) {
      selected=quoteRow(quoteSources[0],c);
      const id=`quote:${selected.id}:${quoteSources[0].postId || quoteSources[0].publishedAt || ''}:${quoteSources[0].text.zh}`;
      if(!used(c,id)) variantId=id;
      else selected=row('quote-repeated','这句没改变我的评价。','That does not change my review.','我看的是他跳得怎么样。这句没改变我的评价。','I am looking at how he dances. That does not change my review.');
    } else if(['pair','run','loop'].includes(pattern?.type) && !chosen.some(card=>card.isWork || card.id==='star-work')) {
      let event=null; const facts=c.narrative?.facts || {};
      if(owner===role && pattern.type!=='loop') {
        if(role==='fan' && pattern.channel==='fact' && facts.fullClipByFan) {
          event=facts.fullClipRebutted ? (stage(c)===2?variants.late:variants.rebutted) : variants.repeat;
        } else if(role==='star' && facts.selfLaughReplayed) event=variants.selfQuote;
        else if(role==='fan' && facts.fanLaughReplayed) event=variants.fanQuote;
      }
      if(event && !used(c,event.id)) {selected=event;variantId=event.id;}
      else {
        const idx={pair:0,run:1,loop:2}[pattern.type];
        const combo=owner!==role?support[stage(c)]:combos[stage(c)][role]?.[idx];
        const id=`combo:${pattern.type}:${role}:${owner}`;
        if(combo && !used(c,id)) {selected=combo;variantId=id;}
      }
    }
    const body={...selected.speech}, speech={...body};
    if(quoteSources.length) for(const lang of ['zh','en']) speech[lang]=[...new Set(quoteSources.map(src=>src.excerpt[lang])),body[lang]].join('\n');
    const faces=Object.fromEntries(chosen.map(card=>[card.id,{...(variantId || captured.length ? selected.face : cardFace(card,c,pattern))}]));
    return {speech,body,faces,variantId,postId:`seven-${stage(c)}-${(c.narrative?.nextId || 0)+1}`,contentId:selected.id,author,owner,
      quoteSources,facts:{fullClip:!captured.length && Boolean(selected.fullClip)},issueIndex:stage(c)};
  }
  function recordPlay(c,cards,pattern,resolved,previousTop) {
    if(!isActive(c)) return null;
    const r=resolved || resolve(cards,c,pattern);
    const n=c.narrative ||= {version:1,nextId:0,consumed:{},facts:{},posts:[]};
    n.consumed ||= {}; n.facts ||= {}; n.posts ||= [];
    // A duplicate success callback does not consume another post or lose history.
    if(n.posts.some(post=>post.postId===r.postId)) return n.posts.find(post=>post.postId===r.postId);
    if(r.variantId) (n.consumed[r.issueIndex] ||= {})[r.variantId]=true;
    n.nextId=(n.nextId || 0)+1;
    if(r.facts.fullClip && r.author==='fan') n.facts.fullClipByFan=true;
    const previous=previousTop?.postId ? n.posts.find(p=>p.postId===previousTop.postId) : n.posts.at(-1);
    if(previousTop && previous?.author==='fan' && previous.facts.fullClip && previous.author!==r.author) n.facts.fullClipRebutted=true;
    for(const source of r.quoteSources) {
      if(source.role==='star' && /笑|没跳好/.test(source.text.zh) && /笑|bad moves|laughed/i.test(source.excerpt.zh+' '+source.excerpt.en)) n.facts.selfLaughReplayed=true;
      if(source.role==='fan' && source.excerpt.zh.includes('我也笑了')) n.facts.fanLaughReplayed=true;
    }
    const post=JSON.parse(JSON.stringify({...r,patternType:pattern?.type,publishedAt:c.storyTime || null}));
    n.posts.push(post);
    return post;
  }
  const stages=[bi('视频被翻出来','The clip resurfaces'),bi('回应也被转起来了','Responses become material'),bi('大家开始用一句话概括他','A label starts to stick')];
  globalThis.SuperidolNarrative={isActive,posts,combos,variants,support,stages,ordinary,cardFace,resolve,recordPlay,exactSource};
})();
