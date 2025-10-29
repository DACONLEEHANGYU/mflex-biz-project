<template>
  <div class="sub-router">
    <Header @change-set-info="handleChangeInfo" />
    <SideNavi />
    <router-view></router-view>
    <Spinner />
    <!-- <Footer /> -->
    <!-- <AppSlider /> -->
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  import Header from '@/components/header/Header.vue';
  import Footer from '@/components/common/Footer.vue';
  import SideNavi from '@/components/aside/SideNavi.vue';
  import Spinner from '@/components/ui/AppSpinner.vue';
  // import AppSlider from '@/components/ui/AppSlider.vue';

  // const handleChangeInfo = (info) => {
  //   console.log(info);
  // };

  // const headerKey = ref(0);

  // const resetHeader = () => {
  //   headerKey.value += 1; // 강제 재렌더링
  // };
  // resetHeader();
</script>
