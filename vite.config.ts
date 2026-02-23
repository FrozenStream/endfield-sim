import { defineConfig } from 'vite';

// 根据运行命令动态设置 base：开发时为根目录，打包时为 `/endfield-sim/`
export default defineConfig(() => ({
  base: "/endfield-sim/",
  server: {
    watch: {
      usePolling: true, // 使用轮询方式监听文件变化
      interval: 1000, // 文件轮询间隔
    },
  }
}));