# 抓小球小游戏 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> 课程流程约束：一次只推进一个任务，先写验收清单 → 实现 → 代码评审 → 用户浏览器人工验证，用户确认通过后才进入下一任务。

**Goal:** 用原生 HTML/CSS/JS 实现一款 2 分钟限时抓小球网页游戏，命中 +2、点空 -1、结算展示最高分。

**Architecture:** 单页三段式布局（顶部栏 / 游戏区 / 底部提示），游戏区绝对定位单个小球；用一个状态对象 `{ phase, score, timeLeft, bestScore }` 驱动全部 UI；`idle → countdown → playing → ended` 四态状态机，计时器与倒计时器集中清理。

**Tech Stack:** HTML5 + CSS3（自定义属性、Flex、动画）+ 原生 JavaScript（ES6+，IIFE 封装）；localStorage 持久化最高分；零依赖。

**Spec:** `spec.md`

---

## 通用约定

- 颜色、球尺寸、圆角等统一用 CSS 自定义属性，禁止散落魔法值。
- DOM 只通过 `id` 获取一次并缓存到 `els` 对象。
- 所有计分逻辑先判断 `state.phase === 'playing'`，防止结算后幽灵计分。
- 计时器 ID 统一存于 `state`，切换阶段前调用 `clearTimers()`。
- 每个任务结束后：本地打开 `index.html` → 按该任务验收清单逐项测试 → 向用户汇报结果并等待确认。
- 任务完成后做前端专项评审：命名、事件冒泡与重复绑定、CSS 冗余、Flex 布局、可维护性。

---

## Task 1: 页面骨架与基础视觉

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/game.js`

**验收清单（先于实现确认）**
- [ ] 打开页面无控制台报错，无横向/纵向滚动条
- [ ] 背景为浅黄色 `#FFF8DC`
- [ ] 顶部栏显示「抓小球」、分数 `0`、倒计时 `02:00`
- [ ] 游戏区显示开始卡片（规则文案 + 「开始游戏」按钮），小球不可见
- [ ] 底部提示文案可见，点击不触发任何逻辑
- [ ] 窗口缩放时三段式布局保持完整，按钮不变形

**Step 1: 创建目录与三个文件**

目录：`css/`、`js/`，文件：`index.html`、`css/style.css`、`js/game.js`（JS 先写空 IIFE 占位）。

**Step 2: 编写 index.html 结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>抓小球</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div class="app">
    <header class="top-bar">
      <h1 class="brand">抓小球</h1>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">分数</span>
          <span class="stat-value" id="score">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">剩余</span>
          <span class="stat-value stat-value--time" id="time">02:00</span>
        </div>
      </div>
    </header>

    <main class="game-area" id="gameArea">
      <div class="ball" id="ball" hidden></div>

      <section class="overlay" id="startOverlay">
        <div class="card">
          <h2 class="card-title">抓小球</h2>
          <p class="card-text">2 分钟内点击蓝色小球，每中 +2 分，点空 -1 分。</p>
          <button class="btn" id="startBtn" type="button">开始游戏</button>
        </div>
      </section>

      <section class="overlay" id="countdownOverlay" hidden>
        <div class="countdown-number" id="countdownNumber">3</div>
      </section>

      <section class="overlay" id="resultOverlay" hidden>
        <div class="card">
          <h2 class="card-title">时间到</h2>
          <p class="result-line">本局得分 <strong class="result-score" id="finalScore">0</strong></p>
          <p class="result-line">历史最高 <strong id="bestScore">0</strong></p>
          <p class="record-tip" id="newRecord" hidden>新纪录！</p>
          <button class="btn" id="restartBtn" type="button">再来一局</button>
        </div>
      </section>
    </main>

    <footer class="hint">点击小球 +2 · 点击空白 -1 · 限时 2 分钟</footer>
  </div>
  <script src="js/game.js"></script>
</body>
</html>
```

**Step 3: 编写基础 CSS（布局、浅黄背景、顶部栏、按钮、卡片、球）**

```css
:root {
  --bg: #FFF8DC;
  --ink: #3B3A32;
  --blue-1: #7CC4FF;
  --blue-2: #4FA8FF;
  --blue-3: #1E6FD9;
  --danger: #E4572E;
  --ball-size: 60px;
  --card-radius: 20px;
}

