<template>
  <div class="pop-window">
    <div class="window-header">도메인분류명/도메인명 목록</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="search-top">
          <div>도메인분류명 :</div>
          <div class="serach-input-div">
            <input class="input-text" type="text" />
            <button class="btn-s dark-gray ml5">검색</button>
          </div>
        </div>
        <div class="tab-comtent__row h-450"></div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div>
          <button class="btn-s dark-gray ml5">도메인분류명 등록</button>
        </div>
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
  .search-top {
    display: flex;
    /* justify-content: space-between; */
    margin-bottom: 10px;
    align-items: center;
  }

  .serach-input-div {
    display: flex;
    margin-left: 10px;
    width: 79%;
  }

  /* 
  .window-footer {
    justify-content: space-between;
  } */
  .pop-window .inputs-btns {
    justify-content: space-between;
  }
</style>
