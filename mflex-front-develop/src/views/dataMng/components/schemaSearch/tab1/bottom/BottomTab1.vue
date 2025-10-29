<template>
  <div class="tab-inner">
    <div class="inputs-wrap" :class="{ 'highlight-effect': showAnimate }">
      <div class="input-form">
        <table class="input-table">
          <colgroup>
            <col width="12%" />
            <col width="38%" />
            <col width="12%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>테이블명</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.tableName }}</div>
              </td>
              <th>DB명/스키마명</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.databaseSchemaName }}</div>
              </td>
            </tr>
            <tr>
              <th>테이블한글명</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.tableKoreanName }}</div>
              </td>
              <th>주제영역</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.subjectAreaName }}</div>
              </td>
            </tr>
            <tr>
              <th rowspan="2">테이블설명</th>
              <td rowspan="2" class="pd0">
                {{ tableBaseInfo.tableDescription }}
              </td>
              <th>소유자명</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.tableOwnerName }}</div>
              </td>
            </tr>
            <tr>
              <th>컬럼수</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.tableColumnCount }}</div>
              </td>
            </tr>
            <tr>
              <th>발생주기</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.occurrenceCycleName }}
                </div>
              </td>
              <th>테이블논리유형</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.tableLogicalTypeName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>월간발생량</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.monthlyGenerationAmountContent }}
                </div>
              </td>
              <th>테이블물리유형</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.tablePhysicalTypeName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>보존기간</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.preservationPeriodName }}
                </div>
              </td>
              <th>수집일시</th>
              <td>
                <div class="td-col">
                  {{ tableBaseInfo.tableCollectionDateTime }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ tableBaseInfo.updateDateTime }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from 'vue';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';

  import { getTableBaseInfo } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  const showAnimate = ref(false);

  const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

  const tableBaseInfo = reactive({
    tableName: '', // 테이블 이름
    databaseSchemaName: '', // 스키마 정보
    tableKoreanName: '', // 테이블 한글명
    subjectAreaName: '', // 주제 영역
    tableDescription: '', // 테이블 설명
    tableOwnerName: '', // 테이블 소유자 이름
    tableColumnCount: '', // 컬럼 수
    occurrenceCycleName: '', // 발생 주기
    tableLogicalTypeName: '', // 논리적 테이블 유형
    tablePhysicalTypeName: '', // 물리적 테이블 유형
    monthlyGenerationAmountContent: '', // 월간 발생량
    preservationPeriodName: '', // 보존 기간
    tableCollectionDateTime: '', // 수집 시간
    updater: '', // 마지막 수정자
    updateDateTime: '', // 마지막 수정 시간
  });

  const bindTableBaseInfo = (tableBaseData) => {
    tableBaseInfo.tableName = tableBaseData.tableName;
    tableBaseInfo.databaseSchemaName = tableBaseData.databaseSchemaName;
    tableBaseInfo.tableKoreanName = tableBaseData.tableKoreanName;
    tableBaseInfo.subjectAreaName = tableBaseData.subjectAreaName;
    tableBaseInfo.tableDescription = tableBaseData.tableDescription;
    tableBaseInfo.tableOwnerName = tableBaseData.tableOwnerName;
    tableBaseInfo.tableColumnCount = tableBaseData.tableColumnCount;
    tableBaseInfo.occurrenceCycleName = tableBaseData.occurrenceCycleName;
    tableBaseInfo.tableLogicalTypeName = tableBaseData.tableLogicalTypeName;
    tableBaseInfo.tablePhysicalTypeName = tableBaseData.tablePhysicalTypeName;
    tableBaseInfo.monthlyGenerationAmountContent =
      tableBaseData.monthlyGenerationAmountContent;
    tableBaseInfo.preservationPeriodName = tableBaseData.preservationPeriodName;
    tableBaseInfo.tableCollectionDateTime =
      tableBaseData.tableCollectionDateTime;
    tableBaseInfo.updater = tableBaseData.updater;
    tableBaseInfo.updateDateTime = tableBaseData.updateDateTime;
  };

  watch(
    selectTableData,
    async (newVal) => {
      console.log('selectTableData', newVal);

      if (newVal.instituteId) {
        // 테이블 기본정보 조회 함수 호출
        const tableBaseQuery = {
          instituteId: newVal.instituteId,
          informationSystemId: newVal.informationSystemId,
          databaseId: newVal.databaseId,
          schemaName: newVal.schemaName,
          tableName: newVal.tableName,
        };

        const tableBaseData = await getTableBaseInfo(tableBaseQuery);

        bindTableBaseInfo(tableBaseData);
      }

      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped></style>
