<!-- AnimatedPopup.vue -->
<template>
  <div class="p-8">
    <div class="space-y-4">
      <!-- 메인 입력창 -->
      <input
        ref="mainInputRef"
        v-model="popupValue"
        readonly
        class="w-64 px-3 py-2 border rounded-md"
        placeholder="입력된 값이 여기에 표시됩니다"
      />

      <!-- 팝업 열기 버튼 -->
      <button
        @click="openModal"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        팝업 열기
      </button>
    </div>

    <!-- 모달 -->
    <div to="body">
      <div class="fixed inset-0 z-40 bg-black bg-opacity-25">
        <div
          class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-white rounded-lg p-6 shadow-xl"
          role="dialog"
        >
          <div class="mb-4">
            <h2 class="text-lg font-semibold">텍스트를 입력하세요</h2>
          </div>

          <input
            ref="popupInputRef"
            v-model="inputValue"
            class="w-full px-3 py-2 border rounded-md mb-4"
            placeholder="여기에 입력하세요..."
          />

          <div class="flex justify-end space-x-2">
            <button
              @click="closeModal"
              class="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              취소
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 애니메이션 텍스트 -->
    <Teleport to="body">
      <div
        class="fixed pointer-events-none text-xl font-bold z-[9999]"
        :style="animationStyle"
      >
        <span
          class="inline-block px-4 py-2 rounded-lg bg-blue-500 text-white shadow-lg"
          :style="textEffectStyle"
        >
          {{ inputValue }}
        </span>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  // 상태 관리
  const isOpen = ref(false);
  const inputValue = ref('');
  const popupValue = ref('');
  const isAnimating = ref(false);
  const animationPosition = ref({ startX: 0, startY: 0, endX: 0, endY: 0 });

  // refs
  const popupInputRef = ref(null);
  const mainInputRef = ref(null);

  // 계산된 스타일
  const animationStyle = computed(() => ({
    left: `${animationPosition.value.startX}px`,
    top: `${animationPosition.value.startY}px`,
    animation:
      'moveToInput 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
  }));

  const textEffectStyle = computed(() => ({
    animation: 'textEffect 1.5s ease-in-out forwards',
  }));

  // 메서드
  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
    inputValue.value = '';
  };

  const handleConfirm = () => {
    if (popupInputRef.value && mainInputRef.value) {
      const popupRect = popupInputRef.value.getBoundingClientRect();
      const inputRect = mainInputRef.value.getBoundingClientRect();

      animationPosition.value = {
        startX: popupRect.left,
        startY: popupRect.top,
        endX: inputRect.left,
        endY: inputRect.top,
      };

      popupValue.value = inputValue.value;
      isAnimating.value = true;

      setTimeout(() => {
        isAnimating.value = false;
        isOpen.value = false;
        inputValue.value = '';
      }, 1500);
    }
  };
</script>

<style scoped>
  @keyframes moveToInput {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(
          calc(
            v-bind('(animationPosition.endX - animationPosition.startX) / 2') px
          ),
          calc(
            v-bind(
                '(animationPosition.endY - animationPosition.startY) / 2 - 80'
              )
              px
          )
        )
        scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(
          calc(v-bind('animationPosition.endX - animationPosition.startX') px),
          calc(v-bind('animationPosition.endY - animationPosition.startY') px)
        )
        scale(1);
      opacity: 0;
    }
  }

  @keyframes textEffect {
    0% {
      transform: scale(1) rotate(0deg);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.2) rotate(-5deg);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
    }
    100% {
      transform: scale(1) rotate(0deg);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
</style>
