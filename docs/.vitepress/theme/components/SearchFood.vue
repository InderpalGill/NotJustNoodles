```vue
<template>
  <div class="open-food-facts">
    <div v-if="!addingToList" class="title">Search for a Product by Barcode</div>

    <div v-if="!addingToList" class="search-section">
      <input
        type="text"
        v-model="barcode"
        placeholder="Enter barcode"
        @keyup.enter="searchByBarcode"
        style="font-size: 24px"
      />
      <button class="brand-button" @click="searchByBarcode">
        <span class="button-icon-text">
          <Icon icon="material-symbols:search-rounded" width="24" height="24" />Search
        </span>
      </button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="product && !addingToList" class="product-info">
      <div class="product-header">
        <img v-if="product.image_url" :src="product.image_url" alt="Product Image" />
        <div class="product-title-brand">
          <div class="product-name">
            {{ product.product_name || "No product name available" }}
          </div>
          <div class="product-brand">
            {{ product.brands }}
          </div>
          <button class="add-to-list-button" @click="beginAddToList">
            <span class="button-icon-text">
              <Icon icon="carbon:add-filled" width="24" height="24" />
              Add to List
            </span>
          </button>
        </div>
      </div>
      <div class="product-details">
        <div class="detail-card nutrition-facts">
          <div class="card-title" @click="toggleNutritionFacts">
            Nutrition Facts
            <span class="help-text" v-if="!showNutritionFacts">(click to expand)</span>
            <span v-else class="help-text">(click to collapse)</span>
          </div>
          <div class="card-content" v-show="showNutritionFacts">
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
        <div class="detail-card debug-info">
          <div class="card-title" @click="toggleDebug">
            Debug Information
            <span v-if="!showDebug" class="help-text">(click to expand)</span>
            <span v-else class="help-text">(click to collapse)</span>
          </div>
          <div class="card-content" v-show="showDebug">
            <pre>{{ debugInfo }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="addingToList" class="add-to-list-section">
      <div class="title">Enter Date</div>
      <input
        type="text"
        v-model="date"
        placeholder="yyyy-mm-dd"
        style="font-size: 24px"
      />
      <button class="brand-button" @click="submitDate">Submit</button>
      <button class="alt-button" @click="cancelAddToList">Cancel</button>
    </div>
  </div>
</template>

<script>
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Icon } from "@iconify/vue";

export default {
  name: "SearchFood",
  data() {
    return {
      barcode: "",
      product: null,
      loading: false,
      error: null,
      showDebug: false,
      showNutritionFacts: false,
      addingToList: false,
      date: "",
    };
  },
  computed: {
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
      } finally {
        this.loading = false;
      }
    },
    formatNutriment(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    },
    toggleDebug() {
      this.showDebug = !this.showDebug;
    },
    toggleNutritionFacts() {
      this.showNutritionFacts = !this.showNutritionFacts;
    },
    getServingValue(nutriments, key) {
      if (this.product && this.product.serving_size && nutriments[`${key}_serving`]) {
        return nutriments[`${key}_serving`];
      }
      return null;
    },
    beginAddToList() {
      this.addingToList = true;
    },
    cancelAddToList() {
      this.addingToList = false;
      this.date = "";
    },
    submitDate() {
      // Check if the date is in the correct format (optional)
      if (!this.date) {
        this.error = "Please enter a valid date.";
        return;
      }

      // Emit the product along with the date
      this.$emit("add-product", { product: this.product, date: this.date });

      // Resetting the input fields after submission
      this.date = "";
      this.cancelAddToList(); // reset addingToList state
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
  /* margin: 24px auto; */
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 10 auto;
  font-family: Arial, sans-serif;
}

.title {
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans",
    Arial, sans-serif;
  font-size: 24px;
  align-items: center;

  font-weight: bold;
  text-align: center;
  color: var(--vp-c-text);
}

.search-section {
  display: flex;
  padding: 0;
  gap: 0;
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

input[type="text"] {
  flex: 1;
  padding: 12px;
  border: none;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  font-size: 16px;
}

button {
  padding: 12px 20px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
}

.brand-button {
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.alt-button {
  background-color: var(--vp-button-alt-bg);
  color: var(--vp-button-alt-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.brand-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

.alt-button:hover {
  background-color: var(--vp-button-alt-hover-bg);
  color: var(--vp-button-alt-hover-text);
}

.button-icon-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-to-list-button {
  margin-top: 10px;
  width: 100%;
  border-radius: 8px;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.add-to-list-button:hover {
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
  align-items: flex-start;
  gap: 20px;
}

.product-title-brand {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  width: 150px;
  height: 150px;
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

.help-text {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.add-to-list-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.add-to-list-section input[type="text"] {
  text-align: center;
}
</style>
