<template>
  <div class="step-row step-vertical">
    <div class="step-view">
      <div
        class="step-item"
        v-for="(step, index) in currentStepData"
        :key="index"
        :class="{ active: step.checked, current: step.current }"
        @click="currentStepClick(index)"
      >
        <div class="step-box">
          <div class="step-circle"><i class="icon-circle"></i></div>
          <div class="step-text">{{ step.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import {
    saveStepStateStorage,
    getStepStateStorage,
    saveActualizingStepStateStorage,
  } from '@/utils/cookies';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
    state: {
      type: String,
      default: '',
    },
  });

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState, setActualizingState } =
    tabNaviStore;
  const { dictionaryMngState, actualizingState } = storeToRefs(tabNaviStore);

  console.log('dictionaryMngState.value : ', dictionaryMngState.value);

  const stepState = ref(getStepStateStorage());

  // 계산된 속성 추가
  const currentStepData = computed(() => {
    return props.state === 'dictionaryMng'
      ? stepData.value
      : actualizingStepData.value;
  });

  const stepData = ref([
    { title: '용어등록', checked: true, current: true },
    { title: '단어등록', checked: false, current: false },
    { title: '도메인등록', checked: false, current: false },
    { title: '코드등록', checked: false, current: false },
  ]);

  const actualizingStepData = ref([
    { title: '테이블정제', checked: true, current: true },
    { title: '컬럼정제', checked: false, current: false },
    { title: '용어표준화', checked: false, current: false },
    { title: '단어표준화', checked: false, current: false },
    { title: '도메인표준화', checked: false, current: false },
  ]);

  // const steps = ref([
  //   { label: '용어등록', active: true, completed: false },
  //   { label: '단어등록', active: false, completed: false },
  //   { label: '도메인등록', active: false, completed: false },
  //   { label: '코드등록', active: false, completed: false },
  // ]);

  const emit = defineEmits(['prevStep', 'nextStep']);

  const onPrevStep = () => {
    emit('prevStep');
  };

  const onNextStep = () => {
    emit('nextStep');
  };

  // 상태값에 따른 함수 변경
  const currentStepClick = computed(() => {
    return (index) => {
      // 공통 로직
      console.log(`Clicked step ${index}`);

      // 상태별 로직 실행
      if (props.state === 'dictionaryMng') {
        onStepClick(index);
      } else {
        handleActualizingClick(index);
      }

      // 추가 공통 로직
      saveStepStateStorage(/* ... */);
    };
  });

  const handleActualizingClick = (index) => {
    if (index === 0) {
      router.replace('/actualizing/table/list');
      setTabNaviData({
        title: '테이블정제',
        path: '/actualizing/table/list',
      });
      setActualizingState('table');
      saveActualizingStepStateStorage('table');
    } else if (index === 1) {
      router.replace('/actualizing/column/list');
      setTabNaviData({
        title: '컬럼정제',
        path: '/actualizing/column/list',
      });
      setActualizingState('column');
      saveActualizingStepStateStorage('column');
    } else if (index === 2) {
      router.replace('/actualizing/term/list');
      setTabNaviData({
        title: '용어사전표준화',
        path: '/actualizing/term/list',
      });
      setActualizingState('term');
      saveActualizingStepStateStorage('term');
    } else if (index === 3) {
      router.replace('/actualizing/word/list');
      setTabNaviData({
        title: '단어사전표준화',
        path: '/actualizing/word/list',
      });
      setActualizingState('word');
      saveActualizingStepStateStorage('word');
    } else if (index === 4) {
      router.replace('/actualizing/domain/list');
      setTabNaviData({
        title: '도메인사전표준화',
        path: '/actualizing/domain/list',
      });
      setActualizingState('domain');
      saveActualizingStepStateStorage('domain');
    }
  };

  const onStepClick = (index) => {
    // if (index <= getCurrentCompletedStep()) {
    // updateSteps(index);
    // emit('changeMng', index);

    if (index === 0) {
      router.replace('/dictionaryMng/term/list');
      setTabNaviData({
        title: '용어등록',
        path: '/dictionaryMng/term/list',
      });
      setDictionaryMngState('term');
      saveStepStateStorage('term');
    } else if (index === 1) {
      router.replace('/dictionaryMng/word/list');
      setTabNaviData({
        title: '단어등록',
        path: '/dictionaryMng/word/list',
      });
      setDictionaryMngState('word');
      saveStepStateStorage('word');
    } else if (index === 2) {
      router.replace('/dictionaryMng/domain/list');
      setTabNaviData({
        title: '도메인등록',
        path: '/dictionaryMng/domain/list',
      });
      setDictionaryMngState('domain');
      saveStepStateStorage('domain');
    } else if (index === 3) {
      router.replace('/dictionaryMng/code/list');
      setTabNaviData({
        title: '코드등록',
        path: '/dictionaryMng/code/list',
      });
      setDictionaryMngState('code');
      saveStepStateStorage('code');
    }
    // }
  };

  const updateSteps = (selectedIndex) => {
    stepData.value.forEach((step, index) => {
      if (index < selectedIndex) {
        step.active = false;
        step.completed = true;
      } else if (index === selectedIndex) {
        step.active = true;
        step.completed = false;
      } else {
        step.active = false;
        step.completed = false;
      }
    });
  };

  watch(
    () => dictionaryMngState.value,
    (value) => {
      console.log('dictionaryMngState watch', value);

      const stateMap = {
        term: [true, false, false, false],
        word: [true, true, false, false],
        domain: [true, true, true, false],
        code: [true, true, true, true],
      };

      const checkedStates = stateMap[value] || [false, false, false, false];

      stepData.value = stepData.value.map((step, index) => ({
        ...step,
        checked: checkedStates[index],
        current: checkedStates[index],
      }));
    },
    { immediate: true }
  );

  watch(
    () => actualizingState.value,
    (value) => {
      console.log('actualizingState watch', value);

      const stateMap = {
        table: [true, false, false, false, false],
        column: [true, true, false, false, false],
        term: [true, true, true, false, false],
        word: [true, true, true, true, false],
        domain: [true, true, true, true, true],
      };

      const checkedStates = stateMap[value] || [
        false,
        false,
        false,
        false,
        false,
      ];

      actualizingStepData.value = actualizingStepData.value.map(
        (step, index) => ({
          ...step,
          checked: checkedStates[index],
          current: checkedStates[index],
        })
      );
    },
    { immediate: true }
  );
