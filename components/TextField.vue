<template>
  <div class="field-wrapper">
    <label :for="field.databaseId">{{ field.label }}</label>
    <input
      :id="field.databaseId"
      type="text"
      :value="modelValue"
      @input="handleInput"
      :placeholder="field.placeholder || ''"
      :required="field.isRequired"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

// Debounced input handler
let timeout;
const handleInput = (e) => {
  const value = e.target.value;
  if (timeout) clearTimeout(timeout);

  // Emit immediately for local state
  emit("update:modelValue", value);
};
</script>
