(() => {
  "use strict";

  const STORAGE_KEY = "superidol.language";
  const ATTRIBUTES = ["aria-label", "placeholder", "title"];
  const HAN_RE = /[\u3400-\u9fff]/;
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  let language = localStorage.getItem(STORAGE_KEY) === "zh-CN" ? "zh-CN" : "en";
  let observer = null;

  const EXACT_ENGLISH = new Map(Object.entries({
    "粉丝的两种回应": "Two ways for Maya to respond",
    "：Maya每个话轮首次出牌时选择“自己的解释”或“援护Haru”，本话轮内不能切换。自己的解释获得Maya标记；援护花费Maya的手牌，但标记归Haru。": ": On her first play each Round, Maya chooses her own interpretation or support for Haru. The choice is locked for that Round. Her interpretation earns Maya Points; support spends her cards but earns Haru Points.",
    "：Maya以自己的解释首次入场时压力+1，即使被反压也不撤销；援护入场不加压。Ben赢下话轮时压力+1。": ": Maya’s first play of her own interpretation each Round adds 1 Pressure, even if countered. Supporting Haru adds no Pressure on play. Ben winning a Round adds 1 Pressure.",
    "援护减压": "Support and Pressure relief",
    "：本话轮有Maya援护，且最终由Haru叙事赢下话轮，压力−1；没有援护时，仅Haru的立场频道定调压力−1。两种减压不叠加，未赢下话轮不减压。": ": If Maya supports Haru during a Round and Haru’s narrative wins it, Pressure falls by 1. Without support, only Haru winning with Position reduces Pressure by 1. These effects do not stack. Losing the Round gives no relief.",
    "压力达到4时Haru失声，无法继续出牌，尚未发布的“沉淀成章”和全部投入牌立即消失。压力降到2或以下时恢复发声；从4降到3仍然失声，已失去的作品不会恢复。": "At 4 Pressure, Haru is silenced and cannot play. His unreleased work and invested cards are lost. He recovers at 2 Pressure or below; falling from 4 to 3 is not enough. Lost work does not return.",
    "：Haru取得至少2个定义（含Maya援护取得的定义），并且结束压力不超过2。": ": Haru holds at least 2 Objectives, including those earned through Maya’s support, and ends with Pressure at 2 or below.",
    "：Ben至少取得1个定义，并且满足以下任一条件：Haru最多取得1个定义，或结束压力达到3及以上。": ": Ben holds at least 1 Objective, and either Haru holds at most 1 Objective or final Pressure is 3 or higher.",
    "三方在每局结束时分别判定。可能单方胜利、Haru与Maya共赢、Maya与Ben共赢或无人获胜，绝不会三方同时获胜。Heat不直接决定胜负。": "Each side is evaluated at the end of the Event. One side, Haru and Maya, Maya and Ben, or nobody may win. All three can never win together. Heat does not directly decide victory.",
    "Haru取得至少2个定义，且结束压力不超过2。": "Haru holds at least 2 Objectives and ends with Pressure at 2 or below.",
    "Ben至少取得1个定义，且Haru最多1个定义或结束压力至少3。": "Ben holds at least 1 Objective, and Haru holds at most 1 or final Pressure is at least 3.",
    "Ben至少1个定义，且Haru最多1个定义或结束压力至少3": "Ben holds at least 1 Objective; Haru holds at most 1 or final Pressure is at least 3",
    "结束压力不超过2": "Final Pressure at 2 or below",
    "自己的解释": "My interpretation",
    "Maya自己的解释": "Maya's interpretation",
    "援护Haru": "Support Haru",
    "本话轮模式已锁定": "Mode locked for this Round",
    "首次出牌时选择本话轮模式": "Choose your mode for this Round",
    "花自己的牌，标记归Haru；本轮Haru定调则压力−1。": "Spend your cards for Haru’s Points. If his narrative wins this Round: Pressure −1.",
    "标记归Maya；本话轮首次入场压力+1。": "Points go to Maya. Your first play this Round adds 1 Pressure.",
    "账号失声 · 援护定调压力−1，降到2恢复发声": "SILENCED · Winning with support reduces Pressure by 1; recover at 2",
    "Maya可以援护你；压力降到2或以下时恢复发声。": "Maya can support you. Recover your voice at 2 Pressure or below.",
    "援护中的明星叙事 · 若守到结算，压力−1": "Haru’s supported narrative · Win this Round for Pressure −1",
    "若明星叙事守到话轮结算，压力−1（不叠加）。": "If Haru’s narrative wins the Round: Pressure −1 (does not stack).",
    "粉丝援护守住话轮，压力-1": "Support held the Round: Pressure −1",
    "Maya可以争取自己的定义，也可以消耗手牌援护Haru。Jamie在Heat 35 / 75介入；前两局作品决定第三局分支。": "Maya can pursue her own definition or spend cards supporting Haru. Jamie intervenes at Heat 35 / 75; the first two releases determine the third Event.",
    "Maya每话轮首次用自己的解释入场：+1；援护入场不加压。本话轮有援护且Haru定调：−1；无援护时Haru的Position定调：−1；两者不叠加。Ben定调：+1。压力4失声，降到2恢复。Haru获胜需结束压力≤2。": "Maya’s first own interpretation each Round: +1 Pressure. Support adds none. Haru winning a supported Round: −1; without support, his Position win: −1. These do not stack. Ben’s win: +1. Silenced at 4, recover at 2. Haru needs final Pressure ≤2 to win.",

    "定义权：互联网舆论战争": "Definition Rights: A War for the Feed",
    "全网热度 · 舆论强度": "FEED HEAT · NARRATIVE INTENSITY",
    "争议出现": "Controversy begins",
    "本事件尚无旧永久记忆纪录": "No permanent-memory record from an earlier event",
    "进程": "PROGRESS",
    "回应": "RESPONSE",
    "问题1 · 话轮1": "Objective 1 · Round 1",
    "等待开始": "Waiting to start",
    "规则": "RULES",
    "查看完整规则": "View full rules",
    "重新开始": "Restart",
    "公共已出牌": "PUBLIC CARDS PLAYED",
    "本事件已打出 0 张": "0 cards played this event",
    "三个公共问题": "Three public objectives",
    "争议帖热评区": "Top replies on the controversy thread",
    "事件1 · 从3万浏览开始": "Event 1 · Starts at 30K views",
    "阅读量": "VIEWS",
    "讨论量": "DISCUSSION",
    "问题 1 / 3": "Objective 1 / 3",
    "连续两方过牌，热评获得1标 · 同一叙事2标定调": "Two consecutive passes give the top reply 1 Point · 2 Points define the objective",
    "热评第1 · 当前最先被看见的回应": "TOP REPLY · THE RESPONSE SEEN FIRST",
    "尚未出现回应": "No response yet",
    "等待出牌": "Waiting for a play",
    "全网互动数据": "Feed-wide engagement",
    "浏览量": "Views",
    "浏览": "Views",
    "点赞当前热评": "Like the current top reply",
    "点赞": "Likes",
    "转发数": "Reposts",
    "转发": "Reposts",
    "等待主动方": "Waiting for the lead",
    "热门评论": "TOP COMMENT",
    "观望": "Watching",
    "等待三方给出上下文": "Waiting for all three sides to add context",
    "点赞这条热门评论": "Like this top comment",
    "最近行动": "LATEST ACTION",
    "行动结果会显示在回应记录中。": "Action results will appear in the response log.",
    "选择阵营后开始。": "Choose a side to begin.",
    "第一题由黑粉开场；正常行动顺序为黑粉 → 明星 → 真爱粉。": "Ben opens the first objective; the normal order is Ben → Haru → Maya.",
    "技能与附加选择": "Skills and extra choices",
    "技能 / 附加选择": "SKILLS / EXTRA CHOICES",
    "回应记录": "RESPONSE LOG",
    "每次发帖、引用和过牌会按回合显示在这里。": "Posts, counters, and passes will appear here by round.",
    "三方账号状态": "THREE-SIDE ACCOUNT STATE",
    "你的回应草稿": "YOUR RESPONSE DRAFTS",
    "你的手牌": "Your Hand",
    "0张": "0 cards",
    "开始游戏": "START GAME",
    "在线三人房": "ONLINE THREE-PLAYER ROOM",
    "单人试玩": "SOLO PLAYTEST",
    "真人或 AI · 三事件连续房": "PEOPLE OR AI · THREE-EVENT CAMPAIGN",
    "创建房间后，房主可把空阵营设为 AI。Haru在前两局各发布一次5—6点“沉淀成章”，第三局才会解锁专辑分支 ROOM TONE。": "After creating a room, the host can assign AI to empty sides. Haru must publish The Record Takes Shape at Level 5–6 in each of the first two events to unlock the ROOM TONE album branch.",
    "你的昵称": "YOUR NAME",
    "匿名玩家": "Anonymous Player",
    "选择阵营": "CHOOSE A SIDE",
    "创建房间": "CREATE ROOM",
    "或": "OR",
    "房间码": "ROOM CODE",
    "加入房间": "JOIN ROOM",
    "等待真人加入或由房主添加 AI。": "Waiting for people to join or the host to add AI.",
    "复制": "COPY",
    "返回": "BACK",
    "准备": "READY",
    "HARU VENN · 三事件舆论风暴": "HARU VENN · A THREE-EVENT FEED STORM",
    "Maya只能说出自己的支持理由，不能替Haru回答；Jamie会在Heat 35 / 75介入，把下一次开口交给较弱的非赢家。Haru在前两局发布的作品决定第三局分支。": "Maya can only give her own reasons for supporting Haru; she cannot answer for him. Jamie intervenes at Heat 35 / 75 and gives the next opening to a weaker non-winner. Haru's releases in the first two events determine the third branch.",
    "每局重新发牌：每方12张普通牌，Haru另有1张公开技能牌。用更高的同牌型回应抢下置顶，连续两人过牌后获得定调标记；先拿2标的一方定义当前问题。": "Each event deals a fresh hand: 12 ordinary cards per side, plus Haru's public skill card. Counter with a higher card pattern to take the top reply. After two consecutive passes, the top side gains a Point; the first side to 2 defines the objective.",
    "游戏规则 · 2分钟读懂": "GAME RULES · A 2-MINUTE READ",
    "三方围绕HARU VENN的三起递进事件争夺“谁有权定义这件事”。你不需要计算浏览、点赞或时间；界面会自动处理。": "Three sides contest who gets to define three escalating events around HARU VENN. You never need to calculate views, likes, or time; the interface handles them.",
    "游戏术语": "Game terms",
    "三事件连续房": "Campaign",
    "一场游戏 · Campaign": "One full game",
    "事件": "Event",
    "一局 · Match": "One match",
    "问题": "Objective",
    "回合目标 · Objective": "A match objective",
    "话轮": "Round",
    "小回合 · Round": "A scoring round",
    "行动": "Turn",
    "个人回合 · Turn": "One player's turn",
    "定调标记": "Framing Point",
    "问题得分 · Point": "An objective point",
    "一句话玩法：轮到你时，用更高的同牌型抢下置顶；连续两人过牌后，置顶方拿1标。先拿2标，就定义这个问题。": "In one line: on your turn, take the top reply with a higher version of the same pattern. After two consecutive passes, the top side gains 1 Point. The first to 2 defines the objective.",
    "1. 一场游戏怎么推进": "1. HOW A CAMPAIGN UNFOLDS",
    "一场游戏（Campaign）共有三局事件（Match）：": "A Campaign contains three Events:",
    "第三局分支。": "then a branching third event.",
    "→ 第三局分支。": "→ a branching third Event.",
    "如果Haru在前两局各打出一次": "If Haru plays",
    "5—6点“沉淀成章”": "a Level 5–6 The Record Takes Shape",
    "，第三局进入专辑事件": " in each of the first two Events, the third Event becomes the album Event ",
    "；否则进入": "; otherwise it becomes ",
    "每局有三个递进问题（Objective）。每个问题都要单独争夺2个定调标记。": "Each Event has three escalating Objectives. Every Objective is a separate race for 2 Framing Points.",
    "每局重新发牌：39张普通牌分为事实、立场、传播三个频道。每方先从每频道拿2张，再拿6张混合牌，共12张；Haru另有1张技能牌。最后3张不会公开，也不会补牌。": "Each Event deals again. The 39 ordinary cards use three channels: Evidence, Position, and Reach. Each side first receives 2 cards from every channel, then 6 mixed cards, for 12 total; Haru also has 1 skill card. The final 3 cards stay hidden and are never drawn.",
    "2. 轮到你时能做什么": "2. WHAT YOU CAN DO ON YOUR TURN",
    "你可以发布回应、过牌，或弃1张普通牌让Heat −5。降温不结束行动，所以之后仍能出牌，也能继续降温。": "You can post a response, pass, or discard 1 ordinary card for Heat −5. Cooling does not end your turn, so you may still play or cool again afterward.",
    "单张": "Single",
    "：任意1张牌。": ": any 1 card.",
    "同调对子": "Matched Pair",
    "：同频道、同等级的2张牌。": ": 2 cards in the same channel at the same level.",
    "连续论证": "Run",
    "：同频道、等级连续的3张牌；比较最高等级。": ": 3 consecutive levels in one channel; compare the highest level.",
    "闭环叙事": "Narrative Loop",
    "：三个频道、同等级各1张。": ": 1 card from each channel, all at the same level.",
    "你领出新话轮（Round）时，可以打出任意合法牌型。": "When you lead a new Round, you may play any legal pattern.",
    "回应当前置顶时，可以跨频道，但必须": "When countering the current top reply, you may change channels, but must use the",
    "同牌型且等级严格更高": "same pattern at a strictly higher level",
    "。例如事实3级对子，可以被传播4级对子反压。": ". For example, an Evidence Level 3 pair can be countered by a Reach Level 4 pair.",
    "闭环叙事可以压过任何普通牌型；已经置顶的闭环，只能被更高等级的闭环压过。": "A Narrative Loop beats any ordinary pattern. A Loop already on top can only be countered by a higher-level Loop.",
    "有人打出新回应后，先前过牌的人可以重新加入。连续两人过牌，当前置顶方赢得这个话轮。": "After a new response is played, players who passed may rejoin. After two consecutive passes, the current top side wins the Round.",
    "3. 怎样定义一个问题": "3. HOW AN OBJECTIVE IS DEFINED",
    "话轮赢家得到1个定调标记（Point）。同一方先拿到2标，就定义当前问题（Objective）。": "The Round winner gains 1 Framing Point. The first side to 2 defines the current Objective.",
    "如果三方各拿1标，就进入第4个决胜话轮。": "If all three sides have 1 Point, play a fourth deciding Round.",
    "每局第一题都由Ben领出；正常行动顺序是": "Ben leads the first Objective of every Event. The normal order is",
    "话轮赢家领出本题的下一话轮；一个问题结束后，由该题最后置顶帖的实际发帖者领出下一题。": "The Round winner leads the next Round of that Objective. When an Objective ends, the player who actually posted its final top reply leads the next Objective.",
    "4. Heat、路人介入与明星压力": "4. HEAT, BYSTANDER INTERVENTION, AND STAR PRESSURE",
    "Heat（全网热度）": "Heat (feed-wide attention)",
    "：每局从3开始。成功打出的牌会按等级增加Heat，组合把各牌等级相加；Heat没有上限。浏览、点赞与转发只是Heat的视觉表现。": ": starts at 3 each Event. A successful card adds its level to Heat; a pattern adds all card levels. Heat has no upper limit. Views, likes, and reposts are only visual expressions of Heat.",
    "Jamie介入": "Jamie intervenes",
    "：Heat首次到达35和75时，各产生1次路人介入。当前话轮赢家仍拿1标，但不能继承领出权；下一话轮由另外两方中本题标记更少的一方领出。": ": the first time Heat reaches 35 and 75, it creates 1 Bystander Intervention. The current Round winner still gains 1 Point but cannot inherit the lead. Of the other two sides, the one with fewer Points in this Objective leads next.",
    "Maya不是Haru的代言人": "Maya does not speak for Haru",
    "：Maya打出的回应只算Maya的解释，不能替Haru取得“本人定调”；Haru也可以反压Maya。": ": Maya's responses count only as her interpretation and cannot give Haru a first-person definition. Haru may also counter Maya.",
    "压力0—4": "Pressure 0–4",
    "：Maya每个话轮首次成功入场，Haru压力+1；Ben赢得话轮，压力+1；只有Haru本人用立场频道赢得话轮，压力−1。": ": the first time Maya successfully enters each Round, Haru gains +1 Pressure; when Ben wins a Round, +1; only Haru winning a Round with Position gives −1.",
    "压力达到4时Haru失声，无法继续出牌，尚未发布的“沉淀成章”和全部投入牌立即消失。": "At Pressure 4, Haru is silenced and cannot play. Any unpublished The Record Takes Shape and all cards invested in it disappear immediately.",
    "5. 每个人的技能": "5. EACH CHARACTER'S SKILL",
    "Haru · 沉淀成章": "Haru · The Record Takes Shape",
    "每局开局以2点技能牌进入手牌，只能作为传播频道单张打出。一次行动可以暗置1张普通牌，让它升1点并视为过牌，最高6点。2—5点按普通单张处理；6点可直接夺取置顶，并且无法被反压。": "Begins each Event in hand as a Level 2 skill card and can only be played as a single Reach card. On a turn, Haru may secretly invest 1 ordinary card to raise it by 1 Level and count as passing, up to Level 6. Levels 2–5 act as an ordinary Single; Level 6 takes the top reply immediately and cannot be countered.",
    "Maya · 最后应援（每局1次）": "Maya · Last Push (once per Event)",
    "手牌不多于5张时，把1张1—4级普通牌变成万能牌并交给任意一方。万能牌可补成1—4级任意频道、对子、连续论证或闭环，但不能变成5级。文字仍来自Maya；由谁实际打出，就算谁的回应。": "When Maya has no more than 5 cards, turn one Level 1–4 ordinary card into a Wildcard and give it to any side. It can fill any Level 1–4 channel, Pair, Run, or Loop, but never become Level 5. Maya still wrote the words; the side that actually plays it owns the response.",
    "Ben · 断章取义（每局1次）": "Ben · Out of Context (once per Event)",
    "用组合成功反压后，可以拿走整组被压下去的牌。拿到的牌保留原牌名、频道和等级，之后作为普通牌使用。": "After successfully countering with a pattern, Ben may take the entire pattern he displaced. Those cards keep their original names, channels, and levels and can be used as ordinary cards later.",
    "Jamie · 路人介入（被动）": "Jamie · Bystander Intervention (passive)",
    "Heat到达35和75时各触发一次。Jamie不抢定调标记，只把下一话轮的领出权交给较弱的非赢家，打断强势方连续控场。": "Triggers once at Heat 35 and 75. Jamie never takes a Framing Point; instead, the next lead goes to a weaker non-winner, interrupting the dominant side's control.",
    "6. 每局谁算胜利": "6. WHO WINS AN EVENT",
    "Haru胜利": "Haru wins",
    "：Haru本人定义至少2个问题，并且结局时没有失声。": ": Haru personally defines at least 2 Objectives and is not silenced at the end.",
    "Maya胜利": "Maya wins",
    "：Haru与Maya合计定义至少2个问题，其中Maya本人至少定义1个，并且Haru没有失声。": ": Haru and Maya define at least 2 Objectives together, Maya personally defines at least 1, and Haru is not silenced.",
    "Ben胜利": "Ben wins",
    "：Ben定义至少1个问题。": ": Ben defines at least 1 Objective.",
    "三方条件分别判断，因此一局可能不止一方胜利。Heat不会额外增加或扣除胜分。": "Each side is checked separately, so more than one side may win an Event. Heat does not add or subtract victory points.",
    "所有账号、日期和事件均为虚构；时间推进只服务剧情表现，不改变上述出牌与胜负规则。": "All accounts, dates, and events are fictional. Time advances only for the story and does not change the play or victory rules above.",
    "看懂了，继续游戏": "GOT IT · KEEP PLAYING",
    "明星本人 · Haru": "STAR · HARU",
    "真爱粉 · Maya": "SUPPORTER · MAYA",
    "黑粉 · Ben": "SKEPTIC · BEN",
    "本人主张定义2个问题，且事件结束时没有失声。": "Personally define 2 Objectives and avoid being silenced at the end of the Event.",
    "支持阵营合计定义2个问题且Maya自己定义1个；明星未失声。": "Haru and Maya define 2 Objectives together, including 1 by Maya; Haru is not silenced.",
    "Ben的质疑叙事定义至少1个问题。": "Ben's skeptical narrative defines at least 1 Objective.",
    "The Record Takes Shape：2点作品卡开局就在手牌中，只能单独打出；可投入普通牌升至6点，6点发布无法被反压。": "The Record Takes Shape: starts in hand at Level 2 and must be played alone. Invest ordinary cards to reach Level 6; a Level 6 release cannot be countered.",
    "Last Push（1次）：手牌≤5时，把一张非5级牌变成可自动补齐点数与频道的1—4级万能牌，并交给任意一方；它仍是Maya写的说法。": "Last Push (once): at 5 cards or fewer, turn one non-Level-5 card into a Level 1–4 Wildcard that automatically fills a level and channel, then give it to any side. Maya still wrote it.",
    "Out of Context（1次）：用组合成功压牌后，获得整组被压牌；牌名、原作者、频道和等级保持原样。": "Out of Context (once): after successfully countering with a pattern, take the entire displaced pattern. Names, authors, channels, and levels stay unchanged.",
    "先看看后面还有没有更完整的回应。": "I want to see whether a fuller response appears.",
    "信息还没对齐，暂时不急着站队。": "The details still do not line up. I am not choosing a side yet.",
    "热度很高，但热度本身不能当结论。": "The Heat is high, but Heat itself is not a conclusion.",
    "这条说法先留着，等下一方拿证据回应。": "Leave this claim up for now and let the next side answer with evidence.",
    "继续围观，谁能把事实和逻辑说完整？": "Still watching. Who can give the complete facts and reasoning?",
    "先不转发，等这轮回应结束再判断。": "I will not repost yet. I will decide after this Round.",
    "本人这次回应得更完整，我暂时支持明星方。": "Haru gave the fuller response this time, so I support his side for now.",
    "至少明星愿意正面回应，这一轮我站本人叙事。": "At least Haru answered directly. I am with his account this Round.",
    "目前明星给出的解释更可信，先支持这边。": "Haru's explanation is more credible so far. I support this side for now.",
    "这条回应把关键问题说清楚了，我支持明星继续说明。": "This response addresses the key point. I want Haru to keep explaining.",
    "粉丝整理的材料更有说服力，我先支持真爱粉叙事。": "The supporter's material is more convincing. I support Maya's narrative for now.",
    "这次粉丝没有只喊口号，资料确实能对上。": "This time the supporters brought more than slogans; the material checks out.",
    "粉圈补充的信息更完整，我暂时支持真爱粉这边。": "The supporters added fuller information. I am with Maya's side for now.",
    "这轮解释把缺口补上了，支持粉丝继续整理。": "This explanation fills the gap. I want the supporters to keep organizing it.",
    "关键问题还没有被解释，我支持黑粉继续追问。": "The key question is still unanswered. I support Ben continuing to press it.",
    "这条爆料抓到了证据缺口，我暂时支持黑粉。": "This post found a gap in the evidence. I support Ben for now.",
    "回应还绕开了核心问题，支持黑粉把问题问到底。": "The response still dodges the core point. Ben should keep asking.",
    "目前黑粉的论证链更完整，我站继续核验这一边。": "Ben has the more complete argument so far. I support further verification.",
    "房间服务已连接。创建房间后，把六位房间码发给另外两人。": "Room service connected. After creating a room, send the six-character code to the other two players.",
    "联机服务尚未配置；单人试玩仍可正常使用。": "Online service is not configured; Solo Playtest is still available.",
    "暂时无法连接联机服务；你仍可以切换到单人试玩。": "The online service is temporarily unavailable; you can still switch to Solo Playtest.",
    "开始在线游戏": "START ONLINE GAME",
    "选择你要扮演的阵营": "CHOOSE YOUR SIDE",
    "在线房间": "ONLINE ROOM",
    "正在创建房间…": "Creating room…",
    "请输入六位房间码。": "Enter a six-character room code.",
    "正在加入房间…": "Joining room…",
    "正在连接房间…": "Connecting to room…",
    "连接成功，正在验证座位…": "Connected. Verifying your seat…",
    "房间身份已经失效，请重新创建或加入房间。": "Your room identity has expired. Create or join a room again.",
    "房间连接出现错误，正在重试。": "The room connection failed. Retrying.",
    "行动被服务端拒绝。": "The server rejected that action.",
    "等待加入": "Waiting to join",
    "AI 已准备": "AI ready",
    "已准备": "Ready",
    "未准备": "Not ready",
    "已占座 · 离线": "Seat held · Offline",
    "空座位": "Empty seat",
    "服务器托管": "Server controlled",
    "在线": "Online",
    "等待重连": "Waiting to reconnect",
    " · 房主": " · Host",
    "移除 AI": "REMOVE AI",
    "加入 AI": "ADD AI",
    "取消准备": "CANCEL READY",
    "房主可把空阵营设为 AI；真人全部准备后自动发牌。": "The host can assign AI to empty sides. Cards are dealt when every human player is ready.",
    "等待房主配置空位；真人全部准备后自动发牌。": "Waiting for the host to configure empty seats. Cards are dealt when every human player is ready.",
    "对局已经开始。": "The match has started.",
    "当前没有连接到房间，正在尝试重连。": "Not connected to the room. Trying to reconnect.",
    "已复制": "COPIED",
    "暂时离开在线牌局？你的座位会保留，刷新或点击恢复房间即可重连。": "Leave the online match for now? Your seat will be held, and you can reconnect by refreshing or resuming the room.",
    "行动确认超时，正在同步房间状态。": "Action confirmation timed out. Syncing room state.",
    "联机服务尚未配置。": "Online service is not configured.",
    "房间请求失败。": "Room request failed.",
    "等待第一条路人评论。": "Waiting for the first bystander comment.",
    "行动结果会逐步显示在这里。": "Action results will appear here as they happen.",
    "回应记录会显示在这里。": "The response log will appear here.",
    "手牌已经用尽。轮到你领出时，领出权会顺延给下一方。": "Your hand is empty. When you would lead, the lead passes to the next side.",
    "事件已经结算。": "This Event is settled.",
    "查看三个问题如何组成公众故事，以及可信度与互联网记忆是否分裂。": "See how the three Objectives form a public story and whether credibility and internet memory split.",
    "本话轮已经完成定调。": "This Round is settled.",
    "阅读结算，再进入下一话轮。": "Read the outcome, then continue to the next Round.",
    "等待对方玩家提交行动。": "Waiting for the other player to submit an action.",
    "你拥有领出权：选择1至3张牌发布第一条回应。": "You have the lead: choose 1–3 cards to post the first response.",
    "选择手牌，组织你的回应": "Choose cards to shape your response",
    "成功公开后，累计浏览量会按照牌的等级增长；组合会累加所有等级。": "Once posted, total views rise with card levels; a pattern adds all its levels.",
    "选择一张手牌弃掉，Heat -5": "Choose a card to discard · Heat −5",
    "降温不会过牌，也不会结束本次行动；确认后仍可出牌或继续降温。": "Cooling neither passes nor ends your turn. After confirming, you may still play or cool again.",
    "确认弃牌 · Heat -5": "CONFIRM DISCARD · HEAT −5",
    "取消": "CANCEL",
    "Maya's explanation · 支持Haru，但永远不算Haru本人回答；Haru也可以反压。": "MAYA'S EXPLANATION · Supports Haru, but never counts as Haru's own answer; Haru may counter it.",
    "当前没有压力变化预测": "No current Pressure forecast",
    "账号失声 · Maya仍可支持Haru，但不能替他取得本人解释权": "ACCOUNT SILENCED · Maya may still support Haru but cannot claim his first-person voice",
    "使用时由牌型自动决定频道。": "The pattern automatically determines its channel when played.",
    "当前技能牌点数": "CURRENT SKILL-CARD LEVEL",
    "技能牌已离手": "SKILL CARD NO LONGER IN HAND",
    "沉淀成章": "The Record Takes Shape",
    "最后应援": "Last Push",
    "断章取义": "Out of Context",
    "明星技能牌": "STAR SKILL CARD",
    "自动频道": "AUTO CHANNEL",
    "万能频道": "WILD CHANNEL",
    "技能牌已选中": "Skill card selected",
    "待确认弃牌": "Pending discard",
    "点击选择弃牌": "Click to select for discard",
    "点击选择": "Click to select",
    "已完整发布": "Fully released",
    "已打出": "Played",
    "已消失": "Lost",
    "胜利": "WIN",
    "失败": "LOSS",
    "尚未完成定调": "Not yet defined",
    "进入下一事件": "CONTINUE TO NEXT EVENT",
    "重新开始三事件": "RESTART CAMPAIGN",
    "查看最终局面": "VIEW FINAL BOARD",
    "本事件胜负": "EVENT RESULTS",
    "三事件结局": "CAMPAIGN FINALE",
    "尚未形成": "Not established",
    "事件结束": "Event over",
    "话轮结算": "Round result",
    "未开始": "Not started",
    "当前回应中": "In progress",
    "公共叙事": "Public narrative",
    "当前置顶": "Current top reply",
    "三个问题已经完成": "All three Objectives are complete",
    "公众故事已经形成": "The public story has formed",
    "每个问题都由先获得2个标记的叙事定义": "Each Objective is defined by the first narrative to earn 2 Points",
    "尚无热评": "No top reply yet",
    "手牌": "CARDS",
    "压力": "PRESSURE",
    "三": "All three",
    "当前热评第1": "Current #1 top reply",
    "技能": "SKILL",
    "万能": "WILD",
    "完整作品已经占据当前时间线，无法被反压。": "The completed work controls the timeline and cannot be countered.",
    "完整发布作品": "RELEASE COMPLETED WORK",
    "发布回应": "POST RESPONSE",
    "领出主张": "LEAD WITH A CLAIM",
    "弃牌 · -5 Heat": "DISCARD · −5 HEAT",
    "过牌 · 继续观望": "PASS · KEEP WATCHING",
    "无牌可领出": "NO CARD TO LEAD",
    "当前选择不能发布": "Current selection cannot be posted",
    "最终置顶": "FINAL TOP REPLY",
    "可信第一": "CREDIBILITY LEADER",
    "记忆第一": "MEMORY LEADER",
    "等待当前置顶": "Waiting for a top reply",
    "第一事件只需统一三项条件，热度自然高于纪录0。": "In the first Event, unite all three conditions; Heat naturally beats the record of 0.",
    "尚无旧永久记忆 · 纪录0": "No earlier permanent memory · Record 0",
    "Haru · 明星": "Haru · Star",
    "Maya · 真爱粉": "Maya · Supporter",
    "Ben · 黑粉": "Ben · Skeptic",
    "争议扩散": "Controversy spreading",
    "进入热门": "Trending",
    "全站热议": "Site-wide debate",
    "全网大战": "Feed-wide battle",
    "平台级风暴": "Platform-wide storm",
    "已出": "PLAYED",
    "等待第一条回应": "Waiting for the first response",
    "拥有领出权": "Has the lead",
    "上一条热评": "Previous top reply",
    "蓝V认证": "Verified account",
    "查看路人规则": "View Bystander rules",
    "查看明星压力规则": "View Star Pressure rules",
    "首次越线时产生1枚介入；赢家照常拿标，但不能继承领出。下一次开口交给定调标记较少的非赢家；并列时按座次，本题已经获得过介入机会的一方后置。": "Crossing each threshold for the first time creates 1 Intervention token. The winner still gains a Point but cannot inherit the lead. The next opening goes to the non-winner with fewer Points; ties follow seat order, with a side that already received an Intervention opening in this Objective moved later.",
    "开局2点技能牌直接进入手牌，只能作为单牌打出；可暗置一张普通手牌升1点，最高6点，6点发布无法被反压。": "Starts in hand at Level 2 and can only be played as a Single. Secretly invest one ordinary card to raise it by 1 Level, up to Level 6; a Level 6 release cannot be countered.",
    "整场1次。手牌不多于5张时，把一张1—4级普通牌转为万能牌，并交给任意一方。": "Once per Event. When you have no more than 5 cards, turn one Level 1–4 ordinary card into a Wildcard and give it to any side.",
    "整场1次。用组合成功反压后，可把被压整组原牌收入手牌；牌名、频道和等级不变。": "Once per Event. After successfully countering with a pattern, take the entire displaced set into your hand. Card names, channels, and levels stay unchanged.",
    "Maya每个话轮首次用自己的解释成功入场：+1，即使后来被反压也不撤销；Ben赢得话轮：+1；Haru自己的Position定调：−1。Maya永远不能把自己的话改算成Haru本人叙事。达到4时Haru失声。": "The first time Maya enters each Round with her own explanation: +1, even if she is later countered. Ben wins a Round: +1. Haru defines with his own Position: −1. Maya's words can never be reassigned as Haru's narrative. At 4, Haru is silenced.",
    "（含技能牌）": " (includes skill card)",
    "技能点数": "SKILL LEVEL",
    "发布回应": "POST RESPONSE",
    "当前热评第1": "Current #1 top reply",
    "尚无热评": "No top reply yet",
    "连续两人过牌": "Two consecutive passes",
    "连续两人过牌。": "Two consecutive passes.",
    "闭环": "Narrative Loop",
    "本轮置顶：": "TOP REPLY THIS ROUND:",
    "牌型：": "PATTERN:",
    "结算：": "OUTCOME:",
    "下一话轮由": "The next Round is led by ",
    "（路人介入选出的较弱非赢家）领出。": ", the weaker non-winner chosen by Bystander Intervention.",
    "（上一题最终置顶帖的发帖者）领出。": ", who posted the final top reply on the previous Objective.",
    "（本轮最终置顶帖的发帖者）领出。": ", who posted this Round's final top reply.",
    "真爱粉叙事赢得话轮，但不再自动增加明星压力。": "Maya's narrative wins the Round, but no longer adds Star Pressure automatically.",
    "本人叙事赢得话轮，明星压力不变。": "Haru's narrative wins the Round; Star Pressure does not change.",
    "路人补标": "Bystander adds a Point",
    "路人观望": "Bystander watches",
    "路人未加入": "Bystander stays out",
    "若守到结算，获得1个定调标记。": "If it holds until resolution, gain 1 Framing Point.",
    "作为本话轮首次粉圈解释，公开后压力立即+1；即使被反压也不撤销。": "As the Supporter's first explanation this Round, posting adds +1 Pressure immediately; countering it later does not undo that.",
    "若黑粉叙事守到话轮结算，压力+1。": "If Ben's narrative holds through resolution, Pressure +1.",
    "真爱粉叙事守到话轮结算不再自动增加压力。": "If Maya's narrative holds through resolution, it no longer adds Pressure automatically.",
    "若本人立场守到话轮结算，压力-1。": "If Haru's Position holds through resolution, Pressure −1.",
    "本人叙事守住时压力不变。": "If Haru's narrative holds, Pressure does not change.",
    "本话轮开始前已经双领先；若守到结算，将先拿第一标，再由路人补上第二标。": "This narrative led both metrics at the start of the Round. If it holds, it gains the first Point and the Bystander adds the second.",
    "这会建立双领先，但只能为下一话轮取得路人补标资格。": "This establishes a lead in both metrics, but Bystander Point eligibility begins next Round.",
    "完整作品会直接夺取当前置顶，且无法被反压。": "The completed work takes the top reply immediately and cannot be countered.",
    "万能牌有多个合法补位 · 选择结果": "THE WILDCARD HAS MULTIPLE LEGAL FITS · CHOOSE ONE",
    "最后应援已就绪": "LAST PUSH IS READY",
    "选择恰好一张1—4级普通牌，再决定把万能牌交给谁。": "Select exactly one Level 1–4 ordinary card, then choose who receives the Wildcard.",
    "确认应援": "CONFIRM LAST PUSH",
    "已准备收回原牌": "READY TO TAKE ORIGINAL CARDS",
    "收回被压牌": "TAKE DISPLACED CARDS",
    "。": "."
  }));

  const PATTERN_ENGLISH = [
    [/^(明星本人 · Haru|真爱粉 · Maya|黑粉 · Ben)（你）$/, match => `${toEnglish(match[1])} (YOU)`],
    [/^(.+?)(\d+)-(\d+)级连续论证$/, match => `${toEnglish(match[1])} · Level ${match[2]}–${match[3]} · Run`],
    [/^(.+?)(\d+)级(单张|同调对子)$/, match => `${toEnglish(match[1])} · Level ${match[2]} · ${toEnglish(match[3])}`],
    [/^(\d+)级闭环叙事$/, match => `Level ${match[1]} · Narrative Loop`],
    [/^将(\d+)点“沉淀成章”作为单牌打出$/, match => `plays The Record Takes Shape as a Level ${match[1]} Single`],
    [/^完整发布6点“沉淀成章”，本轮无法被反压$/, () => "fully releases Level 6 The Record Takes Shape; it cannot be countered this Round"],
    [/^并用“断章取义”拿走整组(\d+)张原牌$/, match => `uses Out of Context to take all ${match[1]} displaced cards`],
    [/^沉淀成章 · 当前(\d+)点 · 技能牌只能单独打出$/, match => `THE RECORD TAKES SHAPE · CURRENT LEVEL ${match[1]} · PLAY THIS SKILL CARD ALONE`],
    [/^暗置所选普通牌 · 升到(\d+)点$/, match => `SECRETLY INVEST THE SELECTED CARD · RAISE TO LEVEL ${match[1]}`],
    [/^万能牌自动推导：(.+)。$/, match => `Wildcard fit chosen automatically: ${toEnglish(match[1])}.`],
    [/^最后应援 · 把所选(\d+)级牌变成1—4级万能牌并交给$/, match => `LAST PUSH · TURN THE SELECTED LEVEL ${match[1]} CARD INTO A LEVEL 1–4 WILDCARD AND GIVE IT TO`],
    [/^断章取义 · 剩余(\d+)次（原牌直接收入手牌）$/, match => `OUT OF CONTEXT · ${match[1]} USE(S) LEFT (ORIGINAL CARDS GO DIRECTLY INTO YOUR HAND)`],
    [/^(\d+)级 · (.+)频道$/, match => `Level ${match[1]} · ${toEnglish(match[2])} channel`],
    [/^自动匹配 · (.+?)(\d+)级对子$/, match => `AUTO-FIT · ${toEnglish(match[1])} LEVEL ${match[2]} PAIR`],
    [/^自动补齐 · (\d+)级(.+)频道闭环$/, match => `AUTO-FILL · LEVEL ${match[1]} NARRATIVE LOOP WITH ${toEnglish(match[2])}`],
    [/^(向小补位|向大补位|自动补中间) · (.+?)(\d+)-(\d+)连续论证$/, match => `${match[1] === "向小补位" ? "FILL LOW" : match[1] === "向大补位" ? "FILL HIGH" : "FILL MIDDLE"} · ${toEnglish(match[2])} LEVEL ${match[3]}–${match[4]} RUN`],
    [/^本事件已打出\s*(\d+)\s*张$/, match => `${match[1]} cards played this Event`],
    [/^连续两方过牌，当前热评获得1个定调标记 · 2标定义问题$/, () => "Two consecutive passes give the current top reply 1 Framing Point · 2 Points define the Objective"],
    [/^等待结算\s*(\d+)\s*\/\s*2$/, match => `Awaiting resolution ${match[1]} / 2`],
    [/^已触发(\d+)\/(\d+)条介入线；下一条Heat\s*(\d+)$/, match => `${match[1]}/${match[2]} Intervention thresholds triggered · Next at Heat ${match[3]}`],
    [/^两条介入线均已触发，等待剩余介入被消耗$/, () => "Both Intervention thresholds triggered · Waiting to spend remaining tokens"],
    [/^中央还有(\d+)枚路人介入；下一位话轮赢家将失去继承领出权$/, match => `${match[1]} Bystander Intervention token(s) remain · The next Round winner will not inherit the lead`],
    [/^Heat\s*(\d+) · 已生成1次待用路人介入$/, match => `Heat ${match[1]} · 1 Bystander Intervention ready`],
    [/^Heat\s*(\d+) · 路人介入已使用$/, match => `Heat ${match[1]} · Bystander Intervention spent`],
    [/^Heat\s*(\d+) · 首次越线生成1次路人介入$/, match => `Heat ${match[1]} · Crossing once creates 1 Bystander Intervention`],
    [/^(.+)头像，蓝V认证账号$/, match => `${match[1]} avatar, verified account`],
    [/^回应“(.+)”$/, match => `Counter “${match[1]}”`],
    [/^当前置顶：三频道 · (.+) · (\d+)级$/, match => `Current top reply: All three channels · ${toEnglish(match[1])} · Level ${match[2]}`],
    [/^当前置顶：(.+)频道 · (.+) · (\d+)级$/, match => `Current top reply: ${toEnglish(match[1])} channel · ${toEnglish(match[2])} · Level ${match[3]}`],
    [/^领出主张 · Heat \+(\d+)$/, match => `LEAD RESPONSE · HEAT +${match[1]}`],
    [/^发布回应 · Heat \+(\d+)$/, match => `POST RESPONSE · HEAT +${match[1]}`],
    [/^(.+)正在选择回应。$/, match => `${match[1]} is choosing a response.`],
    [/^(.+)正在判断压牌、观望，还是替另一个阵营交出高牌。$/, match => `${match[1]} is deciding whether to counter, wait, or spend a high card for another side.`],
    [/^AI行动将在约(\d+)秒后显示。$/, match => `The AI action will appear in about ${match[1]} seconds.`],
    [/^(.+)打出“(.+)”(?:，以“([^”]+)”发声)?(?:，(.*?))?，置顶(.+)；主张改为“(.+)”。(?: 判断：.*?。)?\s*影响：手牌([^，。]+)(?:，浏览量\+([^，。]+))?(?:，粉圈越界使压力\+([^，。]+))?。$/, match => {
      const cards = match[2].split("、").join(", ");
      const voiceText = match[3] ? `, speaking as “${match[3]}”` : "";
      const skillText = match[4] ? `, and ${toEnglish(match[4])}` : "";
      const viewText = match[8] ? `, views +${toEnglish(match[8])}` : "";
      const pressureText = match[9] ? `, Supporter overreach adds ${match[9]} Pressure` : "";
      return `${match[1]} plays “${cards}”${voiceText}${skillText}, taking the top reply with ${toEnglish(match[5])}; the claim becomes “${match[6]}”. Impact: cards ${match[7]}${viewText}${pressureText}.`;
    }],
    [/^(.+?)(无法压牌并|选择)过牌，暂时观望；若后来有人出牌，仍可重新加入。(?: 判断：.*。)?$/, match => `${match[1]} ${match[2] === "选择" ? "passes" : "cannot counter and passes"}, staying on the sidelines. They may rejoin after a new play.`],
    [/^(.+)定调：核心基线暂无频道额外效果。$/, match => `Definition by ${toEnglish(match[1])}: no extra channel effect in the current core rules.`],
    [/^(.+)定调：核心基线暂无频道额外效果。 (.+)$/, match => `Definition by ${toEnglish(match[1])}: no extra channel effect in the current core rules. ${toEnglish(match[2])}`],
    [/^本人立场守住话轮：明星压力([+−-]?\d+)，当前为(\d+)\/(\d+)。$/, match => `Haru's Position holds the Round: Star Pressure ${match[1]}, now ${match[2]}/${match[3]}.`],
    [/^黑粉叙事赢得话轮：明星压力\+(\d+)，当前为(\d+)\/(\d+)。$/, match => `Ben's narrative wins the Round: Star Pressure +${match[1]}, now ${match[2]}/${match[3]}.`],
    [/^(.+)：“(.+)”赢得第(\d+)个话轮，当前问题定调标记(\d+)\/(\d+)。$/, match => `${toEnglish(match[1])}: “${match[2]}” wins Round ${match[3]}; current Objective Points: ${match[4]}/${match[5]}.`],
    [/^“(.+)”赢得第(\d+)个话轮，当前问题定调标记(\d+)\/(\d+)。$/, match => `“${match[1]}” wins Round ${match[2]}; current Objective Points: ${match[3]}/${match[4]}.`],
    [/^“(.+)”完成定调：(.+)。$/, match => `“${match[1]}” is defined: ${match[2]}.`],
    [/^(.+) · 第(\d+)话轮开始，(.+)领出。$/, match => `${match[1]} · Round ${match[2]} begins. ${match[3]} leads.`],
    [/^新事件从(.+)浏览开始，黑粉固定获得第一个话轮的领出权。$/, match => `The new Event starts at ${toEnglish(match[1])} views; Ben always leads the first Round.`],
    [/^新的三事件从“The Seven-Second Serve”开始；Ben固定开场。$/, () => "A new three-Event Campaign begins with The Seven-Second Serve; Ben always opens."],
    [/^(.+)的回应手牌 · 选择回应$/, match => `${toEnglish(match[1])}'s Response Hand · Choose a response`],
    [/^(.+)的回应手牌 · 失声锁定$/, match => `${toEnglish(match[1])}'s Response Hand · Locked while silenced`],
    [/^(.+)的回应手牌$/, match => `${toEnglish(match[1])}'s Response Hand`],
    [/^自动对局测试 · (\d+)局$/, match => `AUTOMATED MATCH TEST · ${match[1]} GAMES`],
    [/^(\d+)张（含技能牌） · 未发 (\d+)张$/, match => `${match[1]} cards (includes skill card) · ${match[2]} undealt`],
    [/^(\d+)张 · 未发 (\d+)张$/, match => `${match[1]} cards · ${match[2]} undealt`],
    [/^技能点数\s*(\d+)$/, match => `SKILL LEVEL ${match[1]}`],
    [/^(\d+)点$/, match => `Level ${match[1]}`],
    [/^压力\s*(\d+)\/(\d+)$/, match => `Pressure ${match[1]}/${match[2]}`],
    [/^明星压力(\d+)\/(\d+)$/, match => `Star Pressure ${match[1]}/${match[2]}`],
    [/^手牌\s*(\d+)$/, match => `Cards ${match[1]}`],
    [/^问题(\d+) · (当前回应中|未开始)$/, match => `Objective ${match[1]} · ${match[2] === "当前回应中" ? "In progress" : "Not started"}`],
    [/^问题(\d+) · (.+)定义$/, match => `Objective ${match[1]} · Defined by ${match[2]}`],
    [/^问题\s*(\d+)\s*\/\s*3 · 第(\d+)话轮$/, match => `Objective ${match[1]} / 3 · Round ${match[2]}`],
    [/^问题(\d+) · 话轮(\d+)$/, match => `Objective ${match[1]} · Round ${match[2]}`],
    [/^本题定调\s*(\d+)\s*\/\s*(\d+)$/, match => `Objective Points ${match[1]} / ${match[2]}`],
    [/^(.+) · 第(\d+)话轮结束$/, match => `${match[1]} · Round ${match[2]} complete`],
    [/^第(\d+)话轮结束$/, match => `Round ${match[1]} complete`],
    [/^当前标记：(.+)。$/, match => `Current Points: ${match[1]}.`],
    [/^问题完成定调：“(.+)”。$/, match => `Objective defined: “${match[1]}”.`],
    [/^进入问题(\d+)：(.+)$/, match => `CONTINUE TO OBJECTIVE ${match[1]} · ${match[2]}`],
    [/^进入问题(\d+)第\s*(\d+)\s*个话轮$/, match => `CONTINUE TO OBJECTIVE ${match[1]} · ROUND ${match[2]}`],
    [/^第(\d+)话轮开始，(.+)领出。$/, match => `Round ${match[1]} begins. ${match[2]} leads.`],
    [/^当前热度(\d+)$/, match => `Current Heat ${match[1]}`],
    [/^(.+) · 当前(最终|置顶候选)$/, match => `${match[1]} · ${match[2] === "最终" ? "Final" : "Current candidate"}`],
    [/^记录\s*(\d+)$/, match => `LOG ${match[1]}`]
  ];

  const INLINE_ENGLISH = [
    [/若守到结算，获得1个定调标记。/g, "If it holds until resolution, gain 1 Framing Point."],
    [/公开后累计浏览预计从([^。]+)升至([^。]+)。/g, (_, before, after) => `Posting is projected to raise total views from ${before} to ${after}.`],
    [/将越过Heat ([\d、]+)，中央增加(\d+)枚路人介入；本轮赢家仍拿标，但会失去下一话轮领出权。/g, (_, thresholds, count) => `This crosses Heat ${thresholds.split("、").join(", ")}, adding ${count} Bystander Intervention token(s). The Round winner still gains a Point but loses the next lead.`],
    [/作为本话轮首次粉圈解释，公开后压力立即\+1；即使被反压也不撤销。/g, "As the Supporter's first explanation this Round, posting adds +1 Pressure immediately; countering it later does not undo that."],
    [/若黑粉叙事守到话轮结算，压力\+1。/g, "If Ben's narrative holds through resolution, Pressure +1."],
    [/真爱粉叙事守到话轮结算不再自动增加压力。/g, "If Maya's narrative holds through resolution, it no longer adds Pressure automatically."],
    [/若本人立场守到话轮结算，压力-1。/g, "If Haru's Position holds through resolution, Pressure −1."],
    [/本人叙事守住时压力不变。/g, "If Haru's narrative holds, Pressure does not change."],
    [/本话轮开始前已经双领先；若守到结算，将先拿第一标，再由路人补上第二标。/g, "This narrative led both metrics at the start of the Round. If it holds, it gains the first Point and the Bystander adds the second."],
    [/这会打破([^。]+)在话轮开始前登记的双领先，阻止路人补标。/g, (_, role) => `This breaks ${role}'s registered lead in both metrics and prevents the Bystander Point.`],
    [/这会建立双领先，但只能为下一话轮取得路人补标资格。/g, "This establishes a lead in both metrics, but Bystander Point eligibility begins next Round."],
    [/完整作品会直接夺取当前置顶，且无法被反压。/g, "The completed work takes the top reply immediately and cannot be countered."]
  ];

  const FRAGMENT_ENGLISH = Object.entries({
    "本人主张": "Haru's first-person narrative",
    "支持阵营": "the supporting side",
    "粉圈": "supporters",
    "真爱粉": "Supporter",
    "黑粉": "Skeptic",
    "明星本人": "Haru",
    "明星": "Haru",
    "路人介入": "Bystander Intervention",
    "路人": "Bystander",
    "永久记忆": "Permanent Memory",
    "互联网记忆": "Internet Memory",
    "可信度": "Credibility",
    "沉淀成章": "The Record Takes Shape",
    "最后应援": "Last Push",
    "断章取义": "Out of Context",
    "旧事点名": "Call Up the Past",
    "闭环叙事": "Narrative Loop",
    "连续论证": "Run",
    "同调对子": "Matched Pair",
    "单张": "Single",
    "事实": "Evidence",
    "立场": "Position",
    "传播": "Reach",
    "三频道": "All three channels",
    "当前频道": "current channel",
    "万能牌": "Wildcard",
    "技能牌": "skill card",
    "普通牌": "ordinary card",
    "原牌": "original cards",
    "手牌": "cards",
    "定调标记": "Framing Points",
    "定调": "definition",
    "领出权": "the lead",
    "领出": "lead",
    "反压": "counter",
    "压牌": "counter",
    "置顶": "top reply",
    "过牌": "pass",
    "失声": "silenced",
    "压力": "Pressure",
    "热度": "Heat",
    "浏览量": "views",
    "浏览": "views",
    "回应": "response",
    "叙事": "narrative",
    "话轮": "Round",
    "本轮": "this Round",
    "本题": "this Objective",
    "问题": "Objective",
    "事件": "Event",
    "当前": "current",
    "下一": "next",
    "开始": "start",
    "结束": "end",
    "等待": "Waiting",
    "已经": "already",
    "尚无": "none yet",
    "剩余": "Remaining",
    "公开": "public",
    "本人": "Haru",
    "粉丝": "supporters",
    "赢家": "winner",
    "非赢家": "non-winner",
    "较弱": "weaker",
    "频道": " channel",
    "等级": "Level",
    "点数": "level",
    "纪录": "record",
    "强度": "strength",
    "支持": "Support",
    "观望": "Watching",
    "介入预警": "Intervention warning",
    "已经介入": "Intervened",
    "正在回应": "Responding",
    "（你）": " (YOU)",
    "你的": "Your",
    "未发": "Undealt",
    "记录": "LOG",
    "完成": "Complete",
    "未开始": "Not started",
    "已定调": "Defined",
    "当前回应中": "In progress",
    "点": " Points",
    "张": " cards",
    "枚": " token(s)",
    "次": " use(s)",
    "条": "",
    "个": "",
    "局": " Event(s)",
    "月": " month(s)",
    "秒": " second(s)",
    "第": "#",
    "尚未": "not yet",
    "可以": "can",
    "不能": "cannot",
    "无法": "cannot",
    "没有": "no",
    "继续": "continue",
    "自动": "automatically",
    "选择": "choose",
    "获得": "gain",
    "增加": "add",
    "触发": "triggered",
    "消耗": "spent",
    "重新": "again",
    "全部": "all",
    "首次": "first",
    "唯一第一": "sole leader",
    "当前为": "now",
    "正式": "official",
    "虚构事件": "FICTIONAL EVENT",
    "最近行动": "LATEST ACTION"
  }).sort((a, b) => b[0].length - a[0].length);

  function formatChineseMagnitude(raw, unit) {
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) return `${raw}${unit}`;
    const amount = value * (unit === "亿" ? 100000000 : 10000);
    if (amount >= 1000000000) return `${Number((amount / 1000000000).toFixed(1))}B`;
    if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`;
    return `${Number((amount / 1000).toFixed(1))}K`;
  }

  function toEnglish(source) {
    if (!source) return source;
    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    const core = source.slice(leading.length, source.length - trailing.length);
    if (EXACT_ENGLISH.has(core)) return `${leading}${EXACT_ENGLISH.get(core)}${trailing}`;
    if (!HAN_RE.test(core)) return source;
    for (const [pattern, replace] of PATTERN_ENGLISH) {
      const match = core.match(pattern);
      if (match) return `${leading}${replace(match)}${trailing}`;
    }

    let result = core
      .replace(/([\d,.]+)亿/g, (_, value) => formatChineseMagnitude(value, "亿"))
      .replace(/([\d,.]+)万/g, (_, value) => formatChineseMagnitude(value, "万"))
      .replace(/第\s*(\d+)\s*话轮/g, "Round $1")
      .replace(/问题\s*(\d+)\s*\/\s*(\d+)/g, "Objective $1 / $2")
      .replace(/问题\s*(\d+)/g, "Objective $1")
      .replace(/(\d+)—(\d+)级/g, "Level $1–$2")
      .replace(/(\d+)-(\d+)级/g, "Level $1–$2")
      .replace(/(\d+)级/g, "Level $1")
      .replace(/(\d+)点/g, "Level $1")
      .replace(/(\d+)张/g, "$1 cards")
      .replace(/(\d+)枚/g, "$1 token(s)")
      .replace(/(\d+)次/g, "$1 use(s)")
      .replace(/(\d+)个月/g, "$1 month(s)")
      .replace(/当前热度(\d+)/g, "Current Heat $1");
    for (const [pattern, replace] of INLINE_ENGLISH) result = result.replace(pattern, replace);
    for (const [zh, en] of FRAGMENT_ENGLISH) result = result.split(zh).join(en);
    return `${leading}${result}${trailing}`;
  }

  function skipped(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element?.closest("[data-i18n-skip]"));
  }

  function renderTextNode(node, captureChanges = false) {
    if (skipped(node)) return;
    let source = textSources.get(node);
    const expected = source === undefined ? undefined : language === "en" ? toEnglish(source) : source;
    if (source === undefined || (captureChanges && node.data !== expected)) {
      source = node.data;
      textSources.set(node, source);
    }
    const rendered = language === "en" ? toEnglish(source) : source;
    if (node.data !== rendered) node.data = rendered;
  }

  function sourceMapFor(element) {
    let sources = attributeSources.get(element);
    if (!sources) {
      sources = new Map();
      attributeSources.set(element, sources);
    }
    return sources;
  }

  function renderAttribute(element, attribute, captureChanges = false) {
    if (skipped(element) || !element.hasAttribute(attribute)) return;
    const sources = sourceMapFor(element);
    let source = sources.get(attribute);
    const current = element.getAttribute(attribute);
    const expected = source === undefined ? undefined : language === "en" ? toEnglish(source) : source;
    if (source === undefined || (captureChanges && current !== expected)) {
      source = current;
      sources.set(attribute, source);
    }
    const rendered = language === "en" ? toEnglish(source) : source;
    if (current !== rendered) element.setAttribute(attribute, rendered);
  }

  function renderTree(root, captureChanges = false) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      renderTextNode(root, captureChanges);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) ATTRIBUTES.forEach(attribute => renderAttribute(root, attribute, captureChanges));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) renderTextNode(node, captureChanges);
      else ATTRIBUTES.forEach(attribute => renderAttribute(node, attribute, captureChanges));
      node = walker.nextNode();
    }
  }

  function updateToggle() {
    const english = language === "en";
    document.querySelectorAll("[data-language-toggle]").forEach(button => {
      button.textContent = english ? "中文" : "EN";
      button.title = english ? "切换到中文" : "Switch to English";
      button.setAttribute("aria-label", button.title);
    });
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === "zh-CN" ? "zh-CN" : "en";
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    renderTree(document);
    updateToggle();
    document.dispatchEvent(new CustomEvent("superidol:languagechange", { detail: { language } }));
  }

  function untranslated() {
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!skipped(node) && HAN_RE.test(node.data) && node.parentElement?.offsetParent !== null) results.push(node.data.trim());
      node = walker.nextNode();
    }
    return [...new Set(results.filter(Boolean))];
  }

  function installToggle() {
    const actions = document.querySelector(".top-actions");
    const makeButton = (id, className) => {
      const button = document.createElement("button");
      button.className = className;
      button.id = id;
      button.type = "button";
      button.dataset.i18nSkip = "true";
      button.dataset.languageToggle = "true";
      button.addEventListener("click", () => setLanguage(language === "en" ? "zh-CN" : "en"));
      return button;
    };
    if (actions && !document.getElementById("languageButton")) {
      actions.insertBefore(makeButton("languageButton", "icon-button language-button"), actions.firstChild);
    }
    document.querySelectorAll("dialog").forEach((dialog, index) => {
      if (!dialog.querySelector(":scope > [data-language-toggle]")) {
        dialog.appendChild(makeButton(`dialogLanguageButton${index + 1}`, "dialog-language-button"));
      }
    });
  }

  function init() {
    installToggle();
    document.documentElement.lang = language;
    renderTree(document);
    updateToggle();
    observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") renderTextNode(record.target, true);
        else if (record.type === "attributes") renderAttribute(record.target, record.attributeName, true);
        else record.addedNodes.forEach(node => renderTree(node, true));
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTES
    });
  }

  window.SuperidolI18n = {
    getLanguage: () => language,
    setLanguage,
    translateText: text => language === "en" ? toEnglish(String(text ?? "")) : String(text ?? ""),
    refresh: () => renderTree(document, true),
    untranslated
  };
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
