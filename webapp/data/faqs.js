import { business, categories } from './site.js'

// FAQ topics consolidated from the original 12 separate "Q&A" pages into one searchable page.
// General educational info only — the clinic should review the medical wording before launch.
export const faqTopics = [
  {
    id: 'botox',
    name: { en: 'Botox', zh: '肉毒素' },
    items: [
      {
        q: { en: 'What is Botox?', zh: '什么是肉毒杆菌素注射？' },
        a: { en: 'Botox is a neuromodulator. It temporarily relaxes the specific muscles that create expression lines, smoothing wrinkles and — when placed in the jaw — slimming the lower face.', zh: '肉毒素是一种神经调节剂，可暂时放松产生表情纹的肌肉，抚平皱纹；注射于咬肌可瘦脸。' },
      },
      {
        q: { en: 'What is the treatment like?', zh: '疗程是怎样的？' },
        a: { en: 'We discuss your goals and assess your muscle movement to plan dosage and placement. The injections themselves take only a few minutes. Mild redness or swelling usually fades within hours.', zh: '我们先沟通目标并评估肌肉活动，确定剂量与注射点。注射仅需几分钟，轻微红肿通常数小时内消退。' },
      },
      {
        q: { en: 'How should I care for my skin afterward?', zh: '术后需要注意什么？' },
        a: { en: 'Keep the area clean, stay hydrated, and skip strenuous exercise and alcohol for the rest of the day. Avoid rubbing or massaging the treated area.', zh: '保持治疗区域清洁、多喝水，当天避免剧烈运动与饮酒，不要揉按注射部位。' },
      },
      {
        q: { en: 'When will I see results, and how long do they last?', zh: '多久见效？效果维持多久？' },
        a: { en: 'Results typically appear within 3–7 days and peak at two weeks. Most clients enjoy them for about 3–4 months.', zh: '通常 3–7 天开始见效，两周达到最佳，效果一般维持 3–4 个月。' },
      },
    ],
  },
  {
    id: 'dermal-filler',
    name: { en: 'Dermal Filler', zh: '玻尿酸' },
    items: [
      {
        q: { en: 'What is dermal filler?', zh: '什么是玻尿酸填充？' },
        a: { en: 'Most fillers are made of hyaluronic acid, a sugar the body produces naturally to hold moisture. Injected, it restores volume and structure in lips, cheeks, chin, jaw and under the eyes.', zh: '多数填充剂由玻尿酸组成，这是人体天然存在的保湿成分。注射后可恢复唇部、面颊、下巴、下颌与眼下的饱满度与结构。' },
      },
      {
        q: { en: 'Is there downtime?', zh: '有恢复期吗？' },
        a: { en: 'Most people return to normal activities right away. Some swelling or bruising can occur and usually settles within a few days.', zh: '大多数人可立即恢复日常活动，可能出现的肿胀或淤青通常几天内消退。' },
      },
      {
        q: { en: 'How long does filler last?', zh: '效果维持多久？' },
        a: { en: 'Depending on the product and area, results generally last 6–18 months as the filler is gradually absorbed.', zh: '视产品与部位而定，通常维持 6–18 个月，之后会被逐渐吸收。' },
      },
    ],
  },
  {
    id: 'belkyra',
    name: { en: 'Belkyra', zh: '双下巴溶脂' },
    items: [
      {
        q: { en: 'What is Belkyra?', zh: '什么是 Belkyra？' },
        a: { en: 'Belkyra (known as Kybella in the US) is injectable deoxycholic acid — a molecule the body uses to break down dietary fat. It destroys fat cells under the chin, and those cells don’t come back.', zh: 'Belkyra（美国称 Kybella）是可注射的脱氧胆酸，人体本身用它来分解脂肪。它可破坏下巴下方的脂肪细胞，被破坏的细胞不会再生。' },
      },
      {
        q: { en: 'How many sessions will I need?', zh: '需要做几次？' },
        a: { en: 'Most clients need 2–4 sessions spaced about a month apart, depending on how much fullness there is.', zh: '视脂肪多少，多数人需要 2–4 次，每次间隔约一个月。' },
      },
      {
        q: { en: 'What should I expect afterward?', zh: '术后会怎样？' },
        a: { en: 'Swelling under the chin is normal for several days and is a sign the treatment is working. Cold compresses help.', zh: '下巴肿胀数天属正常现象，表示药物正在起效，可冷敷缓解。' },
      },
    ],
  },
  {
    id: 'botox-filler',
    name: { en: 'Botox + Filler', zh: '轮廓塑形' },
    items: [
      {
        q: { en: 'Why combine Botox and filler?', zh: '为什么要联合使用？' },
        a: { en: 'They solve different problems: Botox softens lines caused by movement, while filler replaces lost volume. Together they create a more complete, balanced rejuvenation.', zh: '两者解决不同问题：肉毒素淡化动态纹，填充剂补充流失容量，联合使用效果更全面、协调。' },
      },
      {
        q: { en: 'Can both be done in one visit?', zh: '可以同一次完成吗？' },
        a: { en: 'Often, yes. Your provider will recommend the right sequence for your face during the consultation.', zh: '通常可以。医生会在咨询时为您安排最合适的顺序。' },
      },
    ],
  },
  {
    id: 'instalift',
    name: { en: 'InstaLift', zh: '童颜线' },
    items: [
      {
        q: { en: 'What is Silhouette InstaLift?', zh: '什么是 Silhouette InstaLift？' },
        a: { en: 'A minimally invasive lift that uses dissolvable sutures with tiny cones to gently reposition sagging tissue in the mid-face and jawline. As the sutures dissolve, they stimulate collagen.', zh: '一种微创提拉，使用带微小锥体的可吸收缝线，轻柔提升面中部与下颌线松弛组织，缝线吸收过程中同时刺激胶原再生。' },
      },
      {
        q: { en: 'How long does it take?', zh: '需要多长时间？' },
        a: { en: 'About 45 minutes in-office with local anesthetic. Most people resume normal activity within a day or two.', zh: '门诊局部麻醉约 45 分钟，多数人一两天内恢复日常活动。' },
      },
      {
        q: { en: 'How long do results last?', zh: '效果维持多久？' },
        a: { en: 'Lift is visible immediately and continues to improve over a few months; results commonly last up to 18 months.', zh: '提升效果即时可见，并在数月内持续改善，通常可维持约 18 个月。' },
      },
    ],
  },
  {
    id: 'm22',
    name: { en: 'Stellar M22', zh: '光子嫩肤' },
    items: [
      {
        q: { en: 'What does IPL treat?', zh: 'IPL 能改善什么？' },
        a: { en: 'Sun spots, freckles, uneven tone, redness, rosacea and small visible vessels. Light energy is absorbed by pigment and blood, which the body then clears away.', zh: '晒斑、雀斑、肤色不均、泛红、玫瑰痤疮与细小血管。光能被色素与血红蛋白吸收后由身体代谢清除。' },
      },
      {
        q: { en: 'Is there downtime?', zh: '有恢复期吗？' },
        a: { en: 'Minimal. Spots may darken and flake off over 1–2 weeks. Use daily sunscreen and avoid tanning before and after.', zh: '很少。色斑可能先变深，1–2 周内脱落。前后需每日防晒、避免晒黑。' },
      },
    ],
  },
  {
    id: 'hybrid-fractional-laser',
    name: { en: 'Fractional Laser', zh: '点阵激光' },
    items: [
      {
        q: { en: 'What is a hybrid fractional laser?', zh: '什么是混合点阵激光？' },
        a: { en: 'It combines two laser wavelengths — one to gently resurface, one to stimulate collagen deeper down — treating tone, texture, fine lines and scars in a single session.', zh: '结合两种波长——一种温和焕肤，一种深层刺激胶原——一次改善肤色、质地、细纹与疤痕。' },
      },
      {
        q: { en: 'What is recovery like?', zh: '恢复期如何？' },
        a: { en: 'Expect a sunburn-like feeling and redness for a few days, then light peeling as fresh skin appears.', zh: '几天内会有类似晒伤的感觉与泛红，随后轻微脱皮，新生肌肤逐步显现。' },
      },
    ],
  },
  {
    id: 'aviclear',
    name: { en: 'AviClear', zh: '祛痘激光' },
    items: [
      {
        q: { en: 'What is AviClear?', zh: '什么是 AviClear？' },
        a: { en: 'The first FDA-cleared laser for acne. It selectively targets and suppresses the oil glands that drive breakouts — without prescription medication.', zh: '首个获 FDA 批准的祛痘激光，选择性抑制引发痤疮的皮脂腺，无需处方药。' },
      },
      {
        q: { en: 'What is the treatment like?', zh: '疗程是怎样的？' },
        a: { en: 'After cleansing, the laser is applied to acne-prone areas. You may feel warmth and a light snap. A typical course is three 30-minute sessions about a month apart.', zh: '清洁后将激光作用于痤疮区域，可能感到温热与轻微弹击感。一般三次疗程，每次约 30 分钟，间隔约一个月。' },
      },
    ],
  },
  {
    id: 'hydrafacial',
    name: { en: 'HydraFacial', zh: '水动力' },
    items: [
      {
        q: { en: 'What is HydraFacial Keravive?', zh: '什么是 HydraFacial Keravive？' },
        a: { en: 'A three-step scalp treatment: in-office cleansing and exfoliation with vortex technology, an infusion of growth-factor serum, then an at-home spray to extend results.', zh: '三步头皮护理：门诊漩涡技术清洁去角质，导入生长因子精华，再配合居家喷雾延续效果。' },
      },
      {
        q: { en: 'How often should I do it?', zh: '多久做一次？' },
        a: { en: 'A series of three monthly treatments is a common starting point, followed by maintenance as needed.', zh: '一般建议每月一次、连续三次为起始疗程，之后按需维护。' },
      },
      {
        q: { en: 'Is there downtime?', zh: '有恢复期吗？' },
        a: { en: 'None. It’s relaxing, and you can go straight back to your day.', zh: '没有。过程舒适，结束后即可恢复日常。' },
      },
    ],
  },
  {
    id: 'prp',
    name: { en: 'PRP', zh: 'PRP' },
    items: [
      {
        q: { en: 'What is PRP?', zh: '什么是 PRP？' },
        a: { en: 'Platelet-rich plasma is drawn from a small sample of your own blood and concentrated to several times the normal platelet level. Its growth factors support healing and regeneration.', zh: '富血小板血浆取自您少量自体血液，经离心浓缩至数倍血小板浓度，其中生长因子有助修复与再生。' },
      },
      {
        q: { en: 'What can PRP help with?', zh: 'PRP 适用于哪些问题？' },
        a: { en: 'Thinning hair and pattern hair loss, as well as skin texture, fine lines and under-eye rejuvenation.', zh: '头发稀疏与雄激素性脱发，以及肤质、细纹与眼周年轻化。' },
      },
      {
        q: { en: 'Is it safe?', zh: '安全吗？' },
        a: { en: 'Because PRP comes from your own blood, the risk of allergic reaction is very low. Mild tenderness at the treatment site is normal.', zh: '由于来自自体血液，过敏风险极低。治疗部位轻微酸痛属正常现象。' },
      },
    ],
  },
  {
    id: 'nad-iv',
    name: { en: 'NAD+ IV', zh: 'NAD+' },
    items: [
      {
        q: { en: 'What is NAD+?', zh: '什么是 NAD+？' },
        a: { en: 'Nicotinamide adenine dinucleotide is a coenzyme every cell uses to make energy and repair DNA. Levels fall as we age.', zh: '烟酰胺腺嘌呤二核苷酸是每个细胞产生能量、修复 DNA 所需的辅酶，其水平随年龄下降。' },
      },
      {
        q: { en: 'Why IV instead of supplements?', zh: '为什么选择静脉而不是口服？' },
        a: { en: 'IV delivery bypasses digestion so the full dose reaches your bloodstream.', zh: '静脉注射绕过消化系统，让全部剂量直接进入血液。' },
      },
      {
        q: { en: 'How long does a session take?', zh: '每次需要多久？' },
        a: { en: 'Typically 1–3 hours, depending on dose. Infusing slowly keeps you comfortable.', zh: '视剂量约 1–3 小时，缓慢输注更舒适。' },
      },
    ],
  },
  {
    id: 'hbot',
    name: { en: 'HBOT', zh: '高压氧' },
    items: [
      {
        q: { en: 'What is unique about HBOT?', zh: '高压氧有什么独特之处？' },
        a: { en: 'Under increased pressure, your blood dissolves far more oxygen than normal, delivering it deep into tissues to support repair, recovery and cellular health.', zh: '在加压环境下，血液可溶解远超平常的氧气，并输送至深层组织，促进修复与细胞健康。' },
      },
      {
        q: { en: 'What does a session feel like?', zh: '过程是什么感觉？' },
        a: { en: 'You relax in a comfortable chamber. You may feel ear pressure, similar to a flight, which equalizes easily.', zh: '您在舒适的舱内放松休息，可能感到类似乘飞机时的耳压，很容易调节。' },
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// FAQ organised like the menu: big title = category, small title = service.
// Hand-written answers (above) come first; every service also gets questions
// built from its own page content so nothing on the site can drift out of sync.
// ---------------------------------------------------------------------------
const L = (en, zh) => ({ en, zh })
const handById = Object.fromEntries(faqTopics.map((tp) => [tp.id, tp.items]))

const FACT_QUESTIONS = {
  'Typical session': L('How long does a session take?', '一次需要多久？'),
  'Best for': L('Who is it suited for?', '适合哪些人？'),
  Aftercare: L('What should I do afterward?', '做完后需要注意什么？'),
  'Good to know': L('Is there anything else I should know?', '还有什么需要知道的？'),
  'Severe acne?': L('What if my acne is severe?', '如果痘痘比较严重怎么办？'),
  'Pairs well with': L('What pairs well with it?', '可以搭配什么项目？'),
  Look: L('How noticeable are the results?', '效果有多明显？'),
  'Wear time': L('How long does it last?', '可以维持多久？'),
  'Fill schedule': L('How often are fills needed?', '多久需要补一次？'),
}

const bookingAnswer = L(
  `Tap “Consult” on the service page to send us a message, or call ${business.phone}. We’ll arrange a consultation to build the right plan for you.`,
  `请点击服务页面上的「咨询」按钮留言，或致电 ${business.phone}。我们会为您安排咨询，制定合适的方案。`,
)

function autoItems(item, hasHand) {
  const out = []
  if (!hasHand && item.body) {
    out.push({ q: L(`What is ${item.name.en}?`, `什么是${item.name.zh}？`), a: item.body })
  }
  if (item.bullets) {
    out.push({
      q: L('What can it help with?', '能带来哪些改善？'),
      a: { en: item.bullets.en.join('; ') + '.', zh: item.bullets.zh.join('、') + '。' },
    })
  }
  if (item.steps) {
    out.push({
      q: L('What does the process involve?', '流程是怎样的？'),
      a: {
        en: item.steps.en.map((st, i) => `${i + 1}. ${st}`).join(' '),
        zh: item.steps.zh.map((st, i) => `${i + 1}. ${st}`).join('；'),
      },
    })
  }
  if (item.packages?.some((p) => p.price)) { // packages without a listed price (body spa) get no price answer
    out.push({
      q: L('What options and prices are available?', '有哪些方案和价格？'),
      a: {
        en: item.packages.map((p) => `${p.name.en}: ${p.price}${p.was ? ` (regular ${p.was})` : ''}${p.tag ? `, ${p.tag.en}` : ''}`).join('; ') + '.',
        zh: item.packages.map((p) => `${p.name.zh}：${p.price}${p.was ? `（原价 ${p.was}）` : ''}${p.tag ? `，${p.tag.zh}` : ''}`).join('；') + '。',
      },
    })
  }
  if (item.suited) out.push({ q: L('Who is it suited for?', '适合哪些人？'), a: item.suited })
  for (const f of item.facts || []) {
    const q = FACT_QUESTIONS[f.label.en]
    if (q) out.push({ q, a: f.value })
  }
  out.push({ q: L('How do I book or ask a question?', '如何预约或咨询？'), a: bookingAnswer })
  return out
}

export const faqCategories = categories.map((c) => ({
  slug: c.slug,
  name: c.name,
  services: c.treatments.map((x) => {
    // HydraFacial's written answers are about the scalp version (Keravive), so they belong to the scalp service (hair-1) only.
    const handKey = x.faq && !(x.faq === 'hydrafacial' && x.key === 'skin-10') ? x.faq : null
    const hand = handKey ? handById[handKey] || [] : []
    return { key: x.key, name: x.name, items: [...hand, ...autoItems(x, hand.length > 0)] }
  }),
}))
