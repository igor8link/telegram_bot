<template>
  <div class="catalog-page">
    <AppHeader />

    <div class="container">
      <!-- Заголовок -->
      <h1 class="page-title">Каталог</h1>

      <!-- Фильтр по полу (перенесён выше CategoriesBar) -->
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

      <!-- Компонент выбора категорий -->
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

        <div
          v-else
          class="products-grid"
        >
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
    const params = {};
    if (selectedCategoryId.value !== null) {
      params.categories = selectedCategoryId.value;
    }
    // Если ваш бэк умеет «gender=B/G» в getProducts:
    if (selectedGender.value === 'B') {
      params.gender = 'B';
    } else if (selectedGender.value === 'G') {
      params.gender = 'G';
    }

    // Единый вызов:
    const response = await api.getProducts(params);
    const data = response.data;

    if (Array.isArray(data.results)) {
      products.value = data.results;
    } else if (Array.isArray(data)) {
      products.value = data;
    } else {
      products.value = [];
    }

    // Если бэкенд НЕ поддерживает параметр gender в getProducts,
    // тогда вместо этого используйте клиентскую фильтрацию:
    //
    // let list = Array.isArray(data.results) ? data.results : data;
    // if (selectedGender.value === 'B') {
    //   products.value = list.filter(item => item.gender === 'B');
    // } else if (selectedGender.value === 'G') {
    //   products.value = list.filter(item => item.gender === 'G');
    // } else {
    //   products.value = list;
    // }
  } catch (err) {
    console.error('Ошибка при получении товаров:', err);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const applyGenderFilter = (gender) => {
  // Если повторный клик по той же кнопке — сброс
  selectedGender.value = (selectedGender.value === gender ? null : gender);
  fetchProducts();
};

const onCategorySelected = (catId) => {
  // catId = null (все категории) или конкретный ID
  selectedCategoryId.value = catId;
  fetchProducts();
};

onMounted(fetchProducts);
</script>

<style scoped>
/* Обёртка всей страницы: нужен отступ, чтобы контент не подлезал под AppHeader */
.catalog-page {
  padding-top: 88px; /* высота шапки AppHeader */
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* Контейнер, аналогично другим страницам */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 16px;
}

/* Заголовок страницы */
.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #222;
}

/* Блок секции (отступ снизу) */
.section-block {
  margin-bottom: 1.5rem;
}

/* Фильтр по полу */
.filter-gender {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Кнопки фильтра */
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

/* Сетка товаров */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* Сообщение, когда товаров нет */
.empty-message {
  text-align: center;
  color: #666;
  margin-top: 2rem;
  font-size: 1rem;
}

/* Индикатор загрузки */
.loading-container {
  text-align: center;
  color: #666;
  font-size: 1rem;
}
</style>
