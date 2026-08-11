import {
  GameRuleError,
  ROLE_ORDER,
  applyCommand,
  chooseBotCommand,
  createInitialState,
  createPlayerView,
} from "./game.js";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const BOT_ACTION_DELAY_MS = 2000;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function normalizedRoomCode(value) {
  return String(value || "").trim().toUpperCase();
}

function validRole(value) {
  return ROLE_ORDER.includes(value);
}

function cleanPlayerName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  return name.slice(0, 20) || "匿名玩家";
}

function randomRoomCode() {
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]).join("");
}

function randomToken() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean));
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins(env);
  if (!origin || allowed.has(origin)) {
    return {
      "access-control-allow-origin": origin || "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      vary: "Origin",
    };
  }
  return null;
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function forwardRoomRequest(env, roomCode, request, path) {
  const id = env.ROOMS.idFromName(roomCode);
  const stub = env.ROOMS.get(id);
  const target = new URL(request.url);
  target.pathname = path;
  return stub.fetch(new Request(target, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);
    if (!headers) return json({ error: "origin_not_allowed", message: "当前网页来源没有连接该联机服务的权限。" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (url.pathname === "/api/health") return json({ ok: true, service: "superidol-online" }, 200, headers);

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      const body = await parseBody(request);
      if (!validRole(body.role)) return json({ error: "invalid_role", message: "请选择一个阵营。" }, 400, headers);
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const roomCode = randomRoomCode();
        const response = await forwardRoomRequest(env, roomCode, new Request(request.url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role: body.role, name: cleanPlayerName(body.name), roomCode }),
        }), "/internal/create");
        if (response.status === 409) continue;
        const payload = await response.json();
        return json(payload, response.status, headers);
      }
      return json({ error: "room_code_exhausted", message: "暂时无法生成房间码，请稍后重试。" }, 503, headers);
    }

    const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/join$/i);
    if (request.method === "POST" && joinMatch) {
      const roomCode = normalizedRoomCode(joinMatch[1]);
      const body = await parseBody(request);
      if (!validRole(body.role)) return json({ error: "invalid_role", message: "请选择一个阵营。" }, 400, headers);
      const response = await forwardRoomRequest(env, roomCode, new Request(request.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: body.role, name: cleanPlayerName(body.name) }),
      }), "/internal/join");
      return json(await response.json(), response.status, headers);
    }

    const socketMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/i);
    if (request.method === "GET" && socketMatch) {
      if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
        return json({ error: "upgrade_required", message: "该地址只接受 WebSocket 连接。" }, 426, headers);
      }
      const roomCode = normalizedRoomCode(socketMatch[1]);
      return forwardRoomRequest(env, roomCode, request, "/internal/ws");
    }

    return json({ error: "not_found", message: "接口不存在。" }, 404, headers);
  },
};

