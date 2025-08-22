import {type ImagePickerAsset} from 'expo-image-picker'

export type VideoState =
  | {
      status: 'error'
      asset: ImagePickerAsset | null
      progress: number
      error: string
    }
  | {
      status: 'uploading'
      asset: ImagePickerAsset
      progress: number
      error: undefined
    }
  | {
      status: 'done'
      asset: ImagePickerAsset
      progress: number
      fileId: string
      error: undefined
    }

export type VideoMedia = {
  type: 'video'
  video: VideoState
}

export type VideoAction =
  | {type: 'uploading'}
  | {type: 'to_error'; error: string}
  | {type: 'to_done'; fileId: string}

export function createVideoState(asset: ImagePickerAsset): VideoState {
  return {
    status: 'uploading',
    progress: 0,
    asset: asset,
    error: undefined,
  }
}

export function videoReducer(
  state: VideoState,
  action: VideoAction,
): VideoState {
  if (action.type === 'to_error') {
    return {
      status: 'error',
      progress: 100,
      error: action.error,
      asset: state.asset ?? null,
    }
  } else if (action.type === 'uploading') {
    return {
      ...state,
      progress: 0,
    }
  } else if (action.type === 'to_done') {
    return {
      status: 'done',
      progress: 100,
      error: undefined,
      asset: state.asset!,
      fileId: action.fileId,
    }
  }
  console.error(
    'Unexpected video action (' +
      action.type +
      ') while in ' +
      state.status +
      ' state',
  )
  return state
}
