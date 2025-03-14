<script setup>
import { reactive, watch } from "vue";

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

watch(
  addressValues,
  (newValues) => {
    emit("update:modelValue", { ...newValues });
  },
  { deep: true }
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
            />
            <input
              v-model="addressValues.state"
              placeholder="State/Province"
              :required="field.isRequired"
            />
          </div>
          <div class="zip-country-group">
            <input
              v-model="addressValues.zip"
              placeholder="ZIP/Postal Code"
              :required="field.isRequired"
            />
            <select
              v-model="addressValues.country"
              :required="field.isRequired"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
            </select>
          </div>
        </div>
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
