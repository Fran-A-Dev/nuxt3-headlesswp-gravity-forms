<script setup>
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

const handleChange = (event) => {
  const selectedOptions = Array.from(event.target.selectedOptions).map(
    (option) => option.value
  );
  emit("update:modelValue", selectedOptions);
};
</script>

<template>
  <div class="field-wrapper">
    <label
      :for="field.databaseId"
      class="block text-sm font-medium text-gray-700"
    >
      {{ field.label }}
      <span v-if="field.isRequired" class="text-red-500">*</span>
    </label>
    <select
      :id="field.databaseId"
      multiple
      :required="field.isRequired"
      :value="modelValue"
      @change="handleChange"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      size="4"
    >
      <option
        v-for="choice in field.choices"
        :key="choice.value"
        :value="choice.value"
      >
        {{ choice.text }}
      </option>
    </select>
    <small class="text-gray-500 mt-1 block"
      >Hold Ctrl/Cmd to select multiple options</small
    >
  </div>
</template>
