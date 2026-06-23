import { useEffect } from 'react'

export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    document.title = title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', description)
  }, [title, description])
}
