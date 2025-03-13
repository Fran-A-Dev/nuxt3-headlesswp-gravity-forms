import { ref } from "vue";
import { defineAsyncComponent } from "vue";

export const useFormFields = () => {
  // Keep track of logged types
  const loggedTypes = new Set();

  const resolveFieldComponent = (type) => {
    const typeToComponent = {
      TEXT: "TextField",
      EMAIL: "EmailField",
      TEXTAREA: "TextAreaField",
      SELECT: "SelectField",
      RADIO: "RadioField",
      CHECKBOX: "CheckboxField",
      DATE: "DateField",
      TIME: "TimeField",
      PHONE: "PhoneField",
      NAME: "NameField",
      ADDRESS: "AddressField",
      WEBSITE: "WebsiteField",
      MULTISELECT: "MultiSelectField",
    };

    const componentName = typeToComponent[type];

    // Only log each type once
    if (!loggedTypes.has(type)) {
      console.log(
        "Resolving field type:",
        type,
        "to component:",
        componentName
      );
      loggedTypes.add(type);
    }

    return componentName
      ? defineAsyncComponent(() =>
          import(`~/components/form-fields/${componentName}.vue`)
        )
      : null;
  };

  return {
    resolveFieldComponent,
  };
};
