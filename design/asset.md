# LetterFall — 素材 Gemini 提示词

游戏风格：**baby 向蜡笔画风**，色彩饱满温暖，粗线条，可爱圆润，适合 0–4 岁幼儿。
画布尺寸：1280 × 720px。

---

## 1. 背景 `background.png`

**用途**：游戏主背景，横向无缝平铺滚动（tileSprite）。  
**尺寸**：1280 × 720px，左右边缘必须无缝衔接。

```
A seamlessly horizontally-tiling background illustration for a baby alphabet game, crayon art style.

Scene: a bright cheerful daytime sky with soft pastel blue gradient. Puffy white cartoon clouds with thick crayon outlines float at various heights. In the distance, rolling green hills with simple crayon-drawn wildflowers (daisies, tulips) in yellow, red, and pink. A large smiling yellow sun peeks from the upper-left with radiating rays. A colorful rainbow arcs gently across the upper-center. Small cartoon birds (simple V-shapes) dot the sky.

Style: children's crayon drawing, thick black outlines (4–6px), saturated warm colors, flat shading with slight texture grain resembling wax crayon strokes. No photorealism. No gradients — flat color blocks with crayon texture overlay.

The left and right edges must tile seamlessly (same sky, same horizon line). No text, no letters. Pure background illustration.

Resolution: 1280×720px, PNG.
```

---

## 2. 炮台精灵表 `cannon.png`

**用途**：玩家控制的发射器，底部居中，3 帧动画（待机 → 开炮 → 后坐）。  
**尺寸**：528 × 96px（每帧 176 × 96px，横向排列 3 帧）。

```
A sprite sheet of a cute baby toy cannon for a children's alphabet game, crayon art style. Horizontal layout, exactly 3 frames side by side, each frame 176×96 pixels (total 528×96px).

The cannon is a chubby, round, friendly toy cannon that looks like a children's wooden toy. It sits on a small wheeled cart with big round red wheels. The cannon barrel is a short fat tube with a star painted on it, pointing straight up.

Frame 1 (idle): Cannon sitting still, barrel pointing up-left at ~70°. Small sparkles around the barrel tip. The cannon body is yellow with blue polka dots.
Frame 2 (firing): Barrel recoils slightly, a burst of colorful stars and a small "POP!" effect explodes from the barrel tip. The wheels bounce slightly.
Frame 3 (recoil return): Barrel settling back, a small puff of smoke (white fluffy cloud) exits the barrel. Expression is happy.

Style: crayon drawing with thick black outlines, bold flat colors (yellow body, red wheels, blue accents), slight wax texture. Transparent background (PNG alpha). No text.

Resolution: 528×96px PNG with transparency.
```

---

## 3. 子弹 `bullet.png`

**用途**：发射出的子弹，快速向上飞。  
**尺寸**：40 × 40px，透明背景。

```
A single cute projectile icon for a baby alphabet game, crayon art style.

Design: a chubby five-pointed star shape, bright golden yellow (#FFD700) fill, thick black crayon outline (3px), small white highlight dot in the upper-right. The star has a happy baby face — two tiny dot eyes and a small curved smile drawn in the center with crayon lines. Surrounded by tiny sparkle dots (4 small 4-pointed stars in pink, blue, and green).

Style: crayon drawing, thick outlines, saturated color, flat shading. The star feels chunky and friendly, like a sticker.

Transparent background, centered in frame.

Resolution: 40×40px PNG with transparency.
```

---

## 4. 粒子 `particle.png`

**用途**：击中字母时爆炸粒子特效（大量发射）。  
**尺寸**：16 × 16px，透明背景。

```
A single tiny sparkle particle for a particle explosion effect in a children's game, crayon art style.

Design: a small 4-pointed starburst / sparkle shape, pure white (#FFFFFF) with a soft yellow-white glow halo. Thick crayon-style cross shape with tapered ends. Simple and clean.

Transparent background, perfectly centered.

Resolution: 16×16px PNG with transparency.
```

