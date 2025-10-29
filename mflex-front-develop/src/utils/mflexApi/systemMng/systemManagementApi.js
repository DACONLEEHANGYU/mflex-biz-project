import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1/manage';
const defaultUrlV2 = '/api/v2/manage';

// 정보시스템 목록 조회 by 기관관
const getInfoSystemList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/information-system`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템 트리 조회
 */
const getInfoSystemTree = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${defaultUrl}/institute/tree`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 목록 조회
 */
const getInstList = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${defaultUrl}/institute`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/*
  API 명 : 정보시스템 상세 조회 
 */
const getSystemDetails = async (data) => {
  const { systemId, instituteId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/information-system/${systemId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/*
 * API 명 : 기관 상세조회
 */
const getInstituteDetails = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/*
  API 명 : 정보시스템 등록
*/
const addInformationSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system`,
      data
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 타 기관명 조회
 */
const getOtherInstituteList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/other`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/*
  API 명 : 정보시스템 수정
*/
const modifyInfomationSystem = async (data) => {
  const { systemId, instituteId, systemInfo } = data;
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/information-system/${systemId}`,
      systemInfo
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

/*
  API 명 : 정보시스템 삭제
*/
const deleteInfomationSystem = async (data) => {
  const { systemId, instituteId } = data;
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/information-system/${systemId}`,
      {
        headers: {
          'Content-Type': null,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 순서변경
 */
const changeInstituteOrder = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/order?order=${data.order}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/*
  API 명 : 지원 DBMS 목록 
*/
const getSupportDbmsList = async () => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/supported-database`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 목록 조회
 */
const getInstituteList = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${defaultUrl}/institutes`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 등록
 */
const addInstitute = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 수정
 */
const modifyInstitute = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 삭제
 */
const deleteInstitute = async (instituteId) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/institute/${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 사전 트리 조회
 */
const getDictionaryTree = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/dictionary/tree?instituteId=${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * 사전트리 생성
 */

/**
 * 사전트리 생성 - discardYn이 false인 항목 제외
 */
const constructDictionaryTree = (dictionaryList) => {
  console.log('dictionaryList 출력 =================', dictionaryList);

  // 폐기되지 않은 사전 항목만 필터링 (discardYn이 false인 항목 제외)
  const filteredList = dictionaryList.filter((item) => item.discardYn !== true);
  console.log('필터링된 사전 리스트 (폐기항목 제외):', filteredList.length);

  const dictionaryNode = {};
  const dictionaryIdToNodeIdMap = {}; // 사전ID를 노드ID로 매핑하는 객체

  let i = 0;

  let typeCode = '';

  // 첫 번째 순회 - 모든 노드 생성 및 사전ID와 노드ID 매핑
  for (let item of filteredList) {
    i++;
    // 노드ID는 사전ID 그대로 사용 (문자열로 변환)
    const nodeId = i.toString();

    switch (item.dictionaryTypeName) {
      case '정부표준':
        typeCode = '00';

        break;

      case '기관표준':
        typeCode = '10';
        break;

      case '부서표준':
        typeCode = '20';
        break;

      case '개별표준':
        typeCode = '90';
        break;
    }

    // 노드 생성
    dictionaryNode[nodeId] = {
      text: item.dictionaryName,
      id: nodeId,
      state: {
        opened: true,
      },
      children: [], // 초기에는 빈 배열로 설정
      dictionaryId: item.dictionaryId,
      discardYn: item.discardYn,
      level: item.level,
      order: item.order,
      type: item.dictionaryTypeName,
      bgColor: item.dictionaryTypeBackgroundColorName,
      color: item.dictionaryTypeForegroundColorName,
      typeCode: typeCode,
      size: 52,
    };

    // 사전ID를 노드ID로 매핑
    dictionaryIdToNodeIdMap[item.dictionaryId] = nodeId;
  }

  // 두 번째 순회 - 부모-자식 관계 설정
  for (let item of filteredList) {
    const nodeId = dictionaryIdToNodeIdMap[item.dictionaryId];

    // children 배열이 있는 경우 처리
    if (
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      // children의 각 항목을 노드ID로 변환하여 설정 (폐기된 항목 제외)
      const childrenNodeIds = item.children
        .map((childId) => {
          // ID 값인 경우
          if (typeof childId === 'number' || typeof childId === 'string') {
            // 매핑된 노드 ID가 있는지 확인 (폐기 여부가 이미 필터링되어 있음)
            return dictionaryIdToNodeIdMap[childId] || null;
          }
          // 객체인 경우
          else if (childId && childId.dictionaryId) {
            // 폐기된 항목이면 제외
            if (childId.discardYn === true) {
              return null;
            }
            return dictionaryIdToNodeIdMap[childId.dictionaryId] || null;
          }
          return null;
        })
        .filter((id) => id !== null); // null 값 제거

      // 변환된 nodeId 배열을 children에 설정
      dictionaryNode[nodeId].children = childrenNodeIds;
    }
  }

  console.log('변환된 사전 트리 (폐기항목 제외):', dictionaryNode);
  return dictionaryNode;
};

/**
 * API 명 : 정보시스템에 속한 DB 목록
 */
const getDbList = async (data) => {
  console.log('getDbList data', data);
  const { instituteId, informationSystemId } = data;

  try {
    const response = await $vxHttp.get(`${apiUrl}${defaultUrl}/database`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB별 스키마 목록
 */
const getSchemaByDb = async (data) => {
  const { instituteId, informationSystemId, databaseId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database/${databaseId}/schema`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB 상세조회
 */
const getDbDetails = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database/${databaseId}?instituteId=${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB 생성
 */
const addDb = async (data) => {
  const { instituteId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database?instituteId=${data.instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB 수정
 */
const editDb = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/database/${data.databaseId}?instituteId=${data.instituteId}`,
      data
    );
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : DB 삭제
 */
const deleteDb = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/database/${data.databaseId}?instituteId=${data.instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 스키마 목록 조회
 */
const getSchemaList = async (data) => {
  const { instituteId, databaseId } = data;
  console.log('getSchemaList data', data);
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database/${databaseId}/schema?instituteId=${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 스키마 생성
 */
const addSchema = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database/${databaseId}/schema?instituteId=${instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 스키마 삭제
 */

const deleteSchema = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/database/${databaseId}/schema?instituteId=${instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 속한 DB 목록
 */
const getDbListBySystem = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/database`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 속한 스키마 목록
 */
const getSchemaListBySystem = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/schema?` +
        `databaseId=${data.databaseId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB 목록 - 정보시스템 연결여부
 */
const getInfoSystemConection = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database/mapped?` +
        `instituteId=${data.instituteId}&` +
        `informationSystemId=${data.informationSystemId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 DB 등록
 */
const addDbToSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/` +
        `database/${data.databaseId}/map`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 DB 등록 해제
 */
const removeDbFromSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/` +
        `database/${data.databaseId}/unmap`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 스키마 등록
 */
const getDbDetailsBySystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/` +
        `schema/map`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 정보시스템에 스키마 등록 해제
 */
const removeSchemaFromSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/` +
        `schema/unmap`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : DB 목록에 존재하는 스키마 조회
 */
const getSchemaListByDb = async (data) => {
  try {
    // 베이스 URL 구성
    let url =
      `${apiUrl}${defaultUrl}/database/schema/mapped?` +
      `instituteId=${data.instituteId}&` +
      `informationSystemId=${data.informationSystemId}`;

    // 단일 databaseId가 전달된 경우
    if (data.databaseId && !data.databaseIds) {
      url += `&databaseIds=${data.databaseId}`;
    }
    // 배열로 여러 databaseIds가 전달된 경우
    else if (data.databaseIds && Array.isArray(data.databaseIds)) {
      // 모든 데이터베이스 ID를 쿼리 파라미터로 추가
      data.databaseIds.forEach((id) => {
        url += `&databaseIds=${id}`;
      });
    }
    // 단일 데이터베이스 ID가 databaseIds에 전달된 경우
    else if (data.databaseIds && !Array.isArray(data.databaseIds)) {
      url += `&databaseIds=${data.databaseIds}`;
    }

    const response = await $vxHttp.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error; // 에러를 호출자에게 전파하여 적절히 처리할 수 있도록 함
  }
};

/**
 * API 명 : 외부 사전 목록 조회
 */
const getCommonDictionaryList = async () => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/common-dictionary`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 추가
 */
const addCommonDictionary = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary`,
      data
    );
    return response.data.dictionaryId;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 수정
 */
const editCommonDictionary = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/common-dictionary/${data.dictionaryId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 폐기
 */
const discardCommonDictionary = async (commonDictionaryId) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/${commonDictionaryId}/discard`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 복구
 */
const restoreCommonDictionary = async (commonDictionaryId) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/${commonDictionaryId}/restore`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 삭제
 */
const deleteCommonDictionary = async (commonDictionaryId) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/common-dictionary/${commonDictionaryId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 버전 목록조회
 */
const getCommonDictionaryVersionList = async (dictionaryId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/common-dictionary/${dictionaryId}/version`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : 공식사전 버전 생성
 */
const addCommonDictionaryVersion = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/${data.dictionaryId}/version`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 버전 수정
 */
const editCommonDictionaryVersion = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/common-dictionary/${data.dictionaryId}/version/${data.versionId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 버전 삭제
 */
const deleteCommonDictionaryVersion = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/common-dictionary/${data.dictionaryId}/version/${data.versionId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 업로드
 */
const uploadCommonDictionary = async (data, params) => {
  console.log('uploadCommonDictionary data', data);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/${params.dictionaryId}/version/${params.versionId}/upload`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : 공식사전 용어 조회
 */
const getSearchCommonTerm = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/term/search`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 단어 조회
 */
const getSearchCommonWord = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/word/search`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 공식사전 도메인 조회
 */
const getSearchCommonDomain = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/domain/search`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 관리사전 반영
 */
const applyCommonDictionaryVersion = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/common-dictionary/${data.dictionaryId}/version/${data.versionId}/apply`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : 기관 - 공식사전 트리 조회
 */
const getCommonDictionaryTree = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/common-dictionary/tree`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 - 공식사전 매핑 생성
 */
const constructCommonDictionaryMapping = (data) => {
  try {
    const response = $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/common-dictionary`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : 기관 - 공식사전 매핑 수정
 */
const editCommonDictionaryMapping = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/common-dictionary`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 - 공식사전 매핑 삭제
 */
const deleteCommonDictionaryMapping = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/common-dictionary`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

/**
 * API 명 : 권한관리 - 최상위 기관 목록
 */
const getTopInstituteList = async () => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/role/institute/top`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관별 어드민 유저 목록
 */
const getInstituteAdminList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/role/institute/${instituteId}/admin`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관에 소속된 admin이 아닌 유저
 */
const getInstituteUserList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/role/institute/${instituteId}/user`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 admin 추가
 */
const addInstituteAdmin = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/role/institute/${data.instituteId}/admin`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
/**
 * API 명 : 기관 admin 삭제
 */
const deleteInstituteAdmin = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/role/institute/${data.instituteId}/admin`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : admin으로 있는 기관 목록
 */
const getInstituteAdminListByUser = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${defaultUrl}/role/institute`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 조직 조회
 */
const getGroupList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${instituteId}/group`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 조직 수정
 */
const editGroup = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/institute/${data.manageInstituteId}/group/${data.instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 기관 조직 삭제
 */
const deleteGroup = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/institute/${data.manageInstituteId}/group/${data.instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * API 명 : 조직 상세 조회
 */
const getGroupDetails = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/institute/${data.manageInstituteId}/group/${data.instituteId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export {
  getInfoSystemList, // 정보시스템 목록 조회 by 기관
  getSystemDetails, // 정보시스템 상세 조회
  addInformationSystem, // 정보시스템 등록
  modifyInfomationSystem, // 정보시스템 수정
  deleteInfomationSystem, // 정보시스템 삭제
  getSupportDbmsList, // 지원 DBMS 목록
  getInstituteList, // 기관 목록 조회
  getInstituteDetails, // 기관 상세조회
  addInstitute, // 기관 등록
  modifyInstitute, // 기관 수정
  deleteInstitute, // 기관 삭제
  getDictionaryTree, // 사전 트리 조회
  constructDictionaryTree, // 사전 트리 생성
  getInfoSystemTree,
  getOtherInstituteList,
  changeInstituteOrder,
  getDbDetails,
  addDb,
  editDb,
  deleteDb,
  addSchema,
  deleteSchema,
  getSchemaList,
  getDbListBySystem,
  getSchemaListBySystem,
  getInfoSystemConection,
  addDbToSystem,
  removeDbFromSystem,
  getDbList,
  getDbDetailsBySystem,
  removeSchemaFromSystem,
  getSchemaListByDb,
  getCommonDictionaryList,
  addCommonDictionary,
  editCommonDictionary,
  deleteCommonDictionary,
  restoreCommonDictionary,
  discardCommonDictionary,
  getCommonDictionaryVersionList, // 공식사전 버전 목록조회
  addCommonDictionaryVersion, // 공식사전 버전 생성
  editCommonDictionaryVersion, // 공식사전 버전 수정
  deleteCommonDictionaryVersion, // 공식사전 버전 삭제
  uploadCommonDictionary, // 공식사전 업로드
  getSearchCommonTerm, // 공식사전 용어 조회
  getSearchCommonWord, // 공식사전 단어 조회
  getSearchCommonDomain, // 공식사전 도메인 조회
  applyCommonDictionaryVersion, // 공식사전 반영
  getCommonDictionaryTree, // 기관 - 공식사전 트리 조회
  constructCommonDictionaryMapping, // 기관 - 공식사전 매핑 생성
  editCommonDictionaryMapping, // 기관 - 공식사전 매핑 수정
  deleteCommonDictionaryMapping, // 기관 - 공식사전 매핑 삭제
  getTopInstituteList, // 권한관리 - 최상위 기관 목록
  getInstituteAdminList, // 기관별 어드민 유저 목록
  getInstituteUserList, // 기관에 소속된 admin이 아닌 유저
  addInstituteAdmin, // 기관 admin 추가
  deleteInstituteAdmin, // 기관 admin 삭제
  getInstituteAdminListByUser, // admin으로 있는 기관 목록
  getInstList, // 기관 목록 조회
  getGroupList, // 기관 조직 조회
  editGroup, // 기관 조직 수정
  deleteGroup, // 기관 조직 삭제
  getGroupDetails, // 조직 상세 조회
};
