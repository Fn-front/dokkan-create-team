import { clsx, type ClassValue } from 'clsx'

/**
 * clsxのラッパー関数
 * classNameの結合を行う共通関数
 */
export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs)
}
