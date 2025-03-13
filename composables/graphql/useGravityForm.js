/*
export function useGravityForm() {
  const config = useRuntimeConfig();

  // Create refs for form data and values
  const formData = ref(null);
  const formValues = ref({});
  const isLoading = ref(false);
  const error = ref(null);

  // Add formFields ref to store the fields data
  const formFields = ref([]);

  const formQuery = `
    query GetGravityForm($formId: ID!) {
      gfForm(id: $formId, idType: DATABASE_ID) {
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
                placeholder
                isHidden
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
              }
              addressType
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
            ... on MultiSelectField {
              label
              isRequired
              choices {
                text
                value
                isSelected
              }
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
            ... on DateField {
              label
              isRequired
              placeholder
            }
            ... on WebsiteField {
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
    console.log("Fetching form...", formId);

    try {
      const response = await fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: formQuery,
          variables: { formId: formId.toString() },
        }),
      });

      const result = await response.json();
      console.log("GraphQL Raw Response:", result);

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const fields = result.data?.gfForm?.formFields?.nodes;
      if (!Array.isArray(fields)) {
        throw new Error("Invalid form fields data received");
      }

      // Log required fields
      const requiredFields = fields.filter((field) => field.isRequired);
      console.log(
        "Required fields:",
        requiredFields.map((f) => ({
          id: f.databaseId,
          type: f.type,
          label: f.label,
        }))
      );

      // Store the fields data
      formFields.value = fields;
      console.log("Form fields stored:", formFields.value);

      return {
        data: ref(fields),
        error: ref(null),
      };
    } catch (err) {
      console.error("Error fetching form:", err);
      return {
        data: ref([]),
        error: ref(err.message),
      };
    }
  };

  const initializeFormValues = () => {
    const values = {};
    if (formData.value?.formFields?.nodes) {
      formData.value.formFields.nodes.forEach((field) => {
        switch (field.type) {
          case "CHECKBOX":
            values[field.databaseId] = [];
            break;
          case "ADDRESS":
            values[field.databaseId] = {
              street: "",
              lineTwo: "",
              city: "",
              state: "",
              zip: "",
              country: "US",
            };
            break;
          case "NAME":
            values[field.databaseId] = {
              prefix: "",
              first: "",
              middle: "",
              last: "",
              suffix: "",
            };
            break;
          case "MULTISELECT":
            values[field.databaseId] = [];
            break;
          default:
            values[field.databaseId] = "";
        }
      });
    }
    formValues.value = values;
  };

  const formatFieldValue = (field, value) => {
    if (!field) return null;

    switch (field.type) {
      case "ADDRESS":
        return {
          id: field.databaseId,
          addressValues: {
            street: value?.street || "",
            lineTwo: value?.lineTwo || "",
            city: value?.city || "",
            state: value?.state || "",
            zip: value?.zip || "",
            country: value?.country === "USA" ? "US" : value?.country || "US",
          },
        };

      case "CHECKBOX":
        if (!Array.isArray(value) || !field.choices) {
          return {
            id: field.databaseId,
            checkboxValues: [],
          };
        }

        const checkboxValues = value.map((selectedValue) => {
          const choiceIndex = field.choices.findIndex(
            (choice) => choice.value === selectedValue
          );
          return {
            inputId: Number(`${field.databaseId}.${choiceIndex + 1}`),
            value: selectedValue,
          };
        });

        return {
          id: field.databaseId,
          checkboxValues,
        };

      case "EMAIL":
        return {
          id: field.databaseId,
          emailValues: {
            value: value || "",
            confirmationValue: value || "",
          },
        };

      case "MULTISELECT":
        return {
          id: field.databaseId,
          values: Array.isArray(value) ? value : [],
        };

      case "NAME":
        return {
          id: field.databaseId,
          nameValues: {
            prefix: value?.prefix || "",
            first: value?.first || "",
            middle: value?.middle || "",
            last: value?.last || "",
            suffix: value?.suffix || "",
          },
        };

      default:
        return {
          id: field.databaseId,
          value: value?.toString() || "",
        };
    }
  };

  const submitForm = async (formId, fieldValues) => {
    try {
      console.log("Preparing to submit form:", { formId, fieldValues });
      console.log("Available fields:", formFields.value);

      const mutation = `
        mutation SubmitForm($formId: ID!, $fieldValues: [FormFieldValuesInput!]!) {
          submitGfForm(input: {
            id: $formId,
            fieldValues: $fieldValues
          }) {
            entry {
              id
            }
            errors {
              id
              message
            }
            confirmation {
              message
              type
            }
          }
        }
      `;

      // Transform the values based on field type
      const transformedValues = Object.entries(fieldValues)
        .map(([id, value]) => {
          const fieldId = parseInt(id, 10);
          const field = formFields.value.find((f) => f.databaseId === fieldId);

          if (!field) {
            console.warn(`Field not found for id: ${fieldId}`);
            return null;
          }

          console.log(`Processing field ${fieldId}:`, {
            type: field.type,
            value,
          });

          switch (field.type) {
            case "NAME":
              return {
                id: fieldId,
                nameValues: {
                  prefix: value.prefix || "",
                  first: value.first || "",
                  middle: value.middle || "",
                  last: value.last || "",
                  suffix: value.suffix || "",
                },
              };

            case "ADDRESS":
              return {
                id: fieldId,
                addressValues: {
                  street: value.street || "",
                  lineTwo: value.lineTwo || "",
                  city: value.city || "",
                  state: value.state || "",
                  zip: value.zip || "",
                  country: value.country || "US",
                },
              };

            case "EMAIL":
              return {
                id: fieldId,
                emailValues: {
                  value: value || "",
                  confirmationValue: value || "", // Use same value for confirmation if not provided
                },
              };

            case "CHECKBOX":
              return {
                id: fieldId,
                checkboxValues: Array.isArray(value)
                  ? value.map((v) => ({
                      inputId: fieldId,
                      value: v.toString(),
                    }))
                  : [],
              };

            case "MULTISELECT":
              return {
                id: fieldId,
                values: Array.isArray(value)
                  ? value.map((v) => v.toString())
                  : [],
              };

            case "SELECT":
              return {
                id: fieldId,
                value: value?.toString() || "",
              };

            case "RADIO":
              return {
                id: fieldId,
                value: value?.toString() || "",
              };

            case "TEXT":
            case "TEXTAREA":
            case "PHONE":
            case "WEBSITE":
            case "DATE":
              return {
                id: fieldId,
                value: value?.toString() || "",
              };

            default:
              console.warn(
                `Unknown field type: ${field.type} for field ${fieldId}`
              );
              return {
                id: fieldId,
                value: value?.toString() || "",
              };
          }
        })
        .filter(Boolean);

      console.log(
        "Transformed values:",
        JSON.stringify(transformedValues, null, 2)
      );

      try {
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Response received:", result);

        if (result.errors) {
          throw new Error(result.errors.map((e) => e.message).join(", "));
        }

        return result.data.submitGfForm;
      } catch (fetchError) {
        console.error("Fetch error details:", {
          message: fetchError.message,
          status: fetchError.status,
          statusText: fetchError.statusText,
          response: fetchError.response,
          endpoint: config.public.wordpressUrl,
        });
        throw fetchError;
      }
    } catch (error) {
      console.error("Submit form error:", error);
      throw error;
    }
  };

  const updateFormValue = (fieldId, value) => {
    formValues.value[fieldId] = value;
  };

  return {
    formData,
    formValues,
    formFields,
    isLoading,
    error,
    fetchForm,
    submitForm,
    updateFormValue,
    initializeFormValues,
  };
}
*/
