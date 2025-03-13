<script setup>
import { ref, shallowRef, onMounted, watch } from "vue";
import useGravityForm from "~/composables/useGravityForm";
import { useFormFields } from "~/composables/useFormFields";

const { fetchForm, submitForm } = useGravityForm();
const { resolveFieldComponent } = useFormFields();

// Use shallowRef for better performance with form values
const formValues = shallowRef({});
const formFields = ref([]);
const pending = ref(true);
const error = ref(null);

const getNameKey = (inputId) => {
  const part = inputId.split(".")[1];
  const map = {
    2: "prefix",
    3: "first",
    4: "middle",
    6: "last",
    8: "suffix",
  };
  return map[part] || "";
};

const addressLabels = {
  street: "Street Address",
  lineTwo: "Address Line 2",
  city: "City",
  state: "State/Province",
  zip: "ZIP/Postal Code",
  country: "Country",
};

onMounted(async () => {
  try {
    console.log("Component mounted, fetching form...");
    const { data, error: fetchError } = await fetchForm(1);

    // Log the address field structure
    const addressField = data.value.find((f) => f.type === "ADDRESS");
    console.log("Address field structure:", {
      field: addressField,
      inputs: addressField?.inputs,
    });

    console.log("Fetch response:", {
      data: data.value,
      error: fetchError?.value,
    });

    if (fetchError?.value) {
      throw new Error(fetchError.value);
    }

    if (data.value && Array.isArray(data.value)) {
      console.log("GraphQL Response:", data.value);
      formFields.value = data.value;
      console.log("Form fields loaded:", formFields.value.length);

      // Initialize form values
      const values = {};
      data.value.forEach((field) => {
        if (field.type === "ADDRESS") {
          console.log("Initializing address field:", field);
          values[field.databaseId] = {
            street: "",
            lineTwo: "",
            city: "",
            state: "",
            zip: "",
            country: "US",
          };

          // Log the field inputs for debugging
          console.log("Address field inputs:", field.inputs);
        } else if (field.type === "CHECKBOX" || field.type === "MULTISELECT") {
          values[field.databaseId] = [];
        } else if (field.type === "NAME") {
          values[field.databaseId] = {
            prefix: "",
            first: "",
            middle: "",
            last: "",
            suffix: "",
          };
        } else {
          values[field.databaseId] = "";
        }
      });

      formValues.value = values;
      console.log("Form values initialized:", formValues.value);
    } else {
      console.error("Unexpected data structure:", data.value);
    }
  } catch (err) {
    error.value = err.message;
    console.error("Error loading form:", err);
  } finally {
    pending.value = false;
  }
});

// Add a watch to debug address field changes
watch(
  () => formValues.value[7], // Assuming 7 is your address field ID
  (newValue) => {
    console.log("Address field updated:", newValue);
  },
  { deep: true }
);

