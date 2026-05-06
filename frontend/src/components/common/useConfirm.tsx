import { useState } from "react"

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [danger, setDanger] = useState(false)
  const [action, setAction] = useState<(() => Promise<void>) | null>(null)

  const confirm = ({
    title,
    message,
    danger = false,
    onConfirm,
  }: {
    title: string
    message: string
    danger?: boolean
    onConfirm: () => Promise<void>
  }) => {
    setTitle(title)
    setMessage(message)
    setDanger(danger)
    setAction(() => onConfirm)
    setOpen(true)
  }

  return {
    open,
    title,
    message,
    danger,
    action,
    setOpen,
    confirm,
  }
}