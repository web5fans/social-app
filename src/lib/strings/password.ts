// Regex for base32 string for testing reset code
const PHONE_RESET_CODE_REGEX = /^\d{6}$/ // /^[A-Z2-7]{5}-[A-Z2-7]{5}$/
const EMAIL_RESET_CODE_REGEX = /^\d{4}$/
export function checkAndFormatResetCode(
  code: string,
  receiverType: 'phone' | 'email',
): string | false {
  // Trim the reset code
  let fixed = code.trim().toUpperCase()
  if (receiverType === 'email') {
    return EMAIL_RESET_CODE_REGEX.test(fixed) ? fixed : false
  }

  return PHONE_RESET_CODE_REGEX.test(fixed) ? fixed : false
  // Add a dash if needed
  // if (fixed.length === 10) {
  //   fixed = `${fixed.slice(0, 5)}-${fixed.slice(5, 10)}`
  // }

  // Check that it is a valid format
}

export type PASS_VALIDATE_TYPE = 'NO_PASS' | 'SHORT_PASS' | 'VALID'

export function checkPassword(password: string | undefined): {
  type: PASS_VALIDATE_TYPE
  message: string
} {
  if (!password) return {type: 'NO_PASS', message: '请输入密码'}
  if (password.length < 8) {
    return {type: 'SHORT_PASS', message: '密码应至少包含8个字符'}
  }
  return {type: 'VALID', message: ''}
}
