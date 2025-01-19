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
import { Icon } from "@iconify/vue"
import SearchFood from './components/SearchFood.vue'
import SearchFoodName from './components/SearchFoodName.vue'
import DailyNutrients from './components/DailyNutrients.vue'
import Background from './components/Background.vue'
import MacroCharts from './components/MacroCharts.vue'
import AuthContainer from './components/AuthContainer.vue'
import ProductsList from './components/ProductsList.vue'




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
    app.component('Icon', Icon)
    app.component('SearchFood', SearchFood)
    app.component('SearchFoodName', SearchFoodName)
    app.component('DailyNutrients', DailyNutrients)
    app.component('Background', Background)
    app.component('MacroCharts', MacroCharts)
    app.component('AuthContainer', AuthContainer)
    app.component('ProductsList', ProductsList)
  }
} satisfies Theme
