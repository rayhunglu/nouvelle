import { useRef } from 'react'

// The health questionnaire in the customer form. The answers live in one object (customer.questionnaire):
//   yn: { <question id>: { v: 'yes' | 'no', note } }     the yes / no questions (A and C); "yes" opens a box for the details
//   b / d: { items: [<option id>], other: '' }           the tick lists (B illnesses, D earlier treatments); "Other" opens a box
// How Did You Hear About Us? (a drop-down; a value saved earlier that is not in the list is still shown).
export const HEARD_FROM = ['微信朋友圈', '小红书', '朋友推荐', '谷歌地图', '其他']

export const YN_A = [
  { id: 'a_conditions', title: 'Current Conditions｜现有疾病', en: 'Do you have any current medical conditions?', zh: '是否有任何现有疾病？' },
  { id: 'a_surgery', title: 'Major Surgeries｜重大手术', en: 'Have you had any major surgeries?', zh: '是否做过重大手术？' },
  { id: 'a_complications', title: 'Treatment Complications｜医美不良反应', en: 'Have you ever had complications from cosmetic treatments?', zh: '是否曾在医美治疗中出现不良反应？' },
  { id: 'a_doctor', title: 'Doctor\'s Care｜医生治疗', en: "Are you currently under a doctor's care?", zh: '目前是否正在接受医生治疗？' },
  { id: 'a_pregnant', title: 'Pregnancy｜怀孕及哺乳', en: 'Are you pregnant, breastfeeding, or planning pregnancy?', zh: '是否怀孕、哺乳或计划怀孕？' },
  { id: 'a_infection', title: 'Infection & Wounds｜感染及伤口', en: 'Do you have any active infections, fever, or open wounds?', zh: '是否存在感染、发烧或开放性伤口？' },
]
export const OPTIONS_B = [
  { id: 'diabetes', en: 'Diabetes', zh: '糖尿病' },
  { id: 'heart', en: 'Heart Disease / High Blood Pressure', zh: '心脏疾病／高血压' },
  { id: 'autoimmune', en: 'Autoimmune Disease', zh: '自身免疫性疾病' },
  { id: 'bleeding', en: 'Bleeding / Clotting Disorders', zh: '凝血或出血异常' },
  { id: 'cancer', en: 'Cancer / History of Cancer', zh: '癌症或癌症病史' },
  { id: 'keloid', en: 'Keloid / Poor Wound Healing', zh: '瘢痕疙瘩或伤口愈合不良' },
  { id: 'seizure', en: 'Seizure Disorders', zh: '癫痫或抽搐病史' },
  { id: 'other', en: 'Other Medical Conditions', zh: '其他疾病', other: true },
  { id: 'none', en: 'None of the Above', zh: '以上皆无', none: true },
]
export const YN_C = [
  { id: 'c_allergy', title: 'Allergies｜过敏', en: 'Do you have any known allergies?', zh: '是否有任何已知过敏？' },
  { id: 'c_prescription', title: 'Prescription Medications｜处方药', en: 'Are you currently taking prescription medications?', zh: '是否正在服用处方药？' },
  { id: 'c_bloodthinner', title: 'Blood Thinners｜抗凝药物', en: 'Are you taking blood thinners or medications affecting bleeding?', zh: '是否服用抗凝或影响出血的药物？' },
  { id: 'c_retinoid', title: 'Retinoids & Acne Medications｜维A酸类及痤疮药物', en: 'Are you currently using retinoids or acne medications?', zh: '是否正在使用维A酸类或痤疮药物？' },
  { id: 'c_anesthesia', title: 'Anesthesia Reaction｜麻醉反应', extra: ['unsure', 'Not sure 不确定'], en: 'Have you ever had an adverse reaction to anesthesia or numbing cream?', zh: '是否对麻醉药或麻药膏有过不良反应？' },
]
export const OPTIONS_D = [
  { id: 'botox', en: 'Botox / Neurotoxin', zh: '肉毒素注射' },
  { id: 'filler', en: 'Dermal Fillers', zh: '玻尿酸填充' },
  { id: 'laser', en: 'Laser / IPL', zh: '光电治疗' },
  { id: 'microneedling', en: 'Microneedling', zh: '微针' },
  { id: 'peel', en: 'Chemical Peels', zh: '化学焕肤' },
  { id: 'thread', en: 'Thread Lift', zh: '线雕' },
  { id: 'other', en: 'Other Cosmetic Procedures', zh: '其他医美治疗', other: true },
  { id: 'none', en: 'None', zh: '以上皆无', none: true },
]

