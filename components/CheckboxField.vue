<template>
  <div class="field-wrapper">
    <label>{{ field.label }}</label>
    <div v-for="(choice, index) in field.choices" :key="index">
      <input
        type="checkbox"
        :id="`${field.databaseId}-${index}`"
        :checked="isChecked(choice.value)"
        @change="handleChange(choice.value)"
      />
      <label :for="`${field.databaseId}-${index}`">{{ choice.text }}</label>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const isChecked = (value) => props.modelValue.includes(value);

const handleChange = (value) => {
  const newValues = [...props.modelValue];
  const index = newValues.indexOf(value);

  if (index === -1) {
    newValues.push(value);
  } else {
    newValues.splice(index, 1);
  }

  emit("update:modelValue", newValues);
};
</script>
