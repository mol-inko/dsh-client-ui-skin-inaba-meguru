# tools/ — 素材生成工具

插件仓库里**不含官方图**，这里是把「你自备的图」变成插件可用素材的脚本（Python 3.8+，需要 Pillow）。

## 一次性准备

```bash
pip install pillow numpy
```

## 步骤

1. 把官方图放进 `../assets/ref-char/`（文件名见 [`../assets/README.md`](../assets/README.md)）
2. 生成照片墙（深/浅两版）：
   ```bash
   python tools/make_wall.py          # 两版都生成
   python tools/make_wall.py light    # 只生成浅色版
   ```
3. 生成单张素材：
   ```bash
   python tools/make_images.py hero assets/ref-char/3.png    # 满屏档立绘
   python tools/make_images.py cg   assets/ref-char/c_070c69eac9dd943c.png  # 官方 CG 底图
   python tools/make_images.py face assets/ref-char/3.png    # 圆形头像（同时更新 icon.png）
   ```
4. 刷新 DSH 页面即可（图片走 `/inaba-meguru/assets/` 路由，**每次读盘、不用重启**）。

## 说明

- 全部脚本按**自身位置**定位文件，从任意目录运行都行。
- `make_wall.py` 的排版在 `LAYOUT` 列表里（8 张照片的坐标/大小/角度），想调布局改那里。
- `make_images.py face` 默认从图**顶部中央**裁正方形；裁偏了用 `--crop 左,上,宽,高`。
- 生成失败/缺图时插件不会崩：对应层降级成纯渐变背景。
