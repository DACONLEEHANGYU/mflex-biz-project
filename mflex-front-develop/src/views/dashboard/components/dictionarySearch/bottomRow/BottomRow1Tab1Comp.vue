<template>
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
            <th>용어명</th>
            <td colspan="3">
              <div class="td-col">
                <AppStateText v-model="data.termName" />
              </div>
            </td>
          </tr>
          <tr>
            <th>용어영문 약어명</th>
            <td><div class="td-col">INDIV_OALP</div></td>
            <th>관리 부서명</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>용어영문 영문명</th>
            <td><div class="td-col">INDIV_OALP</div></td>
            <th>업무 분야명</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>용어 유형명</th>
            <td><div class="td-col">일반어</div></td>
            <th>데이터 단위명</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th rowspan="4">용어 설명</th>
            <td rowspan="4" class="pd0 plr10">
              <div class="td-col">
                <textarea style="height: 121px"></textarea>
              </div>
            </td>
            <th>데이터 허용값</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>저장형식 내용</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>표현형식 내용</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>제정정보</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>도메인명</th>
            <td>
              <div class="td-col">
                <AppStateText v-model="data.domainName" />
              </div>
            </td>
            <th>개정정보</th>
            <td><div class="td-col">-</div></td>
          </tr>
          <tr>
            <th>코드 유형명</th>
            <td><div class="td-col">-</div></td>
            <th>최종 수정자 정보</th>
            <td><div class="td-col">관리자(admin)</div></td>
          </tr>
          <tr>
            <th>연관 코드명</th>
            <td><div class="td-col">-</div></td>
            <th>최종 수정일시</th>
            <td><div class="td-col">2024.02.27 09:38:55</div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { ref } from 'vue';
const data = reactive({
  termName: '범정부/개별공시지가',
  domainName: '범정부/가격N10',
});
</script>
