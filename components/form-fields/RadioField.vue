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

const handleChange = (value) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="field-wrapper">
    <label>{{ field.label }}</label>
    <div
      v-for="choice in field.choices"
      :key="choice.value"
      class="radio-option"
    >
      <input
        type="radio"
        :id="`${field.databaseId}-${choice.value}`"
        :name="field.databaseId"
        :value="choice.value"
        :checked="modelValue === choice.value"
        @change="handleChange(choice.value)"
        :required="field.isRequired"
      />
      <label :for="`${field.databaseId}-${choice.value}`">{{
        choice.text
      }}</label>
    </div>
  </div>
</template>

<style scoped>
.radio-option {
  margin: 0.5rem 0;
}

.radio-option input {
  margin-right: 0.5rem;
}
</style>
