---
title: 如何用AI来定制Minecraft皮肤
published: 2026-09-01
description: 试图让生图模型直接画 MC 皮肤失败后，我换了个思路：让大模型写代码来逐像素生成。记录整个折腾过程和踩的坑。
image: ""
tags:
  - Minecraft
  - AI
  - Python
  - LoveLive
category: 技术分享
draft: false
lang: ""
---

> 在今年年初的时候，Nana Banana 2 模型爆火，我就在想要怎么让 AI 生成 MC 中的人物皮肤。简单尝试几次效果不堪后就放弃了。最近群友开了个 MC 服务器，我就又想到了这件事，遂写下这篇文章。

# 生图模型画不了 MC 皮肤

我知道大部分人看到"AI 画皮肤"第一反应是 Stable Diffusion 之类的扩散模型。我一开始也是这么想的，试了之后发现完全不行。原因很简单：

MC 皮肤是一张 **64×64 像素的 3D 模型贴图展开图**。它长这样：

![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/Steve.png)

这张图每一个像素的位置都是死的。头顶在哪、左脸在哪、右手背面在哪，全部由 Minecraft 的 UV 坐标严格规定。差一个像素，游戏里就会出现身体接缝裂开、手臂颜色错位之类的问题。

扩散模型擅长的是"画一张看起来像那么回事的图"，但它对坐标没有任何概念。让它画一张 64×64 的 UV 展开图，它不可能知道第 44 列第 20 行这个像素应该是右手手臂正面的左上角。

除此之外还有几个硬伤：

- **透明通道**：MC 皮肤有两层（Base + Overlay），Overlay 没画的地方必须是完全透明的（Alpha = 0）。生图模型输出的图片边缘一定会有半透明的抗锯齿像素，加载进游戏就是满身的黑色碎片。
- **Alex 瘦手臂**：Alex 模型的手臂只有 3 像素宽。3 像素和 4 像素的 Steve 模型在 UV 上的排列完全不一样，生图模型根本分不清。
- **左右不对称**：左手和右手在展开图上的位置完全不同，不是简单的镜像翻转。

所以最后我换了个思路：**不让 AI 画图，让 AI 写代码来画图**。

具体来说就是用大模型（在这次实践中主要是 Gemini）来理解角色设定、拆解服装结构、规划配色方案，然后输出 Python 脚本，用 Pillow 逐像素地把皮肤"写"出来。代码是确定性的，每个像素的坐标和颜色都精确可控，不会有任何 UV 错位或透明通道污染的问题。

# MC 皮肤的 UV 坐标速查

写代码之前得先搞清楚 64×64 皮肤的 UV 布局。这里整理一份 Alex（瘦手 3px）模型的坐标表，后面源码里的魔法数字全是从这来的：

| 部件 | Base 层 | Overlay 层 | 尺寸 |
| :--- | :--- | :--- | :--- |
| 头部 | `(0,0)-(31,15)` | `(32,0)-(63,15)` | 8×8×8 |
| 躯干 | `(16,16)-(39,31)` | `(16,32)-(39,47)` | 8×12×4 |
| 右臂 | `(40,16)-(53,31)` | `(40,32)-(53,47)` | 3×12×4 |
| 左臂 | `(32,48)-(45,63)` | `(48,48)-(61,63)` | 3×12×4 |
| 右腿 | `(0,16)-(15,31)` | `(0,32)-(15,47)` | 4×12×4 |
| 左腿 | `(16,48)-(31,63)` | `(0,48)-(15,63)` | 4×12×4 |

有两个容易踩的坑：

1. **Alex 手臂的多余列**：右臂区域的第 54、55 列和左臂的第 46、47 列是未使用的，必须保持透明。一旦填了颜色，游戏里手臂会凭空多出一块色块。
2. **躯干侧面不能漏**：躯干的左右侧面（`16..19` 和 `28..31` 列，`20..31` 行）如果没有填色，角色侧身走路的时候胸口会直接透明穿帮。

# 踩坑记录：阴影怎么画？

这次做的是《Love Live!》西木野真姬的皮肤，过程中在"怎么画阴影"这个问题上来回折腾了好几轮。

## 棋盘格抖动——满屏马赛克

第一版用了像素画里常见的 dithering 手法，就是隔一个像素换一个颜色：

```python
if (x + y) % 2 == 0:
    color = dark_shade
else:
    color = light_shade
```

结果出来的效果像打了马赛克一样脏，放在二次元风格的皮肤上完全不能看。

