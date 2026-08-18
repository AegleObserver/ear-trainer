# 调音器模块 — 构建提示

底部新增「调音」Tab（`TunerPage`）：通过麦克风识别用户弹奏/演唱的音，与目标音对比判断音准（音分偏差），服务对象为 **吉他 / 尤克里里 / 自定义音**。本文档为该功能的规格主文档，随开发逐条细化。✅ = 已实现。

> 状态：Part A 与 Part B **均已实现**（✅），详见各小节。

## 背景与结论

- **播放器不需要音高校准**：本项目全部音频由浏览器内合成（Tone.js），频率数学精确（`440·2^(n/12)`），不存在模拟器件漂移——数字合成不可能「跑调」，没有可校准的东西；允许用户调播放器基准音高反而会破坏音感训练（应锚定标准音 A4=440）。
- **用户乐器需要校准**：本模块即「调音器」——用麦克风测出实际音高，对照目标音给出音分偏差（偏低/偏高/准），帮助用户在练习前把乐器调准。
- 配套改善「确认声音正常」体验：Header 增加 **试听 A4** 参考音按钮；音量滑块持久化 + 移动端可见（见 Part A）。

## 音高标准

使用**十二平均律**，`A4 = 440Hz`，与全站一致（`src/theory/notes.ts` 的 `midiToFrequency / midiToNote`）：

```
f(n) = 440 × 2^((n − 69) / 12)          # n = MIDI 编号，69 = A4
cents = 1200 × log2(freq / targetFreq)  # 音分偏差：<0 偏低，>0 偏高
```

## Part A · 试听 A4 + 音量持久化 — ✅ 已实现

- 新增 `src/components/ReferenceToneButton.tsx`：点击 `playNote('A4')`（自动 `ensureAudio` 解锁、用当前音色），短时「播放中…」态；置于 Header 音量滑块旁，全局可用。
- `src/types/index.ts`：`UserSettings` 增加 `volume: number`。
- `src/data/storage.ts`：`DEFAULT_SETTINGS` 增加 `volume: 0.8`（靠现有 `{...DEFAULT, ...raw}` 合并逻辑自动兼容旧存档）。
- `src/components/AppShell.tsx`：
  - 音量 state 初始化为 `settings.volume`，移除挂载时硬编码 `setVolume(0.8)`；
  - 监听 `settings.volume` 变化同步音频引擎 `setVolume`（与 `configureSynth` 等同模式）；
  - 滑块 onChange 调 `updateSettings({ volume })`；
  - 去掉 `hidden sm:flex`，移动端也显示音量滑块。

## Part B · 调音器（吉他 / 尤克里里 / 自定义音）— ✅ 已实现

### 数据 — `src/theory/tuning.ts`（纯数据，无 UI 依赖）— ✅

| 常量 | 内容 |
|------|------|
| `GUITAR_STRINGS` | `['E2','A2','D3','G3','B3','E4']`（标准调弦，低到高） |
| `UKULELE_STRINGS` | `['G4','C4','E4','A4']`（标准调弦，含回旋 G） |
| `TunerMode`（类型） | `'guitar' | 'ukulele' | 'custom'`，放 `src/types/index.ts` |

### 音频 — `src/audio/tuner.ts`（独立于 Tone.js 的 AudioContext）— ✅

- `startTuner(): Promise<void>`：
  - `navigator.mediaDevices.getUserMedia({ audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false } })`（关 AGC/回声/降噪，保证测频准确）；
  - `new AudioContext()` → `MediaStreamAudioSourceNode → AnalyserNode(fftSize: 2048)`；
  - 需 `resume()`；`started` 标记防重复初始化。
- `stopTuner(): void`：停用并释放 MediaStream 音轨、断开节点、关闭上下文。
- `readPitch(): PitchReading | null`：
  - 对 `analyser.getFloatTimeDomainData()` 做**自相关（ACF）**测频——**无新增第三方依赖**；
  - **静音门限**：RMS < `0.012` → 返回 null（「等待声音…」）；
  - **置信门限**：归一化相关度 < `0.88` → 返回 null（过滤噪声/泛音误判）；
  - 频率范围门限（约 40–2000 Hz）；
  - 输出：`{ freq, midi /* 浮点 MIDI */, note, cents /* 距最近半音 */, confidence }`，`midi = 69 + 12·log2(freq/440)`，`cents = (midi − round(midi)) × 100`。

