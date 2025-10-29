<template>
  <div class="tab-inner grid-tab-height">
    <div class="upload-container">
      <div class="grid-wrap domain-grid-height">
        <div class="grid-top"></div>
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @gridApi="handleSetGridApi"
          ref="agGrid"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { storeToRefs } from 'pinia';
  import { reactive, ref, watch } from 'vue';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { useAuthStore } from '@/stores/auth';

  export default {
    setup() {
      const apiUrl = import.meta.env.VITE_APP_API_URL;

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const rowData = reactive({});
      rowData.value = [];

      const externalDictionaryStore = useExternalDictionaryStore();
      const { wordData, fileUploadState } = storeToRefs(
        externalDictionaryStore
      );

      const context = { componentParent: null };

      const fileInput = ref(null);
      const domainClassFileName = ref('');

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
          dragStatus: false,
        },
        {
          headerName: '제정차수',
          field: 'enactCycle',
          cellClass: 'grid-cell-centered',
          width: 100,
          dragStatus: false,
        },
        {
          headerName: '공통표준단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 150,
          dragStatus: false,
        },
        {
          headerName: '공통표준단어 영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 150,
          dragStatus: false,
        },
        {
          headerName: '공통표준단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '공통표준단어 설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          dragStatus: false,
        },
        {
          headerName: '공통표준도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '이음동의어 목록',
          field: 'synonymList',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '금칙어 목록',
          field: 'forbiddenWordList',
          cellClass: 'ag-left-aligned-cell',
          width: 150,
          dragStatus: false,
        },
        {
          headerName: '형식단어 여부',
          field: 'isFormatWord',
          cellClass: 'grid-cell-centered',
          width: 120,
          dragStatus: false,
        },
      ]);

      const handleSetGridApi = (params) => {
        console.log('Grid API set:', params);
      };

      // wordData 변경 감시하여 그리드 데이터 업데이트
      watch(
        wordData,
        (newWordData) => {
          console.log('wordData 변경됨:', newWordData);

          if (newWordData && newWordData.length > 0) {
            // 필드 이름 매핑
            const mappedData = newWordData.map((item, index) => {
              return {
                id: index + 1,
                no: item.no || item.번호 || index + 1,
                enactCycle: item['제정차수(제정연월)'] || '',
                wordName: item['공통표준단어명'] || '',
                wordEnglishName: item['공통표준단어 영문명'] || '',
                wordAbbreviationName: item['공통표준단어영문약어명'] || '',
                wordExplain: item['공통표준단어 설명'] || '',
                domainClassName: item['공통표준도메인분류명'] || '',
                synonymList: item['이음동의어 목록'] || '',
                forbiddenWordList: item['금칙어 목록'] || '',
                isFormatWord: item['형식단어 여부'] || '',
              };
            });

            rowData.value = mappedData;
            console.log('단어 그리드 데이터 업데이트 완료:', rowData.value);
          } else {
            rowData.value = [];
          }
        },
        { immediate: true }
      );

      return {
        apiUrl,
        rowData,
        columnDefs,
        handleSetGridApi,
        fileInput,
        domainClassFileName,
        context,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .domain-grid-height {
    height: 360px;
  }

  .grid-bottom {
    display: flex;
    padding: 7px;
    justify-content: flex-end;
  }

  .grid-tab-height {
    height: 550px;
  }

  .upload-container {
    height: 100%;
  }
  .tab-inner {
    padding: 0;
  }
</style>
