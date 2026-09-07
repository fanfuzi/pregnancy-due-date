# MAINTENANCE.md — Pregnancy Calculator Hub 维护手册

> 面向维护者的操作手册：如何发布内容、如何保持 SEO 健康、如何应对
> Google Search Console（GSC）中的“页面未收录”类问题，以及当前已知技术债清单。
> 配套：`DEPLOYMENT.md`（部署流程）、`publish.sh`（一键发布）。

最后更新：2026-09-07

---

## 0. 项目结构速览

| 路径 | 作用 |
|---|---|
| `index.html` | 首页 + 计算器（LMP / 排卵 / IVF 三种算法） |
| `about.html` / `privacy-policy.html` | E-E-A-T 与合规页面 |
| `blog/*.html` | 14 篇文章；`blog/pin-*.html` 为 8 个 Pinterest 落地页（`noindex, nofollow`，**不要**提交索引/加入 sitemap） |
| `js/main.js` | 计算器逻辑（纯日期运算 + DOM 绑定分离，可用 Node 测试） |
| `js/config.js` | 站点配置（AdSense / Amazon tag / 推荐商品） |
| `js/monetization.js` | 广告/联盟注入 |
| `src/input.css` + `tailwind.config.js` | Tailwind 源；产物提交为 `css/tailwind.css` |
| `_redirects` | `.html` → 无扩展名 URL 的 301（Cloudflare Pages） |
| `sitemap.xml` / `robots.txt` | 收录引导 |

**URL 约定（全站统一，勿破坏）：** 所有正式页面只用无 `.html` 的 URL
（如 `/blog/how-to-calculate-due-date`）；`.html` 形式一律 301 到无扩展名形式；
canonical 指向无扩展名 URL；内部链接全部无扩展名（已核查无 `.html` 残留链接）。

**Cloudflare Pages 会自带 clean-URL 处理**（实测 `/blog/index.html`、pin 页等
即使不在 `_redirects` 里也会自动 301 到无扩展名并返回 200）。因此 `_redirects`
更多是“显式清单 + 兜底”，但**每加一篇文章都要同步维护**，保持文件与站点实际一致。

---

## 1. 每次发布新内容 —— 操作清单

1. **写文章**，参照现有文章结构：
   - `<head>` 内含：`title`、`meta description`、canonical（无扩展名）、
     `BlogPosting` JSON-LD（datePublished/dateModified 必须与正文署名一致）。
   - 正文一个 `h1`；文末要有“相关文章”或回首页计算器的链接（有利于内链/抓取）。
2. **三处同步更新**（最容易漏，已踩过坑）：
   - `_redirects`：新增一行 `xxx.html → xxx 301`。
   - `sitemap.xml`：新增 `<url>`（无扩展名），并顺手把变更页 `lastmod` 改为当天。
   - 若文章值得在首页露出：在 `index.html` 的 “Pregnancy Guides & Tips” 网格加一张卡片。
3. **跑检查与构建**：`npm run check`（自动核对 canonical / sitemap / `_redirects` /
   内链 / JSON-LD 日期，有错会以非零码退出）→ `npm run build:css`。
   `bash publish.sh` 会自动执行这两步，任一步失败即中止，不会发布坏状态。
4. **发布**：`bash publish.sh "feat: 新文章 …"`（检查 → 构建 → commit → push → wrangler 部署）。
5. **验证线上**（部署后必做，约 5 秒）：

   ```bash
   # 期望全部 HTTP 200；.html 版本期望 1 次 301 后 200
   curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L \
     -A "Mozilla/5.0 (compatible; Googlebot/2.1)" \
     https://pregnancycalculatorhub.com/blog/新文章slug
   ```
6. **GSC 请求收录**（新页面必做）：Search Console → URL 检查 → 粘贴新页 URL →
   “请求编制索引”。Sitemap 页也可点“重新发送”。

