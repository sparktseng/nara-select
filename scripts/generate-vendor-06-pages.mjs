import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const slug = 'railway-village/06-hei-xin-tang-shaved-ice.html';
const map = 'https://maps.app.goo.gl/R9xGh2wzvjmRofv9A';
const instagram = 'https://www.instagram.com/heixintang_brownsugar/';
const facebook = 'https://www.facebook.com/p/%E9%BB%91%E5%BF%83%E7%B3%96-brown-sugar-61575627466350/?locale=zh_TW';
const foodpanda = 'https://www.foodpanda.com.tw/restaurant/dn1x/hei-xin-tang?utm_campaign=google_reserve_place_order_action_CH-SEO_';
const cover = 'https://nara5.tw/assets/hei-xin-tang-share.svg';

const langs = {
  zh: {
    dir: '', code: 'zh-Hant', label: '繁體中文',
    title: '黑心糖古早味剉冰店｜苗栗火車頭園區・鐵路一村6號店',
    desc: '黑心糖古早味剉冰店位於360苗栗縣苗栗市鐵路一村38號、苗栗火車頭園區鐵路一村6號店。查看常態營業時間與 Google Maps 導航。',
    back: '回到 5號店網站', crumb: '鐵路一村店家', tag: '苗栗火車頭園區・鐵路一村 6號店',
    lead: '想找園區裡的黑心糖？這一頁整理完整地址、常態營業時間與 Google Maps 入口，讓你出發前快速確認。',
    map: '在 Google Maps 查看最新資訊', about: '店家資訊',
    aboutText: '黑心糖古早味剉冰店位於苗栗火車頭園區的鐵路一村 6號店。公開店家資訊可確認古早味剉冰、紅豆湯、花生湯與燒仙草等品項；實際供應以店家當日公告為準。',
    hours: '常態營業時間', wedFri: '星期三至星期五', weekend: '星期六、星期日', closed: '星期一、星期二', closedText: '公休',
    notice: '實際營業時間、臨時公休及特殊節日調整，請以 Google Maps 或店家社群最新公告為準。',
    contact: '地址、電話與位置', place: '苗栗火車頭園區・鐵路一村 6號店', address: '地址：360 苗栗縣苗栗市鐵路一村38號', phone: '電話：0910 793 039', social: 'Instagram',
    verified: '本頁資料依店家 Google Maps、官方社群公開資訊及商工登記資料整理；未核實價格不自行刊載。',
    sweet: '逛完6號店，也來看看5號店。', sweetText: '從鐵路一村38號走到37號，就是 5號店 Nara Select；可以喝泰式飲品、看看當日甜點與泰國選物。實際供應以現場為準。',
    naraAddress: '5號店 Nara Select 地址：360 苗栗縣苗栗市鐵路一村37號', visit: '看看 5號店 Nara Select'
  },
  en: {
    dir: 'en/', code: 'en', label: 'English',
    title: 'Hei Xin Tang Traditional Shaved Ice｜Railway Village Store No. 6, Miaoli',
    desc: 'Find Hei Xin Tang at No. 38, Tielu 1st Village, Miaoli City 360, with regular hours and a direct Google Maps link.',
    back: 'Back to Nara Select', crumb: 'Railway Village shops', tag: 'Miaoli Railway Museum・Railway Village Store No. 6',
    lead: 'Check the full address, regular opening hours and latest Google Maps information before your visit.',
    map: 'View latest details on Google Maps', about: 'About the shop',
    aboutText: 'Hei Xin Tang Traditional Shaved Ice is at Railway Village Store No. 6. Public shop information lists traditional shaved ice, red bean soup, peanut soup and grass jelly; daily availability may vary.',
    hours: 'Regular hours', wedFri: 'Wednesday–Friday', weekend: 'Saturday–Sunday', closed: 'Monday–Tuesday', closedText: 'Closed',
    notice: 'For actual hours, temporary closures and holiday changes, check the latest Google Maps or shop social update.',
    contact: 'Address & contact', place: 'Miaoli Railway Museum・Railway Village Store No. 6', address: 'Address: No. 38, Tielu 1st Village, Miaoli City, Miaoli County 360, Taiwan', phone: 'Phone: 0910 793 039', social: 'Instagram',
    verified: 'This page uses the shop’s Google Maps listing, public official social posts and government business registration. Unverified prices are not published.',
    sweet: 'Visiting Store No. 6? Store No. 5 is next door.', sweetText: 'Walk from No. 38 to No. 37 to find Nara Select Store No. 5 for Thai drinks, daily sweets and Thai finds. Availability varies by day.',
    naraAddress: 'Nara Select Store No. 5: No. 37, Tielu 1st Village, Miaoli City', visit: 'Visit Nara Select Store No. 5'
  },
  ja: {
    dir: 'ja/', code: 'ja', label: '日本語',
    title: '黑心糖古早味剉冰店｜苗栗鉄道博物館・鉄路一村6号店',
    desc: '苗栗県苗栗市鉄路一村38号、鉄路一村6号店の黑心糖古早味剉冰店。通常営業時間とGoogle Mapsリンクをご案内します。',
    back: '5号店サイトへ戻る', crumb: '鉄路一村のお店', tag: '苗栗鉄道博物館・鉄路一村6号店',
    lead: '来店前に、住所、通常営業時間、Google Mapsの最新情報を確認できます。',
    map: 'Google Mapsで最新情報を見る', about: '店舗情報',
    aboutText: '黑心糖古早味剉冰店は鉄路一村6号店にあります。公開情報では伝統的なかき氷、紅豆湯、花生湯、仙草などが案内されています。提供内容は当日の告知をご確認ください。',
    hours: '通常営業時間', wedFri: '水曜日〜金曜日', weekend: '土曜日・日曜日', closed: '月曜日・火曜日', closedText: '定休日',
    notice: '実際の営業時間、臨時休業、祝日の変更は、Google Mapsまたは店舗SNSの最新情報をご確認ください。',
    contact: '住所・連絡先', place: '苗栗鉄道博物館・鉄路一村6号店', address: '住所：360 苗栗県苗栗市鉄路一村38号', phone: '電話：0910 793 039', social: 'Instagram',
    verified: '店舗のGoogle Maps、公式SNSの公開情報、商業登記をもとに整理しています。未確認の価格は掲載していません。',
    sweet: '6号店のあとは、お隣の5号店へ。', sweetText: '鉄路一村38号から37号へ歩くと、5号店 Nara Selectがあります。タイドリンク、当日のスイーツ、タイ雑貨を楽しめます。',
    naraAddress: '5号店 Nara Select：苗栗県苗栗市鉄路一村37号', visit: '5号店 Nara Selectを見る'
  },
  th: {
    dir: 'th/', code: 'th', label: 'ไทย',
    title: '黑心糖 น้ำแข็งไสโบราณ｜พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6',
    desc: 'ร้าน黑心糖อยู่เลขที่ 38 หมู่บ้านรถไฟ เมืองเหมียวลี่ 360 พร้อมเวลาทำการปกติและลิงก์ Google Maps',
    back: 'กลับเว็บไซต์ร้านหมายเลข 5', crumb: 'ร้านค้าในหมู่บ้านรถไฟ', tag: 'พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6',
    lead: 'ตรวจสอบที่อยู่ เวลาทำการปกติ และข้อมูลล่าสุดบน Google Maps ก่อนเดินทาง',
    map: 'ดูข้อมูลล่าสุดใน Google Maps', about: 'ข้อมูลร้าน',
    aboutText: '黑心糖 ร้านน้ำแข็งไสแบบดั้งเดิมอยู่ที่ร้านหมายเลข 6 ข้อมูลสาธารณะระบุน้ำแข็งไส ซุปถั่วแดง ซุปถั่วลิสง และเฉาก๊วย โปรดตรวจสอบรายการประจำวันที่ร้าน',
    hours: 'เวลาทำการปกติ', wedFri: 'วันพุธ–วันศุกร์', weekend: 'วันเสาร์–วันอาทิตย์', closed: 'วันจันทร์–วันอังคาร', closedText: 'ปิด',
    notice: 'เวลาจริง วันหยุดชั่วคราว และการปรับเวลาในวันพิเศษ โปรดดู Google Maps หรือโซเชียลของร้านล่าสุด',
    contact: 'ที่อยู่และติดต่อ', place: 'พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6', address: 'ที่อยู่: เลขที่ 38 หมู่บ้านรถไฟ เมืองเหมียวลี่ มณฑลเหมียวลี่ 360 ไต้หวัน', phone: 'โทรศัพท์: 0910 793 039', social: 'Instagram',
    verified: 'ข้อมูลมาจาก Google Maps โพสต์สาธารณะของร้าน และทะเบียนธุรกิจ โดยไม่เผยแพร่ราคาที่ยังไม่ยืนยัน',
    sweet: 'จากร้านหมายเลข 6 แวะร้านหมายเลข 5 ได้เลย', sweetText: 'เดินจากเลขที่ 38 ไปเลขที่ 37 จะพบร้านหมายเลข 5 Nara Select พร้อมเครื่องดื่มไทย ขนมประจำวัน และสินค้าไทย',
    naraAddress: 'ร้านหมายเลข 5 Nara Select: เลขที่ 37 หมู่บ้านรถไฟ เมืองเหมียวลี่', visit: 'ดูร้านหมายเลข 5 Nara Select'
  },
  vi: {
    dir: 'vi/', code: 'vi', label: 'Tiếng Việt',
    title: 'Hei Xin Tang Đá bào truyền thống｜Cửa hàng số 6, Làng Đường sắt Miêu Lật',
    desc: 'Hei Xin Tang tại số 38, Làng Đường sắt, TP. Miêu Lật 360, với giờ mở cửa thường lệ và liên kết Google Maps.',
    back: 'Về trang Nara Select', crumb: 'Cửa hàng Làng Đường sắt', tag: 'Bảo tàng Đường sắt Miêu Lật・Cửa hàng số 6',
    lead: 'Kiểm tra địa chỉ, giờ mở cửa thường lệ và thông tin mới nhất trên Google Maps trước khi đến.',
    map: 'Xem thông tin mới nhất trên Google Maps', about: 'Thông tin cửa hàng',
    aboutText: 'Hei Xin Tang bán đá bào truyền thống tại cửa hàng số 6. Thông tin công khai có đá bào, chè đậu đỏ, chè đậu phộng và thạch cỏ; món thực tế tùy ngày.',
    hours: 'Giờ mở cửa thường lệ', wedFri: 'Thứ Tư–Thứ Sáu', weekend: 'Thứ Bảy–Chủ Nhật', closed: 'Thứ Hai–Thứ Ba', closedText: 'Đóng cửa',
    notice: 'Giờ thực tế, ngày nghỉ đột xuất và thay đổi dịp lễ vui lòng xem Google Maps hoặc mạng xã hội mới nhất của cửa hàng.',
    contact: 'Địa chỉ & liên hệ', place: 'Bảo tàng Đường sắt Miêu Lật・Cửa hàng số 6', address: 'Địa chỉ: Số 38, Làng Đường sắt, TP. Miêu Lật, huyện Miêu Lật 360, Đài Loan', phone: 'Điện thoại: 0910 793 039', social: 'Instagram',
    verified: 'Thông tin được tổng hợp từ Google Maps, bài đăng công khai chính thức và đăng ký kinh doanh. Giá chưa xác minh không được đăng.',
    sweet: 'Ghé cửa hàng số 6 rồi sang cửa hàng số 5.', sweetText: 'Đi từ số 38 đến số 37 là cửa hàng số 5 Nara Select, nơi có đồ uống Thái, món ngọt trong ngày và đồ tuyển chọn Thái Lan.',
    naraAddress: 'Nara Select cửa hàng số 5: Số 37, Làng Đường sắt, TP. Miêu Lật', visit: 'Xem Nara Select cửa hàng số 5'
  },
  id: {
    dir: 'id/', code: 'id', label: 'Bahasa Indonesia',
    title: 'Hei Xin Tang Es Serut Tradisional｜Railway Village Toko No. 6, Miaoli',
    desc: 'Hei Xin Tang berada di No. 38, Railway Village, Kota Miaoli 360, dengan jam reguler dan tautan Google Maps.',
    back: 'Kembali ke Nara Select', crumb: 'Toko Railway Village', tag: 'Museum Kereta Miaoli・Railway Village Toko No. 6',
    lead: 'Periksa alamat, jam buka reguler, dan informasi terbaru di Google Maps sebelum berkunjung.',
    map: 'Lihat info terbaru di Google Maps', about: 'Tentang toko',
    aboutText: 'Hei Xin Tang menyajikan es serut tradisional di Toko No. 6. Informasi publik mencantumkan es serut, sup kacang merah, sup kacang tanah, dan cincau; ketersediaan berubah setiap hari.',
    hours: 'Jam buka reguler', wedFri: 'Rabu–Jumat', weekend: 'Sabtu–Minggu', closed: 'Senin–Selasa', closedText: 'Tutup',
    notice: 'Untuk jam aktual, tutup sementara, dan perubahan hari libur, periksa Google Maps atau media sosial toko terbaru.',
    contact: 'Alamat & kontak', place: 'Museum Kereta Miaoli・Railway Village Toko No. 6', address: 'Alamat: No. 38, Railway Village, Kota Miaoli, Kabupaten Miaoli 360, Taiwan', phone: 'Telepon: 0910 793 039', social: 'Instagram',
    verified: 'Informasi dirangkum dari Google Maps, unggahan publik resmi, dan pendaftaran usaha. Harga yang belum terverifikasi tidak dipublikasikan.',
    sweet: 'Dari Toko No. 6, mampir ke Toko No. 5.', sweetText: 'Berjalan dari No. 38 ke No. 37 untuk menemukan Toko No. 5 Nara Select, dengan minuman Thailand, hidangan manis harian, dan produk pilihan Thailand.',
    naraAddress: 'Nara Select Toko No. 5: No. 37, Railway Village, Kota Miaoli', visit: 'Lihat Nara Select Toko No. 5'
  }
};

