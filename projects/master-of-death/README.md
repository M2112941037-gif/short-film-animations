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
- 全部在云端完成：云端写代码、云端渲染，视频直接发到对话窗口。
- 仓库只放代码、剧本、参考图和字体。渲染结果放在 `out/`（不进仓库）。
- 做完一个有意义的节点就发中间稿，导演可以随时插话。
- 对话太长时开新会话接着做；本文件就是交接说明，新会话先读它。

**省 token / 渲染**
- 渲染在后台跑，本身不耗 token。耗 token 的是：对话长度、写代码、看图。
- 小改动（颜色、亮度、强弱）改完直接发，不自检。
- 大改动只看一张缩小的关键帧拼图来拦明显错误；细节由导演判断。
- 审看一律用半分辨率预览（`npm run preview`）；只有导演确认后才渲 1080p 终版。
- 终版质量不打折扣。笔触每两帧更新一次（"一拍二"）可用于终版；导演若觉得影响观感，就改回逐帧。
- 镜头静止时，背景等不动的层只算一次、缓存复用。

**画面**
- 红/绿轮廓光只属于 SF01（死神持秤：伏地魔绿、哈利红），是为这个构图专门设计的，别的镜头不用。
- 死神无面，兜帽里只有深黑；压迫镜头时帽沿散出幽幽黑气。
- 不出现可见的光源点或光斑；光以轮廓光、顶光的形式出现，光源藏在画外或物体背后。
- 死神的光是头顶打下来的顶光，不是放射状的光。
- 笔触细腻、层叠，不能像色块。
- 哈利的特写和手要画成真实的人物（参考图右下角），不能是黑剪影。
- 哈利秤盘上的人（00:17 起一个个消失）和哈利一样是实体，画法与哈利一致；消失时安静淡出，不加粒子。
- 只有复活石发光召回的亡魂才是半透明、微微发光的，用特征认人。
- 雪就是雪，不用灰烬等替代。雪只用在剧本指定的时刻（穿过幻影、落在墓碑、复活石化雪、骷髅山化雪、覆盖老魔杖、结尾满屏白雪），不要提前挪作他用。
- 暂时不加片头片尾。
