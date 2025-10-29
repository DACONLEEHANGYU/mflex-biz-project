import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWebSocketStore = defineStore('websocket', () => {
  const isConnected = ref(false);
  const progress = ref(0);
  const currentStep = ref('');
  const error = ref(null);

  const steps = [
    { id: 1, label: '쿼리 분석 중' },
    { id: 2, label: 'SQL 구조 생성' },
    { id: 3, label: '최적화 및 검증' },
  ];

  function resetProgress() {
    progress.value = 0;
    currentStep.value = '';
    error.value = null;
  }

  return {
    isConnected,
    progress,
    currentStep,
    error,
    steps,
    resetProgress,
  };
});
