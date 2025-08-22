type Option = {
  key: string
  label: string
  value: number
}

export const options: Option[] = [1, 3, 6].map(gap => {
  return {
    key: `${gap}`,
    label: `近${gap}个月`,
    value: gap,
  }
})
