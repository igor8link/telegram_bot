<script setup>
import { useCartStore } from '@/stores/cart';
const cartStore = useCartStore();
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Корзина</h2>
    <div v-if="cartStore.items.length === 0">
      Ваша корзина пуста.
    </div>
    <div v-else>
      <ul class="space-y-4">
        <li
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex justify-between items-center border-b pb-2"
        >
          <div>
            <p class="font-semibold">{{ item.title }}</p>
            <p class="text-sm text-gray-500">Цена: {{ item.price }} x {{ item.quantity }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              :value="item.quantity"
              @input="cartStore.updateQuantity(item.id, parseInt($event.target.value))"
              class="w-16 text-center border rounded"
            />
            <button
              @click="cartStore.removeFromCart(item.id)"
              class="text-red-500 hover:underline"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
      <div class="mt-4 text-right">
        <p class="text-lg font-bold">Итого: {{ cartStore.totalPrice }}</p>
        <button
          @click="cartStore.clearCart"
          class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Очистить корзину
        </button>
      </div>
    </div>
  </div>
</template>
