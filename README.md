# 因幡巡主题皮肤 · Inaba Meguru Skin

> DSH Web GUI 的一套纯展示层主题：活力橙 × 围巾金 × 校服粉、拍立得照片墙、满屏立绘、星屑装饰、侧栏小巡、Ciallo 台词，自带「设置 → 因幡巡」配置页。
> A pure presentational theme for the DSH Web GUI: polaroid photo wall, full-screen artwork, ambient decorations, a sidebar mascot and settings page.

**角色 / Character**: 因幡巡（いなば めぐる）· 柚子社《魔女的夜宴》 / Yuzusoft "Sanoba Witch"
**配色 / Palette**: 活力橙 `#EF7D33` · 围巾金 `#F2C14E` · 校服粉 `#F27B9E`

> ⚠️ **本仓库只包含代码，不含任何角色素材。** 图片需要你自己准备（见 [素材准备](#素材准备--assets)）。
> This repo contains **code only — no character artwork**. You bring your own images.

---

## ✨ 特性 / Features

| | |
|---|---|
| 🎚️ 三档出场强度 | 克制（边缘装饰）/ 标准（满屏底色）/ 满屏（立绘进场），随时切换 |
| 🖼️ 三种底图 × 深浅两版 | 照片墙（深色深棕墙 / 浅色米白墙各一套）、官方 CG、夜色渐变 |
| ⚙️ 原生设置页 | 「设置 → 因幡巡」改强度/底图/装饰/台词，点一下即生效 |
| 🌟 氛围装饰 | 星屑、光带、十字星芒、垂饰、蛋挞/手柄/爱心小物、侧栏小巡 |
| 💬 Ciallo 台词 | 输入框下方「Ciallo～(∠·ω< )⌒★」+ 侧栏小巡气泡 |
| 🧹 纯展示层 | 关闭插件即完全还原（CSS/标记/token/插槽一起撤） |
| 🖥️ 素材走同源路由 | 图片放 `assets/` 即用，不内嵌、不改包、刷新即生效 |

## 📦 安装 / Install

```bash
# DSH 0.2.x：本地目录安装
dsh plugin --profile web add /path/to/dsh-client-ui-skin-inaba-meguru
```

或在 DSH 会话里让 Agent 用 `plugin_manager` 的 `install_bundle` 装本地目录。

装完刷新页面 → 设置 → 因幡巡。**没有素材时也能装**：底图自动降级成纯渐变。

## 🎨 素材准备 / Assets

本仓库**不含**官方图（版权在柚子社）。你需要自备并生成：

```bash
pip install pillow numpy

# 1) 把图放进 assets/ref-char/（文件名对照见 assets/README.md）
# 2) 生成两版照片墙
python tools/make_wall.py
# 3) 生成立绘 / CG / 头像
python tools/make_images.py hero assets/ref-char/3.png
python tools/make_images.py cg   assets/ref-char/c_070c69eac9dd943c.png
python tools/make_images.py face assets/ref-char/3.png
```

生成的 5 个文件（`assets/*.webp`）已被 `.gitignore` 排除——**别把它们提交到仓库**。

```text
assets/
├── bg-wall-dark.webp    深色主题照片墙（3200×2000）
├── bg-wall-light.webp   浅色主题照片墙（3200×2000）
├── art-hero.webp        满屏档立绘（透明底）
├── bg-cg.webp           官方 CG 底图
└── face.webp            圆形头像
```

素材缺失时对应层自动降级成纯渐变，不会报错。

## ⚙️ 设置 / Settings

**设置 → 因幡巡**（`settings.section`，id `inaba-meguru`）：

| 项 | 取值 |
|---|---|
| 出场强度 | 克制 / 标准 / 满屏 |
| 底图 | 照片墙 / 官方 CG / 夜色 |
| 氛围装饰 | 开 / 关 |
| 台词 | 开 / 关 |

配置落在 `$DSH_HOME/inaba-meguru/config.json`，由 Host 路由 `/inaba-meguru/api` 读写（同源 cookie 鉴权）。

## 🔌 HTTP surface

| 路由 | 说明 |
|---|---|
| `GET /inaba-meguru/api` | 读外观配置 |
| `POST /inaba-meguru/api` | `{ action: 'save', patch }` / `{ action: 'reset' }` |
| `GET /inaba-meguru/assets/<name>` | 皮肤素材（白名单 5 个文件名，每次读盘） |

所有路由走宿主 `connection.requestRejection` 信任栅栏 + 插件自校验（回环 Host / 同源 Origin / 拒跨站）。

## 🧩 兼容 / Compatibility

- DSH **0.2.1-rc.2**（`settings.section` 插槽、`webServer.register` 的 `prefix` 路由）
- 可与其它皮肤（如 `ui-skin-maid-atelier`）并存：设置 → 插件里各占一行，开一个关另一个即可
- 客户端改动**刷新即生效**（宿主按需重建 client bundle）；`index.js` 改动需重启 host

## 🛠️ 开发 / Development

```text
index.js            Host 半：配置读写 + 素材路由（prefix）+ 三层鉴权
client.js           Client 半：CSS 主题 / 三档强度 / 两版底图 / 设置页 / 装饰层
cordis.patch.yml    bundle 挂载声明
assets/             素材（不入库，见上）
tools/              素材生成脚本（Pillow）
```

退出/卸载时所有写入挂在 `ctx.effect` 上自动撤销。

## 🙏 Credits

- 信任栅栏的三层结构参考自 [dsh-whale-widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（MIT）的「安全修复 S1」。
- 插件注册写法参考社区插件 `dsh-workflow-panel` 的 `apply()` 形状（不包 `ctx.effect`、直接返回 disposer）。

## ⚖️ 版权 / Legal

- **代码**：MIT（见 [LICENSE](LICENSE)）
- **素材**：不随仓库分发。「因幡巡」及《魔女的夜宴》美术版权归 **柚子社（Yuzusoft）** 所有；
  本项目为**同人非商业**作品，与柚子社、DeepSeek 均无关联。
- 素材由使用者**自行提供**：请使用你自己合法拥有或有权使用的图片（官方公开素材、自己绘制或 AI 生成等），
  **仅限个人使用，不要二次分发官方图**。

## 📄 License

MIT for the code. Character artwork is © Yuzusoft and is not included.
