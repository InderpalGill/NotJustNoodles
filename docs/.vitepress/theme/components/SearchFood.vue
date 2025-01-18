<template>
  <div class="open-food-facts">
    <div class="title">Search for a Product by Barcode</div>
    <div>
      <input
        v-model="barcode"
        placeholder="Enter barcode"
        @keyup.enter="searchByBarcode"
      />
    </div>
    <button @click="searchByBarcode">Search</button>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="product" class="product-info">
      <div class="product-name">
        {{ product.product_name || "No product name available" }}
      </div>
      <img v-if="product.image_url" :src="product.image_url" alt="Product Image" />
      <div><strong>Brands:</strong> {{ product.brands }}</div>
      <div><strong>Categories:</strong> {{ product.categories }}</div>
      <div><strong>Allergens:</strong> {{ product.allergens || "None" }}</div>
      <div><strong>Ingredients:</strong> {{ product.ingredients_text }}</div>
      <div><strong>Nutrition Grade:</strong> {{ product.nutrition_grade_fr }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OpenFoodFactsBarcode",
  data() {
    return {
      barcode: "",
      product: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async searchByBarcode() {
      if (!this.barcode.trim()) {
        this.error = "Please enter a barcode.";
        return;
      }

      this.loading = true;
      this.error = null;
      this.product = null;

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${this.barcode}.json`,
          {
            headers: {
              "User-Agent": "YourAppName/1.0 (your.email@example.com)",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 1 && data.product) {
          this.product = data.product;
        } else {
          this.error = "No product found with this barcode.";
        }
      } catch (err) {
        this.error = "An error occurred while fetching data.";
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Basic styles */
.open-food-facts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 16px;
  margin: 16px auto;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  padding: 8px 16px;
  margin: 10px 0;
}

.loading {
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}

.product-info {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
}

.product-name {
  font-size: 20px;
  font-weight: bold;
}

.product-info img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>
