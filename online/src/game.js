export const ROLE_ORDER = ["anti", "star", "fan"];

export const ROLES = {
  star: { name: "明星本人 · Eli", short: "Eli" },
  fan: { name: "真爱粉 · Maya", short: "Maya" },
  anti: { name: "黑粉 · Ben", short: "Ben" },
};

export const CHANNELS = {
  fact: { name: "Evidence" },
  stance: { name: "Position" },
  spread: { name: "Reach" },
};

export const PATTERN_NAMES = {
  single: "单张",
  pair: "同调对子",
  run: "连续论证",
  loop: "闭环叙事",
};

export const ISSUE_MARKER_TARGET = 2;
export const ROUND_MARKER_GAIN = 1;
export const HEAT_INTERVENTION_THRESHOLDS = [35, 75];

const DECK_COPIES = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 1 };
const ANTI_CAPTURE_LIMIT = 1;
const STAR_WORK_START_LEVEL = 2;
const STAR_WORK_RELEASE_LEVEL = 6;
const PRESSURE_MAX = 4;
const PRESSURE_RECOVERY = 2;
const CAMPAIGN_START_TIME = Date.UTC(2026, 3, 18, 9, 20);

const CARD_NAMES = {
  star: {
    fact: ["Here Is the Original", "My Timeline", "What I Can Confirm", "The Full Record", "Independent Verification"],
    stance: ["I'm Not Ready to Label This", "This Is What I Meant", "I Handled This Badly", "This Part Is Mine", "I Will Answer for It"],
    spread: ["A Short Personal Note", "My Statement", "The Full Interview", "Live, Without a Script", "Say It Everywhere"],
  },
  fan: {
    fact: ["The Clip Leaves This Out", "Receipts From Public Posts", "The Timeline That Makes Sense", "Everything We Found", "The Case for His Side"],
    stance: ["Give Him Time", "He Was Trying to Protect Someone", "You Are Reading Him in Bad Faith", "We Know What Kind of Person He Is", "We Stand by the Eli We Believe In"],
    spread: ["Share the Part They Cut", "Our Explanation Thread", "Keep the Context on Top", "Everyone Post the Same Timeline", "Make His Side Impossible to Ignore"],
  },
  anti: {
    fact: ["Where Did This Come From?", "The Timestamps Don't Match", "What the Statement Skipped", "The Contradictions, Side by Side", "The Full Investigation"],
    stance: ["I Still Have Questions", "Don't Call This Cleared Up", "That Answer Avoids the Point", "Fame Changes the Balance of Power", "Accountability Before Comeback"],
    spread: ["Repost the Screenshot", "Clip the Weak Part", "Turn It Into a Format", "Keep the Question Trending", "Put It on Every Feed"],
  },
};

const CARD_DISPLAY_NAMES = {
  star: {
    fact: ["Full Clip", "My Timeline", "What I Know", "Full Record", "Outside Proof"],
    stance: ["No Label Yet", "What I Meant", "I Got This Wrong", "This Part Is Mine", "I Will Answer"],
    spread: ["Quick Note", "My Statement", "Full Interview", "Live, No Script", "Post It All"],
  },
  fan: {
    fact: ["Missing Context", "Public Receipts", "Our Timeline", "What We Found", "Eli's Side"],
    stance: ["Give Him Time", "He Meant Well", "Bad Faith Read", "We Know Him", "We Still Back Eli"],
    spread: ["Share the Cut", "Our Thread", "Pin the Context", "Post One Timeline", "Keep His Side Up"],
  },
  anti: {
    fact: ["Who Posted This?", "The Time Is Off", "What Was Left Out", "The Facts Clash", "Full Case File"],
    stance: ["Still Have Questions", "Not Cleared Up", "Answer the Point", "Fame Has Power", "Answer Before Return"],
    spread: ["Share the Shot", "Clip the Weak Part", "Make It a Meme", "Keep It Trending", "Post It Everywhere"],
  },
};

const EVENT_THEMES = {
  sevenSecondServe: { eyebrow: "OLD CLIP / NEW MEME", title: "The Seven-Second Serve", copy: "A seven-year-old audition clip becomes a fight over who owns the joke.", fragmentTitle: "Afterimage", issues: [
    { title: "What are people actually watching?", claims: { star: "It's a cropped mistake from when I was seventeen.", fan: "He was already experimenting. The crop hides how much talent was there.", anti: "The crop works because the full performance is still awkward." }, bystander: "Show the uncut clip before telling us what it proves." },
    { title: "Who owns the joke?", claims: { star: "I don't need protection from a joke. I need my team to stop threatening people.", fan: "This stopped being a joke when millions used it to humiliate him.", anti: "A megastar does not get to decide when remix culture stops." }, bystander: "The takedown made this feel bigger than the clip." },
    { title: "What survives after the trend dies?", claims: { star: "Let my next work speak in a voice I chose.", fan: "The real Eli is the hardworking person we have always known.", anti: "The meme is more honest than the brand." }, bystander: "How he responds now may matter more than seven old seconds." },
  ], bystander: { watching: "I want the full clip before I join either side.", warning: { 35: "This stopped being a joke and became a fight over who controls the feed.", 75: "The joke is everywhere, but the same side still controls what it means." }, intervention: ["[Winner] keeps the point. Let [Next speaker] post first before the same account sets the tone again.", "The other side gets the opening this time. No one account owns the meme."], reset: ["New thread. Show context, not another victory lap.", "I have seen the clip. Now I am watching what each side does with it."] } },
  voiceNote: { eyebrow: "PRIVATE CLAIM / PUBLIC TRIAL", title: "The 2:17 Voice Note", copy: "A relationship, payments, an unsigned NDA and an eighteen-second voice note arrive together.", fragmentTitle: "Low Signal", issues: [
    { title: "What has actually been established?", claims: { star: "We had a relationship. I paid medical costs. I will not publish her private details.", fan: "He paid because he took responsibility, not because he was guilty.", anti: "The admission confirms the core timeline, not the coercion claim." }, bystander: "Separate what he admitted from what the thread alleged." },
    { title: "What does his silence mean?", claims: { star: "I waited because the other person is not public.", fan: "He stayed silent to protect her, even while everyone attacked him.", anti: "Silence gives the more powerful party time to coordinate." }, bystander: "Delay can be restraint or control. The missing context matters." },
    { title: "What would accountability look like?", claims: { star: "I was selfish and avoidant. I can own that without confirming false claims.", fan: "One private mistake should not erase years of good character.", anti: "A polished admission still avoids who held the power." }, bystander: "Accountability should name harm without demanding public spectacle." },
  ], bystander: { watching: "What is admitted, what is alleged, and what is still private? Keep those separate.", warning: { 35: "This is moving faster than the evidence, and one side is controlling every reply.", 75: "The feed is rewarding certainty before anyone has the full record." }, intervention: ["[Winner] keeps the result. [Next speaker] gets the next opening so this does not become a one-sided trial.", "The side that has not been heard gets the first post now. The winner does not get another automatic microphone."], reset: ["I am listening again. Do not turn another person's privacy into filler.", "No verdict from me yet. I am watching who distinguishes responsibility from rumor."] } },
  comeback: { eyebrow: "COMEBACK / AUTHENTICITY TEST", title: "The Comeback Rehearsal", copy: "A rehearsal leak turns the comeback into a trial of live vocals, credit and authenticity.", issues: [
    { title: "Was the performance fake?", claims: { star: "The live stem is there. Using a backing track was my choice.", fan: "He was protecting his voice after everything he survived.", anti: "A comeback sold as raw honesty should not hide behind a track." }, bystander: "Release the full mix. Twenty-six seconds cannot settle it." },
    { title: "Whose comeback is this?", claims: { star: "I rewrote and produced this with a team. I will not call it solo work.", fan: "Everyone collaborates. It still sounds like Eli because only he could finish it.", anti: "The unknown demo shows how much of the artist was assembled." }, bystander: "Credit matters more than the myth of the lone genius." },
    { title: "Should the industry put him back at center stage?", claims: { star: "I am asking to be judged by what I do next, not declared redeemed.", fan: "He has suffered enough and deserves his place back.", anti: "Missing the spotlight is not a consequence." }, bystander: "A return is not forgiveness. It is another chance to be observed." },
  ], bystander: { watching: "Let us hear the full mix before calling it live or fake.", warning: { 35: "The clip is deciding the comeback before the performance is even public.", 75: "The comeback has become another contest to own the headline." }, intervention: ["[Winner] keeps the round. [Next speaker] gets the first response to the full audio.", "The side still buried under the winning narrative gets the next opening."], reset: ["Now compare the recording, the credits, and what the campaign promised.", "I am not choosing redemption or cancellation. I am watching the work."] } },
  roomTone: { eyebrow: "ALBUM BRANCH UNLOCKED", title: "ROOM TONE", copy: "A ten-track album advances the music without erasing the archive.", issues: [
    { title: "Is ROOM TONE a real artistic leap?", claims: { star: "Hear the record before turning it into a redemption story.", fan: "This proves the person we defended was always a real artist.", anti: "Better music can still be strategic image repair." }, bystander: "The music can improve even if the moral questions remain." },
    { title: "Is he honest—or better at telling the story?", claims: { star: "I wrote about my choices. I refused to turn someone else into a character.", fan: "Every lyric is his hidden truth finally coming out.", anti: "Ambiguity lets him monetize confession without being specific." }, bystander: "Art can reveal feeling without functioning as testimony." },
    { title: "What defines Eli Mercer now?", claims: { star: "I want to be known by the work I freely chose, not by someone else's defense.", fan: "We knew this was the real Eli all along.", anti: "The album joins the record. It does not replace it." }, bystander: "Growth changes the present, not the archive." },
  ], bystander: { watching: "I can like the album without pretending it answers every old question.", warning: { 35: "Reviews are turning into a morality vote, and one side is swallowing the music.", 75: "The album is becoming proof of whatever people believed before pressing play." }, intervention: ["[Winner] keeps the round. [Next speaker] gets the first listen on the next question.", "The side that has not controlled the album story gets the next opening."], reset: ["New track, new thread. Talk about what is actually on the record.", "The record stays. So does the archive. I am watching what he does after both."] } },
};

