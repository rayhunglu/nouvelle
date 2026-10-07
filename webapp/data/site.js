// Business details.
export const business = {
  name: 'Nouvelle Anti-Aging Center',
  phone: '(425) 598-1111',
  phoneHref: 'tel:+14255981111',
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
        image: img('Botox%20Ad.jpg'),
        body: {
          en: 'A quick neuromodulator treatment that relaxes the muscles behind expression lines — smoothing forehead lines, frown lines and crow’s feet, and gently slimming the jaw.',
          zh: '通过放松导致表情纹的肌肉，抚平抬头纹、川字纹与鱼尾纹，并可温和瘦脸。',
        },
        faq: 'botox',
      },
      {
        name: { en: 'Dermal Filler', zh: '玻尿酸微调注射' },
        image: img('Revance%20RHA%202%203%204.jpg'),
        body: {
          en: 'Hyaluronic-acid fillers restore lost volume and sculpt facial structure. The body absorbs them gradually and naturally over time.',
          zh: '玻尿酸填充剂恢复流失的容量、塑造面部轮廓，会被人体自然缓慢吸收。',
        },
        bullets: {
          en: ['Fuller lips', 'Defined cheekbones', 'Under-eye hollows', 'Sharper jawline', 'Chin projection', 'Softer nasal lines'],
          zh: ['丰唇', '提升颧骨线条', '改善泪沟眼袋', '凸显下颌线', '丰下巴', '淡化鼻部纹路'],
        },
        faq: 'dermal-filler',
      },
      {
        name: { en: 'Belkyra (Kybella)', zh: '双下巴溶脂' },
        image: img('Belkyra-Injectable-_-Kybella-Injectable_1.jpg'),
        body: {
          en: 'An injectable form of deoxycholic acid that permanently breaks down fat cells under the chin, refining the profile without surgery.',
          zh: '以脱氧胆酸注射分解下巴下方脂肪细胞，被分解的脂肪细胞不再回来，无需手术即可改善侧颜线条。',
        },
        faq: 'belkyra',
      },
      {
        name: { en: 'Botox + Filler Contouring', zh: '面部轮廓塑形' },
        image: img('Botox%20plus%20filler.jpg'),
        body: {
          en: 'A combined plan that pairs muscle relaxation with targeted volume — a full-face approach for balanced, harmonious results.',
          zh: '肉毒素与填充剂联合方案，整体规划面部，打造协调自然的轮廓。',
        },
        faq: 'botox-filler',
      },
      {
        name: { en: 'Silhouette InstaLift', zh: '铃铛童颜线面部提升' },
        image: img('Silhoutte%20Instalift.jpg'),
        body: {
          en: 'A non-surgical, in-office lift using dissolvable sutures to reposition sagging skin along the cheeks and jawline, while stimulating collagen.',
          zh: '非手术门诊疗程，以可吸收缝线提拉松弛的面颊与下颌线，同时刺激胶原蛋白再生。',
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
        image: img('mesotherapy.jpg'),
        body: {
          en: 'Micro-injections of vitamins, antioxidants and botanicals that hydrate, brighten and tighten the skin.',
          zh: '微量注射维生素、抗氧化剂与植物精华，补水、提亮、紧致肌肤。',
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
        image: img('PRP%20Hair%20Restoration-cf4ad73.jpg'),
        body: {
          en: 'Your own platelet-rich plasma — rich in growth factors — is applied to the scalp to stimulate follicles and support hair-transplant results.',
          zh: '以您自身富含生长因子的富血小板血浆作用于头皮，激活毛囊、辅助植发效果。',
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
        name: { en: 'Lipodissolve', zh: '皮下减脂消脂针' },
        image: img('Lipodissolve.jpg'),
        body: {
          en: 'Injections that dissolve small, stubborn fat pockets with virtually no downtime.',
          zh: '注射溶解顽固局部脂肪，几乎无恢复期。',
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
        image: img('B%20Complex%20Inject.jpg'),
        body: {
          en: 'A fast boost of the eight essential B vitamins (B1–B12) to support energy, mood and metabolism.',
          zh: '快速补充八种必需 B 族维生素（B1–B12），提升精力、改善情绪、支持代谢。',
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
        image: img('Hormone%20Level.png'),
        body: {
          en: 'Natural hormone replacement guided by lab work. Balanced levels are linked to lower risk of osteoporosis, heart disease and diabetes.',
          zh: '以化验为依据的天然荷尔蒙补充。平衡的荷尔蒙水平有助于降低骨质疏松、心脏病与糖尿病风险。',
        },
        bullets: {
          en: ['More lean muscle', 'Less body fat', 'Smaller waistline', 'Fewer wrinkles', 'Better libido', 'Relief from menopause symptoms'],
          zh: ['肌肉增加', '脂肪减少', '腰围变小', '皱纹减少', '性生活改善', '缓解更年期症状'],
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
    treatments: [
      {
      id: "japanese-face-correction",
      name: {
        en: "Japanese Hand-Sculpted Face Slimming",
        zh: "日式小颜徒手矫正"
      },
      short: {
        en: "Hands-on lymphatic drainage and contour sculpting.",
        zh: "徒手淋巴引流与轮廓塑形。"
      },
      body: {
        en: "Authentic Japanese hand-sculpted face slimming by a specialist with over 10 years of experience in Japan — no need to fly to Tokyo. Using only hands, the treatment drains the lymphatic system, relaxes the fascia and rebalances the facial muscles, helping the face look lifted, more symmetrical and less puffy.",
        zh: "纯正日式小颜矫正，由在日本拥有 10 年以上经验的专业徒手师操作——不用飞东京，在西雅图就能体验。仅以双手，促进淋巴排毒、放松筋膜、平衡左右脸筋骨，让脸部更显提拉、对称、不浮肿。"
      },
      poster: "/images/skincare/japanese-face-correction.jpg",
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
            en: "Japanese Face Slimming · 60 min",
            zh: "日式小颜 60 分钟"
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
              "Shoulder, neck and collarbone lymphatic drainage",
              "Fascia release + left–right facial muscle and bone balancing",
              "Hydrating mask + deep nutrient infusion"
            ],
            zh: [
              "肩颈锁骨淋巴排毒",
              "筋膜放松 + 左右脸筋骨平衡",
              "保湿补水面膜 + 深层营养导入"
            ]
          }
        },
        {
          name: {
            en: "Japanese Face Slimming · 90 min",
            zh: "日式小颜 90 分钟"
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
              "Shoulder, neck, collarbone, underarm and both-arm lymphatic drainage",
              "Fascia release + left–right facial muscle and bone balancing",
              "Plaster mask shaping + deep nutrient infusion"
            ],
            zh: [
              "肩颈锁骨腋下双臂淋巴排毒",
              "筋膜放松 + 左右脸筋骨平衡",
              "石膏面膜定型 + 深层营养导入"
            ]
          }
        }
      ],
      facts: [
        {
          label: {
            en: "Best for",
            zh: "适合"
          },
          value: {
            en: "Uneven or asymmetrical face, puffiness, laxity, a dull complexion",
            zh: "大小脸、左右不对称、浮肿、松弛、肤色暗沉"
          }
        },
        {
          label: {
            en: "Good to know",
            zh: "温馨提示"
          },
          value: {
            en: "Prices shown are first-visit offers and may change. Call us to book.",
            zh: "所示价格为初次体验优惠，可能调整，请来电预约确认。"
          }
        }
      ]
    },
      {
        id: "skinceuticals-cleanse-hydrate",
        name: {
          en: "SkinCeuticals Cleansing & Hydrating Facial",
          zh: "修丽可清洁补水"
        },
        short: {
          en: "Deep cleanse and hydration with medical-grade skincare.",
          zh: "医学级护肤品深层清洁与补水。"
        },
        body: {
          en: "A professional facial using SkinCeuticals products. Cleansing and gentle exfoliation remove dead skin cells and clear pores, so the hydrating actives that follow can absorb better — leaving skin smoother, brighter and well hydrated.",
          zh: "使用修丽可（SkinCeuticals）产品的专业面部护理。清洁与温和去角质清除老废角质、疏通毛孔，让后续补水活性成分更易吸收，肌肤更平滑、透亮、水润。"
        },
        bullets: {
          en: [
            "Removes dead skin cells and cleans pores",
            "Relieves dryness and dehydration",
            "Smoother texture and brighter complexion",
            "Softens the look of fine lines"
          ],
          zh: [
            "去除老废角质、清洁毛孔",
            "改善干燥与缺水",
            "肤质更平滑、肤色更透亮",
            "淡化细纹观感"
          ]
        },
        steps: {
          en: [
            "Gel cleanse to remove oil, makeup and impurities",
            "Gentle peel or mechanical exfoliation chosen for your skin",
            "Targeted hydrating serums and professional actives",
            "Mask, moisturizer and sun protection"
          ],
          zh: [
            "凝胶洁面，去除油脂、彩妆与杂质",
            "依肤质选择温和焕肤或物理去角质",
            "针对性补水精华与专业活性成分",
            "面膜、保湿与防晒收尾"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About 45–60 minutes",
              zh: "约 45–60 分钟"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Dull, dehydrated or congested skin",
              zh: "暗沉、缺水或毛孔堵塞的肌肤"
            }
          },
          {
            label: {
              en: "Aftercare",
              zh: "术后护理"
            },
            value: {
              en: "Use daily sunscreen and avoid harsh actives for a day or two.",
              zh: "每日防晒，一两天内避免刺激性活性成分。"
            }
          }
        ]
      },
      {
        id: "skinceuticals-nourish-repair",
        name: {
          en: "SkinCeuticals Nourishing & Repair Facial",
          zh: "修丽可滋润修复"
        },
        short: {
          en: "Barrier-supporting care for dry, sensitive or stressed skin.",
          zh: "为干燥、敏感或受压肌肤强化屏障。"
        },
        body: {
          en: "A calming, barrier-focused facial for skin that feels tight, dry or sensitive. Gentle cleansing is followed by nourishing, repairing products — such as ceramide- and panthenol-rich formulas — to help restore comfort and moisture.",
          zh: "针对紧绷、干燥或敏感肌的舒缓型屏障护理。温和清洁后，搭配含神经酰胺、泛醇等成分的滋养修复产品，帮助恢复舒适与水润。"
        },
        bullets: {
          en: [
            "Helps strengthen the skin barrier",
            "Soothes tightness and redness",
            "Locks in moisture",
            "Gentle enough for sensitive skin"
          ],
          zh: [
            "帮助强化肌肤屏障",
            "舒缓紧绷与泛红",
            "锁住水分",
            "敏感肌也适用"
          ]
        },
        steps: {
          en: [
            "Skin assessment and gentle, soothing cleanse",
            "Light exfoliation only if your skin tolerates it",
            "Nourishing and repairing serums",
            "Calming mask, barrier cream and sunscreen"
          ],
          zh: [
            "肤质评估与温和舒缓洁面",
            "仅在肌肤可承受时轻度去角质",
            "滋养修复精华",
            "舒缓面膜、屏障霜与防晒"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About 45–60 minutes",
              zh: "约 45–60 分钟"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Dry, sensitive or over-exfoliated skin; seasonal changes",
              zh: "干燥、敏感或过度去角质的肌肤；换季护理"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "Tell us about any recent procedures or skin reactions beforehand.",
              zh: "如近期做过医美项目或有过敏反应，请提前告知。"
            }
          }
        ]
      },
      {
        id: "rejuran-brightening",
        name: {
          en: "Brightening & Hydration Facial",
          zh: "瑞妍亮白水润"
        },
        short: {
          en: "Hydrating, brightening care for a dewy, even glow.",
          zh: "补水提亮护理，肌肤水润均匀。"
        },
        body: {
          en: "A professional brightening and hydration program designed to even out dull tone and replenish moisture. Skin is deeply cleansed, treated with brightening and hydrating actives, then sealed with a soothing mask for a fresh, dewy finish.",
          zh: "专业亮白补水护理，改善暗沉肤色并补充水分。深层清洁后导入提亮与补水活性成分，再以舒缓面膜收尾，呈现清透水润的好气色。"
        },
        bullets: {
          en: [
            "More even, radiant-looking tone",
            "Deep hydration and a dewy finish",
            "Softer, smoother texture",
            "No downtime"
          ],
          zh: [
            "肤色更均匀透亮",
            "深层补水、水润光泽",
            "肤质更柔软细腻",
            "无恢复期"
          ]
        },
        steps: {
          en: [
            "Deep cleanse and gentle exfoliation",
            "Brightening and hydrating active infusion",
            "Hydrating mask",
            "Moisturizer and sun protection"
          ],
          zh: [
            "深层清洁与温和去角质",
            "导入提亮与补水活性成分",
            "补水面膜",
            "保湿与防晒"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About an hour — ask when booking",
              zh: "约一小时，预约时可咨询"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Dull, uneven or dry skin; before special occasions",
              zh: "暗沉、不均或干燥的肌肤；重要场合前"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "Brightening works best as a series with daily sun protection.",
              zh: "亮白护理以疗程搭配每日防晒效果最佳。"
            }
          }
        ]
      },
      {
        id: "rejuran-v-face",
        name: {
          en: "V-Face Firming Facial",
          zh: "瑞妍V脸生机弹绷"
        },
        short: {
          en: "Firming and contouring care for a lifted, V-shaped look.",
          zh: "紧致提拉护理，雕塑 V 脸线条。"
        },
        body: {
          en: "A firming and contouring program that combines lifting massage with skin-tightening care. It aims to leave the lower face looking more defined, and skin feeling springier, firmer and more elastic.",
          zh: "结合提拉按摩与紧致护理的轮廓管理疗程，帮助下半脸线条更清晰，肌肤更有弹性、更紧实饱满。"
        },
        bullets: {
          en: [
            "Firmer, more elastic-feeling skin",
            "More defined V-shaped contour",
            "Reduced puffiness",
            "Visible freshness right after the session"
          ],
          zh: [
            "肌肤更紧实有弹性",
            "V 脸轮廓更清晰",
            "减轻浮肿",
            "护理后即刻更显精神"
          ]
        },
        steps: {
          en: [
            "Cleanse and prepare the skin",
            "Lifting and contouring massage",
            "Firming actives and mask",
            "Moisturizer and sun protection"
          ],
          zh: [
            "清洁与肌肤准备",
            "提拉塑形按摩",
            "导入紧致活性成分与面膜",
            "保湿与防晒"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About an hour — ask when booking",
              zh: "约一小时，预约时可咨询"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Early laxity, soft jawline, a tired or puffy lower face",
              zh: "初期松弛、下颌线模糊、下脸疲惫浮肿"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "For deeper lifting, ask about Thermage or InstaLift in our medical menu.",
              zh: "如需更明显的提拉，可咨询医美项目中的热玛吉或童颜线。"
            }
          }
        ]
      },
      {
        id: "gua-sha",
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
        steps: {
          en: [
            "Cleanse and apply facial oil or serum",
            "Gentle gliding strokes along the neck, jaw, cheeks, eyes and forehead",
            "Lymphatic drainage toward the ears and neck",
            "Soothing mask and moisturizer"
          ],
          zh: [
            "洁面并涂抹面油或精华",
            "沿颈部、下颌、面颊、眼周与额头轻柔刮拭",
            "朝耳后与颈部方向淋巴引流",
            "舒缓面膜与保湿"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About 45–60 minutes",
              zh: "约 45–60 分钟"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Puffy, tense or dull-looking skin; stress relief",
              zh: "浮肿、紧绷或暗沉的肌肤；舒压放松"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "Mild pinkness can appear and fades quickly. Results are temporary; avoid broken skin or active breakouts.",
              zh: "可能出现轻微泛红，很快消退。效果为暂时性；皮肤破损或严重爆痘期不适合。"
            }
          }
        ]
      },
      {
        id: "acne-clearing",
        name: {
          en: "Professional Acne-Clearing Facial",
          zh: "NOUVLLE专业祛痘针清"
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
        steps: {
          en: [
            "Cleansing and gentle exfoliation",
            "Steaming to soften skin and open pores",
            "Careful manual extraction with sterile tools",
            "Soothing, antibacterial care and a calming mask",
            "Sun protection and personalized home-care advice"
          ],
          zh: [
            "洁面与温和去角质",
            "蒸面软化肌肤、打开毛孔",
            "使用无菌工具细致针清",
            "舒缓抗菌护理与镇静面膜",
            "防晒与居家护理建议"
          ]
        },
        facts: [
          {
            label: {
              en: "Typical session",
              zh: "单次时长"
            },
            value: {
              en: "About an hour — ask when booking",
              zh: "约一小时，预约时可咨询"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Blackheads, whiteheads, oily or congested skin",
              zh: "黑头、白头、油性或毛孔堵塞肌肤"
            }
          },
          {
            label: {
              en: "Aftercare",
              zh: "术后护理"
            },
            value: {
              en: "Avoid direct sun and heavy makeup for about 48 hours, and never pick at the skin.",
              zh: "约 48 小时内避免暴晒与浓妆，切勿自行挤压。"
            }
          },
          {
            label: {
              en: "Severe acne?",
              zh: "严重痘痘？"
            },
            value: {
              en: "For inflamed or cystic acne, ask about AviClear laser in our medical menu.",
              zh: "发炎或囊肿型痘痘，可咨询医美项目中的 AviClear 祛痘激光。"
            }
          }
        ]
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
          en: "Proper aftercare helps your set last longer and protects your natural lashes.",
          zh: "正确的护理能延长维持时间并保护自然睫毛。"
        },
        steps: {
          en: [
            "Avoid water, steam and oil for the first 48 hours",
            "Brush gently every day to keep lashes tidy",
            "Avoid oil-based products around the eyes",
            "Never pull or pick at the extensions",
            "Book fills every 2–3 weeks"
          ],
          zh: [
            "前 48 小时避免接触水、蒸汽与油脂",
            "每天轻柔梳理保持整齐",
            "眼周避免使用含油产品",
            "切勿拉扯嫁接睫毛",
            "每 2–3 周预约补睫"
          ]
        },
        facts: [
          {
            label: {
              en: "Fill schedule",
              zh: "补睫频率"
            },
            value: {
              en: "Every 2–3 weeks",
              zh: "每 2–3 周"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "Tell us about eye sensitivities or allergies before your appointment.",
              zh: "如有眼部敏感或过敏，请预约前告知。"
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
  body: {
    en: 'A regenerative injectable built on poly-L-lactic acid (PLLA) microparticles. Rather than filling instantly, it gradually stimulates your own collagen, so the face looks fuller, firmer and more elastic over the following months — ideal for broad volume loss and laxity. Any fullness on the day is mostly water and swelling that settles within days; the real result develops over time.',
    zh: '以聚左旋乳酸（PLLA）微球为主要成分的再生类注射。它不是立刻“填满”，而是逐步刺激自身胶原蛋白新生，让面部在之后的数月里更饱满、紧致、更有弹性，适合整体容量流失与松弛的改善。当天的饱满感多半是水分与肿胀，几天内会消退，真正的效果会随时间逐渐显现。',
  },
  bullets: {
    en: ['Restores broad volume loss (temples, cheeks)', 'Firmer, more lifted contours', 'Softens lines caused by laxity, such as nasolabial folds', 'Gradual, natural-looking change'],
    zh: ['改善整体容量流失（太阳穴、面颊）', '轮廓更紧致、更有提拉感', '淡化因松弛产生的纹路，如法令纹', '效果渐进、自然'],
  },
  steps: {
    en: [
      'Consultation to assess volume loss and laxity and plan where and how much to treat',
      'Cleansing, then layered injections — usually quick',
      'Aftercare guidance from your provider',
      'A course is typically several sessions about 1–3 months apart; results build over a few months and can last around two years, varying from person to person',
    ],
    zh: [
      '面诊评估容量流失与松弛程度，规划注射部位与剂量',
      '清洁消毒后分层注射，过程通常较快',
      '医师提供术后护理指导',
      '一个疗程通常分数次进行，间隔约 1–3 个月；效果在数月内逐渐显现，可维持约两年左右，因人而异',
    ],
  },
}

const tirzepatide = {
  id: 'tirzepatide',
  key: 'tirzepatide',
  name: { en: 'Tirzepatide Weight-Loss Injection', zh: '替西帕肽减肥针' },
  image: '/images/treatments/shared/tirzepatide.jpg', // replaced by the zh/en pair in TREATMENT_PHOTOS
  body: {
    en: 'Tirzepatide is a prescription medicine that acts on both GIP and GLP-1 receptors. Given as a once-weekly injection under the skin, it helps reduce appetite and slows stomach emptying so you feel full sooner and longer, supporting weight management in adults who need it. It requires a physician’s evaluation and prescription, and works best alongside nutrition and exercise. Common side effects include nausea, diarrhea or constipation, stomach pain and injection-site reactions; whether it is right for you is decided at consultation.',
    zh: '替西帕肽（tirzepatide）是同时作用于 GIP 与 GLP-1 受体的处方药物，每周皮下注射一次，可降低食欲、减缓胃排空，让您更快、更久地有饱足感，帮助有需要的成年人控制体重。需由医师评估并开立处方，并配合饮食与运动效果更好。常见不适包括恶心、腹泻或便秘、腹痛及注射部位反应；是否适合您，需经面诊后由医师判断。',
  },
  bullets: {
    en: ['Once-weekly injection under the skin', 'Helps lower appetite and increase fullness', 'Physician-evaluated and monitored', 'Best combined with diet and exercise'],
    zh: ['每周一次皮下注射', '帮助降低食欲、增加饱足感', '由医师评估并定期追踪', '搭配饮食与运动效果更好'],
  },
  steps: {
    en: [
      'Physician consultation reviewing your health, history and current medications — it isn’t suitable for everyone',
      'Dosing is tailored to you, usually starting low and adjusting step by step',
      'Weekly injection, with a demonstration of how to inject safely',
      'Follow-up visits to track weight, response and any side effects',
    ],
    zh: [
      '医师面诊，了解身体状况、病史与目前用药——并非人人适合',
      '依个人情况制定剂量，通常从低剂量开始逐步调整',
      '每周注射一次，并教导安全的注射方式',
      '定期回诊，追踪体重、反应与任何不适',
    ],
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
      ...pick('injectables-1', 'injectables-2', 'injectables-3', 'injectables-4', 'injectables-5'),
      collagenStimulator,
      ...pick('injectables-6', 'skin-2', 'hair-2', 'body-3', 'wellness-2', 'hormone-stem-cell-1'),
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
      'skin-1', 'skin-3', 'skin-4', 'skin-5', 'skin-6', 'skin-7', 'skin-8', 'skin-9', 'skin-10',
      'hair-1', 'hair-3', 'body-1', 'body-2', 'wellness-1',
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
  'injectables-6': { zh: '/images/treatments/zh/injectables-6.jpg', en: '/images/treatments/en/injectables-6.jpg' },
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
  'skinceuticals-nourish-repair': { zh: '/images/treatments/zh/skinceuticals-nourish-repair.jpg', en: '/images/treatments/en/skinceuticals-nourish-repair.jpg' },
  'rejuran-brightening': { zh: '/images/treatments/zh/rejuran-brightening.jpg', en: '/images/treatments/en/rejuran-brightening.jpg' },
  'rejuran-v-face': { zh: '/images/treatments/zh/rejuran-v-face.jpg', en: '/images/treatments/en/rejuran-v-face.jpg' },
  'gua-sha': { zh: '/images/treatments/zh/gua-sha.jpg', en: '/images/treatments/en/gua-sha.jpg' },
  'acne-clearing': { zh: '/images/treatments/zh/acne-clearing.jpg', en: '/images/treatments/en/acne-clearing.jpg' },
  'classic-lashes': { zh: '/images/treatments/zh/classic-lashes.jpg', en: '/images/treatments/en/classic-lashes.jpg' },
  'hybrid-lashes': { zh: '/images/treatments/zh/hybrid-lashes.jpg', en: '/images/treatments/en/hybrid-lashes.jpg' },
  'lash-fills': { zh: '/images/treatments/zh/lash-fills.jpg', en: '/images/treatments/en/lash-fills.jpg' },
  'body-spa': { zh: '/images/treatments/shared/body-spa.jpg', en: '/images/treatments/shared/body-spa.jpg' },
  'head-spa': { zh: '/images/treatments/zh/head-spa.jpg', en: '/images/treatments/en/head-spa.jpg' },
  'microblading-cover': { zh: '/images/treatments/zh/microblading-cover.jpg', en: '/images/treatments/en/microblading-cover.jpg' },
  'wellness-1': { zh: '/images/gallery/room-hbot.jpg', en: '/images/gallery/room-hbot.jpg' }, // the clinic's own HBOT room (no faces)
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

// IV drips: the clinic's own NAD+ drip photo for the Chinese site (full / arm & line / woman). English keeps its Western photos.
const ivDrips = categories.find((c) => c.slug === 'iv-therapy')
ivDrips.cover.zh = '/images/treatments/zh/nad2-full.jpg'
const IV_PHOTOS = ['nad2-full', 'nad2-arm', 'nad2-woman'].map((n) => `/images/treatments/zh/${n}.jpg`)
ivDrips.treatments.forEach((x, i) => {
  x.image = { ...x.image, zh: IV_PHOTOS[i % IV_PHOTOS.length] }
})

// Skincare: the clinic's own facial-mask photo for the Chinese site. The Japanese face-slimming card keeps its poster.
const skincare = categories.find((c) => c.slug === 'skincare-experts')
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
  { src: '/images/gallery/outside-2.jpg', caption: { en: 'Clinic exterior', zh: '门店外观' } },
  { src: '/images/gallery/sign-night.jpg', caption: { en: 'Signage at night', zh: '夜间招牌' } },
  { src: '/images/gallery/indoor-logo.jpg', caption: { en: 'Reception', zh: '接待区' } },
  { src: '/images/gallery/front-1.jpg', caption: { en: 'Front desk', zh: '前台' } },
  { src: '/images/gallery/front-2.jpg', caption: { en: 'Front desk', zh: '前台' } },
  { src: '/images/gallery/front-3.jpg', caption: { en: 'Reception area', zh: '接待区' } },
  { src: '/images/gallery/lobby.jpg', caption: { en: 'Lobby', zh: '大厅' } },
  { src: '/images/gallery/hallway.jpg', caption: { en: 'Hallway', zh: '走廊' } },
  { src: '/images/gallery/consult-room.jpg', caption: { en: 'Consultation room', zh: '咨询室' } },
  { src: '/images/gallery/room-1.jpg', caption: { en: 'Treatment room', zh: '疗程室' } },
  { src: '/images/gallery/room-2.jpg', caption: { en: 'Treatment room', zh: '疗程室' } },
  { src: '/images/gallery/room-3.jpg', caption: { en: 'Treatment room', zh: '疗程室' } },
  { src: '/images/gallery/room-4.jpg', caption: { en: 'Treatment room', zh: '疗程室' } },
  { src: '/images/gallery/nana-room.jpg', caption: { en: 'Treatment room', zh: '疗程室' } },
  { src: '/images/gallery/room-hbot.jpg', caption: { en: 'Hyperbaric oxygen room', zh: '高压氧舱室' } },
  { src: '/images/gallery/shine-class-1.jpg', caption: { en: 'Shine class', zh: 'Shine 课程' } },
  { src: '/images/gallery/shine-class-3.jpg', caption: { en: 'Shine class', zh: 'Shine 课程' } },
]

// Before & after photos copied from the old site (stored in /public/images/before-after).
export const beforeAfterPhotos = Array.from({ length: 13 }, (_, i) => ({
  src: `/images/before-after/ba-${String(i + 1).padStart(2, '0')}.jpg`,
  caption: { en: 'Before & After', zh: '前后对比' },
}))
