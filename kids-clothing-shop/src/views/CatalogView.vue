<template>
  <div class="catalog-page">
    <AppHeader />

    <div class="container">
      <h1 class="page-title">Каталог</h1>

      <!-- Фильтр по полу -->
      <div class="filter-gender section-block">
        <button
          @click="applyGenderFilter(null)"
          :class="['filter-button', selectedGender === null ? 'active' : '']"
        >
          Все
        </button>
        <button
          @click="applyGenderFilter('B')"
          :class="['filter-button', selectedGender === 'B' ? 'active' : '']"
        >
          Мальчики
        </button>
        <button
          @click="applyGenderFilter('G')"
          :class="['filter-button', selectedGender === 'G' ? 'active' : '']"
        >
          Девочки
        </button>
      </div>

      <!-- CategoriesBar (может быть свернут/развернут) -->
      <div class="section-block">
        <CategoriesBar
          v-model="selectedCategoryId"
          @select-category="onCategorySelected"
        />
      </div>

      <!-- Сетка товаров -->
      <div class="section-block">
        <div v-if="loading" class="loading-container">
          <span>Загрузка товаров...</span>
        </div>

        <div v-else class="products-grid">
          <template v-if="Array.isArray(products) && products.length">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </template>

          <div
            v-if="!loading && Array.isArray(products) && products.length === 0"
            class="empty-message"
          >
            Нет товаров, соответствующих выбранным фильтрам.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import AppHeader from '@/components/AppHeader.vue';
import ProductCard from '@/components/ProductCart.vue';
import CategoriesBar from '@/components/CategoriesBar.vue';

const products = ref([]);
const selectedGender = ref(null);
const selectedCategoryId = ref(null);
const loading = ref(false);

const fetchProducts = async () => {
  loading.value = true;
  try {
    let response;
    const params = {};

    // Если выбрана какая-то категория, передаем её в параметры
    if (selectedCategoryId.value !== null) {
      params.categories = selectedCategoryId.value;
    }

    // Выбор эндпоинта в зависимости от гендера
    if (selectedGender.value === 'B') {
      response = await api.getBoysProducts(params);
    } else if (selectedGender.value === 'G') {
      response = await api.getGirlsProducts(params);
    } else {
      response = await api.getProducts(params);
    }

    const data = response.data;
    products.value = Array.isArray(data.results) 
      ? data.results 
      : Array.isArray(data) 
        ? data 
        : [];
  } catch (err) {
    console.error(err);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * Нажатие на «Все» должно:
 * 1) Сбросить гендер (selectedGender = null) – мы уже передали null как аргумент сюда.
 * 2) Сбросить категорию (selectedCategoryId = null) – чтобы «Открыть всё» в CategoriesBar сработало так же.
 * 3) Перезапросить товары.
 */
const applyGenderFilter = (gender) => {
  // Если кликнули по той же кнопке — снимаем фильтр
  selectedGender.value = (selectedGender.value === gender ? null : gender);

  // Если выбрали «Все» (т.е. gender = null), тоже сбросим категорию
  if (selectedGender.value === null) {
    selectedCategoryId.value = null;
  }

  fetchProducts();
};

const onCategorySelected = (catId) => {
  selectedCategoryId.value = catId;
  fetchProducts();
};

onMounted(fetchProducts);
</script>

<style scoped>
.catalog-page {
  /* Отступ сверху, чтобы контент не закрывался AppHeader */
  padding-top: 88px; 
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 16px;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #222;
}

.section-block {
  margin-bottom: 1.5rem;
}

.filter-gender {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.filter-button:hover {
  background-color: #e0e0e0;
}

.filter-button.active {
  background-color: #000;
  color: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.empty-message {
  text-align: center;
  color: #666;
  margin-top: 2rem;
  font-size: 1rem;
}

.loading-container {
  text-align: center;
  color: #666;
  font-size: 1rem;
}
</style>
