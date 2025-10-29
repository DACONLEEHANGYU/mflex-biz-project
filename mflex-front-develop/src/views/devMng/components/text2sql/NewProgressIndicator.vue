<template>
  <div class="progress-container">
    <div class="stages-container">
      <!-- 각 진행 단계를 나타내는 공 -->
      <div
        v-for="(stage, index) in stages"
        :key="index"
        class="stage-ball"
        :class="{
          active: currentStage >= index,
          completed: currentStage > index,
          bounce: currentStage === index,
        }"
      >
        <div class="ball-content">
          <div class="stage-icon" :class="{ completed: currentStage > index }">
            {{ stage.icon }}
          </div>
          <span class="stage-name">{{ stage.name }}</span>
        </div>
        <!-- 연결선 (마지막 아이템 제외) -->
        <div
          v-if="index < stages.length - 1"
          class="connector"
          :class="{ active: currentStage > index }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const stages = ref([
    { name: '쿼리 정제', icon: '🔍' },
    { name: 'SQL 생성', icon: '⚙️' },
    { name: '검증', icon: '✔️' },
    { name: '결과 생성', icon: '📊' },
    { name: '완료', icon: '🎉' },
  ]);

  const currentStage = ref(0);

  // WebSocket 연결 및 상태 업데이트 (실제 구현시 필요)
  const updateProgress = (stage) => {
    currentStage.value = stage;
  };

  // 테스트용 프로그레스 시뮬레이션
  onMounted(() => {
    const simulateProgress = () => {
      let stage = 0;
      const interval = setInterval(() => {
        if (stage < stages.value.length) {
          updateProgress(stage);
          stage++;
        } else {
          clearInterval(interval);
        }
      }, 2000);
    };

    // 실제 구현시 제거
    simulateProgress();
  });
</script>

<style scoped>
  .progress-container {
    width: 100%;
    padding: 20px;
    margin: 20px 0;
  }

  .stages-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    max-width: 800px;
    margin: 0 auto;
  }

  .stage-ball {
    display: flex;
    align-items: center;
    position: relative;
    width: 100px;
  }

  .ball-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 2;
  }

  .stage-icon {
    width: 50px;
    height: 50px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    opacity: 0.5;
    transform: scale(0.8);
  }

  .stage-name {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
    transition: all 0.3s ease;
  }

  .connector {
    position: absolute;
    top: 25px;
    left: 75px;
    width: calc(100% - 50px);
    height: 4px;
    background: #f0f0f0;
    z-index: 1;
    transition: background-color 0.5s ease;
  }

  /* 활성화 상태 스타일 */
  .stage-ball.active .stage-icon {
    background: #4caf50;
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  }

  .stage-ball.active .stage-name {
    color: #4caf50;
    font-weight: bold;
  }

  .connector.active {
    background: #4caf50;
  }

  /* 완료 상태 스타일 */
  .stage-ball.completed .stage-icon {
    background: #2e7d32;
    opacity: 1;
  }

  /* 바운스 애니메이션 */
  .bounce {
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* 반응형 스타일 */
  @media (max-width: 768px) {
    .stages-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }

    .stage-ball {
      width: 100%;
    }

    .connector {
      left: 25px;
      top: 60px;
      width: 4px;
      height: calc(100% - 40px);
    }
  }
</style>
