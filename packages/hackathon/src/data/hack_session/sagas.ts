/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import { all, call, put, takeEvery } from 'redux-saga/effects'
import { actionMessage, beginLoading, endLoading } from '../common/actions'
import { sheetsSdkHelper } from '../sheets_sdk_helper'
import {
  Actions,
  initHackSessionSuccess,
  initHackSessionFailure,
} from './actions'

function* initializeHackSessionSaga() {
  let hacker
  try {
    // TODO investigate use of saga effects to invoke in parallel
    yield put(beginLoading())
    hacker = yield call([sheetsSdkHelper, sheetsSdkHelper.getHacker])
    const hackathon = yield call([
      sheetsSdkHelper,
      sheetsSdkHelper.getCurrentHackathon,
    ])
    if (hackathon) {
      yield call(
        [sheetsSdkHelper, sheetsSdkHelper.registerUser],
        hackathon,
        hacker
      )
    }
    const technologies = yield call([
      sheetsSdkHelper,
      sheetsSdkHelper.getTechnologies,
    ])
    yield put(endLoading())
    yield put(initHackSessionSuccess(hackathon, technologies, hacker))
  } catch (err) {
    console.error(err)
    if (hacker) {
      yield put(initHackSessionFailure(hacker))
      yield put(
        actionMessage(
          'A problem occurred loading the data. Has the extension been configured?',
          'critical'
        )
      )
    } else {
      yield put(
        actionMessage('A problem occurred loading the data', 'critical')
      )
    }
  }
}

export function* registerHackSessionSagas() {
  yield all([
    takeEvery(Actions.INIT_HACK_SESSION_REQUEST, initializeHackSessionSaga),
  ])
}
