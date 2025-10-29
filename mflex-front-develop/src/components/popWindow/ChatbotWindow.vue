<template>
  <!-- 팝업 창 -->
  <div class="pop-window">
    <!-- 창 헤더 -->
    <div class="window-header">쿼리 생성기</div>

    <!-- 창 본문 -->
    <div class="window-body">
      <div class="window-content pt10">
        <div class="tab-content__row">
          <div class="input-container">
            <!-- 사용자 입력 필드 - 첫 번째 텍스트 영역 -->
            <div class="searChatbotWindowch-area">
              <div class="input-title">사용자 질의</div>
              <div class="textarea-wrapper">
                <div class="textarea-container">
                  <textarea
                    v-model="userQuery"
                    placeholder="질문을 입력하세요."
                    class="input-textarea"
                    :disabled="isLoading"
                    @keyup.enter="onRunQueries"
                  ></textarea>
                  <div class="textarea-actions">
                    <button
                      @click="onRunQueries"
                      class="submit-button"
                      :disabled="isLoading || !userQuery.trim()"
                    >
                      <span v-if="!isLoading">생성</span>
                      <span v-else class="spinner"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="result-area">
              <div class="input-title">질의 결과</div>
              <!-- WHERE 절 입력 필드 - 두 번째 텍스트 영역 -->
              <div class="result-container">
                <div class="textarea-wrapper">
                  <div class="input-title">쿼리</div>
                  <div class="textarea-container">
                    <div
                      v-if="isLoading"
                      class="skeleton-container"
                      style="height: 100px"
                    >
                      <div class="skeleton-animation"></div>
                    </div>
                    <textarea
                      v-else
                      ref="whereInputRef"
                      v-model="llmAnswer.where"
                      placeholder="쿼리가 생성됩니다."
                      class="input-textarea"
                      :class="{ 'fade-out': isAnimatingWhere }"
                    ></textarea>
                    <div
                      v-if="isAnimatingWhere"
                      class="floating-ball"
                      :class="{
                        'animate-start': animationPhase === 'start',
                        'animate-bounce': animationPhase === 'bounce',
                        'animate-shake': animationPhase === 'shake',
                        'animate-final': animationPhase === 'final',
                      }"
                      :style="floatingTextStyle"
                    >
                      <div class="ball-icon">Q</div>
                    </div>
                  </div>
                </div>

                <!-- SORT 절 입력 필드 - 세 번째 텍스트 영역 -->
                <div class="textarea-wrapper">
                  <div class="input-title">정렬</div>
                  <div class="textarea-container">
                    <div
                      v-if="isLoading"
                      class="skeleton-container"
                      style="height: 60px"
                    >
                      <div class="skeleton-animation"></div>
                    </div>
                    <textarea
                      v-else
                      v-model="llmAnswer.sort"
                      placeholder="정렬조건이 표시됩니다."
                      class="input-textarea"
                      style="min-height: 60px"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="textarea-actions">
              <button
                class="submit-button"
                @click="onBindingQuery"
                :disabled="!llmAnswer.where || isAnimatingWhere"
              >
                적용
              </button>
              <button
                class="close-button"
                style="margin-left: 5px"
                @click="onClose"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 창 바닥글 -->
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <!-- 필요한 경우 추가 버튼 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, nextTick, reactive, computed } from 'vue';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';

  // 컴포넌트 props 정의
  const props = defineProps({
    gridId: String,
    targetPosition: {
      type: Object,
      default: () => ({
        top: 148,
        left: 243,
        width: 1505,
        height: 30,
      }),
    },
  });

  // 대상 위치 가져오기 함수
  const getTargetPosition = () => {
    const positionTarget = document
      .querySelector('.target-search-area')
      .getBoundingClientRect();

    const position = {
      top: positionTarget.top,
      left: positionTarget.left,
      width: positionTarget.width,
      height: positionTarget.height,
    };

    return position;
  };

  // 대상 위치 로그 출력
  const positionTarget = document
    .querySelector('.target-search-area')
    .getBoundingClientRect();

  console.log('positionTarget:', positionTarget);

  // 이벤트 이미터 정의
  const emit = defineEmits(['bind-query', 'close', 'animation-complete']);

  // 반응형 상태 변수들
  const isLoading = ref(false);
  const isAnimatingWhere = ref(false);
  const animationPhase = ref(null);
  const whereInputRef = ref(null);
  const inputStartPosition = ref(null);

  // LLM 답변 상태 객체
  const llmAnswer = reactive({
    where: null,
    sort: null,
  });

  // 바운스 위치 계산 함수
  const calculateBouncePosition = (start, end) => {
    return {
      bounceTop: end.top + 180,
      finalLeft: end.left + end.width / 2 - 800,
      finalTop: end.top + end.height / 2 - 30,
    };
  };

  // 떠다니는 텍스트 스타일 계산 computed
  const floatingTextStyle = computed(() => {
    if (!inputStartPosition.value) return {};

    const inputRect = whereInputRef.value.getBoundingClientRect();

    const targetPosLeft = document
      .querySelector('.target-position')
      .getBoundingClientRect().left;

    const startPos = inputStartPosition.value;
    const endPos = getTargetPosition();
    const { bounceTop, finalLeft, finalTop } = calculateBouncePosition(
      startPos,
      endPos
    );

    const baseStyle = {
      position: 'fixed',
      left: `${startPos.left + startPos.width / 2 - 30}px`,
      top: `${startPos.top}px`,
      transform: 'translate(0, 0) scale(1)',
    };

    if (animationPhase.value === 'start') {
      return {
        ...baseStyle,
        transform: 'translate(0, -20px) scale(1.1)',
      };
    }

    if (animationPhase.value === 'bounce') {
      return {
        ...baseStyle,
        left: `${inputRect.left + 150}px`,
        top: `${bounceTop}px`,
        transform: 'scale(0.9)',
      };
    }

    if (animationPhase.value === 'shake') {
      return {
        ...baseStyle,
        left: `${inputRect.left + 150}px`,
        top: `${bounceTop}px`,
        transform: 'scale(0.9)',
      };
    }

    if (animationPhase.value === 'final') {
      return {
        ...baseStyle,
        left: `${targetPosLeft}px`,
        top: `${finalTop}px`,
        transform: 'scale(0.8)',
      };
    }

    return baseStyle;
  });

  // 애니메이션 시작 함수
  const startAnimation = async () => {
    const inputRect = whereInputRef.value.getBoundingClientRect();
    inputStartPosition.value = {
      left: inputRect.left,
      top: inputRect.top,
      width: inputRect.width,
      height: inputRect.height,
    };

    isAnimatingWhere.value = true;

    // 시작 애니메이션
    animationPhase.value = 'start';
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 튕김 애니메이션
    animationPhase.value = 'bounce';
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 흔들림 애니메이션
    animationPhase.value = 'shake';
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 최종 위치로 이동
    animationPhase.value = 'final';
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 애니메이션 완료
    emit('animation-complete', llmAnswer.where);
    isAnimatingWhere.value = false;
    animationPhase.value = null;
  };

  // 사용자 쿼리 ref
  const userQuery = ref('');

  // 쿼리 실행 함수
  const onRunQueries = () => {
    getPrompt();
  };

  // 쿼리 바인딩 함수
  const onBindingQuery = async () => {
    await startAnimation();
    emit('bind-query', llmAnswer);
  };

  // 확인 함수 (현재 주석 처리됨)
  const onClose = () => {
    emit('close');
  };

  // 테스트용 텍스트 프롬프트 함수
  const textPrompt = () => {
    const res = {
      data: {
        where: `용어유형 = '일반어'`,
        sort: '용어명 desc',
      },
    };

    return res;
  };

  // 프롬프트 가져오기 함수
  const getPrompt = async () => {
    isLoading.value = true;

    const searchInfo = {
      gridId: props.gridId,
      query: userQuery.value,
    };

    try {
      const res = await getCreateQuery(searchInfo);
      // const res = await textPrompt();
      console.log('res:', res);
      llmAnswer.where = res.data.where;
      llmAnswer.sort = res.data.sort;
    } catch (error) {
      console.error('쿼리 실행 중 오류:', error);
    } finally {
      isLoading.value = false;
    }
  };
