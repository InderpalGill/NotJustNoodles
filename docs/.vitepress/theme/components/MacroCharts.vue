<template>
    <div class="dashboard">
      <h1>Macro Tracker</h1>
  
      <!-- User Input Form -->
      <div class="input-container">
        <div class="input-box">
          <label for="calories">Target Calories:</label>
          <input
            id="calories"
            type="number"
            v-model="targets.calories"
            placeholder="Enter target calories"
          />
        </div>
  
        <div class="input-box">
          <label for="carbohydrates">Target Carbs (g):</label>
          <input
            id="carbohydrates"
            type="number"
            v-model="targets.carbohydrates"
            placeholder="Enter target carbs"
          />
        </div>
  
        <div class="input-box">
          <label for="fat">Target Fat (g):</label>
          <input
            id="fat"
            type="number"
            v-model="targets.fat"
            placeholder="Enter target fat"
          />
        </div>
  
        <div class="input-box">
          <label for="protein">Target Protein (g):</label>
          <input
            id="protein"
            type="number"
            v-model="targets.protein"
            placeholder="Enter target protein"
          />
        </div>
      </div>
  
      <!-- Macro Tracker Section -->
      <div class="macro-tracker">
  
        <div class="bars-container">
          <div
            class="bar"
            v-for="(value, key) in targets"
            :key="key"
            :style="{
              height: `${(consumed[key] / value) * 100}%`,
              backgroundColor: getBarColor(key)
            }"
          >
            <div class="label">{{ capitalize(key) }}: {{ consumed[key] }} g / {{ value }} g</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "TargetInputs",
    data() {
      return {
        // Max values (user input)
        targets: {
          calories: 0,
          carbohydrates: 0,
          fat: 0,
          protein: 0,
        },
        // The amount consumed (simulated with 50 for now)
        consumed: {
          calories: 50,
          carbohydrates: 50,
          fat: 50,
          protein: 50,
        },
      };
    },
    methods: {
      // Get a color based on the nutrient type for the bar chart
      getBarColor(nutrient) {
        switch (nutrient) {
          case "calories":
            return "#FF5733"; // Orange for calories
          case "carbohydrates":
            return "#33FF57"; // Green for carbohydrates
          case "fat":
            return "#FF33A6"; // Pink for fat
          case "protein":
            return "#3357FF"; // Blue for protein
          default:
            return "#333";
        }
      },
      // Capitalize the first letter of each label
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    text-align: center;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    color: transparent; /* Make the text transparent */
  background: linear-gradient(45deg, #ff6a00, #ffcc00); /* Gradient from orange to yellow */
  background-clip: text; /* Apply the gradient to text */
  text-align: center;
  letter-spacing: 2px;
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5); 
  }
  
  .input-container {
    margin: 20px 0;
  }
  
  .input-box {
    margin: 10px 0;
  }
  
  input {
    padding: 8px;
    font-size: 16px;
    margin-left: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
  
  /* Macro Tracker Section */
  .macro-tracker {
    background-color: #a59d9d; /* Light gray background */
    padding: 20px;
    margin-top: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .macro-tracker h2 {
    color: #cccfdc;
    font-size: 2rem;
  }
  
  .bars-container {
    display: flex;
    justify-content: space-around;
    margin-top: 40px;
  }
  
  .bar {
    width: 50px;
    margin: 0 10px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    border-radius: 5px;
    padding: 10px;
    transition: height 0.3s ease-in-out;
  }
  
  .label {
    position: absolute;
    bottom: 5px;
    font-size: 14px;
    color: #fff;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
  
  h1 {
    color: #d8b278;
    font-size: 2.5rem;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-top: 20px;
  }
  </style>
  
