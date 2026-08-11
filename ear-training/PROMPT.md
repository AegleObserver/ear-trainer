# 音感测试 — 构建提示

## 目标

在已有 App 框架中实现音感测试功能，包含三种题型（音名识别、音程识别、和弦识别）与三种玩法（标准、限时、无限）。

## 前置条件

- `app-framework` 的骨架已搭建完成
- `src/audio/engine.ts` 已提供 `ensureAudio()` 和 `getSynth()` 方法
- `EarTrainingPage.tsx` 为当前的挂载点

## 音高标准

使用**十二平均律**，`A4 = 440Hz`，MIDI 公式：

```
f(n) = 440 × 2^((n − 69) / 12)
```

其中 `n` 为 MIDI 编号（`69 = A4`）。代码中不需要手动查表换算频率——Tone.js 接受音名字符串（`'C4'`, `'E4'`）并自动按同一公式转换。`theory/notes.ts` 中的 `midiToFrequency` 使用该公式作为理论参考。

## 玩法系统（替代原难度分级）

| 玩法 | 规则 | 结束条件 | 局内状态栏 |
|------|------|---------|-----------|
| **标准** `standard` | 共 20 题，答完自动出下一题 | 第 20 题答完 → 结算 | 题目进度 `X / 20` + 答对数 |
| **限时** `timed` | 120 秒倒计时（MM:SS），尽量多答 | 倒计时归零 → 结算 | 剩余时间 + 已答 + 答对 |
| **无限** `endless` | 不限题数，随时可停止 | 点击"停止" → 结算 | 已答 + 答对 + 停止按钮 |

- 三种玩法共用**同一全量题目池**（无难度分级）
- 每局独立结算：答对 X / 共 Y · 准确率% + "再来一局"
- 答题后显示反馈（含正确音名）约 1.5 秒，随后自动切下一题
- 结算界面在 `state === 'finished'` 时替代局内界面
- 切换玩法或题型 → 重新开局（`key={`${questionType}:${gameMode}`}` 重挂载）
- 配置常量位于 `src/constants/gameConfig.ts`：
  - `STANDARD_QUESTION_COUNT = 20`
  - `TIMED_LIMIT_SECONDS = 120`
  - `FEEDBACK_DELAY_MS = 1500`

## 项目结构

```
src/
├── audio/
│   └── playNotes.ts            # playNote, playInterval(双声部), playChord
├── theory/
│   ├── notes.ts                # MIDI↔音名↔频率 工具函数
│   ├── intervals.ts            # 全量 12 种音程
│   └── chords.ts               # 全量 8 种和弦
├── constants/
│   └── gameConfig.ts           # 玩法配置常量
├── data/
│   └── storage.ts              # localStorage + 根音区间 + 评级
├── context/
│   └── AppDataContext.tsx      # settings/records 全局状态
├── hooks/
│   ├── useGameSession.ts       # 会话引擎: 出题/判题/自动切题/倒计时/结算
│   ├── usePitchTrainer.ts
│   ├── useIntervalTrainer.ts
│   └── useChordTrainer.ts
├── components/
│   ├── ModeTabs.tsx            # 音名/音程/和弦 题型切换
│   ├── GameModeSelector.tsx    # 标准/限时/无限 玩法切换
│   ├── SessionStatusBar.tsx    # 局内进度/倒计时/停止
│   ├── ResultsScreen.tsx       # 结算界面
│   ├── PlayArea.tsx            # 播放/重播
│   ├── OptionsGrid.tsx         # 选项按钮网格
│   ├── Feedback.tsx            # 对错反馈 + 音名显示
│   └── QuizLayout.tsx          # 局内布局组合
├── pages/
│   ├── EarTrainingPage.tsx     # 音感测试
│   ├── TrainingGroundPage.tsx  # 训练场（根音+音程/和弦发声）
│   └── ProfilePage.tsx         # 个人中心（记录/评级/配置）
└── types/
    └── index.ts                # 类型定义
```

## 类型定义 (src/types/index.ts)

