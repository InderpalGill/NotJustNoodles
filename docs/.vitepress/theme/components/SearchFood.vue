<template>
  <div class="open-food-facts">
    <div class="title">Search for a Product by Barcode</div>
    <div class="search-section">
      <input
        type="text"
        v-model="barcode"
        placeholder="Enter barcode"
        @keyup.enter="searchByBarcode"
      />
      <button @click="searchByBarcode">Search</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="product" class="product-info">
      <div class="product-header">
        <img v-if="product.image_url" :src="product.image_url" alt="Product Image" />
        <div class="product-title-brand">
          <div class="product-name">
            {{ product.product_name || "No product name available" }}
          </div>
          <div class="product-brand">
            {{ product.brands }}
          </div>
        </div>
      </div>
      <div class="product-details">
        <div class="detail-card">
          <div class="card-title" @click="toggleAllergens">
            Allergens <span v-if="!showAllergens">(click to expand)</span>
            <span v-else>(click to collapse)</span>
          </div>
          <div class="card-content" v-show="showAllergens">
            <div v-if="allergensList.length">
              <span class="pill" v-for="(allergen, index) in allergensList" :key="index">
                {{ allergen }}
              </span>
            </div>
            <div v-else>None</div>
          </div>
        </div>
        <div class="detail-card">
          <div class="card-title" @click="toggleIngredients">
            Ingredients <span v-if="!showIngredients">(click to expand)</span>
            <span v-else>(click to collapse)</span>
          </div>
          <div class="card-content" v-show="showIngredients">
            <div v-if="ingredientsList.length">
              <span
                class="pill"
                v-for="(ingredient, index) in ingredientsList"
                :key="index"
              >
                {{ ingredient }}
              </span>
            </div>
            <div v-else>No ingredients listed.</div>
          </div>
        </div>
        <div class="detail-card nutrition-facts">
          <div class="card-title">Nutrition Facts</div>
          <div class="card-content">
            <table class="nutrition-table">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th>Per 100g</th>
                  <th>Per Serving</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(nutrient, index) in nutrimentsDetailedList" :key="index">
                  <td>{{ nutrient.name }}</td>
                  <td>{{ nutrient.value_100g }} {{ nutrient.unit }}</td>
                  <td v-if="nutrient.value_serving">
                    {{ nutrient.value_serving }} {{ nutrient.unit }}
                  </td>
                  <td v-else>N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Additional Nutrient Details Section -->
        <div
          class="detail-card additional-nutrient-details"
          v-if="showAdditionalNutrients"
        >
          <div class="card-title" @click="toggleAdditionalNutrients">
            Additional Nutrient Details
            <span v-if="!showAdditionalNutrients">(click to expand)</span>
            <span v-else>(click to collapse)</span>
          </div>
          <div class="card-content" v-show="showAdditionalNutrients">
            <table class="nutrition-table">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th>Per 100g</th>
                  <th>Per Serving</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(nutrient, index) in additionalNutrientsList" :key="index">
                  <td>{{ nutrient.name }}</td>
                  <td>{{ nutrient.value_100g }} {{ nutrient.unit }}</td>
                  <td v-if="nutrient.value_serving">
                    {{ nutrient.value_serving }} {{ nutrient.unit }}
                  </td>
                  <td v-else>N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="debug-info">
        <div class="card-title" @click="toggleDebug">
          Debug Information <span v-if="!showDebug">(click to expand)</span>
          <span v-else>(click to collapse)</span>
        </div>
        <div class="card-content" v-show="showDebug">
          <pre>{{ debugInfo }}</pre>
        </div>
      </div>
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
      showAllergens: false,
      showIngredients: false,
      showDebug: false,
      showAdditionalNutrients: false,
    };
  },
  computed: {
    allergensList() {
      if (!this.product || !this.product.allergens_tags) {
        return [];
      }
      return this.product.allergens_tags.map((tag) =>
        tag.replace("en:", "").replace("-", " ").toUpperCase()
      );
    },
    ingredientsList() {
      if (!this.product || !this.product.ingredients_text) {
        return [];
      }
      return this.product.ingredients_text
        .split(",")
        .map((ingredient) => ingredient.trim());
    },
    // Main nutriments list based on common nutrients
    nutrimentsList() {
      if (!this.product || !this.product.nutriments) {
        return [];
      }
      const nutriments = this.product.nutriments;
      const nutrientsToDisplay = [
        "energy-kcal",
        "fat",
        "saturated-fat",
        "carbohydrates",
        "sugars",
        "fiber",
        "proteins",
        "salt",
        "sodium",
      ];

      return nutrientsToDisplay
        .map((nutrimentKey) => {
          const value = nutriments[nutrimentKey + "_100g"];
          if (value !== undefined) {
            return {
              name: this.formatNutriment(nutrimentKey),
              value: value,
              unit: nutriments[nutrimentKey + "_unit"] || "g",
            };
          }
        })
        .filter((nutrient) => nutrient !== undefined);
    },
    // Detailed nutriments list including all available nutrients
    nutrimentsDetailedList() {
      if (!this.product || !this.product.nutriments) {
        return [];
      }
      const nutriments = this.product.nutriments;
      const nutrients = Object.keys(nutriments)
        .filter((key) => key.endsWith("_100g") && !key.includes("unit"))
        .map((key) => key.replace("_100g", ""));

      return nutrients.map((nutrientKey) => {
        const value_100g = nutriments[`${nutrientKey}_100g`];
        const unit = nutriments[`${nutrientKey}_unit`] || "g";
        const value_serving = this.getServingValue(nutriments, nutrientKey);
        return {
          name: this.formatNutriment(nutrientKey),
          value_100g,
          unit,
          value_serving,
        };
      });
    },
    // Additional nutrients not listed in the main nutriments list
    additionalNutrientsList() {
      const mainNutrients = this.nutrimentsList.map((n) => n.name.toLowerCase());
      const detailedNutrients = this.nutrimentsDetailedList;
      return detailedNutrients.filter(
        (n) => !mainNutrients.includes(n.name.toLowerCase())
      );
    },
    debugInfo() {
      return JSON.stringify(this.product, null, 2);
    },
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
    formatNutriment(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    },
    toggleAllergens() {
      this.showAllergens = !this.showAllergens;
    },
    toggleIngredients() {
      this.showIngredients = !this.showIngredients;
    },
    toggleDebug() {
      this.showDebug = !this.showDebug;
    },
    toggleAdditionalNutrients() {
      this.showAdditionalNutrients = !this.showAdditionalNutrients;
    },
    getServingValue(nutriments, key) {
      // Check if serving size is available
      if (this.product && this.product.serving_size && nutriments[`${key}_serving`]) {
        return nutriments[`${key}_serving`];
      }
      return null;
    },
  },
};
</script>

