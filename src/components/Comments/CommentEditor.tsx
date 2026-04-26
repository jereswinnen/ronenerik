'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type SerializedEditorState,
} from 'lexical'

const theme = {
  paragraph: 'mb-2 last:mb-0',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline',
  },
  link: 'underline text-c-accent',
}

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
        }
      })
    })
  }, [editor])

  const insertLink = useCallback(() => {
    const url = window.prompt('URL (https://…):')
    if (!url) return
    if (!isSafeUrl(url)) {
      alert('Alleen http(s) links toegestaan.')
      return
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
  }, [editor])

  const buttonClass = (active: boolean) =>
    `px-2 py-1 text-xs rounded border ${
      active
        ? 'bg-c-foreground text-c-background border-c-foreground'
        : 'border-c-foreground/20 text-c-foreground/70 hover:bg-c-foreground/5'
    }`

  return (
    <div className="flex gap-1 mb-2">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={buttonClass(isBold)}
        aria-label="Vet"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={buttonClass(isItalic)}
        aria-label="Cursief"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={insertLink}
        className={buttonClass(false)}
        aria-label="Link"
      >
        Link
      </button>
    </div>
  )
}

type Props = {
  initialContent?: SerializedEditorState | null
  onChange: (state: SerializedEditorState) => void
  placeholder?: string
}

export function CommentEditor({ initialContent, onChange, placeholder }: Props) {
  const initialConfig = {
    namespace: 'CommentEditor',
    theme,
    nodes: [LinkNode],
    onError(err: Error) {
      console.error('CommentEditor error', err)
    },
    editorState: initialContent ? JSON.stringify(initialContent) : undefined,
  }

  const handleChange = useCallback(
    (editorState: EditorState) => {
      onChange(editorState.toJSON())
    },
    [onChange],
  )

  return (
    <div className="border border-c-foreground/20 rounded p-3 bg-c-background">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-24 outline-none text-sm"
                aria-label="Reactie"
              />
            }
            placeholder={
              <p className="absolute top-0 left-0 text-sm text-c-foreground/40 pointer-events-none">
                {placeholder ?? 'Schrijf hier je reactie…'}
              </p>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <LinkPlugin validateUrl={isSafeUrl} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
      </LexicalComposer>
    </div>
  )
}

export const isEmptyContent = (state: SerializedEditorState | null): boolean => {
  if (!state?.root?.children?.length) return true
  for (const node of state.root.children as Array<{
    children?: Array<{ text?: string }>
  }>) {
    if ((node.children ?? []).some((c) => (c.text ?? '').trim().length > 0)) {
      return false
    }
  }
  return true
}
