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
              <th>용어명</th>
              <td>
                <div class="td-col">
                  <AppStateText v-model="termBaseData.termName" />
                </div>
              </td>
              <th>제개정일자</th>
              <td>
                <div class="td-col">{{ termBaseData.revisionInfo }}</div>
              </td>
            </tr>
            <tr>
              <th>용어영문약어명</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.abbreviationName }}
                </div>
              </td>
              <th>용어영문명</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.englishName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>용어유형명</th>
              <td>
                <div class="td-col">{{ termBaseData.typeName }}</div>
              </td>
              <th>표준구분</th>
              <td>
                <div class="td-col">{{ termBaseData.termStandardYnName }}</div>
              </td>
            </tr>
            <tr>
              <th>도메인명</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.domainName }}
                </div>
              </td>
              <th>비표준사유</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.nonStandardReasonName }}
                </div>
              </td>
            </tr>
            <tr>
              <th rowspan="4">용어설명</th>
              <td rowspan="4" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 50px"
                    v-model="termBaseData.explain"
                  ></textarea>
                </div>
              </td>
              <th>코드유형</th>
              <td>
                <div class="td-col">{{ termBaseData.codeTypeName }}</div>
              </td>
            </tr>
            <tr>
              <th>코드명</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.relationCode }}
                </div>
              </td>
            </tr>
            <tr>
              <th>업무분야명</th>
              <td>
                <div class="td-col">{{ termBaseData.taskFieldName }}</div>
              </td>
            </tr>
            <tr>
              <th>관리부서명</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.managementDepartmentName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ termBaseData.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">
                  {{ termBaseData.updateDateTime }}
                </div>
              </td>
            </tr>
            <tr></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch, onActivated } from 'vue';
  import { storeToRefs } from 'pinia';
  import { getTermBaseInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';

  const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  const termBaseData = reactive({
    termName: {
      type: '',
      label: '',
      color: '',
      bgColor: '',
      size: 60,
    },
    domainName: '',
    relationCode: '',
    typeName: '',
    explain: '',
    abbreviationName: '',
    englishName: '',
    codeTypeName: '',
    dataPermissionValue: '',
    dataUnitName: '',
    enactCycle: '',
    enactDate: '',
    expressionFormatContext: '',
    managementDepartmentName: '',
    revisionCycle: '',
    revisionDate: '',
    revisionInfo: '',
    storageFormatContext: '',
    taskFieldName: '',
    updateDateTime: '',
    updater: '',
  });

  // 선택 데이터 감지
  watch(termViewSelectData, async (newVal) => {
    console.log('termViewSelectData ==============', newVal);

    // 초기화
    if (!newVal) {
      resetTermBaseInfo();
      return;
    } else {
      const requestParams = {
        instituteId: newVal.instituteId,
        dictionaryId: newVal.dictionaryId,
        termName: newVal.termName[0].label,
        termAbbreviationName: newVal.termEngAbbreviationName,
        termStandardYn: newVal.termStandardYnName === '표준' ? 'Y' : 'N',
        domainName: newVal.domainName,
      };

      const response = await getTermBaseInfo(requestParams);

      console.log('getTermBaseInfo', response);

      bindTermBaseInfo(response);
    }

    showAnimate.value = true;

    setTimeout(() => {
      showAnimate.value = false;
    }, 500);
  });

  const bindTermBaseInfo = async (termBaseInfo) => {
    try {
      const resultData = termBaseInfo;
      console.log('resultData ==============', resultData);

      // 용어 정보
      termBaseData.termName.type = resultData.dictionaryTypeName;
      termBaseData.termName.label = resultData.termName;
      termBaseData.termName.bgColor =
        resultData.dictionaryTypeBackgroundColorName;
      termBaseData.termName.color =
        resultData.dictionaryTypeForegroundColorName;
      termBaseData.termName.size = 60;

      // 도메인 정보
      termBaseData.domainName = resultData.domainName;

      // 연관 코드 정보
      termBaseData.relationCode = resultData.relationCodeName;

      termBaseData.typeName = resultData.termTypeName;
      termBaseData.explain = resultData.termExplain;
      termBaseData.abbreviationName = resultData.termAbbreviationName;
      termBaseData.englishName = resultData.termEnglishName;
      termBaseData.codeTypeName = resultData.codeTypeName;

      termBaseData.managementDepartmentName =
        resultData.managementDepartmentName;
      termBaseData.nonStandardReasonName = resultData.nonStandardReasonName;
      termBaseData.discardYn = resultData.discardYn;
      termBaseData.termStandardYnName = resultData.termStandardYnName;
      termBaseData.revisionCycle = resultData.revisionCycle;
      termBaseData.revisionDate = resultData.revisionDate;

      termBaseData.revisionInfo = `${resultData.revisionDate}`;

      termBaseData.storageFormatContext = resultData.storageFormatContext;
      termBaseData.taskFieldName = resultData.taskFieldName;
      termBaseData.updateDateTime = resultData.updateDateTime;
      termBaseData.updater = resultData.updater;
    } catch (error) {
      console.error(error);
    }
  };

  // 초기화
  const resetTermBaseInfo = () => {
    termBaseData.termName.type = '';
    termBaseData.termName.label = '';
    termBaseData.termName.bgColor = '';
    termBaseData.termName.color = '';
    termBaseData.termName.size = '';

    // 도메인 정보
    termBaseData.domainName = '';

    // 연관 코드 정보
    termBaseData.relationCode = '';

    termBaseData.typeName = '';
    termBaseData.explain = '';
    termBaseData.abbreviationName = '';
    termBaseData.englishName = '';
    termBaseData.codeTypeName = '';

    termBaseData.managementDepartmentName = '';
    termBaseData.nonStandardReasonName = '';
    termBaseData.discardYn = '';
    termBaseData.termStandardYnName = '';
    termBaseData.revisionCycle = '';
    termBaseData.revisionDate = '';

    termBaseData.revisionInfo = '';

    termBaseData.storageFormatContext = '';
    termBaseData.taskFieldName = '';
    termBaseData.updateDateTime = '';
    termBaseData.updater = '';
  };

  onActivated(() => {
    console.log('termBase onActivated ==========================');
  });
</script>
