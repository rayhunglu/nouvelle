// Business details.
export const business = {
  name: 'Nouvelle Anti-Aging Center',
  phone: '(425) 598-1111',
  phoneHref: 'tel:+14255981111',
  wechatId: 'nouvellespa',
  locations: [
    {
      id: 'seattle',
      label: { en: 'Seattle Area', zh: '西雅图' },
      line1: '2020 124th Ave NE, Suite C201',
      line2: 'Bellevue, WA 98005',
      maps: 'https://maps.google.com/?q=2020+124th+Ave+NE+C201+Bellevue+WA+98005',
      embed: 'https://maps.google.com/maps?q=2020%20124th%20Ave%20NE%20Bellevue%20WA%2098005&z=15&output=embed',
    },
  ],
  hours: [
    { day: { en: 'Monday – Sunday', zh: '周一至周日' }, time: { en: '10:00 am – 7:00 pm', zh: '上午 10:00 – 晚上 7:00' } },
  ],
  holidayNote: { en: 'Closed on major holidays.', zh: '重大节日休息。' },
  urgentNote: { en: 'For urgent or special timing, please call us.', zh: '如有紧急特定时间，可电联咨询。' },
}

// Images are served from the clinic's existing site CDN. Swap for local files in
// /public when migrating off the old host.
const IMG = 'https://img1.wsimg.com/isteam/ip/56343825-34d1-4d56-b3a5-ef3f09046a86/'
const img = (file, w = 900) => `${IMG}${file}/:/rs=w:${w},cg:true,m`

export const logoImage = img('blob-8248bf2.png', 600)
export const heroImage = { zh: '/images/hero-main.png', en: '/images/hero-en.jpg' }

