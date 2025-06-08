<template>
  <AppHeader />
  <div class="product-detail with-header-offset" v-if="product">
    <div class="carousel-wrapper">
      <Carousel 
       :slides="detailSlides" 
       :autoplay="true" 
       :interval="5000" 
     />
    </div>

    <div class="details">
      <h1>{{ product.title }}</h1>
      <p class="price">
        <span v-if="product.sale_price" class="sale">{{ product.sale_price }} ₽</span>
        <span :class="{ old: product.sale_price }">{{ product.price }} ₽</span>
      </p>

      <div class="selector-buttons">
  <label>Цвет:</label>
  <div class="buttons-row">
    <button
      v-for="variant in product.variants"
      :key="variant.id"
      type="button"
      class="option-button"
      :class="{ active: variant.color.id === selectedColorId }"
      @click="selectColor(variant.color.id)"
    >
      {{ variant.color.name }}
    </button>
  </div>
</div>

<div class="selector-buttons">
  <label>Размер:</label>
  <div class="buttons-row">
    <button
      v-for="stock in availableSizes"
      :key="stock.id"
      type="button"
      class="option-button"
      :class="{ active: stock.size.id === selectedSizeId }"
      @click="selectSize(stock.size.id)"
    >
      {{ stock.size.name }}
    </button>
  </div>
</div>

      <button class="add-to-cart" @click="addToCart">Добавить в корзину</button>

       <div class="tabs">
        <button :class="{ active: tab === 'desc' }" @click="tab = 'desc'">О товаре</button>
        <button :class="{ active: tab === 'delivery' }" @click="tab = 'delivery'">Доставка</button>
      </div>
      <div class="tab-content">
        <p v-if="tab === 'desc'">
          <strong>О товаре:</strong> {{ product.composition }}<br />
          <strong>Описание:</strong> {{ product.description }}
        </p>
        <p v-else>Бесплатно курьерской службой по всей России (с 9:00 до 18:00 по местному времени)</p>
      </div>
    </div>
  </div>
  <section class="section">
        <div class="container">
          <ProductsGrid 
            title="ТОП ПРОДАЖ"
            :limit="8"
            view-all-link="/catalog"
            gender="null"
          />
        </div>
      </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import AppHeader from '@/components/AppHeader.vue';
import Carousel from '@/components/Carousel.vue';
import ProductsGrid from '@/components/ProductsGrid.vue';


const route = useRoute();
const router = useRouter();
const slug = ref(route.params.slug);

const product = ref(null);
const selectedColorId = ref(null);
const selectedSizeId = ref(null);
const currentImageIndex = ref(0);
const tab = ref('desc');

const currentVariant = computed(() => 
  product.value?.variants.find(v => v.color.id === selectedColorId.value)
);

const currentImages = computed(() => currentVariant.value?.images || []);
const availableSizes = computed(() => currentVariant.value?.stocks || []);

const detailSlides = computed(() => {
  return currentImages.value.map(img => ({
    id: img.id,
    image: img.image_url,
    alt: product.value.title
  }))
})

const selectColor = (colorId) => {
  if (selectedColorId.value === colorId) return;
  selectedColorId.value = colorId;
  const variant = product.value.variants.find(v => v.color.id === colorId);
  if (variant?.stocks.length) {
    selectedSizeId.value = variant.stocks[0].size.id;
  } else {
    selectedSizeId.value = null;
  }
};

const selectSize = (sizeId) => {
  selectedSizeId.value = sizeId;
};

const addToCart = async () => {
  if (!selectedColorId.value || !selectedSizeId.value) {
    alert('Выберите цвет и размер');
    return;
  }

  const variant = product.value?.variants.find(v => v.color.id === selectedColorId.value);
  const stock = variant?.stocks.find(s => s.size.id === selectedSizeId.value);
  if (!stock) {
    return alert('Выбранного размера нет в наличии');
  }

   try {
    const response = await api.addToCart({
      product_stock_id: stock.id,
      quantity: 1
    });

    console.log('addToCart успешен:', response);
    // сразу редиректим в корзину
    router.push('/cart');
  } catch (e) {
    console.error('Ошибка при добавлении товара:', e);
    if (e.response) {
      console.error('— status:', e.response.status);
      console.error('— data:', e.response.data);
    }
    alert('Для добавления товаров в корзину, вы должны зарегистрироваться');
  }
};

const loadProduct = async (newSlug) => {
  try {
    const res = await api.getProductBySlug(newSlug);
    product.value = res.data;

    const defaultVariant = product.value.variants[0];
    selectedColorId.value = defaultVariant?.color?.id || null;
    selectedSizeId.value = defaultVariant?.stocks[0]?.size?.id || null;
    currentImageIndex.value = 0;
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
  }
};

onMounted(() => {
  loadProduct(slug.value);
});

watch(
  () => route.params.slug,
  (newSlug) => {
    slug.value = newSlug;
    loadProduct(newSlug);
  }
);
</script>

<style scoped>
.with-header-offset {
  margin-top: 88px;
}
.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 20px 20px;
}
.carousel-wrapper {
  flex: 1 1 45%;
  max-width: 500px;
}
.details {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.details h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.price {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
.price .sale {
  color: red;
  margin-right: 10px;
  font-weight: 600;
}
.price .old {
  text-decoration: line-through;
  color: grey;
}
.selector-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1rem;
}

.selector-buttons label {
  font-weight: 500;
  color: #555;
}

.buttons-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section {
  margin: 3rem 0;
  padding: 2rem 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 2rem;
  text-align: center;
}

.option-button {
  min-width: 48px;
  height: 48px;
  padding: 0 12px;
  border: none;
  border-radius: 24px; 
  background-color: #f0f0f0; 
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}


.option-button:hover {
  background-color: #e0e0e0;
}


.option-button.active {
  background-color: #000; 
  color: #fff;            
}


.option-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2); 
}
.add-to-cart {
  padding: 10px 16px;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.add-to-cart:hover {
  background-color: #333;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.tabs button {
  padding: 6px 12px;
  border: none;
  background: lightgray;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}
.tabs button.active {
  background: black;
  color: white;
}
.tab-content {
  margin-top: 10px;
}
@media (min-width: 768px) {
  .product-detail {
    padding: 40px;
  }
  .details h1 {
    font-size: 2rem;
  }
  .price {
    font-size: 1.5rem;
  }
}
@media (max-width: 767px) {
  .product-detail {
    flex-direction: column;
    padding: 10px;
  }
  .carousel-container,
  .details {
    flex: 1 1 100%;
    max-width: 100%;
  }
  .details h1 {
    font-size: 1.5rem;
  }
  .price {
    font-size: 1.25rem;
  }
}
</style>