// 美容 (skincare and facial care): yes / no questions (7 and 8 also "N/A"), ids start with "s_"; the last is the tick ("I Agree"). The first beauty
// questionnaire used ids "p_"; answers saved under those are still in the customer's record, but this form does not show them.
const NA = ['na', 'N/A 不适用']
export const BEAUTY = [
  { id: 's_allergy', title: 'Product Allergies｜产品过敏', en: 'Do you have any known allergies to skincare products, cosmetics, fragrances, or treatment ingredients?', zh: '您是否对护肤品、化妆品、香料或护理成分有已知过敏？' },
  { id: 's_skin', title: 'Skin Conditions｜皮肤状况', en: 'Do you currently have any skin infections, open wounds, cold sores, eczema, rosacea, or severe skin irritation?', zh: '您目前是否有皮肤感染、开放性伤口、唇疱疹、湿疹、玫瑰痤疮或严重皮肤刺激？' },
  { id: 's_scar', title: 'Scarring & Healing｜疤痕及愈合', en: 'Do you have a history of easy scarring, keloids, or poor wound healing?', zh: '您是否容易留下疤痕、产生瘢痕疙瘩或伤口愈合不良？' },
  { id: 's_pregnant', title: 'Pregnancy｜怀孕', en: 'Are you currently pregnant or possibly pregnant?', zh: '您目前是否怀孕或可能怀孕？' },
  { id: 's_meds', title: 'Medications｜药物', en: 'Are you currently using retinoids, isotretinoin, blood thinners, photosensitizing medications, or other prescription skincare products?', zh: '您目前是否使用维A酸类、异维A酸、抗凝药、光敏性药物或其他处方护肤品？' },
  { id: 's_recent', title: 'Recent Treatments｜近期治疗', en: 'Have you recently received cosmetic injections, thread lifts, facial surgery, chemical peels, laser treatments, or experienced significant sunburn?', zh: '您近期是否接受过医美注射、埋线提升、面部手术、刷酸、激光治疗，或出现过明显晒伤？' },
  { id: 's_massage', title: 'Facial Massage, Kogao or Gua Sha｜面部按摩／小颜／刮痧', extra: NA, en: 'For facial massage, Kogao, or gua sha: Do you have jaw/TMJ problems, neck conditions, osteoporosis, or recent facial/neck injuries?', zh: '如预约面部按摩、小颜或刮痧：您是否有颞下颌关节问题、颈部疾病、骨质疏松或近期面颈部受伤？' },
  { id: 's_device', title: 'LED, RF or Microcurrent｜LED／射频／微电流', extra: NA, en: 'For LED, RF, or microcurrent treatments: Do you have a pacemaker, implanted medical device, metal in the treatment area, seizures, light sensitivity, or reduced skin sensation?', zh: '如预约LED、射频或微电流护理：您是否有心脏起搏器、植入式医疗设备、护理部位金属植入物、癫痫、光敏感或皮肤感觉减退？' },
]
export const BEAUTY_AGREE = { id: 's_agree', title: 'Client Acknowledgment｜客户确认', en: 'I confirm that the information provided is accurate and agree to inform my skincare specialist of any changes in my health, medications, or skin condition before treatment.', zh: '我确认以上信息真实准确，并同意在护理前主动告知美容师健康状况、用药或皮肤状态的任何变化。' }