export class GameRuleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "GameRuleError";
    this.code = code;
  }
}

function assertRule(condition, code, message) {
  if (!condition) throw new GameRuleError(code, message);
}

function secureRandom() {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] / 4294967296;
}

function clone(value) {
  return structuredClone(value);
}

function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function combinations(items, size) {
  const result = [];
  function walk(start, picked) {
    if (picked.length === size) {
      result.push([...picked]);
      return;
    }
    for (let index = start; index < items.length; index += 1) {
      picked.push(items[index]);
      walk(index + 1, picked);
      picked.pop();
    }
  }
  walk(0, []);
  return result;
}

function makeDeck() {
  const cards = [];
  Object.keys(CHANNELS).forEach((channel) => {
    for (let level = 1; level <= 5; level += 1) {
      for (let copyIndex = 0; copyIndex < DECK_COPIES[level]; copyIndex += 1) {
        cards.push({ id: `${channel}-${level}-${copyIndex}`, channel, level });
      }
    }
  });
  return cards;
}

function personalizeCards(cards, role) {
  return cards.map((card) => ({
    ...card,
    id: `${role}-${card.id}`,
    role,
    originalAuthor: role,
    name: CARD_NAMES[role][card.channel][card.level - 1],
    displayName: CARD_DISPLAY_NAMES[role][card.channel][card.level - 1],
  }));
}

function dealHands(random) {
  const deck = makeDeck();
  const channelDecks = Object.fromEntries(
    Object.keys(CHANNELS).map((channel) => [channel, shuffle(deck.filter((card) => card.channel === channel), random)]),
  );
  const dealt = Object.fromEntries(ROLE_ORDER.map((role) => [role, []]));
  ROLE_ORDER.forEach((role) => {
    Object.keys(CHANNELS).forEach((channel) => dealt[role].push(...channelDecks[channel].splice(0, 2)));
  });
  const mixedRemainder = shuffle(Object.values(channelDecks).flat(), random);
  ROLE_ORDER.forEach((role, index) => dealt[role].push(...mixedRemainder.slice(index * 6, index * 6 + 6)));
  return {
    hands: Object.fromEntries(ROLE_ORDER.map((role) => [role, personalizeCards(shuffle(dealt[role], random), role)])),
    undealt: mixedRemainder.slice(18),
  };
}

function emptyMarkers() {
  return { star: 0, fan: 0, anti: 0 };
}

function currentIssue(state) {
  return state.issues[Math.min(state.issueIndex, state.issues.length - 1)];
}

function currentClaim(state, role) {
  return currentIssue(state).claims[role];
}

function nextRole(role) {
  return ROLE_ORDER[(ROLE_ORDER.indexOf(role) + 1) % ROLE_ORDER.length];
}

function heatReach(heat) {
  return Math.max(0, Math.round(30000 * Math.pow(1.07948, Math.max(0, heat) - 3)));
}

