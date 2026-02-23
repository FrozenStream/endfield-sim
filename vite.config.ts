import { defineConfig } from 'vite';

// 根据运行命令动态设置 base：开发时为根目录，打包时为 `/endfield-sim/`
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/endfield-sim/' : '/',
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
}));