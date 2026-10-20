/**
 * Host half of the inaba-meguru skin bundle.
 *
 * 皮肤是纯展示层：DOM / CSS / token 写入都发生在 Client 半。
 * 这里只做一件事——把「用户选的外观配置」持久化到
 * `$DSH_HOME/inaba-meguru/config.json`，并开一条同源、cookie 鉴权的
 * 读写路由给 Client 的设置页用。
 *
 * HTTP surface（同源 cookie 鉴权）：
 *   GET  /inaba-meguru/api                  -> { ok, data }
 *   POST /inaba-meguru/api  { action, ... } -> { ok, data } | { ok:false, error }
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'inaba-meguru'

const ROUTE = '/inaba-meguru/api'

// 皮肤素材：发布版不再把官方图内嵌进 client.js，改成「同源静态路由 + 插件目录 assets/」。
// 用户把图放进 assets/ 即用；文件名固定白名单，避免路径穿越。
// 图不存在时返回 404，client 侧自动降级成纯渐变背景。
const PLUGIN_DIR = path.dirname(fileURLToPath(import.meta.url))
const ASSET_DIR = path.join(PLUGIN_DIR, 'assets')
const ASSET_ROUTE = '/inaba-meguru/assets'
const ASSET_FILES = new Map([
  ['bg-wall-dark.webp', 'image/webp'],
  ['bg-wall-light.webp', 'image/webp'],
  ['art-hero.webp', 'image/webp'],
  ['bg-cg.webp', 'image/webp'],
  ['face.webp', 'image/webp'],
])

const DEFAULTS = {
  version: 1,
  // 出场强度：calm（旧观感）/ standard（满屏底色）/ hero（满屏 + 立绘）
  intensity: 'hero',
  // 底图：wall（照片墙）/ cg（官方横版 CG）/ night（纯暖色渐变）
  background: 'night',
  // 氛围装饰：星屑 / 光带 / 小物件 / 侧栏小巡
  decorations: true,
  // 台词：输入框下 Ciallo 行 + 侧栏气泡
  lines: true,
}

function storePath() {
  const home = process.env.DSH_HOME || path.join(process.env.USERPROFILE || process.cwd(), '.dsh')
  return path.join(home, 'inaba-meguru', 'config.json')
}

function normalize(raw) {
  const base = DEFAULTS
  if (!raw || typeof raw !== 'object') return { ...base }
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)
  return {
    version: 1,
    intensity: pick(raw.intensity, ['calm', 'standard', 'hero'], base.intensity),
    background: pick(raw.background, ['wall', 'cg', 'night'], base.background),
    decorations: typeof raw.decorations === 'boolean' ? raw.decorations : base.decorations,
    lines: typeof raw.lines === 'boolean' ? raw.lines : base.lines,
  }
}

export function readConfig() {
  try {
    return normalize(JSON.parse(fs.readFileSync(storePath(), 'utf8')))
  } catch {
    return { ...DEFAULTS }
  }
}

function writeConfig(data) {
  const file = storePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  // 原子写：先落临时文件再 rename，避免写一半被读到半截 JSON。
  const tmp = file + '.tmp-' + process.pid
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, file)
}

// ---------------------------------------------------------------- trust fence
//
// 本地插件路由必须自己把门（照 dsh-whale-widget 的 v761「安全修复 S1」三层）：
//   ① **插件自校验**（永远先跑）：Host 必须回环权威（或 INABA_MEGURU_TRUSTED_HOSTS 显式声明），
//      `Sec-Fetch-Site: cross-site` 一律拒，带 Origin 时必须与 Host 同源 → 挡 CSRF / DNS 重绑定；
//   ② 宿主栅栏 `connection.requestRejection(req)` 可用 → 委托它（里面还有一层浏览器凭据 401）；
//   ③ 栅栏抛异常 → 拒绝（fail-closed）；栅栏不可用 → 只靠 ①，并在加载时打一条 warn。
//
// 2026-10-21 实测：修前 GET/POST 全裸奔（连 `Host: evil.example`、`Sec-Fetch-Site: cross-site`
// 都 200），根因是 `root.inject(['webServer'])` 时 `ctx.get('connection')` 还没就绪 →
// `reject()` 拿到 undefined 就 fail-open 放行。现在改为**每次请求动态取栅栏**，不再吃快照。
const TRUSTED_AUTHORITIES = String(process.env.INABA_MEGURU_TRUSTED_HOSTS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

// 只认回环：localhost / *.localhost / 127.0.0.0/8（逐段校验，防 127.0.0.1.evil.com）/ ::1
function isLoopbackHostname(hn) {
  const h = String(hn || '').toLowerCase().replace(/^\[/, '').replace(/\]$/, '')
  if (!h) return false
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === '::1') return true
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h)
  if (!m) return false
  if (Number(m[1]) !== 127) return false
  return [m[2], m[3], m[4]].every((x) => Number(x) <= 255)
}

// 通过 → null；否则返回应当拒绝的状态码。
// opts.fenceAvailable：宿主栅栏此刻可用时，非回环 Host 交给它判（它知道宿主自己的 --trusted-host）。
function selfRejection(req, opts) {
  try {
    const headers = (req && req.headers) || {}
    let hostUrl = null
    // 缺 Host / 畸形 → 拒
    try {
      hostUrl = new URL('http://' + String(headers.host || ''))
    } catch {
      return 403
    }
    const hostname = hostUrl.hostname
    const authority = hostUrl.host
    if (!isLoopbackHostname(hostname)) {
      const listed = TRUSTED_AUTHORITIES.some((e) =>
        e.indexOf(':') >= 0 ? e === authority.toLowerCase() : e === hostname.toLowerCase(),
      )
      const fenceAvailable = !!(opts && opts.fenceAvailable)
      if (!listed && !fenceAvailable) return 403
    }
    // 下面两条与白名单无关，任何情况下都执行：跨站标记、Origin 必须与 Host 同源。
    const site = String(headers['sec-fetch-site'] || '').toLowerCase()
    if (site === 'cross-site') return 403
    const origin = headers.origin
    if (typeof origin === 'string' && origin && origin !== 'null') {
      let originUrl = null
      try {
        originUrl = new URL(origin)
      } catch {
        return 403
      }
      if (originUrl.host.toLowerCase() !== authority.toLowerCase()) return 403
    }
    return null
  } catch {
    return 403 // 校验器自身出错 → 拒绝（fail-closed）
  }
}

// ---------------------------------------------------------------- http helpers

function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

function readBody(req, limit = 1 << 18) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8')
      if (!text.trim()) return resolve({})
      try {
        resolve(JSON.parse(text))
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

// ---------------------------------------------------------------- plugin

export function apply(root) {
  root.inject(['webServer'], (ctx) => {
    // 每次请求**动态取**栅栏：`root.inject(['webServer'])` 执行时 `connection` 可能还没就绪，
    // 拿一次快照会得到 undefined 并永久 fail-open（2026-10-21 实测的裸奔根因）。
    const connectionFence = () => {
      try {
        const conn = ctx.get('connection') || ctx.connection
        return conn && typeof conn.requestRejection === 'function' ? conn : null
      } catch {
        return null
      }
    }

    let fenceWarned = false
    const denied = (res, code) => {
      send(res, code || 403, { ok: false, error: 'forbidden' })
      return true
    }

    const rejected = (req, res) => {
      const conn = connectionFence()
      // ① 自校验（永远先跑）：只认回环 Host / 同源 Origin / 拒跨站标记
      const self = selfRejection(req, { fenceAvailable: !!conn })
      if (self !== null) return denied(res, self)
      // ③ 栅栏不可用 → 只靠自校验；首次遇到时打一条 warn（不是静默）
      if (!conn) {
        if (!fenceWarned) {
          fenceWarned = true
          try {
            console.warn(
              '[inaba-meguru] connection.requestRejection 不可用：仅靠插件自带的回环/同源校验（读写都走它）。',
            )
          } catch {
            /* 日志失败不影响放行判断 */
          }
        }
        return false
      }
      // ② 委托宿主栅栏（里面还有一层浏览器凭据 401）；它自己抛异常 → 按拒绝处理（fail-closed）
      let code
      try {
        code = conn.requestRejection(req)
      } catch (err) {
        try {
          console.warn('[inaba-meguru] 信任栅栏抛异常，已按拒绝处理：' + String((err && err.message) || err))
        } catch {
          /* ignore */
        }
        return denied(res, 403)
      }
      if (code === undefined || code === null || code === false) return false
      return denied(res, typeof code === 'number' ? code : 403)
    }

    const getHandler = (req, res) => {
      if (rejected(req, res)) return
      try {
        send(res, 200, { ok: true, data: readConfig() })
      } catch (e) {
        send(res, 500, { ok: false, error: String((e && e.message) || e) })
      }
    }

    const postHandler = async (req, res) => {
      if (rejected(req, res)) return
      let payload
      try {
        payload = await readBody(req)
      } catch (e) {
        send(res, 400, { ok: false, error: String((e && e.message) || e) })
        return
      }
      try {
        const data = readConfig()
        const action = String(payload.action || 'save')
        if (action === 'reset') {
          const next = { ...DEFAULTS }
          writeConfig(next)
          send(res, 200, { ok: true, data: next })
          return
        }
        if (action !== 'save') throw new Error('未知操作：' + action)
        const next = normalize({ ...data, ...payload.patch })
        writeConfig(next)
        send(res, 200, { ok: true, data: next })
      } catch (e) {
        send(res, 500, { ok: false, error: String((e && e.message) || e) })
      }
    }

    const notFound = (res) => {
      res.statusCode = 404
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end('asset not found')
    }

    // 素材读取：每次 readFileSync（用户换图后刷新即生效，不缓存 bytes）
    const assetHandler = (req, res) => {
      if (rejected(req, res)) return
      try {
        const url = new URL(req.url || '/', 'http://localhost')
        const name = decodeURIComponent(url.pathname.slice(ASSET_ROUTE.length + 1))
        const mime = ASSET_FILES.get(name)
        if (!mime) return notFound(res)
        const data = fs.readFileSync(path.join(ASSET_DIR, name))
        res.statusCode = 200
        res.setHeader('content-type', mime)
        res.setHeader('cache-control', 'no-cache')
        res.setHeader('content-length', String(data.length))
        res.end(data)
      } catch {
        notFound(res)
      }
    }

    ctx.effect(
      () => ctx.webServer.register({ kind: 'prefix', path: ASSET_ROUTE, handler: assetHandler }),
      'inaba-meguru: skin assets route',
    )

    ctx.effect(
      () =>
        ctx.webServer.register({
          kind: 'exact',
          path: ROUTE,
          handler: (req, res) => (req.method === 'POST' ? postHandler(req, res) : getHandler(req, res)),
        }),
      'inaba-meguru: appearance config route',
    )
  })

  // 首次启动先把默认配置落盘，设置页/皮肤都能读到同一份。
  try {
    if (!fs.existsSync(storePath())) writeConfig({ ...DEFAULTS })
  } catch {
    /* 路由会在读取时回退到默认值 */
  }
}