function formatReachValue(value) {
  const amount = Math.max(0, Math.round(value));
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1).replace(/\.0$/, "")}亿`;
  const tenThousands = amount / 10000;
  if (tenThousands >= 1000) return `${Math.round(tenThousands).toLocaleString("zh-CN")}万`;
  if (tenThousands >= 100) return `${Math.round(tenThousands)}万`;
  return `${tenThousands.toFixed(1).replace(/\.0$/, "")}万`;
}

function formatHeatReach(heat) {
  return formatReachValue(heatReach(heat));
}

function addLog(state, message, role) {
  state.logs.unshift({ message, role, createdAt: state.storyTime });
  state.logs = state.logs.slice(0, 20);
}

function advanceStoryTime(state, kind, intensity = 1) {
  const weight = Math.max(1, Number(intensity) || 1);
  const heatDelay = Math.max(0, state.heat - state.initialHeat);
  let minutes;
  if (kind === "response") minutes = 45 + weight * 14 + Math.round(heatDelay * 0.32) + state.roundInIssue * 11;
  else if (kind === "pause") minutes = 70 + Math.round(heatDelay * 0.7) + state.passes * 28;
  else if (kind === "round") minutes = 210 + state.roundInIssue * 55 + Math.round(heatDelay * 0.55);
  else if (kind === "issue") minutes = 660 + state.issueIndex * 90 + Math.round(heatDelay * 0.8);
  else minutes = Math.max(5, Math.round(44 - Math.log10(Math.max(10, heatReach(state.heat))) * 5 + state.commentSequence % 13));
  state.storyTime += minutes * 60000;
  return state.storyTime;
}

function publishBystanderComment(state, source = "response", detail = {}) {
  advanceStoryTime(state, "comment", source === "opening" ? 1 : state.heat);
  const voice = state.theme.bystander || {};
  const nextThreshold = HEAT_INTERVENTION_THRESHOLDS.find(
    (threshold) => !state.heatInterventionTriggered.includes(threshold),
  );
  const reason = state.heatInterventionTokens
    ? `中央还有${state.heatInterventionTokens}枚路人介入；下一位话轮赢家将失去继承领出权`
    : nextThreshold
      ? `下一条路人介入线为Heat ${nextThreshold}`
      : "两条路人介入线均已触发";
  const triggered = source === "intervention_triggered";
  const used = source === "intervention_used";
  const thresholds = detail.thresholds || [];
  const threshold = thresholds[0];
  const interventionIndex = Math.max(0, (detail.useNumber || state.bystanderInterventionsUsed) - 1);
  const text = triggered
    ? voice.warning?.[threshold] || "This is getting too hot for the same account to keep setting the next question."
    : used
      ? (voice.intervention?.[interventionIndex] || "[Winner] keeps the point. Let [Next speaker] speak first.")
        .replaceAll("[Winner]", ROLES[detail.from]?.short || "The winner")
        .replaceAll("[Next speaker]", ROLES[detail.to]?.short || "the weaker side")
      : source === "reset"
        ? voice.reset?.[Math.max(0, state.bystanderInterventionsUsed - 1)] || voice.watching
        : source === "opening"
          ? voice.watching
          : currentIssue(state).bystander || voice.watching;
  const commentReason = triggered
    ? `触发${thresholds.length}枚路人介入；下一位话轮赢家会失去领出权`
    : used
      ? `${ROLES[detail.from]?.short || "赢家"}保留定调标记，下一轮改由${ROLES[detail.to]?.short || "下一家"}领出`
      : reason;
  state.commentSequence += 1;
  state.bystanderComments.unshift({
    id: `bystander-1-${state.commentSequence}`,
    text,
    supportOwner: null,
    status: triggered ? "介入预警" : used ? "已经介入" : "观望",
    reason: commentReason,
    createdAt: state.storyTime,
    likes: 12 + state.commentSequence * 3,
    playerLiked: false,
    source,
  });
  state.bystanderComments = state.bystanderComments.slice(0, 18);
}

export function createInitialState(options = {}) {
  const random = options.random || secureRandom;
  const startedAt = Number.isFinite(options.startedAt) ? options.startedAt : CAMPAIGN_START_TIME;
  const deal = dealHands(random);
  const campaignInput = options.campaign || {};
  const eventNumber = Number.isFinite(campaignInput.eventNumber) ? campaignInput.eventNumber : 1;
  const activeTheme = campaignInput.activeTheme || "sevenSecondServe";
  const eventTheme = EVENT_THEMES[activeTheme] || EVENT_THEMES.sevenSecondServe;
  const state = {
    phase: "action",
    roles: Object.fromEntries(
      ROLE_ORDER.map((role) => [role, { hand: deal.hands[role], discard: [], hiddenDiscard: [] }]),
    ),
    deckRemaining: deal.undealt.length,
    undealtCards: deal.undealt.map((card) => ({ ...card })),
    knownUndealt: { star: false, fan: false, anti: false },
    storyTime: startedAt,
    eventStartedAt: startedAt,
    bystanderComments: [],
    commentSequence: 0,
    themeKey: activeTheme,
    theme: clone(eventTheme),
    issues: clone(eventTheme.issues),
    claims: Object.fromEntries(ROLE_ORDER.map((role) => [role, { credibility: 0, memory: 0 }])),
    seats: [],
    issueIndex: 0,
    issueMarkers: emptyMarkers(),
    roundInIssue: 1,
    roundsCompleted: 0,
    heat: 3,
    initialHeat: 3,
    memoryTarget: 0,
    inheritedMemory: null,
    heatFeedback: { amount: 0, sequence: 0, recordBroken: false },
    heatInterventionTokens: 0,
    heatInterventionTriggered: [],
    bystanderInterventionsUsed: 0,
    bystanderLeadRecipientsThisIssue: [],
    permanentMemory: null,
    permanentMemoryOutcome: { status: "disabled" },
    lastRoundOwner: null,
    bystanderJoinedThisIssue: false,
    bystanderOwner: null,
    roundStartConsensusOwner: null,
    bystanderFeedback: { owner: null, sequence: 0 },
    currentRole: "anti",
    topPlay: null,
    claimOwner: null,
    passes: 0,
    leadSkips: 0,
    fanVoiceThisRound: null,
    fanOverreachThisRound: false,
    skills: {
      star: { level: STAR_WORK_START_LEVEL, invested: [], selected: false, status: "forging", feedbackSequence: 0 },
      fan: { used: false, target: "fan" },
      anti: { used: 0, captureArmed: false, baitPlan: null },
    },
    pressure: 0,
    silenced: false,
    lastCompletedRound: null,
    victoryResults: null,
    logs: [],
    endReason: null,
    campaign: {
      eventNumber,
      influence: clone(campaignInput.influence || { star: 0, fan: 0, anti: 0 }),
      permanentMemory: campaignInput.permanentMemory ? clone(campaignInput.permanentMemory) : null,
      activeTheme,
      nextTheme: null,
      albumFragments: clone(campaignInput.albumFragments || []),
      storyTime: startedAt,
      lastGapMonths: 0,
    },
  };
  addLog(state, `新事件从${formatHeatReach(state.initialHeat)}浏览开始，黑粉固定获得第一个话轮的领出权。`, "anti");
  publishBystanderComment(state, "opening");
  return state;
}

function detectConcretePattern(cards) {
  if (!cards.length || cards.length > 3) return null;
  const sorted = [...cards].sort((left, right) => left.level - right.level);
  const channels = new Set(sorted.map((card) => card.channel));
  const levels = new Set(sorted.map((card) => card.level));
  if (cards.length === 1) return { type: "single", channel: cards[0].channel, level: cards[0].level, size: 1 };
  if (cards.length === 2 && channels.size === 1 && levels.size === 1) {
    return { type: "pair", channel: cards[0].channel, level: cards[0].level, size: 2 };
  }
  if (cards.length === 3 && !cards.some((card) => card.isWork) && channels.size === 3 && levels.size === 1) {
    return { type: "loop", channel: "loop", level: cards[0].level, size: 3 };
  }
  if (
    cards.length === 3
    && channels.size === 1
    && sorted[1].level === sorted[0].level + 1
    && sorted[2].level === sorted[1].level + 1
  ) {
    return { type: "run", channel: sorted[0].channel, level: sorted[2].level, low: sorted[0].level, size: 3 };
  }
  return null;
}

function patternOptionKey(pattern, assignments = []) {
  const assignmentKey = assignments
    .map((item) => `${item.id}:${item.channel}:${item.level}`)
    .sort()
    .join("|");
  return `${pattern.type}-${pattern.channel}-${pattern.level}-${pattern.low || 0}-${assignmentKey}`;
}

export function detectPatternOptions(cards) {
  if (!cards.length || cards.length > 3) return [];
  const wildIndexes = cards.map((card, index) => (card.isWild ? index : -1)).filter((index) => index >= 0);
  if (!wildIndexes.length) {
    const pattern = detectConcretePattern(cards);
    if (!pattern) return [];
    pattern.optionKey = patternOptionKey(pattern);
    return [pattern];
  }

  const options = [];
  const seen = new Set();
  const assigned = cards.map((card) => ({ ...card }));
  function walk(index) {
    if (index >= wildIndexes.length) {
      const pattern = detectConcretePattern(assigned);
      if (!pattern) return;
      const assignments = wildIndexes.map((wildIndex) => ({
        id: cards[wildIndex].id,
        channel: assigned[wildIndex].channel,
        level: assigned[wildIndex].level,
        isFanWild: Boolean(cards[wildIndex].isFanWild),
        isWork: Boolean(cards[wildIndex].isWork),
      }));
      if (pattern.type === "loop" && assignments.some((item) => item.isWork)) return;
      const fanAssignment = assignments.find((item) => item.isFanWild);
      const otherLevels = assigned.filter((card) => !card.isFanWild).map((card) => card.level);
      if (pattern.type === "run" && fanAssignment && otherLevels.length) {
        const minimum = Math.min(...otherLevels);
        const maximum = Math.max(...otherLevels);
        pattern.wildDirection = fanAssignment.level < minimum ? "low" : fanAssignment.level > maximum ? "high" : "middle";
      }
      pattern.wildAssignments = assignments;
      pattern.optionKey = patternOptionKey(pattern, assignments);
      if (!seen.has(pattern.optionKey)) {
        seen.add(pattern.optionKey);
        options.push(pattern);
      }
      return;
    }
    const wildIndex = wildIndexes[index];
    const card = cards[wildIndex];
    const levels = card.isFanWild ? (cards.length === 1 ? [4] : [1, 2, 3, 4]) : [card.level];
    Object.keys(CHANNELS).forEach((channel) => {
      levels.forEach((level) => {
        assigned[wildIndex] = { ...card, channel, level };
        walk(index + 1);
      });
    });
  }
  walk(0);
  return options;
}

function selectedPatternOptions(state, cards) {
  const work = cards.find((card) => card.isWork);
  if (!work) return detectPatternOptions(cards);
  if (cards.length !== 1) return [];
  const pattern = {
    type: "single",
    channel: "spread",
    level: work.level,
    size: 1,
    isWorkRelease: work.level === STAR_WORK_RELEASE_LEVEL,
  };
  pattern.optionKey = patternOptionKey(pattern);
  return [pattern];
}

function selectedPattern(state, cards, preferredOption) {
  const options = selectedPatternOptions(state, cards);
  return options.find((pattern) => pattern.optionKey === preferredOption) || options[0] || null;
}

function roleCanPlay(state, role) {
  return role !== "star" || !state.silenced;
}

function responseMode(state, pattern, role, options = {}) {
  if (!roleCanPlay(state, role)) {
    return { legal: false, reason: `明星压力达到${PRESSURE_MAX}，处于失声状态，只能过牌并等待真爱粉救援。` };
  }
  if (!pattern) return { legal: false, reason: "所选卡牌不能组成合法牌型。" };
  if (options.workRelease && role === "star" && state.skills.star.status === "forging" && state.skills.star.level === STAR_WORK_RELEASE_LEVEL) {
    return { legal: true, mode: "workRelease", reason: "6点技能牌完整发布，无法被反压。" };
  }
  if (!state.topPlay) return { legal: true, mode: "lead", reason: "领出一个新的舆论主张。" };
  const top = state.topPlay.pattern;
  if (top.isWorkRelease) return { legal: false, reason: "6点技能牌已经占据当前时间线，只能过牌或暗置弃牌降温。" };
  if (top.type === "loop") {
    if (pattern.type !== "loop") return { legal: false, reason: "闭环叙事只能被更高级闭环压过。" };
    if (pattern.level <= top.level) return { legal: false, reason: "闭环等级必须高于当前闭环。" };
    return { legal: true, mode: "respond", reason: "更高闭环可以夺走当前置顶。" };
  }
  if (pattern.type === "loop") return { legal: true, mode: "respond", reason: "闭环叙事可以压过任何普通牌型。" };
  if (pattern.type !== top.type) return { legal: false, reason: `必须跟${PATTERN_NAMES[top.type]}。` };
  if (pattern.level <= top.level) return { legal: false, reason: "普通反压等级必须严格高于当前置顶。" };
  return { legal: true, mode: "respond", reason: "同牌型、更高等级，可以跨频道反压。" };
}

function currentWorkCard(state) {
  const work = state.skills.star;
  const releaseTitle = state.theme.fragmentTitle || "The Record";
  return {
    id: "star-work",
    role: "star",
    name: work.level === STAR_WORK_RELEASE_LEVEL ? `${releaseTitle} · Full Release` : "The Record Takes Shape",
    displayName: work.level === STAR_WORK_RELEASE_LEVEL ? releaseTitle : "Work in Progress",
    level: work.level,
    channel: "spread",
    isWild: false,
    isWork: true,
  };
}

function applyWildAssignments(cards, pattern) {
  pattern?.wildAssignments?.forEach((assignment) => {
    const card = cards.find((item) => item.id === assignment.id);
    if (card) {
      card.channel = assignment.channel;
      card.level = assignment.level;
    }
  });
}

function patternLabel(pattern) {
  if (!pattern) return "无效组合";
  if (pattern.type === "loop") return `${pattern.level}级${PATTERN_NAMES.loop}`;
  if (pattern.type === "run") return `${CHANNELS[pattern.channel].name}${pattern.low}-${pattern.level}${PATTERN_NAMES.run}`;
  return `${CHANNELS[pattern.channel].name}${pattern.level}级${PATTERN_NAMES[pattern.type]}`;
}

function resolvedCardLevel(card, pattern) {
  return pattern?.wildAssignments?.find((item) => item.id === card.id)?.level ?? card.level;
}

function playHeat(cards, pattern) {
  return cards.reduce((sum, card) => sum + resolvedCardLevel(card, pattern), 0);
}

function crossedHeatInterventionThresholds(state, before, after) {
  if (after <= before) return [];
  return HEAT_INTERVENTION_THRESHOLDS.filter(
    (threshold) => before < threshold && after >= threshold && !state.heatInterventionTriggered.includes(threshold),
  );
}

function changeHeat(state, amount, actor = state.currentRole) {
  if (!amount) return { applied: 0, crossed: [] };
  const before = state.heat;
  state.heat = Math.max(0, state.heat + amount);
  const applied = state.heat - before;
  const crossed = crossedHeatInterventionThresholds(state, before, state.heat);
  if (crossed.length) {
    state.heatInterventionTriggered.push(...crossed);
    state.heatInterventionTriggered.sort((left, right) => left - right);
    state.heatInterventionTokens += crossed.length;
    addLog(state, `Heat越过${crossed.join("、")}路人介入线，中央增加${crossed.length}枚路人介入。`, actor);
  }
  if (applied) {
    state.heatFeedback = {
      amount: applied,
      sequence: state.heatFeedback.sequence + 1,
      recordBroken: state.memoryTarget > 0 && before <= state.memoryTarget && state.heat > state.memoryTarget,
      interventionsAdded: crossed.length,
    };
  }
  return { applied, crossed };
}

function pressureSilenceState(pressure, wasSilenced = false) {
  return wasSilenced ? pressure > PRESSURE_RECOVERY : pressure >= PRESSURE_MAX;
}

function consumeStarWork(state, status) {
  const work = state.skills.star;
  if (work.status !== "forging") return;
  if (work.invested.length) state.roles.star.hiddenDiscard.push(...work.invested);
  work.invested = [];
  work.selected = false;
  work.status = status;
  work.feedbackSequence += 1;
}

function destroyStarWork(state) {
  const work = state.skills.star;
  if (!work || work.status !== "forging") return;
  const invested = work.invested.length;
  consumeStarWork(state, "lost");
  addLog(state, `明星压力达到${PRESSURE_MAX}，未打出的技能牌连同${invested}张投入牌立即消失；之后即使恢复发声也无法找回。`, "star");
}

function changePressure(state, amount) {
  const before = state.pressure;
  const wasSilenced = state.silenced;
  state.pressure = Math.max(0, Math.min(PRESSURE_MAX, state.pressure + amount));
  state.silenced = pressureSilenceState(state.pressure, wasSilenced);
  if (!wasSilenced && state.silenced) destroyStarWork(state);
  return state.pressure - before;
}

function narrativeOwner(role) { return role; }

function chooseWeakSideLead(state, controller, markers = state.issueMarkers) {
  const candidates = ROLE_ORDER.filter((role) => role !== controller);
  const minimum = Math.min(...candidates.map((role) => markers?.[role] || 0));
  const weakest = candidates.filter((role) => (markers?.[role] || 0) === minimum);
  const unused = weakest.filter((role) => !state.bystanderLeadRecipientsThisIssue.includes(role));
  const pool = unused.length ? unused : weakest;
  let role = nextRole(controller);
  while (!pool.includes(role)) role = nextRole(role);
  return role;
}

function roundMarkerGain() {
  return ROUND_MARKER_GAIN;
}

function takeCardsFromDiscard(state, sourceRole, cardIds) {
  const source = state.roles[sourceRole];
  const captured = [];
  cardIds.forEach((cardId) => {
    const index = source.discard.findIndex((card) => card.id === cardId);
    if (index < 0) return;
    const [card] = source.discard.splice(index, 1);
    card.role = "anti";
    delete card.isCapturedMemory;
    card.name = card.name.replace(/^断章取义：/, "");
    captured.push(card);
  });
  if (captured.length) state.roles.anti.hand.push(...captured);
  return captured;
}

function captureOvertakenCards(state, armed) {
  if (!state.topPlay || state.skills.anti.used >= ANTI_CAPTURE_LIMIT || !armed) return [];
  const captured = takeCardsFromDiscard(state, state.topPlay.role, state.topPlay.cardIds);
  if (captured.length) state.skills.anti.used += 1;
  return captured;
}

function resolveChannelOutcome(state, completed) {
  const outcomes = [`${completed.patternType === "loop" ? "闭环" : CHANNELS[completed.channel]?.name || "当前频道"}定调：核心基线暂无频道额外效果。`];
  if (completed.owner === "star" && completed.patternType !== "loop" && completed.channel === "stance") {
    const actual = changePressure(state, -1);
    outcomes.push(`本人立场守住话轮：明星压力${actual}，当前为${state.pressure}/${PRESSURE_MAX}。`);
  } else if (completed.owner === "anti") {
    const actual = changePressure(state, 1);
    outcomes.push(`黑粉叙事赢得话轮：明星压力+${actual}，当前为${state.pressure}/${PRESSURE_MAX}。`);
  } else if (completed.owner === "fan") outcomes.push("真爱粉叙事赢得话轮，但不再自动增加明星压力。");
  else outcomes.push("本人叙事赢得话轮，明星压力不变。");
  return outcomes.join(" ");
}

function binaryVictoryResults(state) {
  const counts = Object.fromEntries(
    ROLE_ORDER.map((role) => [role, state.seats.filter((seat) => seat.owner === role).length]),
  );
  const checks = {
    star: [
      { ok: counts.star >= 2, label: "本人主张定义2个问题" },
      { ok: !state.silenced, label: "事件结束时明星没有失声" },
    ],
    fan: [
      { ok: counts.star + counts.fan >= 2 && counts.fan >= 1, label: "支持阵营合计定义2个问题且粉圈自己定义1个" },
      { ok: !state.silenced, label: "明星未失声" },
    ],
    anti: [{ ok: counts.anti >= 1, label: "黑粉叙事定义至少1个问题" }],
  };
  return Object.fromEntries(
    ROLE_ORDER.map((role) => [role, { won: checks[role].every((item) => item.ok), checks: checks[role] }]),
  );
}

function settleEvent(state, reason) {
  if (state.phase === "ended") return;
  state.phase = "ended";
  state.endReason = reason;
  state.silenced = pressureSilenceState(state.pressure, state.silenced);
  const work = state.skills.star;
  if (work.status === "forging") {
    const count = work.invested.length;
    consumeStarWork(state, "expired");
    if (count) addLog(state, `事件结束时作品仍未发布，${count}张投入牌随本次作品窗口一同作废。`, "star");
  }
  state.permanentMemory = null;
  state.permanentMemoryOutcome = { status: "disabled", owner: state.lastCompletedRound?.owner || null };
  state.victoryResults = binaryVictoryResults(state);
}

function resolveRound(state, reason) {
  assertRule(state.topPlay && state.claimOwner, "round_without_top", "没有可结算的置顶叙事。" );
  const issue = currentIssue(state);
  const controller = state.topPlay.role;
  const owner = state.claimOwner;
  const channel = state.topPlay.pattern.channel;
  const markerGain = roundMarkerGain();
  const completed = {
    issueIndex: state.issueIndex,
    issueTitle: issue.title,
    roundInIssue: state.roundInIssue,
    reason,
    owner,
    controller,
    channel,
    patternType: state.topPlay.pattern.type,
    pattern: patternLabel(state.topPlay.pattern),
    markerGain,
  };
  completed.channelOutcome = resolveChannelOutcome(state, completed);
  state.issueMarkers[owner] += markerGain;
  state.roundsCompleted += 1;
  state.lastRoundOwner = owner;
  addLog(
    state,
    `${reason}：“${currentClaim(state, owner)}”赢得第${state.roundsCompleted}个话轮，获得1个定调标记，当前${state.issueMarkers[owner]}/${ISSUE_MARKER_TARGET}。`,
    owner,
  );
  completed.markerSnapshot = { ...state.issueMarkers };
  completed.issueWinner = ROLE_ORDER.find((role) => state.issueMarkers[role] >= ISSUE_MARKER_TARGET) || null;
  completed.issueWon = Boolean(completed.issueWinner);
  if (completed.issueWon) {
    const issueWinner = completed.issueWinner;
    state.seats.push({
      issueIndex: state.issueIndex,
      title: issue.title,
      owner: issueWinner,
      controller: issueWinner === owner ? controller : issueWinner,
      claim: issue.claims[issueWinner],
      rounds: state.roundInIssue,
      markers: { ...state.issueMarkers },
    });
    addLog(state, `“${issue.title}”完成定调：${issue.claims[issueWinner]}。`, issueWinner);
    state.issueIndex += 1;
    state.issueMarkers = emptyMarkers();
    state.roundInIssue = 1;
  } else state.roundInIssue += 1;
  state.lastCompletedRound = completed;
  advanceStoryTime(state, completed.issueWon ? "issue" : "round", completed.roundInIssue);
  publishBystanderComment(state, "settlement");
  if (state.seats.length >= state.issues.length) {
    settleEvent(state, "三个公共问题已经全部完成定调。");
    return;
  }
  let nextLead = controller;
  if (state.heatInterventionTokens > 0) {
    state.heatInterventionTokens -= 1;
    state.bystanderInterventionsUsed += 1;
    nextLead = chooseWeakSideLead(state, controller, completed.markerSnapshot);
    state.bystanderLeadRecipientsThisIssue.push(nextLead);
    completed.heatIntervention = {
      consumed: true,
      from: controller,
      to: nextLead,
      remaining: state.heatInterventionTokens,
      useNumber: state.bystanderInterventionsUsed,
    };
    addLog(
      state,
      `路人介入被消耗：${ROLES[controller].short}保留本轮定调标记，但不能继承下一话轮领出权；按座次改由${ROLES[nextLead].short}领出。`,
      nextLead,
    );
    publishBystanderComment(state, "intervention_used", {
      from: controller,
      to: nextLead,
      useNumber: state.bystanderInterventionsUsed,
    });
  } else {
    completed.heatIntervention = { consumed: false, from: controller, to: controller, remaining: 0 };
  }
  if (completed.issueWon) state.bystanderLeadRecipientsThisIssue = [];
  state.topPlay = null;
  state.claimOwner = null;
  state.passes = 0;
  state.leadSkips = 0;
  state.fanVoiceThisRound = null;
  state.fanOverreachThisRound = false;
  state.skills.anti.baitPlan = null;
  state.currentRole = nextLead;
  state.phase = "round_break";
}

function finishPassLikeAction(state, role, leadReason, responseReason, emptyReason) {
  if (!state.topPlay) {
    state.leadSkips += 1;
    addLog(state, leadReason, role);
    publishBystanderComment(state, "pause");
    if (state.leadSkips >= 3) {
      settleEvent(state, emptyReason);
      return;
    }
    state.currentRole = nextRole(role);
    return;
  }
  state.passes += 1;
  addLog(state, responseReason, role);
  publishBystanderComment(state, "pause");
  if (state.passes >= 2) {
    resolveRound(state, "连续两人过牌");
    return;
  }
  state.currentRole = nextRole(role);
}

function applyPlay(state, role, command) {
  assertRule(state.phase === "action", "not_action_phase", "当前不在行动阶段。" );
  assertRule(state.currentRole === role, "not_your_turn", "还没有轮到你行动。" );
  assertRule(roleCanPlay(state, role), "role_silenced", "明星处于失声状态，只能过牌。" );
  const cardIds = Array.isArray(command.cardIds) ? command.cardIds : [];
  assertRule(cardIds.length >= 1 && cardIds.length <= 3, "invalid_card_count", "一次必须选择1至3张牌。" );
  assertRule(new Set(cardIds).size === cardIds.length, "duplicate_card", "同一张牌不能重复选择。" );

  const ordinaryCards = cardIds
    .filter((cardId) => cardId !== "star-work")
    .map((cardId) => state.roles[role].hand.find((card) => card.id === cardId));
  assertRule(ordinaryCards.every(Boolean), "card_not_owned", "提交的牌不在你的手牌中。" );
  const usesWork = cardIds.includes("star-work");
  assertRule(!usesWork || (role === "star" && state.skills.star.status === "forging" && cardIds.length === 1), "invalid_work_play", "技能牌只能由明星单独打出。" );
  const cards = usesWork ? [currentWorkCard(state)] : ordinaryCards;
  const pattern = selectedPattern(state, cards, command.patternOptionKey || null);
  const workRelease = Boolean(pattern?.isWorkRelease);
  const response = responseMode(state, pattern, role, { workRelease });
  assertRule(response.legal, "illegal_play", response.reason);

  const beforeHeat = state.heat;
  const wasResponse = Boolean(state.topPlay);
  const captured = role === "anti" && wasResponse ? captureOvertakenCards(state, Boolean(command.captureAll)) : [];
  applyWildAssignments(cards, pattern);
  const spent = ordinaryCards.map((card) => card.id);
  state.roles[role].hand = state.roles[role].hand.filter((card) => !spent.includes(card.id));
  state.roles[role].discard.push(...ordinaryCards);
  if (usesWork) {
    const workLevel = state.skills.star.level;
    consumeStarWork(state, workLevel === STAR_WORK_RELEASE_LEVEL ? "released" : "releasedEarly");
    if (
      workLevel >= 5
      && state.campaign.eventNumber <= 2
      && !state.campaign.albumFragments.some((fragment) => fragment.eventNumber === state.campaign.eventNumber)
    ) {
      state.campaign.albumFragments.push({
        eventNumber: state.campaign.eventNumber,
        title: state.theme.fragmentTitle || `Work ${state.campaign.eventNumber}`,
        level: workLevel,
      });
    }
  }

  let fanVoice = null;
  if (role === "fan") {
    if (!state.fanVoiceThisRound) state.fanVoiceThisRound = "fan";
    fanVoice = state.fanVoiceThisRound;
  }
  const owner = narrativeOwner(role, fanVoice);
  let pressureText = "";
  if (role === "fan" && fanVoice === "fan" && !state.fanOverreachThisRound) {
    state.fanOverreachThisRound = true;
    pressureText = `，粉圈越界使压力+${changePressure(state, 1)}`;
  }
  const addedHeat = playHeat(cards, pattern);
  const heatChange = changeHeat(state, addedHeat, role);
  advanceStoryTime(state, "response", addedHeat);
  state.claimOwner = owner;
  state.topPlay = {
    role,
    owner,
    pattern: { ...pattern },
    cardNames: cards.map((card) => card.name),
    cardIds: cards.map((card) => card.id),
    cards: cards.map((card) => ({
      id: card.id,
      name: card.name,
      displayName: card.displayName,
      level: card.level,
      channel: card.channel,
      isWild: Boolean(card.isWild),
      isFanWild: Boolean(card.isFanWild),
    })),
    fanVoice,
    publishedAt: state.storyTime,
  };
  state.passes = 0;
  state.leadSkips = 0;
  state.skills.anti.captureArmed = false;
  const voiceText = role === "fan" ? "，以“Maya自己的解释”发声" : "";
  const skillText = usesWork
    ? (pattern.isWorkRelease ? "，完整发布6点“沉淀成章”，本轮无法被反压" : `，将${pattern.level}点“沉淀成章”作为单牌打出`)
    : captured.length ? `，并用“断章取义”拿走整组${captured.length}张原牌` : "";
  const reachGain = heatReach(state.heat) - heatReach(beforeHeat);
  const handDelta = captured.length - ordinaryCards.length;
  const handText = handDelta > 0 ? `+${handDelta}` : handDelta < 0 ? `${handDelta}` : "±0";
  addLog(
    state,
    `${ROLES[role].short}打出“${cards.map((card) => card.name).join("、")}”${voiceText}${skillText}，置顶${patternLabel(pattern)}；主张改为“${currentClaim(state, owner)}”。影响：手牌${handText}${reachGain > 0 ? `，浏览量+${formatReachValue(reachGain)}` : ""}${pressureText}。`,
    role,
  );
  publishBystanderComment(
    state,
    heatChange.crossed.length ? "intervention_triggered" : "response",
    { thresholds: heatChange.crossed },
  );
  state.currentRole = nextRole(role);
}

function applyPass(state, role) {
  assertRule(state.phase === "action", "not_action_phase", "当前不在行动阶段。" );
  assertRule(state.currentRole === role, "not_your_turn", "还没有轮到你行动。" );
  if (!state.topPlay) {
    assertRule(state.roles[role].hand.length === 0 || !roleCanPlay(state, role), "cannot_skip_lead", "仍有可领出的牌，不能直接跳过领出。" );
  }
  advanceStoryTime(state, "pause", 1);
  const leadText = role === "star" && state.silenced
    ? "Eli因失声无法领出，只能让出领出权；Maya仍可支持他，但不能替代他的第一人称解释。"
    : `${ROLES[role].short}已经没有手牌，领出权顺延。`;
  finishPassLikeAction(
    state,
    role,
    leadText,
    `${ROLES[role].short}选择过牌，暂时观望；若后来有人出牌，仍可重新加入。`,
    "三方手牌都已耗尽，剩余问题无法继续定调。",
  );
}

function applyCool(state, role, command) {
  assertRule(state.phase === "action", "not_action_phase", "当前不在行动阶段。" );
  assertRule(state.currentRole === role, "not_your_turn", "还没有轮到你行动。" );
  assertRule(roleCanPlay(state, role), "role_silenced", "明星失声时不能再操作手牌。" );
  const card = state.roles[role].hand.find((item) => item.id === command.cardId);
  assertRule(card, "card_not_owned", "暗置的牌不在你的手牌中。" );
  const beforeHeat = state.heat;
  state.roles[role].hand = state.roles[role].hand.filter((item) => item.id !== card.id);
  state.roles[role].hiddenDiscard.push(card);
  changeHeat(state, -5, role);
  advanceStoryTime(state, "pause", card.level);
  addLog(
    state,
    `${ROLES[role].short}弃掉1张牌降温，Heat ${beforeHeat}→${state.heat}（支付-5，最低为0）；仍可在本次行动中继续出牌或再次降温。`,
    role,
  );
}

function applyInvest(state, role, command) {
  assertRule(state.phase === "action" && state.currentRole === role, "not_your_turn", "还没有轮到你行动。" );
  assertRule(role === "star" && roleCanPlay(state, role), "invalid_invest", "只有未失声的明星可以投入作品。" );
  const work = state.skills.star;
  assertRule(work.status === "forging" && work.level < STAR_WORK_RELEASE_LEVEL, "work_unavailable", "技能牌当前不能继续升级。" );
  const card = state.roles.star.hand.find((item) => item.id === command.cardId);
  assertRule(card && !card.isWild, "card_not_owned", "投入的普通牌不在你的手牌中。" );
  state.roles.star.hand = state.roles.star.hand.filter((item) => item.id !== card.id);
  work.invested.push(card);
  work.level += 1;
  work.feedbackSequence += 1;
  advanceStoryTime(state, "pause", card.level);
  addLog(state, `明星暗置1张普通手牌提升“沉淀成章”，技能牌达到${work.level}点；本次行动视为过牌。`, "star");
  finishPassLikeAction(
    state,
    role,
    "明星让出领出权，继续沉淀作品。",
    "明星投入作品并视为过牌。",
    "三方连续让出领出权，剩余问题无法继续定调。",
  );
}

function applyFanGift(state, role, command) {
  assertRule(state.phase === "action" && state.currentRole === role, "not_your_turn", "只有轮到你时才能发动技能。" );
  assertRule(role === "fan", "invalid_fan_skill", "只有真爱粉可以发动最后应援。" );
  assertRule(!state.skills.fan.used && state.roles.fan.hand.length <= 5, "fan_skill_unavailable", "最后应援当前不可用。" );
  assertRule(ROLE_ORDER.includes(command.targetRole), "invalid_target", "应援目标无效。" );
  const card = state.roles.fan.hand.find((item) => item.id === command.cardId);
  assertRule(card && card.level < 5 && !card.isWild, "invalid_gift_card", "只能选择1至4级普通牌进行应援。" );
  state.roles.fan.hand = state.roles.fan.hand.filter((item) => item.id !== card.id);
  card.originalAuthor = card.originalAuthor || "fan";
  card.isWild = true;
  card.isFanWild = true;
  card.originalChannel = card.channel;
  card.originalLevel = card.level;
  card.role = command.targetRole;
  const shortName = card.displayName || card.name;
  card.name = `Maya's Wildcard: ${card.name}`;
  card.displayName = `Maya: ${shortName}`;
  state.roles[command.targetRole].hand.push(card);
  state.skills.fan.used = true;
  state.skills.fan.target = command.targetRole;
  advanceStoryTime(state, "pause", card.originalLevel);
  addLog(state, `真爱粉发动“最后应援”，把${card.originalLevel}级牌变成1—4级万能牌并交给${ROLES[command.targetRole].short}。`, "fan");
  publishBystanderComment(state, "pause");
}