// 美睫 has its own questionnaire (ids start with "l_"): yes / no questions, the last one is the tick ("I Agree").
export const LASH = [
  { id: 'l_glue', title: 'Glue & Product Allergies｜胶水及产品过敏', en: 'Do you have any known allergies to eyelash extension glue, adhesives, latex, or cosmetic products?', zh: '您是否对嫁接睫毛胶水、黏合剂、乳胶或化妆品有已知过敏？' },
  { id: 'l_reaction', title: 'Past Reactions｜过往不良反应', en: 'Have you ever experienced redness, itching, swelling, or irritation after eyelash extensions?', zh: '您是否曾在嫁接睫毛后出现发红、瘙痒、肿胀或刺激反应？' },
  { id: 'l_infection', title: 'Eye Infection｜眼部感染', en: 'Do you currently have any eye infections, inflammation, redness, swelling, or unusual eye discharge?', zh: '您目前是否有眼部感染、炎症、发红、肿胀或异常分泌物？' },
  { id: 'l_surgery', title: 'Recent Eye Surgery｜近期眼部手术', en: 'Have you had any eye surgery, LASIK, or other eye procedures within the past 3 months?', zh: '您过去3个月内是否接受过眼部手术、近视激光手术或其他眼部治疗？' },
  { id: 'l_sensitive', title: 'Sensitive Eyes｜眼睛敏感', en: 'Do you have sensitive eyes, chronic dry eyes, or any existing eye conditions?', zh: '您是否有眼睛敏感、长期干眼症或其他眼部疾病？' },
  { id: 'l_contacts', title: 'Contact Lenses｜隐形眼镜', en: 'Do you currently wear contact lenses?', zh: '您目前是否佩戴隐形眼镜？' },
  { id: 'l_recent', title: 'Recent Lash Services｜近期睫毛服务', en: 'Have you had lash extensions, a lash lift, or lash tinting within the past 6 weeks?', zh: '您过去6周内是否做过嫁接睫毛、睫毛烫翘或睫毛染色？' },
  { id: 'l_meds', title: 'Medications & Eye Drops｜药物及眼药水', en: 'Are you currently using any medications or eye drops that may affect your eyes or skin sensitivity?', zh: '您目前是否使用可能影响眼部或皮肤敏感性的药物或眼药水？' },
  { id: 'l_pregnant', title: 'Pregnancy｜怀孕及哺乳', en: 'Are you pregnant or breastfeeding?', zh: '您目前是否怀孕或正在哺乳？' },
]
export const LASH_AGREE = { id: 'l_agree', title: 'Client Acknowledgment｜客户确认', en: 'I confirm that the information above is accurate and agree to notify my lash technician of any changes before my appointment.', zh: '我确认以上信息真实准确，并同意在预约前如有相关健康状况变化，主动告知美睫师。' }

// 身体 Spa has its own too (ids start with "b_").
export const BODY = [
  { id: 'b_allergy', title: 'Oil & Product Allergies｜精油及产品过敏', en: 'Do you have any allergies to essential oils, fragrances, milk, or skincare products?', zh: '您是否对精油、香料、牛奶或护肤产品过敏？' },
  { id: 'b_skin', title: 'Skin Conditions｜皮肤状况', en: 'Do you currently have any skin infections, open wounds, sunburn, eczema, or psoriasis in the treatment area?', zh: '您目前护理部位是否有皮肤感染、开放性伤口、晒伤、湿疹或银屑病？' },
  { id: 'b_pregnant', title: 'Pregnancy｜怀孕', en: 'Are you currently pregnant or possibly pregnant?', zh: '您目前是否怀孕或可能怀孕？' },
  { id: 'b_blood', title: 'Blood & Circulation｜血液及循环', en: 'Do you have any history of blood clots, unusual swelling, bleeding disorders, or use of blood-thinning medications?', zh: '您是否有血栓、不明原因肿胀、出血或凝血异常病史，或正在使用抗凝药物？' },
  { id: 'b_health', title: 'Health Conditions｜健康状况', en: 'Do you have any health conditions that may affect your treatment, such as diabetes, reduced skin sensation, osteoporosis, or cancer treatment?', zh: '您是否有可能影响护理的健康状况，例如糖尿病、皮肤感觉减退、骨质疏松或正在接受癌症治疗？' },
  { id: 'b_recent', title: 'Recent Surgery or Injury｜近期手术或受伤', en: 'Have you had any recent surgery, injury, or medical procedure affecting the treatment area?', zh: '您近期是否接受过手术、受伤或涉及护理部位的医疗操作？' },
  { id: 'b_exfoliation', title: 'Body Exfoliation｜身体焕肤', en: 'For body exfoliation treatments, are you using retinoids or isotretinoin, or have you recently had waxing, shaving, chemical peels, or laser treatments?', zh: '如预约身体焕肤项目，您是否正在使用维A酸类药物／异维A酸，或近期接受过脱毛、剃毛、刷酸或激光治疗？' },
]
export const BODY_AGREE = { id: 'b_agree', title: 'Client Acknowledgment｜客户确认', en: 'I confirm that the information provided is accurate and agree to inform my therapist of any health changes before treatment.', zh: '我确认以上资料真实准确，并同意在护理前告知护理师任何健康状况变化。' }

