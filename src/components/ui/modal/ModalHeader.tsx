type ModalHeaderProps = {
  children: React.ReactNode
  title?: string
  isJustPage?: boolean
  withTabs?: boolean
}

export const ModalHeader = ({ children }: ModalHeaderProps ) => {

  return (
    <div className="py-6 px-8 border-b border-b-gray50 bg-surface sticky top-0 z-20">
      { children }
    </div>
  )
}