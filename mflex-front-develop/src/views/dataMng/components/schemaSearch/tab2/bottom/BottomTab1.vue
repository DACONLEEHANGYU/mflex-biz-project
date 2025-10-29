<template>
  <div class="tab-inner">
    <div class="inputs-wrap" :class="{ 'highlight-effect': showAnimate }">
      <div class="input-form">
        <table class="input-table">
          <colgroup>
            <col width="10%" />
            <col width="38%" />
            <col width="12%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>DB명/스키마명</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.databaseSchemaName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>컬럼명</th>
              <td>
                <div class="td-col">{{ columnBaseInfo.columnName }}</div>
              </td>
            </tr>
            <tr>
              <th>컬럼한글명</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.columnKoreanName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>데이터타입</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.dataTypeName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>연관테이블수</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.columnTableCount }}
                </div>
              </td>
            </tr>
            <tr>
              <th>수집일시</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.columnCollectionDatetime }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.updater }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">
                  {{ columnBaseInfo.updateDatetime }}
                </div>
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
  import { storeToRefs } from 'pinia';

  import { getColumnBaseInfo } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  const { selectColumnData } = storeToRefs(useSchemaSearchTabStore());

  const columnBaseInfo = reactive({
    databaseSchemaName: '',
    columnName: '',
    columnKoreanName: '',
    dataTypeName: '',
    columnTableCount: '',
    columnCollectionDatetime: '',
    updater: '',
    updateDatetime: '',
  });

  // 컬럼 데이터 바인딩
  const bindColumnBaseInfo = (columnBaseData) => {
    columnBaseInfo.databaseSchemaName = columnBaseData.databaseSchemaName;
    columnBaseInfo.columnName = columnBaseData.columnName;
    columnBaseInfo.columnKoreanName = columnBaseData.columnKoreanName;
    columnBaseInfo.dataTypeName = columnBaseData.dataTypeName;
    columnBaseInfo.columnTableCount = columnBaseData.columnTableCount;
    columnBaseInfo.columnCollectionDatetime =
      columnBaseData.columnCollectionDatetime;
    columnBaseInfo.updater = columnBaseData.updater;
    columnBaseInfo.updateDatetime = columnBaseData.updateDatetime;
  };

  watch(
    selectColumnData,
    async (value) => {
      console.log('컬럼조회 - bottomTab1 selectColumnData', value);

      if (!value.instituteId) {
        return;
      }

      const columnBaseInfo = {
        instituteId: value.instituteId,
        informationSystemId: value.informationSystemId,
        databaseId: value.databaseId,
        schemaName: value.schemaName,
        columnName: value.columnName,
        columnKoreanName: value.columnKoreanName,
        dataTypeName: value.dataTypeName,
      };
      const columnBase = await getColumnBaseInfo(columnBaseInfo);

      console.log('컬럼조회 - bottomTab1 columnBase', columnBase);

      bindColumnBaseInfo(columnBase);

      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped></style>
