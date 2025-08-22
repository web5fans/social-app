import * as EmailValidator from 'email-validator'

export function validateAccount(accountName: string) {
  if (isEmail(accountName) || isPhoneNumber(accountName)) return true
  return false
}

export function isEmail(str: string) {
  return EmailValidator.validate(str)
}

export function isPhoneNumber(str: string) {
  return /^1\d{10}$/.test(str)
}
