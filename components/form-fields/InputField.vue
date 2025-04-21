<template>
  <div class="field-wrapper">
    <label
      v-if="field.label"
      :for="field.databaseId"
      class="block text-sm font-medium text-gray-700"
    >
      {{ field.label }}
      <span v-if="field.isRequired" class="text-red-500">*</span>
    </label>
    <input
      :id="field.databaseId"
      :type="computedInputType"
      v-model="internalValue"
      :placeholder="field.placeholder || defaultPlaceholder"
      :required="field.isRequired"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

// Use a computed property for two-way binding.
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Determine the input type based on the field type (or optionally inputType if available)
const computedInputType = computed(() => {
  const type = (props.field.inputType || props.field.type || "").toUpperCase();
  if (type === "EMAIL") return "email";
  if (type === "WEBSITE") return "url";
  // Default to text input for TEXT or TEXTAREA, etc.
  return "text";
});

// Default placeholder text if none is provided.
const defaultPlaceholder = "Enter value...";
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
}
</style>
