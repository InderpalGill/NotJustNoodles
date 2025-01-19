<template>

    <div class="search-for-food">
        <div class="title">Search for Food by Name</div>
        <div>
            <input
                v-model="foodQuery"
                placeholder="Enter Food Name/Description"
                @input="searchByFoodName"
                style="font-size: 24px"
            />
        </div>
        <ul v-if="foodSuggestions && foodSuggestions.length" class="foodSuggestions">
            <li
                v-for="(food, index) in foodSuggestions"
                :key="index"
                @click="selectFood(food)"
            >
                {{ food.food_description }}
            </li>
        </ul>

        <div v-if="selectedFood" class="selectedFood">
            <div><strong>Selected Food:</strong> {{ selectedFood.food_description }}</div>
            <div><strong>Food Code:</strong> {{ selectedFood.food_code }}</div>
        </div>

        <!--Nutrient Information-->
        <div v-if="nutrientInfo.length" class="nutrient-info">
            <h3>Nutritional Information (per entered weight)</h3>
            <div>
                <label for="food-weight">Enter Food Weight (in grams): </label>
                <input
                    id="food-weight"
                    v-model.number="foodWeight"
                    type="number"
                    placeholder="Enter weight in grams"
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nutrient</th>
                        <th>Value (for {{ foodWeight || 100 }} g)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(nutrient, index) in filteredNutrientInfo" :key="index">
                        <td>{{ nutrient.nutrient_web_name }}</td>
                        <td>{{ (nutrient.nutrient_value * foodWeight / 100).toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
    <ul v-if="foodSuggestions.length" class="food-suggestions">
      <li
        v-for="(food, index) in foodSuggestions"
        :key="index"
        @click="selectFood(food)"
        class="suggestion-item"
      >
        {{ food.food_description }}
      </li>
    </ul>

    <div v-if="selectedFood" class="selected-food">
      <div><strong>Selected Food:</strong> {{ selectedFood.food_description }}</div>
      <div><strong>Food Code:</strong> {{ selectedFood.food_code }}</div>

      <!-- Input for weight and date -->
      <div class="weight-date-section">
        <label for="food-weight">Enter Food Weight (in grams): </label>
        <input
          id="food-weight"
          v-model.number="foodWeight"
          type="number"
          placeholder="Enter weight in grams"
          class="weight-input"
        />

        <label for="date">Enter Date:</label>
        <input
          id="date"
          v-model="date"
          type="text"
          placeholder="yyyy-mm-dd"
          class="date-input"
        />

        <button @click="submitFood" class="submit-button">Submit</button>
      </div>

      <!-- Nutritional Information -->
      <div v-if="nutrientInfo.length" class="nutrient-info">
        <h3>Nutritional Information (per entered weight)</h3>
        <table>
          <thead>
            <tr>
              <th>Nutrient</th>
              <th>Value (for {{ foodWeight || 100 }} g)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(nutrient, index) in filteredNutrientInfo" :key="index">
              <td>{{ nutrient.nutrient_web_name }}</td>
              <td>{{ ((nutrient.nutrient_value * foodWeight) / 100).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
</template>

<script>
import { db } from "../firebase"; // Import Firestore
import { collection, addDoc } from "firebase/firestore"; // Import Firestore methods

export default {
  name: "OpenFoodFactsName",
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      foodQuery: "",
      foodSuggestions: [],
      selectedFood: null,
      nutrientInfo: [],
      foodWeight: 100,
      date: "",
      nutrientKeys: ["Energy (kcal)", "Carbohydrate", "Protein", "Total Fat"],
    };
  },
  methods: {
    async searchByFoodName() {
      if (this.foodQuery.trim().length < 3) {
        this.foodSuggestions = []; // Query is too short
        return;
      }

      try {
        const response = await fetch(
          "https://food-nutrition.canada.ca/api/canadian-nutrient-file/food/?lang=en&type=json"
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        // Filter results
        this.foodSuggestions = data.filter((food) =>
          food.food_description.toLowerCase().includes(this.foodQuery.toLowerCase())
        );
      } catch (err) {
        console.error("Error fetching food suggestions:", err);
        this.foodSuggestions = [];
      }
    },

    async fetchNutrientInfo(foodCode) {
      try {
        const response = await fetch(
          `https://food-nutrition.canada.ca/api/canadian-nutrient-file/nutrientamount/?id=${foodCode}&type=json&lang=en`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        this.nutrientInfo = data.filter((nutrient) =>
          this.nutrientKeys.includes(nutrient.nutrient_web_name)
        );
      } catch (err) {
        console.error("Error fetching nutrient information:", err);
        this.nutrientInfo = [];
      }
    },

    selectFood(food) {
      this.selectedFood = food;
      this.foodSuggestions = []; // Clear suggestions
      this.foodQuery = ""; // Reset input textbox
      this.fetchNutrientInfo(food.food_code);
    },

    async submitFood() {
      if (!this.selectedFood || !this.date) {
        console.error("Selected food and date are required.");
        return;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(this.date)) {
        console.log("Invalid date format.");
        return;
      }

      const productData = {
        food_description: this.selectedFood.food_description,
        food_code: this.selectedFood.food_code,
        food_weight: this.foodWeight,
        date: this.date,
        nutrient_info: this.filteredNutrientInfo,
      };

      try {
        const productsCollection = collection(
          db,
          "users",
          this.userId, // Use userId prop for Firestore access
          "dates",
          this.date,
          "products"
        );

        await addDoc(productsCollection, productData);
        console.log("Product added successfully!");
      } catch (error) {
        console.error("Error adding product to Firestore:", error);
      }
    },
  },
  computed: {
    filteredNutrientInfo() {
      return this.nutrientInfo.map((nutrient) => ({
        ...nutrient,
        nutrient_value: nutrient.nutrient_value || 0,
      }));
    },
  },
};
</script>

<style scoped>
.search-for-food {
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

.food-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid var(--vp-c-divider); /* Add border to the input */
  border-radius: 8px;
  background-color: var(--vp-c-bg);
}

.food-suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--vp-c-divider); /* Add border around suggestion list */
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: var(--vp-button-brand-hover-bg); /* Highlight on hover */
}

.selected-food {
  margin-top: 15px;
}

.weight-date-section {
  margin-top: 10px;
}

.weight-input,
.date-input {
  width: calc(100% - 16px); /* Full width minus padding */
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-bottom: 10px;
}

.submit-button {
  padding: 12px 20px;
  border: none;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
}

.submit-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

.nutrient-info {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px;
  text-align: left;
}
</style>