* { box-sizing: border-box; }

html, body { height: 100%; margin: 0; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

[hidden] { display: none !important; }

.app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  height: 72px;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(59, 58, 50, 0.12);
}

.brand { margin: 0; font-size: 22px; letter-spacing: 1px; }

.stats { display: flex; gap: 32px; }

.stat { display: flex; align-items: baseline; gap: 8px; }

.stat-label { font-size: 13px; opacity: 0.6; }

.stat-value {
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stat-value--time { font-size: 24px; }

.stat-value.is-urgent { color: var(--danger); }

.game-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  touch-action: manipulation;
}

.ball {
  position: absolute;
  width: var(--ball-size);
  height: var(--ball-size);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 28%, var(--blue-1) 0%, var(--blue-2) 38%, var(--blue-3) 100%);
  box-shadow: 0 10px 18px rgba(30, 111, 217, 0.35), inset -6px -8px 14px rgba(0, 40, 120, 0.25);
  cursor: pointer;
  z-index: 2;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(255, 248, 220, 0.6);
}

.card {
  width: min(360px, 100%);
  padding: 32px 28px;
  text-align: center;
  background: #FFFDF5;
  border-radius: var(--card-radius);
  box-shadow: 0 18px 40px rgba(93, 78, 38, 0.18);
}

.card-title { margin: 0 0 12px; font-size: 26px; }

.card-text { margin: 0 0 24px; font-size: 14px; line-height: 1.7; opacity: 0.75; }