<style scoped>
.open-food-facts {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 24px;
  margin: 24px auto;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  max-width: 700px;
  font-family: Arial, sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: var(--vp-c-text);
}

.search-section {
  display: flex;
  /* Remove padding and gap to allow button to touch the edge */
  padding: 0;
  gap: 0;
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden; /* Ensure rounded corners are maintained */
}

input[type="text"] {
  flex: 1;
  padding: 12px;
  border: none; /* Remove default border to merge with button */
  background-color: var(--vp-c-bg);
  border-radius: 8px 0 0 8px; /* Rounded corners on the left */
  font-size: 16px;
}

button {
  padding: 12px 20px;
  border: none; /* Remove default border */
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 0 8px 8px 0; /* Rounded corners on the right */
}

button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

.loading,
.error {
  text-align: center;
  font-size: 16px;
  color: var(--vp-c-warning-1);
}

.error {
  color: var(--vp-c-warning-1);
}

.product-info {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-title-brand {
  flex: 1;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
}

.product-brand {
  font-size: 18px;
  color: var(--vp-c-text-2);
}

.product-header img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 15px;
  background-color: var(--vp-c-bg-soft);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  user-select: none;
}

.card-content {
  font-size: 16px;
}

.pill {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-soft);
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-text-2);
  padding: 6px 12px;
  margin: 4px;
  border-radius: 16px;
  font-size: 14px;
}

.pill:hover {
  border: 1px solid var(--vp-c-brand);
  color: var(--vp-c-text-1);
}

.nutrition-table {
  width: 100%;
  border-collapse: collapse;
}

.nutrition-table th,
.nutrition-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px;
  text-align: left;
}

.nutrition-table th {
  background-color: var(--vp-c-bg-soft);
}

.debug-info {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  padding-top: 15px;
}

.debug-info .card-title {
  cursor: pointer;
}

.debug-info pre {
  background-color: var(--vp-c-bg-soft);
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
}

/* Additional Styles for Collapsible Sections */
.additional-nutrient-details {
  margin-top: 10px;
}
</style>
