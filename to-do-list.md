# To-Do List

> 表述已按当前代码版本核实并重写；每条均标注现状（含文件位置）与目标行为，便于直接落地为方案。

## 1. 手稿默认命名 ✅ 已实现
- 现状：`src/constants/playConfig.ts` 中 `MANUSCRIPT_NAME_PREFIX = '新建手稿'`；`src/data/storage.ts` 的 `nextManuscriptName(manuscripts)` 取现有「新建手稿 / 新建手稿-N」最大序号 + 1，`PlayPage.handleSave` 新建条目时使用，保证默认名不重号。

## 2. Tab 界面合并
- 现状：`src/components/AppShell.tsx` `PAGES` 共 6 个 Tab：测试 / 训练场 / 调音 / 演奏 / 个人中心 / 设置（全部已启用）。
- 目标：将「训练场 / 调音 / 演奏」合并为一个 Tab「大厅」，底部 Tab 缩减为 4 个（测试 / 大厅 / 个人中心 / 设置）。
- 方案要点：需设计「大厅」页内子导航（三段式区块或页内切换），三页均为常驻挂载（沿用 hidden 显隐约定）；涉及 `PageDef` 结构、路由（`App.tsx`）、TunerPage 的 `active` prop 驱动、PlayPage 布局等联动改造，属较大重构，建议单独里程碑。

## 3. 网站命名
- 现状：Header 标题「Ear Trainer」，副标题「音感训练」；名称仅覆盖音感训练，未覆盖「调音 / 演奏」业务。
- 目标：按最终功能集合（音感训练 + 调音 + 演奏/创作）重新命名站点。
- 方案要点：命名需等 Tab 合并（第 2 项）功能定稿后统一确定；涉及 `AppShell` Header、`index.html` `<title>`、`README`、部署仓库名/描述，改动面小但需先定名。

## 4. UI 优化
### 4-1 演奏网格仅显示当前音轨音符 ✅ 已实现
- 实现：`src/components/PitchGrid.tsx` 的 `notes` memo 由 `tracks.flatMap`（全部轨叠加）改为仅取 `activeTrack.notes`（按当前轨索引配色，移除多轨白边高亮）；点击判定 `noteAtCell` 本就只查当前轨，行为现已一致。

### 4-2 网格自适应填充 + 最小宽度 + 布局回流
- 现状：网格尺寸刚性（`width = totalSteps × PLAY_CELL_W`），外层仅 `overflow-x-auto`，不随容器宽度拉伸；`PlayPage` 三栏均 `w-56` 固定宽（音轨 / 网格 / 手稿），窄屏三栏并排会严重挤压。
- 目标：
  a) 网格面板**占满**所在容器宽度（缩小时可横向滚动或等比缩放）；
  b) 容器存在**最小容忍宽度**，低于该宽度时「手稿」栏自动**换行至与音轨栏同一列**（两栏堆叠后手稿栏落到音轨下方或同侧）。
- 方案要点：`PitchGrid` 改为容器宽度约束下 `width: 100%` + 内部 `overflow-x-auto`（或 CSS `scale` 适配）；`PlayPage` 布局改响应式（`flex-wrap` + `min-w-[...]` 断点，参考现有 `sm:`/`lg:` Tailwind 断点），并配合第 6 项移动端适配统一处理。

## 5. 交互体验优化
### 5-1 调音麦克风检测测试
- 现状：`src/hooks/useTuner.ts` 已实现完整麦克风音高检测（开始/停止、实时读数、权限错误提示），`TunerPage` 已有「开始检测 / 停止检测」。
- 需澄清：此条若指「麦克风功能本身」——已实现；若指**额外的麦克风输入测试/电平可视化**或**权限预检引导**，请补充具体预期后另立条目。

### 5-2 演奏点击发声预览 ✅ 已实现
- 实现：`src/audio/playSequence.ts` 新增 `previewPlayNote(voice, pitch)`（复用演奏音色池独立实例，鼓敲 C1、乐音按 MIDI 音高，短音 0.3s）。
  - a) `PitchGrid.handlePointerUp` 建音符后即时播放该音符音高（当前轨音色）；
  - b) `TrackList` 音轨色块改为可点击按钮，试听该轨音色，默认音高 A4（`PLAY_PREVIEW_MIDI = 69`，常量位于 `playConfig.ts`）；播放锁定期间禁用。

### 5-3 黑键个性化显示 ✅ 已实现
- 实现：新增设置 `blackKeyMode: 'sharp' | 'flat'`（`UserSettings`，默认升号），个人中心「黑键显示方式」单选切换；`theory/notes.ts` 的 `formatNoteName(note, mode)` 仅作用于展示层（内部始终用升号规范名，播放/判题不受影响），覆盖：演奏网格音高标签、调音读数/自定义音/音名选择、训练场根音与音符、音感测试 pitch 选项与反馈。

## 6. 多端交互体验
- 现状：部分页面已有基础响应式（`AppShell` Tab 内边距、`TunerPage` 网格 `sm:grid-cols-6`），但 `PlayPage` 三栏固定宽（见 4-2）、网格交互依赖 `pointer` 拖拽（触屏需 `touch-none` 已加）。
- 目标：整体移动端适配。
- 方案要点：优先处理演奏页布局回流（4-2）；核查触屏拖拽/点击精度、参考音与播放的移动端自动播放限制、麦克风权限在移动浏览器（HTTPS + 安全上下文）的提示引导；建议以「演奏页 → 调音页 → 全局」顺序推进。
