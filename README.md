# Vite Project

> ⚠️ **注意**: 本README由AI生成，仅供参考。

## 项目简介

这是一个基于Vite构建的前端项目，目前处于**早期开发阶段**。

## 主要内容

### 技术栈
- **框架**: Vite + TypeScript
- **测试**: Vitest
- **主要功能模块**:
  - 游戏循环系统 (`GameLoop.ts`)
  - 网格地图管理 (`GridMap.ts`)
  - 物品管理系统 (`ItemManager.ts`)
  - 机器实例管理 (`MachineInstance.ts`, `BeltInstance.ts`)
  - 各种工具类和配置文件

### 目录结构
```
src/
├── instance/          # 实例管理
├── proto/            # 协议定义
├── utils/            # 工具函数
├── GameLoop.ts       # 游戏主循环
├── GridMap.ts        # 网格地图
└── ItemManager.ts    # 物品管理
tests/                # 测试文件
```

## 开发状态

🚨 **重要提醒**: 该项目目前处于早期开发阶段，功能尚未完善，API可能频繁变动。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

---
*此文档由AI辅助生成*