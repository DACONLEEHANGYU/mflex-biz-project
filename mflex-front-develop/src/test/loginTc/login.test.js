import { describe, it, expect } from '@jest/globals';
import axios from 'axios';

const apiUrl = 'http://localhost:9090';

// Axios의 post 메서드를 spyOn
const axiosPostSpy = jest.spyOn(axios, 'post');

describe('API 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //setInterceptors(axios); // Axios에 인터셉터 설정

  const rowUserInfo = {
    userId: 'admin',
    userName: '관리자',
    jbgNm: '과장',
    ogdpInstNm: '정부',
  };

  describe('로그인 API 테스트', () => {
    it('id 비밀번호가 일치했을 때 로그인 성공', async () => {
      const logInfo = {
        loginId: 'admin',
        loginPswd: '1234',
      };

      /*   // 예상대로 호출되는지 확인하기 위해 spyOn한 post 메서드를 사용
      axiosPostSpy.mockResolvedValueOnce({
        data: {
          authentication: 'real_token',
          user: {
            id: 1,
            username: 'admin',
          },
        },
        headers: {
          authentication: 'Bearer',
        },
      });
 */
      const response = await axios.post(`${apiUrl}/login`, logInfo); // Axios를 사용하여 직접 호출

      console.log('response  =========================== ', response);
      expect(axiosPostSpy).toHaveBeenCalledWith(`${apiUrl}/login`, logInfo);
      expect(response.headers.authentication).not.toBeNull();
      expect(response.data.mflexUserInfo.userId).toEqual('admin');
      expect(response.data.mflexUserInfo.userNm).toEqual('관리자');
    });

    it('id 비밀번호가 일치하지 않았을 때 로그인 실패', async () => {
      const loginData = {
        username: 'wronguser',
        password: 'wrongpassword',
      };

      // 예상대로 호출되는지 확인하기 위해 spyOn한 post 메서드를 사용
      axiosPostSpy.mockRejectedValueOnce({
        data: {
          error: 'Invalid credentials',
        },
      });

      await expect(axios.post(`${apiUrl}/login`, loginData)).rejects.toEqual({
        data: {
          error: 'Invalid credentials',
        },
      });
    });
  });

  /* describe('사용자 정보 API 테스트', () => {
    it('사용자 정보 가져오기 성공', async () => {
      axios.get.mockResolvedValueOnce({
        data: rowUserInfo,
      });

      const response = await $vxHttp.get('/api/user');

      expect(axios.get).toHaveBeenCalledWith('/api/user');
      expect(response.data.userId).toBe('admin');
      expect(response.data.userName).toBe('관리자');
      expect(response.data.jbgNm).toBe('과장');
      expect(response.data.ogdpInstNm).toBe('정부');
    });
  }); */
});
