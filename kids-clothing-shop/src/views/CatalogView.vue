<template>
  <div class="catalog-page container mx-auto py-6">
    <!-- Заголовок страницы -->
    <h1 class="text-2xl font-semibold mb-4">Каталог</h1>

    <!-- 1. Блок фильтров -->
    <div class="filters mb-6 flex flex-wrap gap-4">
      <!-- 1.1. Фильтр по полу -->
      <div class="filter-gender flex items-center gap-2">
        <button
          @click="applyGenderFilter(null)"
          :class="['px-3 py-1 rounded', selectedGender === null ? 'bg-black text-white' : 'bg-gray-200']"
        >
          Все
        </button>
        <button
          @click="applyGenderFilter('B')"
          :class="['px-3 py-1 rounded', selectedGender === 'B' ? 'bg-black text-white' : 'bg-gray-200']"
        >
          Мальчики
        </button>
        <button
          @click="applyGenderFilter('G')"
          :class="['px-3 py-1 rounded', selectedGender === 'G' ? 'bg-black text-white' : 'bg-gray-200']"
        >
          Девочки
        </button>
      </div>

      <!-- 1.2. Фильтр по категориям -->
      <div class="filter-categories">
        <label for="category-select" class="block text-sm font-medium mb-1">Категория:</label>
        <select
          id="category-select"
          v-model="selectedCategoryId"
          @change="applyCategoryFilter"
          class="border rounded px-2 py-1"
        >
          <!-- Всегда можем выбрать "все категории" -->
          <option :value="null">Все категории</option>
          <!-- Отрисовываем только если categories — массив -->
          <template v-if="Array.isArray(categories)">
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </template>
        </select>
      </div>
    </div>

    <!-- 2. Список товаров -->
    <div class="products-grid grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      <!-- Если products — это массив, то рисуем карточки -->
      <template v-if="Array.isArray(products)">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </template>
    </div>

    <!-- 3. Сообщение, если товаров нет -->
    <div v-if="!loading && Array.isArray(products) && products.length === 0" class="text-center mt-8 text-gray-500">
      Нет товаров, соответствующих выбранным фильтрам.
    </div>

    <!-- 4. Индикатор загрузки -->
    <div v-if="loading" class="text-center mt-8">
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';           // ваш файл api.js (с методами getProducts, getBoysProducts и т.д.)
import ProductCard from '@/components/ProductCart.vue';

// 1. Инициализируем реактивные переменные пустыми массивами / примитивами
const products = ref([]);
const categories = ref([]);
const selectedGender = ref(null);
const selectedCategoryId = ref(null);
const loading = ref(false);

// 2. Загружаем все категории (учитываем, что DRF возвращает { count, next, previous, results: [...] })
const fetchAllCategories = async () => {
  try {
    const response = await api.getCategories();
    // Если сервер вернул пагинированный список, data.results — это массив категорий
    const data = response.data;
    if (Array.isArray(data.results)) {
      categories.value = data.results;
    } else if (Array.isArray(data)) {
      // на случай, если пагинация отключена и просто возвращается чистый массив
      categories.value = data;
    } else {
      categories.value = [];
    }
  } catch (err) {
    console.error('Ошибка при получении категорий:', err);
    categories.value = []; // Чтобы никогда не получить null
  }
};

// 3. Загружаем товары с учётом фильтров
const fetchProducts = async () => {
  loading.value = true;

  try {
    let response;
    const params = {};
    if (selectedCategoryId.value !== null) {
      params.categories = selectedCategoryId.value;
    }

    if (selectedGender.value === 'B') {
      response = await api.getBoysProducts(params);
    } else if (selectedGender.value === 'G') {
      response = await api.getGirlsProducts(params);
    } else {
      response = await api.getProducts(params);
    }

    // DRF по умолчанию отдает { count, next, previous, results: [...] }
    const data = response.data;
    if (Array.isArray(data.results)) {
      products.value = data.results;
    } else if (Array.isArray(data)) {
      // если пагинация отключена и сразу вернулся массив
      products.value = data;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('Ошибка при получении продуктов:', err);
    products.value = []; // Чтобы никогда не получить null
  } finally {
    loading.value = false;
  }
};

// 4. Обработчики фильтров
const applyGenderFilter = (gender) => {
  selectedGender.value = (selectedGender.value === gender ? null : gender);
  fetchProducts();
};

const applyCategoryFilter = () => {
  // Этот метод сработает каждый раз, когда меняется selectedCategoryId,
  // но т. к. ниже есть watch(selectedCategoryId), дополнительный вызов fetchProducts() не нужен.
};

// 5. onMounted: сразу подтягиваем категории и товары
onMounted(async () => {
  await fetchAllCategories();
  await fetchProducts();
});

// 6. При изменении категории будем автоматически подгружать новый список
watch(selectedCategoryId, () => {
  fetchProducts();
});
</script>

<style scoped>
.catalog-page {
  padding-left: 1rem;
  padding-right: 1rem;
}

.filters {
  align-items: center;
}

.filter-gender button {
  cursor: pointer;
}

.filter-categories select {
  cursor: pointer;
}
</style>
