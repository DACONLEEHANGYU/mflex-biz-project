import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1';

/*
  API 명 : 사용자별 Grid 세팅 조회
 */
const getUserGridSetting = async (gridId) => {
  try {
    const result = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/private/grid/${gridId}?isDefault=false`,
      {
        skipSpinner: true,
      }
    );
    return result.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/*
  API 명 : 그리드 기본값 조회
*/
const getGridDefaultData = async (gridId) => {
  try {
    const result = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/private/grid/${gridId}?isDefault=true`,
      { skipSpinner: true }
    );
    return result.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/*
  API 명 : 사용자별 Grid 세팅 설정
*/
const setUserGridSetting = async (gridId, gridSetting) => {
  try {
    const result = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/private/grid/${gridId}`,
      gridSetting,
      { skipSpinner: true }
    );
    return result.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

// 헤더 UI 변경
const updateHeaderStyle = (isSwipperActive) => {
  const header = document.querySelector('.header');

  if (isSwipperActive) {
    header.style.height = '84px';
  } else {
    header.style.height = '52px';
  }
};

export {
  getUserGridSetting, // 사용자별 Grid 세팅 조회
  getGridDefaultData, // 그리드 기본값 조회
  setUserGridSetting, // 사용자별 Grid 세팅 설정
  updateHeaderStyle, // 헤더 UI 변경
};