> 注意：`getUserMedia` 需要 **HTTPS**（GitHub Pages 满足；本地 `localhost` 亦允许）。

### Hook — `src/hooks/useTuner.ts` — ✅

- `requestAnimationFrame` 循环采样 `readPitch()`，暴露：
  - `listening: boolean`、`reading: PitchReading | null`、`error: string | null`（权限拒绝 `NotAllowedError` / 设备占用 `NotReadableError` 等友好提示）；
  - `start() / stop()`；`active` 为 false 时自动停麦（页面接收 `active` prop 触发），卸载时清理。
- 偏差计算：目标音为吉他/尤克里里目标弦或自定义音 MIDI，`cents = 1200·log2(freq / targetFreq)`（固定目标时偏差可超 ±50）。

### 页面 — `src/pages/TunerPage.tsx` — ✅

- 三种模式（`TunerMode`）切换：吉他（6 弦）/ 尤克里里（4 弦）/ 自定义。
- **吉他 / 尤克里里模式**：
  - 弦列表：`试听`（复用 `playNote`，当前音色播放该弦目标音对照）+ 弦名 + 音名 + 当前识别到的最弦弦标 ▶；
  - **目标弦确定：自动识别最近弦 + 可手动点弦钉住**——有检测到音时自动锁定最近的目标弦，点某根弦则固定为手动目标，可一键「取消固定（自动识别）」。
- **自定义模式**：音名网格（12 音）+ 八度 +/−（复用训练场选择交互），默认 A4；`试听` 播放目标音。
- **核心显示**：目标音名 + 检测到音名/频率 + **音分刻度表**——横向标尺，左端 −50 偏低、中心 0 准、右端 +50 偏高，色块指针指示当前偏差；`|cents| < 10` →「准」，否则按方向显示「偏低 / 偏高 X 音分」；无有效信号时显示「等待声音…」。
- 「开始检测 / 停止检测」按钮：按需申请麦克风权限，权限/设备异常给出友好错误文案。

### 入口 — `src/components/AppShell.tsx` — ✅

- `PAGES` 新增 `{ id: 'tuner', label: '调音', icon: '🎚️' }`，置于「训练场」之后、「演奏」之前。
- 内容区新增常驻挂载的 hidden 显隐 div（`TunerPage`），遵守「**常驻挂载、hidden 显隐**」架构约定（切 Tab 保留状态）。
- `TunerPage` 接收 `active={activePage === 'tuner'}` prop：切走时自动停麦释放资源（麦克风是稀缺资源，不应在后台常开）。

## 项目结构（新增/改动）

```
src/
├── audio/
│   └── tuner.ts                 # 麦克风 + 自相关测频（独立 AudioContext）
├── theory/
│   └── tuning.ts                # 吉他/尤克里里标准调弦（纯数据）
├── hooks/
│   └── useTuner.ts              # rAF 循环 + listening/reading/error
├── pages/
│   └── TunerPage.tsx            # 调音器页面（三模式 + 音分表）
├── components/
│   ├── ReferenceToneButton.tsx  # 试听 A4 参考音按钮
│   └── AppShell.tsx             # +调音 Tab、音量持久化、试听按钮
├── data/
│   └── storage.ts               # DEFAULT_SETTINGS + volume
└── types/
    └── index.ts                 # +TunerMode、UserSettings.volume
```

## 验收标准

- [x] `npm run dev` 启动成功，底部出现「调音」Tab，切页不卸载
- [x] 试听 A4：任意页点击 Header「试听」发声，切音色后即时生效
- [x] 音量：滑块即时生效、刷新后保留、移动端可见
- [x] 调音器：授权麦克风后，弹奏吉他/尤克里里能识别最近弦并给出音分偏差与「偏低/偏高/准」指示
- [x] 自定义音：选定目标音后对照显示偏差
- [x] 权限拒绝时给出友好错误提示；切走 Tab 自动停麦
- [x] `npm run build`（tsc -b + vite build）通过

> 未做项：谐波 2 倍频取整优化（降低高音区倍频误判），后续如需可补充。
