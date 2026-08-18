# Ear Trainer · 音感训练

基于 Web Audio (Tone.js) 的音乐训练 Web 应用：音感测试（音名 / 音程 / 和弦 / 节奏）+ 训练场，纯前端、无后端，音频全部在浏览器内合成。

## 给贡献者的一句话速览

> 底部 5 个 Tab 页面**全部常驻挂载**、以 `hidden` 类显隐——切 Tab 不卸载组件，页面状态（测试进度、训练场勾选、节奏拼接图案等）切回即保留。这是本项目最重要的架构约定，改 `AppShell` 时务必保持。

### 核心架构

```
App (activePage state)
└─ AppDataProvider          # settings/records 全局状态（localStorage 持久化）
   └─ AppShell              # Header + 常驻挂载的 5 个页面(hidden 显隐) + 底部 Tab
      ├─ TestPage           # 测试：音高域 EarTrainingPage / 节奏域 RhythmTestPage
      ├─ TrainingGroundPage # 训练场：音高域 / 节奏域 RhythmGroundPage
      ├─ PlayPage           # 演奏：网格编辑器+播放（3/4 拍已开放，缩放、导出规划中）
      ├─ ProfilePage        # 个人中心：记录/评级/考察配置
      └─ SettingsPage       # 设置：主题/音色/播放方式/测试参数/节奏音色+BPM
```

- **双域模块**：测试与训练场内部用右上角 `SoundDomainToggle` 在「音高 🎵 / 节奏 🥁」两个子功能间切换，每页独立 `useState<SoundDomain>`、不持久化。
- **音频引擎**：`src/audio/engine.ts` 是唯一的音频入口（合成器/打击乐单例、音量、音色、播放方式配置），播放函数在 `playNotes.ts` 与 `rhythmPlay.ts`。Tone.js 要求先手势解锁——`ensureAudio()` 在每次用户点击时调用。
- **会话引擎**：`useGameSession` 是标准/限时/无限三种玩法的统一出题-判题-切题-结算引擎；`usePitchTrainer / useIntervalTrainer / useChordTrainer / useRhythmTrainer` 各自提供 `createQuestion + playQuestion`。
- **状态与持久化**：设置与最近记录存 `localStorage`，由 `AppDataContext` 统一读写；设置旧数据用 `{...DEFAULT, ...raw}` 合并自动补默认值（新增设置项时沿用此模式）。
- **理论数据**：`src/theory/` 下 `notes / intervals / chords / rhythm` 为纯数据与工具函数，无 UI 依赖。
- **设置如何生效**：`AppShell` 的 `useEffect` 把 `settings.theme/timbre/playbackMode/rhythmVoice` 同步到 `documentElement` 或音频引擎模块级状态；测试参数由 trainer hooks 实时读取。

### 目录速查

| 目录 | 职责 |
|------|------|
| `src/pages/` | 页面级组件（Tab 内容、双域容器） |
| `src/components/` | 通用组件（布局、选项网格、记谱渲染、结算界面等） |
| `src/hooks/` | 会话引擎与各 trainer hook（核心业务逻辑） |
| `src/audio/` | 音频：engine（单例/配置）+ playNotes + rhythmPlay |
| `src/theory/` | 音名/音程/和弦/节奏 数据与工具 |
| `src/constants/` | 玩法配置常量（题量/限时/反馈时长） |
| `src/context/` | 全局状态（settings/records） |
| `src/data/` | localStorage 读写 + 根音区间 + 评级 |
| `src/types/` | 全部类型定义（改动从这儿开始对齐） |

`app-framework/PROMPT.md`、`ear-training/PROMPT.md` 与 `play/PROMPT.md` 是分阶段构建的功能规格与设计决策文档，新功能追加时在其中记录（含 ✅ 已实现 标记），是理解现状的最佳入口。

## 功能规划

- [x] 应用框架：Header + Tab 导航 + 常驻挂载页面
- [x] 音感测试：音名 / 音程 / 和弦识别（标准 / 限时 / 无限 三种玩法，支持音频播放）
- [x] 测试 / 训练场 双域模块：右上角音高🎵/节奏🥁 滑动切换
- [x] 节奏测试：10 种预制节奏型组合成完整 4/4 小节听辨 + 记谱选项（播放一遍、无参照拍）
- [x] 节奏训练场：音符值拼接构建器（总时值 ≤ 一个小节）+ 记谱预览 + 播放
- [x] 个人中心：最近记录 · 参与次数 · 评级 · 考察配置（根音区间/键位/音程/和弦池）
- [x] 训练场：自定义根音（音名+八度），点击音程/和弦即时发声，未勾选仅播放根音
- [x] 设置：页面风格 4 主题 · 音色 5 档 · 播放方式（同时/逐音上行）· 标准题量/限时时长 · 节奏音色（鼓/5 档 A4 乐音）· 速度 BPM（60–200 可自定义）
- [x] 演奏：网格多轨编辑器（纵=音高/横=时间、步进放置、多声部、起点起播，复用节奏型测试音色池）
- [ ] 演奏进阶：横纵轴缩放 · MP3/WAV 导出（规划中）
- [ ] 调性识别（规划中）

## 开发

```bash
npm install
npm run dev       # 本地开发预览 (仅开发用)
npm run build     # tsc -b && vite build（提交前必须通过）
```

## 贡献约定

- **分支与提交**：提交信息沿用现有风格——`feat:` / `fix:` 前缀 + 简洁中文描述（如 `feat: 节奏音色可调+A4乐音`）。
- **改动自检**：改完跑 `npm run build`（含 `tsc -b` 类型检查），并本地 `npm run dev` 冒烟验证再提交。
- **保持常驻挂载**：新增/修改页面渲染时，不得改成条件卸载——一律通过 `hidden` 类显隐，否则会破坏「切 Tab 保留状态」。
- **设置项兼容**：`UserSettings` 新增字段须给 `DEFAULT_SETTINGS` 默认值，靠合并逻辑自动兼容旧存档。
- **记录设计决策**：重要实现/取舍写入对应 `PROMPT.md` 的 ✅ 小节，方便后续贡献者对齐。

## 部署

本项目是**纯静态站点**，所有音频在用户浏览器内合成，无需后端服务器。
通过 GitHub Actions 自动部署到 **GitHub Pages**，推送 `main` 分支即可触发（`.github/workflows/deploy.yml`）。

在线地址（部署后生效）：
`https://<username>.github.io/ear-trainer/`

### 首次部署步骤

1. 在 GitHub 创建**公开**仓库 `ear-trainer`（免费版 Pages 需公开仓库）
2. 推送代码：`git remote add origin git@github.com:<username>/ear-trainer.git && git push -u origin main`
3. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
4. 推送后 Actions 自动构建部署，约 1 分钟生效

> 注意：`vite.config.ts` 中 `base: '/ear-trainer/'` 必须与仓库名一致。

## 技术栈

Vite · React 18 · TypeScript · Tailwind CSS 4 · Tone.js
