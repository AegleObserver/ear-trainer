# 演奏模块 — 构建提示（基础功能已实现 M1–M4）

底部「演奏」Tab（`PlayPage`）为网格编辑器 + 播放器。本文档为该功能的规格主文档，随开发逐条细化。✅ = 已实现。

## 交互模型 — ✅ 已实现

- **网格式界面**：纵轴 = 音高轴，横轴 = 时间轴（行业常见网格 UI）
- **时序粒度**：步进式（固定格点），音符对齐网格放置；音符时值恒为**当前最小分度的整数倍**
- **多声部**：网格支持多条并行音轨（见「音轨」），涉及资源调度考量；当前实现不设上限（≥ 2 满足）
- **缩放**：横/纵轴可缩放为规划项，**现阶段不做要求**
- **音色**：现阶段不引入复杂音色，**沿用节奏型测试**音色池——鼓 → MembraneSynth 敲 `C1`（打击乐，无旋律音高）；乐音 5 档 → **按网格音符音高（MIDI）发声**（`pitch → Tone.Frequency(midi).toNote()`），**发声时值 = 音符时值 × 0.95**（留呼吸），长音持续、短音短促。
  - 实现：`src/audio/playSequence.ts` 内按 `voice` 缓存独立实例（`voiceCache: Map<RhythmVoiceId, PolySynth | MembraneSynth>`），**不与**节奏测试的全局 `currentRhythmVoice` 耦合；同音色音轨共享实例（最多 6 个实例），天然满足资源调度约束。

## 节拍与状态栏 — ✅ 已实现

状态栏位于网格**正上方**，承载拍号 / BPM / 最小分度 / 起点 / 播放·暂停·停止 / 撤回·恢复。

| 控件 | 说明 |
|------|------|
| 拍号 | 支持 **4/4 / 3/4** 两档切换（默认 4/4）；**切换拍号清空当前网格全部音符（可撤回恢复）并复位起点**；播放/暂停期间锁定 |
| BPM | tab 内**独立调节**（不依赖设置页 `rhythmBpm`），默认 **120**；**数字输入 + 预设档位**（60/80/100/120/150/180/200/240），合法范围 **60–240**（越界自动钳制归界） |
| 最小分度 | 两档 **1/8 / 1/16**，决定格点密度与音符时值量化单位；**手动创建的音符始终对齐整数格**（时值 = minStep 整数倍）；**切换时已有音符按比例精确换算**（1/16↔1/8 因子为 2 / 0.5，奇数格转 1/8 后表现为半格，不吸附取整，渲染与点击判定支持半格） |
| 起点 | 显示当前 start_point（格）；**点击网格顶部小节**设置起点（红色游标），「↺ 复位」归零 |
| 播放控制 | ▶ 播放（从起点起播）/ ⏸ 暂停 / ▶ 继续 / ⏹ 停止；**播放或暂停期间锁定全部编辑控件** |

## 网格交互 — ✅ 已实现

- **时值量化**：生成音符的时值 = 最小分度 × 正整数
- **创建音符**：点击空白格开始 → **水平拖拽**至目标格释放，跨越格数即音符时值（单击 = 1 格）
- **清除音符**：点击已含音符的区域 → **清除整个音符**（覆盖语义，非拆分）
- 音符音高由纵轴所在格决定（音高域 C3–C6，`midiToNote` 渲染标签）
- **发声预览**：新建音符时即时播放该音高短音（0.3s，当前轨音色，`previewPlayNote`）
- 播放/暂停期间拖拽与清除均被禁用（`editable` 门控）

## 音轨（网格左侧书签栏）— ✅ 已实现

- 音轨书签栏位于网格**左侧**：**切换 / 新增 / 删除**（至少保留 1 条，删除按钮随之为禁用态）
- 每条音轨：**独立选择音色**（节奏音色池：鼓 + 5 档乐音，下拉选择，复用 `RHYTHM_VOICES` 标签）+ **静音开关**（🔊/🔇，静音轨渲染半透明 + 播放跳过）
- 音轨按索引配色（`PLAY_TRACK_COLORS`：青/绿/紫/琥珀循环）；切换音轨时网格仅显示该轨音符
- **音色试听**：点击音轨色块圆点 → 播放该轨音色短音（默认音高 A4 = `PLAY_PREVIEW_MIDI` 69，鼓敲 C1；播放锁定期间禁用）

