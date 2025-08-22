import { Image, type ImageProps } from "expo-image";

import { SERVER } from "#/lib/request";



type OssImageProps = Omit<ImageProps, 'source'> & {
  attachId?: string;
  defaultSrc?: string;
}


export function attachIdToUrl(attachId?: string) {
  if (!attachId) return '';
  try {
    const [fileType, fileId] = attachId.split('-');
    return `${SERVER}/api/v1/file/download?fileId=${fileId}&fileType=${fileType}`;
  } catch (e) {
    return '';
  }
}

export default function OssImage(props: OssImageProps) {
  const { attachId, defaultSrc, ...imgProps } = props;
  const src = attachIdToUrl(attachId) || defaultSrc;

  return <Image accessibilityIgnoresInvertColors {...imgProps} source={src} />
}