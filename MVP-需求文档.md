# Image Background Remover — MVP 需求文档

> 文档版本：v1.0
> 创建日期：2026-04-02
> 状态：初稿

---

## 1. 项目概述

**项目名称**：Image Background Remover
**项目类型**：图片处理 Web 应用
**一句话描述**：用户上传图片，自动移除背景并下载结果
**目标用户**：需要快速去除图片背景的非专业用户（设计师、电商卖家、自媒体创作者）

---

## 2. 技术选型

| 层级 | 技术方案 | 说明 |
|------|---------|------|
| 前端 | HTML + CSS + JavaScript | 轻量单页应用 |
| 后端运行时 | Cloudflare Workers | 全球边缘部署，冷启动快 |
| 图片处理 | Remove.bg API | 专业背景抠图 API |
| 存储 | 无持久化存储 | 图片全在内存中流转，不落盘 |
| 部署平台 | Cloudflare Pages / Workers | 免费额度够用，全球 CDN |

**核心依赖**：
- Remove.bg API Key（用户自行申请）
- Cloudflare 账号

---

## 3. 功能需求

### 3.1 核心功能

| 功能 | 优先级 | 描述 |
|------|--------|------|
| 图片上传 | P0 | 支持拖拽或点击上传，限制 JPG/PNG/WebP，最大 10MB |
| 背景移除 | P0 | 调用 Remove.bg API 完成抠图 |
| 结果预览 | P0 | 实时展示原图 vs 处理后对比 |
| 图片下载 | P0 | 一键下载透明背景 PNG |
| 错误提示 | P0 | 上传失败 / API 错误 / 文件过大等友好提示 |

### 3.2 扩展功能（未来版本）

- 批量处理多张图片
- 输出尺寸调整
- 输出格式选择（PNG/JPG/WebP）
- 历史记录（需持久化存储）
- API Key 配置化（前端填入）

---

## 4. 用户流程

```
用户打开页面
    ↓
拖拽或点击上传图片
    ↓
前端预览原图
    ↓
点击"移除背景"按钮
    ↓
向后端发送图片（内存，不落盘）
    ↓
后端调用 Remove.bg API
    ↓
返回结果图片
    ↓
前端展示对比预览
    ↓
用户点击下载 → 浏览器下载 PNG
```

---

## 5. API 接口设计

### 5.1 移除背景接口

**端点**：`POST /api/remove-background`

**请求**：
- Content-Type: `multipart/form-data`
- Body: `image` (文件字段)

**响应（成功）**：
```json
{
  "success": true,
  "data": {
    "result": "data:image/png;base64,..."  // Base64 Data URL
  }
}
```

**响应（失败）**：
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "图片大小不能超过 10MB"
  }
}
```

**错误码**：
| code | 说明 |
|------|------|
| `FILE_TOO_LARGE` | 文件超过 10MB |
| `INVALID_FORMAT` | 不支持的图片格式 |
| `API_ERROR` | Remove.bg API 调用失败 |
| `API_KEY_MISSING` | 未配置 API Key |

---

## 6. 前端页面结构

```
┌─────────────────────────────────┐
│           Header               │
│   "Image Background Remover"   │
├─────────────────────────────────┤
│                                 │
│   ┌─────────┐    ┌─────────┐   │
│   │ 原图    │    │ 结果图   │   │
│   │ 预览    │    │ 预览     │   │
│   └─────────┘    └─────────┘   │
│                                 │
│   [  拖拽上传 / 点击上传  ]     │
│                                 │
│   [      移除背景按钮       ]    │
│                                 │
│   [      下载结果按钮       ]    │
│                                 │
├─────────────────────────────────┤
│           Footer               │
│   Powered by Remove.bg         │
└─────────────────────────────────┘
```

---

## 7. 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `REMOVE_BG_API_KEY` | Remove.bg API Key | `xxx` |

---

## 8. 部署步骤

### 8.1 Cloudflare Workers 部署

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 初始化项目
wrangler init my-worker

# 4. 配置环境变量
wrangler secret put REMOVE_BG_API_KEY

# 5. 部署
wrangler deploy
```

### 8.2 本地开发

```bash
wrangler dev
```

---

## 9. 安全注意事项

1. **API Key**：仅放在 Cloudflare Workers 环境变量中，不暴露在前端
2. **文件大小限制**：前端 + 后端双重校验，限制 10MB
3. **文件格式校验**：仅允许 JPG/PNG/WebP
4. **内存处理**：图片不在服务器磁盘落盘，处理完立即释放内存
5. **CORS**：仅允许自有域名访问 Workers 接口

---

## 10. 成本估算

| 项目 | 单价 | 用量 | 月成本 |
|------|------|------|--------|
| Cloudflare Workers | 免费（10万次/天） | — | $0 |
| Cloudflare Pages | 免费 | — | $0 |
| Remove.bg API | $0.20/张（付费版） | 100张/月 | ~$20 |

> Remove.bg 有免费额度（50张/月），MVP 阶段先用免费额度。

---

## 11. 里程碑

- [ ] **M1**：本地 Demo 完成，核心流程跑通
- [ ] **M2**：部署到 Cloudflare Workers，域名绑定
- [ ] **M3**：上线测试，邀请种子用户试用
- [ ] **M4**：根据反馈迭代优化

---

## 12. 附录

- Remove.bg 官网：https://www.remove.bg/
- Remove.bg API 文档：https://www.remove.bg/api
- Cloudflare Workers 文档：https://developers.cloudflare.com/workers/
