<template>
  <div class="input-wrap" style="height: 400px">
    <div class="input-customization">
      <div class="input-row">
        <div class="input-title">조건식(Where)</div>
        <div class="input-content">
          <textarea
            style="height: 160px"
            v-model="gridFilterData.gridConditionExp"
          ></textarea>
        </div>
      </div>
      <div class="input-row">
        <div class="input-title">정렬(Order by)</div>
        <div class="input-content">
          <textarea
            style="height: 160px"
            v-model="gridFilterData.gridSortOrderExp"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { $vxHttp } from '@/api';

  export default {
    components: {},
    props: {
      filterGridDefs: {
        type: Object,
        default: () => {},
      },
    },

    data() {
      return {
        context: null,
        windowView: false,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
        this.windowView = true;
      },
      onCloseWindow() {
        this.windowView = false;
        this.selectedRow = {};
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const authStore = useAuthStore();
      const { userInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      const gridFilterData = reactive({
        gridConditionExp: '',
        gridSortOrderExp: '',
      });

      //사용자의 조건식과 정렬 데이터를 가져오는 함수
      /* const getGridUserFilter = async () => {
        const userGridFilterParamData = {
          paramGridId: props.filterGridDefs.scrnGridId,
          paramUserId: userId,
        };

        const popGridFilterData = await $vxHttp.post(
          `${apiUrl}/grid/user/grdFlter`,
          userGridFilterParamData
        );
        try {
          console.log(
            'popGridFilterData : ',
            popGridFilterData.data.gridFlterInfo
          );
          if (popGridFilterData.data.rsltCd === '200') {
            const rsltFilterData = popGridFilterData.data.gridFlterInfo;
            gridFilterData.gridConditionExp = rsltFilterData.cndexpCn;
            gridFilterData.gridSortOrderExp = rsltFilterData.srtordCn;
          } else {
            console.log('Result Error : ', popGridFilterData.data.rsltMsg);
          }
        } catch (error) {
          console.error('Error fetching word info:', error);
          // 에러 처리 로직
        }
      };

      getGridUserFilter(); */

      const sendFlterDataToBackend = async () => {
        try {
          const gridUserFilterSetData = {
            paramGridId: props.filterGridDefs.scrnGridId,
            paramUserId: userId,
            paramUserNm: userNm,
            paramCndexpCn: gridFilterData.gridConditionExp,
            paramSrtordCn: gridFilterData.gridSortOrderExp,
          };

          const searchQuery = gridFilterData.gridConditionExp;
          const orderQuery = gridFilterData.gridSortOrderExp;

          const filterSet = {
            searchQuery: searchQuery,
            orderQuery: orderQuery,
            result: 'Y',
          };

          return filterSet;

          /*  const response = await $vxHttp.post(
            `${apiUrl}/grid/user/setGrdFlter`,
            gridUserFilterSetData
          );
          console.log('서버 응답:', response.data);
          if (response.data.rsltCd === '200') {
            return 'Y';
          } else {
            return 'N';
          } */
        } catch (error) {
          console.error('데이터 전송 중 에러 발생:', error);
        }
      };

      // 리스트 갯수 셀렉트
      return {
        gridFilterData,
        sendFlterDataToBackend,
      };
    },
  };
</script>
