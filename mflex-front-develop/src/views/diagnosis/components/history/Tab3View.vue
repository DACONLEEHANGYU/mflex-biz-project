<template>
  <div class="table-section">
    <div class="left-section">
      <StandardDiagnosisHistoryComp />
    </div>
    <div class="right-section">
      <DiagnosisItemTrendsComp />
    </div>
  </div>
</template>

<script setup>
  import StandardDiagnosisHistoryComp from '@/views/diagnosis/components/history/StandardDiagnosisHistoryComp.vue';
  import DiagnosisItemTrendsComp from '@/views/diagnosis/components/history/DiagnosisItemTrendsComp.vue';
</script>

<style lang="scss" scoped>
  .table-section {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: visible;
    justify-content: space-between;
    padding: 20px; /* 상하좌우 여백 */
    padding-right: 20px; /* 오른쪽 여백 추가 */
    box-sizing: border-box; /* 패딩을 너비에 포함시킴 */
  }

  .table-section .left-section {
    width: 900px;
    border: 1px solid #ccc;
    margin-right: 20px;
    height: 750px;
  }

  .table-section .right-section {
    flex: 1;
    border: 1px solid #ccc;
    height: 750px;
  }
</style>
