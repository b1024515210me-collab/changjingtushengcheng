# 产品场景图生成网站：详细实施方案（MVP）

## 1. 项目范围与目标

### 1.1 目标
构建一个 Web 应用，帮助商家将“产品白底图/透明底图”快速生成不同场景营销图，并支持去水印和二次编辑。

### 1.2 MVP 必做能力
1. 上传产品图（必选）
2. 上传场景参考图（可选）
3. 选择风格参数（视觉风格、场景风格、尺寸）
4. 生成场景图（异步任务）
5. 去水印（对生成图进行修复）
6. 修改生成图（文字编辑 + 可选局部重绘）
7. 历史记录与结果下载

### 1.3 非目标（V1 之后）
- 多租户企业后台
- 精细化角色权限
- 复杂计费（套餐、支付）
- A/B 测试平台

---

## 2. 信息架构（IA）

### 2.1 页面结构
1. `/` 工作台（Create）
   - 产品图上传区
   - 场景参考图上传区（可选）
   - 参数配置区（风格、场景、尺寸、数量）
   - 任务提交按钮
2. `/tasks` 历史任务列表
   - 任务状态（排队/处理中/成功/失败）
   - 快速筛选（日期、风格）
3. `/tasks/:id` 任务详情页
   - 输出图网格
   - 单图操作：下载 / 去水印 / 编辑 / 复用参数再生成
4. `/editor/:imageId` 图片编辑页
   - 编辑提示词输入
   - 可选 mask 上传（局部编辑）
   - 编辑结果版本列表

### 2.2 关键用户流程
#### 流程 A：标准生成
上传产品图 -> 配置参数 -> 提交 -> 轮询任务状态 -> 查看结果 -> 下载。

#### 流程 B：参考图生成
上传产品图 + 场景参考图 -> 选择风格 -> 提交 -> 查看结果。

#### 流程 C：去水印
在结果页选择图片 -> 点击去水印 -> 生成修复图 -> 替换/另存版本。

#### 流程 D：修改生成图
在结果页点击编辑 -> 输入修改指令（可选 mask）-> 输出新版本 -> 选择下载。

---

## 3. 功能规格

## 3.1 上传能力
- 支持 JPG/PNG/WebP
- 单图大小上限：10MB（MVP）
- 分辨率建议：最短边 >= 768px
- 上传时进行基础校验：格式、大小、像素

### 3.2 参数定义
- `style`（视觉风格）
  - realistic / minimal / luxury / tech / warm_life
- `sceneStyle`（场景风格）
  - living_room / kitchen / office_desk / outdoor / cafe
- `ratio`（尺寸比例）
  - 1:1 / 4:5 / 16:9 / 9:16
- `numOutputs`（输出数量）
  - 1~4

### 3.3 生成结果能力
- 图片预览
- 原图与去水印版切换
- 下载（文件名包含任务号和版本号）

### 3.4 去水印能力
- 输入：目标图片 URL 或图片 ID
- 输出：无水印修复图
- 策略：优先调用图像修复模型；失败时给出可重试提示

### 3.5 编辑能力
- 输入：源图片 + 编辑指令 + 可选 mask
- 模式：
  - 全图改写（image edit）
  - 局部重绘（inpainting）
- 输出：新版本图片，保留 lineage（版本父子关系）

---

## 4. 技术方案

## 4.1 推荐技术栈
- 前端：Next.js 15 + TypeScript + Tailwind + Zustand
- 后端：FastAPI（Python）
- 异步任务：Redis + Celery / RQ
- 存储：PostgreSQL（元数据）+ S3 兼容对象存储（图片）
- 部署：
  - 前端：Vercel
  - 后端：容器化（Fly.io / Render / ECS）

### 4.2 架构图（文字版）
1. 前端提交生成请求至 API
2. API 写入任务表（pending）并投递队列
3. Worker 调用模型服务生成图片
4. 成果上传对象存储，写回 DB（succeeded）
5. 前端轮询或 websocket 获取任务结果

