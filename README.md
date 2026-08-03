# Lawrence Law Property — 买家网站

面向马来西亚华人买家的房产顾问网站:买房指南 + 视频中心 + 区域落地页 + WhatsApp 转化。
技术栈:[Astro 5](https://astro.build)(纯静态)+ Tailwind CSS 4,部署到 GitHub Pages。

## 常用命令

```bash
npm install      # 安装依赖
npm run dev      # 本地开发(http://localhost:4321/LLP-recruitment-website/)
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 内容怎么改?

**所有内容都是文件,不需要碰代码。**详见 [CONTENT-GUIDE.md](./CONTENT-GUIDE.md)(中文手册):

| 想做什么 | 改哪里 |
| --- | --- |
| 改 WhatsApp 号码 / REN / 社媒链接 | `src/data/site.ts` |
| 加一篇买房指南文章 | `src/content/guides/` 加一个 `.md` |
| 加一支视频 | `src/content/videos/` 加一个 `.md` |
| 加客户见证 | `src/content/testimonials.json` 加一条 |
| 改奖项 / 信任条数字 | `src/data/awards.ts` |
| 改服务介绍 | `src/data/services.ts` |
| 换照片 | `public/images/` 放图,替换占位路径 |

## 🚀 上线步骤(一次性)

1. **启用 Pages**:GitHub 仓库 → Settings → Pages → Source 选 **GitHub Actions**;
2. 把本分支合并到 `main`,workflow 会自动构建部署到
   `https://lawrence8818.github.io/LLP-recruitment-website/`;
3. **上线前务必**完成 CONTENT-GUIDE.md 里的「上线前检查清单」(真实 WhatsApp 号码、REN、照片、视频链接)。

## 🌐 切换自定义域名 lawrencelawproperty.com

1. 改 `.github/workflows/deploy.yml` 的两行 env:
   `SITE_URL: https://lawrencelawproperty.com`、`BASE_PATH: /`;
2. 新建 `public/CNAME`,内容一行:`lawrencelawproperty.com`;
3. 到域名 DNS 设置:
   - `www` CNAME 指向 `lawrence8818.github.io`
   - 根域名 A 记录指向 GitHub Pages IP(185.199.108.153 / 109 / 110 / 111)
4. GitHub 仓库 Settings → Pages → Custom domain 填入域名并勾选 Enforce HTTPS。

## 分析与广告追踪

`src/data/site.ts` 里填入 `ga4Id`(GA4)和 `metaPixelId`(Meta Pixel)后重新部署即生效;
留空则完全不加载任何追踪脚本。全站 WhatsApp 点击已埋 `whatsapp_click` 事件。