const handleSubmit = async () => {
  try {
    pending.value = true;

    // Debug log for address field
    const addressField = formValues.value[7]; // Assuming 7 is your address field ID
    console.log("Address field values before submission:", addressField);

    console.log("Submitting form values:", formValues.value);
    const response = await submitForm(1, formValues.value);
    console.log("Form submission response:", response);

    if (response?.confirmation) {
      console.log("Success:", response.confirmation.message);
      alert(response.confirmation.message);
    }
  } catch (err) {
    console.error("Form submission error:", err);
    error.value = err.message;
    alert(`Error submitting form: ${err.message}`);
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <div class="p-4">
    <div v-if="pending">Loading form...</div>
    <div v-else-if="error">{{ error }}</div>
    <form v-else @submit.prevent="handleSubmit">
      <div v-for="field in formFields" :key="field.databaseId" class="mb-4">
        <!-- TEXT Field -->
        <div v-if="field.type === 'TEXT'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="text"
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || ''"
            class="form-input"
          />
        </div>

        <!-- EMAIL Field -->
        <div v-else-if="field.type === 'EMAIL'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="email"
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || ''"
            :required="field.isRequired"
            class="form-input"
          />
        </div>

        <!-- TEXTAREA Field -->
        <div v-else-if="field.type === 'TEXTAREA'" class="form-group">
          <label>{{ field.label }}</label>
          <textarea
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || ''"
            class="form-input"
          ></textarea>
        </div>

        <!-- SELECT Field -->
        <div v-else-if="field.type === 'SELECT'" class="form-group">
          <label>{{ field.label }}</label>
          <select v-model="formValues[field.databaseId]" class="form-input">
            <option value="">Select an option</option>
            <option
              v-for="choice in field.choices"
              :key="choice.value"
              :value="choice.value"
            >
              {{ choice.text }}
            </option>
          </select>
        </div>

        <!-- MULTISELECT Field -->
        <div v-else-if="field.type === 'MULTISELECT'" class="form-group">
          <label>{{ field.label }}</label>
          <select
            v-model="formValues[field.databaseId]"
            multiple
            class="form-input"
          >
            <option
              v-for="choice in field.choices"
              :key="choice.value"
              :value="choice.value"
            >
              {{ choice.text }}
            </option>
          </select>
        </div>

        <!-- CHECKBOX Field -->
        <div v-else-if="field.type === 'CHECKBOX'" class="form-group">
          <label>{{ field.label }}</label>
          <div v-for="choice in field.choices" :key="choice.value">
            <label>
              <input
                type="checkbox"
                :value="choice.value"
                v-model="formValues[field.databaseId]"
              />
              {{ choice.text }}
            </label>
          </div>
        </div>

        <!-- RADIO Field -->
        <div v-else-if="field.type === 'RADIO'" class="form-group">
          <label>{{ field.label }}</label>
          <div v-for="choice in field.choices" :key="choice.value">
            <label>
              <input
                type="radio"
                :value="choice.value"
                v-model="formValues[field.databaseId]"
              />
              {{ choice.text }}
            </label>
          </div>
        </div>

        <!-- NAME Field -->
        <div v-else-if="field.type === 'NAME'" class="form-group">
          <label>{{ field.label }}</label>
          <div class="space-y-2">
            <template v-if="field.inputs">
              <input
                v-for="input in field.inputs"
                :key="input.id"
                type="text"
                v-model="formValues[field.databaseId][input.key]"
                :placeholder="input.label"
                class="form-input"
              />
            </template>
          </div>
        </div>

        <!-- ADDRESS Field -->
        <div v-else-if="field.type === 'ADDRESS'" class="form-group">
          <label>{{ field.label }}</label>
          <div class="space-y-2">
            <div v-for="(label, key) in addressLabels" :key="key" class="mb-2">
              <label class="text-sm text-gray-600">{{ label }}</label>
              <template v-if="key === 'country'">
                <select
                  v-model="formValues[field.databaseId][key]"
                  class="form-input"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </template>
              <template v-else>
                <input
                  type="text"
                  :placeholder="label"
                  v-model="formValues[field.databaseId][key]"
                  class="form-input"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded"
        :disabled="pending"
      >
        {{ pending ? "Submitting..." : "Submit" }}
      </button>
    </form>

    <!-- Debug info -->
    <div class="mt-4 p-4 bg-gray-100 rounded">
      <p>Debug Info:</p>
      <p>Pending: {{ pending }}</p>
      <p>Error: {{ error }}</p>
      <p>Fields Count: {{ formFields?.length || 0 }}</p>
      <p>First Field Type: {{ formFields?.[0]?.type || "none" }}</p>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  @apply mb-4;
}

.form-input {
  @apply w-full p-2 border border-gray-300 rounded;
}

.checkbox-item,
.radio-item {
  @apply flex items-center gap-2 mb-2;
}

label {
  @apply block mb-1 font-medium;
}
</style>
