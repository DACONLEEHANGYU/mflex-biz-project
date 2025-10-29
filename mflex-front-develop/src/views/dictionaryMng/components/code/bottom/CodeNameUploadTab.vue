<template>
  <div class="tab-inner">
    <div class="grid-wrap domain-grid-height">
      <div class="grid-top"></div>
      <div class="grid-list">
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
  import { reactive, ref, watch, inject, watchEffect } from 'vue';
  export default {
    setup(props, { emit }) {
      const codeNameRowData = inject('codeNameRowData');
      console.log('codeNameRowData : ', codeNameRowData);

      const agGrid = ref(null);
      const gridApi = ref(null);
      const rowData = reactive({});
      rowData.value = [];
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'applicationCategory',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터타입',
          field: 'dataType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터길이',
          field: 'dataLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '관리부서명',
          field: 'manageDepartmentName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정차수',
          field: 'revisionCycle',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      // watchEffect(() => {
      //   if (domainClassRowData.value) {
      //     console.log('domainClassRowData.value : ', domainClassRowData.value);
      //     const rows = domainClassRowData.value.map((row, rowIndex) => {
      //       const obj = { no: rowIndex + 1 }; // 번호 컬럼 추가
      //       columnDefs.forEach((col, index) => {
      //         if (col.field !== 'no') {
      //           // 'no' 필드는 이미 추가했으므로 건너뜁니다
      //           let value = row[index - 1]; // index를 1 감소시켜 원래 데이터의 인덱스와 맞춥니다
      //           obj[col.field] = value;
      //         }
      //       });
      //       return obj;
      //     });
      //     rowData.value = rows;
      //   }
      // });

      watch(
        codeNameRowData,
        (value) => {
          console.log('codeNameRowData 변경: ', value);
          //rowData.value = value;
          if (codeNameRowData.value != null) {
            console.log('codeNameRowData.value : ', codeNameRowData.value);
            const rows = codeNameRowData.value.map((row, rowIndex) => {
              const obj = { no: rowIndex + 1 }; // 번호 컬럼 추가
              columnDefs.forEach((col, index) => {
                if (col.field !== 'no') {
                  // 'no' 필드는 이미 추가했으므로 건너뜁니다
                  let value = row[index - 1]; // index를 1 감소시켜 원래 데이터의 인덱스와 맞춥니다
                  obj[col.field] = value;
                }
              });
              return obj;
            });
            rowData.value = rows;
          }
        },
        { immediate: true }
      );

      return {
        rowData,
        columnDefs,
        agGrid,
        gridApi,
        handleSetGridApi,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