</script>

<style scoped>
  .step-row {
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    padding-bottom: 10px;
    align-items: center;
  }

  .step-view {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 35px; /* 간격 조정 */

    .step-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .step-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        background-color: #d3d3d3;
        border-radius: 50%;
        font-size: 13px;
        font-weight: 600;
        position: relative;
        color: #666666;
        cursor: pointer;

        &::after {
          content: '';
          display: block;
          width: 3px;
          height: 40px;
          background-color: #d3d3d3;
          margin-top: 8px;
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
        }

        .icon-check {
          display: none;
        }

        &:hover {
          background-color: #4caf50;
          .step-text {
            color: white;
          }
        }
      }

      .step-text {
        font-size: 13px;
        color: #b1b1b1;
        margin-top: 5px;
      }
    }

    &:last-child {
      .step-box {
        .step-circle {
          &::after {
            content: none; /* 마지막 스텝에서 라인 제거 */
          }
        }
      }
    }

    &.active {
      .step-box {
        .step-circle {
          background-color: #2bbe7a;
          color: #fff;
          &::after {
            background-color: #2bbe7a;
            margin-top: 8px;
          }
          .num {
            display: none;
          }
          .icon-check {
            display: block;
            width: 100%;
            height: 100%;
            background: url(../images/icon_step_check.svg) no-repeat 50%;
          }
        }
        .step-text {
          color: white;
        }
      }
    }

    &.current {
      .icon-circle {
        display: inline-block;
        width: 17px;
        height: 17px;
        background-color: #fff;
        border-radius: 50%;
      }
      .step-text {
        color: white !important;
      }
    }
  }
</style>
