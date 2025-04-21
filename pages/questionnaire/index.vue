<script setup>
import { ref, reactive, onMounted, watch } from "vue";

// Import dynamic mapping function from the composable.
import { useFormFields } from "~/composables/useFormFields";
const { resolveFieldComponent } = useFormFields();

// Import other dependencies and composables.
import useGravityForm from "~/composables/useGravityForm";
const { fetchForm, submitForm, formFields } = useGravityForm();

const formValues = ref({});
const error = ref(null);

// Validation error storage
const validationErrors = reactive({
  address: {
    street: null,
    city: null,
    state: null,
    zip: null,
    country: null,
  },
  email: null,
});

const validateAddress = (address) => {
  let valid = true;
  if (!address.street) {
    validationErrors.address.street = "Street address is required.";
    valid = false;
  } else {
    validationErrors.address.street = null;
  }
  if (!address.city) {
    validationErrors.address.city = "City is required.";
    valid = false;
  } else {
    validationErrors.address.city = null;
  }
  if (!address.state) {
    validationErrors.address.state = "State is required.";
    valid = false;
  } else {
    validationErrors.address.state = null;
  }
  if (!address.zip || !/^\d{5}$/.test(address.zip)) {
    validationErrors.address.zip = "Please enter a valid 5-digit ZIP code.";
    valid = false;
  } else {
    validationErrors.address.zip = null;
  }
  if (!address.country) {
    validationErrors.address.country = "Country is required.";
    valid = false;
  } else {
    validationErrors.address.country = null;
  }
  return valid;
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    validationErrors.email = "Please enter a valid email address.";
    return false;
  }
  validationErrors.email = null;
  return true;
};

onMounted(() => {
  const { data, error: fetchError, execute } = fetchForm();
  execute();
  watch(data, (newData) => {
    if (newData && Array.isArray(newData)) {
      formFields.value = newData;
      const initialValues = {};
      newData.forEach((field) => {
        switch (field.type.toUpperCase()) {
          case "ADDRESS":
            initialValues[field.databaseId] = {
              street: "",
              lineTwo: "",
              city: "",
              state: "",
              zip: "",
              country: "US",
            };
            break;
          case "CHECKBOX":
          case "MULTISELECT":
            initialValues[field.databaseId] = [];
            break;
          case "NAME":
            initialValues[field.databaseId] = {
              prefix: "",
              first: "",
              middle: "",
              last: "",
              suffix: "",
            };
            break;
          default:
            initialValues[field.databaseId] = "";
        }
      });
      formValues.value = initialValues;
    }
  });
  watch(fetchError, (err) => {
    if (err) {
      error.value = err.message;
    }
  });
});

const handleSubmit = async () => {
  let isValid = true;
  const emailField = formFields.value.find(
    (field) => field.type.toUpperCase() === "EMAIL"
  );
  if (emailField && formValues.value[emailField.databaseId]) {
    if (!validateEmail(formValues.value[emailField.databaseId])) {
      isValid = false;
    }
  }
  const addressField = formFields.value.find(
    (field) => field.type.toUpperCase() === "ADDRESS"
  );
  if (addressField && formValues.value[addressField.databaseId]) {
    if (!validateAddress(formValues.value[addressField.databaseId])) {
      isValid = false;
    }
  }
  if (!isValid) {
    alert("Please fix the errors before submitting.");
    return;
  }
  try {
    const response = await submitForm(1, formValues.value);
    if (response?.errors?.length > 0) {
      throw new Error(response.errors[0].message);
    }
    if (response?.confirmation) {
      const temp = document.createElement("div");
      temp.innerHTML = response.confirmation.message;
      const cleanMessage = temp.textContent || temp.innerText;
      alert(cleanMessage);
      const resetValues = {};
      formFields.value.forEach((field) => {
        switch (field.type.toUpperCase()) {
          case "ADDRESS":
            resetValues[field.databaseId] = {
              street: "",
              lineTwo: "",
              city: "",
              state: "",
              zip: "",
              country: "US",
            };
            break;
          case "CHECKBOX":
          case "MULTISELECT":
            resetValues[field.databaseId] = [];
            break;
          case "NAME":
            resetValues[field.databaseId] = {
              prefix: "",
              first: "",
              middle: "",
              last: "",
              suffix: "",
            };
            break;
          default:
            resetValues[field.databaseId] = "";
        }
      });
      formValues.value = resetValues;
    }
  } catch (err) {
    alert(`Error submitting form: ${err.message}`);
  }
};
</script>

<template>
  <div class="p-4">
    <div v-if="error">
      <p class="text-red-600">Error: {{ error }}</p>
    </div>
    <div v-else-if="!formFields.length">
      <p>Loading form...</p>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div v-for="field in formFields" :key="field.databaseId" class="mb-4">
        <component
          :is="resolveFieldComponent(field)"
          :field="field"
          v-model="formValues[field.databaseId]"
        />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  </div>
</template>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
</style>