const baseCategories = [
  {
    slug: 'injectables',
    group: 'medical',
    icon: 'Syringe',
    name: { en: 'Injectables & Lifts', zh: '除皱 · 微整 · 面部提升' },
    short: { en: 'Botox, dermal fillers, Belkyra and thread lifts for a refreshed, natural look.', zh: '肉毒素、玻尿酸、溶脂针与提拉线，自然焕新容颜。' },
    intro: {
      en: 'Precise, conservative injectable work that softens lines, restores volume and defines your contours — without surgery or long recovery.',
      zh: '精准、适度的注射美容，淡化细纹、恢复饱满、勾勒轮廓——无需手术，恢复期短。',
    },
    treatments: [
      {
        name: { en: 'Botox', zh: '肉毒杆菌素注射' },
        subtitle: { en: '', zh: 'BOTULINUM TOXIN INJECTION' },
        image: img('Botox%20Ad.jpg'),
        more: [
          {
            en: 'The focus is on natural, precise and personalised results — improving lines and contours while keeping your expressions natural and lively.',
            zh: '强调自然、精准与个性化，在改善纹路与轮廓的同时，尽可能保留自然生动的面部表情。',
          },
        ],
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Soften dynamic lines | Improves forehead lines, crow’s feet and other expression lines", "Relax the masseter | Softens the jaw contour", "Refined chin | Smooths dimpling and tension", "Improve the neck line | Refines the neck and jawline", "Natural rejuvenation | A more relaxed, youthful overall look"], zh: ["淡化动态纹｜改善抬头纹鱼尾纹等表情纹", "放松咬肌｜使下颌轮廓更柔和", "精致下巴｜改善凹凸感与紧张感", "改善颈部线条｜优化颈部及下颌缘视觉线条", "自然年轻化｜让整体状态更舒展、年轻"] },
          },
          {
            title: { en: 'Treatment areas', zh: '适用部位' },
            text: { en: 'Forehead lines | Frown lines | Crow’s feet | Masseter | Chin | Neck', zh: '抬头纹｜眉间纹｜鱼尾纹｜咬肌｜下巴｜颈部' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Precise placement · Personalised dosing · Natural expression · Contour refinement', zh: '精准定点 · 个性化剂量 · 自然表情 · 轮廓优化' },
          },
        ],
        note: {
          en: 'Treatment plan, dose and treatment areas are determined after an in-person assessment by a qualified medical professional.',
          zh: '治疗方案、注射剂量及适用部位需根据个人情况，经专业医疗人员面诊评估后确定。',
        },
        faq: 'botox',
      },
      {
        name: { en: 'Dermal Filler', zh: '玻尿酸微调注射' },
        subtitle: { en: '', zh: 'HYALURONIC ACID INJECTION' },
        image: img('Revance%20RHA%202%203%204.jpg'),
        body: {
          en: 'Natural, refined and harmonious: personalised fine-tuning replenishes facial volume and balances contour proportions, for softer, more dimensional lines overall.',
          zh: '强调自然、精细与协调，通过个性化微调补充面部容量、修饰轮廓比例，让整体线条更加柔和立体。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Fill hollows | Improves volume loss and local hollowing", "Soften lines | Improves static lines such as nasolabial folds", "Contour sculpting | Refines the nose, chin and facial lines", "Fullness and dimension | Enhances fullness of the lips, cheeks and more", "Natural rejuvenation | Improves overall proportions and refinement"], zh: ["填充凹陷｜改善面部容量流失与局部凹陷", "柔化纹路｜改善法令纹等静态纹路", "轮廓塑形｜优化鼻部、下巴及面部线条", "丰盈立体｜提升唇部、苹果肌等部位饱满度", "自然年轻化｜改善整体比例与面部精致度"] },
          },
          {
            title: { en: 'Treatment areas', zh: '适用部位' },
            text: { en: 'Tear troughs | Nasolabial folds | Nose | Lips | Chin | Cheeks | Facial contour', zh: '泪沟｜法令纹｜鼻部｜唇部｜下巴｜苹果肌｜面部轮廓' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Precise fine-tuning · Personalised sculpting · Natural dimension · Contour refinement', zh: '精准微调 · 个性化塑形 · 自然立体 · 轮廓优化' },
          },
        ],
        note: {
          en: 'Treatment plan, dose and treatment areas are determined after an in-person assessment by a qualified medical professional.',
          zh: '治疗方案、注射剂量及适用部位需根据个人情况，经专业医疗人员面诊评估后确定。',
        },
        faq: 'dermal-filler',
      },
      {
        name: { en: 'Belkyra (Kybella)', zh: '双下巴溶脂' },
        subtitle: { en: '', zh: 'KYBELLA® INJECTION' },
        image: img('Belkyra-Injectable-_-Kybella-Injectable_1.jpg'),
        body: {
          en: 'Precisely targets fat in the submental area to reduce a double chin, refine the jawline and give the side profile a cleaner, sharper contour.',
          zh: '针对下颏区域脂肪进行精准改善，帮助减少双下巴脂肪堆积，优化下颌线条，让侧脸轮廓更加清晰利落。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Reduce submental fat | Improves a double chin and local fat build-up", "Define the jawline | Sharpens the jaw contour", "Balance the side profile | Refines the line where the chin meets the neck", "Refined contour | Gives the whole face more defined lines"], zh: ["减少下颏脂肪｜改善双下巴及局部脂肪堆积", "清晰下颌线｜提升下颌轮廓清晰度", "优化侧脸比例｜改善下巴与颈部衔接线条", "轮廓精致化｜让整体面部线条更利落"] },
          },
          {
            title: { en: 'Treatment area', zh: '适用部位' },
            text: { en: 'Submental area (double chin)', zh: '下颏区域（双下巴）' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Precise improvement · Non-surgical · Contour refinement · Personalised plan', zh: '精准改善 · 非手术方式 · 轮廓优化 · 个性化方案' },
          },
        ],
        note: {
          en: 'Treatment plan, number of sessions and dose are determined after an in-person assessment of the submental fat by a qualified medical professional.',
          zh: '治疗方案、注射次数及剂量需根据下颏脂肪情况，经专业医疗人员面诊评估后确定。',
        },
        faq: 'belkyra',
      },
      {
        name: { en: 'Botox + Filler Contouring', zh: '面部轮廓塑形' },
        subtitle: { en: '', zh: 'FACIAL CONTOURING' },
        image: img('Botox%20plus%20filler.jpg'),
        body: {
          en: 'Combining neuromodulator and hyaluronic-acid filler, the plan is designed around your facial proportions, muscle movement and volume distribution — improving local areas while keeping the whole face in harmony for a natural, refined contour.',
          zh: '结合肉毒素与玻尿酸填充剂，根据面部比例、肌肉动态与容量分布进行整体规划，改善局部的同时兼顾全脸协调，打造自然、精致的轮廓。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Optimise facial proportions | Balances the contour with the features overall", "Improve hollows | Restores volume for more dimension", "Soften dynamic lines | Eases expression lines and muscle tension", "Refined contour | Refines the chin, jawline and side profile", "Natural rejuvenation | Improves the overall look while keeping expressions natural"], zh: ["优化面部比例｜整体调整轮廓与五官协调度", "改善凹陷｜补充面部容量，提升立体感", "柔化动态纹｜改善表情纹与肌肉紧张感", "精致轮廓｜优化下巴、下颌线及侧脸线条", "自然年轻化｜改善整体状态，保留自然表情"] },
          },
          {
            title: { en: 'Treatment areas', zh: '适用部位' },
            text: { en: 'Forehead | Frown area | Eye area | Cheeks | Nose | Lips | Chin | Jawline | Neck', zh: '额头｜眉间｜眼周｜苹果肌｜鼻部｜唇部｜下巴｜下颌线｜颈部' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Full-face assessment · Combined design · Precise fine-tuning · Natural harmony', zh: '全脸评估 · 联合设计 · 精准微调 · 自然协调' },
          },
        ],
        note: {
          en: 'Treatment plan, product choice and dose are determined after an in-person assessment of your facial foundation by a qualified medical professional.',
          zh: '治疗方案、产品选择及注射剂量需根据个人面部基础，经专业医疗人员面诊评估后确定。',
        },
        faq: 'botox-filler',
      },
      {
        name: { en: 'Silhouette InstaLift', zh: '铃铛童颜线面部提升' },
        subtitle: { en: '', zh: 'THREAD LIFT' },
        image: img('Silhoutte%20Instalift.jpg'),
        body: {
          en: 'Absorbable threads lift and support the face, placed in a personalised pattern according to your degree of laxity and facial contour — improving sagging and a blurred contour for tighter, smoother, natural-looking lines.',
          zh: '通过可吸收线材进行面部提升与支撑，根据松弛程度及面部轮廓进行个性化布线，改善下垂与轮廓模糊，让面部线条更加紧致、流畅自然。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Firming lift | Improves facial laxity and sagging", "Reshape the contour | Sharpens and refines the jawline", "Improve the mid and lower face | Refines the cheeks, mouth corners and cheek lines", "Stimulate collagen | Helps improve skin firmness and elasticity", "Natural rejuvenation | Improves the overall contour for a naturally lifted look"], zh: ["提升紧致｜改善面部松弛与下垂感", "重塑轮廓｜提升下颌线清晰度与精致感", "改善中下面部｜优化苹果肌、口角及面颊线条", "刺激胶原｜帮助提升肌肤紧实度与弹性", "自然年轻化｜改善整体轮廓，呈现自然提升感"] },
          },
          {
            title: { en: 'Treatment areas', zh: '适用部位' },
            text: { en: 'Cheeks | Mid-face | Mouth corners | Jawline | Chin | Neck', zh: '苹果肌｜面颊｜口角｜下颌线｜下巴｜颈部' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Personalised thread placement · Multi-layer lifting · Contour reshaping · Natural firming', zh: '个性化布线 · 多层次提升 · 轮廓重塑 · 自然紧致' },
          },
        ],
        note: {
          en: 'Treatment plan, number of threads and implant depth are determined after an in-person assessment of your facial foundation and degree of laxity by a qualified medical professional.',
          zh: '治疗方案、线材数量及植入层次需根据个人面部基础与松弛程度，经专业医疗人员面诊评估后确定。',
        },
        faq: 'instalift',
      },
      {
        name: { en: 'Non-Surgical Face Contouring', zh: '轮廓固定' },
        image: img('%E8%BD%AE%E5%BB%93%E5%9B%BA%E5%AE%9A1.png'),
        body: {
          en: 'In expert hands, injectables can correct asymmetry and reshape the face. Every plan is custom-designed around your features.',
          zh: '由专业医美专家量身定制，透过注射矫正不对称、重塑脸型。',
        },
      },
    ],
  },
  {
    slug: 'skin',
    group: 'medical',
    icon: 'Sparkles',
    name: { en: 'Skin Treatments', zh: '皮肤抗衰疗程' },
    short: { en: 'Thermage, lasers, IPL and microneedling for clear, firm, even skin.', zh: '热玛吉、激光、光子嫩肤与微针，改善肤质与紧致度。' },
    intro: {
      en: 'Medical-grade devices for tightening, resurfacing and correcting pigment — matched to your skin type and goals.',
      zh: '医疗级设备，紧致、焕肤、祛斑——根据您的肤质与目标量身选择。',
    },
    treatments: [
      {
        name: { en: 'Thermage FLX (5th Gen)', zh: '热玛吉第五代' },
        image: img('Thermage%20flx%205th.jpg'),
        body: {
          en: 'Non-invasive radiofrequency that heats deep skin layers to tighten and smooth — including delicate areas around the eyes — and temporarily improve the look of cellulite.',
          zh: '非侵入式射频深层加热，紧致抚平皱纹（包括眼周），并暂时改善橘皮组织外观。',
        },
      },
      {
        name: { en: 'Mesotherapy', zh: '水光针' },
        subtitle: { en: '', zh: 'SKIN BOOSTER' },
        image: img('mesotherapy.jpg'),
        body: {
          en: 'A skin-booster plan tailored to your skin condition: suitable actives are delivered into the skin to improve dryness, dullness, roughness and loss of elasticity together, for healthy, dewy, radiant skin.',
          zh: '根据不同肌肤状态定制水光方案，将适合的活性成分导入肌肤，针对干燥、暗沉、粗糙及弹性下降等问题进行综合改善，打造水润透亮的健康肤质。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Deep hydration | Improves dryness and boosts moisture", "Brighten the complexion | Improves dullness and restores a natural glow", "Repair the barrier | Helps stabilise the skin and strengthen its condition", "Refined texture | Improves roughness and softness", "Firm and revitalise | Improves elasticity and fine lines for a younger look"], zh: ["深层补水｜改善干燥缺水，提升水润度", "提亮肤色｜改善暗沉，恢复自然光泽", "修护屏障｜帮助稳定肤况，增强肌肤状态", "细腻肤质｜改善粗糙感，提升柔嫩度", "紧致焕活｜改善弹性与细纹，提升年轻感"] },
          },
          {
            title: { en: 'Suited skin conditions', zh: '适合肤况' },
            text: { en: 'Dry and dehydrated | Dull | Rough texture | Fine lines and laxity | Visible pores | Weak barrier', zh: '干燥缺水｜暗沉无光｜肤质粗糙｜细纹松弛｜毛孔明显｜屏障状态不佳' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Personalised · Dewy radiance · Better skin quality · All-round rejuvenation', zh: '个性定制 · 水润焕亮 · 肤质改善 · 综合年轻化' },
          },
        ],
        note: {
          en: 'Products, ingredients, treatment method and course are determined after an in-person assessment of your skin by a qualified medical professional.',
          zh: '具体产品、成分、治疗方式及疗程需根据个人肤质，经专业医疗人员面诊评估后确定。',
        },
      },
      {
        name: { en: 'Stellar M22 IPL', zh: '光子嫩肤' },
        image: img('M22%20-7464be8.jpg'),
        body: {
          en: 'Intense pulsed light targets the pigment behind sun spots and freckles, and the redness behind rosacea and broken capillaries.',
          zh: '强脉冲光针对色斑、雀斑的黑色素与泛红的血红蛋白，改善肤色不均。',
        },
        faq: 'm22',
      },
      {
        name: { en: 'Fractional Laser', zh: '点阵激光祛疤去痘印' },
        image: img('skin%20treat.jpg'),
        body: {
          en: 'Thousands of microscopic laser columns renew sun-damaged or scarred skin and fade acne marks by triggering natural healing.',
          zh: '微小激光柱刺激自然修复，改善晒伤与疤痕，淡化痘印。',
        },
        faq: 'hybrid-fractional-laser',
      },
      {
        name: { en: 'AviClear', zh: '无痛祛痘激光' },
        image: img('skin%20treat.jpg'),
        body: {
          en: 'A laser treatment that calms overactive oil glands to clear acne at its source — no prescription medication needed.',
          zh: '激光抑制过度活跃的皮脂腺，从源头改善痤疮，无需口服药物。',
        },
        faq: 'aviclear',
      },
      {
        name: { en: 'PicoSure Laser', zh: 'Pico 激光祛斑去纹身' },
        image: img('Pico%20Laser.jpg'),
        body: {
          en: 'Ultra-short pulses break up tattoo ink and pigment — melasma, freckles, birthmarks — and refine scars and fine lines on face or body.',
          zh: '超短脉冲击碎纹身墨水与色素（黄褐斑、雀斑、胎记），并改善疤痕与细纹。',
        },
      },
      {
        name: { en: 'RF Microneedling', zh: '射频微针' },
        image: img('RF%20Micro%20Needling.jpg'),
        body: {
          en: 'Fine needles with radiofrequency energy spark new collagen and elastin for firmer, smoother texture.',
          zh: '微针结合射频能量，激发胶原与弹性蛋白新生，令肌肤更紧致细腻。',
        },
      },
      {
        name: { en: 'Red & Blue Light Therapy', zh: '红蓝光治疗' },
        image: img('red%20and%20blue.jpg'),
        body: {
          en: 'Painless LED therapy: blue light clears mild-to-moderate acne, red light calms redness and supports collagen.',
          zh: '无痛 LED 疗法：蓝光改善轻中度痤疮，红光舒缓泛红、促进胶原。',
        },
      },
      {
        name: { en: 'CO₂ Laser Resurfacing', zh: 'CO₂ 激光祛疤' },
        image: img('CO2%20laser-resurfacing.jpg'),
        body: {
          en: 'Our most powerful resurfacing option for deep wrinkles and scarring, replacing damaged skin with fresh new cells.',
          zh: '强效焕肤，针对深层皱纹与疤痕，以新生细胞取代受损肌肤。',
        },
        bullets: {
          en: ['Acne scars', 'Sun damage', 'Deep wrinkles', 'Brown spots', 'Stretch marks', 'Benign growths'],
          zh: ['痤疮疤痕', '晒伤', '深层皱纹', '褐色斑点', '妊娠纹', '良性增生'],
        },
      },
      {
        name: { en: 'HydraFacial', zh: '水动力深层清洁' },
        image: img('skin%20treat.jpg'),
        body: {
          en: 'A three-step cleanse, extract and hydrate facial with immediate glow and zero downtime.',
          zh: '清洁、导出、补水三步护理，立即焕亮，无恢复期。',
        },
        faq: 'hydrafacial',
      },
    ],
  },
  {
    slug: 'hair',
    group: 'medical',
    icon: 'Wind',
    name: { en: 'Hair Rejuvenation', zh: '生发 · 养发 · 护发' },
    short: { en: 'Scalp care, PRP and stem-cell therapies for thicker, healthier hair.', zh: '头皮护理、PRP 与干细胞疗法，让头发更浓密健康。' },
    intro: {
      en: 'Healthy hair starts at the scalp. Our programs combine deep cleansing with regenerative therapies to support growth.',
      zh: '健康秀发从头皮开始。我们结合深层清洁与再生疗法，促进毛发生长。',
    },
    treatments: [
      {
        name: { en: 'HydraFacial Keravive', zh: '水动力头皮毛囊深层清洁' },
        image: img('HydraFacial%20Scalp-d1d7bf5.jpg'),
        body: {
          en: 'A relaxing scalp treatment that cleanses, exfoliates and nourishes follicles for fuller-looking hair.',
          zh: '舒缓的头皮护理，清洁、去角质、滋养毛囊，令头发更丰盈。',
        },
        faq: 'hydrafacial',
      },
      {
        name: { en: 'PRP Hair Restoration', zh: 'PRP 生发疗程' },
        subtitle: { en: '', zh: 'PRP HAIR RESTORATION' },
        image: img('PRP%20Hair%20Restoration-cf4ad73.jpg'),
        body: {
          en: 'High-concentration platelet-rich plasma (PRP) is extracted from your own blood, and its rich growth factors act on the scalp and follicles — helping improve the scalp environment, strengthen follicle vitality and support healthier hair growth.',
          zh: '采用自体血液提取高浓度富血小板血浆（PRP），利用其中丰富的生长因子作用于头皮及毛囊，帮助改善头皮环境、增强毛囊活力，促进更健康的头发生长。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Activate follicles | Improves follicle vitality and supports hair growth", "Improve hair loss | Helps reduce shedding and thinning", "Strengthen strands | Improves fine, soft hair and overall hair health", "Improve the scalp environment | Helps maintain a healthy environment for hair growth", "Fuller-looking hair | Gradually improves thinning"], zh: ["激活毛囊｜改善毛囊活力，促进头发生长", "改善脱发｜帮助减少掉发与头发稀疏", "强韧发丝｜改善细软发质，提升头发健康度", "改善头皮环境｜帮助维持健康的毛发生长环境", "提升发量视觉感｜逐步改善头发稀疏状态"] },
          },
          {
            title: { en: 'Who it’s for', zh: '适合人群' },
            text: { en: 'Thinning hair | Receding hairline | Fine, soft hair | Increased shedding | Some types of hair loss | Anyone who wants fuller hair overall', zh: '头发稀疏｜发际线后移｜头发细软｜掉发增多｜部分类型脱发｜希望改善整体发量者' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Autologous · Growth-factor revitalisation · Follicle care · Gradual improvement', zh: '自体提取 · 生长因子焕活 · 毛囊养护 · 渐进改善' },
          },
        ],
        note: {
          en: 'Treatment plan, number of sessions and intervals are determined after an in-person assessment of the cause of hair loss and the condition of your follicles and scalp by a qualified medical professional.',
          zh: '治疗方案、疗程次数及治疗间隔需根据个人脱发原因、毛囊及头皮状态，经专业医疗人员面诊评估后确定。',
        },
        faq: 'prp',
      },
      {
        name: { en: 'Stem-Cell Hair Regeneration', zh: '干细胞精华头皮导入' },
        image: img('Stem%20Cell%20Hair%20Restoration.png'),
        body: {
          en: 'Regenerative serum delivered into the scalp to revitalize thinning areas using the body’s natural repair signals.',
          zh: '将再生精华导入头皮，借助人体自然修复机制改善稀疏区域。',
        },
      },
    ],
  },
  {
    slug: 'body',
    group: 'medical',
    icon: 'Activity',
    name: { en: 'Body Sculpting', zh: '身体塑形' },
    short: { en: 'EMSculpt, BTL and Lipodissolve to tone muscle and reduce stubborn fat.', zh: 'EMSculpt、BTL 与消脂针，增肌减脂、紧致塑形。' },
    intro: {
      en: 'Non-surgical contouring for the areas diet and exercise can’t reach. Not weight loss — shape.',
      zh: '针对饮食与运动难以改善的部位，非手术塑形。不是减重，而是塑造线条。',
    },
    treatments: [
      {
        name: { en: 'EMSculpt', zh: '磁波塑肌燃脂' },
        image: img('Emsculpt_POST_July-Calendar_13072020_EN100_LI.png'),
        body: {
          en: 'High-intensity electromagnetic energy builds muscle and burns fat. FDA-cleared for the abdomen, buttocks, arms, calves and thighs.',
          zh: '高强度电磁能量增肌燃脂，获 FDA 批准用于腹部、臀部、手臂、小腿与大腿。',
        },
      },
      {
        name: { en: 'BTL Skin Tightening', zh: 'BTL 溶脂刀' },
        image: img('BTL%20Treat.jpg'),
        body: {
          en: 'Non-invasive energy reduces fat cells and stimulates collagen for a firmer, more toned look.',
          zh: '非侵入式减少脂肪细胞并刺激胶原蛋白，令身形更紧致健美。',
        },
      },
      {
        name: { en: 'Lipodissolve', zh: '皮下减脂塑形' },
        subtitle: { en: '', zh: 'FAT REDUCTION INJECTION' },
        image: img('Lipodissolve.jpg'),
        body: {
          en: 'Stubborn local fat is assessed individually, and an injection-based plan helps improve fat build-up and local contours for tighter, smoother body lines.',
          zh: '针对局部顽固脂肪进行个性化评估，通过注射类方案辅助改善脂肪堆积与局部轮廓，使身体线条更加紧致、流畅。',
        },
        sections: [
          {
            title: { en: 'Key benefits', zh: '主要功效' },
            items: { en: ["Improve local fat | Targets stubborn fat build-up", "Local contour sculpting | Refines body proportions and local lines", "Non-surgical | No traditional liposuction surgery needed", "Precise improvement | A personalised plan based on fat thickness", "Natural and gradual | The contour improves step by step over the course"], zh: ["改善局部脂肪｜针对顽固脂肪堆积进行改善", "局部轮廓塑形｜优化身体比例与局部线条", "非手术方式｜无需传统吸脂手术", "精细化改善｜根据脂肪厚度制定个性化方案", "自然渐进｜轮廓随疗程逐步改善"] },
          },
          {
            title: { en: 'Common assessment areas', zh: '常见评估部位' },
            text: { en: 'Submental area | Abdomen | Flanks | Upper arms | Thighs and other local fat areas', zh: '下颏｜腹部｜腰侧｜上臂｜大腿等局部脂肪区域' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Local fat reduction · Precise sculpting · Non-surgical plan · Personalised', zh: '局部减脂 · 精准塑形 · 非手术方案 · 个性化定制' },
          },
        ],
        note: {
          en: 'KYBELLA® (deoxycholic acid) is FDA-approved in the US for moderate to severe fat in the submental area (double chin) in adults. Other body areas such as the abdomen, flanks, arms and thighs are not FDA-approved indications of KYBELLA®. The exact treatment is determined after an in-person assessment by a qualified medical professional.',
          zh: '美国 FDA 批准的 KYBELLA®（deoxycholic acid）适应症为改善成人下颏区域中度至重度脂肪（双下巴）；腹部、腰侧、手臂、大腿等身体部位并非 KYBELLA® 的 FDA 批准适应症。具体治疗方式需由专业医疗人员面诊评估后确定。',
        },
      },
    ],
  },
  {
    slug: 'wellness',
    group: 'medical',
    icon: 'HeartPulse',
    name: { en: 'Daily Health', zh: '日常健康' },
    short: { en: 'Hyperbaric oxygen therapy and vitamin B-complex shots.', zh: '高压氧舱与维生素 B 群注射。' },
    intro: {
      en: 'Anti-aging from the inside out — therapies that support energy, recovery and long-term vitality.',
      zh: '由内而外的抗衰老——提升能量、促进修复、长久保持活力。',
    },
    treatments: [
      {
        name: { en: 'Hyperbaric Oxygen Therapy (HBOT)', zh: '高压氧舱全身抗衰' },
        image: img('Oxyair.jpg'),
        body: {
          en: 'Breathing concentrated oxygen under pressure. Research associates HBOT with longer telomeres and clearance of senescent cells — two markers of biological aging.',
          zh: '在加压环境中吸入高浓度氧气。研究显示可增加端粒长度、清除衰老细胞。',
        },
        faq: 'hbot',
      },
      {
        name: { en: 'B-Complex Shots', zh: '维生素 B 群注射' },
        subtitle: { en: '', zh: 'VITAMIN B COMPLEX INJECTION' },
        image: img('B%20Complex%20Inject.jpg'),
        body: {
          en: 'B vitamins are supplemented by injection, a more direct way to top up for people with specific nutritional needs, helping maintain normal energy metabolism, nervous-system and bodily function.',
          zh: '通过注射方式补充维生素 B 群，为存在特定营养需求的人群提供更直接的补充方式，帮助维持正常的能量代谢、神经系统及身体机能。',
        },
        sections: [
          {
            title: { en: 'Key effects', zh: '主要作用' },
            items: { en: ["Support energy metabolism | Involved in normal energy metabolism", "Support the nervous system | Helps maintain normal nervous-system function", "Nutritional supplementation | Provides the B vitamins you need, based on your situation", "Support red blood cell production | Some B vitamins take part in normal blood formation", "Maintain overall function | Supports normal physiological function and nutritional status"], zh: ["支持能量代谢｜参与人体正常能量代谢过程", "支持神经系统｜帮助维持正常神经系统功能", "营养补充｜针对个人情况补充所需 B 族维生素", "支持红细胞生成｜部分 B 族维生素参与正常造血功能", "维持整体机能｜支持身体正常生理功能与营养状态"] },
          },
          {
            title: { en: 'Who it’s for', zh: '适合人群' },
            text: { en: 'People with a B-vitamin need confirmed by professional assessment | Those with insufficient dietary intake | Those with a specific B-vitamin deficiency or poor absorption', zh: '经专业评估存在维生素 B 群补充需求者｜饮食摄入不足者｜特定维生素 B 缺乏或吸收不佳者' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Professional assessment · Personalised supplementation · Injectable delivery · Nutritional support', zh: '专业评估 · 个性化补充 · 注射给药 · 营养支持' },
          },
        ],
        note: {
          en: 'The exact ingredients, dose, injection method and whether treatment is suitable are determined by a qualified medical professional based on your health, medications and any necessary test results.',
          zh: '具体成分、剂量、注射方式及是否适合治疗，需根据个人健康状况、用药情况及必要的检查结果，由专业医疗人员评估后确定。',
        },
      },
    ],
  },
  {
    slug: 'iv-therapy',
    group: 'medical',
    icon: 'Droplet',
    name: { en: 'NAD+ & IV Therapy', zh: '营养针疗法' },
    short: { en: 'Intravenous vitamins and NAD+ for energy, clarity and recovery.', zh: '静脉营养与 NAD+，提升精力、专注与修复。' },
    intro: {
      en: 'IV infusions deliver vitamins and NAD+ directly into the bloodstream for full absorption — supporting cellular energy and overall wellbeing.',
      zh: '静脉输注将维生素与 NAD+ 直接送入血液，充分吸收，支持细胞能量与整体健康。',
    },
    treatments: [
      {
        name: { en: 'NAD+ IV', zh: 'NAD+ 静脉注射' },
        image: img('Image_20230810232053.jpg'),
        body: {
          en: 'NAD+ is a coenzyme found in every cell that declines with age. Replenishing it may support energy, mental clarity and healthy aging.',
          zh: 'NAD+ 是存在于每个细胞中的辅酶，会随年龄下降。补充 NAD+ 有助于提升精力、思维清晰与健康老化。',
        },
        faq: 'nad-iv',
      },
      {
        name: { en: 'IV Nutrition', zh: '静脉营养' },
        image: img('Image_20230810232053.jpg'),
        body: {
          en: 'Custom blends of vitamins, minerals and hydration tailored to how you want to feel.',
          zh: '根据需求定制维生素、矿物质与补水配方。',
        },
      },
    ],
  },
  {
    slug: 'hormone-stem-cell',
    group: 'medical',
    icon: 'Dna',
    name: { en: 'Hormone & Stem Cell', zh: '荷尔蒙 & 干细胞' },
    short: { en: 'Whole-body anti-aging with hormone balancing and stem-cell therapy.', zh: '荷尔蒙平衡与干细胞疗法，全身抗衰老。' },
    intro: {
      en: 'Hormones regulate nearly every system in the body and decline with age. Restoring balance — and harnessing regenerative medicine — addresses aging at its root.',
      zh: '荷尔蒙调控人体几乎所有系统，并随年龄下降。恢复平衡、结合再生医学，从根源应对衰老。',
    },
    treatments: [
      {
        name: { en: 'Hormone Balance Therapy', zh: '荷尔蒙平衡补充治疗' },
        subtitle: { en: '', zh: 'HORMONE REPLACEMENT THERAPY' },
        image: img('Hormone%20Level.png'),
        body: {
          en: 'After professional assessment and any necessary tests, a personalised hormone supplementation plan is designed to help ease the discomfort caused by hormone changes and improve overall quality of life.',
          zh: '通过专业评估与必要检查，制定个性化荷尔蒙补充方案，帮助改善荷尔蒙变化带来的不适，提升整体生活质量。',
        },
        sections: [
          {
            title: { en: 'Key effects', zh: '主要作用' },
            items: { en: ["Ease menopausal discomfort | Relieves hot flushes, night sweats and related symptoms", "Support sleep and mood | Improves sleep and mood swings", "Maintain bone health | Supports bone health after menopause", "Hormone management | Manages hormone-level abnormalities confirmed by testing"], zh: ["改善更年期不适｜缓解潮热、盗汗等症状", "支持睡眠情绪｜改善睡眠及情绪波动", "维持骨骼健康｜支持绝经后骨骼健康", "荷尔蒙管理｜针对检查确认的荷尔蒙水平异常进行管理"] },
          },
          {
            title: { en: 'Who it’s for', zh: '适合人群' },
            text: { en: 'Women in perimenopause and menopause | Women or men with a need for hormone therapy confirmed by medical assessment', zh: '围绝经期及更年期女性｜经医学评估存在荷尔蒙治疗需求的女性或男性' },
          },
          {
            title: { en: 'Treatment methods', zh: '治疗方式' },
            text: { en: 'Oral medication | Patches / gels | Injectable therapy', zh: '口服药物｜贴剂/凝胶｜注射治疗' },
          },
          {
            title: { en: 'Highlights', zh: '项目特点' },
            text: { en: 'Medical assessment · Personalised plan · Regular monitoring', zh: '医学评估 · 个性化方案 · 定期监测' },
          },
        ],
        note: {
          en: 'The exact treatment method, medication and dose are determined by a qualified medical professional based on your symptoms, medical history and test results.',
          zh: '具体治疗方式、药物及剂量需结合个人症状、病史及检查结果，由专业医疗人员评估后确定。',
        },
      },
      {
        name: { en: 'Stem Cell Therapy', zh: '干细胞治疗' },
        image: img('Stem%20Cell%202.jpg'),
        body: {
          en: 'Personalized regenerative treatment for skin rejuvenation and whole-body anti-aging, overseen by a US-licensed MD with stem-cell research training.',
          zh: '个性化再生治疗，用于皮肤年轻化与全身抗衰老，由具备干细胞科研背景的美国执照医师主导。',
        },
        steps: {
          en: ['One-on-one consultation with our stem-cell specialist', 'VIP health screening — genetics, food sensitivities, biological age, metabolic and hormone panels', 'A customized treatment plan and cell protocol'],
          zh: ['干细胞专家一对一咨询', 'VIP 体检——基因检测、食物过敏、生物年龄、代谢与激素检测', '定制个人化治疗方案'],
        },
      },
    ],
  },
  {
    slug: 'microblading',
    group: 'medical',
    icon: 'PenTool',
    name: { en: 'Microblading', zh: '半永久纹绣' },
    short: { en: 'Brows, lash-line liner and non-invasive pigment removal by a certified artist.', zh: '认证纹绣师打造眉形、美瞳线，并提供无创洗眉洗眼线。' },
    intro: {
      en: 'Semi-permanent makeup takes both precise technique and a strong aesthetic eye. Wake up with brows designed for your face.',
      zh: '半永久纹绣需要精准技术与出色审美。每天醒来，都拥有专属于您的眉形。',
    },
    artist: {
      name: 'Coco Zhu',
      image: '/images/treatments/shared/artist-portrait.jpg', // the clinic's own portrait (replaces the old one)
      bio: {
        en: 'Coco is a registered member of the Washington State Beauty Council and the Society of Permanent Cosmetic Professionals, specializing in premium brow-and-eye image design. A senior aesthetician with ten years of makeup and permanent-makeup experience, she designs every look one-on-one — refusing the ordinary and pursuing perfection.',
        zh: 'Coco 是美国华盛顿州美容委员会及永久美容专业人士协会注册会员，专注眉眼高级形象设计，资深美学家。十年化妆与纹绣经验，一对一定制，拒绝平庸，追求完美。',
      },
    },
    treatments: [
      {
        id: 'brow-shaping',
        name: { en: 'Custom Brow Shaping', zh: '定制修眉' },
        poster: '/images/treatments/shared/custom-brow-poster.jpg',
        body: {
          en: 'One-on-one brow design based on your face shape, feature proportions, brow-bone structure, eye shape and the natural growth direction of your brows.',
          zh: '根据个人脸型、五官比例、眉骨结构、眼型及原生眉毛生长方向进行一对一眉形设计。',
        },
        bullets: {
          en: ['Brow shape customized to your face shape', 'Refined brow peak, tail and overall proportions', 'Flatters face shape and feature contours', 'Keeps the natural, native brow feel', 'Clean and neat, with no complicated daily upkeep'],
          zh: ['根据个人脸型定制眉形', '优化眉峰、眉尾及整体比例', '修饰脸型与五官轮廓', '保留自然原生眉感', '干净利落，日常无需复杂打理'],
        },
        suited: {
          en: 'People with untidy or asymmetrical brows, brows that lack definition, or who aren’t sure which brow shape suits them.',
          zh: '眉形杂乱、左右不对称、眉毛缺乏轮廓感，或不知道自己适合什么眉形的人群。',
        },
      },
      {
        id: 'personalized-makeup',
        name: { en: 'Personalized Makeup Design', zh: '个人形象定制妆容' },
        poster: '/images/treatments/shared/personalized-makeup-poster.jpg',
        body: {
          en: 'No fixed makeup templates. A one-on-one makeup design built around your face shape, feature proportions, skin tone, bone structure, hairstyle, style of dress and personal temperament.',
          zh: '不套用固定妆容模板，而是根据个人的脸型、五官比例、肤色、骨相特点、发型、穿搭风格及个人气质，进行一对一专属妆容设计。',
        },
        bullets: {
          en: [
            'Makeup customized to your face shape and feature proportions',
            'Colour matching based on your skin tone and personal temperament',
            'Corrections and proportion adjustments for your facial features',
            'Makeup, hairstyle and overall image designed in harmony',
            'No cookie-cutter looks — your individuality stays recognizable',
            'Makeup style tailored to different occasions',
          ],
          zh: [
            '根据脸型与五官比例定制妆容',
            '结合肤色与个人气质进行色彩搭配',
            '针对面部特点进行修饰与比例调整',
            '妆容、发型与整体形象协调设计',
            '拒绝千篇一律，保留个人辨识度',
            '可根据不同场合定制妆容风格',
          ],
        },
        suited: {
          en: 'People who want to elevate their personal image, aren’t sure which makeup suits them, or need makeup for important occasions such as dates, parties, business events, photoshoots and banquets.',
          zh: '希望提升个人形象、不确定自己适合什么妆容，或有约会、聚会、商务、拍摄、宴会等重要场合妆容需求的人群。',
        },
      },
      {
        id: 'ombre-brows',
        name: { en: 'Soft Misty (Ombré) Brows', zh: '高级感水雾眉' },
        poster: '/images/treatments/shared/ombre-brows-poster.jpg',
        body: {
          en: 'A soft, misty finish like brow powder lightly swept on, with natural, translucent gradient layers.',
          zh: '像眉粉轻轻扫过般的柔雾感，又带着自然通透的渐变层次。',
        },
        more: [
          {
            en: 'No harsh outlines or heavy blocks of colour — instead a light, soft, clean, low-makeup look: a complete brow shape from a distance, and still natural and fine up close.',
            zh: '不追求生硬边框与浓重色块，而是强调轻盈、柔和、干净、低妆感，远看有完整眉形，近看依然自然细腻。',
          },
        ],
        bullets: {
          en: [
            'One-on-one custom brow shape',
            'Natural gradient with no harsh edges',
            'Light, translucent mist with a low-makeup feel',
            'Refines the brow shape and feature proportions',
            'Natural when bare-faced, polished with makeup',
          ],
          zh: ['一对一定制眉形', '自然渐变，无生硬边框', '轻透柔雾，低妆感', '修饰眉形与五官比例', '素颜自然，带妆精致'],
        },
        suited: {
          en: 'Suited to sparse or incomplete brows, asymmetry, and anyone who loves a natural soft-mist look and wants to spend less time drawing brows every day.',
          zh: '适合眉毛稀疏、眉形不完整、左右不对称，以及喜欢自然柔雾感、希望减少日常画眉时间的人群。',
        },
      },
      {
        id: 'lash-line-liner',
        name: { en: 'Natural Lash-Line Enhancer', zh: '自然款美瞳线' },
        body: {
          en: 'Fine pigment placed along the lash roots fills the gaps between lashes for a natural, invisible inner-liner effect. It does not exaggerate the outer corner — eyes look brighter while staying clear and natural.',
          zh: '沿睫毛根部精细着色，填补睫毛间隙，打造自然隐形的内眼线效果。不刻意拉长眼尾，让双眼更有神，同时保留清透自然感。',
        },
        bullets: {
          en: [
            'Naturally enlarges the eyes',
            'Adds a fuller lash look',
            'Light line that never looks heavy',
            'Natural bare-faced, more polished with makeup',
            'Saves time on daily eyeliner',
          ],
          zh: ['自然放大双眼', '增加睫毛浓密感', '线条轻盈，不显厚重', '素颜自然，带妆更精致', '减少日常画眼线时间'],
        },
        suited: {
          en: 'Suited to sparse lash roots, eyes that tend to look tired, or anyone who loves a natural no-makeup look and does not want a heavy liner effect.',
          zh: '适合睫毛根部稀疏、眼神容易显疲惫，或喜欢自然裸妆感、不希望眼线感过重的人群。',
        },
        poster: '/images/treatments/shared/lash-line-liner-poster.jpg',
      },
      {
        id: 'brow-removal',
        name: { en: 'Non-Invasive Brow Pigment Removal', zh: '无创黑科技洗眉' },
        body: {
          en: 'Fades pigment for brows that are too dark, uneven, unsatisfying in shape, or carry leftover colour from old work — helping the body metabolise deposited pigment and laying the groundwork for a fresh brow design.',
          zh: '针对眉色过深、颜色不均、眉形不满意及旧眉残色进行淡化管理，帮助代谢沉积色素，为后续重新设计眉形打好基础。',
        },
        bullets: {
          en: [
            'Non-laser fading method',
            'Targets leftover pigment from old brows',
            'Improves colour that is too dark, reddish or bluish',
            'Leaves a cleaner base for a second brow design',
            'Gentler procedure with a relatively easy recovery',
          ],
          zh: ['非激光淡化方式', '针对旧眉残色管理', '改善颜色过深、发红发蓝', '为二次改眉预留更干净底色', '操作更温和，恢复期相对轻松'],
        },
        suited: {
          en: 'Suited to old brows that are too dark or have changed colour, brow shapes you are unhappy with, or anyone preparing to redesign or redo their brows.',
          zh: '适合旧眉颜色过深、变色、眉形不满意，或准备重新设计眉形、二次改眉的人群。',
        },
        poster: '/images/treatments/shared/brow-removal-poster.jpg',
      },
      {
        id: 'eyeliner-removal',
        name: { en: 'Non-Invasive Eyeliner Pigment Removal', zh: '无创黑科技洗眼线' },
        body: {
          en: 'Professional fading for old eyeliner that is too dark, bleeding, or unsatisfying in shape — gradually easing leftover pigment so the lash line looks natural and clean again.',
          zh: '针对旧眼线、颜色过深、晕色及眼线形态不满意进行专业淡化管理，帮助逐步改善残留色素，让眼部线条恢复自然清爽。',
        },
        bullets: {
          en: [
            'Fades pigment from old eyeliner',
            'Improves bluish tones, bleeding and over-dark colour',
            'Precise, targeted treatment',
            'Reduces the heavy look of old liner',
            'Leaves room for a fresh redesign',
          ],
          zh: ['针对旧眼线色素淡化', '改善发蓝、晕色及颜色过深', '精细操作，针对性处理', '减轻旧眼线厚重感', '为后续重新设计预留空间'],
        },
        suited: {
          en: 'Suited to old eyeliner that is too dark, has changed colour, bled, or looks unsatisfying, or anyone who wants to redesign a natural lash-line enhancer.',
          zh: '适合旧眼线颜色过深、变色、晕色、形态不满意，或希望重新设计自然美瞳线的人群。',
        },
        poster: '/images/treatments/shared/eyeliner-removal-poster.jpg',
      },
    ],
  },
  {
    slug: 'skincare-experts',
    group: 'skincare',
    icon: 'Sparkles',
    name: { en: 'Skincare Experts', zh: '护肤项目' },
    short: { en: 'Professional facials, gentle hand sculpting and targeted skin care.', zh: '专业面部护理、徒手轮廓与针对性肌肤护理。' },
    intro: {
      en: 'Hands-on facial care from our skincare specialists — cleansing, hydration, repair and contouring tailored to your skin.',
      zh: '护肤专家亲手呵护——清洁、补水、修复与轮廓管理，依肤质量身定制。',
    },
    promo: {
      zh: '初次体验即可享受会员价',
      en: 'First-time guests enjoy member pricing',
    },
    treatments: [
      {
      id: "japanese-face-correction",
      artist: {
        name: 'Rina',
        role: { en: 'Senior Aesthetician', zh: '资深美容师' },
        bio: {
          en: [
            'Rina comes from Japan and has more than 10 years of professional face-contouring experience in Japan. She brings the quality of an authentic Japanese service straight to our treatment room.',
            'Guided by a craftsman’s spirit, she works only with her hands — carefully reading each client’s facial structure, muscle tension and lymphatic flow, and adjusting her pressure and rhythm to match, so every session feels gentle, precise and deeply relaxing.',
            'From the first consultation to the last stroke, she pays attention to every detail with patience and care, aiming for results that look natural and lasting rather than dramatic.',
          ],
          zh: [
            'Rina 来自日本，在日本拥有 10 年以上的专业小颜矫正经验，将地道的日式服务品质带到我们的护理室。',
            '秉持日本匠人精神，她仅以双手施术，细致观察每位顾客的面部结构、肌肉紧绷程度与淋巴流向，并据此调整力度与节奏，让每一次护理都温和、精准、深度放松。',
            '从初次沟通到最后一个手法，她都以耐心与专注对待每个细节，追求自然、持久的改善，而不是夸张的变化。',
          ],
        },
        tags: {
          en: ['From Japan', '10+ years of face-contouring experience', 'Japanese-style service', 'Craftsman’s spirit'],
          zh: ['来自日本', '10 年以上小颜矫正经验', '日式服务', '专业匠人精神'],
        },
      },
      name: {
        en: "Japanese Hand-Sculpted Face Slimming",
        zh: "日式小颜徒手矫正"
      },
      short: {
        en: "Hands-on lymphatic drainage and contour sculpting.",
        zh: "徒手淋巴引流与轮廓塑形。"
      },
      poster: "/images/treatments/shared/japanese-face-poster.jpg",
      smallBody: true,
      body: {
        en: "Japanese hand-sculpted face slimming using only the hands — it promotes lymphatic drainage, releases the fascia and balances the left and right sides of the face, for a more lifted, symmetrical, de-puffed look.",
        zh: "日式徒手小颜矫正，仅以双手促进淋巴排毒、放松筋膜、平衡左右脸筋骨，让脸部更显提拉、对称、不浮肿。"
      },
      bullets: {
        en: [
          "Promotes lymphatic drainage and circulation",
          "Improves uneven face size and left–right asymmetry",
          "Reduces facial laxity and water retention",
          "Refines contours and brightens skin tone"
        ],
        zh: [
          "促进淋巴排毒、改善气血",
          "改善大小脸、左右不对称",
          "改善面部松弛、祛除水肿",
          "改善脸部轮廓、焕亮肤色"
        ]
      },
      packages: [
        {
          name: {
            en: "Japanese Face Slimming · Foundation Sculpting · 60 min",
            zh: "日式小颜·基础矫正 60 分钟"
          },
          price: "$158",
          was: "$188",
          tag: {
            en: "First-visit offer",
            zh: "初次体验"
          },
          perks: {
            en: [
              "Brightens skin tone",
              "Reduces puffiness",
              "Whitening and hydration"
            ],
            zh: [
              "提亮肤色",
              "去除浮肿",
              "美白补水"
            ]
          },
          steps: {
            en: [
              "Gentle cleanse",
              "Shoulder, neck and collarbone lymphatic drainage",
              "Facial acupoint opening to activate circulation",
              "Japanese hand-sculpted face slimming",
              "Hydrating mask",
              "Skincare finish"
            ],
            zh: [
              "温和清洁",
              "肩颈锁骨淋巴排毒",
              "面部开穴激活循环",
              "日式小颜徒手矫正",
              "保湿补水面膜",
              "护肤收尾"
            ]
          },
          suited: {
            en: "Suited to puffiness, an undefined contour, mild facial laxity, and anyone who wants regular maintenance.",
            zh: "适合浮肿、轮廓不清晰、面部轻度松弛、想做日常维护的人群。"
          }
        },
        {
          name: {
            en: "Japanese Face Slimming · Deep Renewal Sculpting · 90 min",
            zh: "日式小颜·深层焕颜90 分钟"
          },
          price: "$198",
          was: "$248",
          tag: {
            en: "First-visit offer",
            zh: "初次体验"
          },
          perks: {
            en: [
              "Lymphatic drainage",
              "Firming and lifting",
              "Softens nasolabial lines"
            ],
            zh: [
              "淋巴排毒",
              "紧致提升",
              "改善法令纹"
            ]
          },
          steps: {
            en: [
              "Gentle cleanse",
              "Deep lymphatic drainage of the shoulders, neck, collarbone, underarms and arms",
              "Facial acupoint opening to boost circulation",
              "Hand-sculpted face slimming | contour sculpting, lifting and firming",
              "Plaster mask | sets and firms, soothes and repairs",
              "Nourishing neck mask | prevents dryness and lines",
              "Scalp relaxation | eases tension",
              "Skincare finish"
            ],
            zh: [
              "温和清洁",
              "肩颈锁骨腋下双臂淋巴深度疏通",
              "面部开穴促进循环",
              "小颜徒手矫正｜轮廓塑形・提升紧致",
              "石膏面膜｜定型紧致・镇静修护",
              "颈膜滋护｜防干生纹",
              "头部放松｜舒缓紧张",
              "护肤收尾"
            ]
          },
          suited: {
            en: "Suited to facial laxity, a sagging contour, asymmetry, a tense jaw (masseter), tight shoulders and neck, and anyone who needs deeper care.",
            zh: "适合面部松弛、轮廓下垂、左右不对称、咬肌紧张、肩颈紧绷及需要深度护理的人群。"
          }
        }
      ],
    },
      {
        id: "skinceuticals-cleanse-hydrate",
        smallBody: true,
        poster: '/images/treatments/shared/skinceuticals-hydrate-repair-poster.jpg',
        name: {
          en: "SkinCeuticals Hydrating & Repair Facial",
          zh: "修丽可水润修复护理"
        },
        short: {
          en: "Deep cleansing, hydration and barrier repair with medical-grade skincare.",
          zh: "医学级护肤品深层清洁、补水与屏障修复。"
        },
        body: {
          en: "Professional salon-grade SkinCeuticals care, tailored to your skin. Cleansing and gentle exfoliation clear dead skin cells and pores, hydrating actives follow, and nourishing, repairing products help strengthen the barrier — leaving skin smoother, brighter, hydrated and comfortable.",
          zh: "使用修丽可院线专业产品护理，依肤质量身定制。清洁与温和去角质清除老废角质、疏通毛孔，再导入补水活性成分，并以滋养修复产品强化屏障，让肌肤更平滑、透亮、水润舒适。"
        },
        bullets: {
          en: [
            "Removes dead skin cells and cleans pores",
            "Relieves dryness and dehydration",
            "Helps strengthen the skin barrier",
            "Soothes tightness and redness",
            "Smoother texture and brighter complexion",
            "Seasonal-change and post-procedure hydration"
          ],
          zh: [
            "去除老废角质、清洁毛孔",
            "改善干燥与缺水",
            "帮助强化肌肤屏障",
            "舒缓紧绷与泛红",
            "肤质更平滑、肤色更透亮",
            "换季术后补水"
          ]
        },
        packages: [
          {
            name: { en: "SkinCeuticals Cleansing & Hydration · 60 min", zh: "修丽可清洁补水 60 分钟" },
            price: "$158",
            was: "$188",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Deep cleansing", "Pore extraction", "Tone-correcting mask", "Hydration infusion"],
              zh: ["深层清洁", "针清", "色修提亮", "补水导入"]
            },
            steps: {
              en: [
                "Makeup removal and cleanse",
                "SkinCeuticals glycolic clay mask + pore extraction",
                "SkinCeuticals tone-correcting mask + LED light therapy",
                "Water-infusion (waterfall) hydration + SkinCeuticals serum infusion",
                "Moisturizer and sunscreen"
              ],
              zh: [
                "卸妆、洗脸",
                "修丽可果酸泥膜 + 针清",
                "修丽可色修面膜 + 大排灯照光",
                "大瀑布灌注 + 修丽可精华导入",
                "面霜、防晒涂抹"
              ]
            }
          },
          {
            name: { en: "SkinCeuticals Nourishing & Repair · 90 min", zh: "修丽可滋润修复 90 分钟" },
            price: "$198",
            was: "$248",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Deep cleansing", "RF firming & lifting", "Microcurrent collagen stimulation", "Nourishing repair"],
              zh: ["深层清洁", "RF 紧致提拉", "微电流胶原刺激", "修复滋养"]
            },
            steps: {
              en: [
                "Makeup removal and cleanse",
                "SkinCeuticals glycolic clay mask + pore extraction",
                "SkinCeuticals tone-correcting mask + LED light therapy",
                "Water-infusion (waterfall) hydration + RF firming and lifting + full-face microcurrent collagen stimulation",
                "SkinCeuticals serum infusion",
                "Repairing soft mask + nourishing neck mask",
                "Moisturizer and sunscreen"
              ],
              zh: [
                "卸妆、洗脸",
                "修丽可果酸泥膜 + 针清",
                "修丽可色修面膜+大排灯照光",
                "大瀑布灌注 + RF 紧致提拉 + 微电流全脸胶原刺激",
                "修丽可精华导入",
                "修复滋养软膜 + 滋润颈膜",
                "面霜、防晒涂抹"
              ]
            }
          }
        ],
      },
      {
        id: "rejuran-brightening",
        smallBody: true,
        poster: '/images/treatments/shared/rejuran-care-poster.jpg',
        name: {
          en: "Swiss Rejuran Firming & Revitalizing Care",
          zh: "瑞士瑞妍生机弹绷护理"
        },
        short: {
          en: "Brightening, hydrating and firming care for a dewy, lifted look.",
          zh: "提亮补水与紧致提拉，肌肤水润、轮廓清晰。"
        },
        body: {
          en: "Professional-grade treatment from a Swiss luxury brand: after deep cleansing, brightening, hydrating and firming actives are infused and combined with lifting, contouring massage — evening out dull tone, replenishing moisture, and leaving the lower face more defined and the skin springier and firmer.",
          zh: "来自瑞士贵奢品牌院线护理：深层清洁后导入提亮、补水与紧致活性成分，并结合提拉塑形按摩，改善暗沉肤色、补充水分，让下半脸线条更清晰，肌肤更有弹性、更紧实饱满。"
        },
        bullets: {
          en: [
            "More even, radiant-looking tone",
            "Deep hydration and a dewy finish",
            "Firmer, more elastic-feeling skin",
            "More defined V-shaped contour",
            "Reduced puffiness",
            "Cell revitalization and renewal"
          ],
          zh: [
            "肤色更均匀透亮",
            "深层补水、水润光泽",
            "肌肤更紧实有弹性",
            "V 脸轮廓更清晰",
            "减轻浮肿",
            "细胞活化再生"
          ]
        },
        packages: [
          {
            name: { en: "Rejuran Brightening & Hydration · 60 min", zh: "瑞妍亮白水润 60 分钟" },
            price: "$158",
            was: "$188",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Brighter, even tone", "Deep hydration", "Softer texture", "No downtime"],
              zh: ["提亮肤色", "深层补水", "肤质细腻", "无恢复期"]
            },
            steps: {
              en: [
                "Deep cleanse and gentle exfoliation",
                "Infusion of revitalizing essence water",
                "Rejuran-technique neck, shoulder and facial massage",
                "Brightening and hydrating mask",
                "Moisturizer and sun protection"
              ],
              zh: [
                "深层清洁与温和去角质",
                "导入提亮生机精华水",
                "瑞妍手法肩颈面部按摩",
                "亮白水润面膜",
                "保湿与防晒"
              ]
            }
          },
          {
            name: { en: "Rejuran V-Face Firming · 90 min", zh: "瑞妍V脸生机弹绷 90 分钟" },
            price: "$198",
            was: "$248",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Firmer, springier skin", "Defined V-shaped contour", "Reduced puffiness", "Fresher look right away"],
              zh: ["紧实弹性", "V 脸轮廓", "减轻浮肿", "护理后更显精神"]
            },
            steps: {
              en: [
                "Deep cleanse and gentle exfoliation",
                "Infusion of revitalizing essence water",
                "Rejuran-technique lifting and contouring massage",
                "Brightening and hydrating mask",
                "Red-carpet skin-renewal mask",
                "Anti-aging nourishing neck mask",
                "Moisturizer and sun protection"
              ],
              zh: [
                "深层清洁与温和去角质",
                "导入提亮生机精华水",
                "瑞妍手法提拉塑形按摩",
                "亮白水润面膜",
                "红毯换肤面膜",
                "抗衰滋润颈膜",
                "保湿与防晒"
              ]
            }
          }
        ],
      },
      {
        id: "gua-sha",
        smallBody: true,
        poster: '/images/treatments/shared/gua-sha-poster.jpg',
        name: {
          en: "Traditional Chinese Gua Sha Facial",
          zh: "中式古法面部刮痧"
        },
        short: {
          en: "Traditional gua sha to boost glow and ease tension.",
          zh: "古法刮痧，提亮气色、舒缓紧绷。"
        },
        body: {
          en: "Gua sha is a traditional Chinese technique that glides a smooth-edged tool across oiled skin to encourage blood flow and lymphatic drainage. Facial gua sha uses light pressure to reduce puffiness, relax tense muscles and bring out a healthy glow.",
          zh: "刮痧是传统中式技法，以光滑边缘的刮板在涂抹精油的肌肤上滑动，促进血液循环与淋巴引流。面部刮痧力度轻柔，可减轻浮肿、放松紧绷肌肉并提亮气色。"
        },
        bullets: {
          en: [
            "Reduces puffiness, especially around eyes and cheeks",
            "Eases muscle tension and stress",
            "Improves circulation for a natural glow",
            "Helps products absorb"
          ],
          zh: [
            "减轻浮肿，尤其眼周与面颊",
            "缓解肌肉紧张与压力",
            "促进循环、气色红润",
            "帮助护肤品吸收"
          ]
        },
        packages: [
          {
            name: { en: "Traditional Jade Glow · Meridian Revival · 60 min", zh: "古法玉颜·经络焕活 60 分钟" },
            price: "$158",
            was: "$188",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Unblock", "Reduce puffiness", "Brighten", "Contour care"],
              zh: ["疏通", "消肿", "提亮", "轮廓管理"]
            },
            steps: {
              en: [
                "Makeup removal and cleanse",
                "Warm steam to awaken the skin",
                "Facial meridian massage",
                "Traditional gua sha (forehead, eye area, cheeks, jawline)",
                "Soothing repair mask",
                "Scalp relaxation",
                "Skincare finish"
              ],
              zh: [
                "卸妆洁面",
                "热喷醒肤",
                "面部经络手法疏通",
                "古法刮痧（额头/眼周/面颊/下颌线）",
                "舒缓修护面膜",
                "头部放松",
                "护肤收尾"
              ]
            }
          },
          {
            name: { en: "Traditional Jade Glow · Face & Neck Deep Revival · 90 min", zh: "古法玉颜·面颈焕活 90 分钟" },
            price: "$198",
            was: "$248",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Deep unblocking", "Face-and-neck synergy", "Lifting and sculpting", "Deep relaxation"],
              zh: ["深层疏通", "面颈联动", "提拉塑颜", "深度放松"]
            },
            steps: {
              en: [
                "Makeup removal and cleanse",
                "Warm steam to awaken the skin",
                "Shoulder and neck meridian massage",
                "Deep facial meridian massage",
                "Traditional jade-stone gua sha",
                "Lymphatic drainage around the ears and neck",
                "Neck gua sha",
                "Repair mask",
                "Shoulder and scalp relaxation during the mask",
                "Serum and cream finish"
              ],
              zh: [
                "卸妆洁面",
                "热喷醒肤",
                "肩颈经络疏通",
                "面部深层经络按摩",
                "古法玉石刮痧",
                "耳周/颈部淋巴引流",
                "颈部刮痧",
                "修护面膜",
                "面膜期间肩颈/头部放松",
                "精华面霜收尾"
              ]
            }
          }
        ],
      },
      {
        id: "acne-clearing",
        smallBody: true,
        poster: '/images/treatments/shared/acne-clearing-poster.jpg',
        name: {
          en: "Professional Acne-Clearing Facial",
          zh: "Nouvelle专业祛痘针清"
        },
        short: {
          en: "Deep cleansing and safe manual extraction for congested skin.",
          zh: "深层清洁与安全针清，改善毛孔堵塞。"
        },
        body: {
          en: "A professional deep-cleansing treatment for blackheads, whiteheads and congested pores. After steaming and exfoliation, a trained therapist performs careful manual extraction, then calms and protects the skin to support healing.",
          zh: "针对黑头、白头与毛孔堵塞的专业深层清洁。经蒸面与去角质后，由受训美容师进行细致的手工针清，再舒缓并保护肌肤，帮助修复。"
        },
        bullets: {
          en: [
            "Clears blackheads, whiteheads and clogged pores",
            "Reduces oil build-up and redness",
            "Helps prevent new breakouts",
            "Lets skincare absorb better"
          ],
          zh: [
            "清除黑头、白头与堵塞毛孔",
            "减少油脂堆积与泛红",
            "帮助预防新的痘痘",
            "让护肤品更易吸收"
          ]
        },
        packages: [
          {
            name: { en: "Nouvelle Clear-Skin Acne Care · 60 min", zh: "Nouvelle 净痘清肌 60 分钟" },
            price: "$158",
            was: "$188",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Professional extraction", "Purified pores", "Calms inflammation", "Skin repair"],
              zh: ["专业针清", "净化毛孔", "消炎镇静", "修护肌肤"]
            },
            steps: {
              en: [
                "Gentle cleanse",
                "Soften dead skin / open the pores",
                "Professional extraction",
                "Calm inflammation",
                "Repair mask",
                "LED light repair",
                "Skincare finish"
              ],
              zh: [
                "温和清洁",
                "软化角质 / 打开毛孔",
                "专业针清",
                "消炎镇静",
                "修护面膜",
                "LED 照光修复",
                "护肤收尾"
              ]
            },
            suited: {
              en: "Suited to blackheads, whiteheads, closed comedones, clogged pores, occasional breakouts and oily skin.",
              zh: "适合黑头、白头、闭口、毛孔堵塞、偶发痘痘及油脂分泌旺盛肌肤。"
            }
          },
          {
            name: { en: "Nouvelle Deep Acne-Clearing & Renewal · 90 min", zh: "Nouvelle深层净痘焕肤 90 分钟" },
            price: "$198",
            was: "$248",
            tag: { en: "First-visit offer", zh: "初次体验" },
            perks: {
              en: ["Deep cleansing", "Professional extraction", "Acne-prone skin care", "Soothing repair"],
              zh: ["深层清洁", "专业针清", "痘肌管理", "舒缓修护"]
            },
            steps: {
              en: [
                "Gentle cleanse",
                "Deep cleanse / soften dead skin",
                "Facial steam to open the pores",
                "Detailed professional extraction",
                "Targeted blemish care",
                "Calm inflammation",
                "Repair mask",
                "LED light repair",
                "Repair serum infusion",
                "Skincare finish"
              ],
              zh: [
                "温和清洁",
                "深层清洁 / 软化角质",
                "蒸脸打开毛孔",
                "专业精细针清",
                "痘痘重点护理",
                "消炎镇静",
                "修护面膜",
                "LED 照光修复",
                "修护精华导入",
                "护肤收尾"
              ]
            },
            suited: {
              en: "Suited to recurring breakouts, plenty of closed comedones, noticeable blackheads, badly clogged pores, very oily skin, and anyone who needs extraction over a larger area.",
              zh: "适合反复长痘、闭口粉刺较多、黑头明显、毛孔堵塞严重、出油旺盛，以及需要进行较大面积针清的人群。"
            }
          }
        ],
      }
    ],
  },
  {
    slug: 'lash',
    group: 'lash',
    icon: 'Eye',
    name: { en: 'Eyelash Extensions', zh: '美睫' },
    short: { en: 'Classic and popular special-style lashes with regular fills.', zh: '经典与人气特色款式睫毛嫁接，定期补睫。' },
    intro: {
      en: 'Wake up with fuller, more defined eyes. Choose a natural classic set or a popular special style — all designed around your eye shape.',
      zh: '拥有更浓密、更有神的双眼。无论是自然经典款还是人气特色款式，都依您的眼型量身设计。',
    },
    promo: {
      zh: '初次体验即可享受会员价',
      en: 'First-time guests enjoy member pricing',
    },
    artist: {
      name: '大鱼',
      role: { en: 'Senior Lash Artist', zh: '资深美睫师' },
      image: '/images/treatments/shared/lash-artist-portrait.jpg',
      bio: {
        en: [
          'With 8+ years of professional lash experience and 10,000+ clients served, Da Yu has earned lasting trust and praise through steady, meticulous technique and patient, gentle service.',
          'She designs one-on-one around each client’s face shape, eye shape, natural lash condition and personal style — never chasing a fixed look, but finding the lash style that truly suits you.',
          'She cares about every detail, from the first conversation and style design to the application itself, with patience, care and a smile throughout — so lashes are not just a beauty upgrade, but a comfortable, relaxing experience.',
        ],
        zh: [
          '拥有 8+ 年专业美睫经验，累计服务 10,000+ 位顾客，凭借稳定细腻的技术与耐心温柔的服务，收获众多顾客长期信赖与好评。',
          '擅长根据每位顾客的脸型、眼型、睫毛条件及个人气质进行一对一定制设计，不盲目追求固定款式，而是找到真正适合你的睫毛风格。',
          '注重每一个细节，从前期沟通、款式设计到嫁接体验，以耐心、细致、微笑贯穿整个服务过程，让美睫不仅是一次变美，更是一段舒适放松的体验。',
        ],
      },
      tags: {
        en: ['8+ years’ experience', '10,000+ clients served', 'One-on-one custom design', 'Highly rated'],
        zh: ['8+ 年经验', '10,000+ 顾客服务经验', '一对一定制设计', '高顾客好评率'],
      },
    },
    priceList: {
      title: { zh: '美睫价目表', en: 'Lash Price List' },
      cols: { name: { zh: '项目名称', en: 'Style' }, single: { zh: '单次价', en: 'Single visit' }, member: { zh: '会员价', en: 'Member' } },
      groups: [
      {
        name: { zh: '自然简约', en: 'Natural Style' },
        rows: [
          { name: { zh: '单根扁毛', en: 'Flat Single Lash' }, desc: { zh: '扁平质地的单根嫁接，轻盈贴合，自然清爽，素颜感十足。', en: 'One flat lash per natural lash — light, sleek and effortlessly natural.' }, single: 118, member: 98 },
          { name: { zh: 'YY睫毛', en: 'YY Lashes' }, desc: { zh: 'Y 形双头设计，一次嫁接两根效果，蓬松自然、不显厚重。', en: 'A Y-shaped double-tip lash that gives a fuller, fluffy look without heaviness.' }, single: 118, member: 98 },
          { name: { zh: '三叶草', en: 'Clover' }, desc: { zh: '三叶造型的花型设计，层次分明，自然中带一点丰盈。', en: 'A three-leaf fan design with defined layers — natural with a touch of fullness.' }, single: 118, member: 98 },
        ],
      },
      {
        name: { zh: '特色款式', en: 'Special Style' },
        rows: [
          { name: { zh: '妈生太阳花', en: 'Natural Sunflower' }, desc: { zh: '放射状排列，如天生般自然卷翘，打造“妈生”睫毛感。', en: 'Radiating, natural-looking curl for a born-with-it lash look.' }, single: 128, member: 108 },
          { name: { zh: '仙女C+婴儿弯', en: 'Fairy C + Baby Curl' }, desc: { zh: 'C 形卷度搭配柔和婴儿弯，眼神清澈温柔，仙气十足。', en: 'A soft C curl with a gentle baby curve for a clear, sweet, ethereal gaze.' }, single: 128, member: 108 },
          { name: { zh: '盐系鱼尾柳叶', en: 'Salt-Style Fishtail Willow' }, desc: { zh: '眼尾拉长呈鱼尾与柳叶线条，清冷高级的盐系风格。', en: 'Extended outer corners shaped like a fishtail and willow leaf — a cool, refined “salt-style” look.' }, single: 138, member: 118 },
          { name: { zh: '泰式猫系', en: 'Thai Cat-Eye' }, desc: { zh: '眼尾上扬的猫眼线条，眼神灵动，带一点魅惑感。', en: 'Upswept cat-eye lines for a lively, slightly alluring look.' }, single: 138, member: 118 },
          { name: { zh: '欧美浓密', en: 'Western Volume' }, desc: { zh: '浓密卷翘、存在感强，带来立体深邃的欧美眼妆效果。', en: 'Dense, curled and dramatic for a deep, defined Western-style eye.' }, single: 138, member: 118 },
          { name: { zh: '国风狐系', en: 'Oriental Fox' }, desc: { zh: '眼尾微微拉长上挑，东方韵味的狐系眼型。', en: 'Slightly elongated, lifted outer corners for an Eastern fox-eye shape.' }, single: 138, member: 118 },
          { name: { zh: '日式漫画系', en: 'Japanese Manga' }, desc: { zh: '根根分明的漫画感睫毛，放大双眼，洋娃娃般的灵动效果。', en: 'Defined, doll-like manga lashes that enlarge the eyes.' }, single: 138, member: 118 },
        ],
      },
      {
        name: { zh: '其他项目', en: 'Other Options' },
        rows: [
          { name: { zh: '下睫毛', en: 'Lower Lashes' }, desc: { zh: '为下眼睑增加睫毛，使眼部轮廓更完整立体。', en: 'Adds lower lashes for a more complete, defined eye.' }, single: 38, member: 28 },
          { name: { zh: '补睫毛（2-3周内）', en: 'Fill (within 2–3 weeks)' }, desc: { zh: '适用于 2-3 周内的补睫，保持睫毛饱满整齐。', en: 'For fills within 2–3 weeks, keeping lashes full and tidy.' }, single: 78, member: 68 },
        ],
      },
      ],
      notes: [
        { zh: '最终解释权归本店所有', en: 'The clinic reserves the right of final interpretation.' },
        { zh: '敏感/有炎症/有眼部疾病/孕妇/哺乳期/近期纹美瞳线请提前告知', en: 'Please tell us in advance if you have sensitive skin, inflammation or an eye condition, are pregnant or breastfeeding, or have recently had lash-line tattooing.' },
      ],
    },
    treatments: [
      {
        id: "classic-lashes",
        layout: 'detail',
        posters: ['/images/treatments/shared/classic-lashes-poster.jpg', '/images/treatments/shared/lash-yy.jpg', '/images/treatments/shared/lash-clover.jpg'],
        name: {
          en: "Classic Lashes",
          zh: "经典单根睫毛嫁接"
        },
        short: {
          en: "One extension per natural lash — subtle and natural.",
          zh: "一根嫁接对一根自然睫毛，自然清新。"
        },
        body: {
          en: "The classic technique of one extension per natural lash, with length, curl and layout customised to your eye shape and natural lashes — for clearly defined, natural, airy lashes.",
          zh: "采用一根真睫毛嫁接一根假睫毛的经典手法，根据眼型与原生睫毛条件定制长度、卷翘度与排列，打造根根分明、自然清透的睫毛效果。"
        },
        bullets: {
          en: [
            "Individually defined, natural and light",
            "Opens up the eyes without heaviness",
            "Designed around your eye shape",
            "Keeps the feel of your natural lashes",
            "Natural bare-faced, versatile every day"
          ],
          zh: [
            "根根分明，自然轻盈",
            "放大双眼，不显厚重",
            "根据眼型定制设计",
            "保留原生睫毛质感",
            "素颜自然，日常百搭"
          ]
        },
        suited: {
          en: "Suited to anyone who loves a natural, fresh, refined look, or who is trying lash extensions for the first time.",
          zh: "适合喜欢自然裸妆感、清透精致感，或初次尝试睫毛嫁接的人群。"
        }
      },
      {
        id: "hybrid-lashes",
        posters: ['/images/treatments/shared/lash-sunflower.jpg', '/images/treatments/shared/lash-fairy-c.jpg', '/images/treatments/shared/lash-fishtail-willow.jpg', '/images/treatments/shared/lash-thai-cat.jpg', '/images/treatments/shared/lash-western-volume.jpg', '/images/treatments/shared/lash-fox.jpg', '/images/treatments/shared/lash-manga.jpg'],
        name: {
          en: "Popular Special-Style Lashes",
          zh: "人气特色款式嫁接"
        },
        short: {
          en: "A mix of classic and volume fans for textured fullness.",
          zh: "经典与浓密花型混合，层次丰盈。"
        },
        body: {
          en: "A blend of classic extensions and handmade volume fans, creating a textured, wispy look with more fullness than classic and less drama than full volume.",
          zh: "结合经典单根与手工浓密花型，营造有层次感、轻盈丰盈的效果，比经典更浓密，又比全浓密更自然。"
        },
        bullets: {
          en: [
            "Textured, balanced fullness",
            "More depth than classic",
            "Natural yet eye-catching",
            "Customizable"
          ],
          zh: [
            "层次均衡的丰盈感",
            "比经典款更有深度",
            "自然又吸睛",
            "可个性化定制"
          ]
        },
        steps: {
          en: [
            "Consultation and lash mapping",
            "Eyes cleansed and prepared",
            "Classic and volume fans alternated across the lash line",
            "Final check and aftercare guidance"
          ],
          zh: [
            "咨询与睫毛设计",
            "清洁并准备眼周",
            "沿睫毛线交替嫁接经典与花型",
            "最终检查与护理指导"
          ]
        },
        facts: [
          {
            label: {
              en: "Look",
              zh: "效果"
            },
            value: {
              en: "About 2–3× fuller",
              zh: "约 2–3 倍浓密度"
            }
          },
          {
            label: {
              en: "Wear time",
              zh: "维持时间"
            },
            value: {
              en: "Typically 4–6 weeks with fills",
              zh: "搭配补睫，通常 4–6 周"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "A fuller look that still feels natural",
              zh: "想要更丰盈但仍自然"
            }
          }
        ]
      },
      {
        id: "lash-fills",
        layout: 'detail',
        posters: ['/images/treatments/shared/lower-lashes-poster.jpg', '/images/treatments/shared/lash-refresh-poster.jpg'],
        name: {
          en: "Lower Lashes & Lash Fills",
          zh: "下睫毛与补睫毛"
        },
        short: {
          en: "Keep your lashes full with regular fills.",
          zh: "定期补睫，保持睫毛丰盈。"
        },
        body: {
          en: "Extensions shed along with your natural lash cycle, so regular fills keep the look full and neat. Proper aftercare helps your set last longer and protects your natural lashes.",
          zh: "嫁接睫毛会随自然睫毛周期脱落，定期补睫可保持丰盈整齐。正确的护理能延长维持时间并保护自然睫毛。"
        },
        bullets: {
          en: [
            "Fills about every 2–3 weeks",
            "Keeps the set full and tidy",
            "Extends the life of your lashes"
          ],
          zh: [
            "约每 2–3 周补睫一次",
            "保持睫毛丰盈整齐",
            "延长睫毛维持时间"
          ]
        }
      },
      {
        id: "lash-aftercare",
        bodyBesideImage: true,
        poster: '/images/treatments/shared/lash-aftercare-poster.jpg',
        hideIndex: true,
        factsBelow: true,
        name: {
          en: "Lash Aftercare",
          zh: "睫毛护理"
        },
        short: {
          en: "Aftercare steps, fill schedule and good-to-know tips.",
          zh: "护理流程、补睫频率与温馨提示。"
        },
        body: {
          en: "Beautiful lashes deserve good aftercare — that is what keeps the polished look lasting longer.",
          zh: "睫毛嫁接得漂亮，也要护理得好，才能让精致感维持更久。"
        },
        stepsTitle: { en: "Aftercare notes", zh: "护理注意事项" },
        steps: {
          en: [
            "For 4–6 hours after your appointment, avoid rubbing, saunas and prolonged high heat",
            "Remove makeup gently every day and never pull on the lashes",
            "Use less oil-based makeup remover",
            "Brush the lashes gently with a spoolie every day",
            "Book fills every 2–3 weeks"
          ],
          zh: [
            "护理后建议 4–6 小时内避免揉搓、蒸桑拿及长时间高温环境",
            "日常卸妆时动作轻柔，避免拉扯睫毛",
            "建议减少使用油性卸妆产品",
            "每天使用睫毛梳轻柔整理",
            "每 2–3 周预约补睫"
          ]
        },
        outro: {
          en: [
            "Beautiful lashes are not only about a good set — they need to be cared for and kept well.",
            "Nouvelle Anti-aging",
            "Professional lashes | Detailed care | Designed around your eye shape"
          ],
          zh: [
            "精致的睫毛，不只是“接得好”，更要养得好、护得好。",
            "Nouvelle Anti-aging",
            "专业美睫｜精细护理｜定制你的眼型美学"
          ]
        },
        facts: [
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "If the eye area is red, swollen, inflamed, infected, allergic or otherwise unwell, please postpone treatment. If you have recently had eye surgery or treatment, please tell our team in advance.",
              zh: "如眼周正处于红肿、发炎、感染、过敏或其他异常状态，建议暂缓护理；近期进行眼部手术或治疗者，请提前告知专业人员。"
            }
          }
        ]
      }
    ],
  },
  {
    slug: 'spa-care',
    group: 'spa',
    icon: 'Flower2',
    name: { en: 'Body & Head Spa', zh: '身体 · 头皮 Spa' },
    short: { en: 'Full-body renewal and Japanese-style scalp care.', zh: '全身焕新与日式头皮护理。' },
    intro: {
      en: 'Unwind and renew. Our spa treatments pair skin-smoothing care with deep relaxation — from head to toe.',
      zh: '放松与焕新。我们的 Spa 结合肌肤保养与深度放松，从头到脚全面呵护。',
    },
    treatments: [
      {
        id: "body-spa",
        name: {
          en: "Body Spa",
          zh: "身体 Spa"
        },
        short: {
          en: "Exfoliating scrubs, hydrating wraps and relaxing massage.",
          zh: "去角质、补水包裹与舒压按摩。"
        },
        body: {
          en: "A full-body renewal ritual that exfoliates, hydrates and relaxes. Dead skin cells are gently buffed away, nourishing products are applied, and skin is left smooth, soft and glowing — while stress melts away.",
          zh: "全身焕新的放松仪式：温和去除老废角质，涂抹滋养产品，让肌肤平滑柔软、焕发光泽，同时释放压力。"
        },
        bullets: {
          en: [
            "Smoother, softer skin",
            "Improved circulation and lymphatic flow",
            "Deep hydration and nourishment",
            "Stress relief and relaxation"
          ],
          zh: [
            "肌肤更平滑柔软",
            "促进循环与淋巴流动",
            "深层补水与滋养",
            "舒压放松"
          ]
        },
        steps: {
          en: [
            "Consultation to choose the right scrub and products for your skin",
            "Gentle full-body exfoliation with a natural scrub",
            "Rinse, then nourishing mask or wrap to hydrate (optional)",
            "Relaxing massage with oils or lotion"
          ],
          zh: [
            "咨询并依肤质选择合适的磨砂与产品",
            "以天然磨砂温和全身去角质",
            "冲洗后涂抹滋养面膜或包裹补水（可选）",
            "精油或乳液舒缓按摩"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "Varies by package — ask when booking",
              zh: "视套餐而定，预约时可咨询"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Dull, dry or rough skin; stress relief; pre-event glow",
              zh: "暗沉、干燥或粗糙肌肤；舒压；重要场合前"
            }
          },
          {
            label: {
              en: "Aftercare",
              zh: "护理建议"
            },
            value: {
              en: "Drink plenty of water and moisturize afterward.",
              zh: "多喝水并做好保湿。"
            }
          }
        ]
      },
      {
        id: "head-spa",
        name: {
          en: "Head Spa",
          zh: "头皮 Spa"
        },
        short: {
          en: "Japanese-style scalp cleansing, massage and nourishment.",
          zh: "日式头皮深层清洁、按摩与滋养。"
        },
        body: {
          en: "Inspired by Japanese head spa rituals, this treatment deeply cleanses and exfoliates the scalp, then melts away tension with a long, relaxing massage. A healthier scalp supports healthier-looking hair.",
          zh: "灵感源自日式头皮 Spa：深层清洁并去角质，再以舒缓的头皮按摩释放紧张。健康的头皮有助于头发更显健康。"
        },
        bullets: {
          en: [
            "Removes build-up, excess oil and dead skin",
            "Boosts scalp circulation",
            "Deep relaxation and stress relief",
            "Leaves hair feeling light and fresh"
          ],
          zh: [
            "清除污垢、多余油脂与老废角质",
            "促进头皮循环",
            "深度放松、舒缓压力",
            "头发轻盈清爽"
          ]
        },
        steps: {
          en: [
            "Consultation and scalp assessment",
            "Deep cleansing of the scalp",
            "Exfoliation with a gentle scrub or mask",
            "Steam and scalp massage to boost circulation",
            "Nourishing treatment and rinse"
          ],
          zh: [
            "咨询并评估头皮状况",
            "头皮深层清洁",
            "温和磨砂或面膜去角质",
            "蒸汽与头皮按摩，促进循环",
            "滋养护理并冲洗"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "Varies by package — ask when booking",
              zh: "视套餐而定，预约时可咨询"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Oily, itchy or flaky scalp; tension and stress; thinning-looking hair",
              zh: "出油、发痒或脱屑的头皮；紧张压力；发量稀疏观感"
            }
          },
          {
            label: {
              en: "Pairs well with",
              zh: "搭配推荐"
            },
            value: {
              en: "PRP or HydraFacial Keravive in our hair rejuvenation menu.",
              zh: "可搭配医美项目中的 PRP 或 HydraFacial Keravive。"
            }
          }
        ]
      }
    ],
  },
]