function applyContinue(state, role) {
  assertRule(state.phase === "round_break", "not_round_break", "当前没有等待继续的话轮。" );
  assertRule(state.currentRole === role, "not_round_leader", "由下一话轮领出者继续游戏。" );
  state.phase = "action";
  if (state.lastCompletedRound?.heatIntervention?.consumed) publishBystanderComment(state, "reset");
  addLog(state, `${currentIssue(state).title} · 第${state.roundInIssue}话轮开始，${ROLES[state.currentRole].short}领出。`, role);
}

function nextCampaignTheme(state) {
  if (state.campaign.eventNumber === 1) return "voiceNote";
  if (state.campaign.eventNumber === 2) return state.campaign.albumFragments.length >= 2 ? "roomTone" : "comeback";
  return state.campaign.activeTheme;
}

function applyNextEvent(state) {
  assertRule(state.phase === "ended", "event_not_ended", "当前事件尚未结束。" );
  assertRule(state.campaign.eventNumber < 3, "campaign_complete", "三事件已经全部结束。" );
  const gapMonths = state.heat >= 90 ? 1 : 2;
  const startedAt = state.storyTime + gapMonths * 30 * 24 * 60 * 60 * 1000;
  const campaign = {
    ...state.campaign,
    eventNumber: state.campaign.eventNumber + 1,
    activeTheme: nextCampaignTheme(state),
    nextTheme: null,
    albumFragments: clone(state.campaign.albumFragments),
    storyTime: startedAt,
    lastGapMonths: gapMonths,
  };
  const nextState = createInitialState({ startedAt, campaign });
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, nextState);
}

