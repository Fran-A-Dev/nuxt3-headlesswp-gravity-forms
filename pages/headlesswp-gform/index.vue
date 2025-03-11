<script setup>
const config = useRuntimeConfig();

const query = `
  query {
    gfForm(id: 1, idType: DATABASE_ID) {
      databaseId
      title
      description
      formFields(first: 300) {
        nodes {
          databaseId
          type
          ... on TextField {
            label
            isRequired
            placeholder
          }
          ... on EmailField {
            label
            isRequired
            placeholder
          }
          ... on TextAreaField {
            label
            isRequired
            placeholder
          }
          ... on SelectField {
            label
            isRequired
            choices {
              text
              value
              isSelected
            }
          }
          ... on RadioField {
            label
            isRequired
            choices {
              text
              value
              isSelected
            }
          }
          ... on CheckboxField {
            label
            isRequired
            choices {
              text
              value
              isSelected
            }
          }
          ... on DateField {
            label
            isRequired
            placeholder
          }
          ... on TimeField {
            label
            isRequired
            timeFormat
          }
          ... on PhoneField {
            label
            isRequired
            placeholder
          }
          ... on NameField {
            label
            isRequired
            inputs {
              id
              label
              isHidden
              placeholder
            }
          }
          ... on AddressField {
            label
            isRequired
            inputs {
              id
              label
              placeholder
              customLabel
              autocompleteAttribute
            }
          }
          ... on WebsiteField {
            label
            isRequired
            placeholder
          }
          ... on MultiSelectField {
            label
            isRequired
            choices {
              text
              value
              isSelected
            }
          }
        }
      }
    }
  }
`;

const { data: formData } = await useFetch(
  `${config.public.wordpressUrl}?query=${encodeURIComponent(query)}`,
  {
    method: "GET",
    transform: (response) => response?.data?.gfForm || null,
  }
);

const formValues = ref({});
const { resolveFieldComponent } = useFormFields();

const handleSubmit = async (event) => {
  event.preventDefault();
  console.log("Form values:", formValues.value);
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div v-if="formData" class="bg-white shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold mb-2">{{ formData.title }}</h1>
      <p class="text-gray-600 mb-6">{{ formData.description }}</p>

      <form @submit="handleSubmit" class="space-y-6">
        <div
          v-for="field in formData.formFields.nodes"
          :key="field.databaseId"
          class="form-field"
        >
          <component
            :is="resolveFieldComponent(field.type)"
            v-if="resolveFieldComponent(field.type)"
            :field="field"
            v-model="formValues[field.databaseId]"
          />
        </div>

        <div class="mt-8">
          <button
            type="submit"
            class="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Submit Form
          </button>
        </div>
      </form>

      <!-- Debug section (remove in production) -->
      <div class="mt-8 p-4 bg-gray-50 rounded-md">
        <h2 class="text-sm font-semibold text-gray-500 mb-2">
          Form Values (Debug):
        </h2>
        <pre class="text-xs">{{ JSON.stringify(formValues, null, 2) }}</pre>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Loading form...</p>
    </div>
  </div>
</template>

<style>
.form-field {
  @apply bg-white rounded-md;
}
</style>
