<template>
  <div class="product-detail" v-if="product">
    <div class="carousel-container">
      <div v-if="currentImages.length" class="carousel">
        <img :src="currentImages[currentImageIndex]?.image_url" :alt="product.title" />
        <div class="carousel-controls">
          <button @click="prevImage">‹</button>
          <button @click="nextImage">›</button>
        </div>
      </div>
    </div>

    <div class="details">
      <h1>{{ product.title }}</h1>
      <p class="price">
        <span v-if="product.sale_price" class="sale">{{ product.sale_price }} ₽</span>
        <span :class="{ old: product.sale_price }">{{ product.price }} ₽</span>
      </p>

      <div class="selector">
        <label>Цвет:</label>
        <select v-model.number="selectedColorId" @change="onColorChange">
          <option 
            v-for="variant in product.variants" 
            :key="variant.id" 
            :value="variant.color.id"
          >
            {{ variant.color.name }}
          </option>
        </select>
      </div>

      <div class="selector">
        <label>Размер:</label>
        <select v-model.number="selectedSizeId">
          <option 
            v-for="size in availableSizes" 
            :key="size.id" 
            :value="size.size.id"
          >
            {{ size.size.name }}
          </option>
        </select>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
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

const nextImage = () => {
  if (!currentImages.value.length) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % currentImages.value.length;
};

const prevImage = () => {
  if (!currentImages.value.length) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + currentImages.value.length) % currentImages.value.length;
};

const onColorChange = () => {
  const variant = product.value?.variants.find(v => v.color.id === selectedColorId.value);
  if (variant?.stocks.length) {
    selectedSizeId.value = variant.stocks[0].size.id;
  }
  currentImageIndex.value = 0;
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
    await api.addToCart({
      product_stock_id: stock.id,
      quantity: 1
    });
    alert('Товар добавлен в корзину');
  } catch (e) {
    alert('Ошибка при добавлении в корзину');
    console.error(e);
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
.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}
.carousel-container {
  flex: 1 1 45%;
  max-width: 500px;
}
.carousel {
  position: relative;
}
.carousel img {
  width: 100%;
  border-radius: 8px;
}
.carousel-controls {
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
}
.carousel-controls button {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 24px;
  cursor: pointer;
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
.selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
}
.selector label {
  font-weight: 500;
  color: #555;
}
.selector select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
