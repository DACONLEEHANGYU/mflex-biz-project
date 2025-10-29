//인증토큰
function saveAuthToCookie(value) {
  // console.log('[saveAuthToCookie]=', value);
  document.cookie = `x_auth=${value}`;
}
function getAuthFromCookie() {
  // console.log('[getAuthFromCookie]=', document.cookie);
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)x_auth\s*=\s*([^;]*).*$)|^.*$/,
    '$1'
  );
}

//유저정보
function saveUserToStorage(value) {
  localStorage.setItem('x_user', JSON.stringify(value));
}
function getUserFromStorage() {
  return localStorage.getItem('x_user');
}

// 유저 권한 저장
function saveUserRoleToStorage(value) {
  localStorage.setItem('x_user_role', JSON.stringify(value));
}
// 유저 권한 가져오기 - 객체로 반환하도록 수정
function getUserRoleFromStorage() {
  const roleData = localStorage.getItem('x_user_role');

  // 저장된 데이터가 없으면 null 반환
  if (!roleData) {
    return null;
  }

  try {
    // JSON 문자열을 객체로 파싱
    return JSON.parse(roleData);
  } catch (error) {
    console.error('사용자 권한 데이터 파싱 오류:', error);
    return null;
  }
}

//유저상태 저장
function saveUserStateStorage(value) {
  console.log('saveUserStateStorage : ', value);
  localStorage.setItem('x_user_state', value);
}
//유저상태 가져오기
function getUserStateStorage() {
  console.log('getUserStateStorage : ', localStorage.getItem('x_user_state'));
  return localStorage.getItem('x_user_state');
}

//유저ID 저장(로그인)
function saveIdToStorage(value) {
  localStorage.setItem('x_id', value);
}
function getIdFromStorage() {
  return localStorage.getItem('x_id');
}

//유저 메뉴 목록
function saveUserMenuToStorage(value) {
  localStorage.setItem('mflex_user_menu', JSON.stringify(value));
}
function getUserMenuFromStorage() {
  return localStorage.getItem('mflex_user_menu');
}

//유저 메타관리 기관 목록
function saveUserMetaMngInstListToStorage(value) {
  localStorage.setItem('mflex_user_metamnginstlist', JSON.stringify(value));
}
function getUserMetaMngInstListFromStorage() {
  return localStorage.getItem('mflex_user_metamnginstlist');
}

// 사용자 선택 메타관리 기관 ID
function saveUserMetaMngInstIdToStorage(value) {
  localStorage.setItem('mflex_user_metamnginstid', value);
}
function getUserMetaMngInstIdFromStorage() {
  return localStorage.getItem('mflex_user_metamnginstid');
}

//  기관 관리자 ID 목록 저장
function saveUserAdminInstIdToStorage(value) {
  localStorage.setItem('mflex_user_admininstid', JSON.stringify(value));
}
// 기관 관리자 ID 목록 가져오기
function getUserAdminInstIdFromStorage() {
  return localStorage.getItem('mflex_user_admininstid');
}

//유저 사전 목록
function saveUserDctnryListToStorage(value) {
  localStorage.setItem('mflex_user_dctnrylist', JSON.stringify(value));
}
function getUserDctnryListFromStorage() {
  return localStorage.getItem('mflex_user_dctnrylist');
}

//유저 주제 영역 목록
function saveUserSbjarListToStorage(value) {
  localStorage.setItem('mflex_user_sbjarlist', JSON.stringify(value));
}
function getUserSbjarListFromStorage() {
  return localStorage.getItem('mflex_user_sbjarlist');
}

//유저 정보시스템 목록
function saveUserInfoSysListToStorage(value) {
  localStorage.setItem('mflex_user_infosyslist', JSON.stringify(value));
}
function getUserInfoSysListFromStorage() {
  return localStorage.getItem('mflex_user_infosyslist');
}

