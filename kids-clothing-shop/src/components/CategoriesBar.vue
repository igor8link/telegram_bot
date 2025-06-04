<template>
  <div class="categories-bar">
    <button
      class="toggle-button"
      @click="toggleOpen"
      type="button"
    >
      <span
        class="toggle-line"
        aria-hidden="true"
      ></span>
      <span class="toggle-text">
        {{ isOpen ? 'скрыть категории' : 'показать категории' }}
      </span>
    </button>

    <transition name="fade-slide">
      <div
        v-show="isOpen"
        class="pills-container"
      >
        <button
          class="pill-button"
          :class="{ active: localSelectedId === null }"
          @click="selectCategory(null)"
          type="button"
        >
          Открыть все
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          class="pill-button"
          :class="{ active: localSelectedId === cat.id }"
          @click="selectCategory(cat.id)"
          type="button"
        >
          {{ cat.name }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '@/services/api'; 

const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'select-category']);

const isOpen = ref(false);
const localSelectedId = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    localSelectedId.value = newVal;
  },
  { immediate: true }
);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const selectCategory = (catId) => {
  localSelectedId.value = catId;
  emit('update:modelValue', catId);
  emit('select-category', catId);

  isOpen.value = false;
};

const categories = ref([]);

const fetchCategories = async () => {
  try {
    const response = await api.getCategories();

    if (response.data && Array.isArray(response.data.results)) {
      categories.value = response.data.results;
    }
    else if (Array.isArray(response.data)) {
      categories.value = response.data;
    }
    else {
      categories.value = [];
    }
  } catch (err) {
    console.error('Не удалось загрузить категории:', err);
    categories.value = [];
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.categories-bar {
  margin-bottom: 1rem;
}

.toggle-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333; 
}

.toggle-line {
  display: inline-block;
  width: 16px;
  height: 2px;
  background-color: #333;
}

.toggle-text {
  text-transform: lowercase;
}

.pills-container {
  margin-top: 0.5rem;
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.pill-button {
  flex: 0 0 auto;
  white-space: nowrap;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 0.875rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.pill-button:hover {
  background-color: #ececec;
}

.pill-button.active {
  background-color: #333; 
  color: #fff;
  border-color: #333;
}
</style>
