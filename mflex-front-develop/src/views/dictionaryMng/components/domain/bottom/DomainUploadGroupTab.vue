<template>
  <div class="tab-inner grid-tab-height">
    <div class="upload-container">
      <div class="side-area">
        <div class="upload-area">
          <div class="side-title">도메인 일괄등록</div>
          <div id="file-input-area">
            <span>도메인</span>

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
              :href="`${apiUrl}/api/v1/download/domain-group-template`"
              class="btn-s"
              >양식내려받기</a
            >
          </div>
          <div>
            <div class="dictionary_up_name_div">
              {{ domainGroupFileName }}
            </div>
          </div>
        </div>
        <div class="result-area">
          <div class="result-title">등록결과</div>
          <div class="result-content">
            <div class="result-box">
              결과박스
              <textarea v-model="resultmessage" name="" id="result-message">
              </textarea>
            </div>
          </div>
          <button class="btn-s">오류 내려받기</button>
        </div>
      </div>
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
            <button id="upload-btn" class="btn-s" @click="uploadDomainGroup">
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { storeToRefs } from 'pinia';
  import { read, utils } from 'xlsx';
  import { reactive, ref, watch, inject } from 'vue';
  import { getDomainGroupUploadFile } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useAuthStore } from '@/stores/auth';

  export default {
    setup() {
      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const domainGroupRowData = inject('domainGroupRowData');

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const rowData = reactive({});
      rowData.value = [];
      const fileInput = ref(null);
      const domainGroupFileName = ref('');

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
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인그룹설명',
          field: 'wordExplain',
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
          domainGroupFileName.value = file.name;
          // 여기에 파일 업로드 로직을 추가하세요
          fileUpload();
        }
      };

      const selectedFile = ref(null);
      const domainGroupFormData = ref();

      // 파일 업로드 함수 분리
      const fileUpload = async (selectType, evnet) => {
        const file = event.target.files[0];
        if (file) {
          selectedFile.value = file;
          domainGroupFileName.value = file.name;
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

          domainGroupFormData.value = formData;
          console.log(
            'domainGroupFormData.value : ',
            domainGroupFormData.value
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
            domainGroupRowData.value = dataRows;

            console.log('rowData.value : ', rowData.value);
          };
          reader.readAsArrayBuffer(file);
        }
      };

      watch(
        domainGroupRowData,
        (value) => {
          if (domainGroupRowData.value != null) {
            console.log('domainGroupRowData 변경: ', value);
            //rowData.value = value;
            console.log(
              'domainGroupRowData.value : ',
              domainGroupRowData.value
            );
            const rows = domainGroupRowData.value.map((row, rowIndex) => {
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

      // 업로드 결과를 처리하는 헬퍼 함수
      function processUploadResult(response) {
        const successCount = response.data.filter(
          (item) => item.isSuccess
        ).length;
        const failCount = response.data.length - successCount;
        return { successCount, failCount };
      }

      const resultmessage = ref('');

      // 도메인 그룹 업로드
      const uploadDomainGroup = async () => {
        let totalSuccessCount = 0;
        let totalFailCount = 0;
        let message = '[ 일괄 업로드 결과 ]';

        // 도메인 그룹 업로드
        if (domainGroupFormData.value != null) {
          const domainGroupResponse = await getDomainGroupUploadFile(
            domainGroupFormData.value
          );
          const { successCount, failCount } =
            processUploadResult(domainGroupResponse);
          totalSuccessCount += successCount;
          totalFailCount += failCount;
          message += `<br><br>도메인 그룹 - 성공: ${successCount}건, 실패: ${failCount}건\n`;

          console.log('message', message);

          resultmessage.value = message;
        }
      };

      return {
        apiUrl,
        rowData,
        columnDefs,
        handleSetGridApi,
        triggerFileInput,
        handleFileUpload,
        fileInput,
        domainGroupFileName,
        uploadDomainGroup,
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
  #result-message {
    height: 200px;
    overflow-y: auto;
    border: 1px solid black;
  }
</style>