//유저 기본 사용 시스템 정보
function saveUserStngToStorage(value) {
  localStorage.setItem('mflex_user_stng_info', JSON.stringify(value));
}
function getUserStngToStorage() {
  return localStorage.getItem('mflex_user_stng_info');
}

function saveUserGroupIdToStorage(value) {
  localStorage.setItem('mflex_user_group_id', value);
}
function getUserGroupIdFromStorage() {
  return localStorage.getItem('mflex_user_group_id');
}

function saveUserGroupToStorage(value) {
  localStorage.setItem('mflex_user_group', JSON.stringify(value));
}
function getUserGroupFromStorage() {
  return localStorage.getItem('mflex_user_group');
}

//스토레이지 삭제
function deleteStorage(value) {
  localStorage.removeItem(value);
}

//쿠키 삭제
function deleteCookie(value) {
  console.log('deleteCookie : ', value);
  document.cookie = `${value}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

//Tab Navigation
function saveTabNaviStorage(value) {
  localStorage.setItem('x_tabNavi', JSON.stringify(value));
}
function getTabNaviStorage() {
  return localStorage.getItem('x_tabNavi');
}
function saveTabNaviIndexStorage(value) {
  localStorage.setItem('x_tabNaviIndex', value);
}
function getTabNaviIndexStorage() {
  return localStorage.getItem('x_tabNaviIndex');
}

// 그리드 정보 저장
function saveGridInfoToStorage(value) {
  localStorage.setItem('mflex_grid_info', JSON.stringify(value));
}
function getGridInfoFromStorage() {
  return localStorage.getItem('mflex_grid_info');
}

// Swipper ( 히스토리바 )상태 저장
function saveSwipperStateStorage(value) {
  const state = JSON.stringify(value); // 값을 문자열로 변환
  localStorage.setItem('mflex_swipper_state', state);
}
function getSwipperStateStorage() {
  const state = localStorage.getItem('mflex_swipper_state');

  return state !== null ? JSON.parse(state) : null; // JSON으로 변환
  // return localStorage.getItem('mflex_swipper_state');
}

// 사전등록 스텝 상태 저장
function saveStepStateStorage(value) {
  localStorage.setItem('mflex_step_state', value);
}
function getStepStateStorage() {
  return localStorage.getItem('mflex_step_state');
}

// 사전표준화 스텝 상태 저장
function saveActualizingStepStateStorage(value) {
  localStorage.setItem('mflex_actualizing_step_state', value);
}
function getActualizingStepStateStorage() {
  return localStorage.getItem('mflex_actualizing_step_state');
}

// 용어등록 작업항목 표시여부 저장
function saveIncludeJobTerm(value) {
  localStorage.setItem('mflex_include_job_term', value);
}
// 용어등록 작업항목 표시여부 가져오기
function getIncludeJobTerm() {
  return localStorage.getItem('mflex_include_job_term');
}

// 단어등록 작업항목 표시여부 저장
function saveIncludeJobWord(value) {
  localStorage.setItem('mflex_include_job_word', value);
}
// 단어등록 작업항목 표시여부 가져오기
function getIncludeJobWord() {
  return localStorage.getItem('mflex_include_job_word');
}

// 도메인등록 작업항목 표시여부 저장
function saveIncludeJobDomain(value) {
  localStorage.setItem('mflex_include_job_domain', value);
}
// 도메인표준화 작업항목 표시여부 가져오기
function getIncludeJobDomain() {
  return localStorage.getItem('mflex_include_job_domain');
}

// 용어표준화 작업항목 표시여부 저장
function saveIncludeJobTermActualizing(value) {
  localStorage.setItem('mflex_include_job_term_actualizing', value);
}
// 용어표준화 작업항목 표시여부 가져오기
function getIncludeJobTermActualizing() {
  return localStorage.getItem('mflex_include_job_term_actualizing');
}

// 단어표준화 작업항목 표시여부 저장
function saveIncludeJobWordActualizing(value) {
  localStorage.setItem('mflex_include_job_word_actualizing', value);
}
// 단어표준화 작업항목 표시여부 가져오기
function getIncludeJobWordActualizing() {
  return localStorage.getItem('mflex_include_job_word_actualizing');
}

// 도메인표준화 작업항목 표시여부 저장
function saveIncludeJobDomainActualizing(value) {
  localStorage.setItem('mflex_include_job_domain_actualizing', value);
}
// 도메인표준화 작업항목 표시여부 가져오기
function getIncludeJobDomainActualizing() {
  return localStorage.getItem('mflex_include_job_domain_actualizing');
}

// 용어조회 검색코드 저장
function saveTermDictionarySearchCode(value) {
  localStorage.setItem('termDictionarySearchCode', value);
}
function getTermDictionarySearchCode() {
  return localStorage.getItem('termDictionarySearchCode');
}
// 단어조회 검색코드 저장
function saveWordDictionarySearchCode(value) {
  localStorage.setItem('wordDictionarySearchCode', value);
}
function getWordDictionarySearchCode() {
  return localStorage.getItem('wordDictionarySearchCode');
}
// 도메인조회 검색코드 저장
function saveDomainDictionarySearchCode(value) {
  localStorage.setItem('domainDictionarySearchCode', value);
}
function getDomainDictionarySearchCode() {
  return localStorage.getItem('domainDictionarySearchCode');
}
// 코드조회 검색코드 저장
function saveCodeDictionarySearchCode(value) {
  localStorage.setItem('codeDictionarySearchCode', value);
}
function getCodeDictionarySearchCode() {
  return localStorage.getItem('codeDictionarySearchCode');
}

export {
  saveAuthToCookie,
  getAuthFromCookie,
  saveUserToStorage,
  getUserFromStorage,
  saveIdToStorage,
  getIdFromStorage,
  deleteStorage,
  deleteCookie,
  saveTabNaviStorage,
  getTabNaviStorage,
  saveTabNaviIndexStorage,
  getTabNaviIndexStorage,
  saveUserMenuToStorage,
  getUserMenuFromStorage,
  saveUserMetaMngInstListToStorage,
  getUserMetaMngInstListFromStorage,
  saveUserDctnryListToStorage,
  getUserDctnryListFromStorage,
  saveUserSbjarListToStorage,
  getUserSbjarListFromStorage,
  saveUserInfoSysListToStorage,
  getUserInfoSysListFromStorage,
  saveUserStngToStorage,
  getUserStngToStorage,
  saveUserMetaMngInstIdToStorage,
  getUserMetaMngInstIdFromStorage,
  saveGridInfoToStorage,
  getGridInfoFromStorage,
  saveUserStateStorage,
  getUserStateStorage,
  saveSwipperStateStorage,
  getSwipperStateStorage,
  saveStepStateStorage,
  getStepStateStorage,
  saveActualizingStepStateStorage,
  getActualizingStepStateStorage,
  saveIncludeJobTerm,
  getIncludeJobTerm,
  saveIncludeJobWord,
  getIncludeJobWord,
  saveIncludeJobDomain,
  getIncludeJobDomain,
  saveIncludeJobTermActualizing,
  getIncludeJobTermActualizing,
  saveIncludeJobWordActualizing,
  getIncludeJobWordActualizing,
  saveIncludeJobDomainActualizing,
  getIncludeJobDomainActualizing,
  saveTermDictionarySearchCode,
  getTermDictionarySearchCode,
  saveWordDictionarySearchCode,
  getWordDictionarySearchCode,
  saveDomainDictionarySearchCode,
  getDomainDictionarySearchCode,
  saveCodeDictionarySearchCode,
  getCodeDictionarySearchCode,
  saveUserRoleToStorage,
  getUserRoleFromStorage,
  saveUserAdminInstIdToStorage,
  getUserAdminInstIdFromStorage,
  saveUserGroupIdToStorage,
  getUserGroupIdFromStorage,
  saveUserGroupToStorage,
  getUserGroupFromStorage,
};
