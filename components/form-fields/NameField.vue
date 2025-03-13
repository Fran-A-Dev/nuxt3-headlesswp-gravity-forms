<script setup>
const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const updateNamePart = (inputId, value) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [inputId]: value,
  });
};
</script>

<template>
  <div class="field-wrapper">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ field.label }}
      <span v-if="field.isRequired" class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="input in field.inputs"
        :key="input.id"
        v-show="!input.isHidden"
        class="field-input"
      >
        <label
          :for="`${field.databaseId}-${input.id}`"
          class="block text-sm text-gray-600"
        >
          {{ input.label }}
        </label>
        <input
          :id="`${field.databaseId}-${input.id}`"
          type="text"
          :placeholder="input.placeholder"
          :value="modelValue[input.id]"
          @input="updateNamePart(input.id, $event.target.value)"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
</template>
