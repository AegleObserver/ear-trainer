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
- 结算界面在 `state === 'finished'` 时**追加在局内界面下方**（不替换局内 UI，最后一题的对错反馈与结算同屏可见）
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
│   ├── TestPage.tsx            # 测试（音高/节奏滑动切换，右上角）
│   ├── EarTrainingPage.tsx     # 音感测试（音高子功能）
│   ├── RhythmTestPage.tsx      # 节奏测试（节奏型识别）
│   ├── TrainingGroundPage.tsx  # 训练场（音高/节奏滑动切换）
│   ├── RhythmGroundPage.tsx    # 节奏训练场（拼接构建器）
│   ├── ProfilePage.tsx         # 个人中心（记录/评级/配置）
│   └── SettingsPage.tsx        # 设置（页面风格/音色/播放方式/测试参数）
├── components/
│   ├── SoundDomainToggle.tsx   # 音高🎵/节奏🥁 滑动开关
│   ├── NoteGlyph.tsx           # 简化音符 SVG（空心/实心/附点/三连音）
│   └── RhythmPatternView.tsx   # 节奏型记谱（间距按拍数）
└── types/
    └── index.ts                # 类型定义
```

## 类型定义 (src/types/index.ts)

```ts
export type Mode = 'pitch' | 'interval' | 'chord'
export type GameMode = 'standard' | 'timed' | 'endless'
export type GameSessionState = 'playing' | 'finished'

export type SoundDomain = 'pitch' | 'rhythm'   // 音高/节奏 子功能
export type PlaybackMode = 'simultaneous' | 'sequential'  // 同时播放 / 逐音上行

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

## 测试与训练场双域模块化 — ✅ 已实现

音感测试/训练场均改为「音高/节奏」双域结构，节奏域已落地为完整功能。

| Tab | 音高域 | 节奏域 |
|-----|--------|--------|
| 测试（原音感测试） | `EarTrainingPage`（现有音感测试） | `RhythmTestPage`（节奏型识别） |
| 训练场 | 现有根音训练内容 | `RhythmGroundPage`（拼接构建器） |

- **切换**：`SoundDomainToggle` 组件（胶囊滑块，音高 🎵 / 节奏 🥁），位于各页**内容区右上角**
- **状态**：每页独立 `useState<SoundDomain>('pitch')`，不持久化，刷新回默认音高
- 类型 `SoundDomain = 'pitch' | 'rhythm'`；`PageId` 原 `'ear-training'` 改为 `'test'`

## 多 Tab 常驻挂载（切换保留状态） — ✅ 已实现

`AppShell` 的 `<main>` 内全部页面**常驻挂载**，用 `hidden` 类按 `activePage` 显隐（不再条件渲染卸载）：

- 切换 Tab 不卸载页面 → 组件级状态全部保留（测试会话进度/当前题/答对统计、训练场根音与勾选、节奏拼接图案、音高/节奏域等），切回原样
- 隐藏页定时器自然继续运行（限时倒计时、播放高亮等），符合"记忆不做更改"语义
- 常驻隐藏页不产生噪音：测试页首题需手势解锁音频，不自动发声

## 节奏模块 — ✅ 已实现

### 时值集 (theory/rhythm.ts)

8 种 `NoteValueDef`（无休止符）：全音符4 / 二分2 / 四分1 / 八分0.5 / 十六分0.25 / 附点四分1.5 / 附点八分0.75 / 八分三连音1/3。

### 预制节奏型（节奏考察原子）

`RHYTHM_FIGURES`：10 种预制节奏型，每个 = `{ id, label, beats, seq }`，`seq` 展开为音符值序列供渲染与播放：

| 节奏型 | beats | seq |
|--------|-------|-----|
| 二分 | 2 | half |
| 四分 | 1 | quarter |
| 八分 | 0.5 | eighth |
| 三连音 | 1 | triplet ×3 |
| 前十六分 (16·16·8) | 1 | 16, 16, 8 |
| 后十六分 (8·16·16) | 1 | 8, 16, 16 |
| 切分音 (16-8-16) | 1 | 16, 8, 16 |
| 切分音 (4-8-4) | 2.5 | 4, 8, 4 |
| 附点八分 | 0.75 | dotted-eighth |
| 附点四分 | 1.5 | dotted-quarter |

