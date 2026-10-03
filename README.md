# 豆趣 BEAD POP · 拼豆工作台

从照片生成拼豆预览、编号图纸和用豆清单的中文静态网站。

## 功能

- 上传 JPG、PNG、WEBP，最大 20 MB；图片仅在浏览器处理。
- 横向豆数 16–100，颜色数量 4–24。
- 预览拼豆效果和编号图纸，下载 PNG 和 CSV。
- 5 mm / 2.6 mm 成品尺寸估算。
- 响应式界面；透明像素不计入用豆数。

取色采用 RGB 聚类，编号为本图专用，尚未匹配具体拼豆品牌色卡。
高宽比极大的图片会限制纵向为 150 颗并保持比例。
网站无后端、数据库、账号或 API 密钥；Google Fonts 是可选在线字体，加载失败会使用系统字体。
从 Sites 移植后，应用本身不提供访问控制；Coolify 部署的可见性由你的域名和访问控制配置决定。

## Coolify 部署

1. 在 Coolify 新建 Application，选 GitHub 仓库；私有仓库需使用有权限的 GitHub App 或 Deploy Key。
2. 选择分支 `main`。
3. Build Pack 选择 `Dockerfile`。
4. Base Directory 设置 `/`，Dockerfile Location 设置 `/Dockerfile`。
5. Ports Exposes 设置 `80`。使用域名路由时无需设置主机 Ports Mappings。
6. 设置域名并 Deploy；不需要环境变量或持久卷。
7. 如启用 Coolify HTTP 健康检查，设置路径 `/healthz`，端口 `80`。

官方文档：https://coolify.io/docs/applications/builds/dockerfile

可按你的 DNS / Cloudflare Tunnel 设置绑定 `beads.nanlab.xyz` 等域名。

## 本地运行

```sh
docker build -t bead-pop-studio .
docker run --rm -p 8080:80 bead-pop-studio
```

访问 http://localhost:8080 。也可以不使用 Docker：

```sh
python3 -m http.server 8080 --directory public
```

## 项目结构

- `public/index.html`：页面和元信息。
- `public/style.css`：样式和移动端布局。
- `public/app.js`：图片处理、配色、图纸渲染和导出。
- `Dockerfile`、`nginx.conf`：静态网站容器与健康检查。

## 手工验证

上传一张有主体的照片，修改豆数和颜色数，切换预览模式，下载 PNG、CSV，核对清单总数与页面一致。
检查手机布局，以及透明 PNG、非图片文件、超过 20 MB 文件的处理。
