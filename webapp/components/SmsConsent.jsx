import { useLang } from '../i18n'

// Text-message consent for the sign-up forms: its own checkbox, unticked by default and never required to join.
export default function SmsConsent({ checked, onChange }) {
  const { t } = useLang()
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
      <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{t({
        en: 'I agree to receive appointment-related text messages from Nouvelle Anti-Aging at the phone number I provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of joining.',
        zh: '我同意 Nouvelle Anti-Aging 通过我提供的手机号码向我发送与预约相关的短信。短信频率不定，可能产生短信和流量费用。回复 STOP 退订，回复 HELP 获取帮助。是否同意不影响加入会员。',
      })}</span>
    </label>
  )
}
