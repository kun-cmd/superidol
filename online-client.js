(() => {
  const DEFAULT_ONLINE_SERVER = "https://superidol-online.wce5723.workers.dev";
  const SESSION_KEY = "superidol.online.session.v1";
  const SERVER_KEY = "superidol.online.server.v1";
  const ROLE_LABELS = { anti: "Ben · 黑粉", star: "Eli · 明星", fan: "Maya · 真爱粉" };
  const ROLE_COLORS = { anti: "var(--anti)", star: "var(--star)", fan: "var(--fan)" };

  const original = {
    publishSelection,
    passTurn,
    coolSelection,
    startCoolingSelection,
    cancelCoolingSelection,
    investSelectedWork,
    useFanSkill,
    queueAutomaticTurn,
    restart,
    toggleCard,
    toggleWorkSelection,
    setFanVoice,
    setWildChoice,
    toggleAntiCapture,
    setFanGiftTarget,
  };

  let selectedRole = "anti";
  let session = loadSession();
  let socket = null;
  let roomSnapshot = null;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let intentionalClose = false;
  let pendingAction = false;
  let pendingTimer = null;
  let roundDialogVersion = null;
  let resultDialogVersion = null;
  let localSelection = freshLocalSelection();

  const query = new URLSearchParams(location.search);
  let serverBase = normalizeServer(query.get("server") || localStorage.getItem(SERVER_KEY) || DEFAULT_ONLINE_SERVER);
  if (query.get("server") && serverBase) localStorage.setItem(SERVER_KEY, serverBase);

  function freshLocalSelection() {
    return { ids: [], coolingMode: false, coolingCardId: null, workSelected: false, fanVoice: "fan", wildChoice: null, captureAll: false, fanTarget: "fan" };
  }

  function normalizeServer(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      if (!/^https?:$/.test(url.protocol)) return "";
      return url.origin;
    } catch {
      return "";
    }
  }

  function loadSession() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!value?.roomCode || !value?.playerToken || !value?.role || !value?.serverBase) return null;
      return value;
    } catch {
      return null;
    }
  }

  function saveSession(value) {
    session = value;
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
    updateResumeButton();
  }

  function setFeedback(id, message, isError = false) {
    const target = el(id);
    if (!target) return;
    target.textContent = message || "";
    target.classList.toggle("error", isError);
  }

  function showToast(message) {
    document.querySelector(".online-toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "online-toast";
    toast.setAttribute("role", "alert");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  }

  function setPending(value) {
    pendingAction = value;
    document.body.classList.toggle("online-pending", value);
    clearTimeout(pendingTimer);
    if (value) {
      pendingTimer = setTimeout(() => {
        pendingAction = false;
        document.body.classList.remove("online-pending");
        showToast("行动确认超时，正在同步房间状态。");
        sendSocket({ type: "sync" });
      }, 9000);
    }
  }

  function setRoomInUrl(roomCode) {
    const url = new URL(location.href);
    url.searchParams.delete("simulate");
    url.searchParams.delete("seed");
    url.searchParams.set("room", roomCode);
    history.replaceState(null, "", url);
  }

  function clearRoomFromUrl() {
    const url = new URL(location.href);
    url.searchParams.delete("room");
    history.replaceState(null, "", url);
  }

  function buildRolePicks() {
    el("onlineRolePicks").innerHTML = ROLE_ORDER.map((role) => `
      <button type="button" data-online-role="${role}" class="${selectedRole === role ? "selected" : ""}" style="--role-color:${ROLE_COLORS[role]}">
        <strong>${ROLE_LABELS[role]}</strong><small>${ROLES[role].accountName}</small>
      </button>
    `).join("");
    el("onlineRolePicks").querySelectorAll("[data-online-role]").forEach((button) => {
      button.onclick = () => {
        selectedRole = button.dataset.onlineRole;
        buildRolePicks();
      };
    });
  }

  function setStartMode(mode) {
    el("onlineStartPanel").hidden = mode !== "online";
    el("soloStartPanel").hidden = mode !== "solo";
    el("onlineLobby").hidden = true;
    el("startModeTabs").hidden = false;
    el("startModeTabs").querySelectorAll("[data-start-mode]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.startMode === mode);
    });
    el("startTitle").textContent = mode === "online" ? "开始在线游戏" : "选择你要扮演的阵营";
  }

  function showLobby() {
    el("onlineStartPanel").hidden = true;
    el("soloStartPanel").hidden = true;
    el("startModeTabs").hidden = true;
    el("onlineLobby").hidden = false;
    el("startTitle").textContent = "在线房间";
    el("onlineLobbyCode").textContent = session?.roomCode || "------";
    if (!el("startDialog").open) el("startDialog").showModal();
    renderLobby();
  }

  function updateResumeButton() {
    const button = el("resumeOnlineRoom");
    if (!button) return;
    button.hidden = !session;
    if (session) button.textContent = `恢复房间 ${session.roomCode} · ${ROLE_LABELS[session.role]}`;
  }

  async function healthCheck() {
    if (!serverBase) {
      setFeedback("onlineFeedback", "联机服务尚未配置；单人试玩仍可正常使用。", true);
      el("createOnlineRoom").disabled = true;
      el("joinOnlineRoom").disabled = true;
      return;
    }
    try {
      const response = await fetch(`${serverBase}/api/health`, { cache: "no-store" });
      if (!response.ok) throw new Error("health check failed");
      setFeedback("onlineFeedback", "房间服务已连接。创建房间后，把六位房间码发给另外两人。" );
    } catch {
      setFeedback("onlineFeedback", "暂时无法连接联机服务；你仍可以切换到单人试玩。", true);
    }
  }

  function requestIdentity() {
    const name = el("onlinePlayerName").value.trim().slice(0, 20) || "匿名玩家";
    el("onlinePlayerName").value = name;
    localStorage.setItem("superidol.online.name", name);
    return { name, role: selectedRole };
  }

  async function apiRequest(path, body) {
    if (!serverBase) throw new Error("联机服务尚未配置。");
    const response = await fetch(`${serverBase}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "房间请求失败。");
    return payload;
  }

  async function createRoom() {
    setFeedback("onlineFeedback", "正在创建房间…");
    try {
      const payload = await apiRequest("/api/rooms", requestIdentity());
      adoptSession(payload);
    } catch (error) {
      setFeedback("onlineFeedback", error.message, true);
    }
  }

  async function joinRoom() {
    const roomCode = el("onlineRoomCode").value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
      setFeedback("onlineFeedback", "请输入六位房间码。", true);
      return;
    }
    setFeedback("onlineFeedback", "正在加入房间…");
    try {
      const payload = await apiRequest(`/api/rooms/${roomCode}/join`, requestIdentity());
      adoptSession(payload);
    } catch (error) {
      setFeedback("onlineFeedback", error.message, true);
    }
  }

  function adoptSession(payload) {
    saveSession({
      serverBase,
      roomCode: payload.roomCode,
      playerToken: payload.playerToken,
      role: payload.role,
      name: payload.name,
    });
    selectedRole = payload.role;
    setRoomInUrl(payload.roomCode);
    showLobby();
    connectRoom();
  }

  function websocketUrl() {
    const base = new URL(session.serverBase);
    base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
    base.pathname = `/api/rooms/${session.roomCode}/ws`;
    base.search = "";
    return base.toString();
  }

  function connectRoom() {
    if (!session) return;
    intentionalClose = false;
    clearTimeout(reconnectTimer);
    if (socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(socket.readyState)) socket.close();
    updateSessionChip("reconnecting");
    setFeedback("onlineLobbyFeedback", "正在连接房间…");
    socket = new WebSocket(websocketUrl());
    socket.onopen = () => {
      reconnectAttempts = 0;
      setFeedback("onlineLobbyFeedback", "连接成功，正在验证座位…");
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      handleSocketMessage(message);
    };
    socket.onclose = (event) => {
      setPending(false);
      updateSessionChip("reconnecting");
      if (intentionalClose || !session) return;
      if (event.code === 4001 || event.code === 4002) {
        saveSession(null);
        clearRoomFromUrl();
        showToast("房间身份已经失效，请重新创建或加入房间。" );
        setStartMode("online");
        if (!el("startDialog").open) el("startDialog").showModal();
        return;
      }
      reconnectAttempts += 1;
      const delay = Math.min(8000, 800 * (2 ** Math.min(reconnectAttempts, 4)));
      setFeedback("onlineLobbyFeedback", `连接中断，${Math.ceil(delay / 1000)}秒后自动重连。`, true);
      reconnectTimer = setTimeout(connectRoom, delay);
    };
    socket.onerror = () => setFeedback("onlineLobbyFeedback", "房间连接出现错误，正在重试。", true);
  }

  function sendSocket(message) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  }

  function handleSocketMessage(message) {
    if (message.type === "authenticate") {
      sendSocket({ type: "authenticate", playerToken: session.playerToken });
      return;
    }
    if (message.type === "error") {
      setPending(false);
      const target = el("onlineLobby").hidden ? null : "onlineLobbyFeedback";
      if (target) setFeedback(target, message.message, true);
      else showToast(message.message || "行动被服务端拒绝。" );
      return;
    }
    if (message.type !== "snapshot") return;
    const previousVersion = roomSnapshot?.version;
    roomSnapshot = message.room;
    if (previousVersion !== undefined && previousVersion !== roomSnapshot.version) localSelection = freshLocalSelection();
    setPending(false);
    updateSessionChip("connected");
    renderLobby();
    if (!message.state) {
      showLobby();
      return;
    }
    enterOnlineGame(message.state);
  }

  function renderLobby() {
    if (!session) return;
    el("onlineLobbyCode").textContent = session.roomCode;
    const players = roomSnapshot?.players || {};
    const isHost = roomSnapshot?.hostRole === session.role;
    el("onlinePlayerList").innerHTML = ROLE_ORDER.map((role) => {
      const player = players[role];
      const status = !player ? "等待加入" : player.isBot ? "AI 已准备" : player.ready ? "已准备" : player.connected ? "未准备" : "已占座 · 离线";
      const detail = !player ? "空座位" : player.isBot ? "服务器托管" : player.connected ? "在线" : "等待重连";
      const hostLabel = player?.isHost ? " · 房主" : "";
      const botButton = isHost && !roomSnapshot?.started && (!player || player.isBot)
        ? `<button class="online-bot-button" type="button" data-bot-role="${role}" data-bot-enabled="${player?.isBot ? "false" : "true"}">${player?.isBot ? "移除 AI" : "加入 AI"}</button>`
        : `<em class="${player?.ready ? "ready" : ""}">${status}</em>`;
      return `<div class="online-player-slot${player?.isBot ? " bot" : ""}" style="--role-color:${ROLE_COLORS[role]}"><div><strong>${ROLE_LABELS[role]}${player?.name ? ` · ${escapeHtml(player.name)}` : ""}${hostLabel}</strong><small>${detail}</small></div>${botButton}</div>`;
    }).join("");
    el("onlinePlayerList").querySelectorAll("[data-bot-role]").forEach((button) => {
      button.onclick = () => sendSocket({
        type: "set_bot",
        role: button.dataset.botRole,
        enabled: button.dataset.botEnabled === "true",
      });
    });
    const own = players[session.role];
    const readyButton = el("readyOnlineRoom");
    readyButton.textContent = own?.ready ? "取消准备" : "准备";
    readyButton.disabled = !own || !own.connected || roomSnapshot?.started;
    const joined = Object.values(players).filter(Boolean).length;
    const setupHint = isHost ? "房主可把空阵营设为 AI；真人全部准备后自动发牌。" : "等待房主配置空位；真人全部准备后自动发牌。";
    setFeedback("onlineLobbyFeedback", roomSnapshot?.started ? "对局已经开始。" : `已加入 ${joined}/3；${setupHint}`);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function normalizeServerState(serverState) {
    const restoreCapturedCard = (card) => {
      if (!card || typeof card !== "object") return;
      delete card.isCapturedMemory;
      if (typeof card.name === "string") card.name = card.name.replace(/^断章取义：/, "");
    };
    Object.values(serverState.roles || {}).forEach((roleState) => {
      (roleState.hand || []).forEach(restoreCapturedCard);
      (roleState.discard || []).forEach(restoreCapturedCard);
    });
    (serverState.topPlay?.cards || []).forEach(restoreCapturedCard);
    if (serverState.topPlay?.pattern) delete serverState.topPlay.pattern.memoryConverted;
    if (serverState.topPlay?.cards) serverState.topPlay.cardNames = serverState.topPlay.cards.map((card) => card.name);
    if (serverState.lastCompletedRound) {
      delete serverState.lastCompletedRound.memoryConverted;
      if (typeof serverState.lastCompletedRound.pattern === "string") {
        serverState.lastCompletedRound.pattern = serverState.lastCompletedRound.pattern.replace(/^金色记忆 · /, "");
      }
    }
    (serverState.logs || []).forEach((log) => {
      if (typeof log.message === "string") {
        log.message = log.message
          .replace(/，将它们转化为金色记忆牌/g, "")
          .replace(/金色记忆 · /g, "");
      }
    });
    if (!Array.isArray(serverState.heatInterventionTriggered)) serverState.heatInterventionTriggered = [];
    if (!Number.isFinite(serverState.heatInterventionTokens)) serverState.heatInterventionTokens = 0;
    if (!serverState.heatFeedback || typeof serverState.heatFeedback !== "object") {
      serverState.heatFeedback = { amount: 0, sequence: 0, recordBroken: false, interventionsAdded: 0 };
    } else {
      serverState.heatFeedback.recordBroken = Boolean(serverState.heatFeedback.recordBroken);
      if (!Number.isFinite(serverState.heatFeedback.interventionsAdded)) serverState.heatFeedback.interventionsAdded = 0;
    }
    return serverState;
  }

  function enterOnlineGame(serverState) {
    const wasOnline = Boolean(window.__onlineActive);
    window.__onlineActive = true;
    document.body.classList.add("online-active");
    if (el("startDialog").open) el("startDialog").close();
    const previousState = state;
    state = normalizeServerState(serverState);
    state.userRole = session.role;
    state.selectedIds = localSelection.ids.filter((id) => state.roles[session.role].hand.some((card) => card.id === id));
    state.coolingMode = Boolean(localSelection.coolingMode);
    state.coolingCardId = state.roles[session.role].hand.some((card) => card.id === localSelection.coolingCardId) ? localSelection.coolingCardId : null;
    state.skills.star.selected = Boolean(localSelection.workSelected && session.role === "star" && state.skills.star.status === "forging");
    state.fanVoiceChoice = localSelection.fanVoice;
    state.wildChannelChoice = localSelection.wildChoice;
    state.skills.anti.captureArmed = localSelection.captureAll;
    state.skills.fan.target = localSelection.fanTarget;
    state.oldStoryCall = null;
    state.experiment = null;
    state.aiModes = { anti: "online", star: "online", fan: "online" };
    if (state.campaign) {
      campaign.eventNumber = state.campaign.eventNumber;
      campaign.influence = { ...state.campaign.influence };
      campaign.permanentMemory = state.campaign.permanentMemory;
      campaign.activeTheme = state.campaign.activeTheme;
      campaign.nextTheme = state.campaign.nextTheme;
      campaign.albumFragments = (state.campaign.albumFragments || []).map((item) => ({ ...item }));
      campaign.storyTime = state.campaign.storyTime;
      campaign.lastGapMonths = state.campaign.lastGapMonths;
    }
    if (previousState?.phase === "round_break" && state.phase === "action") localSelection = freshLocalSelection();
    const playSignature = (value) => value?.topPlay
      ? `${value.issueIndex}:${value.roundInIssue}:${value.topPlay.publishedAt || 0}:${value.topPlay.role}:${value.topPlay.cardIds.join("-")}`
      : "";
    const animatePlay = wasOnline && state.topPlay && playSignature(previousState) !== playSignature(state);
    if (animatePlay && typeof animateSuccessfulPlay === "function") {
      animateSuccessfulPlay(state.topPlay.role, state.topPlay.cards || [], () => {
        render();
        renderOnlinePhaseDialog();
      });
      return;
    }
    render();
    renderOnlinePhaseDialog();
  }

  function renderOnlinePhaseDialog() {
    if (!window.__onlineActive || !state || !roomSnapshot) return;
    const roundDialog = el("roundDialog");
    const resultDialog = el("resultDialog");
    if (state.phase !== "round_break" && roundDialog.open) roundDialog.close();
    if (state.phase !== "ended" && resultDialog.open) resultDialog.close();
    if (state.phase === "round_break" && roundDialogVersion !== roomSnapshot.version) {
      roundDialogVersion = roomSnapshot.version;
      const completed = state.lastCompletedRound;
      const progress = completed.issueWon
        ? `问题完成定调：“${state.issues[completed.issueIndex].claims[completed.issueWinner]}”。`
        : `当前定调标记：${ROLE_ORDER.map((role) => `${ROLES[role].short} ${completed.markerSnapshot[role]}/${ISSUE_MARKER_TARGET}`).join(" · ")}。`;
      const canContinue = state.currentRole === session.role;
      const intervention = completed.heatIntervention?.consumed
        ? `<br><strong>路人介入：</strong>消耗1枚；${ROLES[completed.controller].short}保留标记，但下一话轮改由${ROLES[completed.heatIntervention.to].short}领出。`
        : "";
      el("roundBody").innerHTML = `<h2>${completed.issueTitle} · 第${completed.roundInIssue}话轮结束</h2><p>${completed.reason}。</p><div class="outcome"><strong>本轮置顶：</strong>“${state.issues[completed.issueIndex].claims[completed.owner]}”<br><strong>牌型：</strong>${completed.pattern}<br><strong>结算：</strong>${completed.channelOutcome}${intervention}</div><p>${progress}</p><p>下一话轮由<strong>${ROLES[state.currentRole].name}</strong>领出。</p><div class="dialog-actions"><button class="primary-button" id="continueOnlineRound" ${canContinue ? "" : "disabled"}>${canContinue ? "继续下一话轮" : `等待${ROLES[state.currentRole].short}继续`}</button></div>`;
      if (!roundDialog.open) roundDialog.showModal();
      el("continueOnlineRound").onclick = () => sendCommand({ type: "continue" });
    }
    if (state.phase === "ended" && resultDialogVersion !== roomSnapshot.version) {
      resultDialogVersion = roomSnapshot.version;
      const narratives = state.issues.map((issue, index) => {
        const seat = state.seats.find((item) => item.issueIndex === index);
        return `<li><strong>${issue.title}</strong> ${seat ? issue.claims[seat.owner] : "尚未完成定调"}</li>`;
      }).join("");
      const results = ROLE_ORDER.map((role) => {
        const result = state.victoryResults?.[role] || { won: false, checks: [] };
        const detail = result.checks.map((item) => `${item.ok ? "✓" : "✕"} ${escapeHtml(item.label)}`).join("<br>");
        return `<div class="result-card" style="--role-color:${ROLES[role].color}"><span>${ROLES[role].name}</span><strong>${result.won ? "胜利" : "失败"}</strong><p>${detail}</p></div>`;
      }).join("");
      const eventNumber = state.campaign?.eventNumber || 1;
      const fragments = state.campaign?.albumFragments || [];
      const fragment = fragments.find((item) => item.eventNumber === eventNumber);
      const fragmentLine = eventNumber <= 2
        ? `<br><strong>Album Fragment：</strong>${fragment ? `${escapeHtml(fragment.title)} · ${fragment.level}级作品已记录` : "本事件没有打出5—6级作品"}${eventNumber === 2 && fragments.length >= 2 ? "；第三事件解锁 ROOM TONE" : ""}`
        : "";
      const canAdvance = eventNumber < 3;
      const primaryButton = canAdvance
        ? '<button class="primary-button" id="continueOnlineCampaign">进入下一事件</button>'
        : '<button class="primary-button" id="newOnlineRoom">创建新房间</button>';
      el("resultBody").innerHTML = `<h2>${eventNumber >= 3 ? "三事件结局" : `事件 ${eventNumber} / 3 胜负`}</h2><p>${state.endReason || "牌局已经结束。"}</p><div class="outcome"><strong>事件：</strong>${escapeHtml(state.theme?.title || "Unknown Event")}<br><strong>事件最终Heat：</strong>${state.heat}<br><strong>明星压力：</strong>${state.pressure}/${PRESSURE_MAX}<br><strong>路人介入：</strong>触发${state.heatInterventionTriggered.length}条 · 剩余${state.heatInterventionTokens}枚${fragmentLine}<ul class="narrative-list">${narratives}</ul></div><div class="result-grid">${results}</div><p>Maya的解释始终属于Maya；只有Eli的出牌才算本人回应。</p><div class="dialog-actions"><button class="plain-button" id="closeOnlineResult">查看最终局面</button>${primaryButton}</div>`;
      if (!resultDialog.open) resultDialog.showModal();
      el("closeOnlineResult").onclick = () => resultDialog.close();
      if (canAdvance) {
        el("continueOnlineCampaign").onclick = () => sendCommand({ type: "next_event" });
      } else {
        el("newOnlineRoom").onclick = () => {
          resultDialog.close();
          disconnectRoom({ keepSession: false });
          setStartMode("online");
          el("startDialog").showModal();
        };
      }
    }
  }

  function updateSessionChip(connectionState = "connected") {
    let chip = document.querySelector(".online-session-chip");
    if (!session || !window.__onlineActive) {
      chip?.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement("button");
      chip.type = "button";
      chip.className = "online-session-chip";
      chip.onclick = () => showToast(`房间 ${session.roomCode} · 刷新页面会自动重连到${ROLE_LABELS[session.role]}座位。`);
      el("restartButton").parentElement.before(chip);
    }
    chip.className = `online-session-chip ${connectionState}`;
    chip.innerHTML = `<span>${connectionState === "connected" ? "联机已连接" : "正在重连"}</span><strong>${session.roomCode} · ${ROLE_LABELS[session.role]}</strong>`;
  }

  function sendCommand(command) {
    if (!window.__onlineActive) return false;
    if (pendingAction) return false;
    if (!roomSnapshot || !sendSocket({
      type: "command",
      actionId: crypto.randomUUID(),
      expectedVersion: roomSnapshot.version,
      command,
    })) {
      showToast("当前没有连接到房间，正在尝试重连。" );
      connectRoom();
      return false;
    }
    setPending(true);
    return true;
  }

  function disconnectRoom({ keepSession = true } = {}) {
    intentionalClose = true;
    clearTimeout(reconnectTimer);
    setPending(false);
    socket?.close();
    socket = null;
    roomSnapshot = null;
    window.__onlineActive = false;
    document.body.classList.remove("online-active", "online-pending");
    document.querySelector(".online-session-chip")?.remove();
    if (!keepSession) {
      saveSession(null);
      clearRoomFromUrl();
    }
    state = null;
  }

  function leaveLobby() {
    if (roomSnapshot?.started) {
      disconnectRoom({ keepSession: true });
    } else {
      sendSocket({ type: "leave" });
      disconnectRoom({ keepSession: false });
    }
    setStartMode("online");
  }

  publishSelection = function onlinePublishSelection() {
    if (!window.__onlineActive) return original.publishSelection();
    if (state.phase !== "action" || state.currentRole !== state.userRole || !roleCanPlay(state.userRole)) return;
    const cards = selectedCards();
    const pattern = selectedPattern(cards, state.wildChannelChoice);
    const response = responseMode(pattern, state.userRole, state.userRole === "fan" ? state.fanVoiceChoice : null, { workRelease: Boolean(pattern?.isWorkRelease) });
    if (!response.legal) return;
    sendCommand({
      type: "play",
      cardIds: cards.map((card) => card.id),
      patternOptionKey: pattern.optionKey,
      fanVoice: state.userRole === "fan" ? state.fanVoiceChoice : null,
      captureAll: Boolean(state.skills.anti.captureArmed),
    });
  };

  passTurn = function onlinePassTurn(role, automatic = false, decisionNote = "") {
    if (!window.__onlineActive) return original.passTurn(role, automatic, decisionNote);
    if (role === state.userRole) sendCommand({ type: "pass" });
  };

  coolSelection = function onlineCoolSelection() {
    if (!window.__onlineActive) return original.coolSelection();
    if (state.coolingMode && state.coolingCardId) sendCommand({ type: "cool", cardId: state.coolingCardId });
  };

  startCoolingSelection = function onlineStartCoolingSelection() {
    original.startCoolingSelection();
    syncLocalSelection();
  };

  cancelCoolingSelection = function onlineCancelCoolingSelection() {
    original.cancelCoolingSelection();
    syncLocalSelection();
  };

  investSelectedWork = function onlineInvestSelectedWork() {
    if (!window.__onlineActive) return original.investSelectedWork();
    if (state.userRole === "star" && state.selectedIds.length === 1 && !state.skills.star.selected) {
      sendCommand({ type: "invest", cardId: state.selectedIds[0] });
    }
  };

  useFanSkill = function onlineUseFanSkill() {
    if (!window.__onlineActive) return original.useFanSkill();
    if (state.userRole === "fan" && state.selectedIds.length === 1) {
      sendCommand({ type: "fan_gift", cardId: state.selectedIds[0], targetRole: state.skills.fan.target });
    }
  };

  function syncLocalSelection() {
    if (!window.__onlineActive || !state) return;
    localSelection.ids = [...state.selectedIds];
    localSelection.coolingMode = Boolean(state.coolingMode);
    localSelection.coolingCardId = state.coolingCardId || null;
    localSelection.workSelected = Boolean(state.skills.star.selected);
    localSelection.fanVoice = state.fanVoiceChoice;
    localSelection.wildChoice = state.wildChannelChoice;
    localSelection.captureAll = Boolean(state.skills.anti.captureArmed);
    localSelection.fanTarget = state.skills.fan.target;
  }

  toggleCard = function onlineToggleCard(cardId) {
    original.toggleCard(cardId);
    syncLocalSelection();
  };

  toggleWorkSelection = function onlineToggleWorkSelection() {
    original.toggleWorkSelection();
    syncLocalSelection();
  };

  setFanVoice = function onlineSetFanVoice(value) {
    original.setFanVoice(value);
    syncLocalSelection();
  };

  setWildChoice = function onlineSetWildChoice(optionKey) {
    original.setWildChoice(optionKey);
    syncLocalSelection();
  };

  toggleAntiCapture = function onlineToggleAntiCapture() {
    original.toggleAntiCapture();
    syncLocalSelection();
  };

  setFanGiftTarget = function onlineSetFanGiftTarget(role) {
    original.setFanGiftTarget(role);
    syncLocalSelection();
  };

  queueAutomaticTurn = function onlineQueueAutomaticTurn() {
    if (window.__onlineActive) return;
    return original.queueAutomaticTurn();
  };

  function setupOnlineUi() {
    window.__onlineActive = false;
    el("onlinePlayerName").value = localStorage.getItem("superidol.online.name") || "";
    buildRolePicks();
    updateResumeButton();
    setStartMode("online");
    el("startModeTabs").querySelectorAll("[data-start-mode]").forEach((button) => {
      button.onclick = () => setStartMode(button.dataset.startMode);
    });
    el("createOnlineRoom").onclick = createRoom;
    el("joinOnlineRoom").onclick = joinRoom;
    el("onlineRoomCode").oninput = (event) => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); };
    el("onlineRoomCode").onkeydown = (event) => { if (event.key === "Enter") joinRoom(); };
    el("resumeOnlineRoom").onclick = () => {
      serverBase = normalizeServer(session.serverBase);
      setRoomInUrl(session.roomCode);
      showLobby();
      connectRoom();
    };
    el("copyOnlineRoomCode").onclick = async () => {
      await navigator.clipboard.writeText(session.roomCode).catch(() => {});
      el("copyOnlineRoomCode").textContent = "已复制";
      setTimeout(() => { el("copyOnlineRoomCode").textContent = "复制"; }, 1200);
    };
    el("readyOnlineRoom").onclick = () => {
      const own = roomSnapshot?.players?.[session.role];
      sendSocket({ type: "ready", ready: !own?.ready });
    };
    el("leaveOnlineRoom").onclick = leaveLobby;
    el("restartButton").onclick = () => {
      if (!window.__onlineActive) return original.restart();
      if (!confirm("暂时离开在线牌局？你的座位会保留，刷新或点击恢复房间即可重连。")) return;
      disconnectRoom({ keepSession: true });
      setStartMode("online");
      el("startDialog").showModal();
    };
    healthCheck();

    const requestedRoom = query.get("room")?.toUpperCase();
    if (session && requestedRoom === session.roomCode) {
      serverBase = normalizeServer(session.serverBase);
      showLobby();
      connectRoom();
    }
  }

  setupOnlineUi();
})();