export class GameRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null;
    this.ctx.blockConcurrencyWhile(async () => {
      this.room = await this.ctx.storage.get("room") || null;
      this.normalizeRoom();
      if (this.room?.botTurnDueAt) {
        await this.ctx.storage.put("room", this.room);
        await this.ctx.storage.setAlarm(this.room.botTurnDueAt);
      }
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/internal/create") return this.createRoom(request);
    if (request.method === "POST" && url.pathname === "/internal/join") return this.joinRoom(request);
    if (request.method === "GET" && url.pathname === "/internal/ws") return this.openSocket(request);
    return json({ error: "not_found", message: "房间接口不存在。" }, 404);
  }

  async createRoom(request) {
    if (this.room) return json({ error: "room_exists", message: "房间码已经被占用。" }, 409);
    const body = await parseBody(request);
    if (!validRole(body.role)) return json({ error: "invalid_role", message: "请选择一个阵营。" }, 400);
    const now = Date.now();
    const token = randomToken();
    this.room = {
      code: normalizedRoomCode(body.roomCode),
      createdAt: now,
      updatedAt: now,
      hostRole: body.role,
      players: {
        [body.role]: { role: body.role, name: cleanPlayerName(body.name), token, ready: false, isBot: false },
      },
      started: false,
      version: 0,
      game: null,
      recentActionIds: [],
      botTurnDueAt: null,
    };
    await this.persist();
    return json({ roomCode: this.room.code, playerToken: token, role: body.role, name: this.room.players[body.role].name }, 201);
  }

  async joinRoom(request) {
    if (!this.room) return json({ error: "room_not_found", message: "没有找到这个房间。" }, 404);
    if (this.room.started) return json({ error: "match_started", message: "该房间已经开始，只能由原玩家重连。" }, 409);
    const body = await parseBody(request);
    if (!validRole(body.role)) return json({ error: "invalid_role", message: "请选择一个阵营。" }, 400);
    if (this.room.players[body.role]) return json({ error: "role_taken", message: "这个阵营已经有人了。" }, 409);
    const token = randomToken();
    this.room.players[body.role] = { role: body.role, name: cleanPlayerName(body.name), token, ready: false, isBot: false };
    this.room.updatedAt = Date.now();
    await this.persist();
    await this.broadcast();
    return json({ roomCode: this.room.code, playerToken: token, role: body.role, name: this.room.players[body.role].name }, 201);
  }

  async openSocket(request) {
    if (!this.room) return json({ error: "room_not_found", message: "没有找到这个房间。" }, 404);
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ authenticated: false, connectedAt: Date.now() });
    server.send(JSON.stringify({ type: "authenticate", roomCode: this.room.code }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket, rawMessage) {
    let message;
    try {
      message = JSON.parse(typeof rawMessage === "string" ? rawMessage : new TextDecoder().decode(rawMessage));
    } catch {
      this.sendError(socket, "invalid_json", "消息格式无效。");
      return;
    }

    const attachment = socket.deserializeAttachment() || { authenticated: false };
    if (!attachment.authenticated) {
      if (message.type !== "authenticate") {
        this.sendError(socket, "authentication_required", "请先验证座位身份。");
        return;
      }
      const player = Object.values(this.room.players).find((item) => !item.isBot && item.token === message.playerToken);
      if (!player) {
        this.sendError(socket, "invalid_token", "重连令牌无效。");
        socket.close(4001, "Invalid player token");
        return;
      }
      socket.serializeAttachment({ authenticated: true, role: player.role, token: player.token, connectedAt: attachment.connectedAt });
      await this.sendSnapshot(socket, player.role);
      await this.broadcast();
      return;
    }

    const player = this.room.players[attachment.role];
    if (!player || player.token !== attachment.token) {
      this.sendError(socket, "seat_revoked", "这个座位已经失效。");
      socket.close(4002, "Seat revoked");
      return;
    }

    if (message.type === "set_bot") {
      if (this.room.started) {
        this.sendError(socket, "match_started", "对局已经开始，不能再调整机器人席位。");
        return;
      }
      if (this.room.hostRole !== player.role) {
        this.sendError(socket, "host_only", "只有房主可以设置机器人。");
        return;
      }
      const targetRole = message.role;
      if (!validRole(targetRole)) {
        this.sendError(socket, "invalid_role", "机器人阵营无效。");
        return;
      }
      const current = this.room.players[targetRole];
      if (message.enabled !== false) {
        if (current) {
          this.sendError(socket, "role_taken", "这个阵营已经有人或机器人了。");
          return;
        }
        this.room.players[targetRole] = {
          role: targetRole,
          name: "AI 机器人",
          token: null,
          ready: true,
          isBot: true,
        };
      } else {
        if (!current?.isBot) {
          this.sendError(socket, "bot_missing", "这个阵营不是机器人席位。");
          return;
        }
        delete this.room.players[targetRole];
      }
      this.room.version += 1;
      this.tryStartMatch();
      this.room.updatedAt = Date.now();
      await this.persist();
      await this.broadcast();
      return;
    }

    if (message.type === "ready") {
      if (this.room.started) {
        this.sendError(socket, "match_started", "对局已经开始。");
        return;
      }
      player.ready = message.ready !== false;
      this.tryStartMatch();
      this.room.updatedAt = Date.now();
      await this.persist();
      await this.broadcast();
      return;
    }

    if (message.type === "leave") {
      if (this.room.started) {
        this.sendError(socket, "match_started", "对局开始后座位会保留，请直接关闭并在稍后重连。" );
        return;
      }
      delete this.room.players[player.role];
      this.normalizeRoom();
      this.room.updatedAt = Date.now();
      await this.persist();
      await this.broadcast();
      socket.close(1000, "Left room");
      return;
    }

    if (message.type === "command") {
      if (!this.room.started || !this.room.game) {
        this.sendError(socket, "match_not_started", "请等待三名玩家准备完成。");
        return;
      }
      if (!message.actionId || typeof message.actionId !== "string") {
        this.sendError(socket, "action_id_required", "行动缺少唯一编号。");
        return;
      }
      if (this.room.recentActionIds.includes(message.actionId)) {
        await this.sendSnapshot(socket, player.role);
        return;
      }
      if (message.expectedVersion !== this.room.version) {
        this.sendError(socket, "stale_state", "牌局已经推进，已为你刷新最新状态。", { version: this.room.version });
        await this.sendSnapshot(socket, player.role);
        return;
      }
      try {
        applyCommand(this.room.game, player.role, message.command);
      } catch (error) {
        if (error instanceof GameRuleError) {
          this.sendError(socket, error.code, error.message, { version: this.room.version });
          return;
        }
        console.error("Unexpected game command error", error);
        this.sendError(socket, "server_error", "服务端处理行动失败，请重试。");
        return;
      }
      this.room.version += 1;
      this.scheduleBotTurn();
      this.room.recentActionIds.push(message.actionId);
      this.room.recentActionIds = this.room.recentActionIds.slice(-100);
      this.room.updatedAt = Date.now();
      await this.persist();
      await this.broadcast();
      return;
    }

    if (message.type === "sync") {
      await this.sendSnapshot(socket, player.role);
      return;
    }
    this.sendError(socket, "unknown_message", "未知房间消息。");
  }

  async webSocketClose() {
    await this.broadcast();
  }

  async webSocketError() {
    await this.broadcast();
  }

  connectedRoles() {
    const roles = new Set();
    this.ctx.getWebSockets().forEach((socket) => {
      const attachment = socket.deserializeAttachment();
      if (attachment?.authenticated && validRole(attachment.role) && socket.readyState === WebSocket.OPEN) roles.add(attachment.role);
    });
    return roles;
  }

  normalizeRoom() {
    if (!this.room) return;
    if (!this.room.players || typeof this.room.players !== "object") this.room.players = {};
    ROLE_ORDER.forEach((role) => {
      const player = this.room.players[role];
      if (!player) return;
      player.isBot = Boolean(player.isBot);
      if (player.isBot) {
        player.ready = true;
        player.token = null;
      }
    });
    const currentHost = this.room.players[this.room.hostRole];
    if (!currentHost || currentHost.isBot) {
      this.room.hostRole = ROLE_ORDER.find((role) => this.room.players[role] && !this.room.players[role].isBot) || null;
    }
    if (!this.room.hostRole) {
      ROLE_ORDER.forEach((role) => {
        if (this.room.players[role]?.isBot) delete this.room.players[role];
      });
    }
    if (!Number.isFinite(this.room.botTurnDueAt)) this.room.botTurnDueAt = null;
    if (this.room.started && this.room.game && this.room.players[this.room.game.currentRole]?.isBot && !this.room.botTurnDueAt) {
      this.room.botTurnDueAt = Date.now() + BOT_ACTION_DELAY_MS;
    }
  }

  tryStartMatch() {
    if (this.room.started) return false;
    const allSeatsReady = ROLE_ORDER.every((role) => {
      const player = this.room.players[role];
      return player && (player.isBot || player.ready);
    });
    if (!allSeatsReady) return false;
    this.room.game = createInitialState();
    this.room.started = true;
    this.room.version += 1;
    this.scheduleBotTurn();
    return true;
  }

  scheduleBotTurn() {
    if (!this.room.started || !this.room.game || this.room.game.phase === "ended") {
      this.room.botTurnDueAt = null;
      return false;
    }
    const role = this.room.game.currentRole;
    if (!this.room.players[role]?.isBot) {
      this.room.botTurnDueAt = null;
      return false;
    }
    this.room.botTurnDueAt = Date.now() + BOT_ACTION_DELAY_MS;
    return true;
  }

  runScheduledBotTurn() {
    if (!this.room.started || !this.room.game || this.room.game.phase === "ended") return false;
    const role = this.room.game.currentRole;
    if (!this.room.players[role]?.isBot) return false;
    const command = chooseBotCommand(this.room.game, role);
    if (!command) return false;
    try {
      applyCommand(this.room.game, role, command);
    } catch (error) {
      console.error("Bot command failed", { role, command, error });
      return false;
    }
    this.room.version += 1;
    this.scheduleBotTurn();
    return true;
  }

  publicRoom() {
    const connected = this.connectedRoles();
    return {
      code: this.room.code,
      started: this.room.started,
      version: this.room.version,
      hostRole: this.room.hostRole,
      players: Object.fromEntries(ROLE_ORDER.map((role) => {
        const player = this.room.players[role];
        return [role, player ? {
          role,
          name: player.name,
          ready: player.ready,
          connected: player.isBot || connected.has(role),
          isBot: player.isBot,
          isHost: role === this.room.hostRole,
        } : null];
      })),
    };
  }

  async sendSnapshot(socket, role) {
    const payload = {
      type: "snapshot",
      room: this.publicRoom(),
      state: this.room.started && this.room.game ? createPlayerView(this.room.game, role) : null,
    };
    this.safeSend(socket, payload);
  }

  async broadcast() {
    if (!this.room) return;
    const sockets = this.ctx.getWebSockets();
    for (const socket of sockets) {
      const attachment = socket.deserializeAttachment();
      if (!attachment?.authenticated || !validRole(attachment.role)) continue;
      await this.sendSnapshot(socket, attachment.role);
    }
  }

  safeSend(socket, payload) {
    try {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    } catch (error) {
      console.warn("WebSocket send failed", error);
    }
  }

  sendError(socket, code, message, details = {}) {
    this.safeSend(socket, { type: "error", code, message, ...details });
  }

  async persist() {
    await this.ctx.storage.put("room", this.room);
    const ttlAlarm = Date.now() + ROOM_TTL_MS;
    await this.ctx.storage.setAlarm(Math.min(this.room.botTurnDueAt || ttlAlarm, ttlAlarm));
  }

  async alarm() {
    if (!this.room) return;
    const now = Date.now();
    if (this.room.botTurnDueAt) {
      if (this.room.botTurnDueAt > now) {
        await this.ctx.storage.setAlarm(this.room.botTurnDueAt);
        return;
      }
      this.room.botTurnDueAt = null;
      if (this.runScheduledBotTurn()) {
        this.room.updatedAt = now;
        await this.persist();
        await this.broadcast();
        return;
      }
    }
    const hasConnections = this.ctx.getWebSockets().some((socket) => socket.readyState === WebSocket.OPEN);
    if (!hasConnections && now - this.room.updatedAt >= ROOM_TTL_MS) {
      await this.ctx.storage.deleteAll();
      this.room = null;
      return;
    }
    await this.ctx.storage.setAlarm(now + ROOM_TTL_MS);
  }
}
