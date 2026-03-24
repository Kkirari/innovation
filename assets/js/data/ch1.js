/* =====================================================
   CHAPTER 1 DATA — assets/js/data/ch1.js
   แก้ไขไฟล์นี้เพื่อเปลี่ยนเนื้อหาบทที่ 1
   ===================================================== */
const CHAPTER_DATA = {
  chapterNum: 1,
  chapterLabel: '🚆 บทที่ 1',
  titleZh: '飞机比火车快',
  titleTh: 'เครื่องบินเร็วกว่ารถไฟ',
  introBanner: ['✈️', '⚡', '🚆', '📏', '✏️'],
  vocab: [
    { zh: '高',   py: 'gāo',    th: 'สูง',         img: 'sec1/tall.jpg' },
    { zh: '矮',   py: 'ǎi',     th: 'เตี้ย',        img: 'sec1/short_height.jpg' },
    { zh: '火车', py: 'huǒchē', th: 'รถไฟ',         img: 'sec1/train.jpg' },
    { zh: '快',   py: 'kuài',   th: 'เร็ว',         img: 'sec1/fast.jpg' },
    { zh: '慢',   py: 'màn',    th: 'ช้า',          img: 'sec1/slow.jpg' },
    { zh: '飞机', py: 'fēijī',  th: 'เครื่องบิน',   img: 'sec1/airplane.jpg' },
    { zh: '尺子', py: 'chǐzi',  th: 'ไม้บรรทัด',    img: 'sec1/ruler.jpg' },
    { zh: '铅笔', py: 'qiānbǐ', th: 'ดินสอ',        img: 'sec1/pencil.jpg' },
    { zh: '长',   py: 'cháng',  th: 'ยาว',          img: 'sec1/long.jpg' },
    { zh: '短',   py: 'duǎn',   th: 'สั้น',         img: 'sec1/short.jpg' },
    { zh: '衣服', py: 'yīfu',   th: 'เสื้อผ้า',     img: 'sec1/clothes.jpg' },
    { zh: '旧',   py: 'jiù',    th: 'เก่า',         img: 'sec1/old.png' },
    { zh: '新',   py: 'xīn',    th: 'ใหม่',         img: 'sec1/new.png' },
    { zh: '甜',   py: 'tián',   th: 'หวาน',         img: 'sec1/sweet.jpg' },
    { zh: '酸',   py: 'suān',   th: 'เปรี้ยว',       img: 'sec1/sour.jpg' },
    { zh: '比',   py: 'bǐ',     th: 'กว่า (คำศัพท์พิเศษ)', img: 'sec1/compare.jpg' }
  ],
  grammar: [
    { zh: '姐姐比妹妹高', py: 'jiějiě bǐ mèimei gāo', th: 'พี่สาวสูงกว่าน้องสาว', roles: ['姐姐', '妹妹'] },
    { zh: '妹妹比姐姐矮', py: 'mèimei bǐ jiějiě ǎi', th: 'น้องสาวเตี้ยกว่าพี่สาว', roles: ['妹妹', '姐姐'] },
    { zh: '飞机比火车快', py: 'fēijī bǐ huǒchē kuài', th: 'เครื่องบินเร็วกว่ารถไฟ', roles: ['飞机', '火车'] },
    { zh: '火车比飞机慢', py: 'huǒchē bǐ fēijī màn', th: 'รถไฟช้ากว่าเครื่องบิน', roles: ['火车', '飞机'] },
    { zh: '红苹果比绿苹果甜', py: 'hóng píngguǒ bǐ lǜ píngguǒ tián', th: 'แอปเปิ้ลแดงหวานกว่าแอปเปิ้ลเขียว', roles: ['红苹果', '绿苹果'] },
    { zh: '绿苹果比红苹果酸', py: 'lǜ píngguǒ bǐ hóng píngguǒ suān', th: 'แอปเปิ้ลเขียวเปรี้ยวกว่าแอปเปิ้ลแดง', roles: ['绿苹果', '红苹果'] },
    { zh: '这件衣服比那件衣服新', py: 'zhè jiàn yīfu bǐ nà jiàn yīfu xīn', th: 'เสื้อตัวนี้ใหม่กว่าเสื้อตัวนั้น', roles: ['这件衣服', '那件衣服'] },
    { zh: '那件衣服比这件衣服旧', py: 'nà jiàn yīfu bǐ zhè jiàn yīfu jiù', th: 'เสื้อตัวนั้นเก่ากว่าเสื้อตัวนี้', roles: ['那件衣服', '这件衣服'] }
  ]
};
