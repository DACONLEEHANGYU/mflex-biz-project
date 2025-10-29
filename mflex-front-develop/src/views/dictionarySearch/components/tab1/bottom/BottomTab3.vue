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
              <th>도메인명</th>
              <td>
                <div class="td-col">
                  {{ domainData.domainName }}
                </div>
              </td>
              <th>제개정일자</th>
              <td colspan="3">
                <div class="td-col">{{ domainData.revisionInfo }}</div>
              </td>
            </tr>
            <tr>
              <th>도메인분류명</th>
              <td>
                <div class="td-col">
                  {{ domainData.domainClassName }}
                </div>
              </td>
              <th>도메인그룹명</th>
              <td>
                <div class="td-col">
                  {{ domainData.domainGroupName }}
                </div>
              </td>
            </tr>
            <tr></tr>
            <tr>
              <th>논리데이터타입</th>
              <td colspan="3">
                <div class="td-col">{{ domainData.logicalDataTypeName }}</div>
              </td>
            </tr>
            <tr>
              <th rowspan="4">도메인설명</th>
              <td rowspan="4" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 50px"
                    v-model="domainData.explain"
                  ></textarea>
                </div>
              </td>
              <th>데이터허용값</th>
              <td>
                <div class="td-col">{{ domainData.dataPermissionValue }}</div>
              </td>
            </tr>
            <tr>
              <th>데이터단위명</th>
              <td>
                <div class="td-col">
                  {{ domainData.dataUnitName }}
                </div>
              </td>
            </tr>

            <tr>
              <th>저장형식</th>
              <td>
                <div class="td-col">
                  {{ domainData.storageFormatContext }}
                </div>
              </td>
            </tr>
            <tr>
              <th>표현방식</th>
              <td>
                <div class="td-col">
                  {{ domainData.expressionFormatContext }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ domainData.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ domainData.updateDateTime }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue';
  import { getTermDomainInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { storeToRefs } from 'pinia';

  const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  const domainData = reactive({
    domainName: '',
    domainGroupName: '',
    domainClassName: '',
    explain: '',
    enactInfo: '',
    revisionInfo: '',
    dataPermissionValue: '',
    dataUnitName: '',
    storageFormatContext: '',
    expressionFormatContext: '',
    logicalDataTypeName: '',
    updateDateTime: '',
    updater: '',
    relationCodeName: '',
    codeTypeName: '',
  });

  // 도메인 데이터 바인딩
  const bindingDomainData = (resultData) => {
    console.log('resultData ================', resultData);

    domainData.domainName = resultData.domainName; // 도메인명
    domainData.domainClassName = resultData.domainClassName; // 도메인 분류명
    domainData.domainGroupName = resultData.domainGroupName; // 도메인 그룹명
    domainData.logicalDataTypeName = resultData.logicalDataTypeName;
    domainData.explain = resultData.domaiExplain; // 도메인 설명
    domainData.revisionInfo = resultData.revisionDate; // 제개정일자
    domainData.dataPermissionValue = resultData.dataPermissionValue; // 데이터 허용값
    domainData.dataUnitName = resultData.dataUnitName; // 데이터 단위명
    domainData.storageFormatContext = resultData.storageFormatContext; // 저장형식
    domainData.expressionFormatContext = resultData.expressionFormatContext; // 표현형식
    domainData.updateDateTime = resultData.updateDateTime; // 최종 수정일시
    domainData.updater = resultData.updater; // 최종 수정자
  };

  // 도메인데이터 초기화
  const resetDomainData = () => {
    domainData.domainName = '';
    domainData.domainGroupName = '';
    domainData.domainClassName = '';
    domainData.explain = '';
    domainData.enactInfo = '';
    domainData.revisionInfo = '';
    domainData.dataPermissionValue = '';
    domainData.dataUnitName = '';
    domainData.storageFormatContext = '';
    domainData.expressionFormatContext = '';
    domainData.logicalDataTypeName = '';
    domainData.updateDateTime = '';
    domainData.updater = '';
  };

  watch(
    termViewSelectData,
    async (newVal) => {
      console.log('구성도메인 - termViewSelectData ===', newVal);

      if (!newVal) {
        resetDomainData();
        return;
      }

      const requestParams = {
        instituteId: newVal.instituteId,
        dictionaryId: newVal.dictionaryId,
        termName: newVal.termName[0].label,
        termAbbreviationName: newVal.termEngAbbreviationName,
        domainName: newVal.domainName,
      };

      const response = await getTermDomainInfo(requestParams);

      bindingDomainData(response);

      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);
    },
    { immediate: true }
  );
</script>