> robots.txt / sitemap 引用的是正式域名，本地预览无影响；本地调试可
> `python3 -m http.server`，但 clean-URL/301 行为只在本仓库不生效，以线上为准。

---

## 2. Google Search Console 索引问题逐条应对（对应你贴的报告）

GSC 的“Page indexing”把未收录 URL 分几类。先明确一点：**这些问题大多在页面
“应该被收录但 Google 还没决定收”期间正常出现，且很多是历史遗留**。
2026-09-07 已对线上全部 16 个 sitemap URL 实测：无扩展名 URL 全部 200，
`.html` 全部 301→200，`robots.txt`/`sitemap.xml` 正常。逐个解读：

### ① Redirect error — 5 个（Failed，来源 Website）
- **含义**：Google 跟随重定向后到达的页面返回了错误（4xx/5xx/死循环）。
- **本项目的可能成因**：2026-08-24 前后做过一次 URL 迁移（`.html` → 无扩展名），
  当时 clean URL 曾不可用，Google 记录过“301 到 404/错误”的历史状态；GSC 校验
  结果可能仍是那次失败窗口的残留。
- **处理**：
  1. 重新部署本仓库最新 `_redirects`（已补全所有文章 + `/blog/index.html`），
     确保不存在“301 指向 404”的规则。
  2. 在 GSC “Page indexing → Redirect error”里点 **Validate fix**（如可点）；
     逐条对失败 URL 用 **URL 检查 → 请求编制索引**，强制 Google 重新抓取。
  3. 若 2 周后仍失败：把失败的具体 URL 用 URL 检查逐个查“页面抓取结果”，
     看 301 落点是否 4xx（本地无法复现时贴回给我）。
- **预防**：任何“删旧页/改 URL”都必须：新 URL 先能 200 → 再加 301 → 再在
  `_redirects`/sitemap 同步 → 最后才允许旧 URL 失效；不要在改版时同时破坏
  canonical 与服务器行为（此前正是 canonical 已切无扩展名、而服务器还不支持，
  产生了整批“抓取但不收录”）。

### ② Crawled – currently not indexed — 3 个（Failed）
- **含义**：Google 已抓取但暂时判定不值得收录（质量/权重/站龄信号不足）。
- **处理**：
  1. 检查这几个 URL 是否 = 8 个 pin 页之一 —— pin 页带 noindex，属预期，忽略。
  2. 若是正式文章：加强质量信号——文内加 1~2 个权威外链与真实署名、文末
     “相关文章”内链、从 blog 首页和首页卡片双入口、更新后改 `dateModified` 再
     重新提交。
  3. URL 检查逐个“请求编制索引”，通常 1~3 周内决定收录。

### ③ Alternate page with proper canonical tag — 1 个（Not Started）
- **含义**：Google 认为该 URL 是另一 URL 的“替代版”（本页 canonical 指向别处）。
- **本项目的成因**：`/index.html`、`/blog/index.html` 这类带 `.html` 的 URL 曾经
  被独立收录，canonical 指向无扩展名主页。现在它们已 301 到主 URL，正常会消失。
- **处理**：无需代码改动；对该 URL 请求一次编制索引即可让其合并到主版本。
  长期建议：在 CF Pages 用 **DNS TXT 或 `<meta>` 方式**做站点验证（见 §5），
  摆脱对 `googlef81d0f696dce2c05.html` 文件的依赖，避免 301 干扰验证。

### ④ Discovered – currently not indexed — 7 个（Started）
- **含义**：Google 发现了 URL（sitemap/链接）但还没抓取/收录。站龄短、更新快、
  收录池未扩容时最常见；9-04 新增的 2 篇文章大概率在其中。
- **处理**：
  1. 在 sitemap 页确认“最后读取”时间已更新；否则点“重新发送 Sitemap”。
  2. 优先从**首页/博客首页**给每篇文章一个内链（Google 沿权重入口发现）。
  3. 重要页面用 URL 检查手动请求收录；其余耐心等待——**“Discovered”本身
     不是错误**，只要数量不再持续上涨、且几周后转入收录即可。
  4. 关注“趋势”列：若某类长期只增不减，优先排查是否新增了低质量/重复页面
     （如无实质内容的 pin 页泛滥）。