// 头部 Spa too (ids start with "h_").
export const HEAD = [
  { id: 'h_allergy', title: 'Product Allergies｜产品过敏', en: 'Do you have any allergies to shampoos, essential oils, fragrances, scalp serums, or hair care products?', zh: '您是否对洗发水、精油、香料、头皮精华或护发产品过敏？' },
  { id: 'h_scalp', title: 'Scalp Conditions｜头皮状况', en: 'Do you currently have any scalp infections, rashes, open wounds, psoriasis, or head lice?', zh: '您目前是否有头皮感染、皮疹、开放性伤口、银屑病或头虱？' },
  { id: 'h_surgery', title: 'Recent Surgery or Injury｜近期手术或受伤', en: 'Have you recently undergone a hair transplant, scalp surgery, or experienced any head or neck injuries?', zh: '您近期是否接受过植发、头皮手术，或头部、颈部受伤？' },
  { id: 'h_neck', title: 'Neck & Spine｜颈椎及不适', en: 'Do you have any neck or spine problems, frequent dizziness, or discomfort when lying back?', zh: '您是否有颈椎问题、经常头晕，或仰躺时感到不适？' },
  { id: 'h_health', title: 'Health Conditions｜健康状况', en: 'Are you pregnant, or do you have reduced skin sensation, bleeding disorders, or take blood-thinning medications?', zh: '您是否怀孕、皮肤感觉减退、有出血或凝血异常，或正在使用抗凝药物？' },
  { id: 'h_hair', title: 'Recent Hair Treatments｜近期头发处理', en: 'Have you recently colored, bleached, permed, straightened your hair, or had hair extensions applied?', zh: '您近期是否染发、漂发、烫发、拉直头发或接发？' },
  { id: 'h_meds', title: 'Medications｜药物及头皮产品', en: 'Are you currently taking any medications or using medicated scalp products that may affect your scalp or skin sensitivity?', zh: '您目前是否服用可能影响头皮或皮肤敏感性的药物，或使用药用头皮产品？' },
]
export const HEAD_AGREE = { id: 'h_agree', title: 'Client Acknowledgment｜客户确认', en: 'I confirm that the information provided is accurate and agree to inform my therapist of any health changes before each treatment.', zh: '我确认以上信息真实准确，并同意在每次护理前告知护理师任何健康状况变化。' }

// Which service the visit is for decides which questionnaire is asked: 医美 → the medical aesthetics one; 美容 / 美睫 / Spa → the beauty & spa one.
export const SERVICE_TYPES = [
  { id: 'medical', zh: '医美', en: 'Medical Aesthetics', form: 'medical' },
  { id: 'beauty', zh: '美容', en: 'Facial & Beauty', form: 'beauty' },
  { id: 'lash', zh: '美睫', en: 'Lash', form: 'lash' },
  { id: 'body_spa', zh: '身体 Spa', en: 'Body Spa', form: 'body' },
  { id: 'head_spa', zh: '头部 Spa', en: 'Head Spa', form: 'head' },
]
const formOf = (id) => (id === 'spa' ? 'beauty' : SERVICE_TYPES.find((x) => x.id === id)?.form) // 'spa' = the single Spa button used before Body / Head Spa were split
// A saved questionnaire without a chosen type opens on the form that has answers in it.
const guessService = (q) => q?.services?.length ? q.services : q?.service ? [q.service] : [guessService1(q)].filter(Boolean)
const guessService1 = (q) => ( (Object.keys(q?.yn || {}).some((k) => k.startsWith('h_')) ? 'head_spa' : Object.keys(q?.yn || {}).some((k) => k.startsWith('b_')) ? 'body_spa' : Object.keys(q?.yn || {}).some((k) => k.startsWith('l_')) ? 'lash' : Object.keys(q?.yn || {}).some((k) => k.startsWith('p_') || k.startsWith('s_')) ? 'beauty' : (Object.keys(q?.yn || {}).length || q?.b?.items?.length || q?.d?.items?.length) ? 'medical' : ''))

