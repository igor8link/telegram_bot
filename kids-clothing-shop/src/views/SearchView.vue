<template>
  <div class="search-page">
    <AppHeader />

    <div class="container">
      <h1>Результаты поиска</h1>

      <!-- Если нет запроса q в URL, предложим ввести что-нибудь -->
      <div v-if="!query || query.trim() === ''" class="no-query">
        <p>Введите текст для поиска.</p>
      </div>

      <!-- Если ищем, показываем loader -->
      <div v-else-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Ищем товары...</p>
      </div>

      <!-- Если произошла ошибка -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>

      <!-- Если получили результаты -->
      <div v-else>
        <!-- Если результатов нет -->
        <div v-if="products.length === 0" class="no-results">
          <p>По запросу «{{ query }}» ничего не найдено.</p>
        </div>

        <!-- Список карточек товаров -->
        <div v-else class="products-list">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-item"
          >
            <!-- Используем существующий компонент ProductCard. Здесь важно передавать нужные props -->
            <ProductCard 
              :product="product" 
              :showAddToCartButton="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import api from '@/services/api';
import ProductCard from '@/components/ProductCart.vue';

const route = useRoute();
const router = useRouter();

// Делаем реактивную переменную для текстовой строки поиска
const query = ref(route.query.q || '');

// Состояния компонента
const loading = ref(false);
const error = ref('');
const products = ref([]);

// При изменении query (пользователь переходит на другой /search?q=...), будем снова делать запрос
watch(
  () => route.query.q,
  (newQ) => {
    query.value = newQ || '';
    fetchResults();
  }
);

// Функция для запроса к API
async function fetchResults() {
  // Сбрасываем предыдущие состояния
  products.value = [];
  error.value = '';
  
  // Если строка совсем пустая, не шлём запрос
  if (!query.value || query.value.trim() === '') {
    return;
  }

  loading.value = true;
  try {
    // Бэкенд у нас настроен так, что GET /api/products/?search=… вернёт отфильтрованный список
    const response = await api.search(query.value.trim());
    
    // Предположим, что в ответе массив объектов (ProductListSerializer)
    products.value = response.data.results || response.data || [];
    // Если ваша пагинация настроена, берите response.data.results. Если без пагинации, response.data — это массив.
    // Пример: products.value = response.data.results;
  } catch (e) {
    console.error('Ошибка поиска:', e);
    if (e.response && e.response.data && typeof e.response.data.detail === 'string') {
      error.value = e.response.data.detail;
    } else {
      error.value = 'Не удалось выполнить поиск. Попробуйте позже.';
    }
  } finally {
    loading.value = false;
  }
}

// При первой загрузке компонента, если query уже есть, сразу сделаем запрос
onMounted(() => {
  if (query.value && query.value.trim() !== '') {
    fetchResults();
  }
});
</script>

<style scoped>
.search-page {
  padding-bottom: 40px;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  margin-bottom: 20px;
}

/* Стили для состояний */
.no-query,
.no-results,
.error-container {
  text-align: center;
  color: #555;
  margin-top: 40px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Сетка товаров */
.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
</style>
