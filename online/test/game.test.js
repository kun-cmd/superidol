import assert from "node:assert/strict";
import test from "node:test";

import {
  GameRuleError,
  ROLE_ORDER,
  applyCommand,
  chooseBotCommand,
  createInitialState,
  createPlayerView,
  getLegalPlayOptions,
  runRuleChecks,
} from "../src/game.js";
import { GameRoom } from "../src/worker.js";

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) | 0;
    let mixed = Math.imul(value ^ (value >>> 15), 1 | value);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function commandFor(option, role) {
  return {
    type: "play",
    cardIds: option.cardIds,
    patternOptionKey: option.pattern.optionKey,
    fanVoice: role === "fan" ? "fan" : null,
    captureAll: false,
  };
}

test("deals twelve private cards to every faction and leaves three undealt", () => {
  const state = createInitialState({ random: seededRandom(20260811) });
  assert.deepEqual(
    Object.fromEntries(ROLE_ORDER.map((role) => [role, state.roles[role].hand.length])),
    { anti: 12, star: 12, fan: 12 },
  );
  assert.equal(state.deckRemaining, 3);
  assert.equal(state.undealtCards.length, 3);
  assert.equal(new Set(ROLE_ORDER.flatMap((role) => state.roles[role].hand.map((card) => card.id))).size, 36);
});

test("response cards expose compact display labels", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  const cards = ROLE_ORDER.flatMap((role) => state.roles[role].hand);
  assert.ok(cards.every((card) => card.displayName && card.displayName.length <= 21));
  assert.ok(cards.every((card) => card.displayName.split(/\s+/).every((word) => word.replace(/[^A-Za-z]/g, "").length <= 10)));
  assert.ok(cards.every((card) => !card.displayName.toLowerCase().includes("contradiction")));
});

test("player views contain only the requesting player's hidden hand", () => {
  const state = createInitialState({ random: seededRandom(7) });
  const antiView = createPlayerView(state, "anti");
  assert.deepEqual(antiView.roles.anti.hand, state.roles.anti.hand);
  assert.ok(antiView.roles.star.hand.every((card) => card.hidden === true));
  assert.ok(antiView.roles.fan.hand.every((card) => card.hidden === true));
  assert.deepEqual(antiView.undealtCards, []);

  const serialized = JSON.stringify(antiView);
  for (const role of ["star", "fan"]) {
    for (const card of state.roles[role].hand) {
      assert.equal(serialized.includes(card.id), false, `leaked opponent card id ${card.id}`);
      assert.equal(serialized.includes(card.name), false, `leaked opponent card name ${card.name}`);
    }
  }
});

test("the authoritative engine rejects out-of-turn and unowned cards", () => {
  const state = createInitialState({ random: seededRandom(99) });
  const starCard = state.roles.star.hand[0];
  assert.throws(
    () => applyCommand(state, "star", { type: "play", cardIds: [starCard.id] }),
    (error) => error instanceof GameRuleError && error.code === "not_your_turn",
  );
  assert.throws(
    () => applyCommand(state, "anti", { type: "play", cardIds: [starCard.id] }),
    (error) => error instanceof GameRuleError && error.code === "card_not_owned",
  );
});

test("two passes settle a round and award one marker", () => {
  const state = createInitialState({ random: seededRandom(1234) });
  const lead = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "single");
  assert.ok(lead);
  applyCommand(state, "anti", commandFor(lead, "anti"));
  applyCommand(state, "star", { type: "pass" });
  applyCommand(state, "fan", { type: "pass" });

  assert.equal(state.phase, "round_break");
  assert.equal(state.issueMarkers.anti, 1);
  assert.equal(state.lastCompletedRound.markerGain, 1);
  assert.equal(state.currentRole, "anti");
  assert.equal(state.pressure, 1);
});

test("cooling costs one card and five Heat without ending the action", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  const card = state.roles.anti.hand[0];
  state.heat = 20;
  applyCommand(state, "anti", { type: "cool", cardId: card.id });

  assert.equal(state.heat, 15);
  assert.equal(state.currentRole, "anti");
  assert.equal(state.phase, "action");
  assert.equal(state.passes, 0);
  assert.equal(state.topPlay, null);
  assert.equal(state.roles.anti.hand.some((item) => item.id === card.id), false);
  assert.equal(state.roles.anti.hiddenDiscard.at(-1).id, card.id);

  const secondCard = state.roles.anti.hand[0];
  assert.doesNotThrow(() => applyCommand(state, "anti", { type: "cool", cardId: secondCard.id }));
  assert.equal(state.heat, 10);
  assert.equal(state.currentRole, "anti", "cooling remains repeatable in the same action");
});

