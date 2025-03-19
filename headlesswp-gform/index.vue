<template>
  <div class="form-container">
    <!-- Loading State -->
    <div v-if="pending" class="loading">Loading form...</div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>

    <!-- Form Content -->
    <div v-else>
      <h1>Contact Form</h1>
      <form @submit.prevent="handleSubmit" class="gravity-form">
        <template v-for="field in data" :key="field.databaseId">
          <component
            :is="getFieldComponent(field.type)"
            :field="field"
            v-model="formData[field.databaseId]"
            :error="formErrors[field.databaseId]"
          />
        </template>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Submitting..." : "Submit" }}
        </button>
      </form>

      <!-- Submission Success Message -->
      <div v-if="submissionResult" class="submission-result">
        <div v-html="submissionResult.confirmation?.message"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted } from "vue";
import useGravityForm from "~/composables/useGravityForm";
import { useFormFields } from "~/composables/useFormFields";

const { fetchForm, submitForm } = useGravityForm();
const { resolveFieldComponent } = useFormFields();

const formValues = shallowRef({});
const formFields = ref([]);

// This is the correct way - getting the states directly from useFetch
const { execute, data, error, pending } = fetchForm(1);

const formData = ref({});
const formErrors = ref({});
const isSubmitting = ref(false);
const submissionResult = ref(null);

const { getFieldComponent } = useFormFields();

onMounted(async () => {
  try {
    await execute();

    // Process data and initialize form values
    if (data.value && Array.isArray(data.value)) {
      // Init form values logic...
    }
  } catch (err) {
    console.error("Failed to fetch form:", err);
  }
});

const handleSubmit = async () => {
  try {
    formErrors.value = {};
    isSubmitting.value = true;
    submissionResult.value = await submitForm("1", formData.value);

    // Clear form if submission was successful
    if (!submissionResult.value.errors) {
      formData.value = {};
    } else {
      // Handle validation errors
      submissionResult.value.errors.forEach((error) => {
        formErrors.value[error.id] = error.message;
      });
    }
  } catch (err) {
    console.error("Form submission error:", err);
    // Handle general submission error
    formErrors.value.general = err.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
}

.gravity-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.submission-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #e8f5e9;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
