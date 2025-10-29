<template>
  <aside class="side-navi">
    <div class="side-box">
      <div class="side-h">
        <transition name="fade-side" mode="out-in">
          <div class="side-logo" v-if="getSideState === 'wide'" @click="onMain">
            메타데이터 관리시스템
          </div>
          <div class="side-menu" v-else @click="onSideNavi"></div>
        </transition>
      </div>
      <div class="side-b">
        <NavigationComp :navis="naviData" />
      </div>
    </div>
  </aside>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { getRoutes } from '@/router/index';
  import NavigationComp from '@/components/aside/NavigationComp.vue';
  import { useGridResize } from '@/composables/gridResize';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import {
    getUserMenuFromStorage,
    getUserStateStorage,
    getUserRoleFromStorage,
    getUserAdminInstIdFromStorage,
    getUserMetaMngInstIdFromStorage,
  } from '@/utils/cookies';

  const uiStore = useUiStore();
  const { gridResizeCheck } = useGridResize();
  const { getSideState } = storeToRefs(uiStore);
  const { setSideState } = uiStore;
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;

  console.log('setTabNaviData :', tabNaviStore);
  console.log('getUserStateStorage :', getUserStateStorage());

  // cookies에 저장된 사용자 메뉴 객체로 파싱
  const userMenuList = JSON.parse(getUserMenuFromStorage());

  const generateNavis = () => {
    console.log('userInfo : ', userInfo.value);

    let menus = [];
    console.log('getRoute : ', { getRoutes });

    // 사용자 권한 정보 가져오기
    const userRoles = getUserRoleFromStorage();
    console.log('getUserRoleFromStorage : ', userRoles);

    // ROLE_SUPER 권한 확인
    const isSuperRole = userRoles && userRoles.includes('ROLE_SUPER');
    console.log('isSuperRole : ', isSuperRole);

    // 또는 ROLE_ADMIN으로 시작하는 모든 권한을 체크하려면:
    const isAdminRolePartial =
      userRoles && userRoles.some((role) => role.startsWith('ROLE_ADMIN'));
    console.log('isAdminRolePartial : ', isAdminRolePartial);

    // 관리자 기관 목록 가져오기
    const adminInstList = JSON.parse(getUserAdminInstIdFromStorage());
    console.log('getUserAdminInstIdFromStorage : ', adminInstList);
    console.log('useMetaMngInstId : ', useMetaMngInstId);

    // 현재 설정된 기관이 관리자 기관 목록에 포함되어 있는지 확인
    const isCurrentInstAdmin =
      adminInstList &&
      adminInstList.some((inst) => inst.instituteId === useMetaMngInstId);
    console.log('isCurrentInstAdmin : ', isCurrentInstAdmin);

    getRoutes.forEach((route) => {
      if (route.meta && route.meta.navi) {
        // 연구실(MFMN0090) 메뉴 접근 조건 확인
        if (route.name === 'MFMN0090') {
          // 다음 조건 중 하나라도 만족하면 메뉴 표시
          // 1. ROLE_SUPER 권한이 있는 경우
          // 2. userTypeCd가 '00'인 경우 (관리자 타입)
          // 3. 현재 기관의 어드민인 경우
          const canAccessLabMenu =
            // isSuperRole ||
            userInfo.value.userTypeCd === '00' || isCurrentInstAdmin;

          console.log(`${route.name} 메뉴 접근 권한 확인:`, {
            isSuperRole,
            userTypeCd: userInfo.value.userTypeCd,
            isCurrentInstAdmin,
            canAccess: canAccessLabMenu,
          });

          if (!canAccessLabMenu) {
            console.log(
              `${route.name} 메뉴는 다음 조건 중 하나를 만족해야 합니다:`,
              '1. ROLE_SUPER 권한',
              '2. userTypeCd가 "00"',
              '3. 현재 기관의 어드민'
            );
            return; // 조건을 만족하지 않으면 메뉴 건너뛰기
          }
        }

        // 슈퍼 어드민 시스템관리(MFMN0900) 메뉴 접근 조건 확인
        if (route.name === 'MFMN0900') {
          // ROLE_SUPER 권한이 있어야만 표시
          if (!isSuperRole) {
            console.log(
              `${route.name} 메뉴는 ROLE_SUPER 권한이 필요합니다. 현재 권한:`,
              userRoles
            );
            return; // ROLE_SUPER 권한이 없으면 메뉴 건너뛰기
          }
        }

        // 🔥 MFMN1200 메뉴 접근 조건 확인 - 슈퍼어드민이면서 MetaMngInstId > 0일 때만 표시
        if (route.name === 'MFMN1200') {
          const metaMngInstId = Number(getUserMetaMngInstIdFromStorage());
          const canAccessMFMN1200 = isSuperRole && metaMngInstId > 0;

          console.log(`${route.name} 메뉴 접근 권한 확인:`, {
            isSuperRole,
            metaMngInstId,
            canAccess: canAccessMFMN1200,
          });

          if (!canAccessMFMN1200) {
            console.log(
              `${route.name} 메뉴는 다음 조건을 모두 만족해야 합니다:`,
              '1. ROLE_SUPER 권한',
              '2. MetaMngInstId > 0 (기관 선택 상태)'
            );
            return; // 조건을 만족하지 않으면 메뉴 건너뛰기
          }
        }

        // 기관 어드민 시스템관리(MFMN1100) 메뉴 - 기관관리자에게만 표시
        if (route.name === 'MFMN1100') {
          // 슈퍼어드민이면 표시하지 않음
          if (isSuperRole) {
            console.log(
              `${route.name} 메뉴는 슈퍼어드민에게는 표시되지 않습니다.`
            );
            return;
          }

          // 기관관리자가 아니면 표시하지 않음
          if (!isCurrentInstAdmin) {
            console.log(
              `${route.name} 메뉴는 기관관리자에게만 표시됩니다. 현재 사용자는 기관관리자가 아닙니다.`
            );
            return;
          }

          console.log(`${route.name} 메뉴 접근 가능 - 기관관리자`);
        }

        // 일반사용자 메뉴들(MFMN0400, MFMN0500, MFMN0700, MFMN1000) - 슈퍼어드민 제외 모든 사용자
        if (
          route.name === 'MFMN0400' ||
          route.name === 'MFMN0500' ||
          route.name === 'MFMN0700' ||
          route.name === 'MFMN1000' ||
          route.name === 'MFMN1300'
        ) {
          // 슈퍼어드민, 기관으로 이동하지 않은 경우
          if (isSuperRole && Number(getUserMetaMngInstIdFromStorage()) < 0) {
            console.log(
              `${route.name} 메뉴는 슈퍼어드민에게는 표시되지 않습니다.`
            );
            return; // 슈퍼어드민이면 메뉴 건너뛰기
          }

          // 슈퍼어드민이 아닌 경우 모든 사용자에게 표시 (기관관리자, 일반사용자 모두 포함)
          console.log(
            `${route.name} 메뉴 접근 가능 - 슈퍼어드민이 아닌 모든 사용자 (기관관리자 및 일반사용자)`
          );
        }

        console.log(
          '현재 기관관리자 ? isCurrentInstAdmin : ',
          isCurrentInstAdmin
        );

        const menuItem = userMenuList.find((item) => item.id === route.name);

        const menu = {
          title: route.meta.title,
          lv2: [],
          active: false,
          name: route.name,
          icon: route.meta.icon,
          lv2Height: 0,
          path: route.path,
          redirect: route.redirect,
        };

        route.meta.navi &&
          route.children &&
          route.children.forEach((sub1) => {
            console.log('sub1 : ', sub1);

            if (sub1.meta.navi) {
              // 슈퍼 어드민 전용 하위 메뉴들 (ROLE_SUPER 권한 필요)
              if (
                (sub1.name === 'MFMN0906' ||
                  sub1.name === 'MFMN0910' ||
                  sub1.name === 'MFMN0912' ||
                  sub1.name === 'MFMN0913') &&
                !isSuperRole
              ) {
                console.log(
                  `${sub1.name} 메뉴는 ROLE_SUPER 권한이 필요합니다. 현재 권한:`,
                  userRoles
                );
                return; // ROLE_SUPER 권한이 없으면 이 메뉴는 건너뛰기
              }

              // 상세화면 탭생성시 link: sub1.redirect
              // 상세화면 생략시 link: sub1.path
              const lv2Menu = {
                title: sub1.meta.title,
                type: sub1.meta.type,
                link: sub1.path,
                name: sub1.name, // 디버깅을 위해 name 추가
              };

              menu.lv2.push(lv2Menu);
            }
          });
        menus.push(menu);
      }
    });

    console.log('menus=', menus);

    if (getUserStateStorage().includes('SEED')) {
      return menus.filter((menu) => menu.title === '대시보드');
    } else {
      return menus;
    }
  };

  // const generateNavis = () => {
  //   console.log('userInfo : ', userInfo.value);

  //   let menus = [];
  //   console.log('getRoute : ', { getRoutes });

  //   // 사용자 권한 정보 가져오기
  //   const userRoles = getUserRoleFromStorage();
  //   console.log('getUserRoleFromStorage : ', userRoles);

  //   // ROLE_SUPER 권한 확인
  //   const isSuperRole = userRoles && userRoles.includes('ROLE_SUPER');
  //   console.log('isSuperRole : ', isSuperRole);

  //   // 또는 ROLE_ADMIN으로 시작하는 모든 권한을 체크하려면:
  //   const isAdminRolePartial =
  //     userRoles && userRoles.some((role) => role.startsWith('ROLE_ADMIN'));
  //   console.log('isAdminRolePartial : ', isAdminRolePartial);

  //   // 관리자 기관 목록 가져오기
  //   const adminInstList = JSON.parse(getUserAdminInstIdFromStorage());
  //   console.log('getUserAdminInstIdFromStorage : ', adminInstList);
  //   console.log('useMetaMngInstId : ', useMetaMngInstId);

  //   // 현재 설정된 기관이 관리자 기관 목록에 포함되어 있는지 확인
  //   const isCurrentInstAdmin =
  //     adminInstList &&
  //     adminInstList.some((inst) => inst.instituteId === useMetaMngInstId);
  //   console.log('isCurrentInstAdmin : ', isCurrentInstAdmin);

  //   getRoutes.forEach((route) => {
  //     if (route.meta && route.meta.navi) {
  //       // 연구실(MFMN0090) 메뉴 접근 조건 확인
  //       if (route.name === 'MFMN0090') {
  //         // 다음 조건 중 하나라도 만족하면 메뉴 표시
  //         // 1. ROLE_SUPER 권한이 있는 경우
  //         // 2. userTypeCd가 '00'인 경우 (관리자 타입)
  //         // 3. 현재 기관의 어드민인 경우
  //         const canAccessLabMenu =
  //           // isSuperRole ||
  //           userInfo.value.userTypeCd === '00' || isCurrentInstAdmin;

  //         console.log(`${route.name} 메뉴 접근 권한 확인:`, {
  //           isSuperRole,
  //           userTypeCd: userInfo.value.userTypeCd,
  //           isCurrentInstAdmin,
  //           canAccess: canAccessLabMenu,
  //         });

  //         if (!canAccessLabMenu) {
  //           console.log(
  //             `${route.name} 메뉴는 다음 조건 중 하나를 만족해야 합니다:`,
  //             '1. ROLE_SUPER 권한',
  //             '2. userTypeCd가 "00"',
  //             '3. 현재 기관의 어드민'
  //           );
  //           return; // 조건을 만족하지 않으면 메뉴 건너뛰기
  //         }
  //       }

  //       // 슈퍼 어드민 시스템관리(MFMN0900) 메뉴 접근 조건 확인
  //       if (route.name === 'MFMN0900') {
  //         // ROLE_SUPER 권한이 있어야만 표시
  //         if (!isSuperRole) {
  //           console.log(
  //             `${route.name} 메뉴는 ROLE_SUPER 권한이 필요합니다. 현재 권한:`,
  //             userRoles
  //           );
  //           return; // ROLE_SUPER 권한이 없으면 메뉴 건너뛰기
  //         }
  //       }

  //       // 기관 어드민 시스템관리(MFMN1100) 메뉴 접근 조건 확인
  //       if (
  //         route.name === 'MFMN1100' ||
  //         route.name === 'MFMN0400' ||
  //         route.name === 'MFMN0500' ||
  //         route.name === 'MFMN0700' ||
  //         route.name === 'MFMN1000'
  //       ) {
  //         // 슈퍼어드민이면 이 메뉴는 표시하지 않음
  //         if (isSuperRole) {
  //           console.log(
  //             `${route.name} 메뉴는 슈퍼어드민에게는 표시되지 않습니다.`
  //           );
  //           return; // 슈퍼어드민이면 메뉴 건너뛰기
  //         }

  //         // 슈퍼어드민이 아닌 경우에만 다음 조건 확인
  //         // 1. userTypeCd가 '00'인 경우 (관리자 타입)
  //         // 2. 현재 기관의 어드민인 경우
  //         const canAccessInstAdminMenu =
  //           userInfo.value.userTypeCd === '00' || isCurrentInstAdmin;

  //         console.log(`${route.name} 메뉴 접근 권한 확인:`, {
  //           isSuperRole,
  //           userTypeCd: userInfo.value.userTypeCd,
  //           isCurrentInstAdmin,
  //           canAccess: canAccessInstAdminMenu,
  //         });

  //         if (!canAccessInstAdminMenu) {
  //           console.log(
  //             `${route.name} 메뉴는 다음 조건 중 하나를 만족해야 합니다:`,
  //             '1. userTypeCd가 "00"',
  //             '2. 현재 기관의 어드민'
  //           );
  //           return; // 조건을 만족하지 않으면 메뉴 건너뛰기
  //         }
  //       }

  //       console.log(
  //         '현재 기관관리자 ? isCurrentInstAdmin : ',
  //         isCurrentInstAdmin
  //       );

  //       const menuItem = userMenuList.find((item) => item.id === route.name);

  //       const menu = {
  //         title: route.meta.title,
  //         lv2: [],
  //         active: false,
  //         name: route.name,
  //         icon: route.meta.icon,
  //         lv2Height: 0,
  //         path: route.path,
  //         redirect: route.redirect,
  //       };

  //       route.meta.navi &&
  //         route.children &&
  //         route.children.forEach((sub1) => {
  //           console.log('sub1 : ', sub1);

  //           if (sub1.meta.navi) {
  //             // 슈퍼 어드민 전용 하위 메뉴들 (ROLE_SUPER 권한 필요)
  //             if (
  //               (sub1.name === 'MFMN0906' ||
  //                 sub1.name === 'MFMN0910' ||
  //                 sub1.name === 'MFMN0912' ||
  //                 sub1.name === 'MFMN0913') &&
  //               !isSuperRole
  //             ) {
  //               console.log(
  //                 `${sub1.name} 메뉴는 ROLE_SUPER 권한이 필요합니다. 현재 권한:`,
  //                 userRoles
  //               );
  //               return; // ROLE_SUPER 권한이 없으면 이 메뉴는 건너뛰기
  //             }

  //             // 기관 어드민 전용 하위 메뉴들 (기관 관리자 권한 필요)
  //             // 예: MFMN1100의 하위 메뉴들이 있다면 여기에 추가
  //             // if (
  //             //   (sub1.name === 'MFMN1101' ||
  //             //    sub1.name === 'MFMN1102') &&
  //             //   !isCurrentInstAdmin
  //             // ) {
  //             //   console.log(
  //             //     `${sub1.name} 메뉴는 기관 관리자 권한이 필요합니다.`
  //             //   );
  //             //   return; // 기관 관리자 권한이 없으면 이 메뉴는 건너뛰기
  //             // }

  //             // 상세화면 탭생성시 link: sub1.redirect
  //             // 상세화면 생략시 link: sub1.path
  //             const lv2Menu = {
  //               title: sub1.meta.title,
  //               type: sub1.meta.type,
  //               link: sub1.path,
  //               name: sub1.name, // 디버깅을 위해 name 추가
  //             };

  //             menu.lv2.push(lv2Menu);
  //           }
  //         });
  //       menus.push(menu);
  //     }
  //   });

  //   console.log('menus=', menus);

  //   if (getUserStateStorage().includes('SEED')) {
  //     return menus.filter((menu) => menu.title === '대시보드');
  //   } else {
  //     return menus;
  //   }
  // };

  const naviData = reactive(generateNavis());
  console.log('naviData=', naviData);

  // GS 인증용 메뉴
  const filteredGsNaviData = reactive(
    [naviData[2], naviData[3]].filter(Boolean)
  );

  const onSideNavi = () => {
    setSideState('wide');
    gridResizeCheck();
  };

  const router = useRouter();
  const onMain = () => {
    router.replace('/dashboard');
    setTabNaviData({ title: '대시보드', path: '/dashboard' });
  };
</script>
