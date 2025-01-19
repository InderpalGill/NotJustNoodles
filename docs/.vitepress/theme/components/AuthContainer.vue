<template>
  <div class="auth-container">
    <div v-if="!user">
      <div class="auth-forms">
        <div class="login-form">
          <h2>Login</h2>
          <input type="email" v-model="loginEmail" placeholder="Email" />
          <input type="password" v-model="loginPassword" placeholder="Password" />
          <button @click="login">Login</button>
          <p v-if="loginError" class="error">{{ loginError }}</p>
        </div>
        <div class="register-form">
          <h2>Register</h2>
          <input type="email" v-model="registerEmail" placeholder="Email" />
          <input type="password" v-model="registerPassword" placeholder="Password" />
          <button @click="register">Register</button>
          <p v-if="registerError" class="error">{{ registerError }}</p>
        </div>
      </div>
    </div>
    <div v-else class="authenticated-content">
      <button class="logout-button" @click="logout">Logout</button>
      <SearchFood @add-product="handleAddProduct" />

      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
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
import { collection, addDoc } from "firebase/firestore";
import SearchFood from "./SearchFood.vue";

export default {
  name: "AuthContainer",
  components: {
    SearchFood,
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

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    const register = async () => {
      try {
        await createUserWithEmailAndPassword(
          auth,
          registerEmail.value,
          registerPassword.value
        );
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
        await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
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
        await signOut(auth);
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
        const productsCollection = collection(db, "users", user.value.uid, "products");
        const productData = {
          barcode: product.barcode,
          product_name: product.product_name || "No product name available",
          brands: product.brands || "Unknown",
          image_url: product.image_url || "",
          nutriments: product.nutriments || {},
          added_at: new Date(),
        };
        await addDoc(productsCollection, productData);
        addSuccess.value = "Product added successfully!";
        addError.value = "";
      } catch (error) {
        addError.value = "Failed to add product to the list.";
        console.error("Error adding document:", error);
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
  background-color: var(--vp-c-bg-alt);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.auth-forms {
  display: flex;
  gap: 50px;
  width: 100%;
  max-width: 800px;
  justify-content: center;
}

.login-form,
.register-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

input {
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

.logout-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.error {
  color: red;
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
</style>
