# 内容维护手册(写给 Lawrence)

这个网站的所有内容都是**普通文件**,你(或帮你维护的人 / Claude)改文件、推送到 GitHub,网站就自动更新。不需要懂编程。

---

## ✅ 上线前检查清单(必做)

- [ ] `src/data/site.ts`:填真实 **WhatsApp 号码**(格式 `60123456789`,不带 +)
- [ ] `src/data/site.ts`:填真实 **REN 编号** 和 **所属 Agency 名称**
- [ ] `src/data/site.ts`:填社媒链接(TikTok / FB / IG / YouTube / 小红书,没有的留空)
- [ ] `src/data/awards.ts`:换成**真实奖项**和真实数字(年资、成交组数)
- [ ] `src/content/testimonials.json`:把 6 条**示例见证换成真实客户见证**(示例数据带 `"placeholder": true`,替换后把这个字段删掉或改成 `false`,页面上的"示例"标签就会消失)。⚠️ 见证必须真实,虚构见证有法律与信誉风险
- [ ] `src/content/videos/`:把每个文件里 `videoUrl` 的 `TODO-替换` 链接换成你的真实视频链接
- [ ] 照片:见下方「换照片」
- [ ] 全站搜一次 `TODO`,确认没有漏网:项目里所有待办都带这个标记

## 🔗 每次改完之后:一定给你这两个链接(标准交付)

**规则(写死):以后网站只要有任何一处改动 / 修改 / 更新,交付时必须同时给你下面这两种链接,缺一不可。** 这样你既能"看效果",又能"拿去发布"。

1. **检查链接(预览 / Preview)** —— 打开就能直接看到改完后的网站长什么样,用来核对效果对不对。
   - 例:`https://claude.ai/code/artifact/b6335b6e-8e30-4079-a296-8896ddaa41d2`
2. **Copy HTML 工具链接** —— 打开后下拉选页面 → 点「📋 Copy」→ 把整份 HTML 贴到你的发布平台(qiai)。这是你真正拿去上线用的。
   - 例:`https://claude.ai/code/artifact/d9a43e29-3031-4dda-95d0-7da407611eab`

> 说明:这两个链接每次都是**同一个网址**(内容会刷新成最新版),所以你可以收藏起来,每次改完打开就是最新的。
> 如果哪次交付只给了其中一个,请直接回一句"另一个链接呢",按规矩两个都要给齐。

### ✅ 交付前自检(强制,Claude 每次交付前必须做完才能给链接)

> 来历:2026-07-21 发生过一次事故——文件生成了,但 **Copy HTML 那个链接忘了重新发布**,用户复制到的是旧版(旧价格、没有新筛选按钮)。为杜绝再发生,定下这条规矩。

每次交付前,按顺序检查,**五条全部通过才可以把链接发给用户**:

1. **两个链接都真的重新发布过了**——不是只重新生成了文件,而是「检查链接(预览)」和「Copy HTML 工具」两个 Artifact **都执行了发布动作**,且都返回成功。
2. **本轮改动在发布的内容里查得到**——用这一轮修改的**具体内容**(新价格、新按钮名、新文字)去发布的文件里逐项 grep 验证:新内容必须查得到,被替换掉的旧内容必须是 0 残留。
3. **项目总数点算(只要这一轮动过"项目",就是强制)**——凡是新增、删除、改分类、改筛选等任何涉及项目的改动,交付前必须点算清楚:
   - 以**用户给的清单**为准算出应有的总数(已存在跳过、FULLY SOLD 跳过、资料不全跳过的,逐一列明去向,一个都不能不明不白地消失);
   - 逐项核对:**All 的总数**、**每个地区按钮的数字**、**Special(如 Penthouse)的数字**,三者都要和实际渲染出来的卡片数一致(用构建产物数卡片,分页的要翻页加总);
   - 数字对不上 = 不许交付,**马上查明原因、修正、重新点算**,直到全部对上为止,然后才走第 1、2 条重新发布验证。
