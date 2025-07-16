<template>
  <div class="price-filter mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filter by Price</h3>
      <button
        v-if="priceRange.min > 0 || priceRange.max < maxPrice"
        @click="clearFilter"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        Reset Price
      </button>
    </div>

    <!-- Price Range Slider -->
    <div class="px-3">
      <!-- Price Display -->
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm font-medium text-gray-700">
          ${{ priceRange.min }}
        </span>
        <span class="text-sm text-gray-500">to</span>
        <span class="text-sm font-medium text-gray-700">
          ${{ priceRange.max }}
        </span>
      </div>

      <!-- Dual Range Slider -->
      <div class="relative">
        <!-- Track -->
        <div class="h-2 bg-gray-200 rounded-lg relative">
          <!-- Active Range -->
          <div
            class="absolute h-2 bg-blue-500 rounded-lg"
            :style="{
              left: (priceRange.min / maxPrice) * 100 + '%',
              width: ((priceRange.max - priceRange.min) / maxPrice) * 100 + '%',
            }"
          ></div>
        </div>

        <!-- Min Range Input -->
        <input
          v-model.number="priceRange.min"
          @input="handlePriceChange"
          type="range"
          :min="0"
          :max="maxPrice"
          :step="10"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
        />

        <!-- Max Range Input -->
        <input
          v-model.number="priceRange.max"
          @input="handlePriceChange"
          type="range"
          :min="0"
          :max="maxPrice"
          :step="10"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
        />
      </div>

      <!-- Price Range Presets -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button
          v-for="preset in pricePresets"
          :key="preset.label"
          @click="setPricePreset(preset.min, preset.max)"
          class="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          {{ preset.label }}
        </button>
      </div>

      <!-- Apply Price Filter Button -->
      <button
        v-if="priceRange.min > 0 || priceRange.max < maxPrice"
        @click="applyFilter"
        class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Price Filter (${{ priceRange.min }} - ${{ priceRange.max }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  initialMin: {
    type: Number,
    default: 0,
  },
  initialMax: {
    type: Number,
    default: 1000,
  },
  maxPrice: {
    type: Number,
    default: 1000,
  },
});

// Emits
const emit = defineEmits(["price-changed", "price-applied", "price-cleared"]);

// Reactive data
const maxPrice = ref(props.maxPrice);
const priceRange = ref({
  min: props.initialMin,
  max: props.initialMax,
});
const pricePresets = ref([
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "$500+", min: 500, max: 1000 },
]);

// Debounce timer
let priceTimeout = null;

// Methods
const handlePriceChange = () => {
  // Ensure min doesn't exceed max
  if (priceRange.value.min > priceRange.value.max) {
    priceRange.value.min = priceRange.value.max;
  }

  // Emit immediate change for UI updates
  emit("price-changed", {
    min: priceRange.value.min,
    max: priceRange.value.max,
  });

  // Debounce auto-apply
  clearTimeout(priceTimeout);
  priceTimeout = setTimeout(() => {
    if (priceRange.value.min > 0 || priceRange.value.max < maxPrice.value) {
      emit("price-applied", {
        min: priceRange.value.min,
        max: priceRange.value.max,
      });
    }
  }, 1000);
};

const setPricePreset = (min, max) => {
  priceRange.value.min = min;
  priceRange.value.max = max;
  emit("price-applied", {
    min: priceRange.value.min,
    max: priceRange.value.max,
  });
};

const clearFilter = () => {
  priceRange.value.min = 0;
  priceRange.value.max = maxPrice.value;
  emit("price-cleared");
};

const applyFilter = () => {
  emit("price-applied", {
    min: priceRange.value.min,
    max: priceRange.value.max,
  });
};

// Expose methods for parent component
defineExpose({
  clearPrice: () => {
    priceRange.value.min = 0;
    priceRange.value.max = maxPrice.value;
  },
  setPrice: (min, max) => {
    priceRange.value.min = min;
    priceRange.value.max = max;
  },
});
</script>

<style scoped>
/* Range Slider Styling */
.slider-thumb {
  pointer-events: none;
}

.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: all;
  position: relative;
  z-index: 1;
}

.slider-thumb::-moz-range-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: all;
  position: relative;
  z-index: 1;
}

.slider-thumb::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.slider-thumb::-moz-range-thumb:hover {
  background: #2563eb;
}

.slider-thumb::-webkit-slider-thumb:active {
  background: #1d4ed8;
}

.slider-thumb::-moz-range-thumb:active {
  background: #1d4ed8;
}
</style>