.btn {
  padding: 12px 36px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: var(--blue-3);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.btn:hover { background: #175BB5; }
.btn:active { transform: scale(0.96); }

.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 13px;
  color: rgba(59, 58, 50, 0.55);
  border-top: 1px solid rgba(59, 58, 50, 0.08);
}
```

**Step 4: 写 js/game.js 占位**

```js
(() => {
  'use strict';
  // 任务 2 起逐步实现游戏逻辑
})();
```

**Step 5: 验证**

浏览器打开 `index.html`，按验收清单逐项确认。

**Step 6: 代码评审**

检查：颜色是否全部走变量、Flex 是否有多余嵌套、`[hidden]` 是否生效、是否有全局样式污染。

---

## Task 2: 状态机、预备倒计时、正式计时与分数

**Files:**
- Modify: `js/game.js`
- Modify: `css/style.css`（数字动画、低时间样式、结算面板基础样式）

**验收清单**
- [ ] 点击「开始游戏」进入 3→2→1 预备倒计时，数字每秒切换且带缩放动画
- [ ] 预备倒计时期间点击页面任何位置，分数不变
- [ ] 倒计时结束后遮罩消失，正式计时从 `02:00` 开始每秒递减
- [ ] 剩余 ≤10 秒时倒计时变为橙红色
- [ ] 归零后计时停在 `00:00`，进入结算遮罩并显示本局得分
- [ ] 刷新页面后分数归 `0`、时间回 `02:00`

**Step 1: 建立状态与 DOM 缓存**

```js
(() => {
  'use strict';

  const GAME_DURATION = 120;
  const COUNTDOWN_FROM = 3;

  const els = {
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    gameArea: document.getElementById('gameArea'),
    ball: document.getElementById('ball'),
    startOverlay: document.getElementById('startOverlay'),
    countdownOverlay: document.getElementById('countdownOverlay'),
    countdownNumber: document.getElementById('countdownNumber'),
    resultOverlay: document.getElementById('resultOverlay'),
    finalScore: document.getElementById('finalScore'),
    bestScore: document.getElementById('bestScore'),
    newRecord: document.getElementById('newRecord'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
  };

  const state = {
    phase: 'idle',        // idle | countdown | playing | ended
    score: 0,
    timeLeft: GAME_DURATION,
    bestScore: 0,
    timerId: null,
    countdownId: null,
  };
})();
```

**Step 2: 渲染与计时器管理**

```js
  function renderScore() {
    els.score.textContent = String(state.score);
  }

  function renderTime() {
    const seconds = Math.max(0, state.timeLeft);
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    els.time.textContent = `${mm}:${ss}`;
    els.time.classList.toggle('is-urgent', seconds <= 10);
  }

  function clearTimers() {
    clearInterval(state.timerId);
    clearTimeout(state.countdownId);
    state.timerId = null;
    state.countdownId = null;
  }
```

**Step 3: 预备倒计时与正式计时**

```js
  function showCountdownNumber(n) {
    els.countdownNumber.textContent = String(n);
    els.countdownNumber.classList.remove('is-ticking');
    void els.countdownNumber.offsetWidth; // 强制回流，重启动画
    els.countdownNumber.classList.add('is-ticking');
  }

  function beginCountdown() {
    clearTimers();
    state.phase = 'countdown';
    state.score = 0;
    state.timeLeft = GAME_DURATION;
    renderScore();
    renderTime();
    els.ball.hidden = true;
    els.startOverlay.hidden = true;
    els.resultOverlay.hidden = true;
    els.countdownOverlay.hidden = false;

    let n = COUNTDOWN_FROM;
    const step = () => {
      if (n > 0) {
        showCountdownNumber(n);
        n -= 1;
        state.countdownId = setTimeout(step, 1000);
        return;
      }
      els.countdownOverlay.hidden = true;
      beginPlaying();
    };
    step();
  }

  function beginPlaying() {
    state.phase = 'playing';
    state.timeLeft = GAME_DURATION;
    renderTime();
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      renderTime();
      if (state.timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    if (state.phase !== 'playing') return;
    state.phase = 'ended';
    clearTimers();
    state.timeLeft = 0;
    renderTime();
    els.ball.hidden = true;
    els.finalScore.textContent = String(state.score);
    els.bestScore.textContent = '0';     // Task 5 接入真实最高分
    els.newRecord.hidden = true;         // Task 5 判定
    els.restartBtn.hidden = true;        // Task 5 接入再来一局
    els.resultOverlay.hidden = false;
  }

  els.startBtn.addEventListener('click', beginCountdown);

  renderScore();
  renderTime();
```

**Step 4: 补充动画与低时间样式**

```css
.countdown-number {
  font-size: 96px;
  font-weight: 800;
  color: var(--blue-3);
}

.countdown-number.is-ticking { animation: countdown-pop 1s ease-out; }

@keyframes countdown-pop {
  0% { transform: scale(0.4); opacity: 0; }
  30% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

.result-line { margin: 0 0 8px; font-size: 15px; }

.result-score { font-size: 40px; color: var(--blue-3); }

.record-tip { margin: 8px 0 0; font-weight: 700; color: var(--danger); }
```

**Step 5: 验证**

按验收清单手动测试；确认预备倒计时 3 秒后正式计时、`00:00` 时只结算一次。

**Step 6: 代码评审**

检查：`clearTimers` 是否覆盖两个计时器、`endGame` 是否有重复进入保护、`renderTime` 的补零与 10 秒判断、状态字段是否单一来源。

---

## Task 3: 小球随机生成与命中计分

**Files:**
- Modify: `js/game.js`
- Modify: `css/style.css`（球出现/消失动画）

**验收清单**
- [ ] 正式计时开始后立即出现 1 个蓝色圆形小球
- [ ] 小球每次刷新位置随机，且完整落在游戏区内，四周留白 ≥12px
- [ ] 连续刷新不出现"原地不动"的位置（最多重试 10 次）
- [ ] 点击小球分数 +2，小球缩小淡出后在别处重新出现
- [ ] 小球淡出期间连点同一位置，只加一次分
- [ ] 时间结束时小球立即消失
- [ ] 点击小球不会触发空白扣分

**Step 1: 随机坐标与生成**

```js
  const BALL_PADDING = 12;

  function pickBallPosition() {
    const size = els.ball.offsetWidth || 60;
    const areaW = els.gameArea.clientWidth;
    const areaH = els.gameArea.clientHeight;
    const minX = BALL_PADDING;
    const minY = BALL_PADDING;
    const maxX = Math.max(minX, areaW - size - BALL_PADDING);
    const maxY = Math.max(minY, areaH - size - BALL_PADDING);
    const last = state.lastBall;
    let pos = { x: minX, y: minY };

    for (let i = 0; i < 10; i += 1) {
      pos = {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      };
      if (!last) break;
      const dx = pos.x - last.x;
      const dy = pos.y - last.y;
      if (Math.hypot(dx, dy) >= size * 0.75) break; // 约球半径的 1.5 倍
    }
    state.lastBall = pos;
    return pos;
  }

  function spawnBall() {
    const pos = pickBallPosition();
    els.ball.hidden = false;
    els.ball.classList.remove('is-hit', 'is-spawning');
    els.ball.style.left = `${pos.x}px`;
    els.ball.style.top = `${pos.y}px`;
    void els.ball.offsetWidth;
    els.ball.classList.add('is-spawning');
  }

  function hideBall() {
    els.ball.hidden = true;
    els.ball.classList.remove('is-hit', 'is-spawning');
  }
```

**Step 2: 接入开始与结束流程**

- `beginPlaying()` 末尾调用 `spawnBall()`。
- `endGame()` 与 `beginCountdown()` 中改用 `hideBall()`。
- `state` 增加 `lastBall: null`。

**Step 3: 小球点击计分**

```js
  els.ball.addEventListener('click', (event) => {
    event.stopPropagation(); // 关键：阻止冒泡到游戏区，避免再扣 1 分
    if (state.phase !== 'playing') return;

    state.score += 2;
    renderScore();

    els.ball.classList.remove('is-spawning');
    els.ball.classList.add('is-hit');
    setTimeout(() => {
      if (state.phase === 'playing') spawnBall();
    }, 150);
  });
```

**Step 4: 球动画样式**

```css
.ball.is-spawning { animation: ball-in 0.15s ease-out; }

.ball.is-hit {
  animation: ball-out 0.15s ease-in forwards;
  pointer-events: none; /* 淡出期间不可再次点击 */
}

@keyframes ball-in {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes ball-out {
  to { transform: scale(0); opacity: 0; }
}
```

**Step 5: 验证**

按验收清单测试；重点验证小球不越界、连点只加一次、球点击不触发 -1。

**Step 6: 代码评审**

检查：坐标计算是否基于 `clientWidth/clientHeight`、是否缓存 DOM 尺寸、`setTimeout` 回调是否有阶段保护、`stopPropagation` 使用是否合理。

---

## Task 4: 空白点击扣分与视觉反馈

**Files:**
- Modify: `js/game.js`
- Modify: `css/style.css`

**验收清单**
- [ ] 点击游戏区空白：分数 -1，红色 `-1` 飘字，游戏区轻微抖动
- [ ] 点空后小球位置保持不变，仍可继续点击
- [ ] 连续快速点空，每次独立扣 1 分，分数可正确显示负数
- [ ] 点击顶部栏、底部提示、遮罩、按钮，分数不变
- [ ] 命中时显示绿色 `+2` 飘字，位置与球心一致
- [ ] 飘字动画结束后 DOM 节点被移除（Elements 面板确认无堆积）
- [ ] 结算后点击游戏区不再扣分

**Step 1: 游戏区空白点击**

```js
  els.gameArea.addEventListener('click', (event) => {
    if (state.phase !== 'playing') return;

    state.score -= 1;
    renderScore();

    const rect = els.gameArea.getBoundingClientRect();
    createFloat('-1', 'miss', event.clientX - rect.left, event.clientY - rect.top);
    shakeArea();
  });
```

**Step 2: 命中时补飘字**

在小球点击回调的加分之后追加：

```js
    const areaRect = els.gameArea.getBoundingClientRect();
    const ballRect = els.ball.getBoundingClientRect();
    createFloat(
      '+2',
      'hit',
      ballRect.left - areaRect.left + ballRect.width / 2,
      ballRect.top - areaRect.top + ballRect.height / 2,
    );
```

**Step 3: 飘字与抖动**

```js
  function createFloat(text, type, x, y) {
    const el = document.createElement('span');
    el.className = `float float--${type}`;
    el.textContent = text;

    const w = els.gameArea.clientWidth;
    const h = els.gameArea.clientHeight;
    el.style.left = `${Math.min(Math.max(x, 24), w - 24)}px`;
    el.style.top = `${Math.min(Math.max(y, 24), h - 24)}px`;
    el.addEventListener('animationend', () => el.remove(), { once: true });

    els.gameArea.appendChild(el);
  }

  function shakeArea() {
    els.gameArea.classList.remove('is-shaking');
    void els.gameArea.offsetWidth;
    els.gameArea.classList.add('is-shaking');
    setTimeout(() => els.gameArea.classList.remove('is-shaking'), 220);
  }
```

```css
.float {
  position: absolute;
  z-index: 4;
  font-size: 20px;
  font-weight: 700;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: float-up 0.6s ease-out forwards;
}

.float--hit { color: #2E9E5B; }
.float--miss { color: var(--danger); }

@keyframes float-up {
  from { opacity: 0; transform: translate(-50%, -30%) scale(0.8); }
  30% { opacity: 1; }
  to { opacity: 0; transform: translate(-50%, -120%) scale(1); }
}

.game-area.is-shaking { animation: area-shake 0.2s ease-in-out; }

@keyframes area-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

**Step 4: 验证**

按验收清单逐项测试，重点检查负数显示、飘字不溢出、结算后不扣分。

**Step 5: 代码评审**

检查：点击事件是否只有一处计分入口、飘字坐标是否相对游戏区、动画节点清理是否可靠、抖动是否会累积 class。

---

## Task 5: 结算、最高分持久化与再来一局

**Files:**
- Modify: `js/game.js`

**验收清单**
- [ ] 首次得分 > 0 时，结算显示「新纪录！」并写入 localStorage
- [ ] 刷新页面后最高分仍保留
- [ ] 本局得分低于最高分时不显示「新纪录！」，最高分不变
- [ ] 得分等于最高分不判定为破纪录
- [ ] localStorage 被禁用/数据非法时不报错，最高分按 0 处理
- [ ] 点击「再来一局」：分数归 0、时间回 `02:00`、重新 3 秒倒计时
- [ ] 连续多局切换无重复计时器、无叠加飘字

**Step 1: 最高分读写**

```js
  const BEST_KEY = 'catchBallBestScore';

  function readBestScore() {
    try {
      const value = Number.parseInt(localStorage.getItem(BEST_KEY), 10);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  function writeBestScore(value) {
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch {
      // 隐私模式下写入失败时静默降级
    }
  }
```

初始化：`state.bestScore = readBestScore();`

**Step 2: 结算判定与展示**

```js
  function endGame() {
    if (state.phase !== 'playing') return;
    state.phase = 'ended';
    clearTimers();
    state.timeLeft = 0;
    renderTime();
    hideBall();

    const isRecord = state.score > state.bestScore;
    if (isRecord) {
      state.bestScore = state.score;
      writeBestScore(state.bestScore);
    }

    els.finalScore.textContent = String(state.score);
    els.bestScore.textContent = String(state.bestScore);
    els.newRecord.hidden = !isRecord;
    els.restartBtn.hidden = false;
    els.resultOverlay.hidden = false;
  }
```

**Step 3: 再来一局**

```js
  function restart() {
    clearTimers();
    state.score = 0;
    state.timeLeft = GAME_DURATION;
    state.lastBall = null;
    renderScore();
    renderTime();
    hideBall();
    els.newRecord.hidden = true;
    els.resultOverlay.hidden = true;
    beginCountdown();
  }

  els.restartBtn.addEventListener('click', restart);
```

**Step 4: 验证**

按验收清单测试；建议在 DevTools → Application → Local Storage 中核对键值与非法数据降级。

**Step 5: 代码评审**

检查：破纪录边界（`>` 而非 `>=`）、localStorage 异常处理、`restart` 是否重置所有状态、是否重复绑定事件。

---

## Task 6: 响应式、触屏与边界加固

**Files:**
- Modify: `css/style.css`
- Modify: `js/game.js`

**验收清单**
- [ ] 窗口缩放后小球仍完整位于游戏区内
- [ ] 手机（≤480px）球直径 52px，顶部栏、按钮、结算卡片不溢出
- [ ] 手机触屏点击小球/空白只结算一次，无 300ms 明显延迟、无双击缩放
- [ ] 快速连点 10 次空白，分数准确扣 10 分，飘字不卡顿
- [ ] 一局结束后立即再来一局，旧计时器不会继续扣时或重复结算
- [ ] Chrome DevTools 移动端模拟 iPhone SE 尺寸下布局完整

**Step 1: 移动端样式**

```css
@media (max-width: 480px) {
  :root { --ball-size: 52px; }

  .top-bar { height: 64px; padding: 0 16px; }
  .brand { font-size: 18px; }
  .stats { gap: 18px; }
  .stat-value { font-size: 24px; }
  .stat-value--time { font-size: 18px; }
  .hint { font-size: 12px; }
  .card { padding: 26px 20px; }
  .card-title { font-size: 22px; }
  .countdown-number { font-size: 72px; }
}
```

**Step 2: 窗口缩放时校正小球位置**

```js
  function clampBall() {
    if (state.phase !== 'playing' || els.ball.hidden) return;
    const size = els.ball.offsetWidth;
    const maxX = Math.max(0, els.gameArea.clientWidth - size);
    const maxY = Math.max(0, els.gameArea.clientHeight - size);
    const x = Math.min(Math.max(Number.parseFloat(els.ball.style.left) || 0, 0), maxX);
    const y = Math.min(Math.max(Number.parseFloat(els.ball.style.top) || 0, 0), maxY);
    els.ball.style.left = `${x}px`;
    els.ball.style.top = `${y}px`;
  }

  window.addEventListener('resize', clampBall);
```

**Step 3: 触屏与重复计分加固复查**

- 确认只绑定 `click`，没有同时绑定 `touchstart`。
- 确认 `.game-area { touch-action: manipulation; }` 与 `user-select: none` 生效。
- 确认小球命中动画期间 `pointer-events: none`。
- 确认 `beginCountdown()` 开头调用 `clearTimers()`。

**Step 4: 验证**

桌面鼠标与移动端模拟分别按验收清单测试。

**Step 5: 代码评审**

检查：媒体查询是否有冗余重复、`resize` 监听是否需要节流（当前单球场景无需额外优化）、边界 clamp 是否覆盖球尺寸大于区域的情况、触控事件是否重复。

---

## Task 7: 全量人工验收、Git 提交与复盘

**Files:**
- Verify: `index.html`、`css/style.css`、`js/game.js`
- Create: `retrospective.md`
- Optionally create: `.gitignore`

**验收清单**
- [ ] 逐条通过 `spec.md` 第 10 节全部 16 条验收标准
- [ ] 控制台无报错、无警告
- [ ] 连续完整游玩 3 局，分数、计时、最高分均正确
- [ ] 刷新页面、缩放窗口、切换横竖屏后功能正常

**Step 1: 全量验收**

按 `spec.md` 第 10 节逐条测试并记录结果，任何失败项先修复再继续。

**Step 2: 初始化 Git 并分阶段提交**

```bash
git init
git add spec.md
git commit -m "docs: 添加抓小球游戏需求规格"

git add index.html css/style.css
git commit -m "feat: 搭建游戏页面结构与视觉样式"

git add js/game.js
git commit -m "feat: 实现倒计时、计分、小球交互与结算逻辑"
```

**Step 3: 编写 retrospective.md**

复盘内容：需求变更点、任务拆分是否合理、遇到的前端问题（事件冒泡/计时器清理/localStorage 降级）、可改进项。

**Step 4: 最终提交**

```bash
git add retrospective.md
git commit -m "docs: 添加项目复盘"
```

**Step 5: 向用户汇报**

给出文件清单、运行方式（直接双击 `index.html`）、验收结果与后续改进建议。

---

## 风险与注意事项

1. **事件重复计分**：小球点击必须 `stopPropagation`，且淡出期间 `pointer-events: none`，这是本项目的核心风险点。
2. **计时器泄漏**：每局开始前 `clearTimers()`，`endGame` 具备重入保护。
3. **小球越界**：所有坐标基于 `clientWidth/clientHeight`，窗口缩放后执行 clamp。
4. **localStorage 异常**：读写均 `try/catch`，失败时游戏仍可正常运行。
5. **移动端双击缩放**：依赖 `touch-action: manipulation`，不绑定 `touchstart`。