4. **预览链接必须"能打开"验证(强制)**——来历:2026-07-22 预览多次因为文件太大 / 内联图片太多,在 claude.ai 查看器里打不开(尤其手机)。以后每次发预览前必须做到:
   - **体积门槛**:`site-preview.html` 必须 **≤ 5MB(目标 ~4MB)**。超了就把预览工具的图片压得更狠(降 width / quality)、或把重复内联的图片(如跑马灯的多份拷贝)在预览里collapse 成一份,重建到达标为止。**注意**:这只压「预览」这一个工具的图,**不动网站源码、也不动 Copy HTML 工具**(Copy HTML 按路径引用图片,体积与画质都不受影响)。
   - **真机加载验证**:用无头浏览器实际加载重建后的 `site-preview.html`,确认①首页能渲染、②本轮改的那一页(切到对应标签)能渲染出预期内容、③控制台 **0 报错**。
   - 体积或加载任一不过 = 不许把预览链接发给用户,先修到过为止。
5. **只有 1–4 全部通过才交付**;任何一条失败,先修好、重新发布、重新验证,然后才回复用户。

> 用户侧的快速抽查法:打开 Copy HTML 工具,随便搜一个这轮刚改的字眼(比如新价格)。搜不到 = 我没交付对,直接叫我重发。

### ⚠️ 新开 subpage 标准流程(qiai)—— 照做就不会再出"顶栏被压缩"的问题

> **背景(2026-07 踩过的坑)**:Subpage 2 曾经整页在手机上被压缩(顶栏 logo 变小、两侧白边)。查出来的原因:那一页的代码**被 qiai 的 AI 改写过**——文字被改、排版被改、圆角被改,我们代码里自带的手机适配也被丢掉了。**只要是"直接贴源代码"建的页(像 main page 那样),就完全正常。**

**以后每次新开 subpage,严格走这四步:**

1. **只从「Copy HTML 工具」拿代码**,选对应页面 → 点 📋 Copy。
2. **用"直接贴源代码"的入口贴**(和 main page 同一种建法)。**绝对不要**把代码丢给 qiai 的 AI 去"生成/转换/优化"——AI 会重写整页,问题就是这么来的。
3. **必须整份贴**:从第一行 `<!doctype html>` 一直到最后的 `</html>`,不能删、不能只贴一段。
4. **贴完 30 秒验收(三个暗号,手机上看):**
   - ✅ 顶栏和 main page **一样大**:金徽标 + LLP/PROPERTY + 金色 WHATSAPP 按钮(带 WhatsApp 图标)+ ☰,深蓝条**贴满屏幕两边**(没有白边);
   - ✅ 页面上的**英文句子和 Copy HTML 里一字不差**(被 AI 改写过的页,句子会"意思一样但字不一样");
   - ✅ 整页字号正常,没有"整页缩小、字变小变挤"的感觉。
   - ❌ 三条里任何一条不对 → 说明这页又被平台改写了:删掉整页内容,回到第 2 步重贴一次。

**如果直贴后手机上仍然整页缩小**(极少见):去 qiai **该页的页面设置**找"移动端适配 / 手机版 / viewport"开关打开,并对照 main page 那页的设置照抄(main page 是正常的,它的设置就是标准答案)。

> 💡 想在工具里多加一个页面(比如 About 页也要发布)?直接跟 Claude 说一声"把 About 加进 Copy HTML 的 list",马上加。

---

## 🎞️ 数字渐增动画标准(定稿,2026-07-22)

**规则:全站任何"数字从小数到大"的 motion(数据条、以后新加的统计数字等),时长一律 1.6 秒**(ease-out 缓动、滚进视野才开始、计数中金色、数完落回深蓝)。这是踩了很多轮坑之后定下来的原版 Vividz landing page 规格——之前放到 3.2 秒反而在部分手机上失效,不要再调慢。技术实现固定用"真实文字 + requestAnimationFrame 改写"(双通道:`<script>` + 图片 onerror 后备),不要再用纯 CSS counter 方案(iPhone 上不可靠)。

