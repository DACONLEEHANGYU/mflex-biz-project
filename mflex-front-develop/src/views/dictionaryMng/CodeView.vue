<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <!-- <StepNext
          v-model="stepData"
          :disableNextBtn="true"
          @prevStep="onPrevStep"
        /> -->
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <div class="non-tab__comtent pt10">
                <DragRow
                  width="100%"
                  height="100%"
                  :topPercent="50"
                  :sliderWidth="10"
                >
                  <template #top>
                    <TopComp
                      @change-job-type="handleChageJobType"
                      @selected-codeName="handleSelectedCodeName"
                      @selected-codeValue="handleSelectedCodeValue"
                    />
                  </template>
                  <template #bottom>
                    <BottomComp @code-work-apply="handleGridRefresh" />
                  </template>
                </DragRow>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, provide, onActivated } from 'vue';
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dictionaryMng/components/code/top/TopComp.vue';
  import BottomComp from '@/views/dictionaryMng/components/code/bottom/BottomComp.vue';
  import StepNext from '@/components/common/StepNext.vue';

  import { saveStepStateStorage } from '@/utils/cookies';
  import { storeToRefs } from 'pinia';
  import { useSwipperStore } from '@/stores/swipper';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'CodeMngView' });

  const stepData = ref([
    { title: '용어등록', checked: true, current: false },
    { title: '단어등록', checked: true, current: false },
    { title: '도메인 관리', checked: true, current: false },
    { title: '코드 관리', checked: true, current: true },
  ]);

  const codeNameDetails = ref(null);
  const gridRefreshState = ref(false);
  const codeValueDetails = ref(null);

  // const handleRowClicked = (data) => {
  //   console.log('handleRowClicked : ', data);
  //   codeNameDetails.value = data;
  // };

  // 코드명 선택 핸들러
  provide('codeNameDetails', codeNameDetails);
  const handleSelectedCodeName = (data) => {
    console.log('handleSelectedCodeName : ', data);
    codeNameDetails.value = { ...data };
  };

  // 코드값 선택 핸들러
  provide('codeValueDetails', codeValueDetails);
  const handleSelectedCodeValue = (data) => {
    console.log('handleSelectedCodeValue : ', data);
    codeValueDetails.value = data;
  };

  // jobType
  const jobType = ref('group');

  // jobType 변경 핸들러
  provide('jobType', jobType);
  const handleChageJobType = (value) => {
    console.log('jobType value', value);
    jobType.value = value;
  };

  // 상단 그리드 재조회 핸들러
  provide('gridRefresh', gridRefreshState);
  const handleGridRefresh = () => {
    console.log('handleGridRefresh data');
    gridRefreshState.value = true;
  };

  const { swipper } = storeToRefs(useSwipperStore());

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;
  const onPrevStep = () => {
    router.replace('/dictionaryMng/domain/list');
    setTabNaviData({
      title: '도메인',
      path: '/dictionaryMng/domain/list',
    });
  };

  onActivated(() => {
    console.log('codeView onActivated');
    setDictionaryMngState('code');
    saveStepStateStorage('code');
  });
</script>
