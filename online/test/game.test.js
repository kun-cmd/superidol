import assert from "node:assert/strict";
import test from "node:test";

import {
  GameRuleError,
  ROLE_ORDER,
  applyCommand,
  createInitialState,
  createPlayerView,
  getLegalPlayOptions,
  runRuleChecks,
} from "../src/game.js";

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
    fanVoice: role === "fan" ? "star" : null,
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

test("crossing a Heat line creates one intervention that breaks winner lead", () => {
  const state = createInitialState({ random: seededRandom(1234) });
  state.heat = 34;
  const lead = getLegalPlayOptions(state, "anti").find((option) => option.pattern.type === "single");
  assert.ok(lead);
  applyCommand(state, "anti", commandFor(lead, "anti"));
  assert.deepEqual(state.heatInterventionTriggered, [35]);
  assert.equal(state.heatInterventionTokens, 1);
  applyCommand(state, "star", { type: "pass" });
  applyCommand(state, "fan", { type: "pass" });

  assert.equal(state.issueMarkers.anti, 1, "winner still receives the marker");
  assert.equal(state.heatInterventionTokens, 0, "one intervention is consumed");
  assert.equal(state.currentRole, "star", "lead rotates to the next seat instead of staying with anti");
  assert.deepEqual(state.lastCompletedRound.heatIntervention, {
    consumed: true,
    from: "anti",
    to: "star",
    remaining: 0,
  });
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

test("server rule self-checks pass", () => {
  assert.equal(runRuleChecks().passed, true);
});
