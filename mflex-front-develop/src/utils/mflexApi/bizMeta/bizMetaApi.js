import { $vxHttp } from '@/api';

// 비즈니스 용어 조회 (페이징 및 검색 지원)
const getBizTerms = async (limit = 100, offset = 0, search = '') => {
  try {
    // 쿼리 파라미터 구성
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await $vxHttp.get(
      `http://localhost:3000/biz-terms?${params.toString()}`,
      '',
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        skipTimeoutAlert: true,
        timeout: 0,
      }
    );
    console.log('getBizTerms API 응답:', response);

    // 🔥 axios는 response.data에 실제 데이터가 있습니다
    return response.data; // 또는 response.data.data
  } catch (error) {
    console.error('getBizTerms API 에러:', error);
    throw error;
  }
};

// 비즈니스 용어 등록
const addBizTerm = async (termData) => {
  try {
    const response = await $vxHttp.post(
      'http://localhost:3000/biz-terms',
      termData
    );
    console.log('addBizTerm API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('addBizTerm API 에러:', error);
    return error;
  }
};

const deleteBizTerm = async (termId) => {
  try {
    const response = await $vxHttp.delete(
      `http://localhost:3000/biz-terms/${termId}`
    );
    console.log('deleteBizTerm API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('deleteBizTerm API 에러:', error);
    throw error;
  }
};

// 비즈니스 용어 관계 등록
const addBizTermRelation = async (relationParams) => {
  try {
    const response = await $vxHttp.post(
      'http://localhost:3000/biz-terms/relation',
      relationParams
    );
    console.log('addBizTermRelation API 응답:', response);
    return response;
  } catch (error) {
    console.error('addBizTermRelation API 에러:', error);
    return error;
  }
};

// 비즈니스 용어 관계 삭제
const deleteBizTermRelation = async (relationId) => {
  try {
    const response = await $vxHttp.delete(
      `http://localhost:3000/biz-terms/relation/${relationId}`
    );
    console.log('deleteBizTermRelation API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('deleteBizTermRelation API 에러:', error);
    throw error;
  }
};

/**
 * 복합 구성용어 생성
 */
const addBizTermComposite = async (compositeData) => {
  try {
    const response = await $vxHttp.post(
      'http://localhost:3000/biz-terms/composite',
      compositeData
    );
    console.log('addBizTermComposite API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('addBizTermComposite API 에러:', error);
    throw error;
  }
};

/**
 * 복합구성용어 구성용어 삭제
 */
const deleteBizTermCompositeChild = async (compositeId, childId) => {
  try {
    const response = await $vxHttp.delete(
      `http://localhost:3000/biz-terms/composite/compositeId/${compositeId}/childId/${childId}`
    );
    console.log('deleteBizTermCompositeChild API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('deleteBizTermCompositeChild API 에러:', error);
    throw error;
  }
};

/**
 * 복합구성간 관계 조회
 */
const getNewCompositeRelations = async (compositeId) => {
  try {
    const response = await $vxHttp.get(
      `http://localhost:3000/biz-terms/composite-relations/${compositeId}`
    );
    console.log('getCompositeRelations API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('getCompositeRelations API 에러:', error);
    throw error;
  }
};

/**
 * 복합구성간 관계 변경
 */
const updateCompositeRelations = async (data) => {
  try {
    const response = await $vxHttp.put(
      `http://localhost:3000/biz-terms/composite/order`,
      data
    );
    console.log('updateCompositeRelations API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('updateCompositeRelations API 에러:', error);
    throw error;
  }
};

/**
 * 복합구성요소 자식요소 순서 변경
 */
const updateChildrenOrder = async (orderChangeData) => {
  try {
    const response = await $vxHttp.put(
      'http://localhost:3000/biz-terms/composite/change-order',
      orderChangeData
    );
    console.log('updateChildrenOrder API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('updateChildrenOrder API 에러:', error);
    throw error;
  }
};

/**
 * 특정 용어와 1차 관계에 있는 모든 용어들의 상세 정보 조회
 */
const getBizTermWithRelated = async (termId) => {
  try {
    const response = await $vxHttp.get(
      `http://localhost:3000/biz-terms/${termId}/related`
    );
    console.log('getBizTermWithRelated API 응답:', response);
    return response.data;
  } catch (error) {
    console.error('getBizTermWithRelated API 에러:', error);
    throw error;
  }
};

export {
  getBizTerms, // 비즈니스 용어 조회,
  getBizTermWithRelated, // 특정 용어와 관계된 용어들의 상세 정보 조회
  addBizTerm, // 비즈니스 용어 등록,
  deleteBizTerm, // 비즈니스 용어 삭제
  addBizTermRelation, // 비즈니스 용어 관계 등록
  deleteBizTermRelation, // 비즈니스 용어 관계 삭제
  addBizTermComposite, // 복합 구성용어 생성
  deleteBizTermCompositeChild, // 복합구성용어 구성용어 삭제
  getNewCompositeRelations, // 복합구성간 관계 조회
  updateCompositeRelations, // 복합구성간 관계 변경
  updateChildrenOrder, // 복합구성요소 자식요소 순서 변경
};