function restoreCapturedCard(card) {
  if (!card || typeof card !== "object") return;
  delete card.isCapturedMemory;
  if (typeof card.name === "string") card.name = card.name.replace(/^断章取义：/, "");
}

function restoreCapturedCards(state) {
  Object.values(state.roles || {}).forEach((roleState) => {
    (roleState.hand || []).forEach(restoreCapturedCard);
    (roleState.discard || []).forEach(restoreCapturedCard);
  });
  (state.topPlay?.cards || []).forEach(restoreCapturedCard);
  if (state.topPlay?.pattern) delete state.topPlay.pattern.memoryConverted;
  if (state.topPlay?.cards) state.topPlay.cardNames = state.topPlay.cards.map((card) => card.name);
  if (state.lastCompletedRound) delete state.lastCompletedRound.memoryConverted;
}

export function normalizeGameState(state) {
  restoreCapturedCards(state);
  if (!Array.isArray(state.heatInterventionTriggered)) state.heatInterventionTriggered = [];
  if (!Number.isFinite(state.heatInterventionTokens)) state.heatInterventionTokens = 0;
  if (!Number.isFinite(state.bystanderInterventionsUsed)) state.bystanderInterventionsUsed = 0;
  if (!Array.isArray(state.bystanderLeadRecipientsThisIssue)) state.bystanderLeadRecipientsThisIssue = [];
  if (state.fanVoiceThisRound && state.fanVoiceThisRound !== "fan") state.fanVoiceThisRound = "fan";
  if (!state.campaign || typeof state.campaign !== "object") state.campaign = {};
  if (!Number.isFinite(state.campaign.eventNumber)) state.campaign.eventNumber = 1;
  if (!Array.isArray(state.campaign.albumFragments)) state.campaign.albumFragments = [];
  if (!state.campaign.activeTheme) state.campaign.activeTheme = state.themeKey || "sevenSecondServe";
  if (!state.heatFeedback || typeof state.heatFeedback !== "object") {
    state.heatFeedback = { amount: 0, sequence: 0, recordBroken: false, interventionsAdded: 0 };
  } else {
    state.heatFeedback.recordBroken = Boolean(state.heatFeedback.recordBroken);
    if (!Number.isFinite(state.heatFeedback.interventionsAdded)) state.heatFeedback.interventionsAdded = 0;
  }
  return state;
}

