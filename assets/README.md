# 官方图素材 — 不入库（用户自备）

把图放进本目录，然后跑 `tools/` 下的生成脚本。

## 照片墙（8 张，放 `ref-char/`）

`tools/make_wall.py` 按固定文件名读取，缺的会跳过（可以少几张）：

| 文件名 | 内容 |
|---|---|
| `c_644453bd973e3e94.png` | 特写 · 围巾遮脸 |
| `c_070c69eac9dd943c.png` | 横版 CG · 趴桌 |
| `c_d556e701f1b8519f.png` | 特写 · 脸红大脸 |
| `c_07f95b7ea2de160c.png` | 双人 · 粉底 |
| `c_ba4fcae49f2c1d37.png` | 横版 CG |
| `c_7cdcf9131b6d9725.png` | 半身 · 抱本子 |
| `c_8aeedc952c08c285.png` | 横版 CG · 躺床 |
| `c_5b3e366aec176559.png` | 特写 · ガオー |

## 单张素材（文件名固定）

| 输出 | 来源 | 命令 |
|---|---|---|
| `bg-wall-dark.webp` / `bg-wall-light.webp` | `ref-char/` 8 张 | `python tools/make_wall.py` |
| `art-hero.webp` | 立绘（透明底） | `python tools/make_images.py hero <立绘.png>` |
| `bg-cg.webp` | 横版 CG | `python tools/make_images.py cg <CG.png>` |
| `face.webp` | 立绘（裁头部） | `python tools/make_images.py face <立绘.png>` |

素材缺失时插件不会崩：对应层自动降级成纯渐变背景。

> 版权提醒：官方立绘 / CG 版权归柚子社，本仓库不包含任何素材。请使用你自己合法拥有或有权使用的图片，仅限个人使用。
