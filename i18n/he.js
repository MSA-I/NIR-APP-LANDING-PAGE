// Hebrew — the source locale. en and fr mirror this shape exactly.
//
// Every FIGURE below is read off a real capture of the running product in
// lab/app-reference. Nothing is invented, and the arithmetic is checkable:
//
//   order  #24  בשר והבן שיווק בשרים   2,884.50   (office-orders.png)
//   invoice 7702 בשר והבן שיווק בשרים   4,720.00   (office-invoices.png, דורשת בירור)
//   4,720.00 − 2,884.50                = 1,835.50  the gap the product stops
//
//   13 משימות פתוחות · 17,825 ₪ חשבוניות פתוחות · 6 דורש טיפול היום
//                                              (owner-dashboard.png)
//   invoice 2088 נקי וזוהר 1,062.00, מאושרת, שולמה חלקית — the twelfth document

export default {
  code: 'he',
  dir: 'rtl',
  htmlLang: 'he',
  path: '',

  title: 'InPlace — רכש, חשבוניות ותשלומים במקום אחד',
  description:
    'מערכת שליטה מרכש עד תשלום, בעברית מלאה. מסך אחד שאומר מה דורש טיפול היום, מה עלול לעלות כסף, ומה מצב העסק עכשיו.',

  skip: 'דילוג לפעולה',
  mapLabel: 'מפת המסע',
  langsLabel: 'שפות',
  noscript:
    'הדף הזה בנוי כחוויית גלילה. גם בלי JavaScript אפשר לקרוא את מה שהמוצר עושה ולפתוח חשבון.',

  map: ['ערימה', 'פערים', 'האור', 'בקרה', 'המסע', 'חשבוניות', 'חריגה', 'תשלום', 'סגירה'],

  ctaPrimary: 'פתיחת חשבון חינם',
  ctaPrimaryHref: 'https://app.inplace.digital/signup',
  ctaSecondary: 'תיאום דמו',
  ctaSecondaryHref: 'https://inplace.digital/demo',
  fineprint: 'בלי כרטיס אשראי. אפשר להתחיל מספק אחד.',

  doc: {
    label: 'מסמך שנוסע איתך',
    kind: 'חשבונית 2088',
    supplier: 'נקי וזוהר',
    amount: '1,062.00 ₪',
    states: [
      { text: 'בערימה',            tone: 'idle'  },
      { text: 'לא הושוותה',        tone: 'alert' },
      { text: 'נסרקה',             tone: 'idle'  },
      { text: 'נקלטה למערכת',      tone: 'idle'  },
      { text: 'שויכה להזמנה',      tone: 'idle'  },
      { text: 'קיבלה שורה',        tone: 'done'  },
      { text: 'נבדקה מול ההזמנה',  tone: 'done'  },
      { text: 'אושרה לתשלום',      tone: 'done'  },
      { text: 'שולמה חלקית',       tone: 'done'  },
    ],
  },

  copy: [
    {
      win: '0 0.088 0 0.40', at: 'ip-at-start',
      h1: 'העסק שלך עומד על&nbsp;ערימה',
      lede: 'הזמנות, תעודות משלוח וחשבוניות — כל אחת במקום אחר, כל אחת בזמן אחר. מה שנופל מהערימה מתגלה בסוף החודש.',
    },
    {
      win: '0.098 0.198 0.18 0.18', at: 'ip-at-end',
      h2: 'שלושה מספרים, עסקה&nbsp;אחת',
      lede: 'ההזמנה לספק אמרה <strong class="ip-num">2,884.50 ₪</strong>. החשבונית שהגיעה ביקשה <strong class="ip-num ip-alert">4,720.00 ₪</strong>. אף אחד לא השווה ביניהן.',
    },
    {
      win: '0.205 0.292 0.18 0.18', at: 'ip-at-middle',
      line: 'יש דרך אחת לסדר את זה: מקום מוגדר לכל&nbsp;דבר.',
    },
    {
      win: '0.300 0.410 0.18 0.18', at: 'ip-at-start',
      kicker: 'מרכז הבקרה',
      h2: 'מה דורש טיפול&nbsp;היום',
      lede: '<strong class="ip-num">13</strong> משימות פתוחות בכל התורים, <strong class="ip-num">17,825 ₪</strong> בחשבוניות פתוחות, ושש התראות שמחכות להחלטה. הכול על מסך אחד, בלי לחפש.',
    },
    {
      win: '0.420 0.530 0.18 0.18', at: 'ip-at-end',
      h2: 'כל המסע במקום&nbsp;אחד',
      lede: 'ספקים ומחירונים, הזמנות רכש, קבלת סחורה, חשבוניות וזיכויים, דרישות תשלום, תשלום והתאמות בנק. שרשרת אחת שלא יוצאת החוצה.',
    },
    {
      win: '0.545 0.645 0.18 0.18', at: 'ip-at-middle',
      h2: 'הנייר הופך למערכת',
      lede: 'כל מסמך שנכנס מקבל שורה, סטטוס, וקשר להזמנה שממנה הגיע.',
    },
    {
      win: '0.712 0.797 0.18 0.18', at: 'ip-at-start',
      h2: 'החריגה מוצאת את&nbsp;עצמה',
      lede: 'המערכת משווה הזמנה, קבלה וחשבונית. פער של <strong class="ip-num ip-alert">1,835.50 ₪</strong> אצל אותו ספק לא ממשיך הלאה — הוא מסומן ומחכה להחלטה.',
    },
    {
      win: '0.806 0.890 0.18 0.18', at: 'ip-at-end',
      h2: 'הכסף עובר פעם&nbsp;אחת',
      lede: 'דרישת תשלום מאושרת, רואה החשבון מבצע, האסמכתה נשמרת, והשורה נסגרת מול הבנק. הפרדת סמכויות מלאה, ותיעוד לכל פעולה.',
    },
    {
      win: 'finale', at: 'ip-at-crown',
      h2: 'הכול במקום.',
      lede: 'והצעד הבא ברור.',
    },
  ],
}
