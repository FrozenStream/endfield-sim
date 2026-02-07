import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: true, // 显示错误覆盖层
      timeout: 30000, // HMR 超时时间
      protocol: 'ws', // 使用 WebSocket 协议
    },
    watch: {
      usePolling: true, // 使用轮询方式监听文件变化
      interval: 1000, // 文件轮询间隔
    },
  },
  build: {
    sourcemap: true, // 启用源映射以便调试
  }
});