// Keys come from the ORIGINAL category slug + position (or an explicit id) so photos, FAQ
// anchors and consult links stay stable even though treatments are regrouped below.
baseCategories.forEach((c) => c.treatments.forEach((x, i) => { x.key = x.id || `${c.slug}-${i + 1}` }))
const byKey = Object.fromEntries(baseCategories.flatMap((c) => c.treatments.map((x) => [x.key, x])))
const pick = (...keys) => keys.map((k) => byKey[k])
const keepBase = (slug, extra = {}) => ({ ...baseCategories.find((c) => c.slug === slug), ...extra })

// Added to the Injectables category (see below).
const collagenStimulator = {
  id: 'collagen-stimulator',
  key: 'collagen-stimulator',
  name: { en: 'Collagen-Stimulating Injection (PLLA)', zh: '童颜针' },
  image: '/images/treatments/zh/collagen-stimulator.jpg', // replaced by the zh/en pair in TREATMENT_PHOTOS
  subtitle: { en: '', zh: 'SCULPTRA®' },
  body: {
    en: 'By stimulating your own collagen production, it gradually improves volume loss, hollowing and laxity, restoring a fuller, firmer contour and a natural, progressive youthfulness.',
    zh: '通过刺激自身胶原蛋白生成，逐步改善面部容量流失、凹陷与松弛，让轮廓恢复饱满与紧致，呈现自然渐进式的年轻状态。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: { en: ["Stimulate collagen regeneration | Improves skin support and firmness", "Improve facial hollows | Restores natural fullness and dimension", "Firming lift | Improves laxity and refines the facial contour", "Improve skin quality | Enhances elasticity and fine texture", "Natural rejuvenation | Gradual results for a more natural overall look"], zh: ["刺激胶原再生｜提升肌肤支撑力与紧实度", "改善面部凹陷｜恢复自然饱满与立体感", "提升紧致｜改善松弛，优化面部轮廓", "改善肤质｜提升肌肤弹性与细腻度", "自然年轻化｜效果渐进，整体状态更自然"] },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Temples | Cheeks | Mid-face | Nasolabial area | Jaw contour', zh: '太阳穴｜面颊｜苹果肌｜中面部｜法令纹区域｜下颌轮廓' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: { en: 'Collagen regeneration · Gradual improvement · Natural fullness · Full-face rejuvenation', zh: '胶原再生 · 渐进改善 · 自然饱满 · 全脸年轻化' },
    },
  ],
  note: {
    en: 'Treatment plan, dose and number of sessions are determined after an in-person assessment of your facial foundation by a qualified medical professional.',
    zh: '治疗方案、使用剂量及疗程次数需根据个人面部基础，经专业医疗人员面诊评估后确定。',
  },
}

