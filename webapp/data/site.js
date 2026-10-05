// Business details. Hours follow the original Contact page; the original home page
// lists "10am–6pm, by appointment" — confirm with the clinic which is current.
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
    { day: { en: 'Monday – Friday', zh: '周一至周五' }, time: { en: '9:00 am – 7:00 pm', zh: '上午 9:00 – 晚上 7:00' } },
    { day: { en: 'Saturday', zh: '周六' }, time: { en: 'By appointment', zh: '需预约' } },
    { day: { en: 'Sunday', zh: '周日' }, time: { en: 'Closed', zh: '休息' } },
  ],
  holidayNote: { en: 'Closed on major holidays.', zh: '重大节日休息。' },
}

// Images are served from the clinic's existing site CDN. Swap for local files in
// /public when migrating off the old host.
const IMG = 'https://img1.wsimg.com/isteam/ip/56343825-34d1-4d56-b3a5-ef3f09046a86/'
const img = (file, w = 900) => `${IMG}${file}/:/rs=w:${w},cg:true,m`

export const logoImage = img('blob-8248bf2.png', 600)
export const heroImage = '/images/hero-main.png'

export const categories = [
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
    cover: img('Botox%20Ad.jpg'),
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
    cover: img('Thermage%20flx%205th.jpg'),
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
    cover: img('PRP%20Hair%20Restoration-cf4ad73.jpg'),
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
    cover: img('Emsculpt_POST_July-Calendar_13072020_EN100_LI.png'),
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
    cover: img('Oxyair.jpg'),
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
    cover: img('Image_20230810232053.jpg'),
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
    cover: img('Hormone%20Level.png'),
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
    slug: 'spa',
    group: 'medical',
    icon: 'Flower2',
    name: { en: 'Cosmetic Spa', zh: '生活 Spa' },
    short: { en: 'Hydrating facials, microdermabrasion and body care.', zh: '补水面部护理、钻石微晶磨皮与身体护理。' },
    intro: {
      en: 'Restorative facials and body treatments for skin that looks — and feels — its healthiest.',
      zh: '修护型面部与身体护理，让肌肤由内而外焕发健康光彩。',
    },
    cover: img('skin%20treat.jpg'),
    treatments: [
      {
        name: { en: 'Facial Skin Care', zh: '面部皮肤护理' },
        image: img('skin%20treat.jpg'),
        body: {
          en: 'Hydration facials, diamond microdermabrasion and deep-pore detox to cleanse and nourish; IPL photofacials and brightening treatments to even tone.',
          zh: '补水护理、钻石微晶磨皮与深层毛孔排毒，深层清洁滋养；光子嫩肤与美白护理，均匀肤色。',
        },
      },
      {
        name: { en: 'Body Care', zh: '身体护理' },
        image: 'https://img1.wsimg.com/isteam/stock/RyAeNQo/:/rs=w:900,cg:true,m',
        body: {
          en: 'Exfoliating and renewing body treatments for smoother, revitalized skin from head to toe.',
          zh: '去角质与焕新身体护理，令全身肌肤柔滑焕活。',
        },
      },
    ],
  },
  {
    slug: 'microblading',
    group: 'medical',
    icon: 'PenTool',
    name: { en: 'Microblading', zh: '半永久纹绣' },
    short: { en: 'Natural feather-stroke brows and eyeliner by a certified artist.', zh: '认证纹绣师打造自然羽毛眉与眼线。' },
    intro: {
      en: 'Semi-permanent makeup takes both precise technique and a strong aesthetic eye. Wake up with brows designed for your face.',
      zh: '半永久纹绣需要精准技术与出色审美。每天醒来，都拥有专属于您的眉形。',
    },
    cover: img('Coco%20Zhu.jpg'),
    artist: {
      name: 'Coco Zhu',
      image: img('Coco%20Zhu.jpg', 700),
      bio: {
        en: 'Coco is a registered member of the Beauty Council and the Society of Permanent Cosmetic Professionals, with 8+ years in makeup and cosmetic design. She specializes in feather-stroke brows and eyeliner that look naturally yours.',
        zh: 'Coco 是美容委员会及永久美容专业人士协会注册会员，拥有超过八年的化妆与纹绣设计经验，专注于羽毛笔触眉与眼线，打造自然妆效。',
      },
    },
    treatments: [
      {
        name: { en: 'Feather-Stroke Brows', zh: '羽毛笔触眉' },
        body: { en: 'Hair-like strokes that build natural shape and fullness.', zh: '仿真毛发笔触，自然塑形、增加浓密度。' },
      },
      {
        name: { en: 'Semi-Permanent Eyeliner', zh: '半永久眼线' },
        body: { en: 'Subtle definition that lasts — no smudging, no daily routine.', zh: '持久自然的眼部轮廓，不晕染、免日常化妆。' },
      },
    ],
  },
  {
    slug: 'skincare-experts',
    group: 'skincare',
    icon: 'Sparkles',
    name: { en: 'Skincare Experts', zh: '护肤专家' },
    short: { en: 'Professional facials, gentle hand sculpting and targeted skin care.', zh: '专业面部护理、徒手轮廓与针对性肌肤护理。' },
    intro: {
      en: 'Hands-on facial care from our skincare specialists — cleansing, hydration, repair and contouring tailored to your skin.',
      zh: '护肤专家亲手呵护——清洁、补水、修复与轮廓管理，依肤质量身定制。',
    },
    cover: img('skin%20treat.jpg'),
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
          en: "A hands-on technique inspired by Japanese facial massage. Firm yet relaxing movements release muscle tension, encourage circulation and lymphatic drainage, and help the face look more defined and less puffy — no needles, no devices.",
          zh: "源自日式面部按摩的徒手技法。以扎实而放松的手法释放肌肉紧张、促进循环与淋巴引流，让脸部线条更分明、浮肿感减少——无针、无仪器。"
        },
        bullets: {
          en: [
            "Less puffiness and facial tension",
            "Better-defined jawline and cheeks",
            "Brighter, smoother-looking skin",
            "Deep relaxation"
          ],
          zh: [
            "减轻浮肿与面部紧绷",
            "下颌线与面颊轮廓更分明",
            "肤色更透亮、质地更细腻",
            "深度放松"
          ]
        },
        steps: {
          en: [
            "Consultation to assess face shape, muscle tension and skin type",
            "Deep massage and lymphatic drainage",
            "Contour sculpting along the jaw, cheeks and eye area",
            "Finishing skin care matched to your skin — cleansing, hydration or brightening"
          ],
          zh: [
            "咨询并评估脸型、肌肉紧张度与肤质",
            "深层按摩与淋巴引流",
            "针对下颌、面颊与眼周的轮廓塑形",
            "依肤质搭配收尾护理——清洁、补水或提亮"
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
              en: "Puffy, tense or tired-looking faces; a pre-event refresh",
              zh: "浮肿、紧绷或疲惫的脸部；重要场合前的焕颜"
            }
          },
          {
            label: {
              en: "Good to know",
              zh: "温馨提示"
            },
            value: {
              en: "Effects are temporary; regular sessions help maintain them.",
              zh: "效果为暂时性，定期护理有助维持。"
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
              zh: "如需更明显的提拉，可咨询医美疗程中的热玛吉或童颜线。"
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
              zh: "发炎或囊肿型痘痘，可咨询医美疗程中的 AviClear 祛痘激光。"
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
    short: { en: 'Classic, hybrid and volume lashes with regular fills.', zh: '经典、混合与浓密款睫毛嫁接，定期补睫。' },
    intro: {
      en: 'Wake up with fuller, more defined eyes. Choose a natural classic set or a dramatic volume set — all designed around your eye shape.',
      zh: '拥有更浓密、更有神的双眼。无论是自然经典款还是华丽浓密款，都依您的眼型量身设计。',
    },
    cover: '/images/gallery/room-2.jpg',
    treatments: [
      {
        id: "classic-lashes",
        name: {
          en: "Classic Lashes",
          zh: "经典单根睫毛嫁接"
        },
        short: {
          en: "One extension per natural lash — subtle and natural.",
          zh: "一根嫁接对一根自然睫毛，自然清新。"
        },
        body: {
          en: "The most natural option: one lightweight extension is applied to one natural lash, adding length and definition without heaviness. Ideal if you want a soft, mascara-like look.",
          zh: "最自然的选择：一根轻盈的嫁接睫毛对应一根自然睫毛，增加长度与眼部轮廓而不厚重，呈现柔和的睫毛膏效果。"
        },
        bullets: {
          en: [
            "Subtle, natural enhancement",
            "Adds length and curl",
            "Great for first-timers",
            "Lightweight and comfortable"
          ],
          zh: [
            "自然低调的提升",
            "增加长度与卷翘",
            "适合初次尝试",
            "轻盈舒适"
          ]
        },
        steps: {
          en: [
            "Consultation on length, curl and style",
            "Eyes cleansed and lower lashes protected",
            "Each natural lash is isolated and an extension is applied",
            "Final check and aftercare guidance"
          ],
          zh: [
            "咨询长度、卷翘与风格",
            "清洁眼周并保护下睫毛",
            "逐根分离自然睫毛并嫁接",
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
              en: "About 1.5–2× fuller",
              zh: "约 1.5–2 倍浓密度"
            }
          },
          {
            label: {
              en: "Wear time",
              zh: "维持时间"
            },
            value: {
              en: "Up to about 6 weeks with fills",
              zh: "搭配补睫，最长约 6 周"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "A natural, everyday look",
              zh: "自然日常妆感"
            }
          }
        ]
      },
      {
        id: "hybrid-lashes",
        name: {
          en: "Hybrid Lashes",
          zh: "混合款睫毛嫁接"
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
        id: "volume-lashes",
        name: {
          en: "Volume Lashes",
          zh: "浓密款睫毛嫁接"
        },
        short: {
          en: "Handmade fans for maximum fullness and drama.",
          zh: "手工花型，打造浓密立体的睫毛。"
        },
        body: {
          en: "Several ultra-light extensions are fanned and applied to a single natural lash, creating a dense, dramatic, fluffy look — without weighing down your natural lashes.",
          zh: "将多根超轻睫毛手工制成花型，嫁接于一根自然睫毛上，呈现浓密、立体、蓬松的效果，不会增加自然睫毛负担。"
        },
        bullets: {
          en: [
            "Dense, dramatic fullness",
            "Ultra-light fans",
            "Great for sparse lashes",
            "Bold, glamorous finish"
          ],
          zh: [
            "浓密立体的效果",
            "超轻花型",
            "适合稀疏睫毛",
            "华丽吸睛"
          ]
        },
        steps: {
          en: [
            "Consultation and style selection",
            "Eyes cleansed and prepared",
            "Handmade fans applied to individual natural lashes",
            "Final check and aftercare guidance"
          ],
          zh: [
            "咨询并选择风格",
            "清洁并准备眼周",
            "手工花型嫁接于单根自然睫毛",
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
              en: "About 3–5× fuller",
              zh: "约 3–5 倍浓密度"
            }
          },
          {
            label: {
              en: "Wear time",
              zh: "维持时间"
            },
            value: {
              en: "Typically 4–7 weeks with fills",
              zh: "搭配补睫，通常 4–7 周"
            }
          },
          {
            label: {
              en: "Best for",
              zh: "适合"
            },
            value: {
              en: "Special occasions or a bold everyday look",
              zh: "重要场合或浓密日常妆感"
            }
          }
        ]
      },
      {
        id: "lash-fills",
        name: {
          en: "Lash Fills & Aftercare",
          zh: "补睫与护理"
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
    cover: '/images/gallery/room-3.jpg',
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
              zh: "可搭配医美疗程中的 PRP 或 HydraFacial Keravive。"
            }
          }
        ]
      }
    ],
  },
]

export const getCategory = (slug) => categories.find((c) => c.slug === slug)

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
