import { MdInfo } from 'react-icons/md'

interface DetailIconProps {
  className?: string
}

const DetailIcon = ({ className }: DetailIconProps) => {
  return <MdInfo className={className} />
}

export default DetailIcon