export function applyCommand(state, role, command) {
  normalizeGameState(state);
  assertRule(ROLE_ORDER.includes(role), "invalid_role", "玩家阵营无效。" );
  assertRule(command && typeof command.type === "string", "invalid_command", "行动格式无效。" );
  if (command.type === "next_event") applyNextEvent(state);
  else if (command.type === "play") applyPlay(state, role, command);
  else if (command.type === "pass") applyPass(state, role);
  else if (command.type === "cool") applyCool(state, role, command);
  else if (command.type === "invest") applyInvest(state, role, command);
  else if (command.type === "fan_gift") applyFanGift(state, role, command);
  else if (command.type === "continue") applyContinue(state, role);
  else throw new GameRuleError("unknown_command", "未知行动。" );
  state.campaign.storyTime = state.storyTime;
  return state;
}

export function getLegalPlayOptions(state, role) {
  if (state.phase !== "action" || state.currentRole !== role || !roleCanPlay(state, role)) return [];
  const hand = [...state.roles[role].hand];
  if (role === "star" && state.skills.star.status === "forging") hand.unshift(currentWorkCard(state));
  const options = [];
  [1, 2, 3].forEach((size) => {
    combinations(hand, size).forEach((cards) => {
      selectedPatternOptions(state, cards).forEach((pattern) => {
        const response = responseMode(state, pattern, role, { workRelease: Boolean(pattern.isWorkRelease) });
        if (response.legal) options.push({ cardIds: cards.map((card) => card.id), pattern: clone(pattern) });
      });
    });
  });
  return options;
}

