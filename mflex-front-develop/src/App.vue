<template>
  <div class="wrap" :class="getSideState">
    <!-- <router-view></router-view> -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Alert />
    <!-- <Validation /> -->
  </div>
</template>

<script setup="setup">
  import Alert from '@/components/ui/AppAlert.vue';
  // import Validation from '@/components/ui/AppValidation.vue';
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const uiStore = useUiStore();
  const { getSideState } = storeToRefs(uiStore);

  const tabNaviStore = useTabNaviStore();
  // const { getTabData } = storeToRefs(tabNaviStore);
  const { setTabNaviData } = tabNaviStore;

  //TabNavi History Event 체크
  window.addEventListener('popstate', (event) => {
    console.log('======= popstate =========');
    const { current } = event.state || {};
    const currentPath = current && current.trim().split('/', 3).join('/');
    if (currentPath === '/login') return;
    setTabNaviData({ title: route.meta.title, path: currentPath });
  });
</script>

<style lang="scss"></style>