export const emptyQuestionnaire = (q) => ({ services: guessService(q), yn: q?.yn || {}, b: { items: q?.b?.items || [], other: q?.b?.other || '' }, d: { items: q?.d?.items || [], other: q?.d?.other || '' } })

const Label = ({ q }) => <span className="block text-sm"><span className="font-medium">{q.en}</span> <span className="text-muted">{q.zh}</span></span>

function YesNo({ q, value, onChange, noteHint }) {
  const third = q.extra || null // an optional third answer ("not sure", "N/A")
  const v = value?.v || ''
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-3">
      <Label q={q} />
      <div className="mt-2 flex gap-2">
        {[['yes', 'Yes 是'], ['no', 'No 否'], ...(third ? [third] : [])].map(([k, label]) => (
          <button key={k} type="button" aria-pressed={v === k} onClick={() => onChange({ ...value, v: v === k ? '' : k })}
            className={`rounded-full border px-4 py-1 text-xs transition ${v === k ? (k === 'yes' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gold bg-gold/10 text-ink') : 'border-ink/15 text-muted hover:border-gold'}`}>{label}</button>
        ))}
      </div>
      {v === 'yes' && noteHint && (
        <textarea className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none" rows={2} value={value?.note || ''} onChange={(e) => onChange({ ...value, note: e.target.value })} placeholder={noteHint} maxLength={500} />
      )}
    </div>
  )
}

function Ticks({ options, value, onChange, otherHint }) {
  const items = value.items
  const toggle = (o) => {
    if (o.none) return onChange({ items: items.includes(o.id) ? [] : [o.id], other: '' })
    const next = items.includes(o.id) ? items.filter((x) => x !== o.id) : [...items.filter((x) => x !== 'none'), o.id]
    onChange({ items: next, other: next.includes('other') ? value.other : '' })
  }
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-3">
      <div className="grid gap-1.5 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={items.includes(o.id)} onChange={() => toggle(o)} />
            <span><span className="font-medium">{o.en}</span> <span className="text-muted">{o.zh}</span></span>
          </label>
        ))}
      </div>
      {items.includes('other') && (
        <input className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none" value={value.other} onChange={(e) => onChange({ ...value, other: e.target.value })} placeholder={otherHint} maxLength={300} />
      )}
    </div>
  )
}

// A questionnaire made of numbered yes / no questions and a closing "I Agree" tick (美睫, 身体 Spa).
function YnForm({ refEl, title, en, note, items, agree, value, setYn }) {
  return (
    <div ref={refEl} className="scroll-mt-4 space-y-3">
      <h3 className="border-t border-ink/10 pt-4 text-sm font-medium">{title} <span className="text-muted">{en}</span></h3>
      {note && <p className="text-xs text-muted">{note}</p>}
      <div className="space-y-2">
        {items.map((q, i) => (
          <div key={q.id}>
            <h4 className="mb-1 mt-2 text-sm font-medium text-gold">{i + 1}. {q.title}</h4>
            <YesNo q={q} value={value.yn[q.id]} onChange={setYn(q.id)} noteHint="请补充说明 Please explain" />
          </div>
        ))}
        <h4 className="mb-1 mt-2 text-sm font-medium text-gold">{items.length + 1}. {agree.title}</h4>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-ink/10 bg-white p-3 text-sm">
          <input type="checkbox" className="mt-1" checked={value.yn[agree.id]?.v === 'yes'} onChange={(e) => setYn(agree.id)({ v: e.target.checked ? 'yes' : '' })} />
          <span><span className="font-medium">{agree.en}</span> <span className="text-muted">{agree.zh}</span> <b>I Agree｜我同意</b></span>
        </label>
      </div>
    </div>
  )
}

