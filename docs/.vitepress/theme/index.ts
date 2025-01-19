// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import '@cynber/vitepress-valence/style.css'
import { JSONTable, 
         BlogPostHeader,
         BlogPostList,
         HorizontalContainer,
         VerticalContainer,
         HorizontalCard,
         VerticalCard,
         ImageGallery
        } from '@cynber/vitepress-valence'
import SearchFood from './components/SearchFood.vue'
import Background from './components/Background.vue'
import MacroCharts from './components/MacroCharts.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('JSONTable', JSONTable)
    app.component('BlogPostHeader', BlogPostHeader)
    app.component('BlogPostList', BlogPostList)
    app.component('HorizontalContainer', HorizontalContainer)
    app.component('VerticalContainer', VerticalContainer)
    app.component('HorizontalCard', HorizontalCard)
    app.component('VerticalCard', VerticalCard)
    app.component('ImageGallery', ImageGallery)
    app.component('SearchFood', SearchFood)
    app.component('Background', Background)
    app.component('MacroCharts', MacroCharts)
  }
} satisfies Theme
