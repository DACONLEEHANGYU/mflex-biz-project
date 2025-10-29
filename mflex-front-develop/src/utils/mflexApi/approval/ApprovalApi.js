import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1/manage';
const newUrl = '/api/v1';

/**
 * API 명 : 결재선 목록
 */
const getApprovalLineList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/approval-line?instituteId=${instituteId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재선 생성
 */
const addApprovalLine = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/approval-line?instituteId=${data.instituteId}`,
      data,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재선 수정
 */

const updateApprovalLine = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/approval-line/${data.approvalLineId}?instituteId=${data.instituteId}`,
      data,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재선 상세
 */
const getApprovalLineDetails = async (approvalLineId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/approval-line/${approvalLineId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재선 삭제
 */
const deleteApprovalLine = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/approval-line/${data.approvalLineId}?instituteId=${data.instituteId}`
    );
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재자 추가
 */
const addApprover = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/approval-line/${data.approvalLineId}/approver?instituteId=${data.instituteId}`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재자 순서 변경
 */
const changeApproverOrder = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/approval-line/${data.approvalLineId}/approver/order?instituteId=${data.instituteId}`,
      data.approverSeqArray
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
/**
 * API 명 : 결재자 제거
 */
const deleteApprover = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/approval-line/${data.approvalLineId}/approver?instituteId=${data.instituteId}`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 업무 결재선 등록
 */
const addApprovalLineForSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/add-approval-line`,
      data,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 업무 결재선 삭제
 */
const removeApprovalLineForSystem = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/institute/${data.instituteId}/information-system/${data.informationSystemId}/remove-approval-line`,
      data,
      { skipTimeoutAlert: true, timeout: 0, skipSpinner: true }
    );
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재 요청
 */
const getApprovalRequest = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${newUrl}/approval-request`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
 * API 명 :결재 요청문서 목록 조회
 */
const getApprovalRequestList = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${newUrl}/approval-request/submitted?instituteId=${data.instituteId}&` +
        `dictionaryId=${data.dictionaryId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
 * API 명 : 결재 상세
 */
const getApprovalRequestDetails = async (approvalRequestId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${newUrl}/approval-request/${approvalRequestId}/details`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재 요청 취소
 */
const cancelApprovalRequest = async (approvalRequestId) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${newUrl}/approval-request/${approvalRequestId}/cancel`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재할 문서 목록 조회
 */
const getPendingApprovalRequests = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${newUrl}/approval-request/pending?instituteId=${data.instituteId}&` +
        `dictionaryId=${data.dictionaryId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재 승인
 */
const approveRequest = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${newUrl}/approval-request/${data.approvalRequestId}/step/${data.stepId}/approve`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재 반려
 */
const rejectRequest = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${newUrl}/approval-request/${data.approvalRequestId}/step/${data.stepId}/reject`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 결재 완료 목록
 */
// const getCompleteApprovalList = async (data) => {
//   try {
//     const response = await $vxHttp.get(
//       `${apiUrl}${newUrl}/approval-request/completed?instituteId=${data.instituteId}&` +
//         `dictionaryId=${data.dictionaryId}&` +
//         `searchType=${data.searchType}&` +
//         `status=${data.status}&` +
//         `targetType=${data.targetType}&` +
//         `startDate=${data.startDate}&` +
//         `endDate=${data.endDate}&` +
//         `page=${data.page}&` +
//         `size=${data.size}`
//     );
//     return response.data;
//   } catch (error) {
//     return error;
//   }
// };

/**
 * API 명 : 결재 완료 목록
 */
const getCompleteApprovalList = async (data) => {
  try {
    // 🔥 기본 필수 파라미터
    const params = new URLSearchParams();

    // 🔥 필수 파라미터는 항상 추가
    if (data.instituteId) {
      params.append('instituteId', data.instituteId);
    }
    if (data.dictionaryId) {
      params.append('dictionaryId', data.dictionaryId);
    }

    // 🔥 선택적 파라미터는 값이 있는 경우에만 추가
    if (data.searchType && data.searchType.trim() !== '') {
      params.append('searchType', data.searchType);
    }

    if (data.status && data.status.trim() !== '') {
      params.append('status', data.status);
    }

    if (data.targetType && data.targetType.trim() !== '') {
      params.append('targetType', data.targetType);
    }

    if (data.startDate && data.startDate.trim() !== '') {
      params.append('startDate', data.startDate);
    }

    if (data.endDate && data.endDate.trim() !== '') {
      params.append('endDate', data.endDate);
    }

    // 🔥 페이징 파라미터 (기본값 설정 가능)
    if (data.page !== undefined && data.page !== null) {
      params.append('page', data.page);
    }

    if (data.size !== undefined && data.size !== null) {
      params.append('size', data.size);
    }

    // 🔥 최종 URL 생성
    const queryString = params.toString();
    const url = `${apiUrl}${newUrl}/approval-request/completed${
      queryString ? `?${queryString}` : ''
    }`;

    console.log('결재 완료 목록 API 호출 URL:', url);

    const response = await $vxHttp.get(url);
    return response.data;
  } catch (error) {
    return error;
  }
};

export {
  addApprover, // 결재자 추가
  getApprovalLineList,
  addApprovalLine,
  updateApprovalLine,
  getApprovalLineDetails,
  deleteApprovalLine, // 결재선 삭제
  deleteApprover, // 결재자 제거
  getApprovalRequest, // 결재 요청
  changeApproverOrder, // 결재자 순서 변경
  addApprovalLineForSystem, // 업무 결재선 등록
  removeApprovalLineForSystem, // 업무 결재선 삭제
  getApprovalRequestList, // 결재 요청문서 목록 조회
  getApprovalRequestDetails, // 결재 요청 상세 조회
  cancelApprovalRequest, // 결재 요청 취소
  getPendingApprovalRequests, // 결재할 문서 목록 조회
  approveRequest, // 결재 승인
  rejectRequest, // 결재 반려
  getCompleteApprovalList,
};