</script>

<style scoped>
  .pop-window {
    width: 100%;
    max-width: 600px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 670px;
    position: relative;
  }

  .window-body {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }

  .window-content {
    height: 100%;
  }

  .window-footer {
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
  }

  .tab-content__row {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px 20px 0px 20px;
  }

  .textarea-container {
    position: relative;
  }

  .input-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    margin-left: 3px;
  }

  .input-textarea {
    width: 100%;
    min-height: 100px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.3s ease;
    color: black;
  }

  .result-container {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 15px;
  }

  .input-textarea:nth-of-type(3) {
    border-color: #ff0000;
  }

  .input-textarea:focus {
    border-color: #379583;
    outline: none;
    box-shadow: 0 0 0 2px rgba(55, 149, 131, 0.1);
  }

  .input-textarea:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .textarea-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .submit-button {
    padding: 8px 20px;
    background: #379583;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .submit-button:hover:not(:disabled) {
    background: #2a8272;
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .close-button {
    padding: 8px 20px;
    background: #cbd3c3;
    color: rgb(0, 0, 0);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .close-button:hover:not(:disabled) {
    background: #b8aeae;
    transform: translateY(-1px);
  }

  .floating-ball {
    position: fixed;
    background: #60b883;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1001;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    will-change: transform;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ball-icon {
    color: white;
    font-size: 32px;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
  }

  .floating-ball.animate-start {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .floating-ball.animate-bounce {
    transition: all 0.5s cubic-bezier(0.5, -0.3, 0.2, 1.4);
  }

  .floating-ball.animate-final {
    opacity: 0.5;
    transition: all 0.5s cubic-bezier(0.5, 1, 0.68, 1);
  }

  .skeleton-container {
    flex: 1;
    height: 42px;
    background: #f0f0f0;
    border-radius: 20px;
    overflow: hidden;
  }

  .skeleton-animation {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #bdeedb 25%, #94e0c6 50%, #6abca6 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .pop-window {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
    }

    .textarea-wrapper {
      margin-bottom: 15px;
    }
  }

  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .floating-ball.animate-shake {
    animation: shake 0.5s ease;
  }
</style>