export function chooseBotCommand(state, role) {
  normalizeGameState(state);
  if (!ROLE_ORDER.includes(role) || state.currentRole !== role || state.phase === "ended") return null;
  if (state.phase === "round_break") return { type: "continue" };
  if (state.phase !== "action") return null;

  const options = getLegalPlayOptions(state, role).sort((left, right) => {
    if (!state.topPlay) {
      return right.cardIds.length - left.cardIds.length
        || right.pattern.level - left.pattern.level
        || left.pattern.optionKey.localeCompare(right.pattern.optionKey);
    }
    return left.pattern.level - right.pattern.level
      || right.cardIds.length - left.cardIds.length
      || left.pattern.optionKey.localeCompare(right.pattern.optionKey);
  });
  if (role === "star" && state.skills.star.status === "forging") {
    const workOption = options.find((candidate) => candidate.cardIds.length === 1 && candidate.cardIds[0] === "star-work");
    if (state.skills.star.level >= 5 && workOption) {
      return {
        type: "play",
        cardIds: workOption.cardIds,
        patternOptionKey: workOption.pattern.optionKey,
        fanVoice: null,
        captureAll: false,
      };
    }
    if (state.skills.star.level < 5) {
      const investment = state.roles.star.hand
        .filter((card) => !card.isWild)
        .sort((left, right) => left.level - right.level || left.id.localeCompare(right.id))[0];
      if (investment) return { type: "invest", cardId: investment.id };
    }
  }
  const option = options[0];
  if (!option) return { type: "pass" };
  return {
    type: "play",
    cardIds: option.cardIds,
    patternOptionKey: option.pattern.optionKey,
    fanVoice: role === "fan" ? "fan" : null,
    captureAll: false,
  };
}

