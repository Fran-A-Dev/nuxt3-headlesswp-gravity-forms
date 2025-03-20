<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import useGravityForm from "~/composables/useGravityForm";
import { useFormFields } from "~/composables/useFormFields";

// Bring in your composables
const { fetchForm, submitForm, formFields } = useGravityForm();
const { resolveFieldComponent } = useFormFields();

// Use reactive for deep reactivity (for nested objects)
const formValues = reactive({});
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

// Helper function to map input.id to the correct name key (prefix, first, etc.)
const getNameKey = (inputId) => {
  const idString = String(inputId);
  const parts = idString.split(".");
  if (parts.length < 2) return "";
  const part = parts[1];
  const map = {
    2: "prefix",
    3: "first",
    4: "middle",
    6: "last",
    8: "suffix",
  };
  return map[part] || "";
};

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

onMounted(() => {
  const { data, pending, error: fetchError, execute } = fetchForm();
  execute();

  watch(data, (newData) => {
    if (newData && Array.isArray(newData)) {
      formFields.value = newData;
      newData.forEach((field) => {
        switch (field.type) {
          case "ADDRESS":
            formValues[field.databaseId] = {
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
            formValues[field.databaseId] = [];
            break;
          case "NAME":
            formValues[field.databaseId] = {
              prefix: "",
              first: "",
              middle: "",
              last: "",
              suffix: "",
            };
            break;
          default:
            formValues[field.databaseId] = "";
        }
      });
    }
  });

  watch(fetchError, (err) => {
    if (err) {
      error.value = err.message;
    }
  });

  watch(pending, (val) => {
    console.log("Pending status:", val);
  });
});

const handleSubmit = async () => {
  let isValid = true;

  // Validate email field before submission
  const emailField = formFields.value.find((field) => field.type === "EMAIL");
  if (emailField && formValues[emailField.databaseId]) {
    if (!validateEmail(formValues[emailField.databaseId])) {
      isValid = false;
    }
  }

  // Validate address field before submission
  const addressField = formFields.value.find(
    (field) => field.type === "ADDRESS"
  );
  if (addressField && formValues[addressField.databaseId]) {
    if (!validateAddress(formValues[addressField.databaseId])) {
      isValid = false;
    }
  }

  if (!isValid) {
    alert("Please fix the errors before submitting.");
    return;
  }

  try {
    const response = await submitForm(1, formValues);
    if (response?.errors?.length > 0) {
      throw new Error(response.errors[0].message);
    }
    if (response?.confirmation) {
      const temp = document.createElement("div");
      temp.innerHTML = response.confirmation.message;
      const cleanMessage = temp.textContent || temp.innerText;
      alert(cleanMessage);
      // Reset fields after submission
      formFields.value.forEach((field) => {
        switch (field.type) {
          case "ADDRESS":
            formValues[field.databaseId] = {
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
            formValues[field.databaseId] = [];
            break;
          case "NAME":
            formValues[field.databaseId] = {
              prefix: "",
              first: "",
              middle: "",
              last: "",
              suffix: "",
            };
            break;
          default:
            formValues[field.databaseId] = "";
        }
      });
    }
  } catch (err) {
    alert(`Error submitting form: ${err.message}`);
  }
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
        <!-- TEXT Field -->
        <div v-if="field.type === 'TEXT'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="text"
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || ''"
            :maxlength="field.maxLength || undefined"
            :required="field.isRequired"
            class="form-input"
          />
        </div>

        <!-- EMAIL Field with onBlur Validation -->
        <div v-else-if="field.type === 'EMAIL'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="email"
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || ''"
            :required="field.isRequired"
            class="form-input"
            @blur="() => validateEmail(formValues[field.databaseId])"
          />
          <div v-if="validationErrors.email" class="text-red-600 text-sm">
            {{ validationErrors.email }}
          </div>
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
            <option value="">Select one or more options</option>
            <option
              v-for="choice in field.choices"
              :key="choice.value"
              :value="choice.value"
            >
              {{ choice.text }}
            </option>
          </select>
        </div>

        <!-- ADDRESS Field with onBlur Validation -->
        <div v-else-if="field.type === 'ADDRESS'" class="form-group">
          <label>{{ field.label }}</label>
          <div class="space-y-2">
            <div
              v-for="(label, key) in {
                street: 'Street',
                city: 'City',
                state: 'State',
                zip: 'ZIP',
                country: 'Country',
              }"
              :key="key"
              class="mb-2"
            >
              <label class="text-sm text-gray-600">{{ label }}</label>
              <template v-if="key !== 'country'">
                <input
                  type="text"
                  v-model="formValues[field.databaseId][key]"
                  :placeholder="label"
                  class="form-input"
                  @blur="() => validateAddress(formValues[field.databaseId])"
                />
              </template>
              <template v-else>
                <select
                  v-model="formValues[field.databaseId][key]"
                  class="form-input"
                  @blur="() => validateAddress(formValues[field.databaseId])"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                </select>
              </template>
            </div>
            <div
              v-if="validationErrors.address.street"
              class="text-red-600 text-sm"
            >
              {{ validationErrors.address.street }}
            </div>
            <div
              v-if="validationErrors.address.city"
              class="text-red-600 text-sm"
            >
              {{ validationErrors.address.city }}
            </div>
            <div
              v-if="validationErrors.address.state"
              class="text-red-600 text-sm"
            >
              {{ validationErrors.address.state }}
            </div>
            <div
              v-if="validationErrors.address.zip"
              class="text-red-600 text-sm"
            >
              {{ validationErrors.address.zip }}
            </div>
            <div
              v-if="validationErrors.address.country"
              class="text-red-600 text-sm"
            >
              {{ validationErrors.address.country }}
            </div>
          </div>
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

        <!-- DATE Field -->
        <div v-else-if="field.type === 'DATE'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="date"
            v-model="formValues[field.databaseId]"
            class="form-input"
          />
        </div>

        <!-- TIME Field -->
        <div v-else-if="field.type === 'TIME'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="time"
            v-model="formValues[field.databaseId]"
            class="form-input"
          />
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
                v-model="formValues[field.databaseId][getNameKey(input.id)]"
                :placeholder="input.label"
                class="form-input"
              />
            </template>
          </div>
        </div>

        <!-- WEBSITE Field -->
        <div v-else-if="field.type === 'WEBSITE'" class="form-group">
          <label>{{ field.label }}</label>
          <input
            type="url"
            v-model="formValues[field.databaseId]"
            :placeholder="field.placeholder || 'https://example.com'"
            class="form-input"
          />
        </div>
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

/* Removed any custom .text-red-600 rules to avoid circular dependency */
</style>
