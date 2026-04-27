# Product Scene Generator (MVP Prototype)

这个仓库当前包含一个可运行的 MVP 原型：

- `api/`：FastAPI 后端，提供上传、生成、去水印、编辑、任务查询、图片访问接口。
- `web/`：静态前端页面，提供最小可用工作流。

## 快速启动

### 1) 启动后端
```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2) 打开前端
直接用浏览器打开 `web/index.html`。

> 默认请求地址是 `http://127.0.0.1:8000`。

## 当前实现说明

- 生成逻辑使用本地 mock（Pillow 合成），便于快速验证流程。
- 所有任务均为内存态，不具备持久化能力（重启进程会丢失）。
- 这是 Phase 1 的可运行起点，后续可替换为真实模型服务和异步队列。
