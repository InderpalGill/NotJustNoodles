<template>
  <div class="products-list">
    <div class="date-navigation">
      <Icon icon="mingcute:left-fill" width="24" height="24" @click="shiftDate(-1)" />
      <span class="current-date" @click="showDatePicker">{{ formattedDate }}</span>
      <Icon icon="mingcute:right-fill" width="24" height="24" @click="shiftDate(1)" />
    </div>

    <div v-if="products.length" class="products-info">
      <div class="product-count" @click="toggleProducts">
        <span>{{ products.length }} products listed for {{ formattedDate }}</span>
        <span v-if="expanded" class="arrow">▼</span>
        <span v-else class="arrow">▲</span>
      </div>

      <div v-if="expanded" class="product-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          {{ product.product_name }} (Barcode: {{ product.barcode }})
        </div>
      </div>
    </div>
    <div v-else>
      <p>No products listed for {{ formattedDate }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { db } from "../firebase"; // Import your Firebase instance
import { collection, getDocs, query, where } from "firebase/firestore";
import { Icon } from "@iconify/vue"; // Import the icon component

export default {
  name: "ProductsList",
  components: {
    Icon,
  },
  setup() {
    const currentDate = ref(new Date());
    const expanded = ref(false);
    const products = ref([]);

    // Format the date as YYYY-MM-DD for display
    const formattedDate = computed(() => {
      return currentDate.value.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    });

    // Function to fetch products for the current date
    const fetchProducts = async () => {
      const user = "YOUR_USER_ID"; // Replace with actual user ID
      const productsCollection = collection(
        db,
        "users",
        user,
        "dates",
        formattedDate.value,
        "products"
      );
      const q = query(
        productsCollection,
        where("added_at", ">=", currentDate.value.setHours(0, 0, 0, 0)),
        where("added_at", "<=", currentDate.value.setHours(23, 59, 59, 999))
      );
      const querySnapshot = await getDocs(q);

      products.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    // Shift the date by days and fetch the updated product list
    const shiftDate = async (days) => {
      currentDate.value.setDate(currentDate.value.getDate() + days);
      await fetchProducts();
    };

    // Show calendar date picker function (stub for actual implementation)
    const showDatePicker = () => {
      // Implement a date picker or similar functionality here
      console.log("Show date picker");
    };

    const toggleProducts = () => {
      expanded.value = !expanded.value;
    };

    // Initial fetch of products for the current date
    fetchProducts();

    return {
      formattedDate,
      products,
      expanded,
      shiftDate,
      showDatePicker,
      toggleProducts,
    };
  },
};
</script>

<style scoped>
.products-list {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
}

.date-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-date {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.products-info {
  cursor: pointer;
}

.product-count {
  font-size: 16px;
  margin: 10px 0;
}

.product-list {
  margin-top: 10px;
}

.product-item {
  padding: 5px 0;
}
.arrow {
  margin-left: 5px;
}
</style>