---

## 🧩 统一顶栏(全站每一页都一模一样 · 标准)

**规则:全站每一个页面 —— 不管新页面还是旧页面 —— 顶部的这一条导航栏必须完全一致(logo、按钮、菜单、颜色全部相同)。** 和页脚一样,这是为了让整个网站看起来是同一个品牌、同一个网站。

**同样是"自动强制"的,你什么都不用做。**
全站的顶栏只有**一份代码**(`src/components/Header.astro`),每一页都通过统一版式(`BaseLayout`)自动套用。所以新页面一建出来、Copy HTML 导出的每一页,顶部都**自动是这条一模一样的栏**。想改就**只改这一个地方**,全站 34 页同时更新。

**顶栏的标准内容(以此为准,任何页面都应长这样):**

- **深蓝色吸顶条**(往下滚动时一直固定在最上面)。
- **左边**:金色六边形徽标 + 两行字 **LLP**(白色)/ **PROPERTY**(金色)。
- **右边**:金色 **WHATSAPP** 按钮 + **汉堡菜单 ☰**(点开是全部页面链接:Properties / Buyer Guides / Videos / Areas / Testimonials / About / Contact)。

> ⚠️ 和页脚同理:千万不要在某个页面手写/贴一个不同的顶栏。要改就改 `Header.astro`(logo、按钮、菜单)或 `src/data/site.ts`(WhatsApp 号码),保证全站永远统一。

---

## 🧩 统一页脚(全站每一页都一模一样 · 标准)

**规则:全站每一个页面 —— 不管新页面还是旧页面 —— 底部的页脚必须完全一致(文字、内容、排版全部相同)。** 这是为了让整个网站看起来是同一个品牌、同一个网站,不会东一块西一块、颜色乱七八糟。

**好消息:这条规则已经"自动强制"了,你什么都不用做。**
全站的页脚只有**一份代码**(`src/components/Footer.astro`),每一页都通过统一版式(`BaseLayout`)自动套用它。所以:

- 你**新加的任何页面**(文章、视频、区域、落地页…)一建出来,底部就**自动是这个页脚**,不用手动复制;
- 用「Copy HTML 工具」导出的**每一页**,里面都已经**内建了这个一模一样的页脚**;
- 想改页脚?**只改这一个地方**(`Footer.astro` 或 `src/data/site.ts` 里的联系方式),全站 34 页**同时更新**,永远不会出现两页页脚不一样。

**页脚的标准内容(以此为准,任何页面都应长这样):**

- **CONTACT(左栏)**
  - 📞 +6019-9939 860
  - ✉️ LawrenceLawProperty@gmail.com
  - 📍 No. 11G, Medan Kelang Lama 28, No. 419, Jalan Kelang Lama, 58000 Kuala Lumpur
  - 社媒链接(每个链接前面**必须带对应平台的 logo 图标**,图标随文字同色、hover 变金,全站统一):
    - Facebook(f 标志)
    - Instagram(相机标志)
    - YouTube(播放键标志)
    - XHS · Lawrence Law 刘智权(「红」字小方块标志)
    - 图标是画在 `Footer.astro` 里的内嵌 SVG,不依赖外部图片,贴去任何平台都能显示;新增社媒时也要照这个规矩配 logo。
- **QUICK LINKS(中栏)**
  - Properties · Buyer Guides · Videos · Areas · Testimonials · About · Contact
- **品牌区(右栏,靠右对齐)**
  - **Lawrence Law 刘智权**
  - New Property Specialist with Subsales Expertise. Serving the entire Malaysia New Properties.
  - REN 26610 · REGISTERED REN
- **底部版权条(居中)**
  - Content on this site is for general reference only and does not constitute investment or legal advice.
  - © 2026 Lawrence Law Property™ · All Rights Reserved · Privacy Policy | Terms of Service