const reviews = {
  'zh-Hant': {title:'顧客評論常提到',text:'不少顧客喜歡黑心糖古早味剉冰香氣濃郁的黑糖滋味，粉圓與芋圓也經常獲得好評。想吃鹹食時，還有人推薦湯頭清甜的關東煮。合理的價格、乾淨舒適的環境，以及親切熱情的店員，都是評論中常被提到的特色。',notice:'以上為 Google Maps 公開評論的綜合整理，反映評論者的個人體驗；品項、價格與現場狀況可能調整，請以店家最新公告為準。'},
  en: {title:'What customers often mention',text:'Reviews often praise the rich brown-sugar flavour of the traditional shaved ice, especially the tapioca pearls and taro balls. Some customers also recommend the light, savoury oden broth. Reasonable prices, a clean and comfortable setting, and friendly staff are frequently mentioned.',notice:'This is a summary of public Google Maps reviews and reflects individual experiences. Items, prices and on-site conditions may change; check the shop’s latest notice.'},
  ja: {title:'口コミでよく挙げられること',text:'黒糖かき氷の豊かな香りと味、特にタピオカと芋圓が好評です。あっさりしたスープのおでん、手頃な価格、清潔で快適な店内、親切なスタッフもよく評価されています。',notice:'Google Mapsの公開口コミをまとめたもので、個人の体験を反映しています。商品、価格、店頭状況は変更される場合があります。'},
  th: {title:'สิ่งที่ลูกค้ามักพูดถึง',text:'รีวิวมักชื่นชมน้ำแข็งไสน้ำตาลทรายแดงที่หอมเข้มข้น โดยเฉพาะไข่มุกและเผือกก้อน หลายคนยังแนะนำโอเด้งน้ำซุปใสรสกลมกล่อม พร้อมกล่าวถึงราคาสมเหตุสมผล ร้านสะอาดสบาย และพนักงานเป็นมิตร',notice:'ข้อความนี้สรุปจากรีวิวสาธารณะบน Google Maps และสะท้อนประสบการณ์ส่วนบุคคล สินค้า ราคา และสภาพหน้างานอาจเปลี่ยนแปลงได้'},
  vi: {title:'Điều khách hàng thường nhắc đến',text:'Nhiều đánh giá khen đá bào đường đen thơm đậm, đặc biệt là trân châu và viên khoai môn. Một số khách cũng giới thiệu oden có nước dùng thanh ngọt. Giá hợp lý, không gian sạch sẽ thoải mái và nhân viên thân thiện cũng thường được nhắc đến.',notice:'Đây là bản tổng hợp các đánh giá công khai trên Google Maps và phản ánh trải nghiệm cá nhân. Món ăn, giá và tình hình tại cửa hàng có thể thay đổi.'},
  id: {title:'Hal yang sering disebut pelanggan',text:'Ulasan sering memuji es serut gula merah yang harum dan kaya rasa, terutama mutiara tapioka dan bola talas. Beberapa pelanggan juga merekomendasikan oden dengan kuah ringan. Harga wajar, tempat yang bersih dan nyaman, serta staf ramah juga kerap disebut.',notice:'Ringkasan ini berasal dari ulasan publik Google Maps dan mencerminkan pengalaman pribadi. Produk, harga, dan kondisi di toko dapat berubah.'}
};
const visitLabels = {
  'zh-Hant':'查看5號店｜泰式飲品與泰國選物',en:'Visit Store No. 5｜Thai drinks & Thai finds',ja:'5号店を見る｜タイドリンク・タイ雑貨',th:'ดูร้านหมายเลข 5｜เครื่องดื่มและสินค้าไทย',vi:'Xem cửa hàng số 5｜Đồ uống và sản phẩm Thái',id:'Lihat Toko No. 5｜Minuman & produk Thailand'
};
const mapLabels = {
  'zh-Hant':'Google Maps 導航',en:'Open in Google Maps',ja:'Google Mapsでナビ',th:'นำทางด้วย Google Maps',vi:'Chỉ đường bằng Google Maps',id:'Navigasi Google Maps'
};
const menus = {
  'zh-Hant':{open:'查看菜單',title:'黑心糖菜單',close:'關閉菜單',order:'foodpanda 訂購',note:'以下品項依店家 foodpanda 頁面整理，不顯示價格；實際供應、配料與訂購狀況請以店家現場或 foodpanda 最新頁面為準。',categories:[['招牌冰品',['黑糖粉粿綜合冰','黑糖粉粿米苔目仙草冰','黑糖粉粿米苔目冰','黑糖粉粿紅豆冰','黑糖粉粿綠豆冰','黑糖粉粿仙草冰','黑糖粉粿冰','自選料（選四樣）','黑糖水剉冰']],['甜品',['豆花（選三樣）','仙草奶凍（選四樣）','綠豆地瓜湯']],['加料',['芋薯圓']]]},
  en:{open:'View menu',title:'Hei Xin Tang menu',close:'Close menu',order:'Order on foodpanda',note:'Items are compiled from the shop’s foodpanda page. Prices are not shown. Availability, toppings and ordering status may change; check with the shop or foodpanda.',categories:[['Signature shaved ice',['Brown-sugar starch-jelly mixed shaved ice','Brown-sugar starch jelly, rice noodles and grass-jelly ice','Brown-sugar starch jelly and rice-noodle ice','Brown-sugar starch jelly and red-bean ice','Brown-sugar starch jelly and mung-bean ice','Brown-sugar starch jelly and grass-jelly ice','Brown-sugar starch-jelly ice','Choose four toppings','Brown-sugar shaved ice']],['Desserts',['Tofu pudding (choose three toppings)','Grass-jelly milk dessert (choose four toppings)','Mung-bean and sweet-potato soup']],['Extra topping',['Taro and sweet-potato balls']]]},
  ja:{open:'メニューを見る',title:'黑心糖 メニュー',close:'メニューを閉じる',order:'foodpandaで注文',note:'以下は店舗のfoodpandaページをもとに整理した品目です。価格は掲載していません。提供状況・トッピング・注文可否は店舗またはfoodpandaの最新情報をご確認ください。',categories:[['看板かき氷',['黒糖粉粿ミックスかき氷','黒糖粉粿・米苔目・仙草かき氷','黒糖粉粿・米苔目かき氷','黒糖粉粿・小豆かき氷','黒糖粉粿・緑豆かき氷','黒糖粉粿・仙草かき氷','黒糖粉粿かき氷','トッピング4種を選択','黒糖かき氷']],['甘味',['豆花（トッピング3種）','仙草ミルクデザート（トッピング4種）','緑豆とさつまいもの甘いスープ']],['追加トッピング',['タロイモ・さつまいも団子']]]},
  th:{open:'ดูเมนู',title:'เมนู黑心糖',close:'ปิดเมนู',order:'สั่งผ่าน foodpanda',note:'รายการด้านล่างเรียบเรียงจากหน้า foodpanda ของร้าน โดยไม่แสดงราคา รายการ ท็อปปิง และสถานะการสั่งซื้ออาจเปลี่ยนแปลง โปรดตรวจสอบกับร้านหรือ foodpanda',categories:[['น้ำแข็งไสเมนูเด่น',['น้ำแข็งไสน้ำตาลทรายแดงรวมแป้งหนึบ','น้ำแข็งไสแป้งหนึบ เส้นข้าว และเฉาก๊วย','น้ำแข็งไสแป้งหนึบและเส้นข้าว','น้ำแข็งไสแป้งหนึบและถั่วแดง','น้ำแข็งไสแป้งหนึบและถั่วเขียว','น้ำแข็งไสแป้งหนึบและเฉาก๊วย','น้ำแข็งไสแป้งหนึบ','เลือกท็อปปิงสี่อย่าง','น้ำแข็งไสน้ำตาลทรายแดง']],['ของหวาน',['เต้าฮวย (เลือกสามอย่าง)','เฉาก๊วยนม (เลือกสี่อย่าง)','ซุปถั่วเขียวและมันเทศ']],['เพิ่มท็อปปิง',['บัวลอยเผือกและมันเทศ']]]},
  vi:{open:'Xem thực đơn',title:'Thực đơn Hei Xin Tang',close:'Đóng thực đơn',order:'Đặt món qua foodpanda',note:'Các món dưới đây được tổng hợp từ trang foodpanda của cửa hàng và không hiển thị giá. Món bán, topping và tình trạng đặt hàng có thể thay đổi; vui lòng kiểm tra với cửa hàng hoặc foodpanda.',categories:[['Đá bào đặc trưng',['Đá bào đường đen thạch bột tổng hợp','Đá bào thạch bột, bánh gạo sợi và thạch cỏ','Đá bào thạch bột và bánh gạo sợi','Đá bào thạch bột và đậu đỏ','Đá bào thạch bột và đậu xanh','Đá bào thạch bột và thạch cỏ','Đá bào thạch bột đường đen','Tự chọn bốn topping','Đá bào nước đường đen']],['Món ngọt',['Tàu hũ (chọn ba topping)','Thạch cỏ sữa (chọn bốn topping)','Chè đậu xanh khoai lang']],['Topping thêm',['Viên khoai môn và khoai lang']]]},
  id:{open:'Lihat menu',title:'Menu Hei Xin Tang',close:'Tutup menu',order:'Pesan lewat foodpanda',note:'Daftar berikut dirangkum dari halaman foodpanda toko dan tidak menampilkan harga. Ketersediaan, topping, dan status pemesanan dapat berubah; periksa informasi terbaru dari toko atau foodpanda.',categories:[['Es serut khas',['Es serut gula merah campur jeli pati','Es serut jeli pati, mi beras, dan cincau','Es serut jeli pati dan mi beras','Es serut jeli pati dan kacang merah','Es serut jeli pati dan kacang hijau','Es serut jeli pati dan cincau','Es serut jeli pati gula merah','Pilih empat topping','Es serut sirup gula merah']],['Hidangan manis',['Puding tahu (pilih tiga topping)','Cincau susu (pilih empat topping)','Sup kacang hijau dan ubi']],['Topping tambahan',['Bola talas dan ubi']]]}
};
const aboutTexts = {
  'zh-Hant':'黑心糖古早味剉冰店位於苗栗火車頭園區鐵路一村6號店，招牌黑糖粉粿由店家自行製作，另有古早味剉冰、豆花、仙草奶凍與甜湯；關東煮等季節品項以當日公告為準。',
  en:'Hei Xin Tang is at Railway Village Store No. 6. Its signature brown-sugar starch jelly is made in-house, alongside traditional shaved ice, tofu pudding, grass-jelly desserts and sweet soups. Seasonal items such as oden vary by day.',
  ja:'黑心糖古早味剉冰店は鉄路一村6号店にあります。店内で作る黒糖粉粿を看板に、昔ながらのかき氷、豆花、仙草デザート、甘いスープを提供しています。おでんなど季節商品は当日の案内をご確認ください。',
  th:'ร้าน黑心糖อยู่ที่ร้านหมายเลข 6 ในหมู่บ้านรถไฟ เมนูเด่นคือแป้งหนึบน้ำตาลทรายแดงทำเอง พร้อมน้ำแข็งไสแบบดั้งเดิม เต้าฮวย เฉาก๊วย และซุปหวาน ส่วนโอเด้งและเมนูตามฤดูกาลขึ้นอยู่กับประกาศของร้านในแต่ละวัน',
  vi:'Hei Xin Tang nằm tại cửa hàng số 6 trong Làng Đường sắt. Món đặc trưng là thạch bột đường đen tự làm, cùng đá bào truyền thống, tàu hũ, thạch cỏ và các món chè. Oden và món theo mùa tùy thông báo trong ngày.',
  id:'Hei Xin Tang berada di Railway Village Toko No. 6. Menu khasnya adalah jeli pati gula merah buatan sendiri, bersama es serut tradisional, puding tahu, cincau, dan sup manis. Oden serta menu musiman mengikuti pengumuman harian toko.'
};
const sourceTexts = {
  'zh-Hant':'地址、電話與常態營業時間依店家最新 Google Maps 地標核對；店家介紹參考官方 Facebook、Instagram 與商工登記，菜單依 foodpanda 頁面整理，價格不刊載。',
  en:'Address, phone and regular hours were checked against the latest Google Maps listing. Shop details use official Facebook, Instagram and business registration; menu items come from foodpanda and prices are omitted.',
  ja:'住所、電話、通常営業時間は最新のGoogle Mapsで確認しました。店舗紹介は公式Facebook、Instagram、商業登記を参照し、メニューはfoodpandaをもとに整理して価格は掲載していません。',
  th:'ตรวจสอบที่อยู่ โทรศัพท์ และเวลาทำการปกติจาก Google Maps ล่าสุด ข้อมูลร้านอ้างอิง Facebook, Instagram และทะเบียนธุรกิจ ส่วนเมนูเรียบเรียงจาก foodpanda โดยไม่แสดงราคา',
  vi:'Địa chỉ, điện thoại và giờ mở cửa thường lệ được kiểm tra theo Google Maps mới nhất. Thông tin cửa hàng dựa trên Facebook, Instagram chính thức và đăng ký kinh doanh; thực đơn lấy từ foodpanda và không hiển thị giá.',
  id:'Alamat, telepon, dan jam reguler diperiksa dari Google Maps terbaru. Informasi toko mengacu pada Facebook, Instagram resmi, dan pendaftaran usaha; menu dirangkum dari foodpanda tanpa harga.'
};
for (const l of Object.values(langs)) { l.review = reviews[l.code]; l.visit = visitLabels[l.code]; l.map = mapLabels[l.code]; l.menu = menus[l.code]; l.aboutText = aboutTexts[l.code]; l.verified = sourceTexts[l.code]; }
langs.zh.sweet = '吃完冰，再到隔壁找點泰國味。';
langs.zh.sweetText = '從鐵路一村38號往37號走，就是5號店 Nara Select。這裡有泰式飲品、當日甜點與泰國選物，逛完6號店後，可以順路來喝杯泰式奶茶、看看店裡的新鮮選物。';

