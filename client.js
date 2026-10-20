/**
 * 因幡巡主题皮肤 · Client 半
 *
 * 纯展示层：apply() 里做的事全部挂 ctx.effect，销毁器负责把 CSS 节点、body 标记、
 * token 覆盖层、所有插槽条目原样撤掉 —— 插件一关，界面立刻回到没有巡的样子。
 *
 * 配色：活力橙 #EF7D33 · 围巾金 #F2C14E · 校服粉 #F27B9E
 */
window.__ModuleLoader__.load({
  id: 'dsh-client-ui-skin-inaba-meguru',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useId = typeof React.useId === 'function' ? React.useId : () => 'mg';

    // 素材：由 tools/ 下的脚本生成到 assets/，经 /inaba-meguru/assets/ 同源路由读取
    const FACE_URI = '/inaba-meguru/assets/face.webp';

    /* ------------------------------------------------------------------ *
     * 主题 token
     * ------------------------------------------------------------------ */


    const TOKEN_OVERRIDES = {
      '--dsw-alias-bg-base': { light: 'rgba(255, 250, 244, 0.56)', dark: 'rgba(31, 23, 16, 0.5)' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(255, 245, 233, 0.76)', dark: 'rgba(43, 32, 22, 0.8)' },
      '--dsw-alias-bg-layer-2': { light: 'rgba(255, 235, 205, 0.78)', dark: 'rgba(54, 40, 27, 0.74)' },
      '--dsw-alias-bg-overlay': { light: '#fffdf9', dark: '#33261a' },
      '--dsw-alias-border-l1': { light: '#f0d5b3', dark: '#543f28' },
      '--dsw-alias-border-l2': { light: '#e3c193', dark: '#6d5334' },
      '--dsw-alias-brand-primary': { light: '#ef7d33', dark: '#ffa15c' },
      '--dsw-alias-label-primary': { light: '#3d2b1d', dark: '#fdf0e3' },
      '--dsw-alias-label-secondary': { light: '#8f7254', dark: '#c9ab8b' },
      '--dsw-alias-state-error-primary': { light: '#c8402f', dark: '#ff7a63' },
      '--dsw-alias-state-idle-primary': { light: '#bda385', dark: '#8d7659' },
      '--dsw-alias-state-success-primary': { light: '#3f9b63', dark: '#5fd39a' },
      '--dsw-alias-state-warn-primary': { light: '#d99a1f', dark: '#ffd166' },
      '--dsw-specific-sidebar-fill': { light: 'rgba(255, 240, 219, 0.72)', dark: 'rgba(20, 14, 9, 0.7)' },
    };

    // 外观资源（由 _patch_css.cjs 注入；大图内嵌，不依赖外部文件）
    const WALL_URI = '/inaba-meguru/assets/bg-wall-dark.webp';
const WALL_LIGHT_URI = '/inaba-meguru/assets/bg-wall-light.webp';
    const HERO_URI = '/inaba-meguru/assets/art-hero.webp';
    const CG_URI = '/inaba-meguru/assets/bg-cg.webp';

    const SKIN_CSS = `
/* ===== 因幡巡主题 · 橙 #EF7D33 / 金 #F2C14E / 粉 #F27B9E ===== */

/* ---------- 页面底色：一层暖场景，半透明面板会透出来 ---------- */
body[data-dsh-inaba-meguru] {
  --mg-art: none;
  --mg-l1: none;
  --mg-l2: none;
  background-color: #150e09;
  background-image: var(--mg-art), var(--mg-l1), var(--mg-l2);
  background-size: auto 84vh, cover, cover;
  background-position: right 2vw bottom -1vh, center center, center center;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-attachment: fixed, fixed, fixed;
  scrollbar-color: rgba(239, 125, 51, 0.52) transparent;
}
body[data-dsh-inaba-meguru][data-mg-intensity="hero"] {
  --mg-art: url("${HERO_URI}");
}
body[data-dsh-inaba-meguru][data-mg-bg="wall"] {
  --mg-art: none; /* v2：照片墙档不再叠右侧立绘 */
  --mg-l1: url("${WALL_URI}");
  --mg-l2: linear-gradient(180deg, rgba(21, 14, 9, 0.18), rgba(21, 14, 9, 0.62));
}
body[data-dsh-inaba-meguru][data-mg-bg="cg"] {
  --mg-l1: url("${CG_URI}");
  --mg-l2: linear-gradient(180deg, rgba(21, 14, 9, 0.42), rgba(21, 14, 9, 0.78));
}
body[data-dsh-inaba-meguru][data-mg-bg="night"] {
  --mg-l1: radial-gradient(64% 72% at 18% 46%, rgba(239, 125, 51, 0.26), transparent 66%);
  --mg-l2: linear-gradient(150deg, #2f1d12 0%, #1e120b 46%, #0d0705 100%);
}
body[data-dsh-inaba-meguru][data-mg-intensity="standard"] {
  --dsw-alias-bg-base: rgba(21, 14, 9, 0.44) !important;
  --dsw-alias-bg-layer-1: rgba(32, 22, 15, 0.66) !important;
  --dsw-alias-bg-layer-2: rgba(43, 30, 20, 0.7) !important;
  --dsw-specific-sidebar-fill: rgba(27, 18, 12, 0.6) !important;
}
body[data-dsh-inaba-meguru][data-mg-intensity="hero"] {
  --dsw-alias-bg-base: rgba(21, 14, 9, 0.34) !important;
  --dsw-alias-bg-layer-1: rgba(32, 22, 15, 0.58) !important;
  --dsw-alias-bg-layer-2: rgba(43, 30, 20, 0.62) !important;
  --dsw-specific-sidebar-fill: rgba(27, 18, 12, 0.55) !important;
}
/* 浅色主题适配（2026-10-21）：独立一套米白照片墙 + 高不透明度浅色卡片。
   深色下这套规则不生效（:not([data-ds-dark-theme])），两边互不打扰。 */
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme]) {
  background-color: #f6efe5;
  scrollbar-color: rgba(239, 125, 51, 0.45) transparent;
}
/* 浅色档：换成米白底的那张照片墙（WALL_LIGHT_URI），只留很轻的底部渐暗 */
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme])[data-mg-bg="wall"] {
  --mg-l1: url("${WALL_LIGHT_URI}");
  --mg-l2: linear-gradient(180deg, rgba(255, 250, 244, 0), rgba(250, 244, 236, 0.18));
}
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme])[data-mg-bg="cg"] {
  --mg-l2: linear-gradient(180deg, rgba(250, 245, 237, 0.74), rgba(244, 235, 222, 0.88));
}
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme])[data-mg-bg="night"] {
  --mg-l1: radial-gradient(64% 72% at 18% 46%, rgba(239, 125, 51, 0.14), transparent 66%);
  --mg-l2: linear-gradient(150deg, #fbf6ee 0%, #f4ebe0 46%, #ecdfd0 100%);
}
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme])[data-mg-intensity="standard"],
body[data-dsh-inaba-meguru]:not([data-ds-dark-theme])[data-mg-intensity="hero"] {
  /* 2026-10-21 03:5x 修正：--dsw-alias-bg-base 是**整个应用的基础背景层**，不是卡片颜色。
     写成 0.84 会把背后的照片墙糊成一片白；这里回到与深色档相同的半透明区间，
     让米白照片墙透出来（浅色墙上深色字本来就够读）。 */
  --dsw-alias-bg-base: rgba(255, 252, 247, 0.38) !important;
  --dsw-alias-bg-layer-1: rgba(255, 249, 240, 0.58) !important;
  --dsw-alias-bg-layer-2: rgba(255, 245, 231, 0.6) !important;
  --dsw-specific-sidebar-fill: rgba(255, 248, 238, 0.54) !important;
}
body[data-dsh-inaba-meguru] ::selection {
  background: rgba(239, 125, 51, 0.3);
  color: inherit;
}
body[data-dsh-inaba-meguru] ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
body[data-dsh-inaba-meguru] ::-webkit-scrollbar-track {
  background: transparent;
}
body[data-dsh-inaba-meguru] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(239, 125, 51, 0.62), rgba(242, 193, 78, 0.66));
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

/* ---------- 动画 ---------- */
@keyframes mg-in {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: none; }
}
@keyframes mg-rise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
}
@keyframes mg-twinkle {
  0%, 100% { opacity: 0.16; transform: scale(0.78); }
  50%      { opacity: 0.92; transform: scale(1.18); }
}
@keyframes mg-breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 0.92; transform: scale(1.06); }
}
@keyframes mg-pop {
  from { opacity: 0; transform: translateY(5px) scale(0.94); }
  to   { opacity: 1; transform: none; }
}

/* ---------- 头像 ---------- */
.mg-face {
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

/* ---------- 装饰层：只压边缘，中间留干净 ---------- */
.mg-veil {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.mg-veil__topbar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(239, 125, 51, 0) 0%, #ef7d33 18%, #f2c14e 50%, #f27b9e 82%, rgba(242, 123, 158, 0) 100%);
  opacity: 0.75;
}
.mg-veil__topglow {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 220px;
  background: linear-gradient(180deg, rgba(239, 125, 51, 0.1), rgba(239, 125, 51, 0) 100%);
}
.mg-veil__floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 180px;
  background: linear-gradient(0deg, rgba(242, 123, 158, 0.1), rgba(242, 123, 158, 0) 100%);
}
.mg-veil__ring {
  position: absolute;
  border: 1px solid rgba(239, 125, 51, 0.14);
  border-radius: 50%;
}
.mg-veil__ring--a {
  width: 520px;
  height: 520px;
  left: -190px;
  top: -180px;
}
.mg-veil__ring--b {
  width: 760px;
  height: 760px;
  left: -310px;
  top: -300px;
  border-color: rgba(242, 193, 78, 0.12);
}
.mg-veil__ring--c {
  width: 460px;
  height: 460px;
  right: -150px;
  bottom: -190px;
  border-color: rgba(242, 123, 158, 0.16);
}
.mg-veil__ring--d {
  width: 700px;
  height: 700px;
  right: -270px;
  bottom: -300px;
  border-color: rgba(242, 193, 78, 0.1);
}
.mg-star {
  position: absolute;
  border-radius: 50%;
  animation-name: mg-twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: opacity, transform;
}
.mg-spark {
  position: absolute;
  animation: mg-twinkle 5s ease-in-out infinite;
  background:
    radial-gradient(50% 50% at 50% 50%, rgba(255, 238, 196, 0.95), rgba(255, 238, 196, 0) 70%),
    linear-gradient(0deg, transparent 46%, rgba(255, 216, 156, 0.8) 46% 54%, transparent 54%),
    linear-gradient(90deg, transparent 46%, rgba(255, 216, 156, 0.8) 46% 54%, transparent 54%);
}

/* ---------- 输入框下方的一行「Ciallo～」 ---------- */
.mg-ciallo {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 7px;
  padding: 7px 4px 3px;
  font-size: 11.5px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  user-select: none;
  pointer-events: none;
  animation: mg-in 0.55s ease-out both;
}
.mg-ciallo__sig {
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--dsw-alias-brand-primary);
}
.mg-ciallo__face {
  font-family: ui-monospace, "Cascadia Mono", "Consolas", monospace;
  opacity: 0.85;
  color: var(--dsw-alias-label-secondary);
}
.mg-ciallo__line {
  color: var(--dsw-alias-label-secondary);
}

/* ---------- 侧栏底部的小巡 ---------- */
.mg-side-wrap {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}
.mg-side {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  overflow: visible;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.mg-side:hover {
  background: rgba(239, 125, 51, 0.16);
}
.mg-side:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.mg-side__face {
  display: block;
  transition: transform 0.18s ease;
}
.mg-side:hover .mg-side__face {
  transform: rotate(-6deg) scale(1.06);
}

/* 气泡：从按钮右上方展开，向左不越界、向右也不越界 */
.mg-side__bubble {
  position: absolute;
  bottom: calc(100% + 9px);
  left: 0;
  z-index: 60;
  box-sizing: border-box;
  width: max-content;
  max-width: min(230px, 56vw);
  padding: 6px 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 11px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  font-size: 11px;
  line-height: 1.45;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-shadow: 0 8px 24px rgba(61, 43, 29, 0.18);
  animation: mg-pop 0.18s ease-out both;
  pointer-events: none;
}
.mg-side__bubble::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 12px;
  border: 4px solid transparent;
  border-top-color: var(--dsw-alias-bg-overlay);
}

/* ---------- 巡的小物件 ---------- */
.mg-orn {
  position: absolute;
  pointer-events: none;
  opacity: 0.55;
  filter: drop-shadow(0 4px 10px rgba(150, 86, 20, 0.16));
  animation: mg-float 6.5s ease-in-out infinite;
}
@keyframes mg-float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-9px) rotate(2deg); }
}
.mg-orn--tart {
  left: 2.4%;
  bottom: 9%;
  width: 46px;
  height: 46px;
  animation-delay: 0.4s;
}
.mg-orn--pad {
  left: 8.5%;
  top: 37%;
  width: 54px;
  height: 42px;
  animation-delay: 1.6s;
}
.mg-orn--heart {
  right: 3%;
  top: 41%;
  width: 36px;
  height: 36px;
  animation-delay: 2.8s;
}

/* ---------- 左右垂饰 ---------- */
.mg-veil__side {
  position: absolute;
  top: 14%;
  width: 2px;
  height: 30%;
  border-radius: 2px;
}
.mg-veil__side--l {
  left: 0;
  background: linear-gradient(180deg, transparent, rgba(239, 125, 51, 0.42) 35%, rgba(242, 193, 78, 0.42) 70%, transparent);
}
.mg-veil__side--r {
  right: 0;
  background: linear-gradient(180deg, transparent, rgba(242, 123, 158, 0.42) 35%, rgba(239, 125, 51, 0.42) 70%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .mg-ciallo,
  .mg-side__bubble {
    animation: none;
  }
  .mg-star,
  .mg-spark {
    animation: none;
    opacity: 0.5;
  }
}

/* ---------- 设置 → 因幡巡 ---------- */
.mg-set {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 2px 2px 18px;
  animation: mg-in 0.25s ease-out both;
}
.mg-set__lede {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mg-set__face {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
}
.mg-set__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary);
  line-height: 1.4;
}
.mg-set__hint {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}
.mg-set__group {
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 13px 15px 15px;
  background: var(--dsw-alias-bg-layer-1);
}
.mg-set__label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--dsw-alias-label-primary);
  margin-bottom: 9px;
}
.mg-set__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mg-set__opt {
  appearance: none;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 118px;
  padding: 8px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12.5px;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.mg-set__opt:hover {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
}
.mg-set__opt small {
  font-size: 11px;
  opacity: 0.8;
}
.mg-set__opt.is-on {
  border-color: var(--dsw-alias-brand-primary);
  background: rgba(239, 125, 51, 0.14);
  color: var(--dsw-alias-label-primary);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-brand-primary);
}
.mg-set__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 9px 0;
  border-top: 1px dashed var(--dsw-alias-border-l1);
}
.mg-set__toggle:first-of-type {
  border-top: 0;
  padding-top: 0;
}
.mg-set__toggleText {
  font-size: 12.5px;
  color: var(--dsw-alias-label-primary);
}
.mg-set__toggleText small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary);
}
.mg-set__switch {
  appearance: none;
  position: relative;
  width: 42px;
  height: 24px;
  flex: 0 0 auto;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.mg-set__switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: transform 0.15s ease, background 0.15s ease;
}
.mg-set__switch.is-on {
  border-color: var(--dsw-alias-brand-primary);
  background: rgba(239, 125, 51, 0.3);
}
.mg-set__switch.is-on::after {
  transform: translateX(18px);
  background: var(--dsw-alias-brand-primary);
}
.mg-set__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
}
.mg-set__status {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary);
}
.mg-set__reset {
  appearance: none;
  padding: 6px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
}
.mg-set__reset:hover {
  border-color: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-state-error-primary);
}
`;

    /* ------------------------------------------------------------------ *
     * 外观配置（Host 持久化，Client 缓存 + 订阅）
     * ------------------------------------------------------------------ */

    const CONFIG_API = '/inaba-meguru/api';
    const CONFIG_DEFAULTS = {
      intensity: 'hero',
      background: 'night',
      decorations: true,
      lines: true,
    };

    let CONFIG = { ...CONFIG_DEFAULTS };
    const configListeners = new Set();

    function notifyConfig() {
      for (const fn of Array.from(configListeners)) {
        try {
          fn(CONFIG);
        } catch {
          /* 单个订阅者出错不影响其他人 */
        }
      }
    }

    function applyConfig(next) {
      CONFIG = { ...CONFIG_DEFAULTS, ...(next || {}) };
      const body = document.body;
      if (body && body.hasAttribute('data-dsh-inaba-meguru')) {
        body.setAttribute('data-mg-intensity', CONFIG.intensity);
        body.setAttribute('data-mg-bg', CONFIG.background);
      }
      notifyConfig();
      return CONFIG;
    }

    async function loadConfig() {
      try {
        const res = await fetch(CONFIG_API, { credentials: 'same-origin', cache: 'no-store' });
        const payload = await res.json();
        if (payload && payload.ok && payload.data) return applyConfig(payload.data);
      } catch {
        /* Host 路由还没起来时保持默认值 */
      }
      return CONFIG;
    }

    async function postConfig(action, patch) {
      try {
        const res = await fetch(CONFIG_API, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch ? { action, patch } : { action }),
        });
        const payload = await res.json();
        if (payload && payload.ok && payload.data) applyConfig(payload.data);
        return payload;
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) };
      }
    }

    function useConfig() {
      const [, force] = React.useState(0);
      React.useEffect(() => {
        const fn = () => force((n) => n + 1);
        configListeners.add(fn);
        return () => configListeners.delete(fn);
      }, []);
      return CONFIG;
    }

    /* ------------------------------------------------------------------ *
     * 小工具
     * ------------------------------------------------------------------ */

    function pickOne(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    const CIALLO_LINES = [
      '今天想做什么？巡都在～',
      '要來一口蛋挞吗？刚烤的。',
      '超自然研究部，随时候命！',
      '嘿嘿……又见面了。',
      '写不出来就先喝口水吧。',
      '不讨厌，就是很喜欢的意思啦。',
    ];

    const BUBBLE_LINES = [
      'Ciallo～(∠·ω< )⌒★',
      '诶诶诶？！找巡有事？',
      '不讨厌你啦……真的。',
      '工作完记得休息哦。',
      '巡在这儿呢。',
      '（小声）其实一直在等你。',
    ];

    /* ------------------------------------------------------------------ *
     * 巡的 Q 版头像（纯 SVG，橙发 / 金围巾 / 粉蝴蝶结）
     * ------------------------------------------------------------------ */

    function MeguruFace(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 28;
      return h('img', {
        className: props.className ? 'mg-face ' + props.className : 'mg-face',
        src: FACE_URI,
        width: size,
        height: size,
        alt: '',
        'aria-hidden': 'true',
        draggable: false,
      });
    }

    /* ------------------------------------------------------------------ *
     * 插槽组件
     * ------------------------------------------------------------------ */

    /** conversation.hero.brand.mark —— 空白会话标题前的品牌位 */
    function HeroMark(props) {
      const size = props && typeof props.size === 'number' ? props.size : 48;
      return h(MeguruFace, { size, className: props && props.className });
    }

    /** conversation.composer.dock —— 输入框下方的一行问候 */
    function CialloDock() {
      const cfg = useConfig();
      const line = React.useState(() => pickOne(CIALLO_LINES))[0];
      if (!cfg.lines) return null;
      return h(
        'div',
        { className: 'mg-ciallo' },
        h('span', { className: 'mg-ciallo__sig' }, 'Ciallo～'),
        h('span', { className: 'mg-ciallo__face' }, '(∠·ω< )⌒★'),
        h('span', { className: 'mg-ciallo__line' }, line),
      );
    }

    /** sidebar.footer.action —— 设置旁边的小巡，点一下冒一句 */
    function SidebarMeguru() {
      const cfg = useConfig();
      const [bubble, setBubble] = React.useState(null);
      const timer = React.useRef(0);
      React.useEffect(
        () => () => {
          window.clearTimeout(timer.current);
        },
        [],
      );
      const pop = () => {
        if (!cfg.lines) return;
        setBubble(pickOne(BUBBLE_LINES));
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setBubble(null), 2400);
      };
      if (!cfg.decorations) return null;
      return h(
        'div',
        { className: 'mg-side-wrap' },
        h(
          'button',
          {
            type: 'button',
            className: 'mg-side',
            style: { width: 44, height: 44, flex: '0 0 auto' },
            title: 'Ciallo～',
            'aria-label': '因幡巡：Ciallo～',
            onClick: pop,
          },
          h(MeguruFace, { size: 38, className: 'mg-side__face' }),
        ),
        bubble
          ? h('span', { className: 'mg-side__bubble', role: 'status' }, bubble)
          : null,
      );
    }

    // 贴边的星屑：只放四角与上下边缘，中间永远留干净。
    const STARS = [
      { x: 3.2, y: 9, s: 5, c: 'rgba(239,125,51,0.82)', d: 0 },
      { x: 9.4, y: 18, s: 3, c: 'rgba(242,193,78,0.92)', d: 0.9 },
      { x: 2.8, y: 30, s: 3.5, c: 'rgba(242,123,158,0.8)', d: 1.7 },
      { x: 13.2, y: 5.5, s: 2.6, c: 'rgba(242,193,78,0.9)', d: 0.4 },
      { x: 6.2, y: 44, s: 2.4, c: 'rgba(239,125,51,0.55)', d: 2.6 },
      { x: 46.5, y: 2.6, s: 3.2, c: 'rgba(242,123,158,0.85)', d: 1.2 },
      { x: 55.5, y: 6.5, s: 2.2, c: 'rgba(242,193,78,0.6)', d: 3.1 },
      { x: 88.5, y: 4.5, s: 3, c: 'rgba(242,193,78,0.9)', d: 0.7 },
      { x: 94.6, y: 10, s: 5, c: 'rgba(239,125,51,0.78)', d: 1.5 },
      { x: 90.5, y: 20, s: 3.2, c: 'rgba(242,123,158,0.8)', d: 2.1 },
      { x: 96.2, y: 29, s: 2.8, c: 'rgba(242,193,78,0.9)', d: 0.2 },
      { x: 97, y: 46, s: 2.2, c: 'rgba(239,125,51,0.5)', d: 2.9 },
      { x: 4.6, y: 78, s: 4.2, c: 'rgba(242,193,78,0.85)', d: 1.9 },
      { x: 11.5, y: 89, s: 3, c: 'rgba(239,125,51,0.7)', d: 0.5 },
      { x: 20, y: 95.5, s: 2.4, c: 'rgba(242,123,158,0.6)', d: 2.2 },
      { x: 73, y: 96, s: 2.6, c: 'rgba(242,193,78,0.6)', d: 1.4 },
      { x: 88.5, y: 86, s: 4, c: 'rgba(239,125,51,0.78)', d: 1.1 },
      { x: 94.5, y: 93.5, s: 2.8, c: 'rgba(242,123,158,0.75)', d: 2.4 },
    ];

    // 十字星芒，比圆点更"闪"
    const SPARKS = [
      { x: 6.5, y: 62, s: 12, d: 0.6 },
      { x: 92, y: 58, s: 14, d: 1.8 },
      { x: 30, y: 3.4, s: 10, d: 2.6 },
      { x: 68, y: 97, s: 11, d: 0.3 },
      { x: 1.6, y: 47, s: 9, d: 3.4 },
      { x: 98.2, y: 74, s: 10, d: 1.2 },
    ];

    /** 巡的小物件：蛋挞 / 游戏手柄 / 爱心 */
    function Ornament(props) {
      const kind = props.kind;
      const cls = 'mg-orn mg-orn--' + kind;
      if (kind === 'tart') {
        return h(
          'svg',
          { className: cls, viewBox: '0 0 40 40', 'aria-hidden': 'true' },
          h('path', {
            d: 'M6 24 L34 24 L31 34 Q20 37 9 34 Z',
            fill: '#E9C79A',
            stroke: '#C69A5E',
            strokeWidth: 1.6,
            strokeLinejoin: 'round',
          }),
          h('ellipse', {
            cx: 20,
            cy: 22,
            rx: 14,
            ry: 6,
            fill: '#F8CE58',
            stroke: '#DCA52C',
            strokeWidth: 1.6,
          }),
          h('ellipse', { cx: 15, cy: 20.6, rx: 3.4, ry: 1.8, fill: '#FFF0B8', opacity: 0.85 }),
        );
      }
      if (kind === 'pad') {
        return h(
          'svg',
          { className: cls, viewBox: '0 0 44 34', 'aria-hidden': 'true' },
          h('rect', {
            x: 3,
            y: 6,
            width: 38,
            height: 18,
            rx: 9,
            fill: '#5B7FD6',
            stroke: '#3F5EAE',
            strokeWidth: 1.6,
          }),
          h('circle', { cx: 13, cy: 15, r: 4.2, fill: '#FFFFFF', opacity: 0.92 }),
          h('path', {
            d: 'M13 12.4 V17.6 M10.4 15 H15.6',
            stroke: '#5B7FD6',
            strokeWidth: 1.7,
            strokeLinecap: 'round',
          }),
          h('circle', { cx: 30, cy: 12.6, r: 2.6, fill: '#F2C14E' }),
          h('circle', { cx: 34.6, cy: 17.4, r: 2.6, fill: '#F2779B' }),
        );
      }
      return h(
        'svg',
        { className: cls, viewBox: '0 0 40 40', 'aria-hidden': 'true' },
        h('path', {
          d:
            'M20 33 C20 33 4 24 4 14.6 C4 10.2 7.5 7 11.4 7 C14.3 7 17.4 8.8 20 11.8 ' +
            'C22.6 8.8 25.7 7 28.6 7 C32.5 7 36 10.2 36 14.6 C36 24 20 33 20 33 Z',
          fill: '#F2779B',
          stroke: '#D95A80',
          strokeWidth: 1.6,
          strokeLinejoin: 'round',
        }),
      );
    }

    /** shell.overlay —— 只压边缘的氛围层：光带、地光、圆环、星屑、小物件 */
    function Veil() {
      const cfg = useConfig();
      if (!cfg.decorations) return null;
      return h(
        'div',
        { className: 'mg-veil', 'aria-hidden': 'true' },
        h('div', { className: 'mg-veil__topglow' }),
        h('div', { className: 'mg-veil__floor' }),
        h('div', { className: 'mg-veil__ring mg-veil__ring--a' }),
        h('div', { className: 'mg-veil__ring mg-veil__ring--b' }),
        h('div', { className: 'mg-veil__ring mg-veil__ring--c' }),
        h('div', { className: 'mg-veil__ring mg-veil__ring--d' }),
        h('div', { className: 'mg-veil__side mg-veil__side--l' }),
        h('div', { className: 'mg-veil__side mg-veil__side--r' }),
        h('div', { className: 'mg-veil__topbar' }),
        h(Ornament, { kind: 'tart' }),
        h(Ornament, { kind: 'pad' }),
        h(Ornament, { kind: 'heart' }),
        STARS.map((star, index) =>
          h('span', {
            key: 's' + index,
            className: 'mg-star',
            style: {
              left: star.x + '%',
              top: star.y + '%',
              width: star.s + 'px',
              height: star.s + 'px',
              background: star.c,
              animationDelay: star.d + 's',
              animationDuration: 2.9 + (index % 4) * 0.65 + 's',
            },
          }),
        ),
        SPARKS.map((spark, index) =>
          h('span', {
            key: 'k' + index,
            className: 'mg-spark',
            style: {
              left: spark.x + '%',
              top: spark.y + '%',
              width: spark.s + 'px',
              height: spark.s + 'px',
              animationDelay: spark.d + 's',
              animationDuration: 4 + (index % 3) * 0.8 + 's',
            },
          }),
        ),
      );
    }

    /* ------------------------------------------------------------------ *
     * 设置 → 因幡巡
     * ------------------------------------------------------------------ */

    const INTENSITY_OPTIONS = [
      { id: 'calm', title: '克制', hint: '回到从前的边缘装饰，正文零遮挡' },
      { id: 'standard', title: '标准', hint: '满屏底色，面板半透明' },
      { id: 'hero', title: '满屏', hint: '巡的立绘站到界面里' },
    ];

    const BACKGROUND_OPTIONS = [
      { id: 'wall', title: '照片墙', hint: '四张官方拍立得' },
      { id: 'cg', title: '官方 CG', hint: '趴在桌上的巡' },
      { id: 'night', title: '夜色', hint: '暖色渐变，最衬立绘' },
    ];

    function SettingsPage(props) {
      const cfg = useConfig();
      const [saving, setSaving] = React.useState(false);
      const [note, setNote] = React.useState('');
      const close = props && typeof props.close === 'function' ? props.close : null;

      const commit = async (patch) => {
        setSaving(true);
        const res = await postConfig('save', patch);
        setSaving(false);
        setNote(res && res.ok ? '已保存' : '保存失败：' + String((res && res.error) || '未知错误'));
        window.setTimeout(() => setNote(''), 1800);
      };

      const reset = async () => {
        setSaving(true);
        const res = await postConfig('reset');
        setSaving(false);
        setNote(res && res.ok ? '已恢复默认' : '恢复失败');
        window.setTimeout(() => setNote(''), 1800);
      };

      return h(
        'div',
        { className: 'mg-set' },
        h(
          'div',
          { className: 'mg-set__lede' },
          h(MeguruFace, { size: 52, className: 'mg-set__face' }),
          h(
            'div',
            {},
            h('div', { className: 'mg-set__title' }, '因幡巡 · 界面外观'),
            h(
              'div',
              { className: 'mg-set__hint' },
              'Ciallo～(∠·ω< )⌒★ 这些开关只影响本机界面，随时能改回来。',
            ),
          ),
        ),
        h(
          'div',
          { className: 'mg-set__group' },
          h('div', { className: 'mg-set__label' }, '巡的出场强度'),
          h(
            'div',
            { className: 'mg-set__row' },
            INTENSITY_OPTIONS.map((opt) =>
              h(
                'button',
                {
                  key: opt.id,
                  type: 'button',
                  className: 'mg-set__opt' + (cfg.intensity === opt.id ? ' is-on' : ''),
                  onClick: () => commit({ intensity: opt.id }),
                  disabled: saving,
                },
                opt.title,
                h('small', {}, opt.hint),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'mg-set__group' },
          h('div', { className: 'mg-set__label' }, '底图'),
          h(
            'div',
            { className: 'mg-set__row' },
            BACKGROUND_OPTIONS.map((opt) =>
              h(
                'button',
                {
                  key: opt.id,
                  type: 'button',
                  className: 'mg-set__opt' + (cfg.background === opt.id ? ' is-on' : ''),
                  onClick: () => commit({ background: opt.id }),
                  disabled: saving,
                },
                opt.title,
                h('small', {}, opt.hint),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'mg-set__group' },
          h('div', { className: 'mg-set__label' }, '装饰与台词'),
          h(
            'div',
            { className: 'mg-set__toggle' },
            h(
              'div',
              { className: 'mg-set__toggleText' },
              '氛围装饰',
              h('small', {}, '星屑、光带、小物件、侧栏小巡'),
            ),
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': cfg.decorations ? 'true' : 'false',
              'aria-label': '氛围装饰',
              className: 'mg-set__switch' + (cfg.decorations ? ' is-on' : ''),
              onClick: () => commit({ decorations: !cfg.decorations }),
              disabled: saving,
            }),
          ),
          h(
            'div',
            { className: 'mg-set__toggle' },
            h(
              'div',
              { className: 'mg-set__toggleText' },
              '台词',
              h('small', {}, '输入框下的 Ciallo 行与小巡气泡'),
            ),
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': cfg.lines ? 'true' : 'false',
              'aria-label': '台词',
              className: 'mg-set__switch' + (cfg.lines ? ' is-on' : ''),
              onClick: () => commit({ lines: !cfg.lines }),
              disabled: saving,
            }),
          ),
        ),
        h(
          'div',
          { className: 'mg-set__foot' },
          h(
            'span',
            { className: 'mg-set__status' },
            note || (saving ? '保存中……' : '配置存在本机 DSH 数据目录'),
          ),
          h(
            'button',
            { type: 'button', className: 'mg-set__reset', onClick: reset, disabled: saving },
            '恢复默认',
          ),
        ),
      );
    }

    /* ------------------------------------------------------------------ *
     * 插件入口
     * ------------------------------------------------------------------ */

    return {
      // theme 必须声明进 inject：immediately:true 时 apply 可能早于 ui-theme 提供
      // 服务，裸 ctx.get('theme') 会静默拿不到 → 整层 token 覆盖不生效（调研结论）。
      inject: ['slots', 'theme'],
      apply(ctx) {
        // 1) 作用域样式表
        ctx.effect(() => {
          const style = document.createElement('style');
          style.setAttribute('data-dsh-inaba-meguru', 'style');
          style.textContent = SKIN_CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'inaba-meguru: stylesheet');

        // 2) body 作用域标记 + 外观配置（配置变了只改属性，不动结构）
        ctx.effect(() => {
          const body = document.body;
          body.setAttribute('data-dsh-inaba-meguru', '');
          body.setAttribute('data-mg-intensity', CONFIG.intensity);
          body.setAttribute('data-mg-bg', CONFIG.background);
          let alive = true;
          loadConfig();
          const onFocus = () => {
            if (alive) loadConfig();
          };
          window.addEventListener('focus', onFocus);
          return () => {
            alive = false;
            window.removeEventListener('focus', onFocus);
            body.removeAttribute('data-dsh-inaba-meguru');
            body.removeAttribute('data-mg-intensity');
            body.removeAttribute('data-mg-bg');
          };
        }, 'inaba-meguru: page scope');

        // 3) 主题 token 覆盖层（浅色 / 深色两套）
        const theme = ctx.get('theme');
        if (theme && typeof theme.overrideTokens === 'function') {
          ctx.effect(
            () =>
              theme.overrideTokens(
                'dsh-client-ui-skin-inaba-meguru',
                TOKEN_OVERRIDES,
              ),
            'inaba-meguru: token layer',
          );
        }

        // 4) 插槽
        ctx.slots.inject('conversation.hero.brand.mark', () =>
          ctx.slots.register({ name: 'conversation.hero.brand.mark' }, HeroMark),
        );

        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            { name: 'conversation.composer.dock', id: 'inaba-meguru-ciallo', order: 40 },
            CialloDock,
          ),
        );

        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            { name: 'sidebar.footer.action', id: 'inaba-meguru-side', order: 30 },
            SidebarMeguru,
          ),
        );

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            { name: 'shell.overlay', id: 'inaba-meguru-veil', order: 10 },
            Veil,
          ),
        );

        // 5) 设置 → 因幡巡（0.2.1 原生设置分区）
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'inaba-meguru',
              order: 55,
              label: () => '因幡巡',
              inject: () => ({}),
            },
            SettingsPage,
          ),
        );

      },
    };
  },
});