### 4.3 模型服务抽象层
定义统一 Provider Interface，便于替换底层模型：
- `generateScene(input)`
- `removeWatermark(input)`
- `editImage(input)`

---

## 5. 数据库设计（MVP）

## 5.1 users
- id (pk)
- email
- created_at

## 5.2 tasks
- id (pk)
- user_id (fk)
- type (`generate` | `remove_watermark` | `edit`)
- status (`pending` | `running` | `succeeded` | `failed`)
- params_json
- error_message
- created_at / updated_at

### 5.3 images
- id (pk)
- task_id (fk)
- parent_image_id (nullable)
- kind (`generated` | `watermark_removed` | `edited`)
- storage_url
- width / height
- created_at

### 5.4 assets
- id (pk)
- user_id (fk)
- asset_type (`product` | `scene_ref` | `mask`)
- storage_url
- metadata_json
- created_at

---

## 6. API 设计（详细）

### 6.1 提交生成任务
`POST /api/v1/tasks/generate`

Request:
```json
{
  "productAssetId": "ast_xxx",
  "sceneRefAssetId": "ast_optional",
  "style": "realistic",
  "sceneStyle": "living_room",
  "ratio": "4:5",
  "numOutputs": 2
}
```

Response:
```json
{
  "taskId": "tsk_xxx",
  "status": "pending"
}
```

### 6.2 去水印任务
`POST /api/v1/tasks/remove-watermark`

Request:
```json
{
  "imageId": "img_xxx"
}
```

### 6.3 编辑任务
`POST /api/v1/tasks/edit`

Request:
```json
{
  "imageId": "img_xxx",
  "prompt": "将背景改为现代客厅，晨光氛围",
  "maskAssetId": "ast_optional"
}
```

### 6.4 查询任务状态
`GET /api/v1/tasks/:taskId`

Response:
```json
{
  "id": "tsk_xxx",
  "status": "succeeded",
  "images": [
    {"id": "img_1", "url": "https://..."}
  ]
}
```

### 6.5 资源上传
`POST /api/v1/assets/upload-url` 获取预签名 URL
`PUT <signed_url>` 直传
`POST /api/v1/assets/complete` 确认上传

---

## 7. 非功能需求

### 7.1 性能
- 首屏 < 2.5s（P75）
- 单任务平均完成时间 < 30s（模型服务稳定时）

### 7.2 稳定性
- 任务失败可重试
- 幂等键避免重复扣费/重复生成

### 7.3 安全
- 上传白名单校验（MIME + 魔数）
- 对象存储私有权限 + 签名访问
- 基础风控（速率限制）

### 7.4 可观测性
- API 请求日志（traceId）
- 任务状态流转日志
- 错误分级告警（4xx/5xx/worker fail）

---

## 8. 里程碑与排期（建议）

### Milestone 1（第 1-2 天）
- 前端页面骨架
- 上传流程 + 参数表单
- 后端任务 API 框架

### Milestone 2（第 3-4 天）
- 打通生成任务（端到端）
- 结果页展示与下载

### Milestone 3（第 5-6 天）
- 去水印任务
- 编辑任务（全图）

### Milestone 4（第 7-8 天）
- 局部编辑（mask）
- 历史版本与任务列表
- 上线前联调与修复

---

## 9. 风险与预案
1. 模型稳定性波动：
   - 预案：Provider 抽象 + 熔断 + 重试
2. 生成耗时过长：
   - 预案：异步队列 + 前端进度态 + 超时提示
3. 去水印效果不稳定：
   - 预案：增加二次修复参数与手动编辑入口

---

## 10. 开发执行清单（确认后进入编码）
1. 初始化 monorepo（web/api）
2. 落库 schema 与迁移
3. 实现上传服务
4. 实现 generate / remove-watermark / edit 三类任务
5. 实现任务查询与结果展示
6. 增加基础监控与错误处理

