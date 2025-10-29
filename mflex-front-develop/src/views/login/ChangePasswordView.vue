<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="form-box">
        <form @submit.prevent="submitForm" class="form">
          <div class="form-header">
            <div class="logo-text">
              {{ userName }} 회원님 안녕하세요!<br />회원님의 비밀번호를
              설정해주세요.
            </div>
          </div>
          <div class="form-body">
            <div class="login-inputs">
              <div class="input-password">
                <input
                  style="margin-bottom: 14px"
                  id="password"
                  name="password"
                  type="password"
                  class="password"
                  placeholder="비밀번호"
                  autocomplete="off"
                />
                <span class="icon"></span>
              </div>
              <div class="input-password">
                <input
                  id="password-check"
                  name="password-check"
                  type="password-check"
                  class="password"
                  placeholder="비밀번호 확인"
                  autocomplete="off"
                />
                <span class="icon"></span>
              </div>
            </div>

            <div class="login-btns">
              <button type="submit" class="btn-login" ref="loginButton">
                비밀번호 재설정
              </button>
            </div>

            <!-- <div class="check-area">
              <span class="checkbox-wrap">
                <input type="checkbox" id="saveUserId" v-model="checkSaveId" />
                <label for="saveUserId">아이디 저장</label>
              </span>
            </div> -->
          </div>
        </form>

        <div class="login-copyright"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const userName = route.query.username;

  console.log('유저 네임 :', userName);
</script>
