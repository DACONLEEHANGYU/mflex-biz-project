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
              <th>통합코드한글명</th>
              <td colspan="3">
                <div class="td-col">
                  <AppStateText v-model="codeBaseData.unityCodeKoreaName" />
                </div>
              </td>
            </tr>
            <tr>
              <th>통합코드명</th>
              <td colspan="3">
                <div class="td-col">
                  {{ codeBaseData.unityCodeName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>통합코드유형</th>
              <td colspan="3">
                <div class="td-col">{{ codeBaseData.unityCodeTypeName }}</div>
              </td>
            </tr>
            <tr>
              <th>데이터타입</th>
              <td colspan="3">
                <div class="td-col">{{ codeBaseData.dataTypeName }}</div>
              </td>
            </tr>
            <tr>
              <th rowspan="2">통합코드설명</th>
              <td rowspan="2" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 50px"
                    v-model="codeBaseData.unityCodeExplain"
                  ></textarea>
                </div>
              </td>
              <th>관리부서</th>
              <td>
                <div class="td-col">
                  {{ codeBaseData.managementDepartmentName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>제개정일자</th>
              <td>
                <div class="td-col">{{ codeBaseData.revisionInfo }}</div>
              </td>
            </tr>
            <tr>
              <th>최종수정자정보</th>
              <td>
                <div class="td-col">{{ codeBaseData.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ codeBaseData.updateDateTime }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, inject, watch } from 'vue';
  import { getCodeBaseInfo } from '@/utils/mflexApi/dictionarySearchApi';

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  // 코드 기본정보 값

  const selectedTab1Data = inject('selectedData');
  const firstRowTab1Data = inject('first-row-selected');

  const codeBaseData = reactive({
    unityCodeName: '',
    unityCodeKoreaName: {
      type: '',
      label: '',
      color: '',
      bgColor: '',
      size: 0,
    },
    unityCodeTypeName: '',
    dataTypeName: '',
    unityCodeExplain: '',
    managementDepartmentName: '',
    enactInfo: '',
    revisionInfo: '',
    updateDateTime: '',
    updater: '',
  });

  let codeBaseTemp;

  watch(
    [selectedTab1Data, firstRowTab1Data],
    async ([newTab1Value], [oldTab1Value]) => {
      // selectedTab1Data의 변화가 있을 경우

      if (newTab1Value === null) {
        codeBaseData.unityCodeKoreaName.type = '';
        codeBaseData.unityCodeKoreaName.label = '';
        codeBaseData.unityCodeKoreaName.color = '';
        codeBaseData.unityCodeKoreaName.bgColor = '';
        codeBaseData.unityCodeKoreaName.size = 0;
        codeBaseData.unityCodeName = '';
        codeBaseData.unityCodeTypeName = '';
        codeBaseData.dataTypeName = '';
        codeBaseData.unityCodeExplain = '';
        codeBaseData.managementDepartmentName = '';
        codeBaseData.enactInfo = '';
        codeBaseData.revisionInfo = '';
        codeBaseData.updateDateTime = '';
        codeBaseData.updater = '';

        return;
      }

      if (newTab1Value !== oldTab1Value) {
        console.log('selectedTab1Data changed:', newTab1Value);

        let unityCodeBaseQuery;

        if (newTab1Value.data) {
          unityCodeBaseQuery = {
            unityCodeDictionaryId: newTab1Value.data.unityCodeDictionaryId,
            unityCodeName: newTab1Value.data.unityCodeName,
          };
        } else {
          unityCodeBaseQuery = {
            unityCodeDictionaryId: newTab1Value.unityCodeDictionaryId,
            unityCodeName: newTab1Value.unityCodeName,
          };
        }
        codeBaseTemp = await getCodeBaseInfo(unityCodeBaseQuery);
        console.log('codeBaseTemp ===============', codeBaseTemp);
        bindingWordBaseData(codeBaseTemp);
      }

      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);
    }
  );

  // 단어 기본정보 바인딩
  const bindingWordBaseData = (codeBaseTemp) => {
    const resultData = codeBaseTemp.data;
    console.log('resultData =================', resultData);

    // 통합코드명
    codeBaseData.unityCodeKoreaName.type =
      resultData.unityCode.dictionary.type.name;
    codeBaseData.unityCodeKoreaName.label = resultData.unityCode.koreanName;
    codeBaseData.unityCodeKoreaName.color =
      resultData.unityCode.dictionary.type.fontColor;
    codeBaseData.unityCodeKoreaName.bgColor =
      resultData.unityCode.dictionary.type.backgroundColor;
    codeBaseData.unityCodeKoreaName.size = 60;

    // 통합코드 한글명
    codeBaseData.unityCodeName = resultData.unityCode.name;

    // 통합코드 유형명
    codeBaseData.unityCodeTypeName = resultData.unityCode.typeName;
    // 데이터 타입
    codeBaseData.dataTypeName = resultData.dataTypeName;
    // 통합코드 설명
    codeBaseData.unityCodeExplain = resultData.unityCode.explain;
    codeBaseData.managementDepartmentName = resultData.managementDepartmentName;

    if (resultData.enactCycle == null) {
      resultData.enactCycle = '';
    }
    // 제정 정보
    codeBaseData.enactInfo = `${resultData.enactDate}(${resultData.enactCycle})`;

    // 개정 정보
    if (resultData.revisionCycle == null) {
      resultData.revisionCycle = '';
    }

    if (resultData.revisionCycle === null || resultData.revisionCycle === '') {
      codeBaseData.revisionInfo = `${resultData.revisionDate}`;
    } else {
      codeBaseData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
    }
    //codeBaseData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
    // 수정일시
    codeBaseData.updateDateTime = resultData.updateDateTime;
    // 최종수정자
    codeBaseData.updater = resultData.updater;
  };
</script>
