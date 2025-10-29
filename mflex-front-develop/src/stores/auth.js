import { defineStore } from 'pinia';
import {
  getAuthFromCookie,
  getUserFromStorage,
  getUserStateStorage,
  deleteStorage,
  deleteCookie,
  getUserDctnryListFromStorage,
  getUserInfoSysListFromStorage,
  getUserMenuFromStorage,
  getUserMetaMngInstListFromStorage,
  getUserSbjarListFromStorage,
  getUserStngToStorage,
  getUserMetaMngInstIdFromStorage,
  getUserAdminInstIdFromStorage,
  getUserGroupIdFromStorage,
  getUserGroupFromStorage,
} from '@/utils/cookies';
import { saveAuthToCookie } from '../utils/cookies';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(getUserFromStorage()) || {},
    // token: null,
    token: getAuthFromCookie() || null,
    userState: getUserStateStorage() || null,
    userMenuList: JSON.parse(getUserMenuFromStorage()) || [],
    userMetaMngInstList: JSON.parse(getUserMetaMngInstListFromStorage()) || [],
    userInstituteAdminList: JSON.parse(getUserAdminInstIdFromStorage()) || [],
    userDctnryList: JSON.parse(getUserDctnryListFromStorage()) || [],
    userSbjarList: JSON.parse(getUserSbjarListFromStorage()) || [],
    userInfoSysList: JSON.parse(getUserInfoSysListFromStorage()) || [],
    userStng: JSON.parse(getUserStngToStorage()) || {},
    userMetaMngInstId: getUserMetaMngInstIdFromStorage(),
    userGroupList: JSON.parse(getUserGroupFromStorage()) || [],
    userGroupId: getUserGroupIdFromStorage(),
  }),
  getters: {
    isLoggedIn(state) {
      return state.token;
    },
    userToken(state) {
      // console.log('게터토큰 ------:', state.token);
      return state.token;
    },
    userState(state) {
      return state.userState;
    },
    userInfo(state) {
      return state.user;
    },
    userMenuListInfo(state) {
      return state.userMenuList;
    },
    userMetaMngInstListInfo(state) {
      return state.userMetaMngInstList;
    },
    userDctnryListInfo(state) {
      return state.userDctnryList;
    },
    userSbjarListInfo(state) {
      return state.userSbjarList;
    },
    userInfoSysListInfo(state) {
      return state.userInfoSysList;
    },
    userStngInfo(state) {
      return state.userStng;
    },
  },
  actions: {
    setUser(user) {
      this.user = user;
    },
    setUserState(userState) {
      console.log('유저스테이트 : ', `${userState}`);
      this.userState = userState;
    },
    setToken(token) {
      // console.log('세터 토큰 ====== :', token);
      this.token = token;
    },
    setUserMenuList(userMenuList) {
      this.userMenuList = userMenuList;
    },
    setUserMetaMngInstList(userMetaMngInstList) {
      this.userMetaMngInstList = userMetaMngInstList;
    },
    setUserDctnryList(userDctnryList) {
      this.userDctnryList = userDctnryList;
    },
    setUserSbjarList(userSbjarList) {
      this.userSbjarList = userSbjarList;
    },
    setUserInfoSysList(userInfoSysList) {
      this.userInfoSysList = userInfoSysList;
    },
    setUserStngInfo(userStng) {
      this.userStng = userStng;
    },
    setUserStngMetaMngInstId(newUseMetaMngInstId) {
      this.userStng.useMetaMngInstId = newUseMetaMngInstId;
    },
    setUserStngInfoSysId(newUseInfoSysId) {
      this.userStng.useInfoSysId = newUseInfoSysId;
    },
    setUserStngDctnryId(newUseDctnryId) {
      this.userStng.useDctnryId = newUseDctnryId;
    },
    setUserMetaMngInstId(userMetaMngInstId) {
      this.userMetaMngInstId = userMetaMngInstId;
    },
    setUserAdminInstId(userAdminInstId) {
      this.userInstituteAdminList = userAdminInstId;
    },
    setUserGroupList(userGroupList) {
      this.userGroupList = userGroupList;
    },
    setUserGroupId(userGroupId) {
      this.userGroupId = userGroupId;
    },
    resetAuth() {
      // console.log('스토어 클리어 호출 ================');
      this.user = {};
      this.token = null;
      this.userMenuList = [];
      this.userMetaMngInstList = [];
      this.userDctnryList = [];
      this.userSbjarList = [];
      this.userInfoSysList = [];
      this.userStng = {};
      // this.userState = null;
      deleteCookie('x_auth');
      saveAuthToCookie(null);
      console.log('this.userToken : ', this.userToken);
      // deleteCookie('ajs_anonymous_id');
      deleteStorage('x_user');
    },
  },
});
