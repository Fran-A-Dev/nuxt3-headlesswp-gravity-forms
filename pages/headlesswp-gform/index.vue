<script setup>
import { ref, shallowRef, onMounted } from "vue";
import useGravityForm from "~/composables/useGravityForm";
import { useFormFields } from "~/composables/useFormFields";

const { fetchForm, submitForm } = useGravityForm();
const { resolveFieldComponent } = useFormFields();

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

// Get the fetch function for form ID 1
const fetchFormData = fetchForm(1);

onMounted(async () => {
  try {
    pending.value = true;
    // Execute the fetch function
    const { data, error: fetchError } = await fetchFormData();

    if (fetchError?.value) {
      throw new Error(fetchError.value);
    }

    if (data.value && Array.isArray(data.value)) {
      formFields.value = data.value;

      // Initialize form values
      const values = {};
      data.value.forEach((field) => {
        if (field.type === "ADDRESS") {
          values[field.databaseId] = {
            street: "",
            lineTwo: "",
            city: "",
            state: "",
            zip: "",
            country: "US",
          };
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
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    pending.value = false;
  }
});

const handleSubmit = async () => {
  try {
    pending.value = true;
    const response = await submitForm(1, formValues.value);

    if (response?.errors?.length > 0) {
      throw new Error(response.errors[0].message);
    }

    if (response?.confirmation) {
      const temp = document.createElement("div");
      temp.innerHTML = response.confirmation.message;
      const cleanMessage = temp.textContent || temp.innerText;
      alert(cleanMessage);

      // Reset form values
      formFields.value.forEach((field) => {
        if (field.type === "ADDRESS") {
          formValues.value[field.databaseId] = {
            street: "",
            lineTwo: "",
            city: "",
            state: "",
            zip: "",
            country: "US",
          };
        } else if (field.type === "CHECKBOX" || field.type === "MULTISELECT") {
          formValues.value[field.databaseId] = [];
        } else if (field.type === "NAME") {
          formValues.value[field.databaseId] = {
            prefix: "",
            first: "",
            middle: "",
            last: "",
            suffix: "",
          };
        } else {
          formValues.value[field.databaseId] = "";
        }
      });
    }
  } catch (err) {
    error.value = err.message;
    alert(`Error submitting form: ${err.message}`);
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" v-if="!pending">
      <div
        v-for="field in formFields"
        :key="field.databaseId"
        class="form-field"
      >
        <component
          :is="resolveFieldComponent(field.type)"
          :field="field"
          v-model="formValues[field.databaseId]"
        />
        <span v-if="field.description" class="field-description">
          {{ field.description }}
        </span>
      </div>

      <button type="submit" :disabled="pending">Submit</button>
    </form>
    <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
    <div v-else>Loading form...</div>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-field {
  margin-bottom: 1.5rem;
}

.field-description {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.field-wrapper {
  margin-bottom: 0.5rem;
}

.field-wrapper label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.field-wrapper .checkbox-option input,
.field-wrapper .radio-option input {
  width: auto;
  display: inline-block;
  margin-right: 0.5rem;
}
</style>