## 播放模型 — ✅ 已实现

- **start_point**：时间轴上的**播放起点游标**（格），点击网格顶部小节设置；播放自该格起播
- 起播后持续播放，至**旋律结束**或用户**手动停止**
- 状态栏提供 **播放 / 暂停 / 继续 / 停止** 键
- 实现：`src/audio/playSequence.ts` 基于 `Tone.Transport` 调度——
  - 事件时间 = `(note.start − startTick) × 步长秒`，起点之前已结束的音符跳过，跨过起点的音符攻击点钳制到起点
  - 静音轨跳过；鼓轨敲 `C1` 打击音（短促，不随网格音高/时值变化）；乐音轨**按音符 `pitch` 发声**，**时值 = `note.dur × 步长秒 × 0.95`**（留呼吸），乐音 envelope 含 sustain（attack .005 / decay .1 / sustain .7 / release .15）以支持长音持续
  - 结束回调 `Tone.Transport.schedule(finish, lastEnd)` 统一在末尾触发 → `Promise` resolve → `isPlaying` 复位
  - `pause()` = `Transport.pause()`，`resume()` = `Transport.start()`，`stop()` = `Transport.stop()` + `cancel(0)` 并提前 resolve
  - 首次播放经 `ensureAudio()` 手势解锁

## 编辑操作 / 导出 / 记忆 — ✅ 已实现（导出除外）

- **撤回 / 恢复**：状态栏按键，**仅作用于网格音符编辑**（创建 / 拖拽改长 / 清除），不覆盖音轨与状态栏参数操作
  - 实现：`usePlayEditor` 内 `undoStack / redoStack`（ref 存储整份 tracks 快照 + `canUndo/canRedo` state），音符增删前 `pushHistory`；StrictMode 安全（不在 updater 内做副作用）
- **导出（规划项）**：后续支持导出 **MP3 / WAV** 音频文件；**现阶段空置**（预留，不实现）
- **编辑记忆**：切 Tab 再返回，已编排内容（音符 / 音轨 / 参数）不丢失——满足「常驻挂载、hidden 显隐」架构约定（`AppShell`），无额外持久化

## 手稿保存 / 加载 — ✅ 已实现

- 右侧「手稿」栏（`ManuscriptList`）：列出已保存手稿（名称 + 相对更新时间），底部「＋ 新建」；上限 `MANUSCRIPT_MAX_COUNT`（默认 10，常量可调，不硬编码于逻辑）
- 交互：
  - **保存**：状态栏「💾 保存」按钮（仅 `isDirty` 时可用）；有活跃手稿则覆盖更新，无则新建条目（默认名 `nextManuscriptName()` 生成「新建手稿-x」，x = 现有同名默认名最大序号 + 1，不重号）
  - **加载**：点击手稿项载入编辑器（含 tracks / bpm / minStep / timeSignature，复位起点、清空撤销栈）；若有未保存修改先弹窗确认
  - **重命名**：点 ✏️ 进入 inline input，Enter 确认 / Esc 取消
  - **删除**：点 🗑 二次确认；删除当前活跃手稿时自动清空编辑器
  - **新建**：点「＋」清空编辑器并解除手稿关联（未保存修改先弹窗确认）
- **持久化**：`localStorage` key `'ear-trainer.manuscripts'`（`loadManuscripts` / `saveManuscripts`）；手稿内容：tracks / bpm / minStep / timeSignature + id / name / createdAt / updatedAt；`startTick` 与撤销栈不序列化
- 脏标记：`usePlayEditor` 内 `isDirty`（音符 / 音轨 / BPM / 最小分度 / 拍号变更即置脏），保存 / 加载 / 新建后复位

## 布局与响应式 — ✅ 已实现

