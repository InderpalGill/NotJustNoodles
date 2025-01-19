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
</template>

<script>
export default {
    name: "OpenFoodFactsName",
    data() {
        return {
            //for searchByFoodName
            foodQuery: "",
            foodSuggestions: [],
            selectedFood: null,

            //for Nutrient Information
            nutrientInfo: [],
            foodWeight: 100, //Default weight is 100g
            nutrientKeys: ["Energy (kcal)", "Carbohydrate", "Protein", "Total Fat"] //Nutrients to display
        };
    },
    methods: {
        async searchByFoodName() {
            if (this.foodQuery.trim().length < 3) {
                this.foodSuggestions = [] //Query is too short
                return;
            }

            try {
                const response = await fetch(
                    "https://food-nutrition.canada.ca/api/canadian-nutrient-file/food/?lang=en&type=json"
                );

                if (!response.ok) {
                    throw new Error('API error: ${response.status}');
                }

                const data = await response.json();
                //Filter results
                this.foodSuggestions = data.filter(food =>
                    food.food_description.toLowerCase().includes(this.foodQuery.toLowerCase())
                );
            } catch (err) {
                console.error("Error fetching food suggestions:", err);
                this.foodSuggestions = [];
            }
        },

        //Nutrient Information
        async fetchNutrientInfo(foodCode) {
            try {
                const response = await fetch(
                    `https://food-nutrition.canada.ca/api/canadian-nutrient-file/nutrientamount/?id=${foodCode}&type=json&lang=en`
                );

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                this.nutrientInfo = data.filter(nutrient =>
                    this.nutrientKeys.includes(nutrient.nutrient_web_name));
            } catch (err) {
                console.error("Error fetching nutrient information:", err);
                this.nutrientInfo =[];
            }
        },

        //Method to handle food selection
        selectFood(food) {
            this.selectedFood = food; //sets selected food as food
            this.foodSuggestions = []; //clears foodSuggestions
            this.foodQuery = ""; //resets input textbox
            this.fetchNutrientInfo(food.food_code);
        },
    },
    computed: {
        filteredNutrientInfo() {
            return this.nutrientInfo.map(nutrient => ({...nutrient, nutrient_value: nutrient.nutrient_value || 0,
            }));
        },
    },
};
</script>
<style scoped>
/* Basic styles */
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
  margin: 0 auto;
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

.nutrient-info {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
</style>