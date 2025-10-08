import { MdAutorenew } from 'react-icons/md'

const TransformIcon = ({
  size = 24,
  className,
}: {
  size?: number
  className?: string
}) => {
  return <MdAutorenew size={size} className={className} />
}

export default TransformIcon
