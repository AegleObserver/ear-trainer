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
│   └── playNotes.ts            # playNote, playInterval, playChord (待接入)
├── theory/
│   ├── notes.ts                # MIDI↔音名↔频率 工具函数
│   ├── intervals.ts            # 全量 12 种音程
│   └── chords.ts               # 全量 8 种和弦
├── constants/
│   └── gameConfig.ts           # 玩法配置常量
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
│   ├── PlayArea.tsx            # 播放/重播 + 音符显示
│   ├── OptionsGrid.tsx         # 选项按钮网格
│   ├── Feedback.tsx            # 对错反馈 + 音名显示
│   └── QuizLayout.tsx          # 局内布局组合
├── pages/
│   └── EarTrainingPage.tsx     # 挂载点
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
  submitAnswer: (answer: string) => void
  stop: () => void               // 无限模式停止
  restart: () => void            // 再来一局
  replay: () => void             // 重播 (音频待接入)
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

全量 12 种音程：小二度 → 八度（`INTERVALS: IntervalDef[]`）。

### theory/chords.ts

全量 8 种和弦：大三/小三/增三/减三/属七/大七/小七/减七（`CHORDS: ChordDef[]`）。

## 音频层 (src/audio/playNotes.ts)

基于 `engine.ts` 的 `getSynth()`：

```ts
export async function playNote(note: string, duration = '1n') {
  await ensureAudio()
  getSynth().triggerAttackRelease(note, duration)
}

export async function playInterval(note1: string, note2: string) {
  await ensureAudio()
  const synth = getSynth()
  synth.triggerAttackRelease(note1, '4n')
  await new Promise((r) => setTimeout(r, 800))
  synth.triggerAttackRelease(note2, '4n')
}

export async function playChord(notes: string[]) {
  await ensureAudio()
  getSynth().triggerAttackRelease(notes, '2n')
}
```

## 会话引擎 (hooks/useGameSession.ts)

- 初始化即出第一题并处于 `playing`
- `submitAnswer(answer)`:
  - 判题 → 更新 `lastResult` + `stats`
  - 标准模式第 20 题答完 → `finished`
  - 否则显示反馈 `FEEDBACK_DELAY_MS` 后自动切题（防连点竞态：`answeredRef` 直到切题才复位）
- 限时模式：`useEffect` + `setInterval` 每秒递减 `timeRemaining`，归零 → `finished`
- 无限模式：`stop()` → `finished`，并清空挂起的切题定时器
- `restart()`: 重置全部状态并出第一题

## 三个 Trainer Hook

- `usePitchTrainer(mode)` — 音名: 半音 C3–C6，选项池 12 音名
- `useIntervalTrainer(mode)` — 音程: 全量 12 种，随机根音（音域 C3–C6 内）与上/下行
- `useChordTrainer(mode)` — 和弦: 全量 8 种，随机根音

三者均返回 `GameSession`，只是 `createQuestion` 不同。

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

### OptionsGrid / Feedback

- 答后按钮禁用；正确项绿框绿底，错误选中项红框红底
- 反馈: `✅ 正确！` / `❌ 错误。` + 正确答案 + 音名详情（音程用 `→`，和弦用 `+`）

## 验收标准

- [ ] 三种题型 × 三种玩法可自由切换，切换即重开
- [ ] 标准模式第 20 题答完自动结算
- [ ] 限时模式 2 分钟倒计时归零自动结算，剩余 ≤30s 变红
- [ ] 无限模式点击"停止"立即结算
- [ ] 结算界面显示 答对/共答/准确率，"再来一局"正常重开
- [ ] 答题后反馈（含音名）可见约 1.5 秒再切下一题
- [ ] 每题只能答一次，快速连点不重复计分
- [ ] 切题后按钮恢复可点，分数统计准确
- [ ] `npm run build` 成功
- [ ] （音频接入后）三种播放方式音高正确
