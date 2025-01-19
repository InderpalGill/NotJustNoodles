<template>
  <div class="auth-container">
    <div v-if="!user">
      <div class="auth-forms">
        <div class="register-form">
          <div class="form-title">Register</div>
          <input type="email" v-model="registerEmail" placeholder="Email" />
          <input type="password" v-model="registerPassword" placeholder="Password" />
          <button @click="register">Register</button>
          <p v-if="registerError" class="error">{{ registerError }}</p>
        </div>
        <div class="login-form">
          <div class="form-title">Login</div>
          <input type="email" v-model="loginEmail" placeholder="Email" />
          <input type="password" v-model="loginPassword" placeholder="Password" />
          <button @click="login">Login</button>
          <p v-if="loginError" class="error">{{ loginError }}</p>
        </div>
      </div>
    </div>
    <div v-else class="authenticated-content">
      <button class="logout-button" @click="logout">Logout</button>
      <button class="debug-button" @click="fetchUserProducts">
        Debug: List User Products
      </button>

      <!-- Use Background and handle events from it -->
      <Background @add-product="handleAddProduct" />

      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>

      <div v-if="userProducts.length" class="user-products">
        <h3>User Products:</h3>
        <pre>{{ userProducts }}</pre>
      </div>

      <div v-if="fetchError" class="error">{{ fetchError }}</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Background from "./Background.vue"; // Import Background

export default {
  name: "AuthContainer",
  components: {
    Background, // Use Background instead of SearchFood directly
  },
  setup() {
    const user = ref(null);
    const loginEmail = ref("");
    const loginPassword = ref("");
    const registerEmail = ref("");
    const registerPassword = ref("");
    const loginError = ref("");
    const registerError = ref("");
    const addError = ref("");
    const addSuccess = ref("");
    const userProducts = ref("");
    const fetchError = ref("");

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        console.log("Auth State Changed: ", currentUser);
      });
    });

    const register = async () => {
      try {
        console.log("Attempting to register with email:", registerEmail.value);
        await createUserWithEmailAndPassword(
          auth,
          registerEmail.value,
          registerPassword.value
        );
        console.log("Registration successful");
        registerEmail.value = "";
        registerPassword.value = "";
        registerError.value = "";
      } catch (error) {
        registerError.value = error.message;
        console.error("Registration error:", error);
      }
    };

    const login = async () => {
      try {
        console.log("Attempting to login with email:", loginEmail.value);
        await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
        console.log("Login successful");
        loginEmail.value = "";
        loginPassword.value = "";
        loginError.value = "";
      } catch (error) {
        loginError.value = error.message;
        console.error("Login error:", error);
      }
    };

    const logout = async () => {
      try {
        console.log("Attempting to logout");
        await signOut(auth);
        console.log("Logout successful");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    const handleAddProduct = async (product) => {
      if (!user.value) {
        addError.value = "You must be logged in to add products.";
        return;
      }
      try {
        console.log("Received product data:", JSON.stringify(product, null, 2)); // Log complete product data
        const productsCollection = collection(db, "users", user.value.uid, "products");
        const productData = {
          barcode: product.barcode || "Unknown",
          product_name: product.product_name || "No product name available",
          brands: product.brands || "Unknown",
          image_url: product.image_url || "",
          nutriments: product.nutriments || {},
          added_at: new Date(),
        };
        const docRef = await addDoc(productsCollection, productData);
        console.log("Product added with ID:", docRef.id);
        addSuccess.value = "Product added successfully!";
        addError.value = "";
      } catch (error) {
        addError.value = "Failed to add product to the list.";
        console.error("Error adding document:", error);
      }
    };

    const fetchUserProducts = async () => {
      if (!user.value) {
        fetchError.value = "You must be logged in to view products.";
        console.error("Fetch products attempt without authenticated user.");
        return;
      }
      try {
        console.log("Fetching products for user:", user.value.uid);
        const productsCollection = collection(db, "users", user.value.uid, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        userProducts.value = JSON.stringify(productsList, null, 2);
        console.log("Fetched user products:", productsList);
        fetchError.value = "";
      } catch (error) {
        fetchError.value = "Failed to fetch user products.";
        console.error("Error fetching documents:", error);
      }
    };

    return {
      user,
      loginEmail,
      loginPassword,
      registerEmail,
      registerPassword,
      login,
      register,
      logout,
      loginError,
      registerError,
      addError,
      addSuccess,
      handleAddProduct,
      userProducts,
      fetchUserProducts,
      fetchError,
    };
  },
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  min-width: 100%;
}

.auth-forms {
  display: flex;
  gap: 50px;
  width: 100%;
  max-width: 800px;
  justify-content: center;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.login-form,
.register-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
  margin: 20px;
  padding: 20px;
}

input {
  flex: 1;
  padding: 12px;
  margin: 5px 0;
  border: none;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  font-size: 16px;
}

button {
  padding: 12px 20px;
  border: none;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}

button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

.logout-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.debug-button {
  position: absolute;
  top: 60px;
  right: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.error {
  color: var(--vp-c-red-1);
  font-size: 14px;
}

.success {
  color: green;
  font-size: 14px;
}

.authenticated-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-products {
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  background-color: var(--vp-c-bg-soft);
  padding: 20px;
  border-radius: 8px;
}

.user-products h3 {
  text-align: center;
  margin-bottom: 10px;
}

.user-products pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
