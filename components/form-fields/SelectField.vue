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

const handleChange = (e) => {
  emit("update:modelValue", e.target.value);
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
      :value="modelValue"
      @change="handleChange"
      :required="field.isRequired"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">Select an option</option>
      <option
        v-for="choice in field.choices"
        :key="choice.value"
        :value="choice.value"
      >
        {{ choice.text }}
      </option>
    </select>
  </div>
</template>
