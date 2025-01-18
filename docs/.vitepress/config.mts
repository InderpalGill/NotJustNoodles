import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Streak Saver",
  description: "Documentation and guides for Streak Saver",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs' }
    ],

    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Introduction', link: '/docs/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cynber/streak-saver' }
    ]
  }
})