> ⚠️ 千万不要在某个页面里**手写/贴一个不同的页脚**。要改就改 `Footer.astro`(版式/链接)或 `src/data/site.ts`(电话、邮箱、地址、社媒),这样才能保证全站永远统一。上面的电话/邮箱/地址/社媒都是从 `src/data/site.ts` 读的,改一处、全站页脚同步。

---

## 📷 换照片(照着这张表命名,上传即自动生效)

把照片文件**用下面的确切文件名**上传到 GitHub 仓库的 `public/images/` 文件夹
(GitHub 网页 → 进入 `public/images/` → Add file → Upload files → Commit)。
文件名对了,网站下次部署时自动显示;没上传的位置会继续显示占位图,不会破图。

| 上传文件名(必须一字不差) | 用在哪里 | 建议尺寸/比例 |
| --- | --- | --- |
| `logo.png` | 页首 logo(金色楼宇那个) | 正方形,≥200×200 |
| `lawrence-portrait.jpg` | 首页 Hero + About 大照片 | 竖版 4:5,宽 ≥800px |
| `certificate-first-deal.jpg` | About「首单故事」证书照 + 奖项区第 1 张 | 横/竖均可 |
| `award-2.jpg` / `award-3.jpg` | 奖项区第 2、3 张(名称也要告诉我) | 4:3 |
| `property-oaka.jpg` | OAKA Residence 房源卡 | 横版 3:2,宽 ≥1200px |
| `property-queenswoodz.jpg` | Queenswoodz 房源卡 | 横版 3:2 |
| `property-ayanna.jpg` | Ayanna Residence 房源卡 | 横版 3:2 |
| `property-ren.jpg` | REN Residence 房源卡 | 横版 3:2 |
| `property-kingswoodz.jpg` | Kingswoodz 房源卡 | 横版 3:2 |
| `property-park-green.jpg` | Park Green 房源卡 | 横版 3:2 |
| `testimonial-adrian.jpg` | 见证:Adrian | 横版 4:3 |
| `testimonial-hoong-tat.jpg` | 见证:Hoong Tat | 横版 4:3 |
| `testimonial-sook-fun.jpg` | 见证:Sook Fun | 横版 4:3 |
| `testimonial-lily-yong.jpg` | 见证:Lily Yong | 横版 4:3 |
| `testimonial-kavita.jpg` | 见证:Kavita | 横版 4:3 |
| `testimonial-lee.jpg` | 见证:Lee | 横版 4:3 |

注意:文件名全部小写;后缀 `.jpg`(如果你的文件是 .png/.jpeg,改名成 .jpg 或告诉我帮你改代码);
上传前先压缩(tinypng.com),单张 ≤300KB 最理想。

**新增房源的照片规则**:每个新项目的照片一律命名 `property-<项目名小写连字符>.jpg`(例如 Gen Starz → `property-gen-starz.jpg`、Riverville 2 → `property-riverville-2.jpg`),上传到 `public/images/` 即自动显示;没上传前显示品牌占位图,不会破图。


## ✍️ 加一篇买房指南文章

在 `src/content/guides/` 新建 `文件名.md`(文件名用英文小写加连字符,会成为网址):

```markdown
---
title: 文章标题
description: 一两句摘要(会显示在列表和 Google 搜索结果)
category: 避坑指南        # 只能是:买房知识 / 避坑指南 / 贷款攻略 / 购房流程
publishDate: 2026-08-01
featured: true            # 可选:true = 出现在首页精选
faqs:                     # 可选:会变成 FAQ 手风琴 + Google FAQ 结构化数据
  - question: 问题?
    answer: 答案。
---

正文用 Markdown 写:## 二级标题、**加粗**、- 列表 …
```

💡 最省力的做法:**每支短视频的主题写成一篇文章**,把视频里讲的话展开成文字。一支视频 = 一篇文章 = 一个 Google 搜索入口。

## 🎬 加一支视频

在 `src/content/videos/` 新建 `文件名.md`:

