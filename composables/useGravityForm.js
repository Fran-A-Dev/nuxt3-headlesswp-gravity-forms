import { ref } from "vue";
import { useRuntimeConfig } from "#app";

export default function useGravityForm() {
  const config = useRuntimeConfig();
  const formFields = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Log the config when the composable is initialized
  console.log("WordPress URL from config:", config.public.wordpressUrl);

  const formQuery = `
    query GetGravityForm($formId: ID!) {
      gfForm(id: $formId, idType: DATABASE_ID) {
        formFields(first: 300) {
          nodes {
            ... on AddressField {
              databaseId
              type
              label
              isRequired
              inputs {
                id
                label
                placeholder
              }
            }
            ... on TextField {
              databaseId
              type
              label
              isRequired
              placeholder
              maxLength
              description
            }
            ... on TextAreaField {
              databaseId
              type
              label
              isRequired
              placeholder
            }
            ... on EmailField {
              databaseId
              type
              label
              isRequired
              placeholder
            }
            ... on NameField {
              databaseId
              type
              label
              isRequired
              inputs {
                id
                label
                placeholder
              }
            }
            ... on PhoneField {
              databaseId
              type
              label
              isRequired
              placeholder
            }
            ... on SelectField {
              databaseId
              type
              label
              isRequired
              choices {
                text
                value
              }
            }
            ... on MultiSelectField {
              databaseId
              type
              label
              isRequired
              choices {
                text
                value
              }
            }
            ... on CheckboxField {
              databaseId
              type
              label
              isRequired
              choices {
                text
                value
              }
            }
            ... on RadioField {
              databaseId
              type
              label
              isRequired
              choices {
                text
                value
              }
            }
            ... on DateField {
              databaseId
              type
              label
              isRequired
            }
            ... on TimeField {
              databaseId
              type
              label
              isRequired
            }
            ... on WebsiteField {
              databaseId
              type
              label
              isRequired
              placeholder
            }
          }
        }
      }
    }
  `;

  const fetchForm = async (formId) => {
    isLoading.value = true;
    try {
      // Log the request details
      const requestBody = {
        query: formQuery,
        variables: { formId: formId.toString() },
      };

      console.log("Making GraphQL request:", {
        url: config.public.wordpressUrl,
        body: requestBody,
      });

      const response = await fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Log the raw response
      const rawResponse = await response.text();
      console.log("Raw response:", rawResponse);

      // Try to parse the response
      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(
          `Invalid JSON response: ${rawResponse.substring(0, 100)}...`
        );
      }

      if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        throw new Error(result.errors[0].message);
      }

      const fields = result.data?.gfForm?.formFields?.nodes;
      if (!Array.isArray(fields)) {
        console.error("Invalid fields data:", result.data);
        throw new Error("Invalid form fields data");
      }

      formFields.value = fields;
      return { data: ref(fields), error: ref(null) };
    } catch (err) {
      console.error("Error fetching form:", err);
      return { data: ref([]), error: ref(err.message) };
    } finally {
      isLoading.value = false;
    }
  };

  const transformFieldValue = (field, value) => {
    if (!field) return null;

    const fieldId = parseInt(field.databaseId, 10);

    switch (field.type) {
      case "CHECKBOX":
        if (!Array.isArray(value) || !value.length) return null;

        return {
          id: fieldId,
          checkboxValues: value.map((val, index) => ({
            inputId: parseFloat(`${fieldId}.${index + 1}`), // Convert to number: 8.1, 8.2, etc.
            value: val,
          })),
        };

      case "ADDRESS":
        return {
          id: fieldId,
          addressValues: {
            street: value?.street || "",
            lineTwo: value?.lineTwo || "",
            city: value?.city || "",
            state: value?.state || "",
            zip: value?.zip || "",
            country: value?.country || "US",
          },
        };

      case "EMAIL":
        return {
          id: fieldId,
          emailValues: {
            value: value || "",
            confirmationValue: value || "",
          },
        };

      case "NAME":
        return {
          id: fieldId,
          nameValues: {
            prefix: value?.prefix || "",
            first: value?.first || "",
            middle: value?.middle || "",
            last: value?.last || "",
            suffix: value?.suffix || "",
          },
        };

      case "MULTISELECT":
      case "POST_CATEGORY":
      case "POST_CUSTOM":
      case "POST_TAGS":
        return {
          id: fieldId,
          values: Array.isArray(value) ? value : [],
        };

      default:
        return {
          id: fieldId,
          value: value?.toString() || "",
        };
    }
  };

  const submitForm = async (formId, fieldValues) => {
    try {
      console.log("Submitting form values:", fieldValues);

      const transformedValues = Object.entries(fieldValues)
        .map(([id, value]) => {
          const field = formFields.value.find(
            (f) => f.databaseId === parseInt(id, 10)
          );
          if (!field) {
            console.warn(`No field found for ID ${id}`);
            return null;
          }
          return transformFieldValue(field, value);
        })
        .filter(Boolean);

      console.log("Transformed values:", transformedValues);

      const mutation = `
        mutation SubmitForm($formId: ID!, $fieldValues: [FormFieldValuesInput!]!) {
          submitGfForm(input: {
            id: $formId
            fieldValues: $fieldValues
          }) {
            errors {
              id
              message
            }
            confirmation {
              message
              type
            }
            entry {
              id
              ... on GfSubmittedEntry {
                databaseId
              }
            }
          }
        }
      `;

      const response = await fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            formId: parseInt(formId, 10),
            fieldValues: transformedValues,
          },
        }),
      });

      const result = await response.json();
      console.log("Submission response:", result);

      if (result.errors) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }

      return result.data.submitGfForm;
    } catch (error) {
      console.error("Submit form error:", error);
      throw error;
    }
  };

  return { formFields, isLoading, error, fetchForm, submitForm };
}
