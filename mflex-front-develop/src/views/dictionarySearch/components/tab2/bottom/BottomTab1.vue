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
              <th>단어명</th>
              <td>
                <div class="td-col">
                  <AppStateText v-model="wordBaseData.wordName" />
                </div>
              </td>
              <th>제개정일자</th>
              <td>
                <div class="td-col">{{ wordBaseData.revisonDate }}</div>
              </td>
            </tr>
            <tr>
              <th>단어영문약어명</th>
              <td>
                <div class="td-col">
                  {{ wordBaseData.wordAbbreviationName }}
                </div>
              </td>
              <th>단어영문명</th>
              <td>
                <div class="td-col">{{ wordBaseData.wordEnglishName }}</div>
              </td>
            </tr>
            <tr>
              <th>도메인분류명</th>
              <td>
                <div class="td-col">
                  {{ wordBaseData.domainClassName }}
                </div>
              </td>
              <th>단어유형명</th>
              <td>
                <div class="td-col">{{ wordBaseData.wordTypeName }}</div>
              </td>
            </tr>
            <tr></tr>

            <tr>
              <th rowspan="5">단어설명</th>
              <td rowspan="5" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 50px"
                    v-model="wordBaseData.wordExpln"
                  ></textarea>
                </div>
              </td>
            </tr>

            <tr>
              <th>이음동의어목록</th>
              <td>
                <div class="td-col">
                  {{ wordBaseData.synonymList }}
                </div>
              </td>
            </tr>
            <tr>
              <th>권장단어</th>
              <td>
                <div class="td-col">{{ wordBaseData.recommendWordName }}</div>
              </td>
            </tr>
            <tr>
              <th>권장영문약어명</th>
              <td>
                <div class="td-col">
                  {{ wordBaseData.recommendAbbreviationName }}
                </div>
              </td>
            </tr>
            <tr></tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ wordBaseData.updater }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ wordBaseData.updateDateTime }}</div>
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
  // import { getWordBaseInfo } from '@/utils/mflexApi/dictionarySearchApi';
  import { getWordBaseInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { storeToRefs } from 'pinia';

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { wordViewSelectData } = storeToRefs(useDictionarySearchStore());

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  // 사전ID
  const useDctnryId = userStngInfo.value.useDctnryId;

  const wordBaseData = reactive({
    wordName: {
      type: '',
      label: '',
      color: '',
      bgColor: '',
      size: 0,
    },
    wordAbbreviationName: '',
    wordEnglishName: '',
    wordForbiddenList: [],
    wordSynonymList: [],
    wordTypeName: '',
    domainInfo: {
      type: '',
      label: '',
      color: '',
      bgColor: '',
      size: 0,
    },
    wordExpln: '',
    // 유사어 구분
    wordSmilarWordDivNm: '',
    // 개정일자
    enactInfo: '',
    revisionInfo: '',
    updateDateTime: '',
    updater: '',
  });

  const selectedTab1Data = inject('selectedData');

  let wordBaseTemp;

  // watch([selectedTab1Data], async ([newTab1Value], [oldTab1Value]) => {
  //   // selectedTab1Data의 변화가 있을 경우

  //   if (newTab1Value == null) {
  //     wordBaseData.wordName.type = '';
  //     wordBaseData.wordName.label = '';
  //     wordBaseData.wordName.color = '';
  //     wordBaseData.wordName.bgColor = '';
  //     wordBaseData.wordName.size = 0;
  //     wordBaseData.wordAbbreviationName = '';
  //     wordBaseData.wordEnglishName = '';
  //     wordBaseData.wordTypeName = '';
  //     wordBaseData.domainInfo.type = '';
  //     wordBaseData.domainInfo.label = '';
  //     wordBaseData.domainInfo.color = '';
  //     wordBaseData.domainInfo.bgColor = '';
  //     wordBaseData.domainInfo.size = 0;
  //     wordBaseData.wordExpln = '';
  //     wordBaseData.wordSmilarWordDivNm = '';
  //     wordBaseData.wordSynonymList = [];
  //     wordBaseData.wordForbiddenList = [];
  //     wordBaseData.enactInfo = '';
  //     wordBaseData.revisionInfo = '';
  //     wordBaseData.updateDateTime = '';
  //     wordBaseData.updater = '';

  //     return;
  //   }

  //   if (newTab1Value !== oldTab1Value) {
  //     let wordBaseQuery;

  //     if (newTab1Value.data) {
  //       wordBaseQuery = {
  //         dictionaryId: useDctnryId,
  //         wordName: newTab1Value.data.wordName[0].label,
  //         wordAbbreviationName: newTab1Value.data.wordAbbreviationName,
  //       };
  //     } else {
  //       wordBaseQuery = {
  //         dictionaryId: useDctnryId,
  //         wordName: newTab1Value.wordName[0].label,
  //         wordAbbreviationName: newTab1Value.wordAbbreviationName,
  //       };
  //     }
  //     wordBaseTemp = await getWordBaseInfo(wordBaseQuery);
  //     console.log('wordBaseTemp ===============', wordBaseTemp);
  //     bindingWordBaseData(wordBaseTemp);
  //   }

  //   showAnimate.value = true;

  //   setTimeout(() => {
  //     showAnimate.value = false;
  //   }, 500);

  //   // onEventInput();
  // });

  // 단어 기본정보 바인딩
  const bindingWordBaseData = (wordBaseInfo) => {
    // 단어명
    wordBaseData.wordName.type = wordBaseInfo.dictionaryTypeName;
    wordBaseData.wordName.label = wordBaseInfo.wordName;
    wordBaseData.wordName.color =
      wordBaseInfo.dictionaryTypeForegroundColorName;
    wordBaseData.wordName.bgColor =
      wordBaseInfo.dictionaryTypeBackgroundColorName;
    wordBaseData.wordName.size = 60;

    wordBaseData.wordAbbreviationName = wordBaseInfo.wordAbbreviationName; // 단어 영문약어명
    wordBaseData.wordEnglishName = wordBaseInfo.wordEnglishName; // 단어 영문명
    wordBaseData.wordTypeName = wordBaseInfo.wordTypeName; // 단어 타입명
    wordBaseData.wordExpln = wordBaseInfo.wordExplain; // 단어 설명
    wordBaseData.recommendWordName = wordBaseInfo.recommendWordName; // 권장단어
    wordBaseData.recommendAbbreviationName =
      wordBaseInfo.recommendAbbreviationName;
    wordBaseData.domainClassName = wordBaseInfo.domainClassName; // 도메인 분류명
    wordBaseData.synonymList = wordBaseInfo.synonymList; // 이음동의어 목록
    wordBaseData.revisonDate = wordBaseInfo.revisionDate; // 제개정일자
    wordBaseData.updateDateTime = wordBaseInfo.updateDateTime; // 수정일시
    wordBaseData.updater = wordBaseInfo.updater; // 최종수정자
  };

  function extractBracketData(input) {
    // 입력값이 문자열이 아니면 null 반환
    if (typeof input !== 'string') {
      return null;
    }

    // 정규식을 사용하여 대괄호 안의 내용 추출
    const regex = /\[(.*?)\]/;
    const match = input.match(regex);

    // 매치된 결과가 있으면 첫 번째 그룹(대괄호 안의 내용) 반환
    if (match && match[1]) {
      return match[1];
    } else {
      return input;
    }
  }

  watch(wordViewSelectData, async (newVal) => {
    console.log('기본정보 조회 =============', newVal);

    let wordTypeCode;

    switch (newVal.wordTypeName) {
      case '일반어':
        wordTypeCode = 'GENERAL';
        break;
      case '분류어':
        wordTypeCode = 'CLASSIFICATION';
        break;
      case '이음동의어':
        wordTypeCode = 'SYNONYM';
        break;
      case '대체어':
        wordTypeCode = 'ALTERNATIVE';
        break;
      case '금칙어':
        wordTypeCode = 'PROHIBITIVE';
        break;
      default:
        wordTypeCode = newVal.wordTypeCode;
    }

    const requestParams = {
      instituteId: newVal.instituteId,
      dictionaryId: newVal.dictionaryId,
      wordName: newVal.wordName[0].label,
      wordAbbreviationName: extractBracketData(newVal.wordAbbreviationName),
      wordTypeCode: wordTypeCode,
    };

    const wordBaseInfo = await getWordBaseInfo(requestParams);

    bindingWordBaseData(wordBaseInfo);

    console.log('단어 기본정보 =============', wordBaseInfo);

    showAnimate.value = true;

    setTimeout(() => {
      showAnimate.value = false;
    }, 500);
  });
</script>