const tirzepatide = {
  id: 'tirzepatide',
  key: 'tirzepatide',
  name: { en: 'Tirzepatide Weight-Loss Injection', zh: '替西帕肽体重管理' },
  image: '/images/treatments/shared/tirzepatide.jpg', // replaced by the zh/en pair in TREATMENT_PHOTOS
  subtitle: { en: '', zh: 'TIRZEPATIDE WEIGHT MANAGEMENT' },
  body: {
    en: 'After a professional medical assessment, tirzepatide is combined with personalised diet, exercise and lifestyle management to help control appetite, increase fullness and support long-term, science-based weight management.',
    zh: '通过专业医学评估，结合替西帕肽（Tirzepatide）与个性化饮食、运动及生活方式管理，帮助控制食欲、增加饱腹感，并支持长期、科学的体重管理。',
  },
  sections: [
    {
      title: { en: 'Key effects', zh: '主要作用' },
      items: { en: ["Reduce appetite | Increases fullness and helps control food intake", "Support weight loss | With diet and exercise, improves weight and body composition", "Slow gastric emptying | Helps prolong fullness after meals", "Metabolic support | Acts on GIP and GLP-1 receptors to support metabolic management", "Long-term management | A personalised weight-management plan with regular follow-up"], zh: ["减少食欲｜增加饱腹感，帮助控制饮食摄入", "辅助减重｜配合饮食与运动改善体重及身体成分", "延缓胃排空｜帮助延长餐后饱腹感", "代谢支持｜作用于 GIP 与 GLP-1 受体，辅助代谢管理", "长期管理｜结合定期随访，制定个性化体重管理计划"] },
    },
    {
      title: { en: 'Who it’s for', zh: '适合人群' },
      text: { en: 'People with obesity | Overweight with related health risks | Those who struggle with diet control | Those who need medical weight management', zh: '肥胖人群｜超重并伴有相关健康风险者｜饮食控制困难者｜需要医学体重管理者' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: { en: 'Once weekly · Medical assessment · Personalised dose · Regular follow-up', zh: '每周一次 · 医学评估 · 个性化剂量 · 定期随访' },
    },
  ],
  note: {
    en: 'Whether it is suitable for you, dose adjustments and the treatment schedule are determined by a qualified medical professional after assessing your BMI, medical history, current medications and relevant tests.',
    zh: '具体是否适合使用、剂量调整及疗程安排需由专业医疗人员结合 BMI、既往病史、当前用药及相关检查进行评估后确定。',
  },
}

// "医美项目" is split into three categories: injectables, IV drips, devices.
export const categories = [
  {
    slug: 'injectables',
    group: 'medical',
    icon: 'Syringe',
    name: { en: 'Injectables', zh: '注射针剂类' },
    short: { en: 'Botox, fillers, thread lifts, PRP, hormone therapy and more.', zh: '肉毒素、玻尿酸、提拉线、PRP、荷尔蒙等注射类项目。' },
    intro: {
      en: 'Precise, conservative injectable and needle-based treatments that soften lines, restore volume, define contours and support whole-body renewal.',
      zh: '精准、适度的注射与针剂项目，淡化细纹、恢复饱满、勾勒轮廓，并支持全身焕新。',
    },
    treatments: [
      ...pick('injectables-1', 'injectables-2', 'injectables-3', 'injectables-4'),
      collagenStimulator,
      ...pick('skin-2', 'injectables-5', 'hair-2', 'body-3', 'wellness-2', 'hormone-stem-cell-1'),
      tirzepatide,
    ],
  },
  {
    slug: 'iv-therapy',
    group: 'medical',
    icon: 'Droplet',
    name: { en: 'IV Drips', zh: '点滴类' },
    short: { en: 'NAD+, IV nutrition and stem-cell therapy delivered by infusion.', zh: 'NAD+、静脉营养与干细胞，以点滴方式输注。' },
    intro: {
      en: 'Intravenous infusions deliver vitamins, NAD+ and regenerative therapies straight into the bloodstream for full absorption.',
      zh: '以静脉输注将维生素、NAD+ 与再生疗法直接送入血液，充分吸收。',
    },
    treatments: pick('iv-therapy-1', 'iv-therapy-2', 'hormone-stem-cell-2'),
  },
  {
    slug: 'devices',
    group: 'medical',
    icon: 'Zap',
    name: { en: 'Devices & Technology', zh: '仪器类' },
    short: { en: 'Lasers, radiofrequency, HydraFacial, EMSculpt, HBOT and more.', zh: '激光、射频、水动力、磁波塑肌、高压氧等仪器项目。' },
    intro: {
      en: 'Medical-grade devices for tightening, resurfacing, pigment correction, body sculpting and whole-body wellness.',
      zh: '医疗级仪器，紧致、焕肤、祛斑、身体塑形与全身养护。',
    },
    treatments: pick(
      'skin-1', 'skin-3', 'skin-4', 'skin-5', 'skin-7', 'skin-8',
      'hair-3', 'body-1', 'body-2', 'wellness-1',
    ),
  },
  keepBase('skincare-experts'),
  keepBase('lash'),
  keepBase('microblading', { group: 'brow' }), // 纹绣 gets its own menu item
  keepBase('spa-care'),
]

// Display order for the home grid, treatments page and menus (anything not listed follows).
const ORDER = ['injectables', 'iv-therapy', 'devices', 'skincare-experts', 'lash', 'microblading', 'spa-care']
const rank = (c) => (ORDER.includes(c.slug) ? ORDER.indexOf(c.slug) : ORDER.length)
categories.sort((a, b) => rank(a) - rank(b))

// Photos per treatment, keyed by treatment key. Cards with steps/packages (detail layout)
// get a `photo` shown under the title; cards that already had an `image` get it replaced.
// The hand-picked Japanese face-slimming poster is intentionally not listed here.
const TREATMENT_PHOTOS = {
  'injectables-1': { zh: '/images/treatments/zh/injectables-1.jpg', en: '/images/treatments/en/injectables-1.jpg' },
  'injectables-2': { zh: '/images/treatments/zh/injectables-2.jpg', en: '/images/treatments/en/injectables-2.jpg' },
  'injectables-3': { zh: '/images/treatments/zh/injectables-3.jpg', en: '/images/treatments/en/injectables-3.jpg' },
  'injectables-4': { zh: '/images/treatments/zh/injectables-4.jpg', en: '/images/treatments/en/injectables-4.jpg' },
  'injectables-5': { zh: '/images/treatments/zh/injectables-5.jpg', en: '/images/treatments/en/injectables-5.jpg' },
  'collagen-stimulator': { zh: '/images/treatments/zh/collagen-stimulator.jpg', en: '/images/treatments/en/collagen-stimulator.jpg' },
  'skin-2': { zh: '/images/treatments/zh/skin-2.jpg', en: '/images/treatments/en/skin-2.jpg' },
  'hair-2': { zh: '/images/treatments/shared/hair-2.jpg', en: '/images/treatments/shared/hair-2.jpg' },
  'body-3': { zh: '/images/treatments/zh/body-3.jpg', en: '/images/treatments/en/body-3.jpg' },
  'wellness-2': { zh: '/images/treatments/shared/wellness-2.jpg', en: '/images/treatments/shared/wellness-2.jpg' },
  'hormone-stem-cell-1': { zh: '/images/treatments/shared/hormone-stem-cell-1.jpg', en: '/images/treatments/shared/hormone-stem-cell-1.jpg' },
  'tirzepatide': { zh: '/images/treatments/shared/tirzepatide.jpg', en: '/images/treatments/shared/tirzepatide.jpg' },
  'iv-therapy-1': { zh: '/images/treatments/shared/iv-therapy-1.jpg', en: '/images/treatments/shared/iv-therapy-1.jpg' },
  'iv-therapy-2': { zh: '/images/treatments/shared/iv-therapy-2.jpg', en: '/images/treatments/shared/iv-therapy-2.jpg' },
  'hormone-stem-cell-2': { zh: '/images/treatments/zh/hormone-stem-cell-2.jpg', en: '/images/treatments/en/hormone-stem-cell-2.jpg' },
  'skin-1': { zh: '/images/treatments/zh/skin-1.jpg', en: '/images/treatments/en/skin-1.jpg' },
  'skin-3': { zh: '/images/treatments/zh/skin-3.jpg', en: '/images/treatments/en/skin-3.jpg' },
  'skin-4': { zh: '/images/treatments/zh/skin-4.jpg', en: '/images/treatments/en/skin-4.jpg' },
  'skin-5': { zh: '/images/treatments/zh/skin-5.jpg', en: '/images/treatments/en/skin-5.jpg' },
  'skin-6': { zh: '/images/treatments/zh/skin-6.jpg', en: '/images/treatments/en/skin-6.jpg' },
  'skin-7': { zh: '/images/treatments/zh/skin-7.jpg', en: '/images/treatments/en/skin-7.jpg' },
  'skin-8': { zh: '/images/treatments/shared/skin-8.jpg', en: '/images/treatments/shared/skin-8.jpg' },
  'skin-9': { zh: '/images/treatments/zh/skin-9.jpg', en: '/images/treatments/en/skin-9.jpg' },
  'skin-10': { zh: '/images/treatments/zh/skin-10.jpg', en: '/images/treatments/en/skin-10.jpg' },
  'hair-1': { zh: '/images/treatments/zh/hair-1.jpg', en: '/images/treatments/en/hair-1.jpg' },
  'hair-3': { zh: '/images/treatments/zh/hair-3.jpg', en: '/images/treatments/en/hair-3.jpg' },
  'body-1': { zh: '/images/treatments/zh/body-1.jpg', en: '/images/treatments/en/body-1.jpg' },
  'body-2': { zh: '/images/treatments/zh/body-2.jpg', en: '/images/treatments/en/body-2.jpg' },
  'skinceuticals-cleanse-hydrate': { zh: '/images/treatments/zh/skinceuticals-cleanse-hydrate.jpg', en: '/images/treatments/en/skinceuticals-cleanse-hydrate.jpg' },
  'rejuran-brightening': { zh: '/images/treatments/zh/rejuran-brightening.jpg', en: '/images/treatments/en/rejuran-brightening.jpg' },
  'gua-sha': { zh: '/images/treatments/zh/gua-sha.jpg', en: '/images/treatments/en/gua-sha.jpg' },
  'acne-clearing': { zh: '/images/treatments/zh/acne-clearing.jpg', en: '/images/treatments/en/acne-clearing.jpg' },
  'classic-lashes': { zh: '/images/treatments/zh/classic-lashes.jpg', en: '/images/treatments/en/classic-lashes.jpg' },
  'hybrid-lashes': { zh: '/images/treatments/zh/hybrid-lashes.jpg', en: '/images/treatments/en/hybrid-lashes.jpg' },
  'lash-fills': { zh: '/images/treatments/zh/lash-fills.jpg', en: '/images/treatments/en/lash-fills.jpg' },
  'body-spa': { zh: '/images/treatments/shared/body-spa.jpg', en: '/images/treatments/shared/body-spa.jpg' },
  'head-spa': { zh: '/images/treatments/zh/head-spa.jpg', en: '/images/treatments/en/head-spa.jpg' },
  'microblading-cover': { zh: '/images/treatments/zh/microblading-cover.jpg', en: '/images/treatments/en/microblading-cover.jpg' },
  'wellness-1': { zh: '/images/treatments/zh/oxyair.jpg', en: '/images/treatments/zh/oxyair.jpg' },
}

// Photos are { zh, en } pairs: Asian faces for the Chinese site, Western faces for the English one
// (photos with no faces are shared). Components pick one with t().
categories.forEach((c) => c.treatments.forEach((x) => {
  const photo = TREATMENT_PHOTOS[x.key]
  if (!photo) return
  if (x.image) x.image = photo
  else if (x.steps || x.packages) x.photo = photo
}))

// Lash cards show the matching rows of the price list right under their description.
// Injectables: full poster for the Botox card (shown whole, not cropped to the card's photo ratio).
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'injectables-1').poster = '/images/treatments/shared/botox-glow-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'injectables-2').poster = '/images/treatments/shared/filler-aesthetic-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'injectables-3').poster = '/images/treatments/shared/belkyra-course-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'injectables-4').poster = '/images/treatments/shared/contour-guide-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'injectables-5').poster = '/images/treatments/shared/instalift-ad-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'collagen-stimulator').poster = '/images/treatments/shared/collagen-premium-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'skin-2').poster = '/images/treatments/shared/skin-booster-luxury-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'hair-2').poster = '/images/treatments/shared/prp-aesthetic-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'body-3').poster = '/images/treatments/shared/fat-reduction-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'wellness-2').poster = '/images/treatments/shared/vitamin-b-revive-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'hormone-stem-cell-1').poster = '/images/treatments/shared/hormone-course-poster.jpg'
categories.find((c) => c.slug === 'injectables').treatments.find((x) => x.key === 'tirzepatide').poster = '/images/treatments/shared/tirzepatide-science-poster.jpg'