function hiddenCards(count) {
  return Array.from({ length: count }, () => ({ hidden: true }));
}

export function createPlayerView(state, role) {
  normalizeGameState(state);
  assertRule(ROLE_ORDER.includes(role), "invalid_role", "玩家阵营无效。" );
  const view = clone(state);
  view.userRole = role;
  view.selectedIds = [];
  view.fanVoiceChoice = "fan";
  view.wildChannelChoice = null;
  view.undealtCards = [];
  view.knownUndealt = { star: false, fan: false, anti: false };
  ROLE_ORDER.forEach((otherRole) => {
    if (otherRole !== role) view.roles[otherRole].hand = hiddenCards(state.roles[otherRole].hand.length);
    view.roles[otherRole].hiddenDiscard = hiddenCards(state.roles[otherRole].hiddenDiscard.length);
  });
  view.skills.star.invested = hiddenCards(state.skills.star.invested.length);
  return view;
}

export function runRuleChecks() {
  const markerGain = roundMarkerGain();
  const probe = { heatInterventionTriggered: [] };
  const crossing = crossedHeatInterventionThresholds(probe, 34, 36);
  return {
    markerTarget: ISSUE_MARKER_TARGET,
    markerGain,
    heatInterventionThresholds: [...HEAT_INTERVENTION_THRESHOLDS],
    crossing,
    influence: "paused",
    victory: "binary",
    passed: ISSUE_MARKER_TARGET === 2 && markerGain === 1 && crossing.join(",") === "35",
  };
}