export default function Questionnaire({ value, onChange }) {
  const setYn = (id) => (v) => onChange({ ...value, yn: { ...value.yn, [id]: v } })
  const Title = ({ children }) => <h4 className="mb-1 mt-2 text-sm font-medium text-gold">{children}</h4>
  const medicalRef = useRef(null)
  const beautyRef = useRef(null)
  const lashRef = useRef(null)
  const bodyRef = useRef(null)
  const headRef = useRef(null)
  const services = value.services || []
  const forms = new Set(services.map(formOf))
  const pick = (type) => {
    const on = services.includes(type.id)
    onChange({ ...value, services: on ? services.filter((x) => x !== type.id) : [...services, type.id] })
    // jump to a questionnaire that was just added, once it is on the screen
    if (!on) setTimeout(() => ({ medical: medicalRef, lash: lashRef, body: bodyRef, head: headRef, beauty: beautyRef })[type.form].current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  return (
    <section className="space-y-3 border-t border-ink/10 pt-4" aria-label="问卷调查">
      <div>
        <h3 className="text-sm font-medium">您今天预约以下哪个类型服务？（可多选） <span className="text-muted">Which services are you booking today? (select all that apply)</span></h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SERVICE_TYPES.map((x) => (
            <button key={x.id} type="button" aria-pressed={services.includes(x.id)} onClick={() => pick(x)}
              className={`rounded-xl border px-3 py-2.5 text-center text-sm transition ${services.includes(x.id) ? 'border-gold bg-gold/10 font-medium text-ink' : 'border-ink/15 bg-white text-muted hover:border-gold'}`}>
              <span className="block">{x.zh}</span><span className="block text-xs font-normal text-muted">{x.en}</span>
            </button>
          ))}
        </div>
      </div>
      {forms.has('medical') && (
      <div ref={medicalRef} className="scroll-mt-4 space-y-3 border-t border-ink/10 pt-4">
      <h3 className="text-sm font-medium">医美客户安全问卷 <span className="text-muted">Medical Aesthetics Client Safety Questionnaire</span></h3>
      <div className="space-y-2">
        {YN_A.map((q, i) => (
          <div key={q.id}>
            <Title>{i + 1}. {q.title}</Title>
            <YesNo q={q} value={value.yn[q.id]} onChange={setYn(q.id)} noteHint="请补充说明 Please explain" />
          </div>
        ))}
        <Title>{YN_A.length + 1}. Medical History｜疾病史筛查（可多选）</Title>
        <Ticks options={OPTIONS_B} value={value.b} onChange={(b) => onChange({ ...value, b })} otherHint="请写明其他疾病 Please specify" />
        {YN_C.map((q, i) => (
          <div key={q.id}>
            <Title>{YN_A.length + 2 + i}. {q.title}</Title>
            <YesNo q={q} value={value.yn[q.id]} onChange={setYn(q.id)} noteHint="药品名称、过敏反应、使用时间等 Name of the drug, reaction, how long…" />
          </div>
        ))}
        <Title>{YN_A.length + YN_C.length + 2}. Past Cosmetic Treatments｜过去医美治疗史（可多选）</Title>
        <p className="text-sm"><span className="font-medium">Have you received any of the following treatments?</span> <span className="text-muted">是否做过以下治疗？</span></p>
        <Ticks options={OPTIONS_D} value={value.d} onChange={(d) => onChange({ ...value, d })} otherHint="请写明其他治疗 Please specify" />
      </div>
      </div>
      )}
      {forms.has('beauty') && <YnForm refEl={beautyRef} title="美容及面部护理安全问卷" en="Skincare & Facial Care Safety Questionnaire" items={BEAUTY} agree={BEAUTY_AGREE} value={value} setYn={setYn} />}
      {forms.has('lash') && <YnForm refEl={lashRef} title="美睫客户安全问卷" en="Lash Extension Safety Questionnaire" items={LASH} agree={LASH_AGREE} value={value} setYn={setYn} />}
      {forms.has('head') && <YnForm refEl={headRef} title="日式头皮 SPA 预约前安全问卷" en="Head SPA Safety Questionnaire" note="适用于 Japanese Head SPA 60分钟净澈焕活护理及90分钟御龄深养护理。" items={HEAD} agree={HEAD_AGREE} value={value} setYn={setYn} />}
      {forms.has('body') && <YnForm refEl={bodyRef} title="身体 SPA 预约前安全问卷" en="Body SPA Safety Questionnaire" items={BODY} agree={BODY_AGREE} value={value} setYn={setYn} />}
    </section>
  )
}
