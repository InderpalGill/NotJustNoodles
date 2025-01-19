<script setup lang="ts">
import MacroCharts from "./MacroCharts.vue";
import SearchFood from "./SearchFood.vue";
</script>

<template>
  <div class="background">
    <h1 id="title">Your Nutrition Dashboard</h1>

    <div class="layout">
      <div class="search-food">
        <SearchFood @add-product="$emit('add-product', $event)" />
        <SearchFoodName @add-product="$emit('add-product', $event)" />
      </div>
      <div id="macro-charts">
        <ProductsList />
        <MacroCharts />
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

#title {
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans",
    Arial, sans-serif;
  font-size: 3rem;
  color: transparent; /* Make the text transparent */
  background: linear-gradient(
    45deg,
    #ff6a00,
    #ffcc00
  ); /* Gradient from orange to yellow */
  background-clip: text; /* Apply the gradient to text */
  text-align: center;
  letter-spacing: 2px;
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
}

.layout {
  display: flex; /* Set up a horizontal flex container */
  justify-content: space-between; /* Space between left and right */
  align-items: flex-start; /* Align items at the top */
  width: 100%; /* Take the full width of the parent container */
  gap: 20px;
}

.search-food {
  width: 55%;
  max-width: 600px;
  padding: 20px;
  margin: 20px;
  background-color: var(--vp-c-bg-alt);
  border-radius: 16px;
}

.search-food > *:not(:last-child) {
  margin-bottom: 20px; /* Add spacing between child elements */
}

#macro-charts {
  width: 50%;
  max-width: 500px;
  padding: 20px;
  margin: 20px;
  background-color: var(--vp-c-bg-alt);
  border-radius: 16px;
}
</style>
