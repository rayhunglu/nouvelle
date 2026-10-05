// Product details are general brand information gathered from public sources.
// Confirm with the clinic exactly which products and sizes it stocks before launch.
export const brands = [
{
    slug: 'cellcosmet',
    short: { en: 'Swiss cellular skincare', zh: '瑞士细胞活肤护肤' },
    name: { en: 'Cellcosmet (瑞妍)', zh: '瑞妍 Cellcosmet' },
    tagline: { en: 'Swiss cellular skincare', zh: '瑞士细胞活肤护肤' },
    intro: {
      en: 'Cellcosmet is a Swiss premium skincare brand developed in a biological research laboratory with biologists, pathologists and dermatologists. Its formulas are built around stabilised cellular extracts, aimed at revitalising mature skin, boosting hydration and supporting firmness.',
      zh: '瑞妍（Cellcosmet）是源自瑞士生物细胞实验中心的高端护肤品牌，由生物学家、病理学家与皮肤科医师共同研发。配方以稳定化的细胞精粹为核心，针对成熟肌肤的赋活、保湿与紧致。',
    },
    highlights: [
      {
        title: { en: 'Cellular extracts', zh: '细胞精粹' },
        body: { en: 'Biotech-derived cellular extracts kept stable with the brand’s CellControl™ method to preserve their activity.', zh: '以生物科技萃取的细胞精粹，并通过 CellControl™ 方法保持活性稳定。' },
      },
      {
        title: { en: 'Doctor-trusted', zh: '医师认可' },
        body: { en: 'Developed with dermatologists and recognised by plastic-surgery and skin specialists.', zh: '与皮肤科医师共同研发，获整形外科与皮肤科医师认同。' },
      },
      {
        title: { en: 'Made in Switzerland', zh: '瑞士制造' },
        body: { en: 'Formulated and manufactured in Switzerland, with a women’s line and a men’s line (Cellmen).', zh: '于瑞士研发与制造，设有女士系列与男士系列（Cellmen）。' },
      },
    ],
    products: [
    {
      id: 'cell-lift-serum',
      name: { en: 'CellLift Serum', zh: 'CellLift 提拉精华' },
      line: { en: 'CellEctive · for mature skin', zh: 'CellEctive · 成熟肌肤' },
      body: {
        en: 'A golden serum with CytoPep™ cellular extracts that smooths the look of skin right away and helps firm it, leaving a radiant finish.',
        zh: '含 CytoPep™ 细胞精粹的金色精华，即时抚平肌肤纹路观感，帮助紧致，使肌肤焕发光泽。',
      },
      points: { en: ['Immediate smoothing effect', 'Firming and radiance', 'Lightweight golden fluid'], zh: ['即时平滑效果', '紧致与光泽', '轻盈金色质地'] },
    },
    {
      id: 'ultra-vital-cream',
      name: { en: 'Ultra Vital Cream (CellVital)', zh: 'Ultra Vital 活力护理霜' },
      line: { en: 'Day & night cellular cream', zh: '日夜两用细胞霜' },
      body: {
        en: 'The brand’s signature cream for day and night, rich yet smooth, to hydrate, firm and plump skin while supporting the skin barrier. Packaged in a patented square jar to protect the formula.',
        zh: '品牌代表性的日夜两用面霜，质地丰润细滑，补水、紧致、饱满肌肤并强化屏障，采用专利方形瓶身保护配方。',
      },
      points: { en: ['Deep hydration', 'Firmness and plumpness', 'Supports the skin barrier'], zh: ['深层保湿', '紧致饱满', '强化肌肤屏障'] },
    },
    {
      id: 'ultracell-intensive',
      name: { en: 'UltraCell Intensive Programme', zh: 'UltraCell 密集焕肤疗程' },
      line: { en: 'Intensive ampoule programme', zh: '安瓶密集疗程' },
      body: {
        en: 'A concentrated ampoule regimen built on CytoPep™, designed for a 24-day programme to deliver deeper hydration and skin that looks firmer and more elastic.',
        zh: '以 CytoPep™ 为核心的浓缩安瓶疗程，设计为 24 天使用，带来更深层的保湿，让肌肤更紧致、更有弹性。',
      },
      points: { en: ['24-day programme', 'Concentrated ampoules', 'Hydration and elasticity'], zh: ['24 天疗程', '浓缩安瓶', '保湿与弹性'] },
    },
    {
      id: 'collagen-set',
      name: { en: 'Gold Collagen Set', zh: '金纯奢活胶原套装' },
      line: { en: 'Collagen concentrate + mask', zh: '胶原浓缩液 + 面膜' },
      body: {
        en: 'A collagen concentrate paired with a collagen mask, aimed at relaxing the skin and visibly reshaping facial contours.',
        zh: '胶原浓缩液搭配胶原面膜，帮助放松肌肤并改善轮廓线条观感。',
      },
      points: { en: ['Collagen concentrate', 'Collagen mask', 'Contour-focused care'], zh: ['胶原浓缩液', '胶原面膜', '轮廓护理'] },
    },
    {
      id: 'gold-vital-cream',
      name: { en: 'Gold Vital Care Cream', zh: '活力金纯护理霜' },
      line: { en: 'High-concentration care cream', zh: '高浓度护理霜' },
      body: {
        en: 'A rich, silky cream with a high concentration of bioactive molecules to boost moisture, firmness and plumpness.',
        zh: '质地丰润细滑，含高浓度生物活性分子，强化肌肤滋润、紧致与饱满。',
      },
      points: { en: ['High bioactive concentration', 'Moisture and firmness', 'Rich, silky texture'], zh: ['高浓度活性分子', '保湿与紧致', '丰润细滑质地'] },
    },
    {
      id: 'cellmen',
      name: { en: 'Cellmen', zh: 'Cellmen 男士系列' },
      line: { en: 'Men’s line', zh: '男士系列' },
      body: {
        en: 'Cellular skincare tailored to men’s skin, including the Cellmen Face Ultra cream.',
        zh: '专为男性肌肤设计的细胞护肤系列，包含 Cellmen Face Ultra 面霜。',
      },
      points: { en: ['Made for men’s skin', 'Face Ultra cream', 'Same Swiss cellular science'], zh: ['专为男性肌肤', 'Face Ultra 面霜', '同样的瑞士细胞科技'] },
    },
  ]
  },
  {
    slug: 'skinceuticals',
    short: { en: 'Medical-grade skincare', zh: '医学级护肤' },
    name: { en: 'SkinCeuticals (修丽可)', zh: '修丽可 SkinCeuticals' },
    tagline: { en: 'Medical-grade skincare', zh: '医学级护肤' },
    intro: {
      en: 'SkinCeuticals is a professional skincare brand known for science-led, antioxidant-rich formulas. Its philosophy is simple: Prevent, Correct, Protect — and it is the same line we use in our SkinCeuticals facials.',
      zh: '修丽可（SkinCeuticals）是以科学配方著称的专业护肤品牌，主张「预防、修正、保护」三步护理，也是我们修丽可面部护理所使用的品牌。',
    },
    highlights: [
      {
        title: { en: 'Prevent', zh: '预防' },
        body: { en: 'Daily antioxidant protection helps shield skin from pollution, sun and everyday environmental stress.', zh: '每日抗氧化防护，帮助抵御污染、紫外线与日常环境压力。' },
      },
      {
        title: { en: 'Correct', zh: '修正' },
        body: { en: 'Targeted treatments for fine lines, tone and texture, such as retinol and niacinamide formulas.', zh: '针对细纹、肤色与质地的修正护理，如 A 醇与烟酰胺配方。' },
      },
      {
        title: { en: 'Protect', zh: '保护' },
        body: { en: 'Barrier-supporting hydration and daily sun protection to keep results lasting.', zh: '强化屏障的保湿与每日防晒，让效果持久。' },
      },
    ],
    products: [
      {
        id: 'ce-ferulic',
        name: { en: 'C E Ferulic', zh: 'C E Ferulic 抗氧化精华' },
        line: { en: 'Antioxidant vitamin C serum', zh: '抗氧化维C精华' },
        body: { en: "SkinCeuticals’ best-known serum, combining 15% pure vitamin C (L-ascorbic acid), 1% vitamin E and 0.5% ferulic acid. A daytime antioxidant that helps protect against environmental damage while brightening the complexion and improving the look of fine lines and firmness.", zh: 'SkinCeuticals 最具代表性的精华，含 15% 纯维生素 C（左旋维 C）、1% 维生素 E 与 0.5% 阿魏酸。白天使用的抗氧化精华，帮助抵御环境伤害，提亮肤色，改善细纹与紧致度观感。' },
        points: { en: ['15% L-ascorbic acid + vitamin E + ferulic acid','Daytime environmental protection','Brightens and smooths the look of skin'], zh: ['15% 左旋维 C + 维 E + 阿魏酸','日间环境防护','提亮并平滑肌肤观感'] },
      },
      {
        id: 'hydrating-b5',
        name: { en: 'Hydrating B5 Gel', zh: 'Hydrating B5 保湿凝胶' },
        line: { en: 'Hydrating gel', zh: '保湿凝胶' },
        body: { en: "A lightweight, water-based hydrating gel with hyaluronic acid and vitamin B5, used to draw moisture into the skin and leave it plump and comfortable. Suits all skin types and layers well under other products.", zh: '轻盈水感保湿凝胶，含玻尿酸与维生素 B5，帮助锁住水分，让肌肤饱满舒适。适合各种肤质，也方便与其他产品叠加使用。' },
        points: { en: ['Hyaluronic acid + vitamin B5','Lightweight, non-greasy','Good for dehydrated skin'], zh: ['玻尿酸 + 维生素 B5','轻盈不油腻','适合缺水肌肤'] },
      },
      {
        id: 'ha-intensifier',
        name: { en: 'H.A. Intensifier', zh: 'H.A. Intensifier 玻尿酸强化精华' },
        line: { en: 'Hyaluronic acid serum', zh: '玻尿酸精华' },
        body: { en: "A hyaluronic-acid–boosting serum that helps skin hold more moisture, aiming for a smoother, plumper look and a more even-looking texture over time.", zh: '玻尿酸强化精华，帮助肌肤保留更多水分，随时间让肌肤更平滑、饱满，质地更均匀。' },
        points: { en: ['Boosts the skin’s hyaluronic acid','Plumper-looking skin','Layers with vitamin C and retinol'], zh: ['强化肌肤自身玻尿酸','肌肤更显饱满','可与维 C、A 醇叠加'] },
      },
      {
        id: 'triple-lipid-restore',
        name: { en: 'Triple Lipid Restore 2:4:2', zh: 'Triple Lipid Restore 2:4:2 三重脂质修护霜' },
        line: { en: 'Lipid-rich anti-aging cream', zh: '脂质修护霜' },
        body: { en: "A rich cream built on a 2:4:2 ratio of ceramides, cholesterol and fatty acids to support the skin barrier. A good fit for dry, stressed or irritated skin and for improving the look of firmness.", zh: '以神经酰胺、胆固醇与脂肪酸 2:4:2 比例打造的丰润面霜，帮助支撑肌肤屏障。适合干燥、受压或刺激后的肌肤，并改善紧致度观感。' },
        points: { en: ['Ceramides, cholesterol and fatty acids','Supports a stressed skin barrier','Firmer, more comfortable skin'], zh: ['神经酰胺、胆固醇与脂肪酸','支撑受损屏障','更紧致、更舒适'] },
      },
      {
        id: 'retinol-03',
        name: { en: 'Retinol 0.3', zh: 'Retinol 0.3 A醇夜间精华' },
        line: { en: 'Night retinol treatment', zh: '夜间 A 醇' },
        body: { en: "A pure retinol night treatment that helps refine texture, fine lines and uneven tone. Typically started a few nights a week and increased as skin adjusts, always with daily sunscreen.", zh: '纯 A 醇夜间护理，帮助细致肤质、淡化细纹与不均肤色。通常先每周使用数晚，待肌肤适应后再增加，并需每日防晒。' },
        points: { en: ['Refines texture and fine lines','Evens the look of tone','Night use, with daily sunscreen'], zh: ['细致肤质与细纹','均匀肤色观感','夜间使用，需每日防晒'] },
      },
      {
        id: 'metacell-b3',
        name: { en: 'Metacell Renewal B3', zh: 'Metacell Renewal B3 烟酰胺焕活霜' },
        line: { en: 'Niacinamide renewal treatment', zh: '烟酰胺焕活霜' },
        body: { en: "A niacinamide-based treatment that helps skin retain moisture, supporting firmness and the look of fine lines. In clinical testing it was reported to improve radiance by 15% and the look of fine lines by 20.9%. Can be used with vitamin C and retinol.", zh: '以烟酰胺为核心的焕活护理，帮助肌肤保水，提升紧致与细纹观感。临床测试显示光泽度改善 15%，细纹观感改善 20.9%。可与维 C、A 醇搭配使用。' },
        points: { en: ['Improves moisture retention','Radiance and fine-line support','Works with vitamin C and retinol'], zh: ['提升保水力','光泽与细纹护理','可搭配维 C、A 醇'] },
      },
      {
        id: 'phyto-corrective',
        name: { en: 'Phyto Corrective Gel', zh: 'Phyto Corrective 舒缓凝胶' },
        line: { en: 'Soothing hydrating gel', zh: '舒缓凝胶' },
        body: { en: "A botanical-based soothing gel that hydrates and helps calm the look of redness and irritation, especially for sensitive or post-procedure skin.", zh: '植物萃取舒缓凝胶，补水并帮助平复泛红与刺激感，尤其适合敏感肌或医美术后肌肤。' },
        points: { en: ['Calms the look of redness','Hydrating and light','Suits sensitive skin'], zh: ['舒缓泛红观感','补水轻盈','适合敏感肌'] },
      }
    ],
  }
]

export const getBrand = (slug) => brands.find((b) => b.slug === slug)