### ⑤ Duplicate without user-selected canonical — 0 个（Passed）
- 说明 canonical 覆盖已到位，保持即可。

**通用提醒**：GSC 各类目数量是“存量”，修复后需等 Google 重新抓取才会下降；
请以 URL 检查的即时结果为准，而不是每天盯总量。

---

## 3. 长期维护节奏

### 每周（15 分钟）
- GSC 看一遍：索引总量趋势、新增未收录类别是否异常上涨、核心词展示/点击。
- CF Analytics / 访问日志粗看 404：把高频 404 URL 用 §2① 的流程处理或补 301。
- `curl` 探测 3~5 个代表 URL（首页、最新文章、旧文章）确认 200。

### 每月
- 内容健康度：所有文章的 JSON-LD 日期、署名与正文一致；无空段/过期建议。
- 检查 pin 页与主文是否仍同步；检查 sitemap 文件与 `_redirects`、blog 首页三者
  URL 集合一致（写个小脚本 diff 更佳）。
- AdSense/Amazon 状态：若 `adsensePublisherId` 已激活，核对广告位 slot 数字、
  页面无 CLS（布局偏移），并确认 `js/monetization.js` 无报错。
- 性能抽查：PageSpeed Insights / Lighthouse ≥ 90；重点看 LCP（首屏图片/CSS）与
  是否误删了缓存头（见 §5 技术债 P1 的缓存建议）。

### 每季度
- 内容 E-E-A-T 升级（见 §4 P0-1）。
- 用真实搜索词审视标题/描述命中率；淘汰无流量文章或并入相关文章（合并时走
  §2① 的“新 200 → 301”流程）。
- 复查外链是否失效（医学来源链接 404 会伤害可信度）。

---

## 4. 本次已修复问题（2026-09-07）

