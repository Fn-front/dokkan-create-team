import { memo } from 'react'
import styles from './styles.module.scss'

type KiMeterProps = {
  kiValue: number
}

const KiMeter = memo<KiMeterProps>(({ kiValue }) => {
  // 各セグメントを縦横一杯のdivで作成（二周分24個）
  const segments = Array.from({ length: 24 }, (_, index) => {
    const isActive = index < kiValue
    const angle = (index % 12) * 30 // 30度ずつ、12個で一周
    const isSecondRound = index >= 12

    return (
      <div
        key={index}
        className={`${styles.segment} ${isActive ? styles.active : ''} ${isSecondRound ? styles.secondRound : styles.firstRound}`}
        style={{
          transform: `rotate(${angle}deg)`,
        }}
      />
    )
  })

  return (
    <div className={styles.kiMeter}>
      <div className={styles.circle}>{segments}</div>
    </div>
  )
})

KiMeter.displayName = 'KiMeter'

export default KiMeter
