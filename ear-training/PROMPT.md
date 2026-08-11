# 音感测试 — 构建提示

## 目标

在已有 App 框架中实现音感测试功能，包含三种题型：音名识别、音程识别、和弦识别。

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

## 项目结构（新增文件）

```
src/
├── audio/
│   └── playNotes.ts            # playNote, playInterval, playChord
├── theory/
│   ├── notes.ts                # MIDI↔音名↔频率 工具函数
│   ├── intervals.ts            # 音程定义 + 难度分级
│   └── chords.ts               # 和弦定义 + 难度分级
├── hooks/
│   ├── usePitchTrainer.ts
│   ├── useIntervalTrainer.ts
│   └── useChordTrainer.ts
├── components/
│   ├── ModeTabs.tsx            # 音名/音程/和弦 模式切换
│   ├── DifficultySelector.tsx  # 初中高 三档
│   ├── ScoreBoard.tsx          # 分数统计
│   ├── PlayArea.tsx            # 播放/重播按钮
│   ├── OptionsGrid.tsx         # 选项按钮网格
│   ├── Feedback.tsx            # 对错反馈 + 音名显示
│   └── QuizLayout.tsx          # 组合上面组件的统一布局
├── pages/
│   └── EarTrainingPage.tsx     # 替换占位，挂载 QuizLayout
└── types/
    └── index.ts                # 类型定义
```

## 类型定义 (src/types/index.ts)

```ts
export interface IntervalDef {
  name: string      // '大三度'
  semitones: number // 4
}

export interface ChordDef {
  name: string           // '大三和弦'
  intervals: number[]    // [0, 4, 7] semitones from root
}

export interface QuizQuestion {
  notes: string[]        // ['C4'] or ['C4', 'E4'] or ['C4', 'E4', 'G4']
  options: string[]      // shuffled answer choices
  correctAnswer: string  // 'C' or '大三度' or '大三和弦'
}

export interface QuizResult {
  chosen: string
  correct: boolean
}

export interface QuizStats {
  total: number
  correct: number
}

export type Mode = 'pitch' | 'interval' | 'chord'
export type Difficulty = 'easy' | 'medium' | 'hard'
```

## 理论数据层

### theory/notes.ts

- `NOTE_NAMES`: `['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']`
- `midiToNote(midi: number): string` — 60 → 'C4'
- `noteToMidi(name: string): number` — 'C4' → 60
- `midiToFrequency(midi: number): number` — `440 × 2^((n−69)/12)`
- `randomNaturalNote(lo, hi)`, `randomChromaticNote(lo, hi)` — 随机音符

### theory/intervals.ts

```ts
export const INTERVALS: IntervalDef[] = [
  { name: '小二度', semitones: 1 },
  { name: '大二度', semitones: 2 },
  { name: '小三度', semitones: 3 },
  { name: '大三度', semitones: 4 },
  { name: '纯四度', semitones: 5 },
  { name: '三全音', semitones: 6 },
  { name: '纯五度', semitones: 7 },
  { name: '小六度', semitones: 8 },
  { name: '大六度', semitones: 9 },
  { name: '小七度', semitones: 10 },
  { name: '大七度', semitones: 11 },
  { name: '八度', semitones: 12 },
]

export const DIFFICULTY_INTERVALS: Record<Difficulty, IntervalDef[]> = {
  easy: [/* 纯四度, 纯五度, 八度 */],
  medium: [/* + 大二度, 大三度, 小三度, 大六度, 小六度 */],
  hard: [/* 除纯一度外的全部 */],
}
```

### theory/chords.ts

```ts
export const CHORDS: Record<Difficulty, ChordDef[]> = {
  easy: [
    { name: '大三和弦', intervals: [0, 4, 7] },
    { name: '小三和弦', intervals: [0, 3, 7] },
  ],
  medium: [
    { name: '增三和弦', intervals: [0, 4, 8] },
    { name: '减三和弦', intervals: [0, 3, 6] },
  ],
  hard: [
    { name: '属七和弦', intervals: [0, 4, 7, 10] },
    { name: '大七和弦', intervals: [0, 4, 7, 11] },
    { name: '小七和弦', intervals: [0, 3, 7, 10] },
    { name: '减七和弦', intervals: [0, 3, 6, 9] },
  ],
}
```

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

