<template>
  <div class="pop-window">
    <div class="window-header">데이터베이스자료 일괄등록</div>
    <div class="window-body">
      <div class="window-title">
        <div class="title-text">자료등록</div>
        <div class="title-btns">
          <button class="btn-s file-down">
            <i class="icon"></i> 양식 일괄 내려받기
          </button>
        </div>
      </div>
      <div class="window-content">
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="13%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr v-for="item in fileData" :key="item.id">
                <th>{{ item.label }}</th>
                <td>
                  <div class="td-col">
                    <div class="input-file__row">
                      <AppFileInput
                        class="input-row"
                        accept=".xls, .xlsx"
                        v-model="item.data"
                        :id="item.id"
                        style="width: 100%"
                      />
                      <button traget="_blank" class="btn-s file-down-s">
                        <i class="icon"></i>양식 내려받기
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="window-title pt5">
        <div class="title-text">미리보기</div>
      </div>
      <div class="window-content">
        <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
        <div class="tab-comtent__row">
          <keep-alive>
            <component :is="currentTab" />
          </keep-alive>
        </div>
        <!-- <template v-slot:tabPanel-1>
          <WindowTab1View />
        </template>
        <template v-slot:tabPanel-2>
          <WindowTab2View />
        </template>
        <template v-slot:tabPanel-3>
          <WindowTab3View />
        </template> -->
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onClose">확인</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineAsyncComponent, shallowRef, watch } from 'vue';
const WindowTab1View = defineAsyncComponent(() =>
  import('./WindowTab1View.vue'),
);
const WindowTab2View = defineAsyncComponent(() =>
  import('./WindowTab2View.vue'),
);
const WindowTab3View = defineAsyncComponent(() =>
  import('./WindowTab3View.vue'),
);

const fileData = ref([
  { id: 0, label: '테이블', data: {}, downFile: '' },
  { id: 1, label: '컬럼', data: {}, downFile: '' },
  { id: 2, label: 'PK 정보', data: {}, downFile: '' },
  { id: 3, label: 'FK 정보', data: {}, downFile: '' },
  { id: 4, label: '인덱스', data: {}, downFile: '' },
]);

const tabList = reactive(['용어', '단어', '도메인']);
const activeTab = ref(1);

const currentTab = shallowRef(WindowTab1View);
watch(activeTab, () => {
  if (activeTab.value == 1) {
    currentTab.value = WindowTab1View;
  } else if (activeTab.value == 2) {
    currentTab.value = WindowTab2View;
  } else {
    currentTab.value = WindowTab3View;
  }
});

const emit = defineEmits(['close']);

const onClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped></style>
