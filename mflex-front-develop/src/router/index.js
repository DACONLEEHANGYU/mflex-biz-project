import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSpinner } from '@/composables/spinner';
import { useAlert } from '@/composables/alert';

export const getRoutes = [
  {
    path: '/',
    redirect: '/login',
    meta: { auth: false, navi: false },
  },
  {
    path: '/login',
    component: () => import('@/views/login/LoginView.vue'),
    name: 'login',
    meta: { auth: false, navi: false },
  },
  {
    path: '/noneAcceptUserPage',
    component: () => import('@/views/login/NoneAcceptUserPage.vue'),
    name: 'noneAcceptUserPage',
    meta: { auth: false, navi: false },
  },
  {
    path: '/dashboard',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/dashboard/view',
    name: 'MFMN0100',
    meta: {
      navi: true,
      title: '대시보드',
      icon: 'dashboard',
      location: '대시보드',
    },
    children: [
      {
        path: '/dashboard/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dashboard/view/list',
        name: 'MFMN0100',
        meta: {
          navi: false,
          title: '대시보드',
          location: '대시보드',
        },
        children: [
          {
            path: '/dashboard/view/list/:id?',
            component: () => import('@/views/dashboard/DashboardView.vue'),
            meta: {
              auth: true,
              title: '대시보드',
              location: '대시보드',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/bizMetaMng',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/bizMetaMng',
    name: 'MFMN0200',
    meta: {
      navi: true,
      title: '비즈니스메타관리',
      icon: 'dicMng',
      location: '비즈니스메타관리',
    },
    children: [
      {
        path: '/bizMetaMng/mng',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/bizMetaMng/mng/list',
        name: 'MFMN0201',
        meta: {
          navi: true,
          title: '비즈니스메타 등록',
          location: '비즈니스메타 등록',
        },
        children: [
          {
            path: '/bizMetaMng/mng/list',
            component: () => import('@/views/bizMetaMng/BizMetaMngView.vue'),
            meta: {
              auth: true,
              type: 'termSearch',
              title: '비즈니스메타 등록',
              location: '비즈니스메타 등록',
            },
          },
        ],
      },
    ],
  },
  // {
  //   path: '/totalSearch',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/totalSearch/view',
  //   name: 'MFMN0200',
  //   meta: {
  //     navi: true,
  //     title: '통합검색',
  //     icon: 'search',
  //     location: '통합검색',
  //   },
  //   children: [
  //     {
  //       path: '/totalSearch/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/totalSearch/view/list',
  //       meta: {
  //         navi: false,
  //         title: '통합검색',
  //         location: '통합검색',
  //       },
  //       children: [
  //         {
  //           path: '/totalSearch/view/list',
  //           component: () => import('@/views/totalSearch/TotalSearchView.vue'),
  //           meta: {
  //             auth: true,
  //             title: '통합검색',
  //             location: '통합검색',
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },

  // {
  //   path: '/dictionarySearch',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/dictionarySearch/view/term',
  //   name: 'MFMN0300',
  //   meta: {
  //     navi: true,
  //     title: '사전조회',
  //     icon: 'dicSearch',
  //     location: '사전조회',
  //   },
  //   children: [
  //     {
  //       path: 'view/term',
  //       component: () =>
  //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //       name: 'TermSearch',
  //       meta: {
  //         navi: true,
  //         type: 'termSearch',
  //         title: '용어조회',
  //         location: '용어조회',
  //       },
  //     },
  //     {
  //       path: 'view/word',
  //       component: () =>
  //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //       name: 'WordSearch',
  //       meta: {
  //         navi: true,
  //         type: 'wordSearch',
  //         title: '단어조회',
  //         location: '단어조회',
  //       },
  //     },
  //     {
  //       path: 'view/domain',
  //       component: () =>
  //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //       name: 'DomainSearch',
  //       meta: {
  //         navi: true,
  //         type: 'domainSearch',
  //         title: '도메인조회',
  //         location: '도메인조회',
  //       },
  //     },
  //     {
  //       path: 'view/code',
  //       component: () =>
  //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //       name: 'CodeSearch',
  //       meta: {
  //         navi: true,
  //         type: 'codeSearch',
  //         title: '코드조회',
  //         location: '코드조회',
  //       },
  //     },
  //   ],
  // },

  // {
  //   path: '/dictionarySearch',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/dictionarySearch/view',
  //   name: 'MFMN0300',
  //   meta: {
  //     navi: true,
  //     title: '사전조회',
  //     icon: 'dicSearch',
  //     location: '사전조회',
  //   },
  //   children: [
  //     {
  //       path: '/dictionarySearch/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/dictionarySearch/view/list/termsearch',
  //       name: 'MFMN0301',
  //       meta: {
  //         navi: true,
  //         type: 'termSearch',
  //         title: '용어조회',
  //         location: '용어조회',
  //       },
  //       children: [
  //         {
  //           path: 'list/term', // 상대 경로로 설정
  //           component: () =>
  //             import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //           meta: {
  //             auth: true,
  //             type: 'termSearch',
  //             title: '용어조회',
  //             location: '용어 조회',
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/dictionarySearch/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/dictionarySearch/view/list/wordsearch',
  //       name: 'MFMN0302',
  //       meta: {
  //         navi: true,
  //         type: 'wordSearch',
  //         title: '단어조회',
  //         location: '단어조회',
  //       },
  //       children: [
  //         {
  //           path: 'list/word', // 동일한 경로, 다른 설정 가능
  //           component: () =>
  //             import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //           meta: {
  //             auth: true,
  //             type: 'wordSearch',
  //             title: '단어 조회',
  //             location: '단어 조회',
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/dictionarySearch/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/dictionarySearch/view/list/domainsearch',
  //       name: 'MFMN0303',
  //       meta: {
  //         navi: true,
  //         type: 'domainSearch',
  //         title: '도메인조회',
  //         location: '도메인조회',
  //       },
  //       children: [
  //         {
  //           path: 'list/domain', // 동일한 경로, 다른 설정 가능
  //           component: () =>
  //             import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //           meta: {
  //             auth: true,
  //             type: 'domainSearch',
  //             title: '도메인조회',
  //             location: '도메인조회',
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/dictionarySearch/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/dictionarySearch/view/list/codesearch',
  //       name: 'MFMN0304',
  //       meta: {
  //         navi: true,
  //         type: 'codeSearch',
  //         title: '코드조회',
  //         location: '코드조회',
  //       },
  //       children: [
  //         {
  //           path: 'list/code', // 동일한 경로, 다른 설정 가능
  //           component: () =>
  //             import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //           meta: {
  //             auth: true,
  //             type: 'codeSearch',
  //             title: '코드조회',
  //             location: '코드조회',
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },

  // {
  //   path: '/dictionarySearch',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/dictionarySearch/term',
  //   name: 'MFMN0300',
  //   meta: {
  //     navi: true,
  //     title: '사전조회',
  //     icon: 'dicSearch',
  //     location: '사전조회',
  //   },
  //   children: [
  //     {
  //       path: '/dictionarySearch/term/:data?',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/dictionarySearch/term/list',
  //       name: 'MFMN0301',
  //       meta: {
  //         navi: true,
  //         title: '용어조회',
  //         location: '용어조회',
  //       },
  //       children: [
  //         {
  //           path: '/dictionarySearch/term/list/:data?',
  //           component: () =>
  //             import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //           meta: {
  //             auth: true,
  //             type: 'termSearch',
  //             title: '용어조회',
  //             location: '용어조회',
  //           },
  //         },
  //       ],
  //     },
  //     // {
  //     //   path: '/dictionarySearch/word/:data?',
  //     //   component: () => import('@/views/SubRouterInnerView.vue'),
  //     //   redirect: '/dictionarySearch/word/list',
  //     //   name: 'MFMN0302',
  //     //   props: true,
  //     //   meta: {
  //     //     navi: true,
  //     //     title: '단어조회',
  //     //     location: '단어조회',
  //     //   },
  //     //   children: [
  //     //     {
  //     //       path: '/dictionarySearch/word/list/:data?',
  //     //       component: () =>
  //     //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //     //       props: true,
  //     //       meta: {
  //     //         auth: true,
  //     //         type: 'wordSearch',
  //     //         title: '단어조회',
  //     //         location: '단어조회',
  //     //       },
  //     //     },
  //     //   ],
  //     // },
  //     // {
  //     //   path: '/dictionarySearch/domain/:data?',
  //     //   component: () => import('@/views/SubRouterInnerView.vue'),
  //     //   redirect: '/dictionarySearch/domain/list',
  //     //   name: 'MFMN0303',
  //     //   meta: {
  //     //     navi: true,
  //     //     title: '도메인조회',
  //     //     location: '도메인조회',
  //     //   },
  //     //   children: [
  //     //     {
  //     //       path: '/dictionarySearch/domain/list/:data?',
  //     //       component: () =>
  //     //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //     //       meta: {
  //     //         auth: true,
  //     //         type: 'domainSearch',
  //     //         title: '도메인조회',
  //     //         location: '도메인조회',
  //     //       },
  //     //     },
  //     //   ],
  //     // },
  //     // {
  //     //   path: '/dictionarySearch/code/:data?',
  //     //   component: () => import('@/views/SubRouterInnerView.vue'),
  //     //   redirect: '/dictionarySearch/code/list',
  //     //   name: 'MFMN0304',
  //     //   meta: {
  //     //     navi: true,
  //     //     title: '코드조회',
  //     //     location: '코드조회',
  //     //   },
  //     //   children: [
  //     //     {
  //     //       path: '/dictionarySearch/code/list/:data?',
  //     //       component: () =>
  //     //         import('@/views/dictionarySearch/DictionarySearchView.vue'),
  //     //       meta: {
  //     //         auth: true,
  //     //         type: 'codeSearch',
  //     //         title: '코드조회',
  //     //         location: '코드조회',
  //     //       },
  //     //     },
  //     //   ],
  //     // },
  //   ],
  // },
  {
    path: '/dictionaryMng',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/dictionaryMng/term',
    name: 'MFMN0400',
    meta: {
      navi: true,
      title: '사전관리',
      icon: 'dicMng',
      location: '사전관리',
    },
    children: [
      {
        path: '/dictionaryMng/search',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dictionaryMng/search/list',
        name: 'MFMN0301',
        meta: {
          navi: true,
          title: '사전조회',
          location: '사전조회',
        },
        children: [
          {
            path: '/dictionaryMng/search/list',
            component: () =>
              import('@/views/dictionarySearch/DictionarySearchView.vue'),
            meta: {
              auth: true,
              type: 'termSearch',
              title: '사전조회',
              location: '사전조회',
            },
          },
        ],
      },
      {
        path: '/dictionaryMng/term',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dictionaryMng/term/list',
        name: 'MFMN0401',
        meta: {
          navi: true,
          title: '용어등록',
          location: '용어등록',
        },
        children: [
          {
            path: '/dictionaryMng/term/list',
            component: () => import('@/views/dictionaryMng/TermView.vue'),
            meta: {
              auth: true,
              title: '용어등록',
              location: '용어등록',
            },
          },
        ],
      },
      {
        path: '/dictionaryMng/word',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dictionaryMng/word/list',
        name: 'MFMN0402',
        props: true,
        meta: {
          navi: true,
          title: '단어등록',
          location: '단어등록',
        },
        children: [
          {
            path: '/dictionaryMng/word/list',
            component: () => import('@/views/dictionaryMng/WordView.vue'),
            props: true,
            meta: {
              auth: true,
              title: '단어등록',
              location: '단어등록',
            },
          },
        ],
      },
      {
        path: '/dictionaryMng/domain',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dictionaryMng/domain/list',
        name: 'MFMN0403',
        meta: {
          navi: true,
          title: '도메인등록',
          location: '도메인등록',
        },
        children: [
          {
            path: '/dictionaryMng/domain/list',
            component: () => import('@/views/dictionaryMng/DomainView.vue'),
            meta: {
              auth: true,
              title: '도메인등록',
              location: '도메인등록',
            },
          },
        ],
      },
      {
        path: '/dictionaryMng/code',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dictionaryMng/code/list',
        name: 'MFMN0404',
        meta: {
          navi: true,
          title: '코드등록',
          location: '코드등록',
        },
        children: [
          {
            path: '/dictionaryMng/code/list',
            component: () => import('@/views/dictionaryMng/DomainView.vue'),
            meta: {
              auth: true,
              title: '코드등록',
              location: '코드등록',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/dataMng',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/dataMng/view',
    name: 'MFMN0500',
    meta: {
      navi: true,
      title: '데이터 구조관리',
      icon: 'data',
      location: '데이터 구조관리',
    },
    children: [
      // {
      //   path: '/dataMng/table',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/dataMng/table/list',
      //   name: 'MFMN0501',
      //   meta: {
      //     navi: true,
      //     title: '테이블 등록',
      //     location: '테이블 등록',
      //   },
      //   children: [
      //     {
      //       path: '/dataMng/table/list',
      //       component: () => import('@/views/dataMng/TableRegView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '테이블 등록',
      //         location: '테이블 등록',
      //       },
      //     },
      //   ],
      // },
      {
        path: '/dataMng/schema/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dataMng/schema/view/list',
        name: 'MFMN0502',
        meta: {
          navi: true,
          title: '스키마조회',
          location: '스키마조회',
        },
        children: [
          {
            path: '/dataMng/schema/view/list',
            component: () => import('@/views/dataMng/SchemaSearchView.vue'),
            meta: {
              auth: true,
              title: '스키마조회',
              location: '스키마조회',
            },
          },
        ],
      },
      //
      {
        path: '/dataMng/schemacollection/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dataMng/schemacollection/view/list',
        name: 'MFMN0505',
        meta: {
          navi: true,
          title: '스키마수집',
          location: '스키마수집',
        },
        children: [
          {
            path: '/dataMng/schemacollection/view/list',
            component: () => import('@/views/dataMng/SchemaCollectionView.vue'),
            meta: {
              auth: true,
              title: '스키마수집',
              location: '스키마수집',
            },
          },
        ],
      },
      {
        path: '/dataMng/schemaoption/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/dataMng/schemaoption/view/list',
        name: 'MFMN0506',
        meta: {
          navi: true,
          title: '스키마부가정보',
          location: '스키마부가정보',
        },
        children: [
          {
            path: '/dataMng/schemaoption/view/list',
            component: () => import('@/views/dataMng/SchemaOptionView.vue'),
            meta: {
              auth: true,
              title: '스키마부가정보',
              location: '스키마부가정보',
            },
          },
        ],
      },
      //
      // {
      //   path: '/dataMng/modelMng',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/dataMng/modelMng/list',
      //   name: 'MFMN0503',
      //   meta: {
      //     navi: true,
      //     title: '작업모델 관리',
      //     location: '작업모델 관리',
      //   },
      //   children: [
      //     {
      //       path: '/dataMng/modelMng/list',
      //       component: () => import('@/views/dataMng/ModelMngView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '작업모델 관리',
      //         location: '작업모델 관리',
      //       },
      //     },
      //   ],
      // },
      // {
      //   path: '/dataMng/modelSearch',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/dataMng/modelSearch/list',
      //   name: 'MFMN0504',
      //   meta: {
      //     navi: true,
      //     title: '작업모델 조회',
      //     location: '작업모델 조회',
      //   },
      //   children: [
      //     {
      //       path: '/dataMng/modelSearch/list',
      //       component: () => import('@/views/dataMng/ModelSearchView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '작업모델 조회',
      //         location: '작업모델 조회',
      //       },
      //     },
      //   ],
      // },
    ],
  },
  {
    path: '/actualizing',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/actualizing/table',
    name: 'MFMN0700',
    meta: {
      navi: true,
      title: '사전표준화',
      icon: 'actualizing',
      location: '사전표준화',
    },
    children: [
      {
        path: '/actualizing/table',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/actualizing/table/list',
        name: 'MFMN0701',
        meta: {
          navi: true,
          title: '테이블정제',
          location: '테이블정제',
        },
        children: [
          {
            path: '/actualizing/table/list',
            component: () => import('@/views/actualizing/TableRefineView.vue'),
            meta: {
              auth: true,
              title: '테이블정제',
              location: '테이블정제',
            },
          },
        ],
      },
      {
        path: '/actualizing/column',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/actualizing/column/list',
        name: 'MFMN0702',
        meta: {
          navi: true,
          title: '컬럼정제',
          location: '컬정정제',
        },
        children: [
          {
            path: '/actualizing/column/list',
            component: () => import('@/views/actualizing/ColumnRefineView.vue'),
            meta: {
              auth: true,
              title: '컬럼정제',
              location: '컬럼정제',
            },
          },
        ],
      },
      //
      {
        path: '/actualizing/term',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/actualizing/term/list',
        name: 'MFMN0703',
        meta: {
          navi: true,
          title: '용어사전표준화',
          location: '용어사전표준화',
        },
        children: [
          {
            path: '/actualizing/term/list',
            component: () =>
              import('@/views/actualizing/TermActualizingView.vue'),
            meta: {
              auth: true,
              title: '용어사전표준화',
              location: '용어사전표준화',
            },
          },
        ],
      },
      //
      {
        path: '/actualizing/word',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/actualizing/word/list',
        name: 'MFMN0704',
        meta: {
          navi: true,
          title: '단어사전표준화',
          location: '단어사전표준화',
        },
        children: [
          {
            path: '/actualizing/word/list',
            component: () =>
              import('@/views/actualizing/WordActualizingView.vue'),
            meta: {
              auth: true,
              title: '단어사전표준화',
              location: '단어사전표준화',
            },
          },
        ],
      },
      {
        path: '/actualizing/domain',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/actualizing/domain/list',
        name: 'MFMN0705',
        meta: {
          navi: true,
          title: '도메인사전표준화',
          location: '도메인사전표준화',
        },
        children: [
          {
            path: '/actualizing/domain/list',
            component: () =>
              import('@/views/actualizing/DomainActualizingView.vue'),
            meta: {
              auth: true,
              title: '도메인사전표준화',
              location: '도메인사전표준화',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/diagnosis',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/diagnosis/view',
    name: 'MFMN1000',
    meta: {
      navi: true,
      title: '통계/분석',
      icon: 'diagnosis',
      location: '통계/분석',
    },
    children: [
      {
        path: '/diagnosis/standard/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/diagnosis/standard/view/list',
        name: 'MFMN1010',
        meta: {
          navi: true,
          title: '표준진단',
          location: '표준진단',
        },
        children: [
          {
            path: '/diagnosis/standard/view/list/:id?',
            component: () =>
              import('@/views/diagnosis/DiagnosisStandardView.vue'),
            meta: {
              auth: true,
              title: '표준진단',
              location: '표준진단',
            },
          },
        ],
      },
      {
        path: '/diagnosis/statistics',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/diagnosis/statistics/list',
        name: 'MFMN1020',
        meta: {
          navi: true,
          title: '진단이력',
          location: '진단이력',
        },
        children: [
          {
            path: '/diagnosis/statistics/list',
            component: () =>
              import('@/views/diagnosis/DiagnosisStatisticsView.vue'),
            meta: {
              auth: true,
              title: '진단이력',
              location: '진단이력',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/approval',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/approval/view',
    name: 'MFMN1300',
    meta: {
      navi: true,
      title: '전자결재',
      icon: 'approval',
      location: '전자결재',
    },
    children: [
      {
        path: '/approval/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/approval/view/list',
        name: 'MFMN1300',
        meta: {
          navi: false,
          title: '전자결재',
          location: '전자결재',
        },
        children: [
          {
            path: '/approval/view/list/:id?',
            component: () => import('@/views/approvalMng/ApprovalMngView.vue'),
            meta: {
              auth: true,
              title: '전자결재',
              location: '전자결재',
            },
          },
        ],
      },

      // {
      //   path: '/approval/list/:id?',
      //   component: () => import('@/views/approvalMng/ApprovalMngView.vue'),
      //   meta: {
      //     auth: true,
      //     title: '전자결재',
      //     location: '전자결재',
      //   },
      // },
    ],
  },
  // {
  //   path: '/approvalMng',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/approvalMng/view',
  //   name: 'MFMN0800',
  //   meta: {
  //     navi: true,
  //     title: '결재관리',
  //     icon: 'approval',
  //     location: '결재관리',
  //   },
  //   children: [
  //     {
  //       path: '/approvalMng/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/approvalMng/view/list',
  //       meta: {
  //         navi: false,
  //         title: '결재관리',
  //         location: '결재관리',
  //       },
  //       children: [
  //         {
  //           path: '/approvalMng/view/list',
  //           component: () => import('@/views/approvalMng/ApprovalMngView.vue'),
  //           meta: {
  //             auth: true,
  //             title: '결재관리',
  //             location: '결재관리',
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   path: '/systemMng',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/systemMng/view',
  //   meta: {
  //     navi: true,
  //     title: '시스템 관리',
  //     icon: 'systemMng',
  //     location: '시스템 관리',
  //   },
  //   children: [
  //     {
  //       path: '/systemMng/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/systemMng/view/list',
  //       meta: {
  //         navi: false,
  //         title: '시스템 관리',
  //         location: '시스템 관리',
  //       },
  //       children: [
  //         {
  //           path: '/systemMng/view/list',
  //           component: () => import('@/views/systemMng/SystemMngView.vue'),
  //           meta: {
  //             auth: true,
  //             title: '시스템 관리',
  //             location: '시스템 관리',
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    path: '/systemMng',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/systemMng/dic',
    name: 'MFMN0900',
    meta: {
      navi: true,
      title: '시스템관리',
      icon: 'systemMng',
      location: '시스템관리',
    },
    children: [
      {
        path: '/systemMng/institute',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/institute/list',
        name: 'MFMN0906',
        meta: {
          navi: true,
          title: '기관설정',
          location: '기관설정',
        },
        children: [
          {
            path: '/systemMng/institute/list',
            component: () => import('@/views/systemMng/InstituteSetView.vue'),
            meta: {
              auth: true,
              title: '기관설정',
              location: '기관설정',
            },
          },
        ],
      },
      // {
      //   path: '/systemMng/organization',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/organization/list',
      //   name: 'MFMN0914',
      //   meta: {
      //     navi: true,
      //     title: '조직설정',
      //     location: '조직설정',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/organization/list',
      //       component: () =>
      //         import('@/views/systemMng/OrganizationSetView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '조직설정',
      //         location: '조직설정',
      //       },
      //     },
      //   ],
      // },
      // {
      //   path: '/systemMng/dic',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/dic/list',
      //   name: 'MFMN0901',
      //   meta: {
      //     navi: true,
      //     title: '사전설정',
      //     location: '사전설정',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/dic/list',
      //       component: () => import('@/views/systemMng/DictionarySetView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '사전설정',
      //         location: '사전설정',
      //       },
      //     },
      //   ],
      // },
      // {
      //   path: '/systemMng/system',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/system/list',
      //   name: 'MFMN0905',
      //   meta: {
      //     navi: true,
      //     title: '업무설정',
      //     location: '업무설정',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/system/list',
      //       component: () => import('@/views/systemMng/SystemSetView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '업무설정',
      //         location: '업무설정',
      //       },
      //     },
      //   ],
      // },
      // {
      //   path: '/systemMng/database',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/database/list',
      //   name: 'MFMN0902',
      //   meta: {
      //     navi: true,
      //     title: '데이터베이스설정',
      //     location: '데이터베이스설정',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/database/list',
      //       component: () => import('@/views/systemMng/DatabaseSetView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '데이터베이스설정',
      //         location: '데이터베이스설정',
      //       },
      //     },
      //   ],
      // },
      {
        path: '/systemMng/externaldict',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/externaldict/list',
        name: 'MFMN0910',
        meta: {
          navi: true,
          title: '공식사전관리',
          location: '공식사전관리',
        },
        children: [
          {
            path: '/systemMng/externaldict/list',
            component: () =>
              import('@/views/systemMng/ExternalDictionaryListView.vue'),
            meta: {
              auth: true,
              title: '공식사전관리',
              location: '공식사전관리',
            },
          },
        ],
      },
      {
        path: '/systemMng/externaldictversion',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/externaldictversion/list',
        name: 'MFMN0912',
        meta: {
          navi: true,
          title: '공식사전버전관리',
          location: '공식사전버전관리',
        },
        children: [
          {
            path: '/systemMng/externaldictversion/list',
            component: () =>
              import('@/views/systemMng/ExternalDictionaryVersionView.vue'),
            meta: {
              auth: true,
              title: '공식사전버전관리',
              location: '공식사전버전관리',
            },
          },
        ],
      },
      // {
      //   path: '/systemMng/externaldictbyinst',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/externaldictbyinst/list',
      //   name: 'MFMN0911',
      //   meta: {
      //     navi: true,
      //     title: '기관별공식사전관리',
      //     location: '기관별공식사전관리',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/externaldictbyinst/list',
      //       component: () =>
      //         import('@/views/systemMng/ExternalDictionaryByInstView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '기관별공식사전관리',
      //         location: '기관별공식사전관리',
      //       },
      //     },
      //   ],
      // },
      {
        path: '/systemMng/institueadminset',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/institueadminset/list',
        name: 'MFMN0913',
        meta: {
          navi: true,
          title: '기관관리자설정',
          location: '기관관리자설정',
        },
        children: [
          {
            path: '/systemMng/institueadminset/list',
            component: () =>
              import('@/views/systemMng/InstituteAdminSetView.vue'),
            meta: {
              auth: true,
              title: '기관관리자설정',
              location: '기관관리자설정',
            },
          },
        ],
      },
      // {
      //   path: '/systemMng/code',
      //   component: () => import('@/views/SubRouterInnerView.vue'),
      //   redirect: '/systemMng/code/list',
      //   name: 'MFMN0903',
      //   meta: {
      //     navi: true,
      //     title: '공통코드 설정',
      //     location: '공통코드 설정',
      //   },
      //   children: [
      //     {
      //       path: '/systemMng/code/list',
      //       component: () => import('@/views/systemMng/CommonCodeSetView.vue'),
      //       meta: {
      //         auth: true,
      //         title: '공통코드 설정',
      //         location: '공통코드 설정',
      //       },
      //     },
      //   ],
      // },
      {
        path: '/systemMng/user',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/user/list',
        name: 'MFMN0904',
        meta: {
          navi: true,
          title: '사용자 현황',
          location: '사용자 현황',
        },
        children: [
          {
            path: '/systemMng/user/list',
            component: () => import('@/views/systemMng/UserStatusView.vue'),
            meta: {
              auth: true,
              title: '사용자 현황',
              location: '사용자 현황',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/systemMng/instadmin',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/systemMng/instadmin/view',
    name: 'MFMN1100',
    meta: {
      navi: true,
      title: '시스템관리',
      icon: 'systemMng',
      location: '시스템관리',
    },
    children: [
      {
        path: '/systemMng/instadmin/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/instadmin/view/list',
        name: 'MFMN1100',
        meta: {
          navi: false,
          title: '시스템관리',
          location: '시스템관리',
        },
        children: [
          {
            path: '/systemMng/instadmin/view/list:id?',
            component: () =>
              import('@/views/instSystemMng/InstituteAdminSystemMngView.vue'),
            meta: {
              auth: true,
              title: '시스템관리',
              location: '시스템관리',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/systemMng/instadmin',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/systemMng/instadmin/view',
    name: 'MFMN1200',
    meta: {
      navi: true,
      title: '기관시스템관리',
      icon: 'systemMng',
      location: '기관시스템관리',
    },
    children: [
      {
        path: '/systemMng/instadmin/view',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/systemMng/instadmin/view/list',
        name: 'MFMN1200',
        meta: {
          navi: false,
          title: '기관시스템관리',
          location: '기관시스템관리',
        },
        children: [
          {
            path: '/systemMng/instadmin/view/list:id?',
            component: () =>
              import('@/views/instSystemMng/InstituteAdminSystemMngView.vue'),
            meta: {
              auth: true,
              title: '기관시스템관리',
              location: '기관시스템관리',
            },
          },
        ],
      },
    ],
  },

  // {
  //   path: '/preferences',
  //   component: () => import('@/views/SubRouterView.vue'),
  //   redirect: '/preferences/view',
  //   name: 'MFMN1000',
  //   meta: {
  //     navi: true,
  //     title: '환경설정',
  //     icon: 'system',
  //     location: '환경설정',
  //   },
  //   children: [
  //     {
  //       path: '/preferences/view',
  //       component: () => import('@/views/SubRouterInnerView.vue'),
  //       redirect: '/preferences/view/list',
  //       meta: {
  //         navi: false,
  //         title: '환경설정',
  //         location: '환경설정',
  //       },
  //       children: [
  //         {
  //           path: '/preferences/view/list',
  //           component: () => import('@/views/preferences/PreferencesView.vue'),
  //           meta: {
  //             auth: true,
  //             title: '환경설정',
  //             location: '환경설정',
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    path: '/devMng',
    component: () => import('@/views/SubRouterView.vue'),
    redirect: '/devMng/dic',
    name: 'MFMN0090',
    meta: {
      navi: true,
      title: '연구실',
      icon: 'devMng',
      location: '연구실',
    },
    children: [
      {
        path: '/devMng/text2sql',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/devMng/text2sql/list',
        name: 'MFMN0090',
        meta: {
          navi: true,
          title: 'Text2SQL',
          location: 'Text2SQL',
        },
        children: [
          {
            path: '/devMng/text2sql/list',
            component: () => import('@/views/devMng/Text2SqlView.vue'),
            meta: {
              auth: true,
              title: 'Text2SQL',
              location: 'Text2SQL',
            },
          },
        ],
      },
      {
        path: '/devMng/gridpaly',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/devMng/gridplay/list',
        name: 'MFMN0091',
        meta: {
          navi: true,
          title: '그리드플레이',
          location: '그리드플레이',
        },
        children: [
          {
            path: '/devMng/gridplay/list',
            component: () => import('@/views/devMng/GridPlayGroundView.vue'),
            meta: {
              auth: true,
              title: '그리드플레이',
              location: '그리드플레이',
            },
          },
        ],
      },
      {
        path: '/devMng/etymology',
        component: () => import('@/views/SubRouterInnerView.vue'),
        redirect: '/devMng/etymology/list',
        name: 'MFMN0092',
        meta: {
          navi: true,
          title: '어원기반분할',
          location: '어원기반분할',
        },
        children: [
          {
            path: '/devMng/etymology/list',
            component: () => import('@/views/devMng/EtymologyDivideView.vue'),
            meta: {
              auth: true,
              title: '어원기반분할',
              location: '어원기반분할',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { auth: false, navi: false },
  },

  //기존 코드
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFoundView.vue'),
    redirect: '/404',
    meta: { auth: false, navi: false },
  },

  // // 수정된 코드
  // {
  //   path: '/:pathMatch(.*)*',
  //   component: () => import('@/views/NotFoundView.vue'),
  //   // redirect를 제거하고 직접 컴포넌트를 로드합니다
  //   meta: { auth: false, navi: false },
  // },
];

const router = createRouter({
  // history: createWebHistory('/dev/'),
  history: createWebHashHistory(),
  routes: getRoutes,
  scrollBehavior() {
    return { top: 0, left: 0 };
  },
});

router.beforeEach((to, from, next) => {
  //인증
  const authStore = useAuthStore();
  const { isLoggedIn } = authStore;

  //Spinner
  const { setSpinnerStatus } = useSpinner();

  //Alert
  const { setAlertStatus } = useAlert();

  setSpinnerStatus(false);
  setAlertStatus({ view: false, message: '' });

  console.log('네비게이션 가드 isLoggedIn=', isLoggedIn);
  console.log('to.meta.auth=', to.meta.auth);

  //인증 체크
  if (to.meta.auth && !isLoggedIn) {
    router.replace('/');
  } else {
    // console.log('from.path=', from.path);
    // console.log('to.path=', to.path);
    next();
  }
});

// router.afterEach((to, from) => {
//   const contentsWrap = document.querySelector('.contents-wrap');
//   console.log('router - contentsWrap', contentsWrap);
//   if (contentsWrap) {
//     contentsWrap.style.paddingTop = '10px'; // 원하는 크기로 업데이트
//   }
// });

export default router;