```ts
export type Mode = 'pitch' | 'interval' | 'chord'
export type GameMode = 'standard' | 'timed' | 'endless'
export type GameSessionState = 'playing' | 'finished'

export interface IntervalDef { name: string; semitones: number }
export interface ChordDef { name: string; intervals: number[] }

export interface QuizQuestion {
  notes: string[]        // ['C4'] or ['C4', 'E4'] or ['C4', 'E4', 'G4']
  options: string[]      // 打乱后的 4 个选项
  correctAnswer: string
}

export interface QuizResult { chosen: string; correct: boolean }
export interface QuizStats { total: number; correct: number }

export interface GameSession {
  mode: GameMode
  state: GameSessionState
  question: QuizQuestion | null
  lastResult: QuizResult | null
  stats: QuizStats
  timeRemaining: number | null   // 仅限时模式
  isPlaying: boolean             // 题目播放中
  submitAnswer: (answer: string) => void
  stop: () => void               // 无限模式停止
  restart: () => void            // 再来一局
  replay: () => void             // 重播当前题目
}
```

## 理论数据层

### theory/notes.ts

- `NOTE_NAMES`: 12 个音名（含升降号）
- `midiToNote(n)`: 60 → 'C4'
- `noteToMidi(name)`: 'C4' → 60
- `midiToFrequency(n)`: `440 × 2^((n−69)/12)`
- `randomChromaticMidi(lo, hi)` 等随机工具

### theory/intervals.ts

全量 12 种音程：小二度 → 八度（`INTERVALS: IntervalDef[]`）。其中 6 半音的音程名称为「增四度」。

### theory/chords.ts

全量 8 种和弦：大三/小三/增三/减三/属七/大七/小七/减七（`CHORDS: ChordDef[]`）。

## 个人中心与配置系统 — ✅ 已实现

### 数据持久化 (data/storage.ts)

- `localStorage` 保存 `ear-trainer.settings` 与 `ear-trainer.records`
- `ROOT_RANGES`: 低/中/高/全音域 四档根音区间（midi 号）
- `DEFAULT_SETTINGS`: 全音域 / 全键 / 音程和弦全选（空数组=全部）
- `computeRating(records)`: 平均准确率 = 答对总数 / 答题总数，分档：
  暂无数据 → 音乐新手(<50%) → 进阶学习者(<70%) → 熟练乐手(<85%) → 音乐达人(<95%) → 大师级

### 全局状态 (context/AppDataContext.tsx)

- `AppDataProvider` 包裹应用，提供 `settings / updateSettings / records / addRecord / clearRecords`
- 结算（`session.state === 'finished'`）时自动写入一条记录（题型/玩法/答对/共答/时间）

### 出题配置（影响题库）

- **根音区间**（radio）：控制根音 midi 范围，区间上界自动减去音程/和弦跨度
- **单音**（radio）：白键（自然音）/ 全键（含升降号）
- **音程**（checkbox ×12）：只从勾选音程出题；空=全部
- **和弦**（checkbox ×8）：只从勾选和弦出题；空=全部

`createXQuestion(settings)` 接收 `UserSettings`，三个 trainer hook 通过 `useCallback` 依赖 settings。

### ProfilePage（个人中心 Tab）

- 参与次数 / 平均准确率 / 当前评级 三卡片
- 最近 10 条记录（时间·题型·玩法·答对/共答·准确率）+ 清空记录
- 考察配置面板（根音区间/单音/音程/和弦）

## 训练场 (TrainingGroundPage) — ✅ 已实现

底部新增「训练场」Tab，用于自定义发声练习。

### 交互模型

- **根音选择**：12 音名 chip（单选）+ 八度 −/+ 步进器（范围 2–6，默认 C4），页面顶部大号展示当前根音
- **勾选即播放**：点击音程/和弦 chip 即选中并立即发声（单选互斥），再次点击已选项取消勾选
- **无勾选**：主「播放」按钮只发出根音；有勾选时播放所选音程/和弦
- **播放期间**：全部 chip、根音控制禁用，当前播放项高亮（animate-pulse），约 1.3s 后自动恢复
- **音符构建**：`noteToMidi(rootName)` 得根音 midi；音程 `[root, root+semitones]`，和弦 `intervals.map(i => root+i)`，复用 `playNote/playInterval/playChord`

### 设计决策

- 单选互斥而非多选，避免多选叠加成噪声簇
- 音频 Promise 会立即 resolve，无法感知实际播完，故用 `setTimeout(1300ms)` 结束 playing 态并解除禁用
- 底部导航现有 5 个 tab（音感测试/训练场/演奏/个人中心/设置），tab 内边距压缩为 `px-2 sm:px-3` 适配小屏

## 音频层 (src/audio/playNotes.ts) — ✅ 已实现

基于 `engine.ts` 的 `getSynth()`：

