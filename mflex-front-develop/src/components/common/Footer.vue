<template>
  <div class="footer">
    <transition name="fade" mode="out-in">
      <template v-if="currentView === 'dash'">
        <div class="footer-copyright">
          Copyright© 2024 (주)데이콘인피니티. All Rights Reserved.
        </div>
      </template>
      <!-- <template v-else-if="currentView === 'page'">
        <div class="footer-infos">
          <TransitionGroup name="fade">
            <div class="payment-info" v-if="statusView">
              <span class="info-title">결제현황</span>
              <span class="info-text"
                >승인 : <strong>10</strong>건 , 반려 : <strong>5</strong>건 ,
                대기 : <strong>100</strong>건</span
              >
            </div>
            <div class="notice-info" v-else>
              <span class="info-title">중요공지</span>
              <span class="info-text"
                >범정부표준 6차 개정이 완료되었습니다.
              </span>
            </div>
          </TransitionGroup>
        </div>
      </template> -->
    </transition>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { watch } from 'vue';
  import { useRoute } from 'vue-router';

  const currentView = ref('');
  const statusView = ref(true);

  const checkView = () => {
    currentView.value = route.meta.title === '대시보드' ? 'dash' : 'page';
    if (currentView.value === 'page') {
      startInterval();
    } else {
      stopInterval();
    }
  };

  let interval = null;
  const timer = 10000;
  const startInterval = () => {
    if (!interval) {
      interval = setInterval(() => {
        statusView.value = !statusView.value;
      }, timer);
    }
  };

  const stopInterval = () => {
    clearInterval(interval);
    interval = null;
    statusView.value = false;
  };

  onMounted(() => {
    checkView();
  });

  onUnmounted(() => {
    console.log('정지????');
    stopInterval();
  });

  const route = useRoute();
  watch(
    () => route,
    () => checkView(),
    { deep: true }
  );
</script>
