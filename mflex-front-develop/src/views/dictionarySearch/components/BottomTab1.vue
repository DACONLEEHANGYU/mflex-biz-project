<template>
  <div class="tab-inner">
    <div class="inputs-wrap">
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
              <th>단어명</th>
              <td>
                <div class="td-col">
                  <AppStateText v-model="data.wordName" />
                </div>
              </td>
              <th>이음 동의어 목록</th>
              <td>
                <div class="td-col">NM</div>
              </td>
            </tr>
            <tr>
              <th>단어 영문 약어명</th>
              <td>
                <div class="td-col">NM</div>
              </td>
              <th>금칙어 목록</th>
              <td>
                <div class="td-col"></div>
              </td>
            </tr>
            <tr>
              <th>단어 유형</th>
              <td>
                <div class="td-col">분류어</div>
              </td>
              <th>도메인 분류명</th>
              <td>
                <div class="td-col">
                  <AppStateText v-model="data.domainName" />
                </div>
              </td>
            </tr>
            <tr>
              <th rowspan="5">단어 설명</th>
              <td rowspan="5" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 169px"
                    v-model="data.wordInfo"
                  ></textarea>
                </div>
              </td>
              <th>유사어 구분</th>
              <td>
                <div class="td-col">-</div>
              </td>
            </tr>
            <tr>
              <th>제정정보</th>
              <td>
                <div class="td-col">-</div>
              </td>
            </tr>
            <tr>
              <th>개정정보</th>
              <td>
                <div class="td-col">-</div>
              </td>
            </tr>
            <tr>
              <th>수정자 정보</th>
              <td>
                <div class="td-col">-</div>
              </td>
            </tr>
            <tr>
              <th>수정일시</th>
              <td>
                <div class="td-col">-</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue';
  import { ref } from 'vue';
  const data = reactive({
    wordName: {
      type: '범정부',
      label: '개별공시지가',
      color: '#ffffff',
      bgColor: '#24459e',
      size: 41,
    },
    domainName: {
      type: '범정부',
      label: '비용',
      color: '#ffffff',
      bgColor: '#24459e',
      size: 41,
    },
    wordInfo: '테스트\ntest\ntest\ntest\ntest\ntest\ntest\ntest\ntest',
  });
</script>
