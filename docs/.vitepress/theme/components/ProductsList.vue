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

    <div class="product-summary" @click="toggleProductList">
      <span>
        {{ products.length }} products found for this date. Click to view details.
      </span>
    </div>

    <div v-if="showProductList" class="product-details">
      <pre v-if="products.length">{{ productsText }}</pre>
      <div v-else>No products found for this date.</div>
    </div>

    <button class="refresh-button" @click="fetchProducts">Refresh</button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "../firebase"; // Import auth for user ID reference
import { Icon } from "@iconify/vue";

export default {
  name: "ProductsList",
  components: { Icon },
  setup() {
    const products = ref([]);
    const showProductList = ref(false);
    const currentDate = ref(new Date());

    // Computed property to format the date as needed
    const formattedDate = computed(() => {
      return currentDate.value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    });

    // Fetch products from Firebase based on the current date
    const fetchProducts = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const dateString = currentDate.value.toISOString().split("T")[0]; // YYYY-MM-DD format

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
    };

    // Change the date by a given number of days
    const changeDate = (days) => {
      const newDate = new Date(currentDate.value);
      newDate.setDate(newDate.getDate() + days);
      currentDate.value = newDate; // Update the currentDate ref directly
      fetchProducts(); // Fetch products for the new date
    };

    // Toggle product list visibility
    const toggleProductList = () => {
      showProductList.value = !showProductList.value;
    };

    // Create a backup format for product text to display easily
    const productsText = computed(() => {
      return products.value
        .map((product) => `${product.product_name} (ID: ${product.id})`)
        .join("\n");
    });

    // Fetch products when the component is mounted
    onMounted(() => {
      fetchProducts();
    });

    return {
      products,
      showProductList,
      formattedDate,
      fetchProducts,
      changeDate,
      toggleProductList,
      productsText,
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

.refresh-button {
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

.refresh-button:hover {
  background-color: var(--vp-button-alt-hover-bg);
}
</style>
