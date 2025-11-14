/**
 * 백엔드 API 에러 응답에서 메시지 추출
 *
 * Spring Backend 응답 형식: { code: 1021, message: "..." }
 * Python Backend 응답 형식: { detail: "..." } 또는 { error: "..." }
 *
 * @param {Error} error - Axios 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지 (선택사항)
 * @returns {string} 추출된 에러 메시지
 */
export const getErrorMessage = (error, defaultMessage = '요청 처리 중 오류가 발생했습니다.') => {
  if (!error) return defaultMessage

  // Spring Backend 에러 응답 (우선순위 1)
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Python Backend 에러 응답 (우선순위 2)
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }

  // Python Backend 대체 형식 (우선순위 3)
  if (error.response?.data?.error) {
    return error.response.data.error
  }

  // 일반 에러 메시지 (우선순위 4)
  if (error.message) {
    return error.message
  }

  // 기본 메시지
  return defaultMessage
}

/**
 * 백엔드 API 에러 응답에서 에러 코드 추출
 *
 * Spring Backend 응답 형식: { code: 1021, message: "..." }
 *
 * @param {Error} error - Axios 에러 객체
 * @returns {number|null} 에러 코드 (없으면 null)
 */
export const getErrorCode = (error) => {
  if (!error) return null
  return error.response?.data?.code || null
}

/**
 * 에러 타입별 처리
 *
 * @param {Error} error - Axios 에러 객체
 * @returns {object} { code, message, type }
 */
export const parseError = (error) => {
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  // 에러 코드별 타입 분류
  let type = 'error'
  if (code) {
    if (code >= 1000 && code < 1020) {
      type = 'validation' // 검증 오류
    } else if (code >= 1020 && code < 1030) {
      type = 'not_found' // 리소스 없음
    } else if (code >= 1030 && code < 1040) {
      type = 'illegal_state' // 잘못된 상태
    } else if (code >= 1040 && code < 1100) {
      type = 'file' // 파일 관련
    }
  }

  return { code, message, type }
}
