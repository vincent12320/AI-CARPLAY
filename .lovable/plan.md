# iSPACE 四模块升级方案

对当前车载 AI 助手界面做四处增强，全部为前端改造，不引入后端。

---

## 1. 音乐卡片 — 旋转黑胶唱片

文件：`src/components/cockpit/BottomCards/MusicCard.tsx` + `src/styles.css`

- 把左侧 14×14 的方形封面替换为黑胶唱片组件：
  - 深色圆形主体（`bg-neutral-900`），叠加同心圆细线模拟纹路（用 `repeating-radial-gradient`）。
  - 中心嵌入当前曲目封面（圆形裁切，约占直径 45%），中心点一个小圆孔。
  - 唱片右上方放一个静态唱针图标（SVG/lucide，固定旋转角度，不随唱片转）。
- 旋转动画：新增 `@keyframes vinyl-spin`（360° / 约 1.8s，匀速 linear，对应 ~33RPM 观感）。
  - 播放时加 `animation-play-state: running`，暂停时切到 `paused` —— CSS 会在当前角度平滑停住，不骤停归零。
- 尺寸与卡片高度适配（唱片直径约等于卡片内容高度，约 56–60px），整体风格偏网易云播放页。

## 2. 满意度反馈弹框 — 每三轮触发

文件：`src/stores/vpaStore.ts`、`src/components/cockpit/VPAPanel.tsx`、新增 `src/components/cockpit/FeedbackCard.tsx`

- store 新增：`roundCount`（已完成轮数）、`showFeedback`（是否展示反馈卡）、`feedbackThanks`（是否展示感谢语）及对应 actions。
- 计数逻辑：每次 AI 回复完整结束（`ask` 的 finally 中 pushMessage 之后）`roundCount += 1`；当 `roundCount` 达到 3 时置 `showFeedback = true`。
- 展示位置：在第 3 轮 AI 回答文字下方、间隔一行后渲染 `FeedbackCard`（位于聊天消息流末尾）。
- 卡片内容：标题「对本次回答是否满意？」+ 三按钮「😊 满意」「😞 不满意」「🕐 以后再说」。
- 交互：
  - 点击按钮触发。
  - 语音触发——反馈卡可见时，`startVoice` 的识别结果若命中「满意/不满意/以后再说」关键词，则当作反馈选择而非新对话。
- 选择「满意/不满意」→ 卡片替换为「感谢您的反馈！」，3 秒后自动消失；选择「以后再说」→ 直接收起、无感谢语。
- 反馈结束后 `roundCount` 归零，进入下一个三轮周期。
- 联动模块 4：选择「满意」后将 VPA 形态切到「开心态」数秒。

## 3. 推荐问题 — 大模型动态生成

文件：`src/lib/intent.ts`（重写 `suggestFollowups` 为异步 LLM 版）、`src/lib/llm.ts`、`src/components/cockpit/VPAPanel.tsx`、`src/stores/vpaStore.ts`

- 废弃固定池。每轮 AI 回答结束后，用「最近对话内容」作为上下文调用大模型，要求返回 4 条 JSON 推荐追问。
  - 有 `ai.apiKey` 时走真实模型（复用 `streamChat`/新增一次性 `complete` 调用，prompt 要求严格输出 JSON 数组）；无 key 时回退到一组与关键词相关的本地候选，保证可用。
  - 约束：与当前话题强相关、口语化、每条 ≤10 字。
- store 新增 `suggestionsLoading` 状态。生成期间在推荐区显示加载占位（骨架胶囊 + 脉冲动画），完成后淡入替换。
- 4 条推荐以胶囊按钮横向排列，容器 `overflow-x-auto` 支持左右滑动；点击后直接作为下一轮输入发送（复用现有 `ask`）。

## 4. VPA 形象 — 六形态动态切换

文件：`src/stores/vpaStore.ts`、`src/components/cockpit/VPAAvatar.tsx`、`src/styles.css`、`src/components/cockpit/VPAPanel.tsx`

- 扩展形态类型：`AvatarState` 由现有 3 态扩展为 6 态 `idle | thinking | speaking | happy | focus | default`：
  | 形态 | 视觉 | 场景 |
  |---|---|---|
  | 待机态(idle) | 缓慢呼吸光晕、眼神柔和 | 无交互 |
  | 思考态(thinking) | 眉头微皱、眼球上移、齿轮/波纹动效 | 生成回答中 |
  | 说话态(speaking) | 嘴部波形律动、表情活跃 | 语音/文字播报 |
  | 开心态(happy) | 眼睛弯月上扬、光晕扩散 | 反馈满意后 |
  | 专注态(focus) | 眼神锐利、蓝色高亮边框 | 导航/任务执行 |
  | 默认态(default) | 现有样式 | 通用 |
- 自动轮播：非交互（无生成、无语音、无反馈）状态下，每 10 秒按顺序切换形态，过渡用 300ms 淡入淡出。
- 交互优先：开始生成→thinking；播报→speaking；满意反馈→happy；触发导航/车控意图→focus 数秒；交互结束后恢复自动轮播。
- 在 `VPAAvatar.tsx` 中按形态渲染不同眼睛/嘴/光晕/边框，新增对应 keyframes（呼吸光晕、齿轮转、波形、focus 边框辉光）到 `styles.css`。

---

## 技术说明

- 全部改动限定在前端组件 / Zustand store / CSS，无新依赖、无后端。
- 推荐问的 LLM 调用沿用现有「浏览器直连用户配置端点」机制；未配置 key 时自动回退本地候选，保证演示可用。
- 语音关键词识别复用现有 `getRecognizer`，仅在反馈卡可见时增加一层关键词分支判断。
- 形态轮播用单个 `setInterval`（10s）+ React state，组件卸载时清理。
