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
</script>

<template>
  <div class="field-wrapper">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ field.label }}
      <span v-if="field.isRequired" class="text-red-500">*</span>
    </label>
    <div class="space-y-2">
      <div
        v-for="choice in field.choices"
        :key="choice.value"
        class="flex items-center"
      >
        <input
          type="radio"
          :id="`${field.databaseId}-${choice.value}`"
          :name="field.databaseId"
          :value="choice.value"
          :checked="modelValue === choice.value"
          @change="emit('update:modelValue', choice.value)"
          :required="field.isRequired"
          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <label
          :for="`${field.databaseId}-${choice.value}`"
          class="ml-2 block text-sm text-gray-700"
        >
          {{ choice.text }}
        </label>
      </div>
    </div>
  </div>
</template>
