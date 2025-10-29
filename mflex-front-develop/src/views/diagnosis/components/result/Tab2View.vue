<template>
  <div class="content-box">
    <div class="content-area">
      <div class="content-row">
        <div class="bg-box">
          <div class="tab-inner pb0">
            <div class="table-section">
              <div class="left-section">
                <DiagnosisResultComp />
              </div>
              <div class="right-section">
                <DiagnosisDetailsComp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import DiagnosisResultComp from '@/views/diagnosis/components/result/DiagnosisResultComp.vue';
  import DiagnosisDetailsComp from '@/views/diagnosis/components/result/DiagnosisDetailsComp.vue';
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
    // margin-top: 20px;
    margin-bottom: 20px;
    margin-right: 20px;
  }
  .table-section .right-section {
    flex: 1;
    border: 1px solid #ccc;
    // margin-top: 20px;
    margin-bottom: 20px;
  }
  .data-move__btns {
    width: 70px;
  }
  .data-move__btns .btn-s {
    width: 54px;
    height: 54px;
  }
  .bg-box {
    border: none;
  }
</style>
