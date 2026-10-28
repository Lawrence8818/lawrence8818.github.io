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
| `vividzexsim.html` | …/vividzexsim | Vividz |
| `aldenzexsim.html` | …/aldenzexsim | Aldenz |
| `deviaexsim.html` | …/deviaexsim | D'Evia |
| `clouthausklcc.html` | …/clouthausklcc | cloutHaus KLCC |
| `khayabangsar.html` | …/khayabangsar | Khaya Bangsar |
| `parkgreenmalton.html` | …/parkgreenmalton | Park Green |

这 9 个就是全部。曾经列在这里的 `kingswoodzexsim` / `theatera` /
`bukitjalil` / `veladazexsim` 已确定不保留,见下方「归档进度」。

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

## 归档进度(2026-09-20 对账完毕)

依据 qiai 后台页面列表截图逐页对账。**qiai 共 25 页**,结论如下。

### 已归档 · 9 页(全部已成为真实路由)

| 落地页 | 大小 | qiai 后台名称 |
|---|---|---|
| oakaberjaya | 4.4MB | Oaka Bukit Jalil |
| vividzexsim | 3.6MB | Vividz Residence |
| parkgreenmalton | 3.1MB | Park Green Bukit Jalil |
| queenswoodzexsim | 3.1MB | Queenswoodz exsim |
| clouthausklcc | 2.7MB | cloutHaus KLCC |
| aldenzexsim | 2.5MB | Aldenz PJ |
| khayabangsar | 2.1MB | Khaya Bangsar |
| renbukitjalil | 1.9MB | Ren Bukit Jalil |
| deviaexsim | 1.5MB | D'Evia Kwasa Damansara |

另有 5 个主页面(Main Page / about / allproperties / Buyer Guide /
Testimonial)已作为 Astro 页面重建,合计已搬 14 页。

### 不保留 · 11 页(Lawrence 2026-09-20 决定)

| qiai 页面 | 说明 |
|---|---|
| Kingswoodz Residence | 原计划重做,决定不要 |
| Bukit Jalil | 区域介绍页,决定不要 |
| PJ Atera | 原计划重做,决定不要 |
| Veladaz Residence | 已售罄,站内链接早已撤除 |
| 222blueprint | 此前完全未知 |
| Colonialinfinite | 此前完全未知 |
| Whycolonialinfinite | 此前完全未知 |
| Maple OUG | 此前完全未知 |
| Park Green Pavilion | 与已归档的 Park Green Bukit Jalil 重复 |
| Queenswoodz Bukit Jalil | 与已归档的 Queenswoodz exsim 重复 |
| Main Page (Clone) | 首页副本 |

**这些页面随 qiai 退订一并消失,不再归档。** 上面这份清单就是决定记录 ——
以后若有人问「qiai 上是不是还有东西没搬」,答案在这里,不必再猜。

> 对账之前,这 8 页(Veladaz 之后那 8 项)是整个迁移里唯一不可逆的风险:
> 仓库和站内链接都反推不出它们的存在。是后台截图把它们找出来的。

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
