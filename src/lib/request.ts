import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios'
// import storage from "./storage";
// import useUserInfoStore from "@/store/userInfo";
import {throttle} from 'lodash'

import {clearStorage, get} from '#/state/persisted'
import {BSKY_SERVICE, DAO_SERVICE} from './constants'

// const isServer = typeof window === "undefined";
export const SERVER = DAO_SERVICE

function getToken() {
  const session = get('session')
  return session.currentAccount?.daoJwt
}

export const throttleLogout = throttle(
  () => {
    // useUserInfoStore.getState().logout();
    clearStorage()
    window.location.href = '/'
    // window.localStorage.clear();
  },
  300,
  {trailing: false},
)

export type RequestConfig = AxiosRequestConfig & {
  // 获取完整的axios响应，否则只返回data
  getWholeResponse?: boolean
  // 获取完成的业务数据，否则只返回业务数据的data
  getWholeBizData?: boolean
}

type ConfigWithWholeResponse = AxiosRequestConfig & {
  getWholeResponse: true
}

type ConfigWithWholeBizData = AxiosRequestConfig & {
  getWholeBizData: true
}

type ConfigWithOriginData = AxiosRequestConfig & {
  getWholeResponse: true
  getWholeBizData: true
}

declare namespace API {
  interface Response<T = any> {
    code: number
    message: string
    data: T | null
    success?: boolean
    errorData?: Array<{
      errorCode: string
      errorMessage: string
      propertyName: string
    }>
  }
}

export async function requestAPI<T = unknown, O = ConfigWithOriginData>(
  url: string,
  config: O,
): Promise<AxiosResponse<API.Response<T>>>
export async function requestAPI<T = unknown, O = ConfigWithWholeResponse>(
  url: string,
  config: O,
): Promise<AxiosResponse<T>>
export async function requestAPI<T = unknown, O = ConfigWithWholeBizData>(
  url: string,
  config: O,
): Promise<API.Response<T>>
export async function requestAPI<T = unknown, O = RequestConfig>(
  url: string,
  config: O,
): Promise<T>
export async function requestAPI(url: string, config: RequestConfig) {
  let response = null
  try {
    response = await axios(`${SERVER}${url}`, {
      ...config,
      headers: {
        Authorization: getToken(),
        'Accept-Language': 'en',
        ...config.headers,
      },
    })
  } catch (e: any) {
    const resData = e.response?.data
    response = {
      data: {
        code: resData?.code ?? e.status,
        message: resData?.message ?? e.message,
        data: null,
      },
    }
  }

  if (response?.data?.code === 401) {
    console.log('trigger 401')
    // window.alert(`401: ${url}`);
    debugger
    throttleLogout()
  }

  const bizDataOnly = config.getWholeBizData !== true
  if (bizDataOnly && config.responseType !== 'blob')
    response.data = response.data.data

  const getResponse = config.getWholeResponse === true
  return getResponse ? response : response.data
}

export type FetchAPIReturnType<
  OPTIONS extends AxiosRequestConfig,
  ReturnDataType,
> = OPTIONS extends ConfigWithOriginData
  ? Promise<AxiosResponse<API.Response<ReturnDataType | null>>>
  : OPTIONS extends ConfigWithWholeResponse
  ? Promise<AxiosResponse<ReturnDataType | null>>
  : OPTIONS extends ConfigWithWholeBizData
  ? Promise<API.Response<ReturnDataType | null>>
  : Promise<ReturnDataType | null>