## 三个 Trainer Hook

### 共同接口

```ts
{
  question: QuizQuestion | null
  lastResult: QuizResult | null
  stats: QuizStats
  isPlaying: boolean
  newQuestion: () => void
  replay: () => void
  submitAnswer: (answer: string) => void
  setDifficulty: (d: Difficulty) => void
  resetStats: () => void
}
```

### usePitchTrainer

- Easy: 随机自然音 (C4–B4)；Medium: 半音 (C4–B4)；Hard: 半音 (C3–C6)
- 选项: 正确音名 + 干扰项共 4 个（Easy 只用自然音名，Medium/Hard 用 12 音名）
- `newQuestion()` 自动调用 `playNote()`

### useIntervalTrainer

- 按难度取音程池，随机音程 + 随机起始音（音域 C3–C6 内），随机上/下行
- 选项: 正确答案 + 3 干扰项，打乱
- `newQuestion()` 调用 `playInterval(note1, note2)`；notes 如 `['C4', 'E4']`

### useChordTrainer

- Easy 只取 easy 池；Medium = easy+medium；Hard = 全部（含 7 和弦）
- 随机和弦定义 + 随机根音
- `newQuestion()` 调用 `playChord([root, ...])`；notes 如 `['C4', 'E4', 'G4']`

## 组件规格

### QuizLayout (主容器)

- Props: `trainer` (hook 返回值), `modeName`
- 垂直 flex 布局；首屏 `useEffect` 自动出题

### ModeTabs

- Props: `activeMode`, `onChange`
- 3 按钮: "音名识别" / "音程识别" / "和弦识别"
- 激活态: 下划线指示器 + 高亮；切换时重置题型状态

### DifficultySelector

- Props: `difficulty`, `onChange`
- "初级" / "中级" / "高级"；切换时重置统计并出新题

### PlayArea

- Props: `isPlaying`, `onPlay`, `onReplay`
- "▶ 播放" 新题 + 自动播放；"↻ 重播" 重放当前题

### OptionsGrid

- Props: `options`, `disabled`, `selectedAnswer`, `correctAnswer`, `onSelect`
- 2 列 (移动端) / 自适应 (桌面端) 网格
- 答完后按钮禁用；正确项绿框绿底，错误选中项红框红底

### Feedback

- Props: `result`, `notes`, `correctAnswer`
- 无结果时隐藏
- 正确: 绿条 "✅ 正确！答案是 {correctAnswer}"
- 错误: 红条 "❌ 错误。正确答案是 {correctAnswer}"
- 始终显示音名详情（音程用 `→` 连接，和弦用 `+` 连接），如 "C4 + E4 + G4"

### ScoreBoard

- Props: `stats`, `onReset`
- 显示 "{correct} / {total}" 和准确率百分比 + "重置" 按钮

## 集成到 EarTrainingPage

```
EarTrainingPage
├── ModeTabs (activeMode state)
├── [根据 activeMode 渲染对应 trainer hook]
│   ├── QuizLayout
│   │   ├── DifficultySelector
│   │   ├── PlayArea
│   │   ├── OptionsGrid
│   │   └── Feedback
│   └── ScoreBoard
```

## 验收标准

- [ ] 三种模式可自由切换
- [ ] 难度切换后题目池正确更新
- [ ] 点击"播放"能听到正确音高
- [ ] 音名识别: 单音播放正常
- [ ] 音程识别: 两音先后播放，间隔合理
- [ ] 和弦识别: 多个音同时播放，和弦正确
- [ ] 选择正确选项显示绿色反馈 + 音名信息
- [ ] 选择错误选项显示红色反馈 + 显示正确答案
- [ ] 分数统计准确
- [ ] 每题只能答一次（答后选项 disabled）
- [ ] 点击"下一题"或"播放"刷新题目
- [ ] 鼠标/手指点击均正常工作
