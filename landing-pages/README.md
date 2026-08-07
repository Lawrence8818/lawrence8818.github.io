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

---

## 归档进度(2026-08-06)

| 落地页 | 状态 | 来源 |
|---|---|---|
| oakaberjaya | ✅ 已归档 4.4MB | Copy artifact |
| vividzexsim | ✅ 已归档 3.6MB | Copy artifact |
| queenswoodzexsim | ✅ 已归档 3.1MB(Version F) | Copy artifact |
| aldenzexsim | ✅ 已归档 2.5MB | Copy artifact |
| renbukitjalil | ✅ 已归档 2.0MB | Copy artifact |
| deviaexsim | ✅ 已归档 1.5MB | Copy artifact |
| theatera | ⬜ 待补 | artifact 超出可列范围 |
| kingswoodzexsim | ⬜ 待补 | 同上 |
| veladazexsim | ⬜ 待补 | 同上(已售罄) |
| bukitjalil | ⬜ 待补 | 同上(区域页) |

**未归档的 4 页怎么补**:到 Landing Page Center 那个 session,
让它把该页的 Copy artifact 链接发给你,贴给我,我直接抓取归档。
(artifact 列表只能列最近 50 个,这 4 页做得比较早所以列不到。)

## 审计结果摘要

- ~~追踪全部是占位符~~ **已修复**: —— 6 页的 `G-XXXXXXXXXX` / `AW-XXXXXXXXX`
  原本 `G-XXXXXXXXXX` / `AW-XXXXXXXXX` 从未替换、Meta Pixel 完全没有,
  现已接上 GA4 `G-2G3M1Y4Q6Q` + Pixel `1448303492862108`。
  WhatsApp 点击 → `whatsapp_landing` + Meta `Contact`;
  表单提交 → `lead_form_submit` + Meta `Lead`。
- WhatsApp 号码 6 页一致(60199939860)✅
- 每页 1 个表单 + 内建 thank-you 视图 ✅
- canonical 已全部指向 lawrencelawproperty.com/<页面>(OAKA 原指 oakakl.com、
  Queenswoodz 原指 thequeenswoodz.com,已按 Lawrence 决定改掉;另 4 页原本完全没有)
- deviaexsim 有 10 处 "To be confirmed"(brochure 无 APDL 资料)
- 5 页从 Google Fonts 外链字体(queenswoodz 已内嵌)—— 广告拦截器可能导致字体回退
