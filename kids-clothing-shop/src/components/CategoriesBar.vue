<template>
  <div class="categories-bar">
    <!-- 1) Кнопка-тоггл "показать/скрыть категории" -->
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

    <!-- 2) Обёртка для пил-кнопок категорий -->
    <transition name="fade-slide">
      <div
        v-show="isOpen"
        class="pills-container"
      >
        <!-- Кнопка "Открыть все" -->
        <button
          class="pill-button"
          :class="{ active: localSelectedId === null }"
          @click="selectCategory(null)"
          type="button"
        >
          Открыть все
        </button>

        <!-- Рендерим каждую категорию в виде «пилы» -->
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
import api from '@/services/api'; // Убедитесь, что путь к вашему api.js указан правильно

// 1. Определяем пропс modelValue (v-model)
const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null
  }
});

// 2. Объявляем события, которые будем эмитить
const emit = defineEmits(['update:modelValue', 'select-category']);

// 3. Локальный стейт для видимости списка категорий
const isOpen = ref(false);

// 4. Локальный стейт для хранимого выбранного ID категории
//    Он синхронизируется с props.modelValue через watch
const localSelectedId = ref(props.modelValue);

// 5. Подписываемся, чтобы при изменении родительского modelValue обновлять localSelectedId
watch(
  () => props.modelValue,
  (newVal) => {
    localSelectedId.value = newVal;
  },
  { immediate: true }
);

// 6. Функция переключения видимости (показать/скрыть)
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

// 7. При выборе категории (либо null) эмитим два события:
//    - update:modelValue (для синхронизации v-model с родителем)
//    - select-category (чтобы родитель своевременно вызвал fetchProducts)
const selectCategory = (catId) => {
  localSelectedId.value = catId;
  emit('update:modelValue', catId);
  emit('select-category', catId);

  // Если нужно, чтобы после клика меню закрывалось, раскомментируйте:
  // isOpen.value = false;
};

// 8. Реактивный массив для хранения всех категорий
const categories = ref([]);

// 9. Функция загрузки категорий из API
const fetchCategories = async () => {
  try {
    const response = await api.getCategories();

    // Если DRF отдаёт пагинированный объект { count, next, previous, results: [...] }
    if (response.data && Array.isArray(response.data.results)) {
      categories.value = response.data.results;
    }
    // Если пагинация отключена и вернулся сразу массив
    else if (Array.isArray(response.data)) {
      categories.value = response.data;
    }
    // В иных случаях оставляем пустой массив
    else {
      categories.value = [];
    }
  } catch (err) {
    console.error('Не удалось загрузить категории:', err);
    categories.value = [];
  }
};

// 10. Загружаем категории при монтировании
onMounted(fetchCategories);
</script>

<style scoped>
.categories-bar {
  margin-bottom: 1rem;
}

/* Стили для кнопки-тоггла */
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
  color: #e6007e; /* можно настроить под вашу тему */
}

.toggle-line {
  display: inline-block;
  width: 16px;
  height: 2px;
  background-color: #e6007e;
}

.toggle-text {
  text-transform: lowercase;
}

/* Контейнер для пил-кнопок */
.pills-container {
  margin-top: 0.5rem;
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
}

/* Анимация fade + slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Стили для каждой "пилы" */
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
  background-color: #e6007e; /* цвет для активной категории */
  color: #fff;
  border-color: #e6007e;
}
</style>
