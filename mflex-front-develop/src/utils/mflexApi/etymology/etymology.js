import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v2/etymology';

/**
 * API 명 : 어원 분리
 */
const etymologyDecompose = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/decompose`,
      data, // { headers: { 'Content-Type': 'application/json' } },
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 용어 어원 조회
 */
const etymologySearch = async (data) => {
  const { koreanLable, description, instituteId, dictionaryId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term?korean-term=${koreanLable}&` +
        `description=${description}&` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}`,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
      // { skipSpinner: false }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 단어 어원 조회
 */
const etymologySearchWord = async (data) => {
  const { koreanLable, description, instituteId, dictionaryId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word?korean-word=${koreanLable}&` +
        `description=${description}&` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}`,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

export { etymologyDecompose, etymologySearch, etymologySearchWord };
