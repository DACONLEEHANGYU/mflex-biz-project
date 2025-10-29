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
                <div class="td-col">{{ foreignKeyData.tableInformation }}</div>
              </td>
              <th>DB명/스키마명</th>
              <td>
                <div class="td-col">
                  {{ foreignKeyData.databaseSchemaName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>외래키명</th>
              <td>
                <div class="td-col">{{ foreignKeyData.foreignKeyName }}</div>
              </td>
              <th>주제영역</th>
              <td>
                <div class="td-col">{{ foreignKeyData.subjectAreaName }}</div>
              </td>
            </tr>
            <tr>
              <th>외래키컬럼구성</th>
              <td colspan="3">
                <div class="td-col">
                  {{ foreignKeyData.foreignKeyCompositionContent }}
                </div>
              </td>
            </tr>
            <tr>
              <th>참조테이블명</th>
              <td colspan="3">
                <div class="td-col">
                  {{ foreignKeyData.referenceTableInformation }}
                </div>
              </td>
            </tr>
            <tr>
              <th>참조기본키컬럼구성</th>
              <td colspan="3">
                <div class="td-col">
                  {{ foreignKeyData.referencePrimaryKeyCompositionContent }}
                </div>
              </td>
            </tr>
            <tr>
              <th>필수여부</th>
              <td>
                <div class="td-col">
                  {{ foreignKeyData.relationEssentialName }}
                </div>
              </td>
              <th>관계유형</th>
              <td>
                <div class="td-col">{{ foreignKeyData.relationTypeName }}</div>
              </td>
            </tr>
            <tr>
              <th>수집일시</th>
              <td colspan="3">
                <div class="td-col">
                  {{ foreignKeyData.foreignKeyCollectionDateTime }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ foreignKeyData.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ foreignKeyData.updateDateTime }}</div>
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

  import {
    getForeignKeyBaseInfo,
    getForeignKeyColumn,
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  const showAnimate = ref(false);

  const { selectForeignKeyData } = storeToRefs(useSchemaSearchTabStore());
  const foreignKeyData = reactive({
    tableInformation: '',
    databaseSchemaName: '',
    foreignKeyName: '',
    subjectAreaName: '',
    foreignKeyCompositionContent: '',
    referenceTableInformation: '',
    referencePrimaryKeyCompositionContent: '',
    relationEssentialName: '',
    relationTypeName: '',
    foreignKeyCollectionDateTime: '',
    updater: '',
    updateDateTime: '',
  });

  const bindForeignKeyBaseInfo = (value) => {
    foreignKeyData.tableInformation = value.tableInformation;
    foreignKeyData.databaseSchemaName = value.databaseSchemaName;
    foreignKeyData.foreignKeyName = value.foreignKeyName;
    foreignKeyData.subjectAreaName = value.subjectAreaName;
    foreignKeyData.foreignKeyCompositionContent =
      value.foreignKeyCompositionContent;
    foreignKeyData.referenceTableInformation = value.referenceTableInformation;
    foreignKeyData.referencePrimaryKeyCompositionContent =
      value.referencePrimaryKeyCompositionContent;
    foreignKeyData.relationEssentialName = value.relationEssentialName;
    foreignKeyData.relationTypeName = value.relationTypeName;
    foreignKeyData.foreignKeyCollectionDateTime =
      value.foreignKeyCollectionDateTime;
    foreignKeyData.updater = value.updater;
    foreignKeyData.updateDateTime = value.updateDateTime;
  };

  watch(
    selectForeignKeyData,
    async (value) => {
      console.log('selectForeignKeyData - value', value);

      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);

      if (value.instituteId) {
        const foreignKeyBaseQuery = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          databaseId: value.databaseId,
          schemaName: value.schemaName,
          tableName: value.tableName,
          foreignKeyName: value.foreignKeyName,
        };

        const foreignKeyBaseInfo = await getForeignKeyBaseInfo(
          foreignKeyBaseQuery
        );

        console.log('foreignKeyBaseInfo', foreignKeyBaseInfo);

        bindForeignKeyBaseInfo(foreignKeyBaseInfo);
      } else {
        return;
      }
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped></style>