---

## 5. 草地地面条 `ground.png`

**用途**：底部地面装饰条，覆盖在背景上方，作为炮台站立的地面。  
**尺寸**：1280 × 120px，透明背景（顶部透明渐入）。

```
A decorative ground strip for the bottom of a baby alphabet game screen, crayon art style.

Design: a lush bright green grass strip. The top edge is a wavy/bumpy grass silhouette with individual grass blades drawn in crayon style. Scattered along the grass: tiny colorful flowers (red, yellow, pink tulips and daisies), small round mushrooms with white dots, and a few tiny butterflies. The grass fades to transparent at the very top (gradient alpha). The bottom is a solid strip of dark green earth.

Style: thick crayon outlines, saturated greens (#6BCB77 to #2D9E45), flat color blocks with wax crayon texture. Horizontally repeating design that tiles seamlessly.

Transparent top edge, solid bottom.

Resolution: 1280×120px PNG with transparency at the top.
```

---

## 6. 游戏 Logo `logo.png`

**用途**：开始界面标题 Logo。  
**尺寸**：600 × 200px，透明背景。

```
A game title logo for "LetterFall", a baby alphabet learning game, crayon art style.

Text: "LetterFall" in a chunky, rounded, playful hand-drawn crayon font. Each letter is a different bright color (red, orange, yellow, green, blue, purple — cycling through the rainbow). Every letter has a thick black outline (5px) and a white inner glow.

Decorations around the text: falling alphabet letters (A, B, C, D in small sizes) tumbling and rotating around the main title. Small stars, hearts, and sparkles scattered throughout. A tiny smiling star sits on the "L" like a crown.

Background: fully transparent.

Style: crayon/chalk lettering, thick outlines, bold saturated rainbow colors, slight shadow drop for depth. Feels like it was drawn by a happy child with crayons.

Resolution: 600×200px PNG with transparency.
```

---

## 7. 星星图标 `star.png`

**用途**：分数显示用的星星图标（替换 emoji ⭐）。  
**尺寸**：48 × 48px，透明背景。

```
A single cute gold star icon for a score display in a baby game, crayon art style.

Design: a chubby five-pointed star, warm golden yellow (#FFD93D) fill with an orange (#FF9F43) shaded bottom half, thick black crayon outline (4px), white highlight crescent in the upper-left. The star has a tiny happy face: two small black dot eyes and a cute curved smile. No text.

Style: crayon drawing, chunky and round proportions, flat shading, slight wax texture.

Transparent background, centered.

Resolution: 48×48px PNG with transparency.
```

---

## 8. 火焰连击图标 `combo-fire.png`

**用途**：连击（combo）计数器旁的装饰火焰。  
**尺寸**：48 × 64px，透明背景。

```
A cute cartoon fire flame icon for a combo counter in a baby alphabet game, crayon art style.

Design: a single chubby flame shape with three layers — outer flame in bright orange (#FF6B35), middle in golden yellow (#FFD93D), inner core in white. The flame has a simple happy face drawn in the center: two round dot eyes and a big open smile. The base of the flame has a small red-orange glow ring. The outline is a thick black crayon stroke (4px).

Style: crayon drawing, round and friendly, no sharp edges. The flame looks like it was drawn by a child — wobbly, thick outlines, bold saturated colors.

Transparent background.

Resolution: 48×64px PNG with transparency.
```

---

## 素材清单汇总

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `background.png` | 1280×720 | 背景，横向无缝滚动 |
| `cannon.png` | 528×96 | 炮台精灵表，3帧动画 |
| `bullet.png` | 40×40 | 子弹 |
| `particle.png` | 16×16 | 爆炸粒子 |
| `ground.png` | 1280×120 | 底部草地装饰条 |
| `logo.png` | 600×200 | 开始界面 Logo |
| `star.png` | 48×48 | 分数星星图标 |
| `combo-fire.png` | 48×64 | 连击火焰图标 |

所有素材统一保存至 `public/assets/`。
