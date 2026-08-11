# Ear Trainer · 音感训练

基于 Web Audio (Tone.js) 的音乐训练 Web 应用。

## 子项目

| 目录 | 说明 | 状态 |
|------|------|------|
| [`app-framework/PROMPT.md`](app-framework/PROMPT.md) | 整体网页框架构建提示 | ✅ 已完成 |
| [`ear-training/PROMPT.md`](ear-training/PROMPT.md) | 音感测试构建提示 | 📋 待实现 |

## 功能规划

- [x] 应用框架：Header + Tab 导航 + 占位页面
- [ ] 音感测试：音名 / 音程 / 和弦识别
- [ ] 演奏：步进音序器 + 打击垫 + 电子音色
- [ ] 调性识别（规划中）

## 开发

```bash
npm install
npm run dev       # 本地开发预览 (仅开发用)
npm run build     # 生产构建
```

## 部署

本项目是**纯静态站点**，所有音频在用户浏览器内合成，无需后端服务器。
通过 GitHub Actions 自动部署到 **GitHub Pages**，推送 `main` 分支即可触发。

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
