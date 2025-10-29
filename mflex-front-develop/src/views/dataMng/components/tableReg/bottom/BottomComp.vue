<template>
  <div class="row col-2">
    <div class="bg-box">
      <div class="info-list__wrap">
        <div class="list-title"><span class="title-text">로그</span></div>
        <div class="list-items">
          <ul>
            <li v-for="item in logData" :key="item.id">
              <div class="title" v-html="item.title"></div>
              <div class="date-time">{{ item.date }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="bg-box">
      <div class="info-list__wrap">
        <div class="list-title">
          <span class="title-text">오류</span
          ><button class="btn-s error-down__outline">
            <i class="icon"></i> 오류 내려받기
          </button>
        </div>
        <div class="list-items">
          <ul>
            <li v-for="item in errorData" :key="item.id">
              <div class="title" v-html="item.title"></div>
              <div class="date-time">{{ item.date }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';

  const logData = ref([]);
  const errorData = ref([]);

  const attachLogData = () => {
    let sampleData = [];
    for (let i = 0; i < 5; i++) {
      sampleData.push({
        id: i,
        title: '자료 일괄등록 <strong>완료</strong>하였습니다.',
        date: '2024년 2월 7일 11:07:33',
      });
    }
    logData.value = sampleData;
  };

  const attachErrorData = () => {
    let sampleData = [];
    for (let i = 0; i < 5; i++) {
      sampleData.push({
        id: i,
        title:
          '자료 일괄등록 중 ‘단어’에서 <strong>오류가 발생</strong>하였습니다. ',
        date: '2024년 2월 7일 11:07:33',
      });
    }
    errorData.value = sampleData;
  };

  attachLogData();
  attachErrorData();
</script>