const lashCat = categories.find((c) => c.slug === 'lash')
const lashRows = lashCat.priceList.groups.flatMap((g) => g.rows)
const lashPrices = (...names) => names.map((n) => lashRows.find((r) => r.name.zh === n)).map(({ name, single, member }) => ({ name, single, member }))
const lashItem = (id) => lashCat.treatments.find((x) => x.id === id)
const LASH_STYLES = {
  '单根扁毛': {
    name: { zh: '单根扁毛', en: 'Flat Single Lash' },
    body: { zh: "以扁平质地的单根嫁接，轻盈贴合，打造自然清爽的素颜感睫毛。", en: "One flat lash per natural lash — light, sleek and effortlessly natural." },
    bullets: { zh: ["根根分明，自然轻盈", "放大双眼，不显厚重", "根据眼型定制设计", "保留原生睫毛质感", "素颜自然，日常百搭"], en: ["Individually defined, natural and light", "Opens up the eyes without heaviness", "Designed around your eye shape", "Keeps the feel of your natural lashes", "Natural bare-faced, versatile every day"] },
    suited: { zh: "适合喜欢自然裸妆感、清透精致感，或初次尝试睫毛嫁接的人群。", en: "Suited to anyone who loves a natural, fresh, refined look, or who is trying lash extensions for the first time." },
  },
  'YY睫毛': {
    name: { zh: 'YY睫毛', en: 'YY Lashes' },
    body: { zh: "Y 形双头设计，一次嫁接两根的效果，蓬松自然、不显厚重。", en: "A Y-shaped double-tip lash that gives a fuller, fluffy look without heaviness." },
    bullets: { zh: ["Y 形双头，自然增加浓密感", "蓬松轻盈，不显厚重", "睫毛根部更有层次", "素颜、带妆都百搭"], en: ["Y-shaped double tip adds natural fullness", "Fluffy and light, never heavy", "More depth at the lash roots", "Works bare-faced or with makeup"] },
    suited: { zh: "适合睫毛偏稀疏、想比单根更饱满但仍追求自然的人群。", en: "Suited to sparse lashes, or anyone who wants more fullness than single lashes but still a natural look." },
  },
  '三叶草': {
    name: { zh: '三叶草', en: 'Clover' },
    body: { zh: "三叶造型的花型设计，层次分明，自然中带一点丰盈。", en: "A three-leaf fan design with defined layers — natural with a touch of fullness." },
    bullets: { zh: ["三叶花型排列，层次分明", "自然中带一点丰盈", "睫毛根部更饱满", "适合日常长期佩戴"], en: ["Three-leaf fan with clear layers", "Natural with a touch of fullness", "Fuller lash roots", "Comfortable for everyday wear"] },
    suited: { zh: "适合想要比单根更有存在感，但又不想太浓密夸张的人群。", en: "Suited to anyone who wants more presence than single lashes without going too dramatic." },
  },
  '妈生太阳花': {
    name: { zh: '妈生太阳花', en: 'Natural Sunflower' },
    body: { zh: "放射状排列，如天生般自然卷翘，打造“妈生”睫毛感。", en: "Radiating, natural-looking curl for a born-with-it lash look." },
    bullets: { zh: ["放射状排列，卷翘自然", "像天生睫毛般自然", "睁眼更有神采", "清透不夸张"], en: ["Radiating layout with a natural curl", "Looks like lashes you were born with", "Brighter, more awake eyes", "Clear and understated"] },
    suited: { zh: "适合喜欢“妈生”自然感、素颜也想眼神明亮，或初次尝试特色款式的人群。", en: "Suited to anyone who loves a born-with-it look, wants bright eyes even without makeup, or is trying a special style for the first time." },
  },
  '仙女C+婴儿弯': {
    name: { zh: '仙女C+婴儿弯', en: 'Fairy C + Baby Curl' },
    body: { zh: "C 形卷度搭配柔和婴儿弯，眼神清澈温柔，仙气十足。", en: "A soft C curl with a gentle baby curve for a clear, sweet, ethereal gaze." },
    bullets: { zh: ["甜美减龄", "卷翘灵动", "放大双眼", "自然轻盈"], en: ["Sweet and youthful", "Lively upward curl", "Enlarges the eyes", "Natural and light"] },
    suited: { zh: "适合喜欢甜美温柔氛围，或希望眼睛看起来更清澈灵动的人群。", en: "Suited to anyone who loves a sweet, gentle look or wants clearer, livelier-looking eyes." },
  },
  '盐系鱼尾柳叶': {
    name: { zh: '盐系鱼尾柳叶', en: 'Salt-Style Fishtail Willow' },
    body: { zh: "眼尾拉长呈鱼尾与柳叶线条，清冷高级的盐系风格。", en: "Extended outer corners shaped like a fishtail and willow leaf — a cool, refined “salt-style” look." },
    bullets: { zh: ["眼尾拉长，线条修长", "鱼尾与柳叶线条交错", "清冷高级的氛围感", "拉长眼型比例"], en: ["Elongated outer corners with slender lines", "Fishtail and willow-leaf lines combined", "A cool, refined mood", "Lengthens the eye shape"] },
    suited: { zh: "适合喜欢清冷高级感，或想让眼尾更修长的人群。", en: "Suited to anyone who loves a cool, refined look or wants longer, more slender outer corners." },
  },
  '泰式猫系': {
    name: { zh: '泰式猫系', en: 'Thai Cat-Eye' },
    body: { zh: "眼尾上扬的猫眼线条，眼神灵动，带一点魅惑感。", en: "Upswept cat-eye lines for a lively, slightly alluring look." },
    bullets: { zh: ["眼尾上扬，猫眼线条", "眼神灵动有个性", "带一点魅惑感", "视觉上更上扬"], en: ["Upswept cat-eye lines", "Lively, characterful gaze", "A touch of allure", "Visually lifts the eyes"] },
    suited: { zh: "适合想要眼神更灵动、更有个性，或想提升眼尾的人群。", en: "Suited to anyone who wants a livelier, more characterful gaze or a lifted outer corner." },
  },
  '欧美浓密': {
    name: { zh: '欧美浓密', en: 'Western Volume' },
    body: { zh: "浓密卷翘、存在感强，带来立体深邃的欧美眼妆效果。", en: "Dense, curled and dramatic for a deep, defined Western-style eye." },
    bullets: { zh: ["浓密卷翘，存在感强", "立体深邃的眼妆感", "放大双眼，轮廓更明显", "带妆氛围感强"], en: ["Dense, curled and bold", "Deep, dimensional eye makeup effect", "Enlarges the eyes with stronger definition", "Great with makeup"] },
    suited: { zh: "适合喜欢浓密、鲜明眼妆，或睫毛稀疏想要明显改变的人群。", en: "Suited to anyone who loves bold, dense lashes, or has sparse lashes and wants a clear change." },
  },
  '国风狐系': {
    name: { zh: '国风狐系', en: 'Oriental Fox' },
    body: { zh: "眼尾微微拉长上挑，东方韵味的狐系眼型。", en: "Slightly elongated, lifted outer corners for an Eastern fox-eye shape." },
    bullets: { zh: ["眼尾微微拉长上挑", "东方韵味的狐系眼型", "灵动妩媚", "衬托五官立体"], en: ["Slightly elongated, lifted outer corners", "Eastern-inspired fox-eye shape", "Lively and charming", "Brings out facial definition"] },
    suited: { zh: "适合喜欢东方古典氛围，想要灵动妩媚感的人群。", en: "Suited to anyone who loves a classic Eastern mood and wants a lively, charming look." },
  },
  '日式漫画系': {
    name: { zh: '日式漫画系', en: 'Japanese Manga' },
    body: { zh: "根根分明的漫画感睫毛，放大双眼，洋娃娃般的灵动效果。", en: "Defined, doll-like manga lashes that enlarge the eyes." },
    bullets: { zh: ["漫画感，灵动有神", "放大双眼", "层次分明，精致立体", "轻盈舒适"], en: ["Manga-style, lively and expressive", "Enlarges the eyes", "Layered, refined and dimensional", "Light and comfortable"] },
    suited: { zh: "适合喜欢日系甜美、洋娃娃感，或想让眼睛更大更有神的人群。", en: "Suited to anyone who loves a sweet Japanese, doll-like look or wants bigger, brighter eyes." },
  },
  '下睫毛': {
    name: { zh: '下睫毛', en: 'Lower Lashes' },
    body: { zh: "为下眼睑增加睫毛，使眼部轮廓更完整立体。", en: "Adds lower lashes for a more complete, defined eye." },
    bullets: { zh: ["补足下眼睑睫毛", "眼部轮廓更完整", "与上睫毛更协调", "自然精致，素颜更有神"], en: ["Fills in the lower lash line", "A more complete eye outline", "Balances the upper lashes", "Natural and polished, brighter without makeup"] },
    suited: { zh: "适合下睫毛稀疏短小，或想让眼妆更完整立体的人群。", en: "Suited to sparse or short lower lashes, or anyone who wants a more complete, dimensional eye." },
  },
  '补睫毛（2-3周内）': {
    name: { zh: '补睫毛（2-3周内）', en: 'Fill (within 2–3 weeks)' },
    body: { zh: "适用于嫁接后 2–3 周内的补睫，保持睫毛饱满整齐。", en: "For fills within 2–3 weeks of your set, keeping lashes full and tidy." },
    bullets: { zh: ["约每 2–3 周补睫一次", "保持睫毛丰盈整齐", "延长睫毛维持时间", "及时补充自然脱落的睫毛"], en: ["Fills about every 2–3 weeks", "Keeps lashes full and tidy", "Extends how long the set lasts", "Replaces naturally shed lashes in time"] },
    suited: { zh: "适合已做过睫毛嫁接、想保持效果的人群，建议 2–3 周内回店补睫。", en: "Suited to anyone with an existing set who wants to keep the look — we recommend returning within 2–3 weeks." },
  },
}
lashCat.treatments.forEach((x) => { x.bookNow = true })
lashItem('lash-aftercare').bookNow = false
lashItem('lash-aftercare').noAction = true // aftercare info only: no booking or consult button
// styles[n] and prices[n] belong to posters[n]: the gallery shows the copy and price of the style on screen.
const lashStyles = (...names) => names.map((n) => LASH_STYLES[n])
const setStyles = (id, ...names) => {
  lashItem(id).styles = lashStyles(...names)
  lashItem(id).prices = lashPrices(...names)
}
setStyles('classic-lashes', '单根扁毛', 'YY睫毛', '三叶草')
setStyles('hybrid-lashes', '妈生太阳花', '仙女C+婴儿弯', '盐系鱼尾柳叶', '泰式猫系', '欧美浓密', '国风狐系', '日式漫画系')
setStyles('lash-fills', '下睫毛', '补睫毛（2-3周内）')
// The price list shows the same one-line summary under each style name.
lashRows.forEach((r) => { if (LASH_STYLES[r.name.zh]) r.desc = LASH_STYLES[r.name.zh].body })

