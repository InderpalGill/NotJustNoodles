<template>
  <div class="background">
    <h1 id="title">Your Nutrition Dashboard</h1>

    <div class="layout">
      <div class="search-food">
        <!-- Pass the userId prop down -->
        <SearchFood @add-product="$emit('add-product', $event)" />
        <SearchFoodName :userId="userId" @add-product="$emit('add-product', $event)" />
      </div>
      <div id="macro-charts">
        <ProductsList />
        <MacroCharts />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    userId: {
      required: true,
      type: String,
    },
  },
};
</script>

<style scoped>
.background {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  padding: 20px; /* Reduced padding to work better with AuthContainer */
}

#title {
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans",
    Arial, sans-serif;
  font-size: 3rem;
  color: transparent;
  background: linear-gradient(45deg, #ff6a00, #ffcc00);
  background-clip: text;
  text-align: center;
  letter-spacing: 2px;
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
}

.layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;
  gap: 20px; /* Space between components horizontally */
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-alt);
  margin: 0 auto;
  padding: 20px;
}

.search-food,
#macro-charts {
  flex: 1;
  min-width: 250px;
}

.search-food > *, #macro-charts > * {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
    gap: 15px; /* Space between components */
  }

  .search-food,
  #macro-charts {
    width: 100%;
    margin: 0; /* Remove margin for cleaner stacking */
  padding: 10px; /* Consistent padding */
  }
}
</style>
