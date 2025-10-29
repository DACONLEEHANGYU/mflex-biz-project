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
        <div class="grid-bottom">
          <div class="btn-div">
            <button id="upload-btn" class="btn-s">등록</button>
          </div>
        </div>
      </div>
      <div class="side-area">
        <div class="upload-area">
          <div class="side-title">도메인분류 일괄등록</div>
          <div id="file-input-area">
            <span>도메인분류</span>

            <label id="file-icon" for="input-file-group">
              <!-- <font-awesome-icon :icon="['fas', 'folder-open']" /> -->
              <span class="sr-only"></span>
            </label>
            <button class="btn-s" @click="triggerFileInput">파일찾기</button>
            <input
              ref="fileInput"
              v-show="false"
              type="file"
              id="input-file-group"
              @change="handleFileUpload($event)"
              accept=".xlsx, .xls"
            />
            <a
              :href="`${apiUrl}/api/v1/download/domain-class-template`"
              class="btn-s"
              >양식내려받기</a
            >
          </div>
          <div>
            <div class="dictionary_up_name_div">
              {{ domainClassFileName }}
            </div>
          </div>
        </div>
        <div class="result-area">
          <div class="result-title">등록결과</div>
          <div class="result-content">
            <div class="result-box">결과박스</div>
          </div>
          <button class="btn-s">오류 내려받기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { storeToRefs } from 'pinia';
  import { read, utils } from 'xlsx';
  import { reactive, ref, watch, inject } from 'vue';

  import { useAuthStore } from '@/stores/auth';

  export default {
    setup() {
      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const domainClassRowData = inject('domainClassRowData');

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const rowData = reactive({});
      rowData.value = [];
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
          headerName: '작업구분',
          field: 'applicationCategory',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인그룹명',
          field: 'domainGroupName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const handleSetGridApi = (params) => {
        console.log('Grid API set:', params);
      };

      const triggerFileInput = () => {
        console.log('File input triggered');
        console.log(fileInput.value);
        fileInput.value.click();
      };

      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          domainClassFileName.value = file.name;
          // 여기에 파일 업로드 로직을 추가하세요
          fileUpload();
        }
      };

      const selectedFile = ref(null);
      const domainClassFormData = ref();

      // 파일 업로드 함수 분리
      const fileUpload = async (selectType, evnet) => {
        const file = event.target.files[0];
        if (file) {
          selectedFile.value = file;
          domainClassFileName.value = file.name;
          // FormData 생성 및 설정
          const formData = new FormData();
          const metaData = JSON.stringify({
            managementInstituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
          });
          const metaDataBlob = new Blob([metaData], {
            type: 'application/json',
          });
          formData.append('metaData', metaDataBlob, 'metadata.json');
          formData.append('file', file);

          domainClassFormData.value = formData;
          console.log(
            'domainClassFormData.value : ',
            domainClassFormData.value
          );

          // 파일 데이터 리딩
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

            // 헤더 행 제거
            const dataRows = jsonData.slice(1);
            domainClassRowData.value = dataRows;

            console.log('rowData.value : ', rowData.value);
          };
          reader.readAsArrayBuffer(file);
        }
      };

      watch(
        domainClassRowData,
        (value) => {
          if (domainClassRowData.value != null) {
            console.log('domainClassRowData 변경: ', value);
            //rowData.value = value;
            console.log(
              'domainClassRowData.value : ',
              domainClassRowData.value
            );
            const rows = domainClassRowData.value.map((row, rowIndex) => {
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
        apiUrl,
        rowData,
        columnDefs,
        handleSetGridApi,
        triggerFileInput,
        handleFileUpload,
        fileInput,
        domainClassFileName,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .domain-grid-height {
    height: 535px;
    position: relative; // 추가: absolute 포지셔닝의 기준점
  }
  .grid-bottom {
    display: flex;
    padding: 7px;
    background-color: aquamarine;
    justify-content: flex-end;
  }

  .grid-tab-height {
    height: 550px;
  }
  .upload-container {
    display: flex;
    height: 100%;
    justify-content: space-between;
  }
  .side-area {
    width: 30%;
    height: 100%;
    background-color: #f0f0f0;
  }
  .upload-area {
    width: 100%;
    height: 220px;
    padding: 20px;
    border-bottom: 1px solid #ccc;
  }
  .result-area {
    width: 100%;
    height: calc(100% - 220px);
    padding: 20px;
  }
  .result-content {
    height: 90%;
    overflow-y: auto;
    border: 1px solid black;
  }
</style>
