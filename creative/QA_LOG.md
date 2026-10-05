# 豆趣 · 本地交付验证
Revision: 2
Date: 2026-10-04

本记录替代第一轮原型的16列/通用聚类编号结果。工程检查与视觉评价分开；不以Skill门禁代替真实浏览器测试。

## 工程检查
环境：本机 headed Chromium / Playwright CLI，静态页面 http://127.0.0.1:8766；1440×1000、390×844、320×844。浏览器可复跑脚本 tests/browser-check.js；原始输出 evidence/browser-run.txt，结构化结果 evidence/browser-result.json。

| 检查 | 状态 | 实际证据与覆盖 |
| --- | --- | --- |
| JavaScript语法/差异格式 | pass | app.js、creative-motion.js语法检查；git diff --check |
| 上传回归 | pass | Node tests/upload.test.cjs 8项：PNG、空MIME、HEIC、超限/格式、读取/解码失败重试、固定板型、透明回滚、异步读取顺序 |
| 真实图像解码 | pass | 浏览器生成PNG/JPEG/WebP文件，走真实FileReader/Image/loadFile；不发送服务器 |
| 三种板型/比例 | pass | 16×8横图：52/78/104均正方形；非空1352/3042/5408格，另一半为居中留白 |
| 透明/错误恢复 | pass | 104×104半透明空白测试排除5408透明格；完全透明和损坏文件保留有效作品，随后可重试；SVG被拒绝 |
| 色表/限色 | pass | 每个输出code/RGB属于本地221色表；实际数量≤4/24；计数总和等于非空cells |
| PNG/CSV一致性 | pass | 下载真实文件；PNG每格及legend文本与result一致，CSV全部行逐项比对；示例640颗、7色；高亮前后PNG二进制完全一致 |
| 聚合运动/取消 | pass | 250ms中间截图与终态画布不同；重复重放后切编号，1秒后画布不再变化 |
| 键盘/减少动态效果 | pass | Enter选择色卡；Enter打开图纸；Esc关闭且焦点恢复；方向键滚动；reduced-motion前后画布一致 |
| 桌面/窄屏 | pass | 390/320整页scrollWidth≤innerWidth；截图实际检查换行。104板放大canvas2912px、局部可滚动 |
| 资源/控制台 | pass | 本轮无pageerror、console error及requestfailed；字体与色表均本地可用 |
| 跨浏览器/真机/性能/打印 | unknown | Safari/Firefox、真机触摸/GPU、帧时分布、Field CWV、真实色差和打印样品未测 |

自动化浏览器37项断言；另有CSV完整比对及PNG字节一致性检查。透明缩放测试起初用16px边界放大，插值产生半透明列；改用与104板一致的104px测试隔离透明计数，不把采样插值判为计算缺陷。重复测试时显式恢复no-preference，避免上次reduced-motion环境污染运动检查。

## 视觉评价（实现者自审，0–10）
查看完整桌面/窄屏、色卡联动、放大图纸及聚合中间截图。分数不是独立用户研究或创意网站排名。

| 维度 | 自评 | 观察、作用与局限 |
| --- | --- | --- |
| 产品契合 | 9 | 上传→作品→材料清单→导出完整；默认示例直接解释产物。未测试真实新手完成率 |
| 层级/构图 | 8 | 纸白/墨色/材料色建立主次；小屏保持单列操作顺序。小屏设置在预览之前，长页面仍有滚动成本 |
| 一致性 | 8 | 绿品牌、紫状态、豆孔色卡与颗粒共享语义；中文短句和数字分层。没有实物摄影验证材料观感 |
| 运动意义/连续性 | 8 | 观察散点到落位，重放/取消/减少动态效果明确。非真机帧率测量 |
| 标志性体验 | 8 | 聚合解释离散材料，选色把作品引向备豆；读图入口独立。没有盲评其新颖度 |

发现并修复：透明失败覆盖源图、旧上传覆盖新上传、PNG图例继承居中对齐、外部字体请求失败；窄屏放大关闭按钮换行、放大初始落在空白。修复后复跑对应测试并重新截图。取消色卡通用入场fade，避免截图与阅读处于淡出状态。完整编号图纸补充空白格线。

## 交付证据
- desktop-final.png、mobile-390-final.png、mobile-320-final.png：终态布局。
- assembly-mid-final.png、color-focus-final.png：聚合中间态和备豆联动。
- detail-final.png、mobile-detail-final.png：逐格读色号与局部滚动。
- pattern-final.png、pattern-focused.png、colors-final.csv：实际下载产物。

全部位于creative/evidence/；第一轮非final文件作为历史证据保留。未推送GitHub、未部署；Docker/nginx未修改。社区RGB说明与完整MIT记录见 THIRD_PARTY_NOTICES.md。
