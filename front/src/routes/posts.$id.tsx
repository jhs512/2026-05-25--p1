import { createFileRoute } from '@tanstack/react-router'

// Implemented in FS03.
export const Route = createFileRoute('/posts/$id')({
  component: () => <div className="p-6">상세 (준비중)</div>,
})
