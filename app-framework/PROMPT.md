# 整体网页框架 — 构建提示

## 目标

构建一个音乐训练 Web 应用的骨架框架，支持多页面 Tab 切换，预留演奏和音感测试等功能的挂载点。

## 技术栈

- **构建工具**: Vite 6
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS 4（`@tailwindcss/vite` 插件）
- **音频**: Tone.js
- **部署**: GitHub Pages

## 初始化步骤

### Step 1: 创建 Vite 项目

```bash
npm create vite@latest ear-trainer -- --template react-ts
cd ear-trainer
npm install
```

### Step 2: 安装依赖

```bash
npm install tone
npm install -D tailwindcss @tailwindcss/vite
```

### Step 3: 配置 Tailwind

在 `vite.config.ts` 中引入 tailwindcss 插件。
在 `src/index.css` 中使用 `@import "tailwindcss"` + `@theme` 定义主题变量。
全局使用暗色主题（slate 色系），背景 `bg-slate-950`，文字 `text-slate-100`。

### Step 4: 配置 GitHub Pages

`vite.config.ts` 中设置 `base: '/ear-trainer/'`（替换为实际仓库名）。

## 项目结构

```
ear-trainer/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Tailwind 导入 + 主题 + 组件类
│   ├── vite-env.d.ts
│   ├── audio/
│   │   └── engine.ts          # Tone.start() 封装 + 全局 Synth
│   ├── components/
│   │   ├── AppShell.tsx       # 主布局: Header + Tab + 内容区
│   │   └── PlaceholderPage.tsx
│   ├── pages/
│   │   ├── EarTrainingPage.tsx  # 音感测试挂载点
│   │   ├── PlayPage.tsx         # 占位: "演奏 — 开发中"
│   │   └── SettingsPage.tsx     # 占位: "设置 — 开发中"
│   └── types/
│       └── index.ts           # PageId / PageDef 等类型
```

## 组件规格

### AppShell

- 顶部 Header: 应用名称 "🎵 Ear Trainer · 音感训练"，右侧音量滑块（预留）
- 内容区 `<main>`: flex-1, overflow-y-auto，根据 `activePage` 渲染对应 Page
- 底部 Tab 栏: 3 个按钮
  - "音感测试" (默认激活, 可用)
  - "演奏" (disabled, 灰色, 标记"开发中")
  - "设置" (disabled, 灰色, 标记"开发中")
- Tab 使用 `useState<PageId>` 管理当前激活页
- 点击 disabled 的 Tab 无反应

### 各占位 Page

- 居中显示图标 + 标题 + 副标题
- EarTrainingPage: 正常显示标题 + 内容占位（后续由 ear-training 子项目填充）

## 音频引擎 (src/audio/engine.ts)

```ts
import * as Tone from 'tone'

let synth: Tone.Synth | null = null
let started = false

export async function ensureAudio() {
  if (!started) {
    await Tone.start()
    started = true
  }
}

export function getSynth(): Tone.Synth {
  if (!synth) {
    synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 1 }
    }).toDestination()
  }
  return synth
}
```

## CSS 规范 (src/index.css)

- `@theme` 定义表面/强调/正确/错误色系
- `@layer components` 提供 `.panel`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-disabled`, `.tab-button` 组件类
- 注意: Tailwind v4 的 `@apply` **不能**引用自定义组件类，须直接展开完整工具类
- 全局暗色滚动条 + 文本选区样式

## 验收标准

- [ ] `npm run dev` 启动成功
- [ ] 页面显示 Header + 底部 Tab 栏
- [ ] 默认在"音感测试" Tab
- [ ] 点击 disabled Tab 无反应
- [ ] 点击 Tab 可切换页面
- [ ] `npm run build` 成功
- [ ] 控制台无 Tone.js 报错
- [ ] 暗色主题视觉效果正常
