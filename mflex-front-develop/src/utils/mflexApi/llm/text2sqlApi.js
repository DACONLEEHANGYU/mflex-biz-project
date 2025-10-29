import { $vxHttp } from '@/api';
import { $vxSocket } from '@/api/webSocket';

const apiUrl = import.meta.env.VITE_APP_API_URL;

const text2sqlApi = async (data) => {
  const response = await $vxHttp.post(
    'https://rnd.dacon.kr/api/sql/generate',
    data,
    {
      headers: {
        'SQL-Authorization': 'Bearer dacon', // Authorization 헤더 추가
      },
    }
  );
  return response.data;
};

const getInitWebSocket = () => {
  const response = $vxHttp.post('https://rnd.dacon.kr:443/api/v1/sql/init');

  console.log('getInitWebSocket : ', response);

  return response;
};

const generateSql = async (data) => {
  const querys = {
    query: data.query,
    dbtype: 'PostgreSQL',
  };

  const response = await $vxHttp.post(
    `https://rnd.dacon.kr:443/api/v1/sql/generate/${data.channelId}`,
    querys
  );

  return response;
};

export { text2sqlApi, getInitWebSocket, generateSql };