```markdown
---
title: 视频标题
platform: tiktok          # youtube / tiktok / instagram / facebook
videoUrl: https://www.tiktok.com/@你的账号/video/1234567890
category: 避坑            # 只能是:避坑 / 贷款 / 流程 / 项目 / 答疑
publishDate: 2026-08-01
featured: true            # 可选:首页精选
---
```

**YouTube 长视频**(重点!)加两个字段,并把要点写进正文:

```markdown
---
title: 长视频标题
platform: youtube
videoId: dQw4w9WgXcQ       # YouTube 链接 v= 后面那串
videoUrl: https://www.youtube.com/watch?v=dQw4w9WgXcQ
category: 流程
publishDate: 2026-08-01
featured: true
longform: true
---

## 本期要点

- 00:00 章节一
- 05:30 章节二
```

发布长视频后,**把这个页面的网址放进 YouTube 描述区**("完整图文版:链接"),把观众导回你自己的网站。

## 💬 加客户见证

打开 `src/content/testimonials.json`,复制一段花括号 `{...}` 改内容即可。`featured: true` 的会出现在首页(首页只显示前 3 条 featured)。

## 🗺️ 更新区域页

`src/content/areas/*.md` 每个文件是一个区域。可以随时:
- 更新正文(板块分析);
- 在 frontmatter 加 `hotProjects` 列出近期值得关注的项目:

```yaml
hotProjects:
  - name: 项目名
    type: 服务式公寓
    priceFrom: RM4xx k
    note: 靠近 MRT
```

## 🎯 加一个项目落地页(landing page)

落地页在 **网站这个 session 做**(这里有品牌样式、86 个项目数据、追踪代码),
做好后贴到 qiai;`Project-Info-Master` 只负责记录"哪个项目有落地页"这个事实。
两边分工:**资料的源头在 master,建造的源头在这里。**

```
① 你在这个 session 做落地页
        ↓
② 你贴到 qiai,拿到网址(如 lawrencelawproperty.com/papyrusexsim)
        ↓
③ 跟 Claude 说一声 —— 剩下的全自动:
     ⒜ 写进 master CSV 的 landing_page 栏 + push
        (master 依然是资料的唯一源头,你不用去那边手动填)
     ⒝ 同步到网站:卡片(图片/标题/View Details)、详情页
        「Full Project Tour」按钮、首页楼盘滚动条 —— 全部自动接好
     ⒞ 重建 Copy HTML → 你重贴受影响的页面(通常是 Home + All Properties)
```

**撤下一个落地页**(项目售罄等):跟 Claude 说一声就行 —— 把 master CSV 那一格清空,
同步后卡片自动改回 github.io 详情页,「Full Project Tour」按钮自动消失。
qiai 上那个页面本身留着不影响(没有入口),以后要接回来随时说。

**注意**:落地页的 HTML 目前只存在 qiai 后台,仓库里没有备份。
建议把每一页的 HTML 交给 Claude 归档进 `landing-pages/`,这样有版本历史、
以后改价格或加追踪能直接动源码。

## 🔄 改完之后怎么发布?

1. 所有改动 push 到 GitHub 的 `main` 分支;
2. GitHub Actions 会自动构建 + 部署(约 2 分钟),Actions 页签能看进度;
3. 最简单的方式:直接开一个 Claude 会话说"帮我在网站加一篇文章,主题是 XXX"。

## 📊 启用数据统计(建议上线后一周内做)

1. 注册 [Google Analytics 4](https://analytics.google.com),拿到 `G-XXXXXXXXXX`,填入 `src/data/site.ts` 的 `ga4Id`;
2. 有投放 FB/IG 广告计划的话,把 Meta Pixel ID 填入 `metaPixelId`;
3. 注册 [Google Search Console](https://search.google.com/search-console),验证网站并提交 sitemap(`网址/sitemap-index.xml`)——这一步能让 Google 更快收录你的文章;
4. 建议同时注册/完善 **Google Business Profile**(Google 地图商家),对本地搜索帮助很大。
