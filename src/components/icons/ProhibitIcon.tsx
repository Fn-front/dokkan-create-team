import { MdBlock } from 'react-icons/md'

type ProhibitIconProps = {
  size?: number
  className?: string
}

const ProhibitIcon = ({ size = 16, className }: ProhibitIconProps) => {
  return (
    <MdBlock size={size} className={className} style={{ color: '#ff1744' }} />
  )
}

export default ProhibitIcon