标签不含「·」，保证可按「·」安全拼接/解析。

### 出题（组合成完整 4/4 小节）

- `randomMeasure()`：回溯枚举 2–4 个节奏型、**时值和恰为 4 拍**（4/4 小节）的序列，随机取一（合法组合全集缓存在 `validMeasures`）
- `createRhythmQuestion()`：正确项 + 3 个干扰项（同为 4/4 小节的不同组合），按**展开后音符序列指纹 `noteSeqKey` 去重**，确保选项之间听感必不相同
- 选项 token = 中文节奏型名连接串（如 `四分·三连音·四分`）；`notes` = 展开后的音符值标签数组（供播放与 Feedback）
- 会话复用 `useGameSession`（`useRhythmTrainer`），记录 `questionType: 'rhythm'`

### 发声 (audio/rhythmPlay.ts)

- `engine.ts` 打击乐单例：`getBeatSynth()`（MembraneSynth 鼓点，`volume: 3` 单独调响）；节奏乐音 `getRhythmToneSynth()`（以 **A4** 发声的短促打击音，attack .001 / decay .2 / sustain 0，防余音重叠）
- `configureRhythmVoice(voice)`：切换节奏音色（`drum` 或 5 档乐音波形）；`getRhythmHit()` 返回当前音源 + 击发音高（鼓→`C1`，乐音→`A4`）
- `playRhythmQuestion(labels, bpm = 90)`：**直接起播、无节拍器参照、仅奏一遍**，拍长 `60/bpm` 动态换算，按 `Tone.now() + 累计拍偏移` 错时触发；Promise 在总时长后 resolve → `isPlaying` 全程为 true，**选项锁定直至听完**
- 音色与 BPM 均来自设置：`settings.rhythmVoice` / `settings.rhythmBpm`（默认 `drum` / `90`），由 `useRhythmTrainer` 与 `RhythmGroundPage` 传入

### 记谱渲染

- `NoteGlyph`：简化音符 SVG（空心=二分、实心=四分/八分/十六分、附点、三连音「3」），颜色走 `currentColor` 随主题
- `RhythmPatternView`：节奏型组件，音符间距 `flexGrow: beats` 按拍数排布
- `OptionsGrid`/`QuizLayout` 增加可选 `renderOption` + `optionsGridClass` prop（向后兼容）；节奏测试页传 `grid grid-cols-1` 使选项**整行全宽**容纳整小节字形，并传记谱渲染（整行字形 + 节奏型名）

### 训练场节奏域 (RhythmGroundPage)

拼接构建器（**不改动为节奏型原子**）：点选 8 种音符值追加，**总时值 ≤ 一个小节（4 拍）**——超出则按钮禁用；实时显示「当前时值 X/4 拍（还差/已满）」；播放直接奏出、仅一遍；清空/删末位；播放期间禁用控件。

### 其它

- `Mode` 增加 `'rhythm'`，ProfilePage 记录标签补「节奏」
- 测试参数（题量/限时）沿用设置；`renderOption` 不影响音高侧

## 个性化系统 (SettingsPage) — ✅ 已实现

启用底部「设置」Tab，可调项（均存入 `UserSettings` 并持久化，旧数据经 `{...DEFAULT, ...raw}` 合并自动补默认值）：

### 1. 页面风格 (theme)

- `ThemeId = 'dark-cyan' | 'light' | 'dark-violet' | 'dark-amber'`
- **实现**：Tailwind v4 工具类引用 `var(--color-*)`，故在 `src/index.css` 用 `[data-theme='...']` 作用域重写 `--color-slate-*` / `--color-cyan-*`（light 额外加深 emerald/rose 保证对比度）即可换肤，无需改组件
- **应用**：`AppShell` effect 把 `settings.theme` 写到 `document.documentElement` 的 `data-theme`（html 是 body 祖先，body 背景随之生效）
- `dark-cyan` 为默认主题，无需覆盖变量

### 2. 音色类型 (timbre)

