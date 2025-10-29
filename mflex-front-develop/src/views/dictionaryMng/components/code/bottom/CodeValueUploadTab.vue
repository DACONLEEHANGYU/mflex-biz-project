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
      const codeValueRowData = inject('codeValueRowData');
      console.log('codeValueRowData : ', codeValueRowData);

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
          field: 'unifiedCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값',
          field: 'codeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값명',
          field: 'codeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값설명',
          field: 'codeValueExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값',
          field: 'parentUnityCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값명',
          field: 'parentUnityCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값',
          field: 'referenceCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값명',
          field: 'referenceCodeName',
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
        codeValueRowData,
        (value) => {
          console.log('codeValueRowData 변경: ', value);
          //rowData.value = value;
          if (codeValueRowData.value != null) {
            console.log('codeValueRowData.value : ', codeValueRowData.value);
            const rows = codeValueRowData.value.map((row, rowIndex) => {
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