const alternates = Object.values(langs).map(l => `<link rel="alternate" hreflang="${l.code}" href="https://nara5.tw/${l.dir}${slug}">`).join('') + `<link rel="alternate" hreflang="x-default" href="https://nara5.tw/${slug}">`;
const options = Object.values(langs).map(l => `<option value="/${l.dir}${slug}">${l.label}</option>`).join('');

for (const l of Object.values(langs)) {
  const path = `${l.dir}${slug}`;
  const url = `https://nara5.tw/${path}`;
  const menuHtml = l.menu.categories.map(([category, items]) => `<section class="menu-group"><h3>${category}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></section>`).join('');
  const json = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'IceCreamShop', name: '黑心糖古早味剉冰店', url,
    description: l.desc, telephone: '+886-910-793-039', hasMap: map, hasMenu: `${url}#menu`, sameAs: [instagram, facebook, foodpanda],
    address: {'@type':'PostalAddress',streetAddress:'鐵路一村38號',addressLocality:'苗栗市',addressRegion:'苗栗縣',postalCode:'360',addressCountry:'TW'},
    openingHoursSpecification: [
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Wednesday','Thursday','Friday'],opens:'12:30',closes:'20:30'},
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Saturday','Sunday'],opens:'11:30',closes:'20:30'}
    ],
    containedInPlace: {'@type':'TouristAttraction',name:'苗栗火車頭園區'}
  });
  const html = `<!doctype html><html lang="${l.code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${l.title}</title><meta name="description" content="${l.desc}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${url}">${alternates}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/vendor-page.css?v=20260920-heixintang"><meta property="og:type" content="website"><meta property="og:site_name" content="鐵路一村店家｜Nara Select"><meta property="og:title" content="${l.title}"><meta property="og:description" content="${l.desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${cover}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${l.title}"><meta name="twitter:description" content="${l.desc}"><meta name="twitter:image" content="${cover}"><script type="application/ld+json">${json}</script></head><body><a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap nav"><a class="home" href="/${l.dir}">5號店<small>NARA SELECT</small></a><select class="lang" data-vendor-language aria-label="Language">${options}</select></div></header><main id="main"><section class="hero"><div class="wrap"><nav class="crumb"><a href="/${l.dir}">${l.back}</a> › ${l.crumb}</nav><div class="kicker">${l.tag}</div><h1>黑心糖古早味剉冰店</h1><p class="lead">${l.lead}</p><div class="actions"><button class="btn" type="button" data-menu-open>${l.menu.open}</button><a class="btn panda" href="${foodpanda}" target="_blank" rel="noopener sponsored">${l.menu.order}</a><a class="btn alt" href="${map}" target="_blank" rel="noopener">${l.map}</a><a class="btn alt" href="/${l.dir}">${l.back}</a></div></div></section><section class="section"><div class="wrap grid"><article class="card"><h2>${l.about}</h2><p>${l.aboutText}</p></article><article class="card"><h2>${l.hours}</h2><ul class="hours"><li><span>${l.wedFri}</span><strong>12:30–20:30</strong></li><li><span>${l.weekend}</span><strong>11:30–20:30</strong></li><li><span>${l.closed}</span><strong>${l.closedText}</strong></li></ul><p class="notice">${l.notice}</p></article><article class="card"><h2>${l.contact}</h2><p>${l.place}<br><strong>${l.address}</strong><br><a href="tel:+886910793039">${l.phone}</a></p><div class="actions"><a class="btn alt" href="${instagram}" target="_blank" rel="noopener">Instagram</a><a class="btn alt" href="${facebook}" target="_blank" rel="noopener">Facebook</a></div></article><article class="card"><h2>DATA SOURCE</h2><p class="source">${l.verified}</p></article></div></section><section class="section"><div class="wrap"><article class="card"><h2>${l.review.title}</h2><p>${l.review.text}</p><p class="notice">※ ${l.review.notice}</p></article></div></section><section class="section alt"><div class="wrap cta"><div><h2>${l.sweet}</h2><p>${l.sweetText}</p><p><strong>${l.naraAddress}</strong></p><div class="actions"><a class="btn" href="/${l.dir}">${l.visit}</a></div></div><img src="/assets/thai-milk-tea.webp" width="640" height="929" loading="lazy" decoding="async" alt="5號店 Nara Select Thai milk tea"></div></section></main><dialog class="menu-dialog" id="menu" data-menu-dialog aria-labelledby="menu-title"><div class="menu-head"><h2 id="menu-title">${l.menu.title}</h2><button class="menu-close" type="button" data-menu-close aria-label="${l.menu.close}">×</button></div><div class="menu-grid">${menuHtml}</div><p class="notice">※ ${l.menu.note}</p><div class="actions"><a class="btn panda" href="${foodpanda}" target="_blank" rel="noopener sponsored">${l.menu.order}</a><button class="btn alt" type="button" data-menu-close>${l.menu.close}</button></div></dialog><footer><div class="wrap">鐵路一村店家資訊・由 5號店 Nara Select 網站整理<br>© 2026 Nara Select</div></footer><script>const d=document.querySelector('[data-menu-dialog]');document.querySelector('[data-menu-open]').addEventListener('click',()=>d.showModal());d.querySelectorAll('[data-menu-close]').forEach(button=>button.addEventListener('click',()=>d.close()));d.addEventListener('click',event=>{if(event.target===d)d.close()});document.querySelector('[data-vendor-language]').value=location.pathname.startsWith('/en/')?'/en/${slug}':location.pathname.startsWith('/ja/')?'/ja/${slug}':location.pathname.startsWith('/th/')?'/th/${slug}':location.pathname.startsWith('/vi/')?'/vi/${slug}':location.pathname.startsWith('/id/')?'/id/${slug}':'/${slug}'</script><script src="/assets/vendor-language.js?v=20260918-1" defer></script><script src="/assets/site-tracking.js?v=20260918-ga4" defer></script></body></html>`;
  await mkdir(new URL(`${l.dir}railway-village/`, root), {recursive:true});
  await writeFile(new URL(path, root), html);
}
