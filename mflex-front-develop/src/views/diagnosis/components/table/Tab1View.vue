<template>
  <div class="content-box">
    <div class="content-area">
      <div class="content-row">
        <div class="bg-box">
          <div class="tab-inner pb0">
            <div class="table-section">
              <div class="left-section">
                <TargetTableComp />
              </div>
              <div class="grid-c">
                <div class="data-move__btns">
                  <button
                    class="btn-s arrow-right"
                    @click="onExcludeTable"
                    :disabled="selectTargetTable.length === 0"
                  >
                    <i class="icon"></i>
                  </button>
                  <button
                    class="btn-s arrow-left"
                    @click="onIncludeTable"
                    :disabled="selectExcludeTable.length === 0"
                  >
                    <i class="icon"></i>
                  </button>
                </div>
              </div>
              <div class="right-section">
                <ExcludeTableComp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import {
    postTableExclude,
    deleteTableExclude,
  } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';

  import TargetTableComp from '@/views/diagnosis/components/table/TargetTableComp.vue';
  import ExcludeTableComp from '@/views/diagnosis/components/table/ExcludeTableComp.vue';
  import { storeToRefs } from 'pinia';

  import { useDiagnosisStore } from '@/stores/diagnosis.js';
  import { watch } from 'vue';

  const { selectTargetTable, selectExcludeTable } = storeToRefs(
    useDiagnosisStore()
  );
  const { setTableExcludeStatus, setTableIncludeStatus } = useDiagnosisStore();

  const onExcludeTable = async () => {
    const data = selectTargetTable.value.map((item) => ({
      instituteId: item.instituteId,
      databaseId: item.databaseId,
      schemaName: item.schemaName,
      tableName: item.tableName,
    }));
    await postTableExclude(data);
    setTableExcludeStatus(true);
  };

  const onIncludeTable = async () => {
    const data = selectExcludeTable.value.map((item) => ({
      instituteId: item.instituteId,
      databaseId: item.databaseId,
      schemaName: item.schemaName,
      tableName: item.tableName,
    }));
    await deleteTableExclude(data);
    setTableIncludeStatus(true);
  };

  watch(
    () => selectTargetTable.value,
    (newValue) => {
      console.log('selectTargetTable', newValue);
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  .table-section {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    justify-content: space-between;
  }

  .table-section .left-section {
    width: 700px;
    border: 1px solid #ccc;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .table-section .right-section {
    flex: 1;
    border: 1px solid #ccc;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .data-move__btns {
    width: 70px;
  }

  .data-move__btns .btn-s {
    width: 54px;
    height: 54px;
    background: #656060;
  }

  .data-move__btns .btn-s :hover {
    border-color: none;
  }

  .bg-box {
    border: none;
  }

  .data-move__btns .btn-s .icon {
    background-color: rgb(255 255 255);
  }
</style>
