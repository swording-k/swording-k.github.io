# Killian Yang — Personal Portfolio

杨锟（Killian Yang）的个人作品集：[https://swording-k.github.io](https://swording-k.github.io)。

这是一个无构建步骤的静态单页站点，用来呈现产品、iOS 应用、开源参与、黑客松项目、内容工具和联系方式。作品文案与外链写在 `index.html`；没有登录、支付、数据库写入或用户生成内容。

## 快速开始

本地预览只需要静态服务器：

```bash
python3 -m http.server 4179
# 打开 http://127.0.0.1:4179
```

运行回归测试需要 Node.js 22 或更新版本：

```bash
node --test tests/*.test.mjs
```

仓库没有 npm 依赖、构建命令或环境变量要求。Google Fonts 加载失败时会回退到系统字体；静态托管下访客计数会显示明确的不可用状态。

## 代码结构

| 路径 | 职责 |
| --- | --- |
| `index.html` | 页面内容、项目条目、外链和简历入口；作品册的唯一内容源 |
| `css/` | 大厅背景、响应式首页、武器陈列与作品册样式 |
| `js/portfolio-book.js` | 解析项目条目、生成目录和无脚本回退，并按输入能力选择阅读器 |
| `js/portfolio-book-3d.js` | 桌面端 Three.js 书页几何、纸张材质和翻页交互 |
| `js/mobile-book.js` | 触屏设备的原生 DOM 书页、横滑与箭头翻页 |
| `js/main.js` | 导航、灯箱、武器选择、桌面滚动镜头和访客计数 |
| `api/` | Vercel 同源部署的可选访客计数、站长状态和题字接口 |
| `tests/` | Node 内置测试，覆盖内容契约、页面几何、素材引用和接口降级 |
| `docs/` | 当前素材来源、作品文案与公开数据核对约定 |
| `assets/`、`images/`、`files/` | 背景、作品截图、图标、二维码和简历 PDF |

`files/resume-yangkun-ai-product-engineer.pdf` 当前对应 2026-10-29 版《杨锟 - AI产品经理 / AI应用工程师》。更新简历时保留此路径，并同步修改 `index.html` 的 `?v=` 查询串。

## 阅读器设计

桌面端在作品区接近视口时按需加载 WebGL 三维作品册。静止页用原生 DOM 文字投射到纸面，卷曲翻页时才使用 Canvas 纹理；纹理启用 mipmap 与最高 8× 各向异性过滤，减轻斜角翻动时的锯齿和糊字。

触屏设备走同一套原生文字书页，不加载 WebGL，不按 `MicroMessenger` 分流，也不拦截文档级 `touchmove`。翻页过程中入场纸页从第一帧起就是清晰、不透明的 DOM 文字；只有离场纸页做水平位移，纸页之间不做 `rotateY`、`scale`、模糊或透明度交叉。纵向滚动仍由浏览器处理，横滑、纸面箭头、目录和外部控制均可翻页。

这套分界解决的是旧实现中「静止页清晰、手指触到或纸页卷起时切回低清纹理」的跳变，也避免微信宿主下拉手势、WebGL 上下文丢失和 UA 专用分支互相放大。桌面保留三维纸张的质感，手机优先保证文字稳定和手势顺滑。

## 微信内置浏览器

录屏中的进度条和页面反复进入需要与微信宿主行为一起排查；源码没有自动刷新、定时跳转或 `http-equiv="refresh"`。旧线上版本从 GitHub Pages 跨域请求 `https://baojian-personalweb.vercel.app/api/visit`，又在微信里附加文档级触摸拦截和 WebGL 分支。本次移除这些不必要的移动端差异，减少网络与图形状态切换；它们是否是录屏中反复进入的直接原因，仍需真机复验，不能仅凭 UA 模拟判断。

当前实现：

- GitHub Pages 等静态域名不发起跨域计数请求；只有同源 Vercel 或 Vercel CLI 默认的 localhost:3000 才请求 `/api/visit`。
- 微信、Safari 和其他触屏浏览器共用同一套轻量原生书页。
- 页面不再阻止纵向滚动，也不按微信 UA 追加脚本或事件监听。
- 微信对非备案/非白名单链接展示的「继续访问」提示属于平台策略，本站代码不能绕过；发布后仍需在真机微信复验。

## 内容与素材

新增作品时，在 `index.html#projects` 增加一个带 `data-book-category` 的项目文章，补齐标题、简介、图标和链接；目录和两页书页会自动生成。分类、产品文案和公开数据核对规则见 `docs/portfolio-catalog-content.md`，封面与纸纹素材来源见 `docs/book-cover-asset.md` 和 `docs/book-paper-asset.md`。

修改 CSS/JS/PDF 后更新 `index.html` 中对应资源的 `?v=` 查询串，确保 GitHub Pages 和浏览器缓存拉取新版本。提交前运行测试，并确认新增本地资源确实被页面或测试引用。

编辑器配置、QA 截图、临时规划和 planning-with-files 产物由 `.gitignore` 排除，不纳入发布树。

## 部署与验证

主站由 GitHub Pages 从 `main` 分支发布；`vercel.json` 只启用干净 URL。Vercel 是可选的同源部署，用于 `api/` 下的函数：

- `KV_REST_API_URL`、`KV_REST_API_TOKEN`：启用持久化访客计数和站长状态。
- `OWNER_STATUS_TOKEN`：仅用于初始化站长状态写入令牌。

这些变量只在服务端读取，仓库不包含密钥。静态托管不需要配置环境变量。

浏览器验收建议覆盖桌面 1440×1000、手机 390×844：首屏、静止书页、翻页中态、目录跳转、外链、横向溢出和控制台错误。自动化浏览器检查不能替代真机微信/Safari 的触摸、帧率、宿主页恢复和「继续访问」行为；这些必须在发布后用真实设备复验。

## 依赖与许可

运行时无 npm 包和 CDN 框架依赖。仓库内 vendored 文件包括：

- Three.js r160，MIT，许可见 `js/vendor/three.LICENSE`。
- GSAP 3.15 与 ScrollTrigger，仅在桌面端加载，文件位于 `js/`。
- Google Fonts 以非阻塞方式加载；正文和书页优先使用系统中文衬线字体。

© 2026 Killian Yang. 页面文案与原创项目素材保留所有权利；第三方仓库和产品链接归各自所有者。
