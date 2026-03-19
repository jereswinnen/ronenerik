import {
  DefaultNodeTypes,
  SerializedLinkNode,
  SerializedUploadNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

type NodeTypes = DefaultNodeTypes

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/artikels/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  upload: ({ node }: { node: SerializedUploadNode }) => {
    const resource = node.value as MediaType
    if (!resource) return null
    const caption = (node.fields as Record<string, unknown>)?.caption as string | undefined

    return (
      <figure>
        <Media resource={resource} imgClassName="w-full rounded-lg" size="100vw" />
        {caption && (
          <figcaption className="pl-3 border-l-2 border-c-accent text-sm text-c-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    )
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'text-c-foreground mx-auto prose prose-invert prose-headings:text-inherit prose-strong:text-inherit prose-p:my-0 prose-headings:my-4 prose-blockquote:border-c-accent prose-blockquote:text-c-foreground prose-blockquote:text-xl md:prose-md':
            enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