![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/20260901085750.png)

## 一刀切纯色——塑料感拉满

把抖动去掉之后又走到了另一个极端：每个区域就填一个纯色。头发是一整块红，马甲是一整块紫，丝袜是一整块白。效果就像没有渲染过的裸模型，毫无立体感。

![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/20260901085813.png)

## 最终方案：参考现成高质量皮肤的做法

后来我找了几个做得很好的二次元 MC 皮肤来拆解（主要参考了虹咲学园系列和一个画得很好的真姬校服皮肤[西木野真姬-校服 - LittleSkin](https://littleskin.cn/skinlib/show/714937)），把它们的像素逐个提取出来分析配色逻辑，发现了几个关键点：

**头发是一簇非常接近的颜色。** 好的皮肤会用 4~6 个色相一样、明度差很小的颜色（RGB 差值大概 10~15 左右），成块成束地排布在头发区域，形成自然的发丝层次感。不是一个像素一个像素地交替（那就变成抖动了），而是几个相邻像素用同一个色阶，然后整体形成柔和的过渡。

**眼睛压缩到 2 行就够了。** 上面一行是深色眼线 + 瞳孔暗部，下面一行是浅色高光 + 虹膜亮部，两侧各留一个白色像素当眼白。

**衣服阴影跟着结构走。** 比如外套两侧边缘用深一号的颜色勾轮廓，中间偏亮；后背顺着脊柱中线稍微暗一点；裙子的褶皱用竖向的深浅交替来表现。

![[04_benchmark_reference_school_uniform.png]]

# 最终效果

按照上面摸索出来的规律，最后做了真姬的 KKS 打歌服皮肤，和参考的校服皮肤放在一起对比：

![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/05_kks_final_vs_benchmark.png)
*左：网上找到的参考皮肤 / 右：用代码生成的 KKS 打歌服*

除了 KKS 之外还顺手做了校服、仆今和 NBG 打歌服，四套放在一起：

![[06_all_four_maki_skins_showcase.png]]

# 完整源码

下面是生成 KKS 打歌服的完整 Python 脚本，只依赖 `Pillow`（`pip install pillow`），跑完会在当前目录生成一个 64×64 的 PNG 皮肤文件，可以直接导入游戏使用。

代码里的注释写得比较详细，配合上面的 UV 坐标表应该能看懂每一段在画什么。

```python
import os
from PIL import Image

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def hex_to_rgba(h, a=255):
    r, g, b = hex_to_rgb(h)
    return (r, g, b, a)

def generate_kks_skin(output_path="maki_kks_skin.png"):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0))

    # --- 调色板 ---
    # 头发：6 级红色色阶，从深到浅
    C_H0 = hex_to_rgba('#6a121e')
    C_H1 = hex_to_rgba('#821825')
    C_H2 = hex_to_rgba('#991f30')
    C_H3 = hex_to_rgba('#b0263b')
    C_H4 = hex_to_rgba('#c53247')
    C_H5 = hex_to_rgba('#d9435b')

    # 皮肤：从亮到暗
    C_SKIN_HIGH   = hex_to_rgba('#fffaf6')
    C_SKIN_BASE   = hex_to_rgba('#ffefeb')
    C_SKIN_SHADOW = hex_to_rgba('#fec9c6')
    C_SKIN_DEEP   = hex_to_rgba('#ebb2af')

    # 白色系（袖子、手套、丝袜）
    C_W_HIGH  = hex_to_rgba('#ffffff')
    C_W_BASE  = hex_to_rgba('#f4f6f9')
    C_W_SHADE = hex_to_rgba('#dbe1ea')
    C_W_DEEP  = hex_to_rgba('#bcc6d6')

    # 浅紫色系（马甲）
    C_L_HIGH  = hex_to_rgba('#d9b8fa')
    C_L_LIGHT = hex_to_rgba('#c59df4')
    C_L_BASE  = hex_to_rgba('#af85e7')
    C_L_MID   = hex_to_rgba('#996dd6')
    C_L_SHADE = hex_to_rgba('#8253c2')
    C_L_DEEP  = hex_to_rgba('#6a3da8')

    # 深紫色系（燕尾、领结）
    C_P_HIGH  = hex_to_rgba('#6a42cf')
    C_P_BASE  = hex_to_rgba('#532db6')
    C_P_MID   = hex_to_rgba('#411f99')
    C_P_DEEP  = hex_to_rgba('#2f1278')
    C_P_DARK  = hex_to_rgba('#1f0a57')

    # 黑色系（腰带、裙摆内衬）
    C_BLK_LINE  = hex_to_rgba('#1e1828')
    C_BLK_BASE  = hex_to_rgba('#282234')
    C_BLK_SHADE = hex_to_rgba('#171320')
    C_BLK_HIGH  = hex_to_rgba('#3a3248')

    # 金色纽扣
    C_GOLD_HIGH = hex_to_rgba('#f5d76e')
    C_GOLD_BASE = hex_to_rgba('#e1bd4e')

    # --- 头部 ---
    # 脸（Base 层正面 8..15, 8..15）
    for y in range(8, 16):
        for x in range(8, 16):
            im.putpixel((x, y), C_SKIN_BASE)
    # 嘴角两侧腮红
    im.putpixel((8, 15), hex_to_rgba('#ffd0cd'))
    im.putpixel((9, 15), hex_to_rgba('#ffd5d3'))
    im.putpixel((14, 15), hex_to_rgba('#ffd5d3'))
    im.putpixel((15, 15), hex_to_rgba('#ffd0cd'))

    # 紫色眼睛：y=12 眼线, y=13 瞳孔, y=14 高光
    im.putpixel((9, 12), hex_to_rgba('#242332'))
    im.putpixel((10, 12), hex_to_rgba('#242332'))
    im.putpixel((13, 12), hex_to_rgba('#242332'))
    im.putpixel((14, 12), hex_to_rgba('#242332'))

    im.putpixel((9, 13), hex_to_rgba('#a5a4b7'))
    im.putpixel((10, 13), hex_to_rgba('#392ea4'))
    im.putpixel((13, 13), hex_to_rgba('#392ea4'))
    im.putpixel((14, 13), hex_to_rgba('#a5a4b7'))

    im.putpixel((9, 14), hex_to_rgba('#ffffff'))
    im.putpixel((10, 14), hex_to_rgba('#9b93ea'))
    im.putpixel((13, 14), hex_to_rgba('#9b93ea'))
    im.putpixel((14, 14), hex_to_rgba('#ffffff'))

    # 后脑勺发丝（用色阶矩阵模拟自然发束）
    BACK_GRID = [
        [C_H2, C_H3, C_H2, C_H3, C_H2, C_H3, C_H4, C_H2],
        [C_H4, C_H4, C_H3, C_H2, C_H4, C_H4, C_H2, C_H3],
        [C_H4, C_H4, C_H2, C_H4, C_H3, C_H4, C_H2, C_H3],
        [C_H2, C_H4, C_H2, C_H4, C_H3, C_H2, C_H3, C_H2],
        [C_H3, C_H2, C_H3, C_H3, C_H4, C_H3, C_H3, C_H4],
        [C_H2, C_H4, C_H3, C_H2, C_H2, C_H4, C_H3, C_H3],
        [C_H2, C_H2, C_H2, C_H3, C_H4, C_H3, C_H3, C_H2],
        [C_H3, C_H2, C_H4, C_H3, C_H3, C_H0, C_H2, C_H4],
    ]
    for dy in range(8):
        for dx in range(8):
            im.putpixel((24 + dx, 8 + dy), BACK_GRID[dy][dx])
            im.putpixel((8 + dx, dy), BACK_GRID[dy][dx])

    # Overlay 层：头饰紫色玫瑰
    C_ROSE_HIGH = hex_to_rgba('#d9b8fc')
    C_ROSE_BASE = hex_to_rgba('#b084e8')
    C_ROSE_DARK = hex_to_rgba('#6533a3')
    C_RIBBON_B1 = hex_to_rgba('#261e33')
    im.putpixel((40, 8), C_ROSE_BASE)
    im.putpixel((41, 8), C_ROSE_HIGH)
    im.putpixel((40, 9), C_ROSE_DARK)
    im.putpixel((41, 9), C_ROSE_BASE)
    im.putpixel((42, 9), C_RIBBON_B1)
    im.putpixel((40, 10), C_RIBBON_B1)

    # --- 躯干 ---
    # 正面（20..27, 20..31）：领结 → 马甲 → 腰带 → 裙摆
    for y in range(20, 32):
        for x in range(20, 28):
            if y == 20:
                c = C_SKIN_HIGH if x in (23, 24) else (C_W_HIGH if x in (22, 25) else C_L_SHADE)
            elif y in (21, 22):
                c = C_P_HIGH if x in (23, 24) else (C_BLK_LINE if x in (22, 25) else C_L_BASE)
            elif y in (23, 24, 25):
                c = C_L_HIGH if x in (23, 24) else C_L_BASE
                if x in (20, 27): c = C_L_SHADE
                if x in (21, 26): c = C_BLK_LINE
                if x == 23 and y in (23, 25): c = C_GOLD_BASE
            elif y == 26:
                c = C_BLK_LINE if x in (21, 22, 25, 26) else C_BLK_BASE
            elif y in (27, 28):
                c = C_L_LIGHT if 22 <= x <= 25 else C_L_BASE
            elif y == 29:
                c = C_P_MID if x in (20, 23, 24, 27) else C_P_HIGH
            elif y == 30:
                c = C_W_HIGH if x in (21, 23, 24, 26) else C_W_BASE
            else:
                c = C_W_DEEP if x in (21, 26) else C_BLK_BASE
            im.putpixel((x, y), c)

    # 后背（32..39, 20..31）：披发 → 马甲后背 → 双燕尾
    for y in range(20, 32):
        for x in range(32, 40):
            if y < 23:
                im.putpixel((x, y), C_H3 if x in (34, 35, 36, 37) else C_H2)
            elif y < 26:
                im.putpixel((x, y), C_L_LIGHT if x in (34, 37) else C_L_BASE)
            elif y == 26:
                im.putpixel((x, y), C_BLK_BASE)
            else:
                if x in (35, 36): c = C_P_DARK if y >= 29 else C_P_DEEP
                elif x in (32, 39): c = C_P_DEEP
                else: c = C_P_HIGH if y in (28, 29) else C_P_BASE
                im.putpixel((x, y), c)

    # 侧面封边（防透明穿帮）
    for y in range(20, 32):
        for x in list(range(16, 20)) + list(range(28, 32)):
            im.putpixel((x, y), C_L_MID if y < 26 else (C_P_MID if y == 29 else C_BLK_BASE))

    # --- 手臂（Alex 3px）---
    # 右手
    for y in range(20, 32):
        for x in range(40, 54):
            if y <= 22:   c = C_W_HIGH if y == 21 else C_W_SHADE
            elif y <= 26: c = C_SKIN_HIGH if x in (45, 52) else C_SKIN_BASE
            elif y == 27: c = C_SKIN_SHADOW
            elif y == 28: c = C_P_HIGH if x in (45, 48) else C_P_MID
            else:         c = C_W_HIGH if x in (45, 52) else C_W_BASE
            im.putpixel((x, y), c)
    im.putpixel((43, 44), C_P_HIGH)
    im.putpixel((44, 44), C_P_BASE)
    im.putpixel((45, 44), C_P_HIGH)

    # 左手
    for y in range(52, 64):
        for x in range(32, 46):
            mod_y = y - 32
            if mod_y <= 22:   c = C_W_HIGH if mod_y == 21 else C_W_SHADE
            elif mod_y <= 26: c = C_SKIN_HIGH if x in (37, 44) else C_SKIN_BASE
            elif mod_y == 27: c = C_SKIN_SHADOW
            elif mod_y == 28: c = C_P_HIGH if x in (37, 40) else C_P_MID
            else:             c = C_W_HIGH if x in (37, 44) else C_W_BASE
            im.putpixel((x, y), c)
    im.putpixel((51, 60), C_P_HIGH)
    im.putpixel((52, 60), C_P_BASE)
    im.putpixel((53, 60), C_P_HIGH)

    # --- 腿部 ---
    for is_left in (False, True):
        x_front = range(20, 24) if is_left else range(4, 8)
        x_back  = range(28, 32) if is_left else range(12, 16)
        y_base  = 52 if is_left else 20

        for y_leg in range(12):
            y = y_base + y_leg
            # 正面：黑裙 → 大腿 → 袜口蕾丝 → 白丝 → 靴子
            for x in x_front:
                if y_leg in (0, 1): c = C_BLK_HIGH if (x % 2 == 0) else C_BLK_BASE
                elif y_leg == 2:    c = C_W_HIGH if x in (5, 21) else C_BLK_SHADE
                elif y_leg in (3, 4, 5): c = C_SKIN_HIGH if x in (5, 6, 21, 22) else C_SKIN_BASE
                elif y_leg == 6:    c = C_W_HIGH if x % 2 == 0 else C_W_SHADE
                elif y_leg in (7, 8, 9): c = C_W_HIGH if x in (5, 6, 21, 22) else hex_to_rgba('#f0f3f8')
                elif y_leg == 10:   c = C_P_HIGH if x in (5, 6, 21, 22) else C_BLK_BASE
                else:               c = hex_to_rgba('#181224')
                im.putpixel((x, y), c)

            # 背面：燕尾下延 → 大腿 → 白丝 → 靴子
            for x in x_back:
                if y_leg in (0, 1, 2): c = C_P_HIGH if x in (13, 14, 29, 30) else C_P_BASE
                elif y_leg in (3, 4, 5): c = C_SKIN_HIGH if x in (13, 14, 29, 30) else C_SKIN_SHADOW
                elif y_leg in (6, 7, 8, 9): c = C_W_HIGH if x in (13, 14, 29, 30) else hex_to_rgba('#f0f3f8')
                else: c = hex_to_rgba('#15101f')
                im.putpixel((x, y), c)

    im.save(output_path)
    print(f"皮肤已保存到 {output_path}")

if __name__ == "__main__":
    generate_kks_skin()
```

# 直接抄作业：发给多模态大模型的 Prompt 模板

如果你不想从零手写像素坐标，可以直接把下面的提示词模板复制下来，扔给网页端的 Gemini、Claude 或者 ChatGPT 等多模态大模型，让它直接帮你写 Python 脚本生成。

[!NOTE] 推荐使用像是Codex，Antigravity之类的Agent来进行生成
## 发送姿势

在网页端对话框里：
1. **上传图片 1**：你想生成的**角色人设立绘 / 动画截图 / 衣服设定图**（让模型提取服装特征和配色）。
2. **上传图片 2**（可选但强烈推荐）：一张你觉得**画风极好的现成二次元皮肤展开图**作为画风参考（让模型模仿其头发天使光圈、微明暗色阶排布和眼睛画法）。
3. **附上提示词**（直接复制下面这段）：

```text
你是一个顶级的 Minecraft 皮肤像素画专家与 Python Pillow 脚本生成器。
请根据我上传的【图 1 角色立绘/设定图】（以及【图 2 优秀画风参考图】），编写一段完整的 Python 脚本，使用 Pillow 库逐像素绘制一张 64x64 规格的 Minecraft Alex（Slim 3px 瘦手）高精度双层二次元人物皮肤。

【任务目标】
1. 分析图 1：精准提取该角色的发型发色、瞳色、服装结构与配饰细节，并在代码开头定义专属于该角色的多级微色阶调色板（例如头发需定义高光/基础/阴影/深暗 4~6 级渐变，服装各部件亦同）。
2. 学习图 2：模仿其柔和的二次元微光影过渡手法（拒绝粗暴的 (x+y)%2 棋盘抖动，采用成片成束的自然色阶与结构性阴影）。

【核心铁律：100% 杜绝 3D 浮空翅膀与畸形面部】
1. ★【严禁浮空翅膀与悬浮杂物】：
   - 严禁在手臂 Overlay 的 Y=32..35、Y=48..51 刷横线/色块！
   - 严禁在腿部 Overlay 的 Y=32..35、Y=48..51 刷横线/色块！
   - 严禁在躯干 Overlay 的侧肋（X=16..19 与 X=28..31）刷色！（否则腰部会突出一对浮空小翅膀）。
   - Overlay 外层必须默认全透明 (0,0,0,0)，只允许单点 `pixels[x, y]` 精准放置局部 3D 浮层（如刘海碎发、3D领结、立体发饰、裙檐）。
2. ★【Base 基础层严禁任何透明】：Base 层所有身体表面（包含顶面截面、手掌底、脚底板、裆部截面、躯干左右侧肋）必须 100% 填满实体像素（Alpha=255），绝对不可有透明漏色。
3. ★【二次元面部黄金比例（Face Front 8..15, 8..15）】：
   严禁露出光秃秃的大额头，Base 脸部必须有厚实的刘海自然垂落覆盖：
   - y=8: 发际线（全填角色基础发色）
   - y=9: 额头刘海（两侧为发色，中间为刘海受光色阶）
   - y=10: 额头碎发下沿（两侧垂下碎发，中间局部露肤色）
   - y=11: 眉毛与深色上眼线睫毛 (x=9,10 与 x=13,14)
   - y=12: 眼睛上半部 (右眼: x=9淡阴影眼白, x=10深瞳；左眼: x=13深瞳, x=14淡阴影眼白)
   - y=13: 眼睛下半部 (右眼: x=9纯白高光, x=10亮部虹膜；左眼: x=13亮部虹膜, x=14纯白高光)
   - y=14: 脸颊微粉腮红 (x=8,9 与 x=14,15) + 微笑唇线 (x=11,12)
   - y=15: 下巴与下颌微阴影 (x=11,12 肤色，两侧下颌阴影)
   - 头部 Overlay (40..47, 8..11) 3D 刘海：在中间与两侧错落点缀几根 3D 浮层发丝增加层次感。

【通用 64x64 UV 坐标映射指南】
1. 头部 (Head, 8x8x8):
- Base 顶面 (8..15, 0..7)：根据发色排布环形天使高光圈；底面/颈部 (16..23, 0..7)：填颈部阴影
- Base 侧面与背面：右侧(0..7, 8..15), 脸部(8..15, 8..15), 左侧(16..23, 8..15), 后脑勺(24..31, 8..15) ★后脑勺必须 100% 填满发色矩阵
- Overlay (发丝/发饰)：(32..63, 0..15)，若角色有头饰/发夹，在头顶或侧面对应位置绘制

2. 躯干 (Torso, 8x12x4):
- Base 顶截面/肩 (20..27, 16..19), 底截面/裆部 (28..35, 16..19) 100% 填实
- Base 左右侧肋：右肋(16..19, 20..31), 左肋(28..31, 20..31) ★必须填实防侧身穿帮
- Base 正面(胸前)：(20..27, 20..31) 根据立绘绘制领口、上衣、腰带、裙装或裤装
- Base 背面：(32..39, 20..31) 若角色为长发/披发，y=20..22 需画披发自然衔接后颈
- Overlay：仅在正面 (20..27, 37..47) 局部绘制 3D 浮层胸口饰品、外套下摆或立体裙边

3. Alex 瘦手臂 (Arm, 3x12x4):
- 右臂 Base：顶截面(44..46, 16..19), 手掌底(47..49, 16..19), 外侧(40..43, 20..31), 正面(44..46, 20..31), 内侧(47..50, 20..31), 背面(51..53, 20..31)。★第 54、55 列必须强制透明！
- 右臂 Overlay：仅在手腕/袖口正面 (44..46, 44) 局部点缀 3D 饰品。
- 左臂 Base：顶截面(36..38, 48..51), 手掌底(39..41, 48..51), 外侧(32..35, 52..63), 正面(36..38, 52..63), 内侧(39..42, 52..63), 背面(43..45, 52..63)。★第 46、47 列必须强制透明！
- 左臂 Overlay：仅在手腕/袖口正面 (36..38, 60) 局部点缀 3D 饰品。

4. 腿部 (Leg, 4x12x4):
- Base 顶截面/大腿根：右腿(4..7, 16..19), 左腿(20..23, 48..51) 填阴影色
- Base 底截面/鞋底：右腿(8..11, 16..19), 左腿(24..27, 48..51) 填鞋底色
- 右腿 Base：(0..15, 20..31)，正面(4..7, 20..31) 根据立绘绘制腿部、袜子与鞋靴
- 左腿 Base：(16..31, 52..63)，正面(20..23, 52..63)
- 腿部 Overlay：默认保持透明，严禁整行大面积刷色！

请直接输出一段语法完整、可直接运行并保存为 skin.png 的 Python 代码。
```

大模型吐出代码后，在本地 `python skin.py` 跑一下就能拿到生成的皮肤，拖进 Blockbench 或者游戏里看效果。如果觉得裙子短了、刘海长了或者颜色偏了，直接把跑出来的效果图截图丢回去让它微调对应行的坐标即可。

附上Web Gemini 生成效果：
![](https://cdn.jsdelivr.net/gh/luojisama/pic_bed@main/img/20260901094407.png)
# 写在最后

整个流程下来，核心思路其实就一句话：**别让 AI 画图，让 AI 写画图的代码**。

生图模型处理不了 UV 展开的刚性约束，但大模型写代码的时候是可以精确控制每个坐标的。配色和服装结构的设计交给大模型来理解和拆解，像素级的渲染交给 Python 来执行，各司其职。

至于阴影风格，踩完坑之后的经验就是：不要抖动，不要纯色，用同色系里差距很小的几个色阶成片地铺。64×64 的画布太小了，花里胡哨的技巧反而不如老老实实的柔和过渡好看。