test("crossing a Heat line creates one intervention that breaks winner lead", () => {
  const state = createInitialState({ random: seededRandom(1234) });
  state.heat = 34;
  const lead = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "single");
  assert.ok(lead);
  applyCommand(state, "anti", commandFor(lead, "anti"));
  assert.deepEqual(state.heatInterventionTriggered, [35]);
  assert.equal(state.heatInterventionTokens, 1);
  const interventionComment = state.bystanderComments[0];
  assert.equal(interventionComment.source, "intervention_triggered");
  applyCommand(state, "star", { type: "pass" });
  assert.equal(
    state.bystanderComments[0].id,
    interventionComment.id,
    "the intervention comment stays visible while its triggering play remains pinned",
  );
  applyCommand(state, "fan", { type: "pass" });
  assert.notEqual(
    state.bystanderComments[0].id,
    interventionComment.id,
    "the intervention comment may change after the pinned play is settled",
  );

  assert.equal(state.issueMarkers.anti, 1, "winner still receives the marker");
  assert.equal(state.heatInterventionTokens, 0, "one intervention is consumed");
  assert.equal(state.currentRole, "star", "lead rotates to the next seat instead of staying with anti");
  assert.deepEqual(state.lastCompletedRound.heatIntervention, {
    consumed: true,
    from: "anti",
    to: "star",
    remaining: 0,
    useNumber: 1,
  });
});

test("Maya's response always remains Maya's explanation", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  state.currentRole = "fan";
  const lead = getLegalPlayOptions(state, "fan").find((option) => option.pattern.type === "single");
  assert.ok(lead);

  applyCommand(state, "fan", { ...commandFor(lead, "fan"), fanVoice: "star" });

  assert.equal(state.claimOwner, "fan");
  assert.equal(state.topPlay.owner, "fan");
  assert.equal(state.topPlay.fanVoice, "fan", "legacy clients cannot turn Maya into Haru's first-person voice");
  assert.equal(state.pressure, 1, "Maya's first explanation in a round still adds pressure to Haru");
});

test("a Heat intervention gives the weaker non-winner the next opening", () => {
  const state = createInitialState({ random: seededRandom(1234) });
  state.issueMarkers = { anti: 0, star: 1, fan: 0 };
  state.heatInterventionTokens = 1;
  state.heatInterventionTriggered = [35];
  const lead = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "single");
  assert.ok(lead);
  applyCommand(state, "anti", commandFor(lead, "anti"));
  applyCommand(state, "star", { type: "pass" });
  applyCommand(state, "fan", { type: "pass" });

  assert.equal(state.currentRole, "fan", "fan had fewer markers than star and receives the opening");
  assert.equal(state.lastCompletedRound.heatIntervention.to, "fan");
});

test("two level-five album fragments unlock ROOM TONE as event three", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  for (const expectedEvent of [1, 2]) {
    state.currentRole = "star";
    state.skills.star.level = 5;
    const work = getLegalPlayOptions(state, "star").find((option) => option.cardIds.length === 1 && option.cardIds[0] === "star-work");
    assert.ok(work);
    applyCommand(state, "star", commandFor(work, "star"));
    assert.equal(state.campaign.albumFragments.at(-1).eventNumber, expectedEvent);
    assert.equal(state.campaign.albumFragments.at(-1).level, 5);
    state.phase = "ended";
    applyCommand(state, "anti", { type: "next_event" });
  }

  assert.equal(state.campaign.eventNumber, 3);
  assert.equal(state.themeKey, "roomTone");
  assert.equal(state.theme.title, "ROOM TONE");
  assert.equal(state.campaign.albumFragments.length, 2);
});

test("event three uses the normal comeback when either fragment is missing", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  state.phase = "ended";
  applyCommand(state, "anti", { type: "next_event" });
  state.phase = "ended";
  applyCommand(state, "star", { type: "next_event" });

  assert.equal(state.campaign.eventNumber, 3);
  assert.equal(state.themeKey, "comeback");
  assert.equal(state.theme.title, "The Comeback Rehearsal");
});

test("anti capture keeps the original cards without memory conversion", () => {
  const state = createInitialState({ random: seededRandom(20260811) });
  const originalCards = [
    { id: "original-fact-2-a", name: "核对聊天记录", channel: "fact", level: 2, role: "star" },
    { id: "original-fact-2-b", name: "补全事件时间线", channel: "fact", level: 2, role: "star" },
  ];
  state.roles.star.discard = originalCards.map((card) => ({ ...card }));
  state.roles.anti.hand = [
    { id: "anti-fact-3-a", name: "质疑证据来源", channel: "fact", level: 3, role: "anti" },
    { id: "anti-fact-3-b", name: "指出记录矛盾", channel: "fact", level: 3, role: "anti" },
  ];
  state.phase = "action";
  state.currentRole = "anti";
  state.claimOwner = "star";
  state.topPlay = {
    role: "star",
    owner: "star",
    pattern: { type: "pair", channel: "fact", level: 2, size: 2 },
    cardIds: originalCards.map((card) => card.id),
    cards: originalCards.map((card) => ({ ...card })),
  };

  const counter = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "pair");
  assert.ok(counter);
  applyCommand(state, "anti", { ...commandFor(counter, "anti"), captureAll: true });

  const reclaimed = state.roles.anti.hand.filter((card) => originalCards.some((original) => original.id === card.id));
  assert.deepEqual(
    reclaimed.map(({ id, name, channel, level }) => ({ id, name, channel, level })),
    originalCards.map(({ id, name, channel, level }) => ({ id, name, channel, level })),
  );
  assert.ok(reclaimed.every((card) => card.role === "anti" && !("isCapturedMemory" in card)));
  assert.equal(state.skills.anti.used, 1);

  state.topPlay = null;
  state.claimOwner = null;
  state.currentRole = "anti";
  const replay = getLegalPlayOptions(state, "anti").find((option) => option.cardIds.every((id) => originalCards.some((card) => card.id === id)));
  assert.ok(replay);
  assert.equal(replay.pattern.memoryConverted, undefined);
});

