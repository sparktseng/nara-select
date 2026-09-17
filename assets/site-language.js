(() => {
  'use strict';

  const supported = ['zh-Hant', 'en', 'th', 'vi', 'id', 'ja'];
  const normalise = value => {
    const code = String(value || '').toLowerCase();
    if (code.startsWith('zh')) return 'zh-Hant';
    return supported.find(item => item.toLowerCase() === code || code.startsWith(`${item.toLowerCase()}-`)) || null;
  };
  const detect = () => {
    for (const value of (navigator.languages?.length ? navigator.languages : [navigator.language || 'en'])) {
      const found = normalise(value);
      if (found) return found;
    }
    return 'en';
  };
  const queryLanguage = normalise(new URLSearchParams(location.search).get('lang'));
  let language = queryLanguage || normalise(localStorage.getItem('nara-language')) || detect();

  const common = {
    'zh-Hant': { home: '← 回首頁 HOME', maps: 'Google Maps 導航', line: 'LINE 詢問', access: '交通與停車資訊', instagram: 'Instagram', language: '🌐 LANGUAGE' },
    en: { home: '← Home', maps: 'Google Maps directions', line: 'Ask on LINE', access: 'Directions & parking', instagram: 'Instagram', language: '🌐 LANGUAGE' },
    th: { home: '← กลับหน้าหลัก', maps: 'นำทางด้วย Google Maps', line: 'สอบถามทาง LINE', access: 'การเดินทางและที่จอดรถ', instagram: 'Instagram', language: '🌐 ภาษา' },
    vi: { home: '← Về trang chủ', maps: 'Chỉ đường Google Maps', line: 'Hỏi qua LINE', access: 'Đường đi & đỗ xe', instagram: 'Instagram', language: '🌐 NGÔN NGỮ' },
    id: { home: '← Kembali ke beranda', maps: 'Petunjuk Google Maps', line: 'Tanya lewat LINE', access: 'Arah & parkir', instagram: 'Instagram', language: '🌐 BAHASA' },
    ja: { home: '← ホームへ戻る', maps: 'Googleマップで案内', line: 'LINEで問い合わせ', access: 'アクセス・駐車場', instagram: 'Instagram', language: '🌐 言語' }
  };

  const drinks = {
    'zh-Hant': {
      title: '苗栗泰式奶茶、泰式奶綠｜5號店 Nara Select・苗栗火車站後站', description: '想在苗栗火車站、鐵路一村附近喝泰式奶茶或泰式奶綠？5號店 Nara Select 位於苗栗市鐵路一村37號，從後站英才路步行可達。實際供應依當日店內為準。',
      heroTitle: '在苗栗，<br>喝一杯泰國味。', heroText: '逛苗栗火車頭園區、鐵路一村，或從苗栗火車站後站經過時，可以來5號店看看今天的泰式飲品。',
      sectionTitle: '5號店的泰式飲品', sectionLead: '目前網站展示泰式奶茶與泰式奶綠兩款飲品；商品與供應情況以當日店內為準。', tea: '泰式奶茶', teaText: '熟悉的泰國風味，適合在鐵路一村散步時帶上一杯。', green: '泰式奶綠', greenText: '想換個不同的泰國茶飲風味，可以看看當天店內是否供應泰式奶綠。', notice: '<strong>供應提醒：</strong>飲品可能因當日備料而調整。出發前可透過 LINE 詢問，網站不刊登未確認的價格與供應狀態。',
      visitTitle: '順路來喝一杯', visitLead: '5號店位於苗栗市鐵路一村37號，鄰近苗栗火車頭園區，從苗栗火車站後站方向步行可達。', train: '🚉 搭火車', trainText: '從後站英才路出口，經二樓左側空橋，往螺旋塔方向前進。', sign: '🏘️ 找指標', signText: '跟著現場「火車頭一村」指標走，再找鐵路一村37號。', car: '🚗 開車', carText: '園區沒有附設停車場，前後站周邊可找收費停車場或收費停車格。',
      faqTitle: '第一次來5號店', q1: '從苗栗火車站怎麼走？', a1: '不要往前站，請往後站英才路出口；走二樓左側空橋往螺旋塔方向，再跟著「火車頭一村」指標前進。', q2: '店在哪裡？', a2: '地址是苗栗縣苗栗市鐵路一村37號，店名為「5號店 Nara Select」。', q3: '每天都有泰式奶茶與泰式奶綠嗎？', a3: '實際供應依當日店內為準。若是專程前來，建議先透過 LINE 詢問。', footer: '苗栗市鐵路一村37號'
    },
    en: {
      title: 'Thai Milk Tea & Thai Green Tea in Miaoli｜Nara Select', description: 'Enjoy Thai milk tea and Thai green tea near Miaoli Railway Station at Nara Select, No. 37 Railway Village. Availability varies daily.',
      heroTitle: 'A taste of Thailand,<br>right here in Miaoli.', heroText: 'Visiting Miaoli Railway Museum, Railway Village, or passing through the rear exit of Miaoli Station? Stop by Nara Select and see which Thai drinks are available today.',
      sectionTitle: 'Thai drinks at Nara Select', sectionLead: 'We currently feature Thai milk tea and Thai green tea. Items and availability depend on the day.', tea: 'Thai milk tea', teaText: 'A familiar Thai flavour, perfect for sipping while strolling through Railway Village.', green: 'Thai green tea', greenText: 'For a different Thai tea flavour, check whether Thai green tea is available today.', notice: '<strong>Availability:</strong> Drinks may change with daily preparation. Ask us on LINE before making a special trip; unconfirmed prices and stock are not posted online.',
      visitTitle: 'Stop by for a drink', visitLead: 'Nara Select is at No. 37 Railway Village, near Miaoli Railway Museum and within walking distance of the rear exit of Miaoli Station.', train: '🚉 By train', trainText: 'Use the Yingcai Road rear exit, take the left skybridge on the second floor, and head toward the spiral tower.', sign: '🏘️ Follow the signs', signText: 'Follow signs for “Locomotive Village,” then look for No. 37 Railway Village.', car: '🚗 By car', carText: 'The park has no private car park. Paid parking lots and street spaces are available around both sides of the station.',
      faqTitle: 'First time visiting?', q1: 'How do I walk from Miaoli Station?', a1: 'Do not use the front exit. Take the Yingcai Road rear exit, cross the left skybridge toward the spiral tower, then follow the “Locomotive Village” signs.', q2: 'Where is the shop?', a2: 'Nara Select is at No. 37 Railway Village, Miaoli City.', q3: 'Are both Thai drinks available every day?', a3: 'Availability varies daily. If you are making a special trip, please ask us on LINE first.', footer: 'No. 37 Railway Village, Miaoli City'
    },
    th: {
      title: 'ชาไทยและชาเขียวนมไทยในเหมียวลี่｜ร้านหมายเลข 5 Nara Select', description: 'ดื่มชาไทยและชาเขียวนมไทยใกล้สถานีรถไฟเหมียวลี่ที่ร้านหมายเลข 5 Nara Select หมู่บ้านรถไฟเลขที่ 37 สินค้าขึ้นอยู่กับแต่ละวัน',
      heroTitle: 'รสชาติไทย<br>ที่เหมียวลี่', heroText: 'หากมาเที่ยวสวนรถไฟเหมียวลี่ หมู่บ้านรถไฟ หรือผ่านทางออกด้านหลังสถานีเหมียวลี่ แวะมาดูเครื่องดื่มไทยประจำวันได้ที่ร้านหมายเลข 5',
      sectionTitle: 'เครื่องดื่มไทยที่ร้านหมายเลข 5', sectionLead: 'ขณะนี้เว็บไซต์แนะนำชาไทยและชาเขียวนมไทย สินค้าและจำนวนที่มีจำหน่ายขึ้นอยู่กับแต่ละวัน', tea: 'ชาไทย', teaText: 'รสชาติไทยที่คุ้นเคย เหมาะสำหรับถือดื่มระหว่างเดินเล่นในหมู่บ้านรถไฟ', green: 'ชาเขียวนมไทย', greenText: 'หากอยากลองชารสชาติอื่น สามารถสอบถามได้ว่าวันนี้มีชาเขียวนมไทยหรือไม่', notice: '<strong>แจ้งเรื่องสินค้า:</strong> เครื่องดื่มอาจเปลี่ยนแปลงตามการเตรียมวัตถุดิบในแต่ละวัน ก่อนเดินทางสามารถสอบถามทาง LINE ได้ เว็บไซต์ไม่ลงราคาและสถานะสินค้าที่ยังไม่ยืนยัน',
      visitTitle: 'แวะมาดื่มสักแก้ว', visitLead: 'ร้านหมายเลข 5 อยู่ที่หมู่บ้านรถไฟเลขที่ 37 เมืองเหมียวลี่ ใกล้สวนรถไฟเหมียวลี่ และเดินจากทางออกด้านหลังสถานีได้', train: '🚉 เดินทางด้วยรถไฟ', trainText: 'ออกทางด้านหลังสถานีฝั่งถนนอิงไฉ ขึ้นสะพานลอยชั้น 2 ทางซ้าย แล้วเดินไปทางหอคอยเกลียว', sign: '🏘️ ตามป้ายบอกทาง', signText: 'เดินตามป้าย “หมู่บ้านหัวรถจักร” แล้วมองหาหมู่บ้านรถไฟเลขที่ 37', car: '🚗 เดินทางด้วยรถยนต์', carText: 'ภายในสวนไม่มีที่จอดรถ มีลานจอดรถและที่จอดริมถนนแบบเสียค่าบริการรอบสถานีทั้งสองฝั่ง',
      faqTitle: 'มาร้านหมายเลข 5 ครั้งแรก', q1: 'เดินจากสถานีเหมียวลี่อย่างไร?', a1: 'อย่าออกทางด้านหน้าสถานี ให้ไปทางออกด้านหลังฝั่งถนนอิงไฉ ใช้สะพานลอยชั้น 2 ทางซ้ายไปทางหอคอยเกลียว แล้วตามป้าย “หมู่บ้านหัวรถจักร”', q2: 'ร้านอยู่ที่ไหน?', a2: 'ร้านหมายเลข 5 Nara Select อยู่ที่หมู่บ้านรถไฟเลขที่ 37 เมืองเหมียวลี่', q3: 'มีชาไทยและชาเขียวนมไทยทุกวันไหม?', a3: 'สินค้าขึ้นอยู่กับแต่ละวัน หากตั้งใจมาโดยเฉพาะ แนะนำให้สอบถามทาง LINE ก่อน', footer: 'หมู่บ้านรถไฟเลขที่ 37 เมืองเหมียวลี่'
    },
    vi: {
      title: 'Trà sữa Thái & trà xanh Thái tại Miêu Lật｜Nara Select', description: 'Thưởng thức trà sữa Thái và trà xanh Thái gần ga Miêu Lật tại Nara Select, số 37 Làng Đường sắt. Tình trạng bán tùy từng ngày.',
      heroTitle: 'Hương vị Thái Lan,<br>ngay tại Miêu Lật.', heroText: 'Khi tham quan Công viên Đầu máy Miêu Lật, Làng Đường sắt hoặc đi qua cửa sau ga Miêu Lật, hãy ghé cửa hàng số 5 xem đồ uống Thái hôm nay.',
      sectionTitle: 'Đồ uống Thái tại cửa hàng số 5', sectionLead: 'Hiện có trà sữa Thái và trà xanh Thái; sản phẩm và tình trạng bán tùy từng ngày.', tea: 'Trà sữa Thái', teaText: 'Hương vị Thái quen thuộc, rất hợp để mang theo khi dạo Làng Đường sắt.', green: 'Trà xanh Thái', greenText: 'Nếu muốn thử vị trà Thái khác, hãy hỏi xem hôm nay có trà xanh Thái không.', notice: '<strong>Lưu ý:</strong> Đồ uống có thể thay đổi theo nguyên liệu chuẩn bị trong ngày. Bạn có thể hỏi qua LINE trước khi đến; website không đăng giá hoặc tồn kho chưa xác nhận.',
      visitTitle: 'Ghé uống một ly', visitLead: 'Cửa hàng số 5 ở số 37 Làng Đường sắt, gần Công viên Đầu máy Miêu Lật và có thể đi bộ từ cửa sau ga.', train: '🚉 Đi tàu', trainText: 'Ra cửa sau đường Yingcai, đi cầu trên cao bên trái ở tầng 2 và hướng về tháp xoắn.', sign: '🏘️ Theo biển chỉ dẫn', signText: 'Theo biển “Làng Đầu máy”, sau đó tìm số 37 Làng Đường sắt.', car: '🚗 Đi ô tô', carText: 'Công viên không có bãi đỗ riêng; quanh hai phía nhà ga có bãi và chỗ đỗ trả phí.',
      faqTitle: 'Lần đầu đến cửa hàng?', q1: 'Đi từ ga Miêu Lật thế nào?', a1: 'Không ra cửa trước. Hãy ra cửa sau đường Yingcai, qua cầu trên cao bên trái ở tầng 2 về phía tháp xoắn, rồi theo biển “Làng Đầu máy”.', q2: 'Cửa hàng ở đâu?', a2: 'Cửa hàng số 5 Nara Select ở số 37 Làng Đường sắt, thành phố Miêu Lật.', q3: 'Ngày nào cũng có cả hai loại trà không?', a3: 'Tình trạng bán tùy từng ngày. Nếu bạn đến riêng vì đồ uống, hãy hỏi qua LINE trước.', footer: 'Số 37 Làng Đường sắt, thành phố Miêu Lật'
    },
    id: {
      title: 'Thai Milk Tea & Thai Green Tea di Miaoli｜Nara Select', description: 'Nikmati Thai milk tea dan Thai green tea dekat Stasiun Miaoli di Nara Select, Railway Village No. 37. Ketersediaan berubah setiap hari.',
      heroTitle: 'Cita rasa Thailand,<br>di Miaoli.', heroText: 'Saat mengunjungi Miaoli Railway Museum, Railway Village, atau melewati pintu belakang Stasiun Miaoli, mampirlah untuk melihat minuman Thailand hari ini.',
      sectionTitle: 'Minuman Thailand di Toko No. 5', sectionLead: 'Saat ini tersedia Thai milk tea dan Thai green tea; produk dan ketersediaan mengikuti kondisi hari itu.', tea: 'Thai milk tea', teaText: 'Rasa Thailand yang akrab, cocok dinikmati saat berjalan-jalan di Railway Village.', green: 'Thai green tea', greenText: 'Ingin rasa teh Thailand yang berbeda? Tanyakan apakah Thai green tea tersedia hari ini.', notice: '<strong>Catatan ketersediaan:</strong> Minuman dapat berubah sesuai persiapan harian. Tanyakan lewat LINE sebelum datang khusus; harga dan stok yang belum pasti tidak ditampilkan.',
      visitTitle: 'Mampir untuk minum', visitLead: 'Toko No. 5 berada di Railway Village No. 37, dekat Miaoli Railway Museum dan dapat dicapai berjalan kaki dari pintu belakang stasiun.', train: '🚉 Dengan kereta', trainText: 'Keluar melalui pintu belakang Jalan Yingcai, gunakan jembatan kiri di lantai 2, lalu menuju menara spiral.', sign: '🏘️ Ikuti petunjuk', signText: 'Ikuti papan “Locomotive Village”, lalu cari Railway Village No. 37.', car: '🚗 Dengan mobil', carText: 'Taman tidak memiliki tempat parkir sendiri. Parkir berbayar tersedia di sekitar kedua sisi stasiun.',
      faqTitle: 'Pertama kali berkunjung?', q1: 'Bagaimana berjalan dari Stasiun Miaoli?', a1: 'Jangan menuju pintu depan. Gunakan pintu belakang Jalan Yingcai, lewati jembatan kiri lantai 2 menuju menara spiral, lalu ikuti papan “Locomotive Village”.', q2: 'Di mana tokonya?', a2: 'Toko No. 5 Nara Select berada di Railway Village No. 37, Kota Miaoli.', q3: 'Apakah kedua minuman tersedia setiap hari?', a3: 'Ketersediaan berubah setiap hari. Jika datang khusus, tanyakan melalui LINE terlebih dahulu.', footer: 'Railway Village No. 37, Kota Miaoli'
    },
    ja: {
      title: '苗栗のタイミルクティー・タイグリーンティー｜Nara Select', description: '苗栗駅近くのNara Select（鉄路一村37号）でタイミルクティーとタイグリーンティーを楽しめます。提供状況は日によって異なります。',
      heroTitle: '苗栗で、<br>タイの味を一杯。', heroText: '苗栗火車頭園区や鉄路一村を散策するとき、また苗栗駅後站側を通るときは、5号店で今日のタイドリンクをご覧ください。',
      sectionTitle: '5号店のタイドリンク', sectionLead: '現在、タイミルクティーとタイグリーンティーをご紹介しています。商品と提供状況は当日の店頭状況によります。', tea: 'タイミルクティー', teaText: '鉄路一村の散策にぴったりな、親しみやすいタイの味です。', green: 'タイグリーンティー', greenText: '少し違うタイ茶の味を楽しみたい方は、当日の提供状況をご確認ください。', notice: '<strong>提供状況：</strong>当日の仕込みにより変更する場合があります。遠方からお越しの際はLINEでお問い合わせください。未確認の価格や在庫は掲載しません。',
      visitTitle: '散策の途中に一杯', visitLead: '5号店は苗栗市鉄路一村37号にあり、苗栗火車頭園区に隣接しています。苗栗駅後站側から徒歩でアクセスできます。', train: '🚉 電車で', trainText: '後站・英才路出口から2階左側の空中歩道を通り、螺旋塔方面へ進みます。', sign: '🏘️ 案内表示', signText: '現地の「火車頭一村」表示に従い、鉄路一村37号を探してください。', car: '🚗 車で', carText: '園区専用駐車場はありません。駅の前後に有料駐車場と有料駐車スペースがあります。',
      faqTitle: '初めての方へ', q1: '苗栗駅からの行き方は？', a1: '前站ではなく後站・英才路出口へ。2階左側の空中歩道を螺旋塔方面へ進み、「火車頭一村」の表示に従ってください。', q2: 'お店はどこですか？', a2: '5号店 Nara Selectは苗栗市鉄路一村37号です。', q3: '2種類のドリンクは毎日ありますか？', a3: '提供状況は日によって異なります。ドリンク目的でお越しの場合は、事前にLINEでお問い合わせください。', footer: '苗栗市鉄路一村37号'
    }
  };

  const select = {
    'zh-Hant': { title:'苗栗泰國選物｜泰國包、盲盒與大象小物｜5號店 Nara Select', description:'5號店 Nara Select 位於苗栗火車頭園區鐵路一村，店內可逛泰國包、NaRaYa、零錢包、大象小物、公仔與盲盒。商品不定期更換，歡迎到店慢慢挖寶。', eyebrow:'THAI SELECT・苗栗泰國選物', heroTitle:'從泰國，挑一些<br>喜歡的回來。', heroText:'5號店位於苗栗火車頭園區的鐵路一村。這裡不是塞滿固定貨號的商城，而是一間可以慢慢逛、偶爾遇見驚喜的小店。', bagsTitle:'泰國包款與生活選物', bagsLead:'店內包款與花色會不定期更換，照片呈現的是5號店實際陳列風格；當日款式與數量請以現場為準。', bag:'泰國風格包款', bagText:'從日常提袋到小尺寸包款，適合在店裡慢慢挑選喜歡的顏色與版型。', naraya:'NaRaYa 泰國包', narayaText:'經典蝴蝶結、繽紛圖樣與實用收納包款，實際供應依店內現況為準。', smallTitle:'大象小物與零錢包', smallLead:'帶著泰國意象的小物、零錢包與日常配件，是店裡很適合隨手挖寶的一區。', elephant:'大象小物・零錢包', elephantText:'不同材質、花色與尺寸不定期輪換，每次來店都可能看到不同組合。', blind:'盲盒與收藏小物', blindText:'店內不定期出現不同系列的盲盒與角色商品，照片僅供陳列參考。', figuresTitle:'公仔展示，慢慢看。', figures:'公仔・角色收藏', figuresText:'展示櫃裡有我們喜歡的角色與收藏，也讓店裡多了一點逛展般的樂趣。', visitTitle:'真正好玩的，留給你到店發現。', visitText:'商品會不定期更換，網站不刊登固定價格與即時庫存。若想確認某類商品，可先透過 LINE 詢問。', notice:'※ 商品、花色與數量依當日店內實際陳列為準；照片不代表永久供應或保留庫存。', footer:'苗栗火車頭園區・鐵路一村37號' },
    en: { title:'Thai Select in Miaoli｜Bags, Blind Boxes & Elephant Gifts｜Nara Select', description:'Discover Thai bags, NaRaYa, coin purses, elephant gifts, figures and blind boxes at Nara Select in Miaoli Railway Village. Items change regularly.', eyebrow:'THAI SELECT・MIAOLI', heroTitle:'A few favourites,<br>selected from Thailand.', heroText:'Nara Select is in Railway Village at Miaoli Railway Museum. It is not a catalogue-style shop, but a small place to browse slowly and find the occasional surprise.', bagsTitle:'Thai bags & lifestyle finds', bagsLead:'Bag styles and colours change regularly. Photos show the real display style at Nara Select; current styles and quantities depend on the shop.', bag:'Thai-style bags', bagText:'From everyday totes to compact bags, take your time choosing a colour and shape you like.', naraya:'NaRaYa Thai bags', narayaText:'Classic bows, colourful patterns and practical storage bags. Availability depends on the current shop selection.', smallTitle:'Elephant gifts & coin purses', smallLead:'Thai-inspired accessories, coin purses and everyday small goods make this a fun corner to browse.', elephant:'Elephant gifts & coin purses', elephantText:'Materials, colours and sizes rotate regularly, so each visit may bring a different selection.', blind:'Blind boxes & collectibles', blindText:'Different blind-box series and character items appear from time to time. Photos are for display reference only.', figuresTitle:'Take your time with the figures.', figures:'Figures & character collectibles', figuresText:'Our favourite characters and collectibles make the cabinet feel a little like a mini exhibition.', visitTitle:'The best surprises are waiting in store.', visitText:'Items change regularly. Fixed prices and live stock are not listed online. Ask on LINE if you want to check a product category.', notice:'※ Products, colours and quantities depend on the actual display that day. Photos do not guarantee permanent availability or reserved stock.', footer:'Miaoli Railway Museum・No. 37 Railway Village' },
    th: { title:'สินค้าไทยในเหมียวลี่｜กระเป๋า กล่องสุ่ม และของช้าง｜ร้านหมายเลข 5 Nara Select', description:'เลือกชมกระเป๋าไทย NaRaYa กระเป๋าใส่เหรียญ ของช้าง ฟิกเกอร์ และกล่องสุ่มที่ร้านหมายเลข 5 Nara Select ในหมู่บ้านรถไฟเหมียวลี่ สินค้าเปลี่ยนเป็นระยะ', eyebrow:'THAI SELECT・สินค้าไทยในเหมียวลี่', heroTitle:'คัดสิ่งที่ชอบ<br>กลับมาจากไทย', heroText:'ร้านหมายเลข 5 อยู่ในหมู่บ้านรถไฟของสวนรถไฟเหมียวลี่ ที่นี่ไม่ใช่ร้านออนไลน์ที่มีสินค้าแบบเดิมตลอด แต่เป็นร้านเล็ก ๆ สำหรับเดินดูช้า ๆ และพบของน่ารักแบบไม่คาดคิด', bagsTitle:'กระเป๋าไทยและของใช้ไลฟ์สไตล์', bagsLead:'แบบและสีของกระเป๋าเปลี่ยนเป็นระยะ ภาพถ่ายแสดงการจัดวางจริงในร้าน แบบและจำนวนสินค้าขึ้นอยู่กับวันนั้น', bag:'กระเป๋าสไตล์ไทย', bagText:'ตั้งแต่ถุงผ้าใช้ประจำวันถึงกระเป๋าใบเล็ก สามารถเลือกสีและทรงที่ชอบได้อย่างสบาย ๆ', naraya:'กระเป๋าไทย NaRaYa', narayaText:'โบว์คลาสสิก ลวดลายสีสันสดใส และกระเป๋าจัดเก็บที่ใช้งานสะดวก สินค้าขึ้นอยู่กับที่มีในร้าน', smallTitle:'ของช้างและกระเป๋าใส่เหรียญ', smallLead:'ของชิ้นเล็กที่มีกลิ่นอายไทย กระเป๋าใส่เหรียญ และของใช้ประจำวัน เป็นอีกมุมที่น่าเดินเลือก', elephant:'ของช้าง・กระเป๋าใส่เหรียญ', elephantText:'วัสดุ ลวดลาย และขนาดเปลี่ยนเป็นระยะ แต่ละครั้งที่มาอาจพบสินค้าไม่เหมือนเดิม', blind:'กล่องสุ่มและของสะสม', blindText:'มีกล่องสุ่มและสินค้าตัวละครหลายแบบสลับเข้าร้านเป็นระยะ ภาพใช้เป็นตัวอย่างการจัดแสดงเท่านั้น', figuresTitle:'ค่อย ๆ ชมฟิกเกอร์', figures:'ฟิกเกอร์・ของสะสมตัวละคร', figuresText:'ตู้โชว์รวบรวมตัวละครและของสะสมที่เราชอบ ทำให้ร้านมีความสนุกเหมือนนิทรรศการเล็ก ๆ', visitTitle:'ของสนุกจริง ๆ รอให้มาพบที่ร้าน', visitText:'สินค้าเปลี่ยนเป็นระยะ เว็บไซต์ไม่แสดงราคาคงที่หรือสต็อกแบบเรียลไทม์ หากต้องการสอบถามประเภทสินค้า ติดต่อทาง LINE ได้', notice:'※ สินค้า สี และจำนวนขึ้นอยู่กับการจัดแสดงจริงในวันนั้น ภาพถ่ายไม่ได้หมายความว่าจะมีสินค้าถาวรหรือสำรองไว้', footer:'สวนรถไฟเหมียวลี่・หมู่บ้านรถไฟเลขที่ 37' },
    vi: { title:'Đồ tuyển chọn Thái tại Miêu Lật｜Túi, hộp bí ẩn & quà hình voi｜Nara Select', description:'Khám phá túi Thái, NaRaYa, ví xu, quà hình voi, mô hình và hộp bí ẩn tại Nara Select trong Làng Đường sắt Miêu Lật. Sản phẩm thay đổi định kỳ.', eyebrow:'THAI SELECT・ĐỒ THÁI TẠI MIÊU LẬT', heroTitle:'Mang về những món<br>mình thích từ Thái Lan.', heroText:'Cửa hàng số 5 nằm trong Làng Đường sắt của Công viên Đầu máy Miêu Lật. Đây không phải cửa hàng trực tuyến với mã hàng cố định, mà là nơi nhỏ xinh để thong thả khám phá.', bagsTitle:'Túi Thái & đồ phong cách sống', bagsLead:'Kiểu dáng và màu sắc thay đổi định kỳ. Hình ảnh cho thấy cách trưng bày thật tại cửa hàng; mẫu và số lượng tùy ngày.', bag:'Túi phong cách Thái', bagText:'Từ túi dùng hằng ngày đến túi nhỏ, bạn có thể thong thả chọn màu và kiểu mình thích.', naraya:'Túi Thái NaRaYa', narayaText:'Nơ cổ điển, họa tiết đầy màu sắc và túi đựng tiện dụng; tình trạng bán tùy cửa hàng.', smallTitle:'Quà hình voi & ví xu', smallLead:'Phụ kiện mang nét Thái, ví xu và đồ dùng nhỏ là một góc rất vui để tìm đồ.', elephant:'Quà hình voi・ví xu', elephantText:'Chất liệu, màu sắc và kích thước thay đổi định kỳ, nên mỗi lần ghé có thể thấy bộ sưu tập khác nhau.', blind:'Hộp bí ẩn & đồ sưu tầm', blindText:'Các dòng hộp bí ẩn và nhân vật khác nhau xuất hiện theo đợt. Hình ảnh chỉ để tham khảo trưng bày.', figuresTitle:'Thong thả ngắm mô hình.', figures:'Mô hình・nhân vật sưu tầm', figuresText:'Các nhân vật và món sưu tầm yêu thích khiến tủ trưng bày giống một triển lãm nhỏ.', visitTitle:'Điều thú vị nhất đang chờ bạn tại cửa hàng.', visitText:'Sản phẩm thay đổi định kỳ. Website không đăng giá cố định hay tồn kho trực tiếp. Hãy hỏi qua LINE nếu muốn kiểm tra một nhóm sản phẩm.', notice:'※ Sản phẩm, màu sắc và số lượng tùy trưng bày thực tế trong ngày. Hình ảnh không đảm bảo còn hàng lâu dài hoặc giữ hàng.', footer:'Công viên Đầu máy Miêu Lật・Số 37 Làng Đường sắt' },
    id: { title:'Thai Select di Miaoli｜Tas, Blind Box & Hadiah Gajah｜Nara Select', description:'Temukan tas Thailand, NaRaYa, dompet koin, hadiah gajah, figur, dan blind box di Nara Select, Railway Village Miaoli. Koleksi berubah secara berkala.', eyebrow:'THAI SELECT・MIAOLI', heroTitle:'Pilihan kesukaan,<br>dibawa dari Thailand.', heroText:'Toko No. 5 berada di Railway Village, Miaoli Railway Museum. Ini bukan toko katalog dengan stok tetap, melainkan tempat kecil untuk melihat-lihat santai dan menemukan kejutan.', bagsTitle:'Tas Thailand & pilihan gaya hidup', bagsLead:'Model dan warna tas berubah secara berkala. Foto menunjukkan tampilan nyata di toko; model dan jumlah mengikuti kondisi hari itu.', bag:'Tas bergaya Thailand', bagText:'Mulai dari tote sehari-hari hingga tas kecil, pilih warna dan bentuk yang Anda sukai dengan santai.', naraya:'Tas Thailand NaRaYa', narayaText:'Pita klasik, motif warna-warni, dan tas penyimpanan praktis. Ketersediaan mengikuti koleksi toko.', smallTitle:'Hadiah gajah & dompet koin', smallLead:'Aksesori bernuansa Thailand, dompet koin, dan barang kecil sehari-hari menjadi sudut yang seru untuk dijelajahi.', elephant:'Hadiah gajah・dompet koin', elephantText:'Bahan, warna, dan ukuran berganti secara berkala, jadi setiap kunjungan bisa menghadirkan pilihan berbeda.', blind:'Blind box & barang koleksi', blindText:'Berbagai seri blind box dan karakter hadir dari waktu ke waktu. Foto hanya sebagai referensi tampilan.', figuresTitle:'Nikmati koleksi figur.', figures:'Figur・koleksi karakter', figuresText:'Karakter dan koleksi favorit kami membuat lemari pajangan terasa seperti pameran kecil.', visitTitle:'Kejutan terbaik menunggu di toko.', visitText:'Produk berubah secara berkala. Harga tetap dan stok langsung tidak ditampilkan. Tanyakan lewat LINE bila ingin memeriksa kategori tertentu.', notice:'※ Produk, warna, dan jumlah mengikuti tampilan aktual hari itu. Foto tidak menjamin ketersediaan permanen atau stok yang disimpan.', footer:'Miaoli Railway Museum・Railway Village No. 37' },
    ja: { title:'苗栗のタイ雑貨｜タイバッグ・ブラインドボックス・象雑貨｜Nara Select', description:'苗栗の鉄路一村にあるNara Selectで、タイバッグ、NaRaYa、コインケース、象雑貨、フィギュア、ブラインドボックスをご覧いただけます。商品は随時入れ替わります。', eyebrow:'THAI SELECT・苗栗のタイ雑貨', heroTitle:'タイから、好きなものを<br>選んできました。', heroText:'5号店は苗栗火車頭園区の鉄路一村にあります。固定商品が並ぶ通販店ではなく、ゆっくり見て思いがけない出会いを楽しむ小さなお店です。', bagsTitle:'タイバッグと暮らしの雑貨', bagsLead:'バッグの形や色は随時入れ替わります。写真は5号店の実際の陳列です。当日の種類と数量は店頭でご確認ください。', bag:'タイスタイルのバッグ', bagText:'普段使いのトートから小さなバッグまで、お気に入りの色や形をゆっくり選べます。', naraya:'NaRaYa タイバッグ', narayaText:'定番のリボン、カラフルな柄、便利な収納バッグ。提供状況は店頭在庫によります。', smallTitle:'象雑貨とコインケース', smallLead:'タイらしい小物、コインケース、日常アクセサリーを気軽に探せるコーナーです。', elephant:'象雑貨・コインケース', elephantText:'素材、柄、サイズは随時入れ替わるため、来店ごとに違う組み合わせに出会えます。', blind:'ブラインドボックスとコレクション', blindText:'さまざまなシリーズやキャラクター商品が不定期に入荷します。写真は陳列例です。', figuresTitle:'フィギュアをゆっくりご覧ください。', figures:'フィギュア・キャラクターコレクション', figuresText:'お気に入りのキャラクターとコレクションが並び、小さな展示のように楽しめます。', visitTitle:'本当の楽しさは、お店で見つけてください。', visitText:'商品は随時入れ替わります。固定価格やリアルタイム在庫は掲載していません。気になる種類はLINEでお問い合わせください。', notice:'※ 商品、色、数量は当日の店頭陳列によります。写真は常時販売や在庫確保を保証するものではありません。', footer:'苗栗火車頭園区・鉄路一村37号' }
  };

  const set = (selector, value, html = false) => {
    const element = document.querySelector(selector);
    if (!element || value == null) return;
    element[html ? 'innerHTML' : 'textContent'] = value;
  };
  const applyHead = data => {
    document.title = data.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.description);
    document.documentElement.lang = language;
  };

  function applyDrinks(data) {
    applyHead(data); const c = common[language];
    set('.home-link', c.home); set('.hero h1', data.heroTitle, true); set('.hero p', data.heroText);
    set('.hero .actions .btn:nth-child(1)', c.maps); set('.hero .actions .btn:nth-child(2)', c.line);
    set('main > section:nth-of-type(2) .section-title', data.sectionTitle); set('main > section:nth-of-type(2) .lead', data.sectionLead);
    set('.drink:nth-child(1) h2', data.tea); set('.drink:nth-child(1) p', data.teaText); set('.drink:nth-child(2) h2', data.green); set('.drink:nth-child(2) p', data.greenText); set('.notice', data.notice, true);
    set('.visit .section-title', data.visitTitle); set('.visit .lead', data.visitLead);
    set('.visit .card:nth-child(1) h3', data.train); set('.visit .card:nth-child(1) p', data.trainText); set('.visit .card:nth-child(2) h3', data.sign); set('.visit .card:nth-child(2) p', data.signText); set('.visit .card:nth-child(3) h3', data.car); set('.visit .card:nth-child(3) p', data.carText); set('.visit .actions .btn', c.access);
    set('main > section:nth-of-type(4) .section-title', data.faqTitle);
    set('.faq article:nth-child(1) h3', data.q1); set('.faq article:nth-child(1) p', data.a1); set('.faq article:nth-child(2) h3', data.q2); set('.faq article:nth-child(2) p', data.a2); set('.faq article:nth-child(3) h3', data.q3); set('.faq article:nth-child(3) p', data.a3);
    set('main > section:nth-of-type(4) .actions .btn:nth-child(1)', c.home); set('main > section:nth-of-type(4) .actions .btn:nth-child(2)', c.instagram);
    const footer = document.querySelector('footer .wrap'); if (footer) footer.innerHTML = `<strong>5號店 Nara Select</strong><br>${data.footer}<br>© 2026 Nara Select`;
  }

  function applySelect(data) {
    applyHead(data); const c = common[language];
    set('.home', c.home); set('.hero .eyebrow', data.eyebrow); set('.hero h1', data.heroTitle, true); set('.hero p', data.heroText);
    set('main > section:nth-of-type(2) .title', data.bagsTitle); set('main > section:nth-of-type(2) .lead', data.bagsLead); set('main > section:nth-of-type(2) .photo-card:nth-child(1) h3', data.bag); set('main > section:nth-of-type(2) .photo-card:nth-child(1) p', data.bagText); set('main > section:nth-of-type(2) .photo-card:nth-child(2) h3', data.naraya); set('main > section:nth-of-type(2) .photo-card:nth-child(2) p', data.narayaText);
    set('main > section:nth-of-type(3) .title', data.smallTitle); set('main > section:nth-of-type(3) .lead', data.smallLead); set('main > section:nth-of-type(3) .photo-card:nth-child(1) h3', data.elephant); set('main > section:nth-of-type(3) .photo-card:nth-child(1) p', data.elephantText); set('main > section:nth-of-type(3) .photo-card:nth-child(2) h3', data.blind); set('main > section:nth-of-type(3) .photo-card:nth-child(2) p', data.blindText);
    set('main > section:nth-of-type(4) .title', data.figuresTitle); set('main > section:nth-of-type(4) .photo-card:nth-child(1) h3', data.figures); set('main > section:nth-of-type(4) .photo-card:nth-child(1) p', data.figuresText); set('main > section:nth-of-type(4) .photo-card:nth-child(2) h2', data.visitTitle); set('main > section:nth-of-type(4) .photo-card:nth-child(2) p', data.visitText);
    set('main > section:nth-of-type(4) .actions .btn:nth-child(1)', c.line); set('main > section:nth-of-type(4) .actions .btn:nth-child(2)', c.access); set('main > section:nth-of-type(4) .actions .btn:nth-child(3)', c.maps); set('main > section:nth-of-type(4) .notice', data.notice);
    const footer = document.querySelector('footer .wrap'); if (footer) footer.innerHTML = `<strong>5號店 Nara Select</strong><br>${data.footer}<br>© 2026 Nara Select`;
  }

  function syncLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return;
      const url = new URL(raw, location.origin);
      if (url.origin !== location.origin) return;
      url.searchParams.set('lang', language);
      link.href = `${url.pathname}${url.search}${url.hash}`;
    });
  }

  function render() {
    localStorage.setItem('nara-language', language);
    const path = location.pathname;
    if (path.endsWith('/thai-drinks.html')) applyDrinks(drinks[language] || drinks.en);
    if (path.endsWith('/thai-select.html')) applySelect(select[language] || select.en);
    document.querySelectorAll('[data-language-select]').forEach(select => { select.value = language; });
    syncLinks();
  }

  document.querySelectorAll('[data-language-select]').forEach(select => select.addEventListener('change', event => {
    language = normalise(event.target.value) || 'en';
    const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url);
    render();
  }));
  render();
})();
