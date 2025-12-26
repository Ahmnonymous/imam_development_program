import { takeEvery, fork, put, all, call } from "redux-saga/effects"

//Account Redux states
import { REGISTER_USER } from "./actionTypes"
import { registerUserSuccessful, registerUserFailed } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import { register } from "../../../helpers/jwt-token-access/auth-token-header"
import {
  postFakeRegister,
  postJwtRegister,
} from "../../../helpers/fakebackend_helper"

// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend()

// Is user register successfull then direct plot user in redux.
function* registerUser({ payload: { user } }) {
  console.log("📝 Register saga started for user:", user.username)
  try {
    console.log("📝 Trying to register user (within try block)")
    const authType = import.meta.env.VITE_APP_DEFAULTAUTH || "jwt"
    
    if (authType === "firebase") {
      const response = yield call(
        fireBaseBackend.registerUser,
        user.email,
        user.password
      )
      yield put(registerUserSuccessful(response))
    } else if (authType === "jwt") {
      // Use the register helper which uses configured axiosApi
      const response = yield call(
        register,
        user.name,
        user.surname,
        user.username,
        user.password,
        user.confirmPassword
      )
      console.log("✅ Register response received:", response)
      yield put(registerUserSuccessful(response))
    } else if (authType === "fake") {
      const response = yield call(postFakeRegister, user)
      yield put(registerUserSuccessful(response))
    } else {
      // Default to JWT if auth type is not recognized
      console.log("⚠️ Unknown auth type, defaulting to JWT")
      const response = yield call(
        register,
        user.name,
        user.surname,
        user.username,
        user.password,
        user.confirmPassword
      )
      yield put(registerUserSuccessful(response))
    }
  } catch (error) {
    console.error("❌ Register error:", error)
    const errorMessage = error?.response?.data?.msg || error?.message || "Registration failed"
    yield put(registerUserFailed(errorMessage))
  }
}

export function* watchUserRegister() {
  yield takeEvery(REGISTER_USER, registerUser)
}

function* accountSaga() {
  yield all([fork(watchUserRegister)])
}

export default accountSaga
