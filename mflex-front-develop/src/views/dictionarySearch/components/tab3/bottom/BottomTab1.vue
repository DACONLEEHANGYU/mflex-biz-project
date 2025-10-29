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
                  <AppStateText v-model="domainBaseData.domainName" />
                </div>
              </td>
              <th>제개정일자</th>
              <td>
                <div class="td-col">{{ domainBaseData.revisionDate }}</div>
              </td>
            </tr>
            <tr>
              <th>도메인분류명</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.domainClassName }}
                </div>
              </td>
              <th>도메인그룹명</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.domainGroupName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>논리데이터타입</th>
              <td colspan="3">
                <div class="td-col">
                  {{ domainBaseData.logicalDataTypeName }}
                </div>
              </td>
            </tr>
            <tr>
              <th rowspan="4">도메인 설명</th>
              <td rowspan="4" class="pd0">
                <div class="td-col">
                  <textarea
                    readonly
                    style="height: 50px"
                    v-model="domainBaseData.explain"
                  ></textarea>
                </div>
              </td>
              <th>데이터허용값</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.dataPermissionValue }}
                </div>
              </td>
            </tr>
            <tr>
              <th>데이터단위명</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.dataUnitName }}
                </div>
              </td>
            </tr>
            <tr>
              <th>저장형식</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.storageFormatContent }}
                </div>
              </td>
            </tr>
            <tr>
              <th>표현형식</th>
              <td>
                <div class="td-col">
                  {{ domainBaseData.expressionFormatContent }}
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ domainBaseData.updater }}</div>
              </td>

              <th>최종 수정일시</th>
              <td>
                <div class="td-col">{{ domainBaseData.updateDateTime }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { getDomainBaseInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { storeToRefs } from 'pinia';

  const authStore = useAuthStore();
  const { domainViewSelectData } = storeToRefs(useDictionarySearchStore());

  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

  // 데이터 변경 애니메이션 상태
  const showAnimate = ref(false);

  const domainBaseData = reactive({
    // 도메인명
    domainName: {
      type: '',
      label: '',
      bgColor: '',
      color: '',
      size: 60,
    },
    domainGroupName: '', // 도메인 그룹명
    domainClassName: '', // 도메인 분류명
    explain: '', // 도메인 설명
    logicalDataTypeName: '', // 논리데이터타입명
    dataUnitName: '', // 데이터 단위명
    dataPermissionValue: '', // 데이터 허용값
    storageFormatContent: '', // 저장형식 내용
    expressionFormatContent: '', // 표현형식 내용
    revisionDate: '', // 개정정보
    updater: '', // 최종 수정자 정보
    updateDateTime: '', // 최종 수정일시
  });

  // 도메인 기본정보 바인딩
  const bindingDomainBaseData = (resultData) => {
    console.log('bindingDomainBaseData : ', resultData);

    // 도메인명
    domainBaseData.domainName.type = resultData.dictionaryTypeName;
    domainBaseData.domainName.label = resultData.domainName;
    domainBaseData.domainName.color =
      resultData.dictionaryTypeForegroundColorName;
    domainBaseData.domainName.bgColor =
      resultData.dictionaryTypeBackgroundColorName;
    domainBaseData.domainName.size = 60;

    domainBaseData.domainGroupName = resultData.domainGroupName; // 도메인 그룹명
    domainBaseData.domainClassName = resultData.domainClassName; // 도메인 분류명
    domainBaseData.explain = resultData.domainExplain; // 도메인 설명
    domainBaseData.logicalDataTypeName = resultData.logicalDataTypeName; // 논리데이터타입명
    domainBaseData.dataUnitName = resultData.dataUnitName; // 데이터 단위명
    domainBaseData.dataPermissionValue = resultData.dataPermissionValue; // 데이터 허용값
    domainBaseData.storageFormatContent = resultData.storageFormatContent; // 저장형식 내용
    domainBaseData.expressionFormatContent = resultData.expressionFormatContent; // 표현형식 내용
    domainBaseData.revisionDate = resultData.revisionDate; // 제정일자
    domainBaseData.updateDateTime = resultData.updateDateTime; // 수정일시
    domainBaseData.updater = resultData.updater; // 최종수정자
  };

  const resetDomainBaseData = () => {
    domainBaseData.domainName.type = '';
    domainBaseData.domainName.label = '';
    domainBaseData.domainName.color = '';
    domainBaseData.domainName.bgColor = '';
    domainBaseData.domainName.size = 60;

    domainBaseData.domainGroupName = ''; // 도메인 그룹명
    domainBaseData.domainClassName = ''; // 도메인 분류명
    domainBaseData.explain = ''; // 도메인 설명
    domainBaseData.logicalDataTypeName = ''; // 논리데이터타입명
    domainBaseData.dataUnitName = ''; // 데이터 단위명
    domainBaseData.dataPermissionValue = ''; // 데이터 허용값
    domainBaseData.storageFormatContent = ''; // 저장형식 내용
    domainBaseData.expressionFormatContent = ''; // 표현형식 내용
    domainBaseData.revisionDate = ''; // 제정일자
    domainBaseData.updateDateTime = ''; // 수정일시
    domainBaseData.updater = ''; // 최종수정자
  };

  watch(
    () => domainViewSelectData.value,
    async (newVal) => {
      console.log('domainViewSelectData : ', newVal);

      if (newVal) {
        const requestParams = {
          instituteId: useMetaMngInstId,
          dictionaryId: newVal.dictionaryId,
          domainName: newVal.domainName[0].label,
        };

        const domainBaseInfo = await getDomainBaseInfo(requestParams);

        console.log('domainBaseInfo : ', domainBaseInfo);

        bindingDomainBaseData(domainBaseInfo);

        showAnimate.value = true;
        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      } else {
        resetDomainBaseData();
      }
    }
    // {
    //   immediate: true,
    // }
  );
</script>
