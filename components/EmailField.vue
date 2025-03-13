<template>
  <div class="field-wrapper">
    <label :for="field.databaseId">{{ field.label }}</label>
    <input
      :id="field.databaseId"
      type="email"
      :value="modelValue"
      @input="handleInput"
      :placeholder="field.placeholder || ''"
      :required="field.isRequired"
    />
  </div>
</template>

<script setup>
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

const handleInput = (e) => {
  emit("update:modelValue", e.target.value);
};
</script>
