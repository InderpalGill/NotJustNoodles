<template>
  <div class="products-list">
    <div class="date-navigation">
      <button @click="changeDate(-1)">
        <Icon icon="mingcute:left-fill" width="24" height="24" />
      </button>
      <span class="current-date">{{ formattedDate }}</span>
      <button @click="changeDate(1)">
        <Icon icon="mingcute:right-fill" width="24" height="24" />
      </button>
    </div>

    <div class="button-bar">
      <button class="refresh-button" @click="fetchProducts">Refresh</button>
      <button class="jump-to-today-button" @click="jumpToToday">Jump to Today</button>
      <button class="date-picker-button" @click="toggleDatePicker">Pick Date</button>
    </div>

    <div class="product-summary" @click="toggleProductList">
      <span>
        {{ products.length }} products found for this date. Click to view details.
      </span>
    </div>

    <div v-if="showProductList" class="product-details">
      <div v-if="products.length">
        <div class="product-pill" v-for="product in products" :key="product.id">
          {{ product.product_name || product.food_description }}
        </div>
        <div class="summary-nutrients">
          <div>Total Carbs: {{ totalNutrients.totalCarbs.toFixed(2) }}g</div>
          <div>Total Protein: {{ totalNutrients.totalProtein.toFixed(2) }}g</div>
        </div>
      </div>
      <div v-else>No products found for this date.</div>
    </div>

    <!-- Date Picker Modal -->
    <input
      type="date"
      v-model="datePicker"
      v-if="showDatePicker"
      @change="setDate"
      class="date-picker"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../firebase";
import { Icon } from "@iconify/vue";

export default {
  name: "ProductsList",
  components: { Icon },
  setup() {
    const products = ref([]);
    const showProductList = ref(false);
    const showDatePicker = ref(false);
    const datePicker = ref("");
    const currentDate = ref(new Date());

    const formattedDate = computed(() => {
      return currentDate.value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    });

    const totalNutrients = computed(() => {
      let totalCarbs = 0;
      let totalProtein = 0;

      products.value.forEach((product) => {
        if (product.nutriments) {
          const carbsPer100g = product.nutriments.carbohydrates_100g || 0;
          const proteinPer100g = product.nutriments.proteins_100g || 0;
          const weight = product.food_weight || 100;

          totalCarbs += (carbsPer100g / 100) * weight;
          totalProtein += (proteinPer100g / 100) * weight;
        }

        if (product.nutrient_info) {
          product.nutrient_info.forEach((nutrient) => {
            if (nutrient.nutrient_web_name === "Carbohydrate") {
              totalCarbs += nutrient.nutrient_value;
            } else if (nutrient.nutrient_web_name === "Protein") {
              totalProtein += nutrient.nutrient_value;
            }
          });
        }
      });

      return {
        totalCarbs,
        totalProtein,
      };
    });

    const fetchProducts = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const dateString = currentDate.value.toISOString().split("T")[0];

      const productsCollection = collection(
        db,
        "users",
        userId,
        "dates",
        dateString,
        "products"
      );
      const snapshot = await getDocs(productsCollection);
      products.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log(products.value);
    };

    const changeDate = (days) => {
      const newDate = new Date(currentDate.value);
      newDate.setDate(newDate.getDate() + days);
      currentDate.value = newDate;
      fetchProducts();
    };

    const toggleProductList = () => {
      showProductList.value = !showProductList.value;
    };

    const toggleDatePicker = () => {
      showDatePicker.value = !showDatePicker.value;
    };

    const setDate = () => {
      if (datePicker.value) {
        currentDate.value = new Date(datePicker.value);
        fetchProducts();
      }
      showDatePicker.value = false;
    };

    const jumpToToday = () => {
      currentDate.value = new Date();
      fetchProducts();
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      products,
      showProductList,
      formattedDate,
      totalNutrients, // Ensure totalNutrients is included here
      fetchProducts,
      changeDate,
      toggleProductList,
      showDatePicker,
      toggleDatePicker,
      datePicker,
      setDate,
      jumpToToday,
    };
  },
};
</script>

<style scoped>
.products-list {
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 16px;
  margin-bottom: 20px;
}

.date-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.current-date {
  margin: 0 10px;
  font-size: 24px;
  font-weight: bold;
}

.product-summary {
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}

.product-details {
  margin-top: 10px;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  padding: 10px;
}

.product-pill {
  display: inline-block;
  background-color: var(--vp-button-alt-bg);
  color: var(--vp-button-alt-text);
  border-radius: 12px;
  padding: 5px 10px;
  margin: 5px;
  font-size: 14px;
}

.summary-nutrients {
  margin-top: 10px;
}

.button-bar {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 10px;
}

.refresh-button,
.date-picker-button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  background-color: var(--vp-button-alt-bg);
  color: var(--vp-button-alt-text);
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: background-color 0.3s ease;
}

.refresh-button:hover,
.date-picker-button:hover {
  background-color: var(--vp-button-alt-hover-bg);
}

.jump-to-today-button {
  margin-left: 10px;
  padding: 10px 20px;
  border: none;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.jump-to-today-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
}

.date-picker {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  width: 100%;
  display: block;
  font-size: 16px;
}
</style>
