# 落地页源码归档

Lawrence 手工做的项目落地页,发布在主域名 qiai 上。这个资料夹是它们的
**唯一备份和源码仓库** —— qiai 后台没有版本历史,一旦覆盖就永久丢失。

## 目录规则

一页一个文件,文件名 = 网址最后那一段:

| 文件 | 线上网址 | 项目 |
|---|---|---|
| `oakaberjaya.html` | lawrencelawproperty.com/oakaberjaya | OAKA Residences |
| `queenswoodzexsim.html` | …/queenswoodzexsim | Queenswoodz |
| `renbukitjalil.html` | …/renbukitjalil | REN Residence |
| `kingswoodzexsim.html` | …/kingswoodzexsim | Kingswoodz |
| `vividzexsim.html` | …/vividzexsim | Vividz |
| `theatera.html` | …/theatera | Atera |
| `aldenzexsim.html` | …/aldenzexsim | Aldenz |
| `deviaexsim.html` | …/deviaexsim | D'Evia |
| `bukitjalil.html` | …/bukitjalil | Bukit Jalil 区域介绍 |
| `veladazexsim.html` | …/veladazexsim | Veladaz(已售罄,网站链接已撤) |

## 怎么归档一页(从 qiai 拿源码)

1. qiai 后台打开那一页 → 进 HTML/代码编辑模式 → **全选复制**整段 HTML
2. 贴给 Claude,说「这是 XXX 落地页的源码,存进 landing-pages/」
3. Claude 存档 + commit + push,以后就有版本历史了

## 归档之后能做什么

- **改内容**:换价格、改 CTA、加追踪 → Claude 直接改源码,你从这里复制重贴回 qiai
- **做 audit**:检查 GA4/Pixel 有没有装、手机端排版、加载速度、按钮追踪
- **还原**:任何时候能翻回旧版本

## 落地页与网站的关系

网址记录在 `Project-Info-Master` 的 `landing_page` 栏,同步后自动接进
All Properties 卡片、详情页「Full Project Tour」按钮、首页楼盘滚动条。
详见 `CONTENT-GUIDE.md` 的「🎯 加一个项目落地页」。
