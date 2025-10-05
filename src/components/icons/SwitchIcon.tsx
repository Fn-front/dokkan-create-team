import { memo } from 'react'
import { MdSwapHoriz } from 'react-icons/md'

type SwitchIconProps = {
  size?: number
  className?: string
}

const SwitchIcon = memo<SwitchIconProps>(({ size = 24, className }) => {
  return <MdSwapHoriz size={size} className={className} />
})

SwitchIcon.displayName = 'SwitchIcon'

export default SwitchIcon
