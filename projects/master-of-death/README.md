# 死亡的主人 · The Master of Death

Script: `master_of_death_script.md` · art reference: `public/reference/environment.png`

Everything on screen is drawn in code (Remotion + Canvas 2D). No image generation, no external art.

## How a frame is made

1. **Underpainting**: the vector scene (React SVG components in `src/characters`, `src/props`) is rasterized, and canvas-native passes add fog and cloth (`src/paint/canvas.ts`, `src/paint/death.ts`).
2. **Painting**: `src/paint/painter.ts` re-paints the underpainting with curved, multi-size brush strokes that follow the contours, with bristle streaks. This follows Hertzmann's layered painterly rendering.
3. **Overlays**: things that must stay sharp or read cleanly go on top: carved text, subtitles, falling snow, paper grain and vignette.

Death's robe is not a fixed shape. Its tattered tongues and smoke are traced through a curl-noise wind field (`src/paint/noise.ts`), so they move when `t` changes.

## Commands

```bash
npm install
npm run fonts                                   # 改过中文字幕后重新生成字体子集
npm run still -- SF01-Death out/stills/a.png    # 单帧（全分辨率）
npm run preview -- Opening out/preview.mp4      # 预览视频（半分辨率，快约 4 倍）
npm run render -- Opening out/final.mp4         # 终版视频（1080p）
```

## 项目规矩

**工作方式**
- 和导演交流一律用中文（导演看不懂英文）。
- 全部在云端完成：云端写代码、云端渲染，视频直接发到对话窗口。
- 仓库只放代码、剧本、参考图和字体。渲染结果放在 `out/`（不进仓库）。
- 做完一个有意义的节点就发中间稿，导演可以随时插话。
- 对话太长时开新会话接着做；本文件就是交接说明，新会话先读它。

**省 token / 渲染**
- 渲染在后台跑，本身不耗 token。耗 token 的是：对话长度、写代码、看图。
- 多段排队渲染用 `for` 串行执行；不要用 `pgrep -f`/`pkill -f` 等待或清理，它会匹配到自己的命令行。
- 小改动（颜色、亮度、强弱）改完直接发，不自检。
- 大改动只看一张缩小的关键帧拼图来拦明显错误；细节由导演判断。
- 审看一律用半分辨率预览（`npm run preview`）；只有导演确认后才渲 1080p 终版。
- 终版质量不打折扣。笔触每两帧更新一次（"一拍二"）可用于终版；导演若觉得影响观感，就改回逐帧。
- 镜头静止时，背景等不动的层只算一次、缓存复用。

**画面**
- **两条总原则**：① 表意要让观众看得明白，剧本里的关键事件（例如天秤倾斜、哪边变重）必须正面拍出来，不能只靠间接暗示；② 画面要漂亮、美观。
- 红/绿轮廓光只属于 SF01（死神持秤：伏地魔绿、哈利红），是为这个构图专门设计的，别的镜头不用。
- 死神无面，兜帽里只有深黑；压迫镜头时帽沿散出幽幽黑气。
- 不出现可见的光源点或光斑；光以轮廓光、顶光的形式出现，光源藏在画外或物体背后。
- 死神的光是头顶打下来的顶光，不是放射状的光。
- 笔触细腻、层叠，不能像色块。
- 哈利的特写和手要画成真实的人物（参考图右下角），不能是黑剪影。
- **人物画法**：块面塑形，不勾线（像死神、墓碑一样）；硬边明暗、暗面偏冷、亮面偏暖；头发是柔软下垂的大块发束，不能像刺猬；眼睛略大但两眼协调。参考 Wingfeather Saga 概念画的"感觉"，但保持冷色暗调、不 Q 版。
- **五官比例**：眼睛在头高一半处，两眼相距一只眼宽；鼻底在眼到下巴的中点；嘴在鼻底到下巴的上三分之一；耳在眉与鼻底之间。3/4 侧脸时中线偏向远侧、远眼略窄、鼻子不出脸廓。
- **主角细致、配角简化**：哈利（`HarryPaint`）、伏地魔细画；其他人（`Person`）用简化块面、简单眼睛。
- 全片风格统一：所有人物和场景都走同一套笔触管线（`Painted`）。
- 哈利秤盘上的人（00:17 起一个个消失）和哈利一样是实体，画法与哈利一致；消失时安静淡出，不加粒子。
- 只有复活石发光召回的亡魂才是半透明、微微发光的。与哈利互动的亡魂只有莉莉（细画，和哈利相视而笑）；其他亡魂围在哈利身边，只做虚化的暖光身影。
- 雪就是雪，不用灰烬等替代。雪只用在剧本指定的时刻（穿过幻影、落在墓碑、复活石化雪、骷髅山化雪、覆盖老魔杖、结尾满屏白雪），不要提前挪作他用。
- 走路：统一用 `characters/gait.ts` 的步态（支撑脚钉地、身体随步起伏、手脚反向摆），不要原地踏步。主角走路切成脚部特写（靴子压进雪、留脚印）+ 精细上半身；脚步声对准落脚帧。
- 暂时不加片头片尾。