export const getCategory = (slug) => categories.find((c) => c.slug === slug)

// Category covers (home tiles, treatments list) reuse one treatment photo per category.
const COVER_KEYS = {
  injectables: 'injectables-1',
  'iv-therapy': 'iv-therapy-1',
  devices: 'skin-1',
  'skincare-experts': 'skinceuticals-cleanse-hydrate',
  lash: 'classic-lashes',
  microblading: 'microblading-cover',
  'spa-care': 'head-spa',
}
categories.forEach((c) => { if (COVER_KEYS[c.slug]) c.cover = { ...TREATMENT_PHOTOS[COVER_KEYS[c.slug]] } })
// Injectables: the clinic's own cover photo for the Chinese site; English keeps the Western stock photo.
categories.find((c) => c.slug === 'injectables').cover.zh = '/images/treatments/zh/injectables-cover.jpg'
// Every Chinese-site photo on the Injectables page uses crops of that same photo (full / syringe / eyes / lips / profile).
const INJECTABLE_CROPS = ['inj-full', 'inj-syringe', 'inj-eyes', 'inj-lips', 'inj-profile'].map((n) => `/images/treatments/zh/${n}.jpg`)
categories.find((c) => c.slug === 'injectables').treatments.forEach((x, i) => {
  x.image = { ...x.image, zh: INJECTABLE_CROPS[i % INJECTABLE_CROPS.length] }
})

// Devices: same idea with the clinic's own Thermage photo (Chinese site). The HBOT card keeps the clinic's real HBOT-room photo.
const devices = categories.find((c) => c.slug === 'devices')
devices.cover.zh = '/images/treatments/zh/dev-full.jpg'
const DEVICE_CROPS = ['dev-full', 'dev-handpiece', 'dev-face', 'dev-screen', 'dev-profile'].map((n) => `/images/treatments/zh/${n}.jpg`)
devices.treatments.filter((x) => x.key !== 'wellness-1').forEach((x, i) => {
  x.image = { ...x.image, zh: DEVICE_CROPS[i % DEVICE_CROPS.length] }
})

// 02 Photorejuvenation: renamed and given its own photo.
const m22 = devices.treatments.find((x) => x.key === 'skin-3')
m22.name = { ...m22.name, zh: 'M22光子嫩肤' }
m22.image = { ...m22.image, zh: '/images/treatments/zh/m22-ipl.jpg' }
Object.assign(m22, {
  compact: true,
  subtitle: { en: '', zh: 'STELLAR M22 IPL PHOTOREJUVENATION' },
  body: {
    en: 'Built on the Lumenis Stellar M22 platform, advanced IPL (intense pulsed light) improves pigmentation, redness and uneven skin tone for clear, refined, healthy-looking skin.',
    zh: '采用美国 Lumenis 科医人 Stellar M22 光电平台，通过先进的 IPL 强脉冲光技术，改善色素沉着、泛红及肤色不均，焕现透亮细腻的健康肌肤。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Fade dark spots | Improves sun spots, freckles and some pigmentation',
          'Reduce redness | Eases facial redness and visible superficial vessels',
          'Brighter tone | Improves dullness and uneven skin tone',
          'Refined texture | Improves overall skin texture and radiance',
        ],
        zh: [
          '淡化色斑｜改善日晒斑、雀斑及部分色素沉着',
          '改善泛红｜减轻面部泛红及可见的浅表血管问题',
          '提亮肤色｜改善暗沉与肤色不均',
          '细腻肤质｜改善肌肤整体质感与光泽度',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with dull skin, pigmentation concerns, facial redness, uneven tone, or who want to improve photo-aging.',
        zh: '肤色暗沉、色斑困扰、面部泛红、肤色不均及有光老化改善需求的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Full face | Neck | Chest | Hands', zh: '全脸｜颈部｜胸前｜手部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'US light-based technology · Precise light energy · Multi-dimensional renewal · Personalised treatment',
        zh: '美版光电科技 · 精准光能 · 多维焕肤 · 个性化治疗',
      },
    },
  ],
  note: {
    en: 'Please note: results vary with skin type, pigment type and skin condition. Your treatment plan is set after assessment by a qualified professional.',
    zh: '温馨提示：治疗效果因肤质、色素类型及皮肤状态而异，具体治疗方案需经专业人员评估后制定。',
  },
})

