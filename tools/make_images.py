#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单张图片素材生成器（发布版工具）

用法：
  python tools/make_images.py hero  <立绘.png>    # -> assets/art-hero.webp（满屏档立绘，透明底）
  python tools/make_images.py cg    <CG.png>      # -> assets/bg-cg.webp（官方 CG 底图）
  python tools/make_images.py face  <立绘.png>    # -> assets/face.webp（圆形头像，同时更新 icon.png）

face 默认从**顶部中央**裁正方形（头部通常在上方），
如果裁偏了，用 `--crop 左,上,宽,高` 手动指定（相对原图像素）。
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets'

HERO_HEIGHT = 1400     # 显示高度 ~820px，留 2x 余量
CG_WIDTH = 1416        # 与官方 CG 原始宽一致
FACE_SIZE = 256
FACE_INNER = 244


def save_webp(im: Image.Image, path: Path, quality: int, alpha_quality: int = 92):
    path.parent.mkdir(parents=True, exist_ok=True)
    kwargs = dict(quality=quality, method=6)
    if im.mode == 'RGBA':
        kwargs['alpha_quality'] = alpha_quality
    im.save(path, 'WEBP', **kwargs)
    print(f'-> {path.name}: {path.stat().st_size:,} bytes, {im.width}x{im.height}, {im.mode}')


def make_hero(src: Path):
    im = Image.open(src).convert('RGBA')
    h = min(HERO_HEIGHT, im.height)
    w = max(1, round(im.width * h / im.height))
    im = im.resize((w, h), Image.LANCZOS)
    save_webp(im, ASSETS / 'art-hero.webp', quality=86, alpha_quality=92)


def make_cg(src: Path):
    im = Image.open(src).convert('RGB')
    w = min(CG_WIDTH, im.width)
    h = max(1, round(im.height * w / im.width))
    im = im.resize((w, h), Image.LANCZOS)
    save_webp(im, ASSETS / 'bg-cg.webp', quality=86)
    print('（若 CG 是横版构图，这个尺寸就能直接当底图用）')


def radial_warm_bg(size: int) -> Image.Image:
    """圆形暖底：从 #FFFDF9 中心到 #FFD3A6 边缘（复刻官方版头像底）。"""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    cx, cy = size * 0.38, size * 0.24
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (size * 0.84)
    t = np.clip(dist, 0.0, 1.0)

    def lerp(a, b, k):
        return np.array(a, np.float32) * (1 - k[..., None]) + np.array(b, np.float32) * k[..., None]

    # 0% #FFFDF9 -> 58% #FFEBD5 -> 100% #FFD3A6
    k1 = np.clip(t / 0.58, 0.0, 1.0)
    col1 = lerp((255, 253, 249), (255, 235, 213), k1)
    k2 = np.clip((t - 0.58) / 0.42, 0.0, 1.0)
    col = col1 * (1 - k2[..., None]) + np.array((255, 211, 166), np.float32) * k2[..., None]
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def circular_mask(size: int) -> Image.Image:
    """抗锯齿圆形遮罩（4x 超采样）。"""
    ss = 4
    big = Image.new('L', (size * ss, size * ss), 0)
    ImageDraw.Draw(big).ellipse(
        [0, 0, size * ss - 1, size * ss - 1], fill=255,
    )
    return big.resize((size, size), Image.LANCZOS)


def make_face(src: Path, crop=None):
    im = Image.open(src).convert('RGBA')
    if crop:
        left, top, w, h = crop
        im = im.crop((left, top, left + w, top + h))
    else:
        # 顶部中央正方形：宽度取 55%（对齐原版从 3.png 裁 404/734 的比例），保证头肩都进来
        side = max(1, round(im.width * 0.55))
        left = (im.width - side) // 2
        im = im.crop((left, 0, left + side, side))
        print(f'face 自动裁切: 顶部中央 {side}x{side}（裁偏了用 --crop 左,上,宽,高）')

    face = im.resize((FACE_INNER, FACE_INNER), Image.LANCZOS)
    canvas = radial_warm_bg(FACE_SIZE)
    pad = (FACE_SIZE - FACE_INNER) // 2
    canvas.alpha_composite(face, (pad, pad))

    mask = circular_mask(FACE_SIZE)
    canvas.putalpha(mask)
    save_webp(canvas, ASSETS / 'face.webp', quality=88, alpha_quality=95)
    # 顺手更新插件图标（可选，无版权风险的是这张圆形头像本身）
    canvas.save(ROOT / 'icon.png', 'PNG')
    print('-> icon.png: 已同步')


def main() -> int:
    args = [a for a in sys.argv[1:]]
    crop = None
    if '--crop' in args:
        i = args.index('--crop')
        crop = tuple(int(x) for x in args[i + 1].split(','))
        args = args[:i] + args[i + 2:]

    if len(args) < 2:
        print(__doc__)
        return 2
    kind, src = args[0], Path(args[1])
    if not src.exists():
        print('source not found:', src)
        return 1

    if kind == 'hero':
        make_hero(src)
    elif kind == 'cg':
        make_cg(src)
    elif kind == 'face':
        make_face(src, crop)
    else:
        print('unknown kind:', kind, '(hero | cg | face)')
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