| 文件 | 问题 | 修复 |
|---|---|---|
| `js/main.js` | ① `new Date("YYYY-MM-DD")` 按 UTC 解析、展示按本地，跨时区差一天：美国用户看到日期早一天、东八区用户早上无法录入“今天”当 LMP；② IVF 3 天胚胎算成 +266 天（应为 +263，5 天 +261 是临床标准，3/5 天仅差 2 天）；③ alert 原生弹窗、无周内天数 | 全部改为“日期字符串 + UTC 正午算法”，任何时区结果一致；IVF 改 263/261 并用孕龄（2w3d/2w5d）推导；错误改为页内提示框（`#form-message`，含 `role=alert`）；新增“x 周 x 天”明细；DOM 绑定收进 `init()`，纯函数可被 Node 单测（已测两个时区结果一致） |
| `index.html` | ① `<meta http-equiv=Cache-Control no-cache,no-store>` 等 3 条反缓存头：静态站上只会让每次访问都回源、拖慢性能，无收益；② tab 按钮带 `onclick` + JS 又绑 listener（双击发）；③ 无内联错误区 | 删除反缓存 meta；tab 改 `type=button` 且只走 JS 监听；加 `#form-message` 错误区；结果卡加“x周x天”小字；日期输入 `max` 改为本地日历日 |
| `js/monetization.js` | 给 AdSense 加载脚本设 `crossOrigin=anonymous`（会挡广告）；`(adsbygoogle=…)` 引用未声明全局；slot 占位是 `HOME_TOP` 之类非数字 | 去掉 crossorigin；改用 `window.adsbygoogle`；注释说明激活后须替换成 AdSense 后台真实 slot 数字 |
| `css/style.css` | `.gradient-bg` 语法错误：`100%};` 把 `}` 写进 `linear-gradient()`，规则整条失效 | 修正为 `100%);` |
| `_redirects` | 缺新文章（second-trimester-guide、pregnancy-food-cravings）与 `/blog/index.html`；无维护注释 | 补全清单、保持顺序、加注释；pin 页明确不进清单（noindex） |
| `blog/due-date-calculator-accuracy.html` | 拼写/断句错误（“Ultraound”“accuracymuch”等 3 处）；底部 CTA 不可点击 | 修正文字；CTA 包成链接回首页计算器 |
| 5 篇早期文章（`how-to-calculate-due-date` / `due-date-calculator-accuracy` / `first-trimester-checklist` / `pregnancy-trimesters-guide` / `what-to-pack-hospital-bag`） | 文章之间零互链（只有回首页链接）——“已抓取但未收录”的典型成因 | 每篇文末新增 “Related Guides” 区块（2 条相关文章内链） |
| `blog/first-trimester-checklist.html`、`blog/what-to-pack-hospital-bag.html` | 页内有 Amazon 联盟链接但无联盟披露（违反 Associates 协议） | 商品区块下加 “As an Amazon Associate, we earn from qualifying purchases.” |
| 新增 `scripts/check-links.js` + `package.json` 的 `check` 脚本 | 此前 canonical / sitemap / `_redirects` / 内链全靠手工记忆同步 | 一键核对全部 16 页（pin 页除外），并已接入 `publish.sh`，不一致自动中止发布 |
| 全站内容 QA（子代理逐篇审读 15 个页面） | 医学/事实表述 7 处（IVF 263 天文章版、叶酸 CDC 归因、周期-排卵日自相矛盾、男性服孕期维生素、早孕出血影响 LMP、早孕症状表格前提矛盾、隐私政策 cookie 自相矛盾）、语法 4 处、5 篇 JSON-LD headline 与正文 h1 不一致、4 个超长 `<title>`、首页可见"Advertisement Space"占位框、版权年份过期、首页只露出 6/12 篇文章 | 逐项修正医学表述并弱化绝对断言；补语法错误；JSON-LD headline 对齐 h1；压缩标题到 ≤60 字符；移除占位框改注释；版权改 2026；首页补齐全部 12 篇文章入口 |

> 说明：本次为“修复已发现问题”，**尚未部署**。请按 §1 执行 `bash publish.sh
> "fix: 计算器时区/IVF 算法、缓存头、_redirects 等"` 后做线上验证。

---

## 5. 技术债与后续优化清单（按优先级）

**P0（上线前最好处理）**
1. **E-E-A-T 真实署名**：现 author 为“Editorial Team”占位（`DEPLOYMENT.md` TODO）。
   医疗健康类内容 Google 看重可核实作者/审阅者。放真实姓名与资质前，先用
   Organization 描述编辑流程并链接到 `about.html` 的“来源与审阅”说明；**切勿伪造**
   资质（医疗类造假 = 垃圾信号）。
2. **站点验证方式**：改走 DNS TXT 或 `<meta name="google-site-verification">`
   （用 GSC 提供的 token），减少对 `googlef81d0f696dce2c05.html` 文件的依赖
   （该文件 URL 会被 CF 自动重定向，存在理论上的验证风险）。
3. **404 体验**：加一个 `404.html`（Cloudflare Pages 自动使用），防止误删内容时
   用户看到裸 404；配合 §2① 的 301 策略使用。

**P1（1~2 个月内，明显收益）**
4. **文章页社交卡片**：给每篇文章加 `og:title/description/url/image` 与
   `twitter:card`；准备一张 1200×630 的通用品牌图 + 每文一张示意题图。
5. **文章互链**：每篇文末加“相关文章”2~3 条（指向同话题文章）和回首页计算器
   链接——同时提升用户体验与收录（§2② 的直接解药）。
   **状态：2026-09-07 已给 5 篇老文章补齐 Related Guides；以后新文章写作时自带
   2 条互链即可，`npm run check` 不校验互链存在，人工保证。**
