<template>
  <div class="progress-simulator">
    <div class="status-container">
      <div class="status-header">
        <h3>진행 상태</h3>
        <span>({{ status }})</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-indicator"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :class="{ active: progress > index * 33.33 }"
      >
        <component :is="step.icon" class="step-icon" />
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { Terminal, Waves, Sparkles } from 'lucide-vue-next';
  import { ref, onMounted } from 'vue';

  export default {
    name: 'ProgressSimulator',
    components: {
      Terminal,
      Waves,
      Sparkles,
    },
    setup() {
      const progress = ref(0);
      const status = ref('waiting');
      const steps = ref([
        { id: 1, label: '쿼리 분석 중', icon: 'Terminal' },
        { id: 2, label: 'SQL 구조 생성', icon: 'Waves' },
        { id: 3, label: '최적화 및 검증', icon: 'Sparkles' },
        { id: 4, label: '결과출력', icon: 'Terminal' },
      ]);

      onMounted(() => {
        const totalSteps = steps.value.length;
        let currentStep = 0;

        const progressInterval = setInterval(() => {
          if (currentStep < totalSteps) {
            progress.value = Math.min(progress.value + 25.0, 100);
            status.value = steps.value[currentStep].label;
            currentStep++;
          } else {
            clearInterval(progressInterval);
            status.value = '완료';
          }
        }, 1500);
      });

      return {
        progress,
        status,
        steps,
      };
    },
  };
</script>

<style scoped>
  .progress-simulator {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status-container {
    margin-bottom: 16px;
  }

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .status-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-right: 8px;
  }

  .status-header span {
    color: #6b7280;
  }

  .progress-bar {
    width: 100%;
    background: #e5e7eb;
    border-radius: 12px;
    height: 10px;
    overflow: hidden;
  }

  .progress-indicator {
    background: #4caf50;
    height: 10px;
    border-radius: 12px;
    transition: width 0.5s ease-in-out;
  }

  .steps-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .step-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    background: #f3f4f6;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .step-item.active {
    background: #e8f5e9;
    border: 1px solid #a5d6a7;
  }

  .step-icon {
    margin-right: 8px;
  }

  .step-label {
    font-size: 0.875rem;
  }
</style>
