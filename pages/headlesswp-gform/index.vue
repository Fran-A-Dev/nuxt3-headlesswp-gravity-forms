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

onMounted(async () => {
  try {
    const { data, error: fetchError } = await fetchForm(1);

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
  <div class="p-4">
    <div v-if="pending">Loading form...</div>
    <div v-else-if="error">{{ error }}</div>
    <form v-else @submit.prevent="handleSubmit">
      <div v-for="field in formFields" :key="field.databaseId" class="mb-4">
        <!-- TEXT Field -->
        <div v-if="field.type === 'TEXT'" class="form-group">
          <label>{{ field.label }}</label>
          <div>
            <input
              type="text"
              v-model="formValues[field.databaseId]"
              :placeholder="field.placeholder || ''"
              :maxlength="field.maxLength || undefined"
              :required="field.isRequired"
              class="form-input"
            />
            <div v-if="field.description" class="text-sm text-gray-600 mt-1">
              {{ field.description }}
            </div>
          </div>
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
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
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

      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded"
        :disabled="pending"
      >
        {{ pending ? "Submitting..." : "Submit" }}
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

.checkbox-item,
.radio-item {
  @apply flex items-center gap-2 mb-2;
}

label {
  @apply block mb-1 font-medium;
}
</style>