6. **缓存策略**：可用 `_headers` 给静态资产设长缓存：
   `/css/*`、`/js/*` 设 `Cache-Control: public, max-age=31536000, immutable`
   （文件名不变策略下安全）；HTML 交给 CF Pages 默认协商缓存。**不要再加
   no-cache meta**（已删）。
7. **Typography 清理**：文章用了 `prose prose-lg` 类，但项目未安装
   `@tailwindcss/typography`，这些类当前是惰性的。二选一：装插件重建 CSS，
   或删除惰性类改用已有 utility 样式，避免“看起来生效其实没有”。

**P2（优化性能/体验/工程质量）**
8. **首屏精简**：`font-awesome 6.4 all.min.css` 是 render-blocking 的第三方整包
   CSS，仅首页用了几个图标 —— 改为内联 SVG 或按需子集，可明显降 LCP/TBT。
9. **核心指标**：对 `/`、`/blog/`、1 篇文章跑 Lighthouse 留存基线；重点观察
   AdSense 上线后（动态注入广告）的 CLS。
10. **测试与 CI**：为 `js/main.js` 纯函数补 Node 单测（时区矩阵：UTC-8/UTC/UTC+8）；
    可选 GitHub Actions：push 后自动 `npm run build:css` + `wrangler pages deploy`
    （需配 wrangler API token 为仓库 secret），消除本地手工发布差异。
11. **publish.sh 健壮性**：`git add -A` 会把 `.wrangler/`、`screenshots/` 也提交；
    确认 `.gitignore` 覆盖（当前已忽略 `.wrangler/`），截图目录若不需要请删除或忽略。

---

## 6. 关键 URL ↔ 文件映射（维护三件套：`_redirects` / `sitemap.xml` / blog 首页）

```
/ ................................................. index.html
/about ........................................... about.html
/privacy-policy ................................. privacy-policy.html
/blog/ ........................................... blog/index.html
/blog/how-to-calculate-due-date ................. blog/how-to-calculate-due-date.html
/blog/due-date-calculator-accuracy .............. blog/due-date-calculator-accuracy.html
/blog/first-trimester-checklist ................. blog/first-trimester-checklist.html
/blog/pregnancy-trimesters-guide ................ blog/pregnancy-trimesters-guide.html
/blog/what-to-pack-hospital-bag ................. blog/what-to-pack-hospital-bag.html
/blog/pregnancy-symptoms-by-week ............... blog/pregnancy-symptoms-by-week.html
/blog/early-signs-of-pregnancy ................. blog/early-signs-of-pregnancy.html
/blog/pregnancy-test-accuracy .................. blog/pregnancy-test-accuracy.html
/blog/prenatal-vitamins-guide .................. blog/prenatal-vitamins-guide.html
/blog/can-you-get-pregnant-on-your-period ...... blog/can-you-get-pregnant-on-your-period.html
/blog/second-trimester-guide ................... blog/second-trimester-guide.html
/blog/pregnancy-food-cravings .................. blog/pregnancy-food-cravings.html
（blog/pin-*.html 共 8 个 —— noindex，不进 sitemap、不进 _redirects）
```

---

## 7. 常见故障排查速查

| 症状 | 排查 |
|---|---|
| 新文章线上 404（clean URL） | 是否部署成功？`wrangler pages deploy` 输出；文件是否在根目录对应层级；试 `.html` 版本是否 200 |
| `.html` 不 301 | `_redirects` 是否已提交并部署（改它需触发新部署才生效） |
| canonical 与服务器行为不一致 | canonical 必须 = 线上实际 200 的无扩展名 URL；用 URL 检查看 Google 抓到哪个版本 |
| GSC 旧错误不消失 | 存量问题需“Validate fix”+ 逐 URL 请求收录，等 1~3 周 |
| `npm run build:css` 后样式缺类 | 新类是否在 `tailwind.config.js` content 覆盖范围内；`css/tailwind.css` 是否随部署上传 |
| 日期结果“差一天” | 确认线上 `js/main.js` 是新版（旧版时区 bug）；可用两个时区入口交叉验证 |
