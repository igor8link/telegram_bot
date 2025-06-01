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
        <select v-model="selectedColorId" @change="onColorChange">
          <option v-for="variant in product.variants" :key="variant.id" :value="variant.color.id">
            {{ variant.color.name }}
          </option>
        </select>
      </div>

      <div class="selector">
        <label>Размер:</label>
        <select v-model="selectedSizeId">
          <option v-for="size in availableSizes" :key="size.id" :value="size.id">
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
          <strong>Состав:</strong> {{ product.composition }}<br />
          <strong>Описание:</strong> {{ product.description }}
        </p>
        <p v-else>Бесплатно курьерской службой по всей России (с 9:00 до 18:00 по местному времени)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const slug = route.params.slug;

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
  const stock = variant?.stocks.find(s => s.size.id === Number(selectedSizeId.value));
  if (!stock) return alert('Выбранного размера нет в наличии');

  try {
    await api.addToCart({
      product_stock: stock.id,
      quantity: 1
    });
    alert('Товар добавлен в корзину');
  } catch (e) {
    alert('Ошибка при добавлении в корзину');
    console.error(e);
  }
};

onMounted(async () => {
  try {
    const res = await api.getProductBySlug(slug);
    product.value = res.data;

    const defaultVariant = product.value.variants[0];
    selectedColorId.value = defaultVariant?.color?.id || null;
    selectedSizeId.value = defaultVariant?.stocks[0]?.size?.id || null;
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
  }
});
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
.price .sale {
  color: red;
  margin-right: 10px;
}
.price .old {
  text-decoration: line-through;
  color: grey;
}
.selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.add-to-cart {
  padding: 8px;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
}
.tabs button.active {
  background: black;
  color: white;
}
.tab-content {
  margin-top: 10px;
}
</style>