test("legacy persisted rooms receive current Heat intervention fields", () => {
  const state = createInitialState({ random: seededRandom(20260811) });
  delete state.heatInterventionTriggered;
  delete state.heatInterventionTokens;
  delete state.heatFeedback.interventionsAdded;

  const view = createPlayerView(state, "star");
  assert.deepEqual(view.heatInterventionTriggered, []);
  assert.equal(view.heatInterventionTokens, 0);
  assert.equal(view.heatFeedback.interventionsAdded, 0);
  const lead = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "single");
  assert.ok(lead);
  assert.doesNotThrow(() => applyCommand(state, "anti", commandFor(lead, "anti")));
});

test("a deterministic three-player session reaches a complete event", () => {
  const state = createInitialState({ random: seededRandom(20260811) });
  let steps = 0;
  while (state.phase !== "ended" && steps < 400) {
    const role = state.currentRole;
    if (state.phase === "round_break") {
      applyCommand(state, role, { type: "continue" });
    } else if (state.topPlay) {
      applyCommand(state, role, { type: "pass" });
    } else {
      const options = getLegalPlayOptions(state, role).sort((left, right) => {
        const value = { single: 1, pair: 2, run: 2, loop: 3 };
        return value[right.pattern.type] - value[left.pattern.type] || right.cardIds.length - left.cardIds.length;
      });
      if (options.length) applyCommand(state, role, commandFor(options[0], role));
      else applyCommand(state, role, { type: "pass" });
    }
    steps += 1;
  }

  assert.ok(steps < 400, "simulation hit its safety stop");
  assert.equal(state.phase, "ended");
  assert.equal(state.seats.length, 3);
  assert.equal(state.endReason, "三个公共问题已经全部完成定调。");
  assert.equal(state.victoryResults.anti.won, true);
  assert.equal(state.victoryResults.star.won, false);
  assert.equal(state.victoryResults.fan.won, false);
  assert.deepEqual(state.campaign.influence, { star: 0, fan: 0, anti: 0 });
});

test("server bots choose valid actions and finish a full match", () => {
  const state = createInitialState({ random: seededRandom(20260811) });
  let steps = 0;
  while (state.phase !== "ended" && steps < 500) {
    const role = state.currentRole;
    const command = chooseBotCommand(state, role);
    assert.ok(command, `bot had no command during ${state.phase}`);
    assert.doesNotThrow(() => applyCommand(state, role, command));
    steps += 1;
  }

  assert.ok(steps < 500, "bot simulation hit its safety stop");
  assert.equal(state.phase, "ended");
  assert.equal(state.seats.length, 3);
});

test("a server-controlled Haru invests toward an album fragment", () => {
  const state = createInitialState({ random: seededRandom(20260812) });
  state.currentRole = "star";
  const command = chooseBotCommand(state, "star");

  assert.equal(command.type, "invest");
  assert.ok(state.roles.star.hand.some((card) => card.id === command.cardId));
  applyCommand(state, "star", command);
  assert.equal(state.skills.star.level, 3);
});

test("online room schedules exactly one bot action after a two-second delay", async () => {
  const stored = new Map();
  const context = {
    storage: {
      get: async (key) => stored.get(key),
      put: async (key, value) => stored.set(key, value),
      setAlarm: async (value) => { context.alarmAt = value; },
      deleteAll: async () => stored.clear(),
    },
    blockConcurrencyWhile(callback) { context.ready = callback(); },
    getWebSockets() { return []; },
  };
  const room = new GameRoom(context, {});
  await context.ready;
  room.room = {
    code: "BOT123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hostRole: null,
    players: Object.fromEntries(ROLE_ORDER.map((role) => [role, { role, name: "AI", token: null, ready: true, isBot: true }])),
    started: false,
    version: 0,
    game: null,
    recentActionIds: [],
    botTurnDueAt: null,
  };

  assert.equal(room.tryStartMatch(), true);
  assert.equal(room.room.game.currentRole, "anti");
  assert.equal(room.room.game.topPlay, null, "starting a room must not run the bot immediately");
  assert.ok(room.room.botTurnDueAt - Date.now() > 1500);

  room.room.botTurnDueAt = Date.now() - 1;
  await room.alarm();
  assert.equal(room.room.game.topPlay.role, "anti");
  assert.equal(room.room.game.currentRole, "star", "one alarm advances exactly one bot action");
  assert.ok(room.room.botTurnDueAt - Date.now() > 1500, "the next bot receives its own two-second delay");
});

test("server rule self-checks pass", () => {
  const checks = runRuleChecks();
  assert.equal(checks.passed, true);
  assert.deepEqual(checks.heatInterventionThresholds, [35, 75]);
});
