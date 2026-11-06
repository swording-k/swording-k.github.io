# 首页学校与组织标识

首页三条个人信息后的小标识，来源为各官网提供的校徽或站点图标。

| 标识 | 官方来源 | 本地文件 |
| --- | --- | --- |
| 中南大学 | https://www.csu.edu.cn/zjzn/xxbs/xh.htm ，图片 https://www.csu.edu.cn/__local/5/85/66/A8DA6D0E8DD76C7FDDB81792C28_F0410DE8_8BDF4.png | `images/affiliation-csu.png` |
| LEV0 | https://lev0.cn/ 的 `/favicon.png` | `images/affiliation-lev0.svg` |
| 洋来社 / IGNAI | https://www.ignai.cn/ 官方运行配置 `BLOG_FAVICON` 指定 `/brand/ignai/favicon-512.png` | `images/affiliation-ignai.svg` |

保留官网标识轮廓，原始图片嵌入 SVG 的 data URI，不依赖运行时外站请求。LEV0 收紧画布空白；IGNAI 原图带烘焙的灰白棋盘，SVG 颜色矩阵使用红蓝通道差隔离原火炬，避免带入棋盘背景。页面用 CSS alpha mask 统一着金色，18px、72% 不透明度，无底框、无新增动画、无运行依赖。文字和外链均保持原样。
