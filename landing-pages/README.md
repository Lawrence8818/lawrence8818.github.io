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

## 不写售价(2026-11-11 起)

Lawrence 的要求:全站不显示售价,只讲月供,落地页也一样。

- 四页底部执照披露栏里原有的「Selling price」已经拿掉:
  `aldenzexsim`、`clouthausklcc`、`renbukitjalil` 换成月供起步金额;
  `khayabangsar` 没有月供资料,整行删除。
- 这几个月供金额是**写死在 HTML 里的**,不随每日同步更新。
  Project-Info-Master 的 `monthly_from` 改了,要手动来这里跟着改。
- 新做的落地页同样不要写售价。

## 不显示所属公司、不放顶部横幅(2026-11-11 起)

Lawrence 的要求,9 页都已照做,新页面也要照做:

- **顶部不放** "Independent Marketing Site by … | Authorized Agency" 那一行。
  旧页面里留着一个空的隐藏元素 `<div class="topbar" hidden></div>`,
  **不要删** —— 页面脚本还会去量它的高度,删掉脚本会报错。
- **底部不放**所属公司:Appointed Agency、公司注册号、执照号、公司地址、
  页脚和版权行里的公司名称都已拿掉,只留姓名、REN 26610 和 WhatsApp。
- **仍保留**:最底部法律免责声明里的公司名称(说明本站不是发展商官网、由谁运营)。

## 示范单位怎么回答(2026-11-11 起)

问答里「Can I visit a show unit?」只回答有,不写示范单位或销售画廊的名称、
地址、开放时间,统一接一句:

> Message me and I will arrange a slot and meet you there.

页面其他位置也照同一条规矩(2026-11-12 已全部处理):登记区、步骤说明、位置介绍、
页脚、执照披露栏里都不出现画廊名称、所在大楼、地址、地图或开放时间。统一写法:

- 清单里:`A viewing appointment, arranged by me`
- 步骤里:`We book a viewing — I'll arrange a slot and meet you there.`

发展商自己的注册地址(执照披露栏、「Who is the developer」)属于法定资料,保留。

## 构建时自动补上的东西(2026-11-11 起)

这里的源文件保持作者写的原样。`npm run build` 的最后一步
(`scripts/enrich-landing-pages.mjs`)会在**成品**(`dist/<slug>/index.html`)上补:

- 正式网址:canonical / og:url 从旧平台时期的 `https://lawrencelawproperty.com/<slug>`
  改成 `https://www.lawrencelawproperty.com/<slug>/`,不用再跳转两次。
- `FAQPage`:从页面上的问答(`<div class="qa">` 区块)原文生成。
  改了页面上的问答,下次构建标记会自动跟着变,不用另外维护。
- 项目 schema:页面自己没写的(Park Green、Vividz)会补一个。
- `RealEstateAgent`、`WebPage`、`BreadcrumbList`:和全站其他页面一致。

落地页也已经列进 sitemap 和 `llms.txt`。

写新落地页时:问答照旧用 `<div class="qa"><button>问</button><div class="ans">答</div></div>`
的结构,就会自动被读到;不需要自己手写 FAQ 的 JSON-LD。

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
