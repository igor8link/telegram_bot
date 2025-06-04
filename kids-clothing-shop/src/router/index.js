import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import HomeView from '@/views/HomeView.vue';
import { useCartStore } from '@/stores/cartStore';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Главная' }
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/AccountView.vue'),
    meta: { title: 'Личный кабинет', requiresAuth: true }
  },
  {
    path: '/categories/boys',
    name: 'boys-category',
    component: () => import('@/views/BoysView.vue'),
    meta: { title: 'Одежда для мальчиков' }
  },
  {
    path: '/categories/girls',
    name: 'girls-category',
    component: () => import('@/views/GirlsView.vue'),
    meta: { title: 'Одежда для девочек' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: 'Избранное' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Корзина' }
  },
  // {
  //   path: '/categories/:gender/:slug',
  //   name: 'category',
  //   component: () => import('@/views/CategoryDetailView.vue'),
  //   meta: { title: 'Категория' }
  // },
  // {
  //   path: '/products/new',
  //   name: 'new-products',
  //   component: () => import('@/views/NewProductsView.vue'),
  //   meta: { title: 'Новинки' }
  // },
  {
    path: '/products/:slug',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: 'Товар' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { title: 'Оформление заказа', requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const cartStore = useCartStore();
      // Если корзина пуста, перекидываем обратно в Cart
      if (cartStore.totalItems === 0) {
        next({ name: 'cart' });
      } else {
        next();
      }
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: 'Поиск' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true } 
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  // // Error pages
  // {
  //   path: '/404',
  //   name: 'not-found',
  //   component: () => import('@/views/NotFoundView.vue'),
  //   meta: { title: 'Страница не найдена' }
  // },
  // {
  //   path: '/:pathMatch(.*)*',
  //   redirect: '/404'
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Навигационная защита
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Kids Clothing Shop` : 'Kids Clothing Shop';
  
  // Check for protected routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      // Модальное окно, если user не аутентифицирован
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;