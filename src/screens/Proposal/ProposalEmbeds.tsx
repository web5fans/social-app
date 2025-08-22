import {InteractionManager, type StyleProp, View, type ViewStyle} from 'react-native'
import {type MeasuredDimensions, runOnJS, runOnUI} from 'react-native-reanimated'
import {Image} from 'expo-image'
import {AppBskyEmbedImages, type AppBskyEmbedVideo} from '@atproto/api'

import {type HandleRef, measureHandle} from '#/lib/hooks/useHandleRef'
import {type Dimensions} from '#/lib/media/types'
import {useLightboxControls} from '#/state/lightbox'
import {AutoSizedImage} from '#/view/com/util/images/AutoSizedImage'
import {ImageLayoutGrid} from '#/view/com/util/images/ImageLayoutGrid'
import {PostEmbedViewContext} from '#/view/com/util/post-embeds'
import {atoms as a} from '#/alf'

type Embed =
  | AppBskyEmbedImages.View
  | AppBskyEmbedVideo.View
  | {$type: string; [k: string]: unknown}

export type ProposalEmbedsProps = {
  style?: StyleProp<ViewStyle>
  embed: Embed
}

export default function ProposalEmbeds(props: ProposalEmbedsProps) {
  const {style, embed} = props
  const {openLightbox} = useLightboxControls()

  if (AppBskyEmbedImages.isView(embed)) {
    const {images} = embed
    const items = embed.images.map(img => ({
      uri: img.fullsize,
      thumbUri: img.thumb,
      alt: img.alt,
      dimensions: img.aspectRatio ?? null,
    }))
    const _openLightbox = (
      index: number,
      thumbRects: (MeasuredDimensions | null)[],
      fetchedDims: (Dimensions | null)[],
    ) => {
      openLightbox({
        images: items.map((item, i) => ({
          ...item,
          thumbRect: thumbRects[i] ?? null,
          thumbDimensions: fetchedDims[i] ?? null,
          type: 'image',
        })),
        index,
      })
    }
    const onPress = (
      index: number,
      refs: HandleRef[],
      fetchedDims: (Dimensions | null)[],
    ) => {
      const handles = refs.map(r => r.current)
      runOnUI(() => {
        'worklet'
        const rects = handles.map(measureHandle)
        runOnJS(_openLightbox)(index, rects, fetchedDims)
      })()
    }
    const onPressIn = (_: number) => {
      InteractionManager.runAfterInteractions(() => {
        Image.prefetch(items.map(i => i.uri))
      })
    }
    if (images.length === 1) {
      return (
        <AutoSizedImage
          crop="none"
          image={images[0]}
          onPress={(containerRef, dims) => onPress(0, [containerRef], [dims])}
          onPressIn={() => onPressIn(0)}
          hideBadge={false}
        />
      )
    }
    return (
      <View style={[a.mt_sm, style]}>
        <ImageLayoutGrid
          images={embed.images}
          onPress={onPress}
          onPressIn={onPressIn}
          viewContext={PostEmbedViewContext.ThreadHighlighted}
        />
      </View>
    )
  }
  return null
}
