<template>
  <div class="catalog-page container mx-auto py-6">
    <!-- Заголовок -->
    <h1 class="text-2xl font-semibold mb-4">Каталог</h1>

    <!-- Компонент выбора категорий -->
    <CategoriesBar
      v-model="selectedCategoryId"
      @select-category="onCategorySelected"
    />

    <!-- Фильтр по полу (если нужен) -->
    <div class="filter-gender mb-6 flex items-center gap-2">
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

    <!-- Сетка товаров -->
    <div class="products-grid grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      <template v-if="Array.isArray(products)">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </template>
    </div>

    <!-- Если нет товаров -->
    <div v-if="!loading && Array.isArray(products) && products.length === 0" class="text-center mt-8 text-gray-500">
      Нет товаров, соответствующих выбранным фильтрам.
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center mt-8">
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';           // ваш api.js
import ProductCard from '@/components/ProductCart.vue';
import CategoriesBar from '@/components/CategoriesBar.vue';

// 1. Состояние страницы
const products = ref([]);
const selectedGender = ref(null);
const selectedCategoryId = ref(null);
const loading = ref(false);

// 2. Загрузка товаров с фильтрами
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

    const data = response.data;
    if (Array.isArray(data.results)) {
      products.value = data.results;
    } else if (Array.isArray(data)) {
      products.value = data;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('Ошибка при получении товаров:', err);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// 3. Обработчик фильтра по полу
const applyGenderFilter = (gender) => {
  selectedGender.value = (selectedGender.value === gender ? null : gender);
  fetchProducts();
};

// 4. Обработчик события из CategoriesBar
const onCategorySelected = (catId) => {
  // catId может быть либо null (открыть все), либо число (конкретная категория)
  selectedCategoryId.value = catId;
  fetchProducts();
};

// 5. При монтировании подгружаем сразу товары для «Всех»
onMounted(fetchProducts);
</script>

<style scoped>
.catalog-page {
  padding-left: 1rem;
  padding-right: 1rem;
}

.filter-gender button {
  cursor: pointer;
}
</style>