// 03: renamed and given its own photo (the blurb below it is still the fractional-laser one).
const pico = devices.treatments.find((x) => x.key === 'skin-4')
pico.name = { en: 'Pico Laser Exploration', zh: '探索皮秒' }
pico.image = { ...pico.image, zh: '/images/treatments/zh/pico-explore.jpg' }
Object.assign(pico, {
  compact: true,
  subtitle: { en: '', zh: 'DISCOVERY PICO LASER' },
  body: {
    en: 'Using Quanta System (Italy) Discovery Pico laser technology, ultra-short pulses target pigment particles precisely to improve dark spots, uneven tone and skin texture for clear, refined, healthy-looking skin.',
    zh: '采用意大利 Quanta System 探索皮秒激光技术，通过超短脉冲精准作用于色素颗粒，改善色斑、肤色不均及肌肤质感，焕现透亮细腻的健康肌肤。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Precise spot fading | Improves freckles, sun spots and some pigmentation',
          'Brighter tone | Improves dullness and uneven skin tone',
          'Refined texture | Improves roughness and skin smoothness',
          'Acne-mark care | Fades some pigmented acne marks',
          'Tattoo removal | Ultra-short pulses break up tattoo ink particles to help fade or remove tattoos',
        ],
        zh: [
          '精准淡斑｜改善雀斑、日晒斑及部分色素沉着',
          '提亮肤色｜改善暗沉与肤色不均',
          '细腻肤质｜改善粗糙，提升肌肤细腻度',
          '痘印改善｜淡化部分色素型痘印',
          '纹身去除｜超短脉冲击碎纹身墨水颗粒，帮助淡化或去除纹身',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with dark spots, pigmentation, dull skin, acne marks or rough skin texture.',
        zh: '有色斑、色素沉着、肤色暗沉、痘印及肤质粗糙困扰的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Full face | Individual spots | Neck | Hands', zh: '全脸｜局部色斑｜颈部｜手部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Italian light-based technology · Picosecond technology · Precise spot fading · Personalised treatment',
        zh: '意大利光电科技 · 皮秒技术 · 精准淡斑 · 个性化治疗',
      },
    },
  ],
  note: {
    en: 'Please note: results vary with spot type, skin type and skin condition. Your treatment plan is set after assessment by a qualified professional.',
    zh: '温馨提示：治疗效果因色斑类型、肤质及皮肤状态而异，具体治疗方案需经专业人员评估后制定。',
  },
})

// 04: the AviClear card now presents CO2 fractional laser resurfacing (own photo and copy).
const co2 = devices.treatments.find((x) => x.key === 'skin-5')
co2.name = { en: 'CO₂ Fractional Laser Resurfacing', zh: 'CO₂ 点阵激光焕肤' }
co2.image = { ...co2.image, zh: '/images/treatments/zh/co2-laser.jpg' }
delete co2.faq
Object.assign(co2, {
  compact: true,
  subtitle: { en: '', zh: 'FRACTIONAL CO₂ LASER RESURFACING' },
  body: {
    en: 'Fractional CO₂ laser works precisely on the epidermis and dermis to promote collagen remodelling, improving acne scars, deep wrinkles, pigmentation and rough texture for smooth, refined, youthful skin.',
    zh: '采用 CO₂ 点阵激光技术，精准作用于皮肤表层及真皮层，促进胶原蛋白重塑，改善痘疤、深层皱纹、色素沉着及肌肤粗糙，重现细腻平滑的年轻肌肤。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Acne scars | Softens acne pits and depressed scars',
          'Sun damage | Improves skin concerns caused by photo-aging',
          'Deep wrinkles | Improves visible wrinkles and signs of skin aging',
          'Brown spots | Fades some pigmentation and sun spots',
          'Stretch marks | Improves texture and uneven skin surface',
          'Refined, firmer skin | Improves enlarged pores and promotes collagen remodelling',
        ],
        zh: [
          '改善痤疮疤痕｜淡化痘坑及凹陷性疤痕',
          '改善日晒损伤｜改善光老化引起的肤质问题',
          '淡化深层皱纹｜改善明显皱纹与肌肤老化迹象',
          '改善褐色斑点｜淡化部分色素沉着及日晒斑',
          '改善妊娠纹｜改善纹路质感及皮肤凹凸不平',
          '细腻紧致肌肤｜改善毛孔粗大，促进胶原重塑',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with acne scars, pits, deep wrinkles, sun damage, brown spots, stretch marks or rough skin texture.',
        zh: '痤疮疤痕、痘坑、深层皱纹、日晒损伤、褐色斑点、妊娠纹及肤质粗糙困扰的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Full face | Eye area | Neck | Abdomen | Selected body areas', zh: '全脸｜眼周｜颈部｜腹部｜身体局部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Precise fractional · Deep resurfacing · Collagen remodelling · Better skin texture',
        zh: '精准点阵 · 深层焕肤 · 胶原重塑 · 肤质改善',
      },
    },
  ],
  note: {
    en: 'Please note: fractional CO₂ laser is an ablative treatment. The degree of improvement differs between types of spots, scars and stretch marks; your treatment plan is set after assessment by a qualified medical professional.',
    zh: '温馨提示：CO₂ 点阵激光属于剥脱性治疗，不同类型的色斑、疤痕和妊娠纹改善程度不同，具体治疗方案需经专业医疗人员评估后制定。',
  },
})

// 05: the RF microneedling card, renamed and given its own photo (the blurb is unchanged).
const legend = devices.treatments.find((x) => x.key === 'skin-7')
legend.name = { en: 'Legend Pro Gold RF Microneedling', zh: 'Legend Pro 黄金射频微针' }
legend.image = { ...legend.image, zh: '/images/treatments/zh/legend-pro.jpg' }
Object.assign(legend, {
  compact: true,
  subtitle: { en: '', zh: 'LEGEND PRO RF MICRONEEDLING' },
  body: {
    en: 'Legend Pro radiofrequency anti-aging technology combined with VoluDerm RF microneedling promotes collagen remodelling, improving enlarged pores, acne scars, fine lines and laxity for firm, refined, youthful skin.',
    zh: '采用 Legend Pro 射频抗衰技术，结合 VoluDerm 射频微针，促进胶原蛋白重塑，改善毛孔粗大、痘坑痘疤、细纹及肌肤松弛，焕现紧致细腻的年轻肌肤。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Firming lift | Improves laxity and raises elasticity',
          'Refined pores | Improves enlarged pores',
          'Fade acne scars | Improves acne pits and acne scarring',
          'Smoother fine lines | Softens fine lines and improves skin texture',
          'Collagen renewal | Promotes collagen remodelling',
        ],
        zh: [
          '紧致提升｜改善松弛，提升弹性',
          '细致毛孔｜改善粗大毛孔',
          '淡化痘疤｜改善痘坑及痤疮疤痕',
          '平滑细纹｜淡化细纹，改善肤质',
          '胶原新生｜促进胶原重塑',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with enlarged pores, acne pits and scars, fine lines, skin laxity, rough texture or stretch marks.',
        zh: '毛孔粗大、痘坑痘疤、细纹、肌肤松弛、肤质粗糙及妊娠纹困扰的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Full face | Jawline | Neck | Abdomen | Selected body areas', zh: '全脸｜下颌线｜颈部｜腹部｜身体局部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'VoluDerm RF microneedling · Collagen remodelling · Firming lift · Personalised treatment',
        zh: 'VoluDerm 射频微针 · 胶原重塑 · 紧致提升 · 个性化治疗',
      },
    },
  ],
  note: {
    en: 'Please note: results vary with skin type and treatment area; your plan is set after assessment by a qualified medical professional.',
    zh: '温馨提示：治疗效果因个人肤质及治疗部位而异，具体方案需经专业医疗人员评估后制定。',
  },
})

// 06: the red/blue-light card now presents Viveve intimate RF therapy (own photo and copy).
const viveve = devices.treatments.find((x) => x.key === 'skin-8')
delete viveve.faq
viveve.image = { ...viveve.image, zh: '/images/treatments/zh/viveve.jpg' }
Object.assign(viveve, {
  compact: true,
  name: { en: 'Viveve Intimate RF Therapy', zh: 'Viveve 薇蜜私密射频护理' },
  subtitle: { en: '', zh: 'VIVEVE INTIMATE RF THERAPY' },
  body: {
    en: 'Viveve radiofrequency technology applies RF energy with surface cooling to intimate tissue, exploring the potential for collagen remodelling and improved tissue elasticity — a professional, private, personalised wellness experience for women.',
    zh: '采用 Viveve 射频技术，通过射频能量与表面冷却技术作用于私密组织，探索胶原蛋白重塑及组织弹性改善的潜力，为女性提供专业、私密的个性化健康护理体验。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要作用' },
      items: {
        en: [
          'Collagen remodelling | Exploring the potential for tissue collagen renewal',
          'Elasticity management | Attention to changes in intimate tissue elasticity',
          'Postpartum care | Assessment of postpartum intimate health needs',
          'Comfortable care | Privacy protection and a personalised experience',
        ],
        zh: [
          '胶原重塑｜探索组织胶原更新潜力',
          '弹性管理｜关注私密组织弹性变化',
          '产后关怀｜针对产后私密健康需求进行评估',
          '舒适护理｜注重隐私保护与个性化体验',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'Women concerned about postpartum intimate changes, age-related changes in tissue elasticity, and intimate health management.',
        zh: '关注产后私密变化、年龄相关组织弹性变化及女性私密健康管理的人群。',
      },
    },
    {
      title: { en: 'Treatment area', zh: '护理部位' },
      text: { en: 'Female intimate area', zh: '女性私密部位' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'RF technology · Surface cooling · Privacy protection · Personalised assessment',
        zh: '射频科技 · 表面冷却 · 隐私保护 · 个性化评估',
      },
    },
  ],
  note: {
    en: 'Please note: suitability and your specific plan must be assessed by a qualified medical professional.',
    zh: '温馨提示：是否适用，具体方案需经专业医疗人员评估后制定。',
  },
})

// 07: the scalp stem-cell card now presents BTL EMSculpt (own photo and copy).
const emsculpt = devices.treatments.find((x) => x.key === 'hair-3')
delete emsculpt.faq
Object.assign(emsculpt, {
  compact: true,
  name: { en: 'BTL EMSculpt Body Contouring', zh: 'BTL 磁波塑肌燃脂' },
  subtitle: { en: '', zh: 'BTL EMSCULPT BODY CONTOURING' },
  image: { ...devices.treatments.find((x) => x.key === 'body-1').image, zh: '/images/treatments/zh/emsculpt-neo.jpg' },
  body: {
    en: 'BTL high-intensity focused electromagnetic technology (HIFEM) stimulates intense muscle contractions to help build muscle strength and improve body lines, for a firm, shapely silhouette.',
    zh: '采用 BTL 高强度聚焦电磁技术（HIFEM），刺激肌肉产生高强度收缩，帮助增强肌肉力量、改善身体线条，打造紧致有型的理想曲线。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Stronger muscle | Builds muscle strength and firmness',
          'Firming and shaping | Improves body contour and lines',
          'Abdomen shaping | Strengthens the core and improves abdominal shape',
          'Glute lift | Strengthens the glutes for fuller curves',
          'Fat management | Some device models can help reduce localised fat',
        ],
        zh: [
          '强化肌肉｜增强肌肉力量与紧实度',
          '紧致塑形｜改善身体轮廓与线条',
          '腹部塑形｜强化核心肌群，改善腹部形态',
          '臀部提升｜增强臀部肌肉，塑造饱满曲线',
          '脂肪管理｜部分设备型号可辅助减少局部脂肪',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People who want to improve abdominal lines, glute shape, muscle firmness and local body contour.',
        zh: '希望改善腹部线条、臀部形态、肌肉紧实度及局部身体轮廓的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Abdomen | Glutes | Thighs | Arms', zh: '腹部｜臀部｜大腿｜手臂' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Non-invasive · Electromagnetic muscle toning · No surgery · Personalised contouring',
        zh: '非侵入式 · 磁波塑肌 · 无需手术 · 个性化塑形',
      },
    },
  ],
  note: {
    en: 'Please note: results vary from person to person. It may not be suitable during pregnancy or for people with a pacemaker or some metal implants; your plan must be assessed by a qualified professional.',
    zh: '温馨提示：治疗效果因人而异，孕期、装有心脏起搏器或部分金属植入物的人群可能不适用，具体方案需经专业人员评估。',
  },
})

// 08: the old EMSculpt card now presents Legend Pro scalp care (own photo and copy).
const scalp = devices.treatments.find((x) => x.key === 'body-1')
delete scalp.faq
Object.assign(scalp, {
  compact: true,
  name: { en: 'Legend Pro Stem Cell-Derived Scalp Revitalising', zh: 'Legend Pro 干细胞科技头皮焕活' },
  subtitle: { en: '', zh: 'LEGEND PRO STEM CELL–DERIVED SCALP CARE' },
  image: { ...scalp.image, zh: '/images/treatments/zh/legend-scalp.jpg' },
  body: {
    en: 'Combining Legend Pro radiofrequency technology with stem cell-derived essence care, a personalised scalp revitalising treatment for scalp aging, dryness and hair-root health — helping maintain a healthy scalp environment and opening a refined scalp anti-aging routine.',
    zh: '融合 Legend Pro 射频科技与干细胞来源精华养护理念，针对头皮老化、干燥及发根健康需求，打造个性化头皮焕活护理，帮助维持健康头皮环境，开启精致头皮抗衰管理。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Scalp anti-aging | Attention to scalp aging and changes in elasticity',
          'Scalp revitalising | Improves dryness and roughness',
          'Hair-root care | Supports a healthy scalp environment',
          'Essence nourishment | Professional moisturising care',
          'Scalp repair management | Attention to the scalp barrier and overall condition',
        ],
        zh: [
          '头皮抗衰｜关注头皮老化与弹性变化',
          '头皮焕活｜改善干燥与粗糙',
          '发根养护｜支持健康头皮环境',
          '精华滋养｜提供专业保湿养护',
          '头皮修护管理｜关注头皮屏障与整体状态',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with a dry or aging scalp, fine hair, hair-root care needs, or an interest in scalp anti-aging.',
        zh: '头皮干燥、头皮老化、发质细软、发根养护需求及关注头皮抗衰管理的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Crown | Hairline | Selected scalp areas', zh: '头顶部｜发际线｜头皮局部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Legend Pro technology · Stem cell-derived essence · Scalp anti-aging management · Personalised care',
        zh: 'Legend Pro 科技 · 干细胞来源精华 · 头皮抗衰管理 · 个性化养护',
      },
    },
  ],
  note: {
    en: 'Please note: results vary from person to person. It may not be suitable during pregnancy; your plan must be assessed by a qualified professional.',
    zh: '温馨提示：治疗效果因人而异，孕期人群可能不适用，具体方案需经专业人员评估。',
  },
})

// 09: the BTL fat-dissolving card now presents red & blue LED light therapy (own photo and copy).
const led = devices.treatments.find((x) => x.key === 'body-2')
delete led.faq
Object.assign(led, {
  compact: true,
  name: { en: 'Red & Blue LED Light Therapy', zh: '红蓝光 LED 光疗' },
  subtitle: { en: '', zh: 'RED & BLUE LED LIGHT THERAPY' },
  image: { zh: '/images/treatments/zh/led-light.jpg', en: '/images/treatments/shared/skin-8.jpg' },
  body: {
    en: 'Professional LED red and blue light uses different wavelengths on the skin to help improve acne, redness and skin-quality concerns and support skin repair, revealing a naturally healthy, radiant glow.',
    zh: '采用专业 LED 红蓝光技术，通过不同波长的光能作用于肌肤，帮助改善痘痘、泛红及肤质问题，促进肌肤修护，焕现健康透亮的自然光采。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Blue light for acne | Inhibits some acne-causing bacteria and improves mild to moderate inflammatory acne',
          'Red light repair | Helps soothe skin and reduce redness',
          'Calming inflammation | Helps ease discomfort from breakouts',
          'Collagen care | Supports collagen metabolism and elasticity management',
          'Radiant skin | Improves overall skin condition',
        ],
        zh: [
          '蓝光净痘｜抑制部分致痘细菌，改善轻中度炎症性痘痘',
          '红光修护｜帮助舒缓肌肤，减轻泛红',
          '舒缓炎症｜辅助改善痘痘引起的不适',
          '胶原养护｜支持肌肤胶原代谢与弹性管理',
          '焕亮肤质｜改善肌肤整体状态',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'Acne-prone, oily or redness-prone skin, and people focused on skin repair, fine lines and everyday care.',
        zh: '痘痘肌、油性肌肤、易泛红肌肤，以及关注肌肤修护、细纹与日常养护的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: { en: 'Full face | Forehead | Jawline | Back | Selected body areas', zh: '全脸｜额头｜下颌｜背部｜身体局部' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Non-invasive · Dual red and blue light · Gentle and comfortable · No downtime',
        zh: '非侵入式 · 红蓝双光 · 温和舒适 · 无需恢复期',
      },
    },
  ],
  note: {
    en: 'Please note: LED results vary with skin type, device wavelength and treatment plan, and usually need several sessions. People with light-sensitive skin or taking photosensitising medication need their plan assessed by a qualified professional.',
    zh: '温馨提示：LED 光疗效果因个人肤质、设备波长及治疗方案而异，通常需要多次护理。光敏感人群及正在使用光敏性药物者，具体方案需经专业人员评估。',
  },
})

