import { defineAsyncComponent } from "vue";

// Cache to store component references keyed by field type.
const componentCache = {};

// Mapping from field type to component filename.
const typeToComponent = {
  ADDRESS: "AddressField",
  TEXT: "InputField",
  TEXTAREA: "InputField",
  EMAIL: "InputField",
  NAME: "NameField",
  PHONE: "PhoneField",
  SELECT: "DropdownField",
  MULTISELECT: "DropdownField",
  CHECKBOX: "ChoiceListField",
  RADIO: "ChoiceListField",
  DATE: "DateField",
  TIME: "TimeField",
  WEBSITE: "InputField",
};

export const useFormFields = () => {
  // For debugging purposes, you can track which types are processed.
  const loggedTypes = new Set();

  /**
   * Resolves the Vue component for a given field based on its inputType.
   * Uses a cache so that the same component reference is returned for a given type.
   * @param {Object} field - The Gravity Form field object.
   * @returns {Component|null} The async Vue component for this field.
   */
  const resolveFieldComponent = (field) => {
    const fieldType = field.inputType
      ? field.inputType.toUpperCase()
      : field.type.toUpperCase();

    if (!loggedTypes.has(fieldType)) {
      console.log("Mapping field type:", fieldType);
      loggedTypes.add(fieldType);
    }

    if (componentCache[fieldType]) {
      return componentCache[fieldType];
    }

    const componentName = typeToComponent[fieldType];
    if (componentName) {
      const asyncComponent = defineAsyncComponent(() =>
        import(`~/components/form-fields/${componentName}.vue`)
      );
      componentCache[fieldType] = asyncComponent;
      return asyncComponent;
    }

    return null;
  };

  return {
    resolveFieldComponent,
  };
};
