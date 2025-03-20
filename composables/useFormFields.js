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
