import { ref, isProxy, toRaw, watch } from 'vue';
import { useAlert } from '@/composables/alert';
import { $vxHttp } from '../../api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const chainApiUrl = '/api/v1/manage/';

const { alertInfos, setAlertStatus } = useAlert();

const showAlert = (message) => {
  alertInfos.value.view = true;
  alertInfos.value.message = message;
};

const successUpdate = () => {
  alertInfos.value.view = true;
  alertInfos.value.message = '사전이 업데이트 되었습니다.';
};

// 검증 함수 ( 우선 팝업 처리 )
const insertValidation = (data) => {
  console.log('insertValidation 실행 === ');
  let message = '';

  console.log('검증 =====================================', data);

  if (data.dictionaryName == null || data.dictionaryName == '') {
    message = '사전명을 입력해주세요.';
    showAlert(message);
    return false;
  } else if (data.description == null || data.description == '') {
    message = '사전설명을 입력해주세요.';
    showAlert(message);
    return false;
  }
  return true;
};

// 사전 목록
let dictionaryListObject;
// 수정된 항목
let updatedNodeData;

// 사전 유형 목록 조회 API
const getDictionaryTypeList = async () => {
  // 결과값을 담을 객체
  let response;

  try {
    response = await $vxHttp.get(`${apiUrl}${chainApiUrl}dictionary/type`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }

  return await response.data;
};

// 사전 기관 목록 조회 API
const getinstituteList = async () => {
  let response;

  try {
    response = await $vxHttp.get(`${apiUrl}${chainApiUrl}institute`);
  } catch (error) {
    console.error(error);
  }
  return await response.data;
};

// 사전 하위 기관 목록 조회 API
const getLowerInstituteList = async (instituteParams) => {
  console.log('하위기관 목록 조회 API 호출 ======================');
  console.log('instituteParams : ', instituteParams);
  const { dictionaryId, instituteId } = instituteParams;

  let response;
  try {
    if (dictionaryId != null) {
      response = await $vxHttp.get(
        `${apiUrl}${chainApiUrl}institute/lower?dictionaryId=${dictionaryId}`
      );
    } else if (instituteId != null) {
      response = await $vxHttp.get(
        `${apiUrl}${chainApiUrl}institute/lower?instituteId=${instituteId}`
      );
    }
  } catch (error) {
    console.error(error);
  }
  return await response.data;
};

// 상위 사전 목록 조회
const getParentDictionaryList = async (instituteId, dictionaryId) => {
  let response;

  console.log('상위사전 목록 조회 dictionaryId', dictionaryId);

  // 사전 홈 에서 검색버튼을 눌렀을 때,
  if (dictionaryId == null) {
    dictionaryId = 0;
  }

  try {
    response = await $vxHttp.get(
      `${apiUrl}${chainApiUrl}dictionary/flat?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await response.data;
};

// 사전 조회 API
const apiGetDictionaryList = async () => {
  let response;

  try {
    response = await $vxHttp.get(`${apiUrl}${chainApiUrl}dictionary`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }

  dictionaryListObject = response.data;
  console.log(
    '사전 객체 저장 후 확인 ============================',
    dictionaryListObject
  );

  return await response.data;
};

// 사전 상세조회 API
const dictionaryDetail = async (dictionaryId, useMetaMngInstId) => {
  console.log('사전 상세조회 API 호출 ======================');
  console.log('dictionaryId=====', dictionaryId);
  console.log('useMetaMngInstId=====', useMetaMngInstId);

  let response;

  const numericDictionaryId = dictionaryId;

  // 사전 홈 클릭 시
  if (!dictionaryId) {
    return;
  }

  try {
    response = await $vxHttp.get(
      `${apiUrl}${chainApiUrl}dictionary/${numericDictionaryId}?instituteId=${useMetaMngInstId}`
    );
    console.log(response.data);
    return await response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// 사전 등록 API
const addDictionary = async (dictionaryData) => {
  console.log('사전 등록 API 호출');
  let dictionaryListData;
  let response;
  console.log('등록 데이터 호출 =================', dictionaryData);

  //
  let result;

  if (dictionaryData.parentId == null || dictionaryData.parentId == '') {
    dictionaryData.parentId = 0;
  }

  try {
    response = await $vxHttp.post(
      `${apiUrl}${chainApiUrl}dictionary`,
      dictionaryData
    );

    console.log('등록 response =======================', response);

    result = {
      state: true,
      returnId: response.data.dictionaryId,
    };
  } catch (error) {
    console.error(error);
    return false;
  }
  return await result;
};

// 사전 삭제 API
const removeDictionary = async (dictionaryId, instituteId, treeData) => {
  console.log('사전 삭제 API 호출 ======');
  let response;

  const numericDictionaryId = Number(dictionaryId);
  console.log('삭제하려는 dictionaryId:', numericDictionaryId);
  console.log('treeData 타입:', typeof treeData);

  // treeData가 객체인 경우 처리
  if (typeof treeData === 'object' && !Array.isArray(treeData)) {
    // 객체의 모든 항목에서 해당 dictionaryId를 가진 항목 찾기
    let targetNode = null;

    for (const key in treeData) {
      if (treeData[key] && treeData[key].dictionaryId == numericDictionaryId) {
        targetNode = treeData[key];
        break;
      }
    }

    console.log('찾은 노드:', targetNode);

    if (targetNode) {
      // 자식 노드가 있는지 확인
      if (targetNode.children && targetNode.children.length > 0) {
        let message = '하위 데이터가 존재하여 삭제할 수 없습니다.';
        showAlert(message);
        return false;
      }
    } else {
      console.log('삭제하려는 노드를 찾을 수 없습니다:', numericDictionaryId);
      return false;
    }
  } else if (Array.isArray(treeData)) {
    // treeData가 배열인 경우 기존 로직 유지
    const targetData = treeData.find(
      (item) => item.dictionaryId === numericDictionaryId
    );

    // children 요소 있을 시 alert 창 출력
    if (targetData && targetData.children && targetData.children.length > 0) {
      let message = '하위 데이터가 존재하여 삭제할 수 없습니다.';
      showAlert(message);
      return false;
    }
  } else {
    console.log('treeData가 유효하지 않습니다:', treeData);
    return false;
  }

  try {
    console.log('삭제 id 번호 ======================== ', numericDictionaryId);
    response = await $vxHttp.delete(
      `${apiUrl}${chainApiUrl}dictionary/${numericDictionaryId}?instituteId=${instituteId}`
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 사전 수정 API
const editDictionary = async (dictionaryId, dictionaryData) => {
  console.log('사전 수정 API 호출 ======');

  let response;

  let result;

  console.log('사전 수정 데이터 출력 ======', dictionaryData);
  try {
    const numericDictionaryId = Number(dictionaryId);

    response = await $vxHttp.put(
      `${apiUrl}${chainApiUrl}dictionary/${numericDictionaryId}`,
      dictionaryData
    );

    result = {
      state: true,
      returnId: dictionaryId,
    };
  } catch (error) {
    console.error(error);
    console.error('사전 수정 ERROR ==============');
    return false;
  }
  return await result;
};

// 부모 요소 찾기
const findParentNode = (nodeId, nodes) => {
  const node = nodes[nodeId];
  if (!node) return null; // 노드가 존재하지 않으면 null 반환

  const parentId = node.parent;
  if (parentId === null) return null; // 부모 노드가 없으면 null 반환

  return nodes[parentId]; // 부모 노드 반환
};

// 사전 단순 순서 변경 API

const dictionaryChangeLevel = async (changeData) => {
  console.log('사전 메뉴 단순 순서 변경 API 호출 ==================');

  let response;

  console.log('사전 메뉴 변경 테스트 ======================', changeData);

  try {
    response = await $vxHttp.patch(
      `${apiUrl}${chainApiUrl}dictionary`,
      changeData
    );
    return true;
  } catch {
    return false;
  }
};

// API 사전 조회 트리생성
const apiConstructTreeData = (dictionaryList) => {
  const dictionaryNode = {};

  console.log('dcitionaryList 출력 =================', dictionaryList);

  for (let dictionary of dictionaryList) {
    dictionaryNode[`${dictionary.id}`] = {
      dictionaryId: `${dictionary.id}`,
      text: dictionary.name,
      children: dictionary.children.map((childId) => childId.toString()),
      dictionaryParent: `${dictionary.parentId}`,
      state: {
        opened: true,
      },
      level: dictionary.level,
      order: dictionary.order,
      id: `${dictionary.id}`,
      type: dictionary.type.name,
      parent: `${dictionary.parentId}`,
      typeCode: dictionary.type.code,
      bgColor: dictionary.type.backgroundColor,
      color: dictionary.type.fontColor,
      size: 52,
    };
  }

  console.log(dictionaryNode);
  treeData.value = dictionaryNode;
  dictionaryListObject = dictionaryList;
};

// 트리 선택 시 dctnryData.value 할당 함수
const setDctnryData = (data) => {
  let dctnryData;

  console.log('data ==========================', data);

  let parentTypeCode;
  let dictionaryTypeName;

  switch (data.parentDictionaryTypeName) {
    case '정부표준':
      parentTypeCode = '00';

      break;

    case '기관표준':
      parentTypeCode = '10';
      break;

    case '부서표준':
      parentTypeCode = '20';
      break;

    case '개별표준':
      parentTypeCode = '90';
      break;
  }

  switch (data.dictionaryTypeCode) {
    case '00':
      dictionaryTypeName = '정부표준';
      break;

    case '10':
      dictionaryTypeName = '기관표준';
      break;

    case '20':
      dictionaryTypeName = '부서표준';
      break;

    case '90':
      dictionaryTypeName = '개별표준';
      break;
  }

  // 상위사전이 사전홈인 경우
  if (!data.parentDictionaryId) {
    dctnryData = {
      dictionaryId: data.dictionaryId,
      dictionaryName: data.dictionaryName, //사전명
      dictionaryTypeCode: data.dictionaryTypeCode, //사전유형코드
      dictionaryTypeName: dictionaryTypeName,
      dictionaryFontColorName: data.dictionaryTypeForegroundColorName, //사전폰트색상
      dictionaryBackGroundColorName: data.dictionaryTypeBackgroundColorName, //사전배경색상
      dictionaryExplain: data.description, // 사전설명
      dictionaryParent: 0,
      dictionaryParentName: '',
      userId: data.updater, // 사용자Id
      regdate: data.updateDateTime, // 등록일자
      managementInstituteId: data.instituteId, // 기관ID
    };
  } else {
    dctnryData = {
      dictionaryId: data.dictionaryId,
      dictionaryName: data.dictionaryName, //사전명
      dictionaryParent: data.parentDictionaryId,
      dictionaryParentName: data.parentDictionaryName,
      dictionaryTypeCode: data.dictionaryTypeCode, //사전유형코드
      dictionaryTypeName: dictionaryTypeName,
      dictionaryFontColorName: data.dictionaryTypeForegroundColorName, //사전폰트색상
      dictionaryBackGroundColorName: data.dictionaryTypeBackgroundColorName, //사전배경색상
      dictionaryExplain: data.description, // 사전설명
      parentDictionaryId: data.parentDictionaryId, // 부모사전ID
      parentBackgroundColor: data.parentDictionaryTypeBackgroundColorName,
      parentFontColor: data.parentDictionaryTypeForegroundColorName,
      parentTypeCode: parentTypeCode,
      parentTypeName: data.parentDictionaryTypeName,
      userId: data.updater, // 사용자Id
      regdate: data.updateDateTime, // 등록일자
      managementInstituteId: data.instituteId, // 기관ID
    };
  }

  console;

  return dctnryData;
};

// json 파일 읽어오는 함수 ( DB 역할 최초 조회 )
const getDictionaryList = async () => {
  let response;

  //apiGetDictionaryList();

  try {
    // dictionaryList.json 에서 데이터 가져오기

    response = await fetch('src/views/systemMng/dictionaryList.json'); // 공통 관리
    if (!response.ok) {
      console.log('response.statusText : ', response.statusText);
      console.error('JSON 파일 로드 실패:', response.statusText);
      return;
    }
  } catch {
    console.error('사전 목록 가져오기 실패');
    return;
  }
  console.log('모듈 getDictionaryList 실행 ==================================');
  return await response.json();
};

// 삭제 함수
const deleteDictionary = (deleteId) => {
  console.log('삭제 모듈 실행');

  let message = '';
  const refreshDictionaryList = dictionaryListObject;

  console.log(
    ' refreshDictionaryList ========================= ',
    refreshDictionaryList
  );
  // 하위 데이터 검증
  const targetData = refreshDictionaryList.find(
    (item) => item.dictionaryId === deleteId
  );

  console.log('targetData ======================== ', targetData);

  if (targetData && targetData.dictionaryChild.length > 0) {
    // child 데이터가 있으면 삭제 불가능 alert 표시
    //alert('하위 데이터가 존재하여 삭제할 수 없습니다.');
    message = '하위 데이터가 존재하여 삭제할 수 없습니다.';
    showAlert(message);
    return refreshDictionaryList;
  }

  // 상위 요소에서 dictionaryChildren 에 deleteId 를 포함하는 요소 삭제!
  refreshDictionaryList.forEach((item) => {
    if (item.dictionaryChild.includes(deleteId)) {
      item.dictionaryChild = item.dictionaryChild.filter(
        (childId) => childId !== deleteId
      );
    }
  });

  console.log(
    'refreshDictionaryList 에서 child 삭제 ========================',
    refreshDictionaryList
  );

  let filterDictinaryList = refreshDictionaryList.filter(
    (item) => item.dictionaryId !== deleteId
  );

  return filterDictinaryList;
};

let homeTree = {
  id: {
    dictionaryId: 'id',
    children: [],
    text: '사전 홈',
    dictionaryTypeCode: '',
    state: {
      opened: true,
    },
    dictionaryFontColorName: '',
    dictionaryBackGroundColorName: '',
    dictionaryExplain: '',
    userId: '-',
    username: '-',
    regdate: '-',
  },
};

const treeData = ref({});

const treeRoots = ref({ roots: ['0'] });

// 추가, 수정 함수
const updateDictionary = (addData, id) => {
  console.log('addData ================  : ', addData.value);
  if (addData.value.action === '수정') {
    console.log('수정 코드 생성');

    // 선택된 데이터의 사전 id
    //selectedDictionaryId = selectedData.value.id;

    // 현재 사전 목록에서 id 로 해당 인덱스 데이터 수정
    let index = dictionaryListObject.findIndex(
      (item) => item.dictionaryId === id
    );

    console.log(index);

    let data = {};

    // 대상이 Proxy 로 wrap 되어 있을 경우, tartget 데이터 추출
    if (isProxy(addData.value)) {
      data = toRaw(addData.value);
    }

    console.log('data : ', data);

    dictionaryListObject[index] = data;

    console.log('dictionaryListObj[index] : ', dictionaryListObject);

    // 트리 생성 함수에 데이터 전달 , 트리 재생성
    constructTreeData(dictionaryListObject);
  } else {
    console.log('추가 등록 진행 ============================');

    addData.value.dictionaryParent = addData.value.dictionaryId;
    addData.value.dictionaryParentName = addData.value.dictionaryName;

    let data = {};

    addData.value.dictionaryId = `${Math.floor(Math.random() * 100) + 1}`;
    console.log('addData.value : ', addData.value);

    // 대상이 Proxy 로 wrap 되어 있을 경우, tartget 데이터 추출
    if (isProxy(addData.value)) {
      data = toRaw(addData.value);
    }
    console.log('push 전 dictionaryListObject ===== ', [
      ...dictionaryListObject,
    ]);

    // 입력한 사전의Id 를 부모요소의 dictionaryChild 에 추가
    for (let obj of dictionaryListObject) {
      if (addData.value.dictionaryParent == obj.dictionaryId) {
        obj.dictionaryChild.push(addData.value.dictionaryId);
      }
    }
    console.log('입력 데이터 프록시 unwraping data =================== ', data);
    // 사전 목록 전역 데이터 할당
    dictionaryListObject.push(data);
    console.log('push 후 dictionaryListObject ===== ', [
      ...dictionaryListObject,
    ]);

    // action 값을 상태값으로 처리 하여 API 호출 분기
    constructTreeData(dictionaryListObject);
  }
  //successUpdate();

  return true;
};

// 트리 생성 함수
const constructTreeData = (dictionaryList) => {
  // homeTree 초기화
  homeTree = {
    id: {
      dictionaryId: 'id',
      children: [],
      text: '사전 홈',
      dictionaryTypeCode: '',
      state: {
        opened: true,
      },
      dictionaryFontColorName: '',
      dictionaryBackGroundColorName: '',
      dictionaryExplain: '',
      userId: '-',
      username: '-',
      regdate: '-',
    },
  };

  const dictionaryNode = {};
  // 사전 목록 json 파일에서 for 문 사용 Tree 객체 생성
  for (let dictionary of dictionaryList) {
    let type;

    switch (dictionary.dictionaryTypeCode) {
      case '10':
        type = '정부표준';
        break;
      case '20':
        type = '기관표준';
        break;
      case '30':
        type = '부서표준';
        break;
      case '90':
        type = '개별표준';
        break;
    }

    dictionaryNode[dictionary.dictionaryId] = {
      dictionaryId: dictionary.dictionaryId,
      text: dictionary.dictionaryName,

      children: [],
      dictionaryParent: dictionary.dictionaryParent,
      state: {
        opened: true,
      },
      type: type,
      typeCode: dictionary.dictionaryTypeCode,
      bgColor: dictionary.dictionaryBackGroundColorName,
      color: dictionary.dictionaryFontColorName,
      size: 52,
      dictionaryExplain: dictionary.dictionaryExplain,
      userId: dictionary.userId,
      username: dictionary.username,
      regdate: dictionary.regdate,
    };
  } // 추가

  for (let dictionary of dictionaryList) {
    if (
      dictionary.dictionaryParent == null ||
      dictionary.dictionaryParent == ''
    ) {
      homeTree.id.children.push(dictionary.dictionaryId);
    } else if (dictionaryNode[dictionary.dictionaryParent]) {
      dictionaryNode[dictionary.dictionaryParent].children.push(
        dictionary.dictionaryId
      );
    }
  }

  console.log('homeTree.value : =============', homeTree);
  console.log('기존 dictionaryNode.value : =============', dictionaryNode);

  let newNode = { ...homeTree, ...dictionaryNode };

  treeData.value = newNode;
  console.log('트리 데이터', treeData.value);

  // 전역 사전 목록 객체에 저장
  dictionaryListObject = dictionaryList;
  console.log('dictionaryListObject : ', dictionaryListObject);

  let newD;
  let oldD;

  watch(
    () => treeData.value,
    (newData, oldData) => {
      newD = JSON.parse(JSON.stringify(newData));
      oldD = oldData ? JSON.parse(JSON.stringify(oldData)) : {};

      // 추가 등록 항목 찾기
      const newNodes = Object.values(newData).filter((node) => {
        return (
          !oldData ||
          !Object.values(oldData || {}).find(
            (old) => old.dictionaryId === node.dictionaryId
          )
        );
      });
      if (newNodes.length > 0) {
        console.log('추가 등록 항목:', newNodes);
        updatedNodeData = newNodes;
      }

      // 수정 항목 찾기
      function findChangedNode(node, oldNode) {
        if (oldNode) {
          if (
            node.text !== oldNode.text ||
            node.dictionaryParent !== oldNode.dictionaryParent ||
            JSON.stringify(node.state) !== JSON.stringify(oldNode.state) ||
            node.type !== oldNode.type ||
            node.typeCode !== oldNode.typeCode ||
            node.bgColor !== oldNode.bgColor ||
            node.color !== oldNode.color ||
            node.size !== oldNode.size ||
            node.dictionaryExplain !== oldNode.dictionaryExplain ||
            node.userId !== oldNode.userId ||
            node.username !== oldNode.username ||
            node.regdate !== oldNode.regdate
          ) {
            console.log('수정된 항목:', node);
            updatedNodeData = node;
          }
          for (let i = 0; i < Object.values(node.children || {}).length; i++) {
            findChangedNode(
              Object.values(node.children || {})[i],
              Object.values(oldNode.children || {})[i]
            );
          }
        }
      }

      if (oldData) {
        for (let i = 0; i < Object.values(newData).length; i++) {
          findChangedNode(Object.values(newData)[i], Object.values(oldData)[i]);
        }
      }
    },
    { deep: true }
  );
};

/*

// node.js 환경에서 테스트 코드
import fs from 'fs/promises';

const getDictionaryList = async () => {
  try {
    const data = await fs.readFile('./dictionaryList.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('사전 목록 가져오기 실패:', error);
    throw error;
  }
};


*/
export {
  getDictionaryList,
  deleteDictionary,
  dictionaryListObject,
  constructTreeData,
  treeRoots,
  treeData,
  updateDictionary,
  insertValidation,
  updatedNodeData,
  apiGetDictionaryList, // 사전 조회 API
  apiConstructTreeData, // API 트리생성
  addDictionary, // 사전 등록 API
  removeDictionary, // 사전 삭제 API
  dictionaryDetail, // 사전 상세 조회 API
  setDctnryData, // dctnryData 할당 함수
  editDictionary, // 사전 수정 API
  dictionaryChangeLevel, // 사전 단순 순서 변경 API
  findParentNode, //부모요소 찾기 API
  getDictionaryTypeList, // 사전 유형 조회 API
  getinstituteList, // 사전등록기관 목록 조회 API
  getLowerInstituteList, // 사전하위기관 목록 조회 API
  getParentDictionaryList, // 상위 사전 목록 조회 API
};
