import 'webrtc-adapter'

import {Dimensions} from 'react-native'
import jsQR from 'jsqr'

import promiseWithResolver from '#/lib/promiseWithResolver'

const screenWidth = Dimensions.get('window').width

function createVideoEl() {
  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.style.width = '100vw'
  video.style.height = '100%'
  video.style.position = 'fixed'
  video.style.top = '0'
  return video
}

export default async function scanQR(
  video: HTMLVideoElement = createVideoEl(),
) {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error('您的浏览器不支持摄像头访问功能。请升级到最新版浏览器！')
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {facingMode: 'environment'},
  })
  video.srcObject = mediaStream
  video.setAttribute('playsinline', true) // for iOS
  video.play()
  document.body.appendChild(video)

  const {promise, resolve, reject} = promiseWithResolver<string>()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  try {
    function scan() {
      if (video.readyState !== video.HAVE_ENOUGH_DATA)
        return requestAnimationFrame(scan)

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height)

      if (qrCode) {
        resolve(qrCode.data)
        mediaStream.getTracks().forEach(t => t.stop())
        video.srcObject = null
        document.body.removeChild(video)
      } else {
        requestAnimationFrame(scan)
      }
    }

    requestAnimationFrame(scan)
  } catch (e) {
    reject(e)
  }

  return promise
}
