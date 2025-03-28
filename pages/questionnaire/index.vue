<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import TextField from "~/components/form-fields/TextField.vue";
import EmailField from "~/components/form-fields/EmailField.vue";
import TextAreaField from "~/components/form-fields/TextAreaField.vue";
import SelectField from "~/components/form-fields/SelectField.vue";
import MultiSelectField from "~/components/form-fields/MultiSelectField.vue";
import AddressField from "~/components/form-fields/AddressField.vue";
import CheckboxField from "~/components/form-fields/CheckboxField.vue";
import DateField from "~/components/form-fields/DateField.vue";
import TimeField from "~/components/form-fields/TimeField.vue";
import NameField from "~/components/form-fields/NameField.vue";
import WebsiteField from "~/components/form-fields/WebsiteField.vue";

// Bring in your composables
const { fetchForm, submitForm, formFields } = useGravityForm();

// Use ref for form values
const formValues = ref({});

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

// Validate the entire address object and update errors per field.
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

// Validate the email value and update the error.
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    validationErrors.email = "Please enter a valid email address.";
    return false;
  }
  validationErrors.email = null;
  return true;
};

// Handle field value updates
const updateFieldValue = (fieldId, value) => {
  formValues.value = {
    ...formValues.value,
    [fieldId]: value,
  };
};

onMounted(() => {
  const { data, error: fetchError, execute } = fetchForm();
  execute();

  watch(data, (newData) => {
    if (newData && Array.isArray(newData)) {
      formFields.value = newData;
      const initialValues = {};
      newData.forEach((field) => {
        switch (field.type) {
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

  // Validate email field before submission
  const emailField = formFields.value.find((field) => field.type === "EMAIL");
  if (emailField && formValues.value[emailField.databaseId]) {
    if (!validateEmail(formValues.value[emailField.databaseId])) {
      isValid = false;
    }
  }

  // Validate address field before submission
  const addressField = formFields.value.find(
    (field) => field.type === "ADDRESS"
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

      // Reset fields after submission
      const resetValues = {};
      formFields.value.forEach((field) => {
        switch (field.type) {
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

// Map field types to components
const fieldComponents = {
  TEXT: TextField,
  EMAIL: EmailField,
  TEXTAREA: TextAreaField,
  SELECT: SelectField,
  MULTISELECT: MultiSelectField,
  ADDRESS: AddressField,
  CHECKBOX: CheckboxField,
  DATE: DateField,
  TIME: TimeField,
  NAME: NameField,
  WEBSITE: WebsiteField,
};
</script>

<template>
  <div class="p-4">
    <!-- Global error message -->
    <div v-if="error">
      <p class="text-red-600">Error: {{ error }}</p>
    </div>
    <div v-else-if="!formFields.length">
      <p>Loading form...</p>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div v-for="field in formFields" :key="field.databaseId" class="mb-4">
        <component
          :is="fieldComponents[field.type]"
          :field="field"
          :model-value="formValues[field.databaseId]"
          @update:model-value="
            (newValue) => updateFieldValue(field.databaseId, newValue)
          "
          :validation-errors="validationErrors"
          :validate-email="validateEmail"
          :validate-address="validateAddress"
        />
      </div>

      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-group {
  @apply mb-4;
}

.form-input {
  @apply w-full p-2 border border-gray-300 rounded;
}

label {
  @apply block mb-1 font-medium;
}
</style>