- **三栏布局**：`PlayPage` 采用 `flex` 布局，左侧音轨栏（`TrackList`，`w-56`）、中间网格（`PitchGrid`，`flex-1`）、右侧手稿栏（`ManuscriptList`，`w-56`）
- **网格自适应**：`PitchGrid` section 加 `w-full` 占满容器，内部保持 `overflow-x-auto` 横向滚动（网格内容刚性宽度，容器窄时可横滑）
- **响应式回流**：容器使用 `flex-wrap` + `order` 实现响应式——
  - 大屏（`lg:`）：三栏并排（音轨 `order-1` | 网格 `order-2` | 手稿 `order-3`）
  - 窄屏：手稿栏回流至与音轨同列（DOM 顺序：音轨→手稿→网格，视觉顺序 `order-1/2/3`，手稿落在音轨下方）
- **最小容忍宽度**：网格容器 `min-w-[400px]`，保证网格可用宽度；低于此宽度时触发回流

## 类型与数据 — ✅ 已实现

`src/types/index.ts` 新增（其余沿用既有 `RhythmVoiceId`）：

```ts
export type MinStep = 8 | 16

export interface PlayNote {
  pitch: number  // midi
  start: number  // 起始格（最小分度格）
  dur: number    // 格数（正整数）
}

export interface PlayTrack {
  id: string
  voice: RhythmVoiceId
  muted: boolean
  notes: PlayNote[]
}

export interface Manuscript {
  id: string          // crypto.randomUUID()
  name: string
  tracks: PlayTrack[]
  bpm: number
  minStep: MinStep
  timeSignature: TimeSignature
  createdAt: number
  updatedAt: number
}
```

布局常量见 `src/constants/playConfig.ts`（BPM 60–240/默认 120/预设档位、4 小节 × 当前拍号（4/4 或 3/4）、音高域 C3–C6、格宽 16px、行高 18px、音轨配色）。

## 待定项（TODO）

- ~~3/4 拍号开放时机~~（已开放，见「节拍与状态栏」）
- 横/纵轴缩放（暂缓）
- 导出格式与触发方式（规划中，`OfflineAudioContext` 离线渲染方案待评估）

## 实施步骤方案（里程碑）

按依赖顺序推进，各里程碑可独立验收。✅ = 已完成。

### M1 数据模型与网格渲染（静态）— ✅
- 定义编辑器数据模型 + `usePlayEditor`（tracks / activeTrackId / bpm / minStep + 音符增删）
- `PlayPage` 由占位 → 网格渲染：音高标签列 + 时间轴（CSS 背景渐变画格线/小节线），仅渲染当前音轨音符（按当前轨索引配色）
- 状态栏静态呈现：拍号 4/4、BPM 输入 + 预设档位（60–240 钳制）、最小分度 1/8/1/16
- 启用底部「演奏」Tab（`AppShell` `enabled: true`）

### M2 编辑交互 — ✅
- 空白格 pointerdown + 水平拖拽创建音符（`pointer capture`，时值 = 最小分度整数倍），点击已占格清除整音符
- 最小分度切换：已有音符按因子 2 / 0.5 精确换算（奇数格在 1/8 下为半格，不取整）；手动创建始终整数格对齐
- 音符编辑撤销栈（undo/redo，仅音符编辑），状态栏按键接入

### M3 多音轨 — ✅
- 左栏音轨书签：切换 / 新增 / 删除（≥1）
- 每轨独立音色（节奏音色池下拉）+ 静音开关 + 轨配色

### M4 播放 — ✅
- `playSequence.ts`：Tone.Transport 调度 + 按 voice 缓存独立实例；start_point 起播（顶部小节点击设起点）
- 播放 / 暂停 / 继续 / 停止 + `isPlaying` 锁定编辑；首次播放 `ensureAudio()` 解锁
- 静音轨跳过发声；结束回调统一收尾
- **发声修正**：乐音轨按音符 MIDI 音高发声（原固定 A4 已废弃）；发声时值 = 音符时值 × 0.95（原统一 0.08s 短促音已废弃），乐音 envelope 含 sustain

### M5 打磨 / 导出（后续）
- 缩放、MP3/WAV 导出（`OfflineAudioContext` 离线渲染方案待评估）
- 验收：`npm run build`（含 `tsc -b`）通过 + 本地 `npm run dev` 冒烟