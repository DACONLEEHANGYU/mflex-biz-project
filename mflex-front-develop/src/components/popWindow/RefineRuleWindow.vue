<template>
  <div class="pop-window">
    <div class="window-header">컬럼한글명 검토/정제</div>
    <div class="window-body">
      <div class="title-s">
        컬럼한글명 정제 조건
        <AppTooltip
          :htmlContent="getTooltipById('columnKoreanNameRefineCondition')"
        >
        </AppTooltip>
      </div>
      <div class="filter-form">
        <div class="filter-section">
          <h3 class="section-title">한글명 정제 방법</h3>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                v-model="searchType"
                value="BATCH"
                class="radio-input"
              />
              <span>일괄작업</span>
            </label>
            <div v-if="searchType === 'BATCH'" class="description-text">
              <p>1. 용어사전에 조건하는 용어명 적용</p>
              <p>2. 사용빈도수가 가장 많은 결합한글명 적용</p>
            </div>
            <label class="radio-label">
              <input
                type="radio"
                v-model="searchType"
                value="MANUAL"
                class="radio-input"
              />
              <span>수작업</span>
            </label>
          </div>
        </div>

        <!-- 공백문자 제거 -->
        <div class="filter-section">
          <h3 class="section-title">공백문자 제거</h3>
          <div style="margin-bottom: 13px">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="includeSpace"
                class="checkbox-input"
              />
              <span>공백</span>
            </label>
          </div>
        </div>

        <!-- 특수문자 제거 -->
        <div class="filter-section">
          <h3 class="section-title">특수문자 제거</h3>
          <div style="margin-bottom: 13px">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="allChecked"
                class="checkbox-input"
              />
              <span>전체</span>
            </label>
          </div>
          <div class="special-chars-grid">
            <label
              v-for="(char, key) in specialChars"
              :key="key"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                v-model="specialChars[key].checked"
                class="checkbox-input"
              />
              <span>{{ char.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <!-- 버튼 영역 -->
      <div class="button-group">
        <button class="btn btn-apply" @click="onApply">정제실행</button>
        <button class="btn btn-cancel" @click="onCancel">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAlert } from '@/composables/alert';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import {
    getActualizingColumnCondition, // 컬럼한글명 정제조건 조회회
    updateActualizingColumnCondition, // 컬럼한글명 정제 조건 수정
    updateActualizingColumnBatch, // 컬럼한글명 정제(일괄)
  } from '@/utils/mflexApi/actualizing/actualizingApi';

  const { setAlertStatus } = useAlert();

  const emit = defineEmits(['confirm', 'close']);

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId, useInfoSysId, useDctnryId } = userStngInfo.value;

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  // 상태 정의
  const searchType = ref('BATCH');
  const includeSpace = ref(false);
  const allChecked = ref(false);
  const spaceAllChecked = ref(false);

  const specialChars = reactive({
    // all: { label: '전체', checked: false },
    comma: { label: ',（콤마）', checked: false },
    parentheses: { label: '.(점)', checked: false },
    singleQuote: { label: `'（따옴표）`, checked: false },
    doubleQuote: { label: '"（큰따옴표）', checked: false },
    colon: { label: ':（콜론）', checked: false },
    semicolon: { label: ';（세미콜론）', checked: false },
    plus: { label: '+', checked: false },
    equal: { label: '=', checked: false },
    question: { label: '?', checked: false },
    minus: { label: '-', checked: false },
    exclamation: { label: '!', checked: false },
    underscore: { label: '_', checked: false },
    tilde: { label: '~', checked: false },
    at: { label: '@', checked: false },
    hash: { label: '#', checked: false },
    dollar: { label: '$', checked: false },
    percent: { label: '%', checked: false },
    caret: { label: '^', checked: false },
    ampersand: { label: '&', checked: false },
    asterisk: { label: '*', checked: false },
    slash: { label: '/', checked: false },
    lessThan: { label: '<', checked: false },
    greaterThan: { label: '>', checked: false },
    backQuote: { label: '`（아래따옴표）', checked: false },
  });

  const spaceCheckList = reactive({
    space: { label: '공백', checked: false },
    tab: { label: '탭', checked: false },
    CR: { label: 'CR', checked: false },
    NL: { label: 'NL', checked: false },
  });

  // 이벤트 핸들러
  const onCancel = () => {
    // 취소 로직 구현
    searchType.value = 'general';
    includeSpace.value = false;
    Object.keys(specialChars).forEach((key) => {
      specialChars[key].checked = false;
    });
    emit('close');
  };

  // const onApply = async () => {
  //   const specialCharacterVo = {
  //     spaceYn: includeSpace.value,
  //     commaYn: specialChars.comma.checked,
  //     periodYn: specialChars.parentheses.checked,
  //     colonYn: specialChars.colon.checked,
  //     semicolonYn: specialChars.semicolon.checked,
  //     singleQuoteYn: specialChars.singleQuote.checked,
  //     doubleQuoteYn: specialChars.doubleQuote.checked,
  //     plusYn: specialChars.plus.checked,
  //     equalYn: specialChars.equal.checked,
  //     questionYn: specialChars.question.checked,
  //     hyphenYn: specialChars.minus.checked,
  //     exclamationYn: specialChars.exclamation.checked,
  //     underscoreYn: specialChars.underscore.checked,
  //     tildeYn: specialChars.tilde.checked,
  //     atYn: specialChars.at.checked,
  //     hashYn: specialChars.hash.checked,
  //     dollarYn: specialChars.dollar.checked,
  //     percentYn: specialChars.percent.checked,
  //     caretYn: specialChars.caret.checked,
  //     ampersandYn: specialChars.ampersand.checked,
  //     asteriskYn: specialChars.asterisk.checked,
  //     slashYn: specialChars.slash.checked,
  //     angleBracketOpenYn: specialChars.lessThan.checked,
  //     angleBracketCloseYn: specialChars.greaterThan.checked,
  //     backtickYn: specialChars.backQuote.checked,
  //   };

  //   const result = {
  //     instituteId: useMetaMngInstId,
  //     informationSystemId: useInfoSysId,
  //     refinedDivisionCode: searchType.value.toUpperCase(),
  //     specialCharacterVo,
  //   };

  //   console.log('필터 적용:', result);

  //   const response = await updateActualizingColumnCondition(result);

  //   console.log('updateActualizingColumnCondition response : ', response);

  //   // 오류 처리
  //   if (response.status != 200) {
  //     if (response.data.code === 1031) {
  //       setAlertStatus({
  //         view: true,
  //         message: '특수문자 제거 조건이 없습니다. 조건을 설정해주세요.',
  //       });
  //       return;
  //     } else {
  //       setAlertStatus({
  //         view: true,
  //         message: '정제조건 저장시 오류가 발생하였습니다.',
  //       });
  //       return;
  //     }
  //   } else {
  //     const response = await onRefine(); // 정제 실행
  //     emit('confirm', response);
  //   }
  // };

  const onApply = async () => {
    // 현재 UI 상태로 객체 생성
    const specialCharacterVo = {
      spaceYn: includeSpace.value,
      commaYn: specialChars.comma.checked,
      periodYn: specialChars.parentheses.checked,
      colonYn: specialChars.colon.checked,
      semicolonYn: specialChars.semicolon.checked,
      singleQuoteYn: specialChars.singleQuote.checked,
      doubleQuoteYn: specialChars.doubleQuote.checked,
      plusYn: specialChars.plus.checked,
      equalYn: specialChars.equal.checked,
      questionYn: specialChars.question.checked,
      hyphenYn: specialChars.minus.checked,
      exclamationYn: specialChars.exclamation.checked,
      underscoreYn: specialChars.underscore.checked,
      tildeYn: specialChars.tilde.checked,
      atYn: specialChars.at.checked,
      hashYn: specialChars.hash.checked,
      dollarYn: specialChars.dollar.checked,
      percentYn: specialChars.percent.checked,
      caretYn: specialChars.caret.checked,
      ampersandYn: specialChars.ampersand.checked,
      asteriskYn: specialChars.asterisk.checked,
      slashYn: specialChars.slash.checked,
      angleBracketOpenYn: specialChars.lessThan.checked,
      angleBracketCloseYn: specialChars.greaterThan.checked,
      backtickYn: specialChars.backQuote.checked,
    };

    console.log('rawConditionSet : ', rawConditionSet.value);

    // 현재 요청 객체 생성
    const currentCondition = {
      refinedDivisionCode: searchType.value.toUpperCase(),
      specialCharacterVo,
    };

    // 변경 여부 확인 함수
    const hasChanges = () => {
      // 타입이 변경되었는지 확인
      if (
        rawConditionSet.value.refinedDivisionCode !==
        currentCondition.refinedDivisionCode
      ) {
        return true;
      }

      // 특수문자 설정이 변경되었는지 확인
      const originalChars = rawConditionSet.value.specialCharacterVo;
      const currentChars = specialCharacterVo;

      for (const key in currentChars) {
        if (originalChars[key] !== currentChars[key]) {
          return true;
        }
      }

      return false;
    };

    // 변경된 사항이 있을 때만 API 호출
    if (hasChanges()) {
      const result = {
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        refinedDivisionCode: searchType.value.toUpperCase(),
        specialCharacterVo,
      };

      const response = await updateActualizingColumnCondition(result);

      console.log('updateActualizingColumnCondition response : ', response);

      // 오류 처리
      if (response.status != 200) {
        if (response.data.code === 1031) {
          setAlertStatus({
            view: true,
            message: '특수문자 제거 조건이 없습니다. 조건을 설정해주세요.',
          });
          return;
        } else {
          setAlertStatus({
            view: true,
            message: '정제조건 저장시 오류가 발생하였습니다.',
          });
          return;
        }
      } else {
        // 성공 시 rawConditionSet 업데이트
        rawConditionSet.value = { ...result };
        const response = await onRefine(); // 정제 실행
        emit('confirm', response);
      }
    } else {
      console.log('변경사항 없음, 정제만 실행');
      // 변경사항이 없으면 정제만 실행
      const response = await onRefine();
      emit('confirm', response);
    }
  };

  // 정제 실행
  const onRefine = async () => {
    const data = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      informationSystemId: useInfoSysId,
    };

    const response = await updateActualizingColumnBatch(data);
    console.log('updateActualizingColumnBatch response : ', response);
    // 재조회
    // if (response.status === 200) {
    //   fetchData();
    // } else {
    //   alert('컬럼정제 오류');
    // }
  };

  // 정제조건 raw
  const rawConditionSet = ref(null);

  onMounted(async () => {
    const data = {
      instituteId: useMetaMngInstId,
      informationSystemId: useInfoSysId,
    };
    const conditionSet = await getActualizingColumnCondition(data);

    console.log('conditionSet : ', conditionSet);
    rawConditionSet.value = conditionSet;

    // searchType 바인딩 (BATCH -> general, MANUAL -> manual)
    searchType.value = conditionSet.refinedDivisionCode;

    // 공백 체크 상태 바인딩
    // spaceCheckList.space.checked = conditionSet.specialCharacterVo.spaceYn;
    includeSpace.value = conditionSet.specialCharacterVo.spaceYn;

    // 특수문자 체크 상태 바인딩
    const specialCharMapping = {
      comma: 'commaYn',
      parentheses: 'periodYn',
      colon: 'colonYn',
      semicolon: 'semicolonYn',
      singleQuote: 'singleQuoteYn',
      doubleQuote: 'doubleQuoteYn',
      plus: 'plusYn',
      equal: 'equalYn',
      question: 'questionYn',
      minus: 'hyphenYn',
      exclamation: 'exclamationYn',
      underscore: 'underscoreYn',
      tilde: 'tildeYn',
      at: 'atYn',
      hash: 'hashYn',
      dollar: 'dollarYn',
      percent: 'percentYn',
      caret: 'caretYn',
      ampersand: 'ampersandYn',
      asterisk: 'asteriskYn',
      slash: 'slashYn',
      lessThan: 'angleBracketOpenYn',
      greaterThan: 'angleBracketCloseYn',
      backQuote: 'backtickYn',
    };

    // 각 특수문자 체크 상태 설정
    Object.entries(specialCharMapping).forEach(([key, apiKey]) => {
      if (specialChars[key]) {
        specialChars[key].checked = conditionSet.specialCharacterVo[apiKey];
      }
    });

    // 모든 특수문자가 체크되어 있는지 확인하여 'all' 체크박스 상태 설정
    const isAllChecked = Object.values(specialCharMapping).every(
      (apiKey) => conditionSet.specialCharacterVo[apiKey]
    );
    allChecked.value = isAllChecked;
  });

  // all 체크박스 상태 감시
  watch(
    () => allChecked.value,
    (newValue) => {
      // all을 제외한 모든 키에 대해 체크 상태 변경
      Object.keys(specialChars).forEach((key) => {
        if (key !== 'all') {
          specialChars[key].checked = newValue;
        }
      });
    }
  );

  // spaceAllChecked 체크박스 상태 감시
  watch(
    () => spaceAllChecked.value,
    (newValue) => {
      // spaceAllChecked를 제외한 모든 키에 대해 체크 상태 변경
      Object.keys(spaceCheckList).forEach((key) => {
        if (key !== 'spaceAllChecked') {
          spaceCheckList[key].checked = newValue;
        }
      });
    }
  );
</script>

<style scoped>
  .title-s {
    font-size: 15px;
    font-weight: 600;
    height: 29px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .filter-form {
    background: white;
    border-radius: 8px;
    max-width: 800px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 5px;
    border: 1px solid #eee;
  }

  .filter-section {
    border-bottom: 1px solid #eee;
    padding: 10px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #222b9f;
  }

  .radio-group,
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .radio-label,
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 16px;
  }

  .description-text {
    margin-left: 24px;
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  }

  .special-chars-grid {
    font-size: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-right: 22px;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    border: none;
  }

  .btn-cancel {
    background-color: #f1f1f1;
    color: #333;
  }

  .btn-apply {
    background-color: #2a9d8f;
    color: white;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .radio-input,
  .checkbox-input {
    zoom: 1.5;
    margin: 0;
    cursor: pointer;
  }
</style>
