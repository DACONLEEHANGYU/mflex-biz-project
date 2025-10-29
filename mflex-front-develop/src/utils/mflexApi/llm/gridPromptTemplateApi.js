import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = 'api/v1';

const getCreateQuery = (searchInfo) => {
  const { gridId, query } = searchInfo;
  try {
    const result = $vxHttp.get(
      `${apiUrl}/${defaultUrl}/llm/grid-query?gridId=${gridId}&query=${query}`
    );

    return result;
  } catch (error) {
    console.log('Error in gridPromptTemplateApi', error);
  }
};

export { getCreateQuery };
