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

const updateAddressPart = (inputId, value) => {
  emit("update:modelValue", {
    ...modelValue,
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
    <div class="space-y-4">
      <div
        v-for="input in field.inputs"
        :key="input.id"
        :class="{
          'col-span-2':
            input.customLabel === 'Street Address' ||
            input.customLabel === 'Address Line 2',
          'col-span-1':
            input.customLabel !== 'Street Address' &&
            input.customLabel !== 'Address Line 2',
        }"
      >
        <label
          :for="`${field.databaseId}-${input.id}`"
          class="block text-sm text-gray-600"
        >
          {{ input.customLabel || input.label }}
        </label>
        <input
          :id="`${field.databaseId}-${input.id}`"
          type="text"
          :placeholder="input.placeholder"
          :value="modelValue[input.id]"
          @input="updateAddressPart(input.id, $event.target.value)"
          :autocomplete="input.autocompleteAttribute"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
</template>
