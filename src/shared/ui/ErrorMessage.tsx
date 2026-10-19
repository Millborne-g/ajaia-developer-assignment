interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2.5 bg-danger/10 border border-danger/30 rounded-md text-danger text-sm"
      role="alert"
    >
      <span className="shrink-0" aria-hidden="true">
        ⚠
      </span>
      {message}
    </div>
  )
}
