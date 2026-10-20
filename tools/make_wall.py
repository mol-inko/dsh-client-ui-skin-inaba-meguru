#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
照片墙生成器（发布版工具）

把 `assets/ref-char/` 里的巡的官方/自制 PNG 排成拍立得墙，输出两版到 `assets/`：
  assets/bg-wall-dark.webp   深色主题（深棕底 + 暖橙暗光）
  assets/bg-wall-light.webp  浅色主题（米白奶油底 + 暖光）

用法：
  python tools/make_wall.py            # 两版都生成
  python tools/make_wall.py dark       # 只生成深色版
  python tools/make_wall.py light      # 只生成浅色版

素材约定：把图放进 assets/ref-char/，文件名见 LAYOUT（找不到会跳过，允许少几张）。
输出尺寸 3200×2000（2× 逻辑画布，屏幕上 cover 显示时边缘清晰）。
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / 'assets' / 'ref-char'
OUT_DIR = ROOT / 'assets'
PREVIEW_DIR = Path(__file__).resolve().parent / '_preview'

# 2× 逻辑画布（16:9 窗口 cover 显示时基本是缩小，不糊）
SCALE = 2.0
CW, CH = int(1600 * SCALE), int(1000 * SCALE)
PAPER = (250, 246, 239)

# (文件名, 左上 x, 左上 y, 目标高度, 旋转角度) —— 逻辑坐标 1600×1000
LAYOUT = [
    ('c_644453bd973e3e94.png', 320, 105, 230, 6.0),    # 特写·围巾遮脸
    ('c_070c69eac9dd943c.png', 270, 395, 185, -5.0),   # 横版 CG·趴桌
    ('c_d556e701f1b8519f.png', 380, 660, 175, 3.8),    # 特写·脸红大脸
    ('c_07f95b7ea2de160c.png', 620, 145, 180, 5.5),    # 双人·粉底
    ('c_ba4fcae49f2c1d37.png', 620, 715, 165, -4.2),   # 横版 CG（压住上一张右缘）
    ('c_7cdcf9131b6d9725.png', 1085, 80, 250, -7.0),   # 半身·抱本子
    ('c_8aeedc952c08c285.png', 985, 400, 190, 5.0),    # 横版 CG·躺床
    ('c_5b3e366aec176559.png', 1120, 650, 225, -6.5),  # 特写·ガオー
]

PALETTES = {
    'dark': {
        'bg': (40.0, 27.0, 18.0),
        'glows': [
            (CW * 0.10, -0.02 * CH, max(CW, CH) * 0.9, (96.0, 48.0, 20.0)),
            (CW * 0.95, 0.04 * CH, max(CW, CH) * 0.75, (104.0, 66.0, 18.0)),
            (CW * 0.48, 1.10 * CH, max(CW, CH) * 1.0, (84.0, 32.0, 44.0)),
        ],
        'shadow': 0.42,
        'out': 'bg-wall-dark.webp',
        'preview': 'wall-dark-preview.png',
    },
    'light': {
        'bg': (247.0, 241.0, 232.0),
        'glows': [
            (CW * 0.12, -0.02 * CH, max(CW, CH) * 0.9, (255, 214, 170)),
            (CW * 0.93, 0.05 * CH, max(CW, CH) * 0.75, (255, 226, 176)),
            (CW * 0.48, 1.06 * CH, max(CW, CH) * 1.0, (255, 206, 214)),
        ],
        'shadow': 0.26,
        'out': 'bg-wall-light.webp',
        'preview': 'wall-light-preview.png',
    },
}


def base_canvas(palette) -> Image.Image:
    yy, xx = np.mgrid[0:CH, 0:CW].astype(np.float32)
    canvas = np.zeros((CH, CW, 3), np.float32)
    canvas[:] = palette['bg']
    for cx, cy, r, color in palette['glows']:
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
        a = np.clip(1.0 - d, 0.0, 1.0) ** 2.0 * 0.9
        canvas = canvas * (1.0 - a[..., None]) + np.array(color, np.float32) * a[..., None]
    return Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def polaroid(path: Path, target_h: int, angle: float) -> Image.Image:
    src = Image.open(path)
    if src.mode in ('RGBA', 'LA', 'P'):
        rgba = src.convert('RGBA')
        flat = Image.new('RGB', rgba.size, PAPER)
        flat.paste(rgba, (0, 0), rgba)
        im = flat
    else:
        im = src.convert('RGB')
    w0, h0 = im.size
    nw = max(1, round(w0 * target_h / h0))
    im = im.resize((nw, target_h), Image.LANCZOS)
    border = max(9, round(target_h * 0.032))
    im = ImageOps.expand(im, border=border, fill=PAPER)
    # 宝丽来：底边留一条宽的
    im = ImageOps.expand(im, border=(0, 0, 0, round(border * 1.7)), fill=PAPER)
    im = im.convert('RGBA')
    # 2× 超采样旋转：先放大再旋转再缩回，白边过渡只有半个像素宽
    ss = 2
    big = im.resize((im.width * ss, im.height * ss), Image.LANCZOS)
    big = big.rotate(angle, expand=True, resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    im = big.resize((max(1, big.width // ss), max(1, big.height // ss)), Image.LANCZOS)
    return im


def build(mode: str) -> int:
    palette = PALETTES[mode]
    canvas = base_canvas(palette)
    used = 0
    for name, x, y, h, angle in LAYOUT:
        p = REF / name
        if not p.exists():
            print('  skip (missing):', name)
            continue
        sx, sy, sh = round(x * SCALE), round(y * SCALE), round(h * SCALE)
        img = polaroid(p, sh, angle)
        shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
        shadow.putalpha(img.split()[3].point(lambda v: int(v * palette['shadow'])))
        canvas.alpha_composite(shadow, (sx + round(6 * SCALE), sy + round(9 * SCALE)))
        canvas.alpha_composite(img, (sx, sy))
        used += 1
    if used == 0:
        print(f'[{mode}] 一张都没贴上——先把图放进 assets/ref-char/')
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / palette['out']
    canvas.convert('RGB').save(out, 'WEBP', quality=92, method=6)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(PREVIEW_DIR / palette['preview'], 'PNG')
    print(f'[{mode}] {used} 张 -> {out} ({out.stat().st_size:,} bytes)')
    return 0


def main() -> int:
    modes = sys.argv[1:] or ['dark', 'light']
    if modes == ['both']:
        modes = ['dark', 'light']
    rc = 0
    for m in modes:
        if m not in PALETTES:
            print('unknown mode:', m, '(use dark | light)')
            return 2
        rc |= build(m)
    return rc


if __name__ == '__main__':
    sys.exit(main())
