# 喵语沟通翻译器（微信小程序版）

这个仓库已经整理成可以直接导入微信开发者工具的小程序项目。下载/解压后，不需要再手动搬文件。

## 怎么导入到微信开发者工具

1. 下载这个仓库并解压到本地。
2. 打开微信开发者工具，选择“导入项目”。
3. **项目目录请选择仓库根目录**，也就是能看到 `project.config.json` 的这一层，不要只选择 `miniprogram/` 子目录。
4. AppID 可以先使用配置里的 `touristappid` 体验；如果要真机预览、上传或发布，请在微信公众平台申请小程序 AppID 后替换 `project.config.json` 里的 `appid`。
5. 导入后点击“编译”即可看到页面；点击“预览”扫码，就能在手机微信里使用。

## 已经帮你整合好的结构

```text
.
├── project.config.json        # 微信开发者工具项目配置，已指定 miniprogramRoot
├── miniprogram/               # 小程序源码目录
│   ├── app.json               # 小程序页面和窗口配置
│   ├── app.js                 # 小程序入口
│   ├── app.wxss               # 全局样式
│   ├── sitemap.json           # 小程序索引规则
│   ├── pages/index/           # 首页：输入、翻译、历史、指南
│   └── utils/translator.js    # 喵语翻译规则
├── tests/                     # 本地测试，不会打包进小程序
└── index.html                 # 旧网页预览版，不影响小程序导入
```

`project.config.json` 已设置 `"miniprogramRoot": "miniprogram/"`，所以导入仓库根目录后，微信开发者工具会自动把 `miniprogram/` 当作小程序源码。

## 小程序功能

- 选择猫咪叫声、身体语言和当前场景。
- 输入猫咪名字和补充描述。
- 生成“情绪 + 可能含义 + 回应建议”。
- 最近 5 条翻译记录会保存在手机本地。
- 对排泄、呕吐或高压力信号给出健康提醒。

## 本地测试

如果你本地有 Node.js，可以运行：

```bash
npm test
```