// 10: HBOT card, renamed with structured copy (own photo).
const oxy = devices.treatments.find((x) => x.key === 'wellness-1')
Object.assign(oxy, {
  compact: true,
  name: { en: 'OXYAIR Hyperbaric Oxygen Revitalising', zh: 'OXYAIR 高压氧舱焕活全身抗衰' },
  subtitle: { en: '', zh: 'OXYAIR OXYGEN WELLNESS THERAPY' },
  body: {
    en: 'OXYAIR oxygen-chamber technology creates a comfortable, tranquil oxygen-care space. Combined with a personalised wellness approach, it helps body and mind relax and opens an inside-out experience of renewed vitality.',
    zh: '采用 OXYAIR 氧舱科技，打造舒适、静谧的氧气养护空间，结合个性化健康管理理念，帮助身心放松，开启由内而外的活力焕新体验。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Oxygen care | A professional oxygen-care experience',
          'Body-mind relief | Relaxes body and mind and eases everyday tension',
          'Vitality management | Attention to everyday energy and health',
          'Healthy anti-aging | Supports healthy-aging management',
          'Comfortable rest | A quiet, comfortable resting environment',
        ],
        zh: [
          '氧气养护｜提供专业氧气护理体验',
          '身心舒缓｜放松身心，缓解日常紧绷感',
          '活力管理｜关注日常精力与健康状态',
          '健康抗衰｜辅助健康老龄化管理',
          '舒适休养｜打造安静舒适的休息环境',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People focused on everyday health management, relaxation, vitality care and healthy aging.',
        zh: '关注日常健康管理、身心放松、活力养护及健康老龄化的人群。',
      },
    },
    {
      title: { en: 'Care format', zh: '护理方式' },
      text: { en: 'Private oxygen chamber | Comfortable reclining | Personalised care', zh: '独立氧舱｜舒适躺卧｜个性化护理' },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Oxygen-chamber technology · Comfortable experience · Relaxation · Wellness care',
        zh: '氧舱科技 · 舒适体验 · 身心放松 · 健康养护',
      },
    },
  ],
  note: {
    en: 'Please note: people with certain ear, nose and throat or lung conditions, or other related health issues, need to be assessed by a qualified medical professional before use.',
    zh: '温馨提示：患有特定耳鼻喉、肺部疾病或其他相关健康问题的人群，使用前需经专业医疗人员评估。',
  },
})

// Thermage FLX: structured copy (same layout as the injectables cards).
Object.assign(devices.treatments.find((x) => x.key === 'skin-1'), {
  compact: true,
  name: { en: 'Thermage FLX (5th Generation)', zh: '第五代热玛吉' },
  subtitle: { en: '', zh: 'THERMAGE FLX' },
  body: {
    en: 'Monopolar radiofrequency delivers heat deep into the skin to stimulate collagen remodelling, improving laxity and fine lines for a naturally firm, youthful contour.',
    zh: '采用单极射频技术，将热能传递至皮肤深层，促进胶原蛋白重塑，改善肌肤松弛与细纹，打造自然紧致的年轻轮廓。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要功效' },
      items: {
        en: [
          'Firming lift | Improves laxity of the face and jawline',
          'Softer fine lines | Improves fine lines around the eyes and face',
          'Collagen renewal | Promotes collagen remodelling and skin elasticity',
          'Contour refinement | Improves the jawline and overall facial firmness',
        ],
        zh: [
          '紧致提升｜改善面部及下颌轮廓松弛',
          '淡化细纹｜改善眼周及面部细纹',
          '胶原新生｜促进胶原蛋白重塑，提升肌肤弹性',
          '轮廓优化｜改善下颌线条与面部紧实度',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People with mild to moderate facial laxity, increasing fine lines, reduced skin elasticity, or an interest in anti-aging.',
        zh: '面部轻中度松弛、细纹增多、肌肤弹性下降及有抗衰需求的人群。',
      },
    },
    {
      title: { en: 'Treatment areas', zh: '适用部位' },
      text: {
        en: 'Full face | Eye area | Jawline | Neck | Selected body areas',
        zh: '全脸｜眼周｜下颌线｜颈部｜身体局部',
      },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Non-invasive · Monopolar radiofrequency · Collagen remodelling · Naturally firm',
        zh: '非侵入式 · 单极射频 · 胶原重塑 · 自然紧致',
      },
    },
  ],
  note: {
    en: 'Please note: actual results vary with skin type, degree of laxity and treatment area; your plan must be assessed by a qualified medical professional.',
    zh: '温馨提示：实际效果因个人肤质、松弛程度及治疗部位而异，具体方案需经专业医疗人员评估。',
  },
})

// IV drips: the clinic's own NAD+ drip photo for the Chinese site (full / arm & line / woman). English keeps its Western photos.
const ivDrips = categories.find((c) => c.slug === 'iv-therapy')
ivDrips.cover.zh = '/images/treatments/zh/nad-serene.jpg'
const IV_PHOTOS = ['nad-serene', 'iv-nutrition', 'iv-vitality'].map((n) => `/images/treatments/zh/${n}.jpg`)
ivDrips.treatments.forEach((x, i) => {
  x.image = { ...x.image, zh: IV_PHOTOS[i % IV_PHOTOS.length] }
})

// NAD+ IV: structured copy (same layout as the injectables cards).
Object.assign(ivDrips.treatments.find((x) => x.key === 'iv-therapy-1'), {
  name: { en: 'NAD+ IV Therapy', zh: 'NAD+ 静脉注射' },
  compact: true,
  subtitle: { en: '', zh: 'NAD+ IV THERAPY' },
  body: {
    en: 'NAD+ is replenished by intravenous infusion to take part in cellular energy metabolism — personalised support for health management and vitality care.',
    zh: '通过静脉输注补充 NAD+，参与细胞能量代谢，为健康管理与活力养护提供个性化支持。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要作用' },
      items: {
        en: [
          'Energy metabolism | Takes part in cellular energy production',
          'Cell care | Supports normal cell function',
          'Healthy aging | Focused on age-related metabolic change',
          'Vitality management | Personalised health support',
        ],
        zh: [
          '能量代谢｜参与细胞能量生成',
          '细胞养护｜支持正常细胞功能',
          '健康抗衰｜关注年龄相关代谢变化',
          '活力管理｜提供个性化健康支持',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People focused on healthy aging, cell care and vitality management.',
        zh: '关注健康老龄化、细胞养护及活力管理的人群。',
      },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Professional assessment · IV infusion · Personalised care',
        zh: '专业评估 · 静脉输注 · 个性化护理',
      },
    },
  ],
  note: {
    en: 'Please note: ingredients, suitability and risks must be assessed by a qualified medical professional.',
    zh: '温馨提示：具体成分、适用性及风险需由专业医疗人员评估。',
  },
})

// Brightening IV (iv-therapy-2): same structured layout and tight spacing as NAD+.
Object.assign(ivDrips.treatments.find((x) => x.key === 'iv-therapy-2'), {
  name: { en: 'Brightening IV Therapy', zh: '美白焕肤针' },
  compact: true,
  subtitle: { en: '', zh: 'BRIGHTENING IV THERAPY' },
  body: {
    en: 'A personalised IV nutrition infusion that supports skin health and antioxidant management, for a naturally radiant glow.',
    zh: '通过个性化静脉营养输注，为肌肤健康与抗氧化管理提供辅助支持，焕发自然光采。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要作用' },
      items: {
        en: [
          'Antioxidant support | Helps maintain normal antioxidant function',
          'Skin care | Focused on skin health and nutrient supplementation',
          'Radiance management | A refined inside-out care experience',
          'Personalised care | An infusion plan built around your needs',
        ],
        zh: [
          '抗氧化支持｜辅助维持正常抗氧化功能',
          '肌肤养护｜关注肌肤健康与营养补充',
          '光采管理｜打造由内而外的精致养护体验',
          '个性化护理｜根据个人需求制定输注方案',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People concerned about dull skin, antioxidant care and everyday health management.',
        zh: '关注肌肤暗沉、抗氧化养护及日常健康管理的人群。',
      },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Professional assessment · Nutritional support · IV infusion · Personalised plan',
        zh: '专业评估 · 营养支持 · 静脉输注 · 个性化方案',
      },
    },
  ],
  note: {
    en: 'Please note: ingredients, suitability and risks must be assessed by a qualified medical professional.',
    zh: '温馨提示：具体成分、适用性及风险需由专业医疗人员评估。',
  },
})

// Vitality IV (the former stem-cell card, key hormone-stem-cell-2): same layout and tight spacing.
Object.assign(ivDrips.treatments.find((x) => x.key === 'hormone-stem-cell-2'), {
  name: { en: 'Vitality Booster IV Therapy', zh: '活力能量针' },
  compact: true,
  subtitle: { en: '', zh: 'VITALITY BOOSTER IV THERAPY' },
  body: {
    en: 'A personalised IV nutrition infusion that replenishes the nutrients your body needs, supporting energy metabolism and everyday vitality for a healthier state.',
    zh: '通过个性化静脉营养输注，补充身体所需营养素，支持能量代谢与日常活力管理，焕发健康状态。',
  },
  sections: [
    {
      title: { en: 'Key benefits', zh: '主要作用' },
      items: {
        en: [
          'Energy support | Helps maintain normal energy metabolism',
          'Nutrient replenishment | Supplies the vitamins and nutrients your body needs',
          'Vitality care | Focused on everyday energy and physical condition',
          'Personalised care | A nutrition plan built around your needs',
        ],
        zh: [
          '能量支持｜辅助维持正常能量代谢',
          '营养补充｜补充身体所需维生素及营养素',
          '活力养护｜关注日常精力与身体状态',
          '个性化护理｜根据个人需求制定营养方案',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People focused on everyday vitality, nutrient replenishment and health management.',
        zh: '关注日常活力、营养补充及健康管理的人群。',
      },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Professional assessment · Nutritional support · IV infusion · Personalised plan',
        zh: '专业评估 · 营养支持 · 静脉输注 · 个性化方案',
      },
    },
  ],
  note: {
    en: 'Please note: the effect of IV nutrition infusion on fatigue and energy varies from person to person. Ingredients, suitability and risks must be assessed by a qualified medical professional.',
    zh: '温馨提示：静脉营养输注改善疲劳、提升精力的效果因人而异，具体成分、适用性及风险需由专业医疗人员评估。',
  },
})

// The old steps belonged to the stem-cell card, which now has its own item (04) below.
delete ivDrips.treatments.find((x) => x.key === 'hormone-stem-cell-2').steps

// 04 Stem cell therapy: structured copy, same layout and tight spacing as the other IV cards.
ivDrips.treatments.push({
  key: 'stem-cell',
  name: { en: 'Stem Cell Therapy', zh: '干细胞治疗' },
  compact: true,
  subtitle: { en: '', zh: 'STEM CELL THERAPY' },
  image: { zh: '/images/treatments/zh/stem-cell-luxury.jpg', en: '/images/treatments/en/hormone-stem-cell-2.jpg' },
  body: {
    en: 'Explore the potential of stem cells in tissue repair and regenerative medicine — a personalised regenerative-medicine consultation built on professional medical assessment.',
    zh: '探索干细胞在组织修复与再生医学领域的应用潜力，结合专业医疗评估，提供个性化的再生医学咨询方案。',
  },
  sections: [
    {
      title: { en: 'Research focus', zh: '主要研究方向' },
      items: {
        en: [
          'Cell regeneration | Exploring how stem cells differentiate and renew',
          'Tissue repair | Studying the repair potential of damaged tissue',
          'Healthy aging | Focused on cellular aging and regenerative-medicine research',
          'Personalised assessment | Suitability and risks assessed against your health status',
        ],
        zh: [
          '细胞再生｜探索干细胞的分化与更新机制',
          '组织修复｜研究受损组织的修复潜力',
          '健康老龄化｜关注细胞衰老与再生医学研究',
          '个性化评估｜根据个人健康状况评估适用性与风险',
        ],
      },
    },
    {
      title: { en: 'Suitable for', zh: '适合人群' },
      text: {
        en: 'People interested in regenerative medicine, healthy aging and cutting-edge cell science.',
        zh: '关注再生医学、健康老龄化及前沿细胞科技的人群。',
      },
    },
    {
      title: { en: 'Highlights', zh: '项目特点' },
      text: {
        en: 'Cutting-edge medicine · Professional assessment · Personalised consultation · Scientific management',
        zh: '前沿医学 · 专业评估 · 个性化咨询 · 科学管理',
      },
    },
  ],
  note: {
    en: 'Please note: ingredients, suitability and risks must be assessed by a qualified medical professional.',
    zh: '温馨提示：具体成分、适用性及风险需由专业医疗人员评估。',
  },
})

// Skincare: the clinic's own facial-mask photo for the Chinese site. The Japanese face-slimming card keeps its poster.
const skincare = categories.find((c) => c.slug === 'skincare-experts')
skincare.treatments.forEach((x) => { x.noAction = true }) // booking happens on the package cards: no separate consult button
skincare.cover.zh = '/images/treatments/zh/sk-full.jpg'
const SKINCARE_CROPS = ['sk-full', 'sk-face', 'sk-brush', 'sk-products', 'sk-neck', 'sk-hands'].map((n) => `/images/treatments/zh/${n}.jpg`)
skincare.treatments.filter((x) => !x.poster).forEach((x, i) => {
  x.photo = { ...x.photo, zh: SKINCARE_CROPS[i % SKINCARE_CROPS.length] }
})

// Lashes: the clinic's own lash-extension photo for the Chinese site.
const lashes = categories.find((c) => c.slug === 'lash')
lashes.cover.zh = '/images/treatments/zh/lash-full.jpg'
const LASH_CROPS = ['lash-full', 'lash-eyes', 'lash-tray', 'lash-face'].map((n) => `/images/treatments/zh/${n}.jpg`)
lashes.treatments.forEach((x, i) => {
  x.photo = { ...x.photo, zh: LASH_CROPS[i % LASH_CROPS.length] }
})

// Permanent makeup: the clinic's own brow photo for the Chinese site (cover only; the page keeps the artist's portrait).
categories.find((c) => c.slug === 'microblading').cover.zh = '/images/treatments/zh/brow-full.jpg'

// Body & Head Spa: the clinic's own spa photo for the Chinese site (full for the cover and body spa, a face/hair close-up for head spa).
const bodyHeadSpa = categories.find((c) => c.slug === 'spa-care')
bodyHeadSpa.cover.zh = '/images/treatments/zh/spa-full.jpg'
const SPA_PHOTOS = ['spa-full', 'spa-head'].map((n) => `/images/treatments/zh/${n}.jpg`)
bodyHeadSpa.treatments.forEach((x, i) => {
  x.photo = { ...x.photo, zh: SPA_PHOTOS[i % SPA_PHOTOS.length] }
})

// Contact-form choices, two levels: top-level menu group, then its services.
// Medical has several categories, so its services are sub-headed by category.
const GROUPS = [
  { id: 'medical', name: { en: 'Medical Treatments', zh: '医美项目' } },
  { id: 'skincare', name: { en: 'Skincare Experts', zh: '护肤项目' } },
  { id: 'spa', name: { en: 'Spa', zh: 'Spa' } },
  { id: 'lash', name: { en: 'Lashes', zh: '美睫' } },
  { id: 'brow', name: { en: 'Permanent Makeup', zh: '纹绣' } },
]
export const serviceGroups = GROUPS.map((g) => ({
  ...g,
  sections: categories
    .filter((c) => c.group === g.id)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      items: c.treatments.map((x) => ({ key: x.key, name: x.name, value: `${c.name.zh} · ${x.name.zh}` })),
    })),
}))

// Gallery: clinic photos stored in /public/images/gallery (copied from the old site).
export const galleryPhotos = [
  { src: '/images/gallery/outside-1.jpg', caption: { en: 'Clinic exterior', zh: '门店外观' } },
  { src: '/images/gallery/exterior-dusk.jpg', caption: { en: 'Clinic at dusk', zh: '暮色门面' } },
  { src: '/images/gallery/lounge.jpg', caption: { en: 'Reception lounge', zh: '休息厅' } },
  { src: '/images/gallery/front-desk-new.jpg', caption: { en: 'Front desk', zh: '前台' } },
  { src: '/images/gallery/hallway-new.jpg', caption: { en: 'Quiet hallway', zh: '走廊' } },
  { src: '/images/gallery/waiting-area.jpg', caption: { en: 'Reception waiting area', zh: '接待休息区' } },
  { src: '/images/gallery/hallway-bright.jpg', caption: { en: 'Bright hallway', zh: '明亮走廊' } },
  { src: '/images/gallery/waiting-hall.jpg', caption: { en: 'Waiting hall', zh: '候诊厅' } },
  { src: '/images/gallery/treatment-room-new.jpg', caption: { en: 'Treatment room', zh: '诊疗室' } },
  { src: '/images/gallery/treatment-room-purple.jpg', caption: { en: 'Treatment room', zh: '诊疗室' } },
  { src: '/images/gallery/treatment-room-laser.jpg', caption: { en: 'Treatment room with laser devices', zh: '激光诊疗室' } },
  { src: '/images/gallery/treatment-room-laser-2.jpg', caption: { en: 'Laser treatment room', zh: '激光诊疗房' } },
  { src: '/images/gallery/treatment-room-twin.jpg', caption: { en: 'Spa twin-bed room', zh: 'Spa 双床房' } },
  { src: '/images/gallery/treatment-room-spa.jpg', caption: { en: 'Comfort beauty room', zh: '舒适美容房' } },
  { src: '/images/gallery/brow-room.jpg', caption: { en: 'Permanent makeup room', zh: '纹绣房' } },
  { src: '/images/gallery/brow-room-2.jpg', caption: { en: 'Permanent makeup room', zh: '纹绣房' } },
]

// Real client cases (each image is a finished case card: profile, plan, before/after, review).
export const beforeAfterPhotos = [
  { src: '/images/cases/case-01.jpg', to: '/treatments/injectables#injectables-5', caption: { en: 'Case 01 · Full-face anti-aging & contour lift', zh: 'CASE 01　全脸抗衰 轮廓提升' } },
  { src: '/images/cases/case-02.jpg', to: '/treatments/devices#skin-4', caption: { en: 'Case 02 · Targeted pigment removal & skin renewal', zh: 'CASE 02　精准祛斑 肤色焕新' } },
  { src: '/images/cases/case-03.jpg', to: '/treatments/skincare-experts#acne-clearing', caption: { en: 'Case 03 · Acne skin repair', zh: 'CASE 03　痘肌修复 重建健康肌' } },
  { src: '/images/cases/case-04.jpg', to: '/treatments/devices#skin-1', caption: { en: 'Case 04 · Thermage FLX skin tightening', zh: 'CASE 04　第五代热玛吉 紧肤抗衰' } },
  { src: '/images/cases/case-05.jpg', to: '/treatments/skincare-experts#japanese-face-correction', caption: { en: 'Case 05 · Japanese face sculpting', zh: 'CASE 05　日式小颜 面部线条管理' } },
  { src: '/images/cases/case-06.jpg', to: '/treatments/injectables#injectables-2', caption: { en: 'Case 06 · Hyaluronic acid contouring', zh: 'CASE 06　玻尿酸微调 精致轮廓' } },
  { src: '/images/cases/case-07.jpg', to: '/treatments/lash', caption: { en: 'Case 07 · Custom lash design', zh: 'CASE 07　专属美睫 放大双眸' } },
  { src: '/images/cases/case-08.jpg', to: '/treatments', caption: { en: 'Case 08 · Comprehensive anti-aging', zh: 'CASE 08　综合抗衰 全面年轻化' } },
  { src: '/images/cases/case-09.jpg', to: '/treatments/microblading#ombre-brows', caption: { en: 'Case 09 · Natural powder brow', zh: 'CASE 09　高级水雾眉 定制自然眉形' } },
]