```ts
export async function playNote(note: string, duration = 0.6): Promise<void>
export async function playInterval(note1: string, note2: string): Promise<void>  // 双声部: 两音同时发声
export async function playChord(notes: string[]): Promise<void>                    // 多音同时发声
```

- `ensureAudio()` 通过 `Promise.race` 设 1.5s 超时，非手势环境调用不会挂起
- 每次答题点击时调用 `ensureAudio()`（手势解锁 AudioContext），之后自动播放可正常发声
- `setVolume(level)` 设置全局音量（`Tone.getDestination().volume`），Header 音量滑块已接入
- 音高换算由 Tone.js 内部按十二平均律完成（A4=440Hz）

## 播放流程

- 新题生成后自动播放：切题（答题后 1.5s）与"再来一局"时调用 `play(question)`
- `replay()` 重播当前题（用户手势，首次点击同时解锁音频）
- `isPlaying` 期间禁用选项按钮，防止未听完就作答

## 会话引擎 (hooks/useGameSession.ts)

签名: `useGameSession(createQuestion, mode, playQuestion)`，`playQuestion` 由各 trainer hook 提供。

- 初始化即出第一题并处于 `playing`（不出声，需点击"播放题目"解锁音频）
- `submitAnswer(answer)`:
  - 判题 → 更新 `lastResult` + `stats`，同时调用 `ensureAudio()`（手势解锁）
  - 标准模式第 20 题答完 → `finished`
  - 否则显示反馈 `FEEDBACK_DELAY_MS` 后自动切题并播放（防连点竞态：`answeredRef` 直到切题才复位）
- 限时模式：`useEffect` + `setInterval` 每秒递减 `timeRemaining`，归零 → `finished`
- 无限模式：`stop()` → `finished`，并清空挂起的切题定时器
- `restart()`: 重置全部状态、出第一题并播放
- `replay()`: 重播当前题（`isPlaying` 期间忽略）

## 三个 Trainer Hook

- `usePitchTrainer(mode)` — 音名: 半音 C3–C6，选项池 12 音名，`playQuestion` = `playNote`
- `useIntervalTrainer(mode)` — 音程: 全量 12 种，随机根音（音域 C3–C6 内）与上/下行（双声部同时发声），`playQuestion` = `playInterval`
- `useChordTrainer(mode)` — 和弦: 全量 8 种，随机根音，`playQuestion` = `playChord`

## 组件规格

### EarTrainingPage

```
标题 + ModeTabs (题型)
GameModeSelector (玩法, 页面级, 切换即重开)
SessionPanel (key={`${questionType}:${gameMode}`})
├── state === 'finished' → ResultsScreen
└── 否则 → QuizLayout (SessionStatusBar + PlayArea + OptionsGrid + Feedback)
```

### SessionStatusBar

- 标准: `题目进度 X/20` + `答对 Y`
- 限时: `⏱ MM:SS`（剩余 ≤30s 变红）+ `已答` + `答对`
- 无限: `已答` + `答对` + `[停止]` 按钮

### ResultsScreen

- 玩法结束说明（已完成 20 题 / 时间到 / 已手动结束）
- 答对 / 共答 / 准确率% 三列
- `[再来一局]` 按钮 → `restart()`

### PlayArea

- 大按钮 `▶ 播放题目`（`isPlaying` 时显示 `⏳ 播放中…` 并禁用）
- 不再显示音符预览文本

### OptionsGrid / Feedback

- 答后按钮禁用；正确项绿框绿底，错误选中项红框红底
- 播放中（`isPlaying`）按钮同样禁用，防止未听完就作答
- 反馈: `✅ 正确！` / `❌ 错误。` + 正确答案 + 音名详情（音程用 `→`，和弦用 `+`）

## 验收标准

- [x] 三种题型 × 三种玩法可自由切换，切换即重开
- [x] 标准模式第 20 题答完自动结算
- [x] 限时模式 2 分钟倒计时归零自动结算，剩余 ≤30s 变红
- [x] 无限模式点击"停止"立即结算
- [x] 结算界面显示 答对/共答/准确率，"再来一局"正常重开
- [x] 答题后反馈（含音名）可见约 1.5 秒再切下一题
- [x] 每题只能答一次，快速连点不重复计分
- [x] 切题后按钮恢复可点，分数统计准确
- [x] `npm run build` 成功
- [x] 三种播放方式音高正确（Tone.js 十二平均律，A4=440Hz）
- [x] 首次点击"播放题目"解锁音频，之后自动播放正常
- [x] Header 音量滑块实时生效
