
<template>
  <div class="open-food-facts">

    <div class="title">Enter info stuff in [age (yrs), weight (kg), height (cm), biological gender (m=1/f=2)]</div>
    <div>
      <input
          v-model="info"
          placeholder="follow format specified"
          @keyup.enter="getNutrition"
      />
    </div>
    <button @click="getNutrition">Search</button>

    <div v-if="loading2" class="loading2">Loading...</div>
    <div v-if="error2" class="error2">{{ error }}</div>

    <div v-if="nutritionNeed" class="nutritionNeed-info">
      <div class="nutrition-array">
        {{ nutritionNeed || "oh no sth went horribly wrong" }}
      </div>

    </div>
  </div>
</template>

<script>
// import { promises as fs } from "fs";
// const axios = await import('axios');
export default {


  name: "OpenFoodFactsBarcode",
  data() {
    return {
      barcode: "",
      product: null,
      loading: false,
      error: null,
      info: [],
      nutritionNeed: null,
      loading2: false,
      error2: false

    };
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
    async getNutrition() {
      this.loading2 = true;
      this.error2 = false;

      let stats = JSON.parse(this.info);

      let age = stats[0].toString();
      let weight = stats[1].toString();
      let height = stats[2].toString();
      let gender = stats[3];
      if (gender === 1) {
        gender = "male";
      } else if (gender === 2) {
        gender = "female";
      } else {
        this.error2 = true;
      }

      // let units = stats[4];
      // let heightWeight = "";

      const url = `https://nutrition-calculator.p.rapidapi.com/api/nutrition-info?measurement_units=met&sex=` + gender + `&age_value=` + age + `&age_type=yrs&cm=` + height + `&kilos=` + weight + `&activity_level=Active`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '73003ae64bmsh9040c4806a9590dp110ce1jsnedd967c642c6',
          'x-rapidapi-host': 'nutrition-calculator.p.rapidapi.com'
        }
      };

      let response;
      let result;

      try {
        response = await fetch(url, options);
        result = await response.text();
        // console.log(result);
      } catch (error) {
        console.error(error);
      }
      // const http = await import('https');
      /*

      const options = {
        method: 'GET',
        hostname: 'nutrition-calculator.p.rapidapi.com',
        port: null,
        path: '/api/nutrition-info?measurement_units=std&sex=female&age_value=20&age_type=yrs&feet=5&inches=2&lbs=120&activity_level=Active',
        headers: {
          'x-rapidapi-key': '73003ae64bmsh9040c4806a9590dp110ce1jsnedd967c642c6',
          'x-rapidapi-host': 'nutrition-calculator.p.rapidapi.com'
        }
      };

      const req = http.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', async function () {
          const body = Buffer.concat(chunks);
          // console.log(body.toString());
          let resultJson = JSON.parse(body)
          /*
          await fs.writeFile('nutritionReturned.json', JSON.stringify(resultJson), function (err) {
            if (err) {
              console.log(err);
            }
          })

          const data = await fs.readFile('nutritionReturned.json'); /*,  function (err, data) {
            if (err) {
                console.log(err);
            } else if (data.length > 0) {

            }
            return data;
        }); */
      const jsonData = JSON.parse(result);
      const macroNutrients = jsonData["macronutrients_table"]["macronutrients-table"];
      var displayString = jsonData['BMI_EER']['Estimated Daily Caloric Needs'] + "   ";
      var newString = "";
      let spaces = 0;
      // this.nutritionNeed = macroNutrients.toString();
      // console.log(jsonData["macronutrients_table"]["macronutrients-table"].length);
      // console.log(jsonData["macronutrients_table"]["macronutrients-table"]);
      // console.log(jsonData["macronutrients_table"]["macronutrients-table"][0]);
      // console.log(typeof jsonData["macronutrients_table"]["macronutrients-table"]);
      for (let i = 0; i < jsonData["macronutrients_table"]["macronutrients-table"].length; i++) {
        newString = macroNutrients[i][0] + " : " + macroNutrients[i][1] + "   ";
        // spaces = 100 - newString.length;
        if ((macroNutrients[i][0] == "Carbohydrate") || (macroNutrients[i][0] == "Protein")) {
          displayString = displayString.concat('', newString);
        } else if ((macroNutrients[i][0] == "Fat") || (macroNutrients[i][0] == "Total Water")) {
          displayString = displayString.concat('', newString);
        }

        // console.log(macroNutrients[i][0]);
      }
      this.nutritionNeed = displayString;
      this.loading2 = false;
      // });
      // });

      // req.end();

    }
  },
};
</script>

<style scoped>
/* Basic styles */
.open-food-facts {
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
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: var(--vp-c-text);
}

.info-section {
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
  border-radius: 8px 0 0 8px;
  font-size: 20px;
}

button {
  padding: 12px 20px;
  border: none;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 0 8px 8px 0;
}

button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
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

</style>
