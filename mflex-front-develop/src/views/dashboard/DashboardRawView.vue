<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <div class="bg-box">
            <div class="dash-main">
              <div class="dash-box">
                <div class="dash-card-container">
                  <div class="dash-title">
                    <h3>
                      <span style="color: #60b883">M</span>flex와 함께 쉽고
                      체계적인 메타데이터 관리를 시작하세요!
                    </h3>
                  </div>
                  <div
                    class="dash-card"
                    @click="navigateTo('/dictionaryMng/search/list', 1)"
                  >
                    <div class="card-image-search"></div>
                    <div class="card-text">
                      Mflex에서 관리하는 사전의 정보를 <br />조회할 수 있는
                      <span style="color: green">사전조회</span> 입니다.
                    </div>
                    <div class="card-btn-area">
                      <button class="card-btn">
                        <div class="card-arrow"></div>
                      </button>
                    </div>
                  </div>
                  <div
                    class="dash-card"
                    @click="navigateTo('/dictionaryMng/term/list', 2)"
                  >
                    <div class="card-image-mng"></div>
                    <div class="card-text">
                      Mflex에서 관리하는 사전의 정보를 <br />관리할 수 있는
                      <span style="color: green">사전등록</span> 입니다.
                    </div>
                    <div class="card-btn-area">
                      <div class="card-btn">
                        <div class="card-arrow"></div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="dash-card"
                    @click="navigateTo('/dataMng/schema/list', 3)"
                  >
                    <div class="card-image-db"></div>
                    <div class="card-text">
                      수집한 스키마의 정보를 <br />조회할 수 있는
                      <span style="color: green">스키마조회</span> 입니다.
                    </div>
                    <div class="card-btn-area">
                      <div class="card-btn">
                        <i class="card-arrow"></i>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <i class="card-arrow"></i>
                  </div>
                </div>
                <!-- <div>
                  <button
                    class="feature_icon"
                    @click="navigateTo('/dictionarySearch/term/list', 1)"
                  >
                    사전조회
                  </button>
                  <button
                    class="feature_icon"
                    @click="navigateTo('/dictionaryMng/term/list', 2)"
                  >
                    사전등록
                  </button>
                  <button
                    class="feature_icon"
                    @click="navigateTo('/dataMng/schema/list', 3)"
                  >
                    스키마조회
                  </button>
                  <button
                    class="feature_icon"
                    @click="navigateTo('/systemMng/user/list', 4)"
                  >
                    사용자현황
                  </button>
                  <button
                    class="feature_icon"
                    @click="navigateTo('/devMng/text2sql/list', 5)"
                  >
                    연구실
                  </button>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';

  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;

  const { swipper } = storeToRefs(useSwipperStore());
  const router = useRouter();

  const navigateTo = (path, index) => {
    router.push(path);

    if (index === 1) {
      setTabNaviData({
        title: '사전조회',
        path: '/dictionaryMng/search/list',
      });
    } else if (index === 2) {
      setTabNaviData({
        title: '용어등록',
        path: '/dictionaryMng/term/list',
      });
    } else if (index === 3) {
      setTabNaviData({
        title: '스키마조회',
        path: '/dataMng/schema/list',
      });
    } else if (index === 4) {
      setTabNaviData({
        title: '사용자현황',
        path: '/systemMng/user/list',
      });
    } else if (index === 5) {
      setTabNaviData({
        title: '연구실',
        path: '/devMng/text2sql/list',
      });
    }
  };
</script>

<style>
  .dash-main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 30px;
    font-weight: bold;
    color: #333;
    /* background-color: ; */
    background-color: #dae9e0;
  }

  .dash-title {
    position: absolute;
    top: 50px;
  }
  .sub-title {
    font-size: 25px;
    font-weight: bold;
    color: #b9b9b9;
    margin-bottom: 5px;
  }

  .dash-box {
    background-color: rgb(255, 255, 255);
    width: 1500px;
    height: 700px;
    border-radius: 10px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
      /* 아래쪽 그림자 */ 0 -5px 10px rgba(0, 0, 0, 0.05),
      /* 위쪽 그림자 */ 10px 0 15px rgba(0, 0, 0, 0.05),
      /* 오른쪽 그림자 */ -10px 0 15px rgba(0, 0, 0, 0.05); /* 왼쪽 그림자 */
  }

  .dash-card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start; /* 상단 정렬 */
    width: 100%;
    height: calc(100% - 100px); /* footer 높이 제외 */
    position: relative; /* 겹치기 기준 */
  }

  .dash-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 130px;
    width: 290px;
    height: 500px;
    background-color: #ffffff;
    margin: 10px;
    border-radius: 3px;
    text-align: center;
    line-height: 300px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease, background-color 0.3s ease; /* 애니메이션 효과 */
    position: relative;
    z-index: 2;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 -5px 10px rgba(0, 0, 0, 0.05),
      10px 0 15px rgba(0, 0, 0, 0.05), -10px 0 15px rgba(0, 0, 0, 0.05);
  }
  .dash-card:hover {
    background-color: #f0f8f3; /* 배경색 변화 */
    transform: scale(1.05); /* 크기 확대 */
    box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2), 0 -7px 12px rgba(0, 0, 0, 0.1),
      12px 0 20px rgba(0, 0, 0, 0.1), -12px 0 20px rgba(0, 0, 0, 0.1); /* 그림자 강조 */
  }

  .card-text {
    width: 100%;
    height: 156px;
    line-height: 2;
    /* background-color: #f1f1f1; */
  }

  .card-btn-area {
    display: flex;
    width: 100%;
    height: 35px;
    line-height: 2;
    justify-content: flex-end;
    /* background-color: #f1f1f1; */
    padding-right: 30px;
  }
  .card-footer {
    width: 100%;
    height: 200px;
    background-color: #60b883;

    /* 겹치기 */
    position: absolute;
    z-index: 1;
    top: 500px;
  }

  .card-btn {
    border: 2px solid #60b883;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    position: relative;
  }
  .card-arrow {
    background-image: url(../../assets/images/dashboard-arrow-right.png);
    width: 20px;
    height: 20px;
    position: absolute;
    bottom: 5px;
    right: 3px;
  }
  .feature_icon {
    display: inline-block;
    width: 120px;
    height: 120px;
    background-color: #f1f1f1;
    margin: 10px;
    border-radius: 12px;
    text-align: center;
    line-height: 120px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease;
  }
  .feature_icon:hover {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }
  .feature_icon:active {
    background-color: #ccc;
    transform: scale(0.95);
  }

  .card-image-search {
    background-image: url(../../assets/images/dashboard-search-icon.png);
    background-size: contain; /* 이미지 비율 유지하며 축소 */
    background-position: center;
    background-repeat: no-repeat;
    width: 50%;
    height: 300px;
  }
  .card-image-mng {
    background-image: url(../../assets/images/dashboard-mng-icon.png);
    background-size: contain; /* 이미지 비율 유지하며 축소 */
    background-position: center;
    background-repeat: no-repeat;
    width: 50%;
    height: 300px;
  }
  .card-image-db {
    background-image: url(../../assets/images/dashboard-db-icon.png);
    background-size: contain; /* 이미지 비율 유지하며 축소 */
    background-position: center;
    background-repeat: no-repeat;
    width: 50%;
    height: 300px;
  }
</style>
