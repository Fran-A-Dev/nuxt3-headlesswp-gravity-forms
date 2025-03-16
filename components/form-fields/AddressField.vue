<script setup>
import { reactive, ref, watch } from "vue";

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({
      street: "",
      lineTwo: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const addressValues = reactive({ ...props.modelValue });
const errorMessage = ref("");

const postalCodePatterns = {
  US: /^\d{5}(-\d{4})?$/, // US ZIP code
  CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // Canadian postal code
  GB: /^([Gg][Ii][Rr] 0[Aa]{2}|[A-Za-z]{1,2}[0-9][0-9]?[A-Za-z]?[ ]?[0-9][A-Za-z]{2})$/, // UK postal code
  AU: /^\d{4}$/, // Australian postal code
  NZ: /^\d{4}$/, // New Zealand postal code
};

const validateAddress = () => {
  const { street, city, state, zip, country } = addressValues;
  const pattern = postalCodePatterns[country];

  if (!street || !city || !state || !zip) {
    errorMessage.value = "Please fill out all required fields.";
  } else if (pattern && !pattern.test(zip)) {
    errorMessage.value =
      "Please enter a valid postal code for the selected country.";
  } else {
    errorMessage.value = ""; // Clear error message if valid
  }

  emit("update:modelValue", { ...addressValues }); // Emit updated address values
};

watch(
  () => props.modelValue,
  (newValue) => {
    Object.assign(addressValues, newValue); // Sync local ref with prop
    validateAddress(); // Validate the new value
  }
);
</script>

<template>
  <div class="form-container">
    <h1>Fran's Nuxt Headless WP Gravity Forms Questionnaire</h1>
    <form @submit.prevent="handleSubmit" v-if="!pending">
      <div class="field-wrapper">
        <label>{{ field.label }}</label>
        <div class="address-field-group">
          <div class="full-width">
            <input
              v-model="addressValues.street"
              placeholder="Street Address"
              :required="field.isRequired"
              @input="validateAddress"
            />
          </div>
          <div class="full-width">
            <input
              v-model="addressValues.lineTwo"
              placeholder="Address Line 2"
            />
          </div>
          <div class="city-state-group">
            <input
              v-model="addressValues.city"
              placeholder="City"
              :required="field.isRequired"
              @input="validateAddress"
            />
            <input
              v-model="addressValues.state"
              placeholder="State/Province"
              :required="field.isRequired"
              @input="validateAddress"
            />
          </div>
          <div class="zip-country-group">
            <input
              v-model="addressValues.zip"
              placeholder="ZIP/Postal Code"
              :required="field.isRequired"
              @input="validateAddress"
            />
            <select
              v-model="addressValues.country"
              :required="field.isRequired"
              @change="validateAddress"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
            </select>
          </div>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.address-field-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.full-width {
  width: 100%;
}

.city-state-group,
.zip-country-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.address-field-group input,
.address-field-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0; /* Remove default margins */
}

/* Add hover effect for better UX */
.address-field-group input:hover,
.address-field-group select:hover {
  border-color: #b3b3b3;
}

/* Add focus effect */
.address-field-group input:focus,
.address-field-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center; /* Center text within the container */
}

h1 {
  margin-bottom: 20px; /* Space below the heading */
  font-size: 1.5rem; /* Adjusted font size to be smaller */
  color: #333; /* Change color if needed */
}
</style>
