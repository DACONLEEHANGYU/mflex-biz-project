import { ref, computed } from 'vue';
import { patchChangeColumn } from '@/utils/mflexApi/dataMng/schemaOptionsApi'; // 실제 API 함수로 변경하세요
import { schema } from './mflexApi/loginApi';
// import {
//   updateColumnSettings, // API 함수 예시 - 실제 API 함수명으로 변경하세요
// } from '@/utils/mflexApi/actualizing/actualizingApi';

export default {
  template: `
    <div class="cell-box" style="display: flex; justify-content: center; align-items: center; height: 100%; margin-top:5px;">
      <input 
        type="checkbox" 
        :id="checkboxId"
        :checked="isChecked" 
        @change="handleCheckboxChange"
        class="ag-grid-custom-checkbox"
        :style="checkboxStyle"        
      />
      <label :for="checkboxId" class="custom-checkbox-label"></label>      
    </div>
  `,
  setup(props, { emit }) {
    // 각 셀에 고유한 ID 생성
    const checkboxId = `check-${props.params.node.id}`;

    const isChecked = ref(
      props.params.value === true || props.params.value === 'true'
    );

    // console.log('props.params', props.params);

    const isLoading = ref(false);

    // 커스텀 체크박스 스타일
    const checkboxStyle = computed(() => ({
      width: '16px',
      height: '16px',
      appearance: 'none',
      border: '1px solid #908CAB',
      borderRadius: '3px',
      backgroundColor: 'transparent', // 배경색 제거
      cursor: 'pointer',
      position: 'relative',
      outline: 'none',
      transition: 'all 0.2s ease',
      opacity: isLoading.value ? 0.6 : 1,
      // 체크 마크 스타일 (붉은색)
      ...(isChecked.value && {
        borderColor: '#dc3545', // 체크된 상태에서도 붉은색 테두리 유지
        backgroundColor: 'transparent', // 배경색 여전히 투명
        border: '1px solid #dc3545', // 붉은색 테두리
        backgroundImage: `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M13.5 4.5L6 12L2.5 8.5' stroke='%23b91c1c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
        backgroundSize: '12px 12px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }),
    }));
    const handleCheckboxChange = async (event) => {
      // if (isLoading.value) return; // 로딩 중이면 중복 호출 방지

      const checked = event.target.checked;
      const originalValue = isChecked.value;

      // UI 즉시 업데이트
      isChecked.value = checked;
      isLoading.value = true;

      // 현재 행의 모든 데이터 가져오기
      const rowData = props.params.data;
      const fieldName = props.params.colDef.field;

      console.log('props.params', props.params);
      console.log('rowData check:', rowData);

      // fieldName과 실제 API 필드명 매핑
      const fieldMapping = {
        encryptYn: 'encryptYn', // 암호화여부
        releaseYn: 'releaseYn', // 공개여부
        privacyYn: 'privacyYn', // 개인정보여부
      };

      // 실제 API에서 사용할 필드명
      const apiFieldName = fieldMapping[fieldName] || fieldName;

      console.log('체크박스 변경 데이터:', {
        rowData: rowData,
        fieldName: fieldName,
        apiFieldName: apiFieldName,
        oldValue: originalValue,
        newValue: checked,
        instituteId: rowData.instituteId,
        informationSystemId: rowData.informationSystemId,
        databaseId: rowData.databaseId,
        columnName: rowData.columnName,
      });

      // 기본 API 데이터 구성
      const apiData = {
        instituteId: rowData.instituteId,
        databaseId: rowData.databaseId,
        table: rowData.table,
        column: rowData.originalColumnName,
        columnExplain: rowData.columnExplain,
        schemaName: rowData.schemaName, // 스키마 이름 추가
        // 기존 값들을 유지하면서 변경된 필드만 업데이트
        privacyYn: rowData.privacyYn ? rowData.privacyYn : false,
        encryptYn: rowData.encryptYn ? rowData.encryptYn : false,
        releaseYn: rowData.releaseYn ? rowData.releaseYn : false,
      };

      // 변경된 필드만 업데이트
      if (apiFieldName === 'privacyYn') {
        apiData.privacyYn = checked;
      } else if (apiFieldName === 'encryptYn') {
        apiData.encryptYn = checked;
      } else if (apiFieldName === 'releaseYn') {
        apiData.releaseYn = checked;
      }

      console.log('API 호출 데이터:', apiData);
      console.log(`${fieldName} -> ${apiFieldName} 필드가 ${checked}로 변경됨`);

      // 그리드 데이터 즉시 업데이트 (API 호출 전)
      // props.params.node.setDataValue(fieldName, checked);

      // 실제 rowData 객체도 업데이트 (API 필드명으로)
      if (apiFieldName === 'privacyYn') {
        rowData.privacyYn = checked;
      } else if (apiFieldName === 'encryptYn') {
        rowData.encryptYn = checked;
      } else if (apiFieldName === 'releaseYn') {
        rowData.releaseYn = checked;
      }

      // 성공 이벤트 발생
      emit('cellValueChanged', {
        rowData: rowData,
        fieldName: fieldName,
        apiFieldName: apiFieldName,
        checked: checked,
        success: true,
        apiData: apiData,
      });

      isLoading.value = false;

      // API 호출 예시 - 실제 API 함수로 변경하세요
      const response = await patchChangeColumn(apiData);

      console.log('API 응답:', response);

      // try {
      //   const response = await updateColumnSettings(apiData);
      //   console.log('API 응답:', response);

      //   if (response.status === 200 || response.success) {
      //     console.log(`${fieldName} 업데이트 성공:`, checked);
      //   } else {
      //     throw new Error(response.message || 'API 호출 실패');
      //   }
      // } catch (error) {
      //   console.error('체크박스 업데이트 오류:', error);
      //
      //   // 실패 시 원래 값으로 되돌리기
      //   isChecked.value = originalValue;
      //   props.params.node.setDataValue(fieldName, originalValue);
      //
      //   // rowData도 원래 값으로 되돌리기
      //   if (apiFieldName === 'privacyYn') {
      //     rowData.privacyYn = originalValue;
      //   } else if (apiFieldName === 'encryptYn') {
      //     rowData.encryptYn = originalValue;
      //   } else if (apiFieldName === 'releaseYn') {
      //     rowData.releaseYn = originalValue;
      //   }
      //
      //   alert(`업데이트 실패: ${error.message || '알 수 없는 오류'}`);
      // } finally {
      //   isLoading.value = false;
      // }
    };

    return {
      checkboxId,
      isChecked,
      isLoading,
      checkboxStyle,
      handleCheckboxChange,
    };
  },
};
