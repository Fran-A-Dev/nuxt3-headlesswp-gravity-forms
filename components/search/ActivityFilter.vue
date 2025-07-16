<template>
  <div class="activity-filter mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filter by Activity</h3>
      <button
        v-if="selectedActivity"
        @click="clearFilter"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        Clear Filter
      </button>
    </div>

    <!-- Activity Filter Buttons -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="activity in activities"
        :key="activity.value"
        @click="selectActivity(activity.value)"
        :class="[
          'px-4 py-2 rounded-full border text-sm font-medium transition-colors',
          selectedActivity === activity.value
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
      >
        {{ activity.label }}
      </button>
    </div>

    <!-- Active Filter Display -->
    <div
      v-if="selectedActivity"
      class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-blue-800">
          <strong>Active Filter:</strong>
          {{ getActivityLabel(selectedActivity) }}
        </span>
        <button @click="clearFilter" class="text-blue-600 hover:text-blue-800">
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  initialActivity: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["activity-selected", "activity-cleared"]);

// Reactive data
const selectedActivity = ref(props.initialActivity);
const activities = ref([
  { value: "coding", label: "Coding" },
  { value: "running", label: "Running" },
  { value: "rock-climbing", label: "Rock Climbing" },
]);

// Methods
const selectActivity = (activityValue) => {
  selectedActivity.value = activityValue;
  emit("activity-selected", activityValue);
};

const clearFilter = () => {
  selectedActivity.value = "";
  emit("activity-cleared");
};

const getActivityLabel = (activityValue) => {
  const activity = activities.value.find((a) => a.value === activityValue);
  return activity ? activity.label : activityValue;
};

// Expose methods for parent component
defineExpose({
  clearActivity: () => {
    selectedActivity.value = "";
  },
  setActivity: (activity) => {
    selectedActivity.value = activity;
  },
});
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