- `TimbreId = 'sine' | 'triangle' | 'square' | 'sawtooth' | 'fm'`
- `engine.ts` 新增 `configureSynth(timbre)`：dispose 当前 PolySynth 并重建单例
  - 前 4 档 → `PolySynth(Tone.Synth, { oscillator:{type}, envelope:现值 })`
  - `fm` → `PolySynth(Tone.FMSynth, { harmonicity:3, modulationIndex:2, ... })`
- 下一次发声即生效（各播放函数每次调用 `getSynth()`）

### 3. 测试参数

- 标准模式题量 `standardCount`（5/10/20/30，默认 20）
- 限时模式时长 `timedLimitSeconds`（60/120/180/300，默认 120）
- `useGameSession(createQuestion, mode, playQuestion, config?)` 新增可选 `config: GameSessionConfig`，缺省回退 constants；计时初始化/standard 结束判定/restart 均用 config
- 三个 trainer hook 从 `settings` 传入；改后对下一局生效

### 4. 播放方式 (playbackMode)

- `PlaybackMode = 'simultaneous' | 'sequential'`，默认 `simultaneous`（= 原和声叠响行为）
  - **同时播放**：多个音一键叠响（和声效果）
  - **逐音上行**：按 midi 升序逐个触发（旋律效果），每音时长 0.4s、间隔 0.3s
- **全局生效**：`playInterval`/`playChord` 读取 `getPlaybackMode()`；音感测试出题播放与训练场即时播放均遵循；单音 `playNote` 不受影响
- 实现：`engine.ts` 新增 `configurePlayback(mode)`/`getPlaybackMode()` 模块级状态（与 timbre 同源）；`playNotes.ts` 在 sequential 分支用 `Tone.now() + i*0.3` 错时触发；`AppShell` effect 应用 `settings.playbackMode`；`SettingsPage` 新增「播放方式」小节

### 5. 节奏设置（节奏音色 + 速度）

设置页「节奏」面板（对节奏测试与节奏训练场生效）：

- **节奏音色** `rhythmVoice`：`'drum' | TimbreId`，默认 `drum`。鼓→膜音敲 `C1`；乐音 5 档→以 **A4** 发声的短促打击音。`AppShell` effect → `configureRhythmVoice`
- **速度 BPM** `rhythmBpm`：默认 90，范围 60–200。预设档位单选框（60/80/90/100/120/150/180/200）+ 自定义数字输入（失焦钳制归界）；`playRhythmQuestion(labels, bpm)` 拍长 `60/bpm` 动态换算，已移除原固定 `RHYTHM_BPM` 常量

## 音频层 (src/audio/playNotes.ts) — ✅ 已实现

基于 `engine.ts` 的 `getSynth()`：

```ts
export async function playNote(note: string, duration = 0.6): Promise<void>
export async function playInterval(note1: string, note2: string): Promise<void>  // 双声部（或逐音上行）
export async function playChord(notes: string[]): Promise<void>                    // 多音（或逐音上行）
```

- `playInterval/playChord` 依据 `getPlaybackMode()` 分两条路径：simultaneous → `triggerAttackRelease([...], 1.2)`；sequential → 按 midi 升序以 `Tone.now()+offset` 逐音触发

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
└── 始终渲染 QuizLayout (SessionStatusBar + PlayArea + OptionsGrid + Feedback)
    └── state === 'finished' → QuizLayout 末尾追加 ResultsScreen（不替换局内 UI）
```

### SessionStatusBar

- 标准: `题目进度 X/20` + `答对 Y`
- 限时: `⏱ MM:SS`（剩余 ≤30s 变红）+ `已答` + `答对`
- 无限: `已答` + `答对` + `[停止]` 按钮

### ResultsScreen

- 玩法结束说明（已完成 20 题 / 时间到 / 已手动结束）
- 答对 / 共答 / 准确率% 三列（不含按钮，重开入口由 PlayArea 的「重新挑战」承担）

### PlayArea

- 大按钮 `▶ 播放题目`（`isPlaying` 时显示 `⏳ 播放中…` 并禁用）
- 会话结束（`finished`）时按钮变为 `🔁 重新挑战`，点击重开一局（`session.restart`）
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
