# iSPACE 智能座舱 UI 构建计划

构建一个 1280×800 横屏沉浸式智能座舱界面，磨砂玻璃风格，核心交互为 VPA 助手。

## 一、文件结构

```text
src/
├── routes/
│   └── index.tsx                  # 主屏（全部布局入口）
├── components/cockpit/
│   ├── Wallpaper.tsx              # 全屏壁纸层
│   ├── TopStatusBar.tsx           # 顶部状态栏
│   ├── VPAPanel.tsx               # 中部 VPA 浮层卡片
│   ├── VPAAvatar.tsx              # 虚拟形象三态动画
│   ├── VPAMinimized.tsx           # 最小化悬浮球
│   ├── BottomCards/
│   │   ├── index.tsx              # 5卡片容器
│   │   ├── NavCard.tsx
│   │   ├── MusicCard.tsx
│   │   ├── VPABrandCard.tsx       # 含波形动画
│   │   ├── VehicleCard.tsx
│   │   └── CallCard.tsx
│   ├── HUDBar.tsx                 # 底部 HUD 控制栏
│   └── SettingsPanel.tsx          # 右侧滑入设置（5个 Tab）
├── stores/
│   ├── vpaStore.ts                # VPA 状态、对话、记忆
│   ├── settingsStore.ts           # AI/知识库/意图/人格配置（localStorage 持久化）
│   └── vehicleStore.ts            # 车辆模拟状态
├── lib/
│   ├── llm.ts                     # OpenAI 兼容流式调用
│   ├── dify.ts                    # Dify 知识库
│   ├── speech.ts                  # Web Speech API 封装
│   └── intent.ts                  # JSON 规则意图识别
└── styles.css                     # 设计令牌
```

## 二、设计系统（styles.css）

- 主色：`--brand: #4a9fd8`，`--success: #00C853`
- 玻璃卡片令牌：`--glass-bg: rgba(255,255,255,0.92)`、`--glass-blur: blur(20px)`
- 字体：Noto Sans SC（通过 `<link>` 加载）
- 圆角：卡片 16px，按钮 12px
- 动画：`transition-all duration-300`，卡片弹入 `scale-in/fade-in`

## 三、布局（index.tsx）

```text
┌──────────────────────────────────────────────┐
│ TopStatusBar (52px)                          │
├──────────────────────────────────────────────┤
│                                              │
│        VPAPanel (居中偏上，浮层)              │
│                                              │
├──────────────────────────────────────────────┤
│ BottomCards 5格 (110px)                      │
├──────────────────────────────────────────────┤
│ HUDBar (52px)                                │
└──────────────────────────────────────────────┘
  背景：Wallpaper（绝对定位 z-0）
```

所有 UI 层 `pointer-events-auto` 在玻璃卡片内，壁纸 `pointer-events-none`。

## 四、VPA 核心交互

**三种模式**（vpaStore 中 `mode: 'greeting' | 'chat' | 'intent'`）：
- greeting：大字问候 + 角色立绘 + CTA
- chat：左形象 + 右流式文本（打字机效果，逐字 setInterval）
- intent：2~3 个建议气泡

**虚拟形象三态**（VPAAvatar，CSS keyframes）：
- idle：轻微 translateY 悬浮
- listening：scale 脉冲 + 光环 ring
- speaking：眼睛/口型缩放

**语音输入**：`window.SpeechRecognition`（lang=zh-CN），降级为输入框
**LLM 流式**：fetch + ReadableStream 解析 SSE，token 推入 messages
**意图建议**：每次回复完成后调一次 LLM（或规则）生成 2~3 个 follow-up
**长期记忆**：localStorage 存 `{name, preferences, anniversaries}`，注入 system prompt

## 五、设置面板（右侧 Sheet）

5 个 Tab：
1. AI 连接：baseURL / apiKey / model / stream toggle
2. 知识库：Dify endpoint / apiKey / enabled
3. 意图识别：Monaco-less 简易 textarea JSON 编辑器 + 校验
4. 记忆管理：列表 + 删除 + 全部清除 + 启用开关
5. 人格设计：name / tone(select) / language / 形象（color picker）/ 问候模板

全部写入 settingsStore，持久化到 localStorage。**API Key 仅存本地**（用户自填）。

## 六、底部 5 个功能卡片

均为静态/本地状态演示（不联真实服务）：
- 导航：输入框 + 回家/公司按钮（toast 提示）
- 音乐：本地播放列表，封面用 `<img>`，上一首/暂停/下一首切换 index
- VPA 品牌卡：CSS 波形动画（10 条 div 高度变化），点击 setMode('chat')
- 车辆：useState 模拟 476km / 80%，绿色 progress
- 通话：绿色卡片，点击 toast

## 七、HUD 控制栏

纯展示 + 简单 useState（温度 24.5°、风速、锁车 toggle），lucide-react 图标。

## 八、技术细节

- Zustand for vpaStore / settingsStore / vehicleStore
- shadcn 用 Sheet（设置面板）、Button、Input、Card、Tabs、Toast
- 预览设备视口设为 1280×800
- 不接入 Supabase / 真实后端（所有 API 由用户在设置中自填，浏览器直连）
- 壁纸：使用 generate_image 生成默认雪山图，存 `src/assets/wallpaper-snow.jpg`

## 九、需要确认的点

1. **壁纸**：是否生成默认壁纸图（雪山/森林/海边各一张可切换），还是先用 CSS 渐变占位？
2. **音乐播放**：是否需要真实 `<audio>` 播放（需要素材）还是仅 UI 演示？
3. **VPA 虚拟形象**：用 CSS/SVG 绘制黑色圆形机器人，还是生成图片素材？
4. **默认 LLM**：是否在设置中预填 Lovable AI Gateway，让开箱即用（需启用 Cloud 拿 LOVABLE_API_KEY，并加一个 server function 代理流式）？还是完全留空让用户填 OpenAI 兼容地址？

回复后我会进入构建模式开工。