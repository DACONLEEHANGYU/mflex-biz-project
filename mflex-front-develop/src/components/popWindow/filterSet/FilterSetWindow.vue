<template>
  <div class="pop-window">
    <div class="window-header">그리드 컬럼 설정</div>
    <div class="window-body">
      <!-- <div class="window-title">
        <div class="title-text"></div>
      </div> -->
      <div class="window-content pt15">
        <!-- <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab> -->
        <div class="tab-comtent__row">
          <!-- <keep-alive>
            <component
              :is="currentTab"
              v-bind="componentProps"
              ref="currentTabComponent"
            />
          </keep-alive> -->
          <WindowTab1View
            v-bind="componentProps"
            ref="currentTabComponent"
          ></WindowTab1View>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">확인</button>
          <button class="btn-m close" @click="onClose">취소</button>
          <!-- <WindowTab1View @data-sent="handleDataSent" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    reactive,
    defineAsyncComponent,
    shallowRef,
    watch,
    defineProps,
  } from 'vue';

  const props = defineProps({
    columnFcDefs: Array,
    filterGridDefs: {
      type: Object,
      default: () => {},
    },
  });

  const WindowTab1View = defineAsyncComponent(() =>
    import('./WindowTab1View.vue')
  );
  const WindowTab2View = defineAsyncComponent(() =>
    import('./WindowTab2View.vue')
  );

  const tabList = reactive(['컬럼', '맞춤 설정']);
  const activeTab = ref(1);
  const currentTab = shallowRef(WindowTab1View);
  const currentTabComponent = ref(null); // 컴포넌트 참조를 위한 ref 추가

  const componentProps = ref({
    columnFcDefs: props.columnFcDefs,
    filterGridDefs: props.filterGridDefs,
  });

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = WindowTab1View;
    } else {
      currentTab.value = WindowTab2View;
    }
  });

  console.log('filter Data1 : ', props.columnFcDefs);
  console.log('filter Data2 : ', props.filterGridDefs);

  const emit = defineEmits(['confirm', 'close', 'filter-set-window-confirm']);

  const onConfirm = async () => {
    if (
      currentTabComponent.value &&
      'sendDataToBackend' in currentTabComponent.value
    ) {
      console.log('currentTabComponent.value : ', currentTabComponent.value);
      //const check = await currentTabComponent.value.sendDataToBackend(); // await 추가
      const check = currentTabComponent.value.sendDataToBackend();
      console.log('check : ', check);
      if (check) {
        emit('filter-set-window-confirm');
      } else {
        alert('작업 실패');
      }
    }
    if (
      currentTabComponent.value &&
      'sendFlterDataToBackend' in currentTabComponent.value
    ) {
      const check = await currentTabComponent.value.sendFlterDataToBackend(); // await 추가
      console.log('check : ', check);
      if (check) {
        emit('filter-set-window-confirm', check);
      } else {
        alert('작업 실패');
      }
    }
    emit('filter-set-window-confirm');
  };

  const onClose = () => {
    emit('close');
  };
</script>

<style lang="scss" scoped></style>
