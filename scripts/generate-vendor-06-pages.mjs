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
    dir: '', code: 'zh-Hant', label: '繁體中文 / Traditional Chinese',
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
const stories = {
  'zh-Hant': {title:'一碗古早味剉冰，找回小時候的簡單快樂',pull:'這個「黑心」，其實是一份家人的心意。',paragraphs:[
    '黑心糖的誕生，來自老闆對剉冰那份純粹滋味的喜愛。炎熱的日子裡，一碗簡單的古早味剉冰，不只消暑，也讓人想起小時候吃冰的快樂。',
    '店名「黑心糖」，一部分來自店裡主打的黑糖，也藏著老闆兒子名字中「心」的字音。看似有點調皮的名字，其實放進了家人的名字與一份心意。',
    '為了做出多數人喜歡的黑糖粉粿，店家花了約兩個月反覆試吃、調整比例。製作時必須持續攪拌；火候太過，粉粿會變硬，稍微沒有顧好又容易燒焦。現在這份柔軟彈嫩、帶著黑糖香氣的口感，是一次次重做與調整後留下來的成果。',
    '選擇在鐵路一村6號店開始，是因為這裡保留了早期眷村與老宿舍的生活氛圍。坐在小庭院旁吃著一碗古早味剉冰，就像回到小時候，重新想起那份簡單的快樂。'
  ]},
  en: {title:'A bowl of traditional shaved ice, and the simple joy of childhood',pull:'The “Xin” in Hei Xin Tang carries a family story.',paragraphs:[
    'Hei Xin Tang began with the owner’s love for the pure simplicity of shaved ice. On a hot day, a simple bowl cools you down and brings back the happiness of enjoying this traditional treat as a child.',
    'The name combines the shop’s signature brown sugar—hei tang—with the sound “xin” found in the owner’s son’s name. What may sound playful is really a name filled with family affection.',
    'To make a brown-sugar starch jelly that most customers would enjoy, the shop spent about two months tasting batches and adjusting the ratios. It must be stirred continuously: too much heat makes it hard, while a moment without attention can scorch it. Its soft, springy texture and brown-sugar aroma are the result of repeated trials.',
    'Store No. 6 was chosen because Railway Village retains the atmosphere of an early military dependents’ village and its old residences. Eating traditional shaved ice beside the small courtyard feels like returning to the simple happiness of childhood.'
  ]},
  ja: {title:'昔ながらのかき氷一杯で、子どもの頃の素朴な幸せへ',pull:'「黑心糖」の「心」には、家族への想いが込められています。',paragraphs:[
    '黑心糖は、店主がかき氷の素朴で純粋な味わいを愛していたことから始まりました。暑い日に食べる昔ながらのかき氷は、涼をもたらすだけでなく、子どもの頃の楽しい記憶を呼び起こします。',
    '店名は、看板の黒糖（黑糖）と、店主の息子さんの名前にある「心」の音を組み合わせたもの。少しユーモラスに聞こえる名前には、家族の名前と想いが込められています。',
    '多くの人に好まれる黒糖粉粿を作るため、約2か月にわたり試食と配合調整を重ねました。製造中は絶えず混ぜる必要があり、火を入れすぎると硬くなり、目を離すと焦げやすくなります。やわらかく弾む食感と黒糖の香りは、何度も作り直した末に生まれました。',
    '鉄路一村6号店を選んだのは、初期の眷村と古い宿舎の暮らしの雰囲気が残っているから。小さな中庭のそばで昔ながらのかき氷を食べる時間は、子どもの頃の素朴な幸せを思い出させてくれます。'
  ]},
  th: {title:'น้ำแข็งไสโบราณหนึ่งถ้วย พากลับไปหาความสุขเรียบง่ายในวัยเด็ก',pull:'คำว่า “心” ในชื่อ 黑心糖 คือความตั้งใจที่มาจากครอบครัว',paragraphs:[
    '黑心糖 เกิดจากความชอบของเจ้าของร้านที่มีต่อน้ำแข็งไสรสชาติเรียบง่ายและบริสุทธิ์ ในวันที่อากาศร้อน น้ำแข็งไสโบราณหนึ่งถ้วยไม่เพียงช่วยคลายร้อน แต่ยังชวนให้นึกถึงความสุขตอนกินน้ำแข็งไสในวัยเด็ก',
    'ชื่อร้านผสมคำว่า 黑糖 ซึ่งหมายถึงน้ำตาลทรายแดง เมนูหลักของร้าน เข้ากับเสียงของคำว่า “心” ที่อยู่ในชื่อลูกชายเจ้าของร้าน ชื่อที่ฟังดูขี้เล่นนี้จึงซ่อนทั้งชื่อของคนในครอบครัวและความใส่ใจไว้',
    'เพื่อทำแป้งหนึบน้ำตาลทรายแดงให้ได้รสสัมผัสที่คนส่วนใหญ่ชอบ ทางร้านใช้เวลาประมาณสองเดือนชิมและปรับสัดส่วนซ้ำ ๆ ระหว่างทำต้องคนตลอดเวลา เพราะถ้าใช้ไฟนานเกินไปเนื้อจะแข็ง และหากละสายตาก็ไหม้ได้ง่าย ความนุ่มเด้งและกลิ่นน้ำตาลทรายแดงในวันนี้จึงเกิดจากการลองทำและปรับแก้หลายครั้ง',
    'ร้านเลือกเริ่มต้นที่ร้านหมายเลข 6 เพราะหมู่บ้านรถไฟยังคงบรรยากาศของชุมชนทหารและบ้านพักเก่า การนั่งกินน้ำแข็งไสโบราณข้างลานเล็ก ๆ จึงเหมือนได้กลับไปพบความสุขเรียบง่ายในวัยเด็กอีกครั้ง'
  ]},
  vi: {title:'Một bát đá bào xưa, tìm lại niềm vui giản dị của tuổi thơ',pull:'Chữ “Tâm” trong Hei Xin Tang chính là tình cảm dành cho gia đình.',paragraphs:[
    'Hei Xin Tang ra đời từ tình yêu của chủ quán dành cho vị đá bào thuần khiết và giản dị. Vào ngày nóng, một bát đá bào truyền thống không chỉ giúp giải nhiệt mà còn gợi lại niềm vui ăn đá bào thuở nhỏ.',
    'Tên quán kết hợp món chủ đạo là đường đen với âm “Tâm” trong tên con trai của chủ quán. Cái tên nghe có vẻ tinh nghịch nhưng thật ra chứa cả tên người thân và tình cảm gia đình.',
    'Để làm ra món thạch bột đường đen có kết cấu được nhiều người yêu thích, quán đã dành khoảng hai tháng nếm thử và điều chỉnh tỷ lệ. Khi nấu phải khuấy liên tục; quá lửa sẽ làm thạch cứng, còn lơ là một chút lại dễ cháy. Độ mềm dai và hương đường đen hôm nay là kết quả của nhiều lần làm lại và điều chỉnh.',
    'Quán chọn cửa hàng số 6 vì Làng Đường sắt vẫn giữ bầu không khí của khu cư xá quân nhân và nhà ở cũ. Ngồi bên khoảng sân nhỏ ăn một bát đá bào xưa giống như trở về tuổi thơ và tìm lại niềm vui giản dị ấy.'
  ]},
  id: {title:'Semangkuk es serut tradisional, membawa kembali kebahagiaan sederhana masa kecil',pull:'Kata “Xin” dalam Hei Xin Tang menyimpan kasih sebuah keluarga.',paragraphs:[
    'Hei Xin Tang lahir dari kecintaan pemiliknya pada kesederhanaan rasa es serut. Pada hari yang panas, semangkuk es serut tradisional bukan hanya menyegarkan, tetapi juga membangkitkan kenangan bahagia saat menikmati jajanan ini di masa kecil.',
    'Nama toko menggabungkan gula merah—hei tang—yang menjadi andalan toko dengan bunyi “xin” dalam nama putra pemilik. Nama yang terdengar jenaka ini sebenarnya menyimpan nama anggota keluarga dan kasih sayang.',
    'Untuk menghasilkan jeli pati gula merah dengan tekstur yang disukai banyak orang, toko menghabiskan sekitar dua bulan untuk mencicipi dan menyesuaikan takaran. Adonan harus terus diaduk; terlalu matang membuatnya keras, sedangkan sedikit lengah dapat membuatnya gosong. Tekstur lembut-kenyal dan aroma gula merahnya lahir dari berkali-kali percobaan.',
    'Toko No. 6 dipilih karena Railway Village masih mempertahankan suasana permukiman keluarga militer dan rumah-rumah lama. Menikmati es serut tradisional di dekat halaman kecil terasa seperti kembali pada kebahagiaan sederhana masa kecil.'
  ]}
};
const storyVisualCaptions = {
  'zh-Hant':'童年吃冰情境示意，非店家實際販售商品。',
  en:'A childhood shaved-ice memory scene; not an actual product sold by the shop.',
  ja:'子どもの頃のかき氷をイメージした情景です。店舗の実際の商品ではありません。',
  th:'ภาพจำลองบรรยากาศการกินน้ำแข็งไสในวัยเด็ก ไม่ใช่สินค้าที่ร้านจำหน่ายจริง',
  vi:'Hình ảnh mô phỏng ký ức ăn đá bào thời thơ ấu, không phải món bán thực tế của quán.',
  id:'Ilustrasi suasana menikmati es serut di masa kecil, bukan produk yang benar-benar dijual toko.'
};
const storyUi = {
  'zh-Hant': {question:'為什麼叫「黑心糖」？',answer:'因為黑糖，也因為兒子名字裡的一個「心」。',button:'看看這碗冰背後的故事 ↓',chapters:['這個「黑心」，是家人的心意','花兩個月，只為粉粿剛剛好','在老宿舍旁，吃回小時候的快樂'],months:'2個月',monthsLabel:'反覆試吃、調整比例',ending:'在鐵路一村吃的不只是一碗冰，還有小時候那份簡單的快樂。'},
  en:{question:'Why is it called “Hei Xin Tang”?',answer:'For brown sugar—and for the “Xin” in the owner’s son’s name.',button:'Discover the story behind this bowl ↓',chapters:['This “Xin” carries a family’s love','Two months to get the starch jelly just right','Beside an old residence, taste the joy of childhood again'],months:'2 months',monthsLabel:'of repeated tasting and fine-tuning',ending:'At Railway Village, you are tasting more than shaved ice—you are finding the simple joy of childhood again.'},
  ja:{question:'なぜ「黑心糖」という名前？',answer:'黒糖の「黑糖」と、店主の息子さんの名前にある「心」から。',button:'この一杯に込めた物語を見る ↓',chapters:['この「心」は、家族への想い','2か月、粉粿をちょうどよい食感にするために','古い宿舎のそばで、子どもの頃の幸せをもう一度'],months:'2か月',monthsLabel:'試食と配合調整を繰り返す',ending:'鉄路一村で味わうのは、かき氷だけではありません。子どもの頃の素朴な幸せも、ここにあります。'},
  th:{question:'ทำไมร้านถึงชื่อ “黑心糖”?',answer:'เพราะน้ำตาลทรายแดง และเพราะคำว่า “心” ในชื่อลูกชายเจ้าของร้าน',button:'อ่านเรื่องราวเบื้องหลังน้ำแข็งไสถ้วยนี้ ↓',chapters:['คำว่า “心” คือความตั้งใจของครอบครัว','สองเดือน เพื่อให้แป้งหนึบพอดีที่สุด','ข้างบ้านพักเก่า กลับไปพบความสุขในวัยเด็ก'],months:'2 เดือน',monthsLabel:'ชิมและปรับสัดส่วนซ้ำ ๆ',ending:'ที่หมู่บ้านรถไฟ สิ่งที่ได้ลิ้มลองไม่ใช่แค่น้ำแข็งไส แต่ยังเป็นความสุขเรียบง่ายในวัยเด็กด้วย'},
  vi:{question:'Vì sao quán có tên “Hei Xin Tang”?',answer:'Vì đường đen, và vì chữ “Tâm” trong tên con trai của chủ quán.',button:'Xem câu chuyện phía sau bát đá bào này ↓',chapters:['Chữ “Tâm” là tình cảm của gia đình','Hai tháng, chỉ để thạch bột đạt độ vừa vặn','Bên ngôi nhà cũ, tìm lại niềm vui tuổi thơ'],months:'2 tháng',monthsLabel:'nếm thử và điều chỉnh nhiều lần',ending:'Ở Làng Đường sắt, bạn không chỉ thưởng thức một bát đá bào, mà còn tìm lại niềm vui giản dị của tuổi thơ.'},
  id:{question:'Mengapa namanya “Hei Xin Tang”?',answer:'Karena gula merah, dan karena bunyi “Xin” dalam nama putra pemilik.',button:'Lihat kisah di balik semangkuk es ini ↓',chapters:['“Xin” ini adalah kasih sebuah keluarga','Dua bulan agar jeli patinya terasa pas','Di samping rumah lama, kembali pada bahagia masa kecil'],months:'2 bulan',monthsLabel:'mencicipi dan menyesuaikan berulang kali',ending:'Di Railway Village, yang dinikmati bukan hanya semangkuk es, tetapi juga kebahagiaan sederhana masa kecil.'}
};
const storyLayoutCss = `<link rel="stylesheet" href="/assets/vendor-story.css?v=20260921-story-journey">`;
const seoDescriptions = {
  'zh-Hant':'苗栗火車頭園區鐵路一村6號店「黑心糖古早味剉冰店」，以自製黑糖粉粿與古早味剉冰，分享店名由來、兩個月調整配方的故事、菜單及導航。',
  en:'Meet Hei Xin Tang at Railway Village Store No. 6: house-made brown-sugar starch jelly, its family name story, menu, hours and Google Maps directions.',
  ja:'苗栗・鉄路一村6号店「黑心糖」。手作り黒糖粉粿、店名に込めた家族の物語、2か月の試作、メニュー、営業時間、地図をご案内します。',
  th:'รู้จักร้าน 黑心糖 หมายเลข 6 ในหมู่บ้านรถไฟ เรื่องชื่อที่มาจากครอบครัว แป้งหนึบน้ำตาลทรายแดงที่ทดลองสองเดือน เมนู เวลาเปิด และแผนที่',
  vi:'Khám phá Hei Xin Tang tại cửa hàng số 6: thạch bột đường đen tự làm, câu chuyện tên quán từ gia đình, hai tháng thử công thức, thực đơn và bản đồ.',
  id:'Kenali Hei Xin Tang di Railway Village Toko No. 6: jeli pati gula merah buatan sendiri, kisah nama keluarga, dua bulan uji resep, menu, jam, dan peta.'
};
const sourceTexts = {
  'zh-Hant':'品牌故事由店主親自補充；地址、電話與常態營業時間依店家最新 Google Maps 地標核對，其他店家資訊參考官方社群與商工登記，菜單依 foodpanda 頁面整理，價格不刊載。',
  en:'The owner provided the brand story. Address, phone and regular hours were checked against Google Maps; other shop details use official social pages and business registration. Menu items come from foodpanda, with prices omitted.',
  ja:'ブランドストーリーは店主本人から提供されました。住所・電話・通常営業時間はGoogle Mapsで確認し、その他は公式SNSと商業登記、メニューはfoodpandaを参照しています。価格は掲載していません。',
  th:'เรื่องราวแบรนด์ได้รับข้อมูลจากเจ้าของร้านโดยตรง ที่อยู่ โทรศัพท์ และเวลาทำการตรวจสอบจาก Google Maps ข้อมูลอื่นอ้างอิงโซเชียลทางการและทะเบียนธุรกิจ ส่วนเมนูมาจาก foodpanda โดยไม่แสดงราคา',
  vi:'Câu chuyện thương hiệu do chính chủ quán cung cấp. Địa chỉ, điện thoại và giờ mở cửa được kiểm tra trên Google Maps; thông tin khác dựa trên mạng xã hội chính thức và đăng ký kinh doanh. Thực đơn lấy từ foodpanda, không hiển thị giá.',
  id:'Kisah merek diberikan langsung oleh pemilik. Alamat, telepon, dan jam reguler diperiksa melalui Google Maps; informasi lain mengacu pada media sosial resmi dan pendaftaran usaha. Menu berasal dari foodpanda tanpa harga.'
};
const galleries = {
  'zh-Hant':{title:'店家與甜品照片',intro:'看看黑心糖的店面、用餐空間與招牌古早味甜品。',captions:['黑心糖店面外觀','黑糖粉粿綜合冰','店內用餐空間','黑糖粉粿、芋圓與米苔目','豆花與黑糖粉粿','黑糖剉冰與配料','黑心糖店面入口','窗邊古早味綜合冰']},
  en:{title:'Shop & dessert gallery',intro:'Take a look at Hei Xin Tang’s storefront, seating area and signature traditional desserts.',captions:['Hei Xin Tang storefront','Brown-sugar starch-jelly mixed shaved ice','Shop seating area','Brown-sugar starch jelly, taro balls and rice noodles','Tofu pudding with brown-sugar starch jelly','Brown-sugar shaved ice with toppings','Hei Xin Tang entrance','Traditional mixed shaved ice by the window']},
  ja:{title:'店舗・スイーツ写真',intro:'黑心糖の外観、店内スペース、看板の昔ながらのスイーツをご覧ください。',captions:['黑心糖の店舗外観','黒糖粉粿ミックスかき氷','店内のイートインスペース','黒糖粉粿・芋圓・米苔目','豆花と黒糖粉粿','黒糖かき氷とトッピング','黑心糖の入口','窓辺の昔ながらのミックスかき氷']},
  th:{title:'ภาพร้านและของหวาน',intro:'ชมหน้าร้าน พื้นที่นั่ง และของหวานแบบดั้งเดิมเมนูเด่นของ黑心糖',captions:['หน้าร้าน黑心糖','น้ำแข็งไสน้ำตาลทรายแดงรวมแป้งหนึบ','พื้นที่นั่งภายในร้าน','แป้งหนึบน้ำตาลทรายแดง บัวลอยเผือก และเส้นข้าว','เต้าฮวยกับแป้งหนึบน้ำตาลทรายแดง','น้ำแข็งไสน้ำตาลทรายแดงพร้อมท็อปปิง','ทางเข้าร้าน黑心糖','น้ำแข็งไสรวมแบบดั้งเดิมริมหน้าต่าง']},
  vi:{title:'Hình ảnh cửa hàng và món ngọt',intro:'Khám phá mặt tiền, khu vực ngồi và các món ngọt truyền thống đặc trưng của Hei Xin Tang.',captions:['Mặt tiền Hei Xin Tang','Đá bào đường đen thạch bột tổng hợp','Khu vực ngồi trong cửa hàng','Thạch bột đường đen, viên khoai môn và bánh gạo sợi','Tàu hũ với thạch bột đường đen','Đá bào đường đen cùng topping','Lối vào Hei Xin Tang','Đá bào tổng hợp truyền thống bên cửa sổ']},
  id:{title:'Galeri toko & hidangan manis',intro:'Lihat bagian depan toko, area duduk, dan hidangan manis tradisional khas Hei Xin Tang.',captions:['Bagian depan Hei Xin Tang','Es serut gula merah campur jeli pati','Area duduk di dalam toko','Jeli pati gula merah, bola talas, dan mi beras','Puding tahu dengan jeli pati gula merah','Es serut gula merah dengan topping','Pintu masuk Hei Xin Tang','Es serut campur tradisional di dekat jendela']}
};
const featuredMenus = {
  'zh-Hant':{title:'來這裡吃什麼？',text:'<strong>黑糖粉粿綜合冰</strong>是店內招牌，黑糖香氣搭配店家自製粉粿，也可以選擇米苔目、仙草、紅豆、綠豆等組合；另外還有豆花、仙草奶凍與甜湯。關東煮等季節品項以店家當日公告為準。',button:'查看完整菜單'},
  en:{title:'What to eat here',text:'The signature is <strong>brown-sugar starch-jelly mixed shaved ice</strong>, pairing aromatic brown sugar with the shop’s house-made starch jelly. Other combinations include rice noodles, grass jelly, red beans and mung beans, plus tofu pudding, grass-jelly milk dessert and sweet soups. Seasonal oden varies by day.',button:'View the full menu'},
  ja:{title:'ここで何を食べる？',text:'看板は<strong>黒糖粉粿ミックスかき氷</strong>。香り豊かな黒糖と店内で作る粉粿を合わせ、米苔目、仙草、小豆、緑豆などの組み合わせも選べます。豆花、仙草ミルクデザート、甘いスープもあります。おでんなど季節商品は当日の案内をご確認ください。',button:'メニューをすべて見る'},
  th:{title:'กินอะไรดี?',text:'<strong>น้ำแข็งไสแป้งหนึบน้ำตาลทรายแดง</strong> มีเต้าฮวยและโอเด้งตามฤดูกาล',button:'ดูเมนู'},
  vi:{title:'Đến đây ăn gì?',text:'Món đặc trưng là <strong>đá bào đường đen thạch bột tổng hợp</strong>, kết hợp đường đen thơm với thạch bột tự làm. Khách có thể chọn thêm bánh gạo sợi, thạch cỏ, đậu đỏ hoặc đậu xanh; ngoài ra còn có tàu hũ, thạch cỏ sữa và các món chè. Oden được bán theo mùa.',button:'Xem toàn bộ thực đơn'},
  id:{title:'Makan apa di sini?',text:'Menu khasnya adalah <strong>es serut gula merah campur jeli pati</strong>, memadukan gula merah aromatik dengan jeli pati buatan toko. Pilihan lain mencakup mi beras, cincau, kacang merah atau kacang hijau, serta puding tahu, cincau susu, dan sup manis. Oden tersedia secara musiman.',button:'Lihat menu lengkap'}
};
const galleryImages = [
  {file:'store-06-exterior.webp',width:812,height:612,featured:true},
  {file:'store-06-mixed-ice.webp',width:1400,height:1052},
  {file:'store-06-interior.webp',width:1254,height:1254},
  {file:'store-06-dessert-close.webp',width:868,height:1500,portrait:true},
  {file:'store-06-tofu-jelly.webp',width:1086,height:1100,portrait:true},
  {file:'store-06-brown-sugar-ice.webp',width:1086,height:1448,portrait:true},
  {file:'store-06-entrance.webp',width:560,height:660,portrait:true},
  {file:'store-06-window-dessert.webp',width:1100,height:1348,portrait:true}
];
for (const l of Object.values(langs)) { l.review = reviews[l.code]; l.visit = visitLabels[l.code]; l.map = mapLabels[l.code]; l.menu = menus[l.code]; l.featured = featuredMenus[l.code]; l.aboutText = aboutTexts[l.code]; l.story = stories[l.code]; l.desc = seoDescriptions[l.code]; l.verified = sourceTexts[l.code]; }
langs.zh.sweet = '吃完冰，再到隔壁找點泰國味。';
langs.zh.sweetText = '從鐵路一村38號往37號走，就是5號店 Nara Select。這裡有泰式飲品、當日甜點與泰國選物，逛完6號店後，可以順路來喝杯泰式奶茶、看看店裡的新鮮選物。';

const alternates = Object.values(langs).map(l => `<link rel="alternate" hreflang="${l.code}" href="https://nara5.tw/${l.dir}${slug}">`).join('') + `<link rel="alternate" hreflang="x-default" href="https://nara5.tw/${slug}">`;
const options = Object.values(langs).map(l => `<option value="/${l.dir}${slug}">${l.label}</option>`).join('');

for (const l of Object.values(langs)) {
  const path = `${l.dir}${slug}`;
  const url = `https://nara5.tw/${path}`;
  const menuHtml = l.menu.categories.map(([category, items]) => `<section class="menu-group"><h3>${category}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></section>`).join('');
  const gallery = galleries[l.code];
  const ui = storyUi[l.code];
  const storyHookHtml = `<aside class="hero-story-hook"><strong>${ui.question}</strong><p>${ui.answer}</p><a class="story-link" href="#brand-story">${ui.button}</a></aside>`;
  const storyHtml = `${storyLayoutCss}<section class="section story-section" id="brand-story"><div class="wrap story-journey"><article class="story-slice"><img class="story-photo" src="/assets/store-06-dessert-close.webp?v=20260921-story-journey" width="868" height="1500" loading="lazy" decoding="async" alt="${gallery.captions[3]}"><div class="story-copy"><p class="eyebrow">01</p><h2>${ui.chapters[0]}</h2><p>${l.story.paragraphs[0]}</p><p>${l.story.paragraphs[1]}</p></div></article><article class="story-slice"><div class="story-stat-panel"><strong>${ui.months}</strong><span>${ui.monthsLabel}</span></div><div class="story-copy"><p class="eyebrow">02</p><h2>${ui.chapters[1]}</h2><p>${l.story.paragraphs[2]}</p></div></article><article class="story-slice"><img class="story-photo" src="/assets/store-06-exterior.webp?v=20260921-story-journey" width="812" height="612" loading="lazy" decoding="async" alt="${gallery.captions[0]}"><div class="story-copy"><p class="eyebrow">03</p><h2>${ui.chapters[2]}</h2><p>${l.story.paragraphs[3]}</p></div></article><figure class="story-emotion"><img src="/assets/store-06-childhood-memory.webp?v=20260921-story-journey" width="1122" height="1402" loading="lazy" decoding="async" alt="${storyVisualCaptions[l.code]}"><blockquote class="story-ending">${ui.ending}</blockquote><figcaption class="story-caption">${storyVisualCaptions[l.code]}</figcaption></figure></div></section>`;
  const galleryHtml = galleryImages.map((image, index) => `<figure class="photo-card${image.featured?' featured':''}${image.portrait?' portrait':''}"><a href="/assets/${image.file}?v=20260921-store06" target="_blank" rel="noopener"><img src="/assets/${image.file}?v=20260921-store06" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" alt="${gallery.captions[index]}｜黑心糖古早味剉冰店 6號店"></a><figcaption>${gallery.captions[index]}</figcaption></figure>`).join('');
  const gallerySection = `<section class="section gallery-section"><div class="wrap"><div class="gallery-heading"><h2>${gallery.title}</h2><p>${gallery.intro}</p></div><div class="vendor-gallery">${galleryHtml}</div></div></section>`;
  const json = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'IceCreamShop', name: '黑心糖古早味剉冰店', url,
    description: l.desc, telephone: '+886-910-793-039', hasMap: map, hasMenu: `${url}#menu`, sameAs: [instagram, facebook, foodpanda],
    image: ['https://nara5.tw/assets/store-06-childhood-memory.webp', ...galleryImages.map(image => `https://nara5.tw/assets/${image.file}`)],
    address: {'@type':'PostalAddress',streetAddress:'鐵路一村38號',addressLocality:'苗栗市',addressRegion:'苗栗縣',postalCode:'360',addressCountry:'TW'},
    openingHoursSpecification: [
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Wednesday','Thursday','Friday'],opens:'12:30',closes:'20:30'},
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Saturday','Sunday'],opens:'11:30',closes:'20:30'}
    ],
    containedInPlace: {'@type':'TouristAttraction',name:'苗栗火車頭園區'}
  });
  const html = `<!doctype html><html lang="${l.code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="format-detection" content="address=no"><title>${l.title}</title><meta name="description" content="${l.desc}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${url}">${alternates}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/vendor-page.css?v=20260921-language"><meta property="og:type" content="website"><meta property="og:site_name" content="鐵路一村店家｜Nara Select"><meta property="og:title" content="${l.title}"><meta property="og:description" content="${l.desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${cover}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${l.title}"><meta name="twitter:description" content="${l.desc}"><meta name="twitter:image" content="${cover}"><script type="application/ld+json">${json}</script></head><body><a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap nav"><a class="home" href="/${l.dir}">5號店<small>NARA SELECT</small></a><div class="language-switch"><label class="language-label" for="vendor-language">🌐 Language</label><select id="vendor-language" class="lang" data-vendor-language aria-label="Language selector">${options}</select></div></div></header><main id="main"><section class="hero"><div class="wrap"><nav class="crumb"><a href="/${l.dir}">${l.back}</a> › ${l.crumb}</nav><div class="kicker">${l.tag}</div><h1>黑心糖古早味剉冰店</h1><p class="lead">${l.lead}</p><div class="actions"><button class="btn" type="button" data-menu-open>${l.menu.open}</button><a class="btn panda" href="${foodpanda}" target="_blank" rel="noopener sponsored">${l.menu.order}</a><a class="btn alt" href="${map}" target="_blank" rel="noopener">${l.map}</a><a class="btn alt" href="/${l.dir}">${l.back}</a></div>${storyHookHtml}</div></section><section class="section"><div class="wrap grid"><article class="card"><h2>${l.about}</h2><p>${l.aboutText}</p></article><article class="card"><h2>${l.hours}</h2><ul class="hours"><li><span>${l.wedFri}</span><strong>12:30–20:30</strong></li><li><span>${l.weekend}</span><strong>11:30–20:30</strong></li><li><span>${l.closed}</span><strong>${l.closedText}</strong></li></ul><p class="notice">${l.notice}</p></article><article class="card"><h2>${l.contact}</h2><p>${l.place}<br><strong>${l.address}</strong><br><a href="tel:+886910793039">${l.phone}</a></p><div class="actions"><a class="btn alt" href="${instagram}" target="_blank" rel="noopener">Instagram</a><a class="btn alt" href="${facebook}" target="_blank" rel="noopener">Facebook</a></div></article><article class="card"><h2>DATA SOURCE</h2><p class="source">${l.verified}</p></article></div></section>${storyHtml}<section class="section"><div class="wrap"><article class="card"><h2>${l.featured.title}</h2><p>${l.featured.text}</p><div class="actions"><button class="btn" type="button" data-menu-open>${l.featured.button}</button></div></article></div></section>${gallerySection}<section class="section"><div class="wrap"><article class="card"><h2>${l.review.title}</h2><p>${l.review.text}</p><p class="notice">※ ${l.review.notice}</p></article></div></section><section class="section alt"><div class="wrap cta"><div><h2>${l.sweet}</h2><p>${l.sweetText}</p><p><strong>${l.naraAddress}</strong></p><div class="actions"><a class="btn" href="/${l.dir}">${l.visit}</a></div></div><img src="/assets/thai-milk-tea.webp" width="640" height="929" loading="lazy" decoding="async" alt="5號店 Nara Select Thai milk tea"></div></section></main><dialog class="menu-dialog" id="menu" data-menu-dialog aria-labelledby="menu-title"><div class="menu-head"><h2 id="menu-title">${l.menu.title}</h2><button class="menu-close" type="button" data-menu-close aria-label="${l.menu.close}">×</button></div><div class="menu-grid">${menuHtml}</div><p class="notice">※ ${l.menu.note}</p><div class="actions"><a class="btn panda" href="${foodpanda}" target="_blank" rel="noopener sponsored">${l.menu.order}</a><button class="btn alt" type="button" data-menu-close>${l.menu.close}</button></div></dialog><footer><div class="wrap">鐵路一村店家資訊・由 5號店 Nara Select 網站整理<br>© 2026 Nara Select</div></footer><script>const d=document.querySelector('[data-menu-dialog]');document.querySelectorAll('[data-menu-open]').forEach(button=>button.addEventListener('click',()=>d.showModal()));d.querySelectorAll('[data-menu-close]').forEach(button=>button.addEventListener('click',()=>d.close()));d.addEventListener('click',event=>{if(event.target===d)d.close()});document.querySelector('[data-vendor-language]').value=location.pathname.startsWith('/en/')?'/en/${slug}':location.pathname.startsWith('/ja/')?'/ja/${slug}':location.pathname.startsWith('/th/')?'/th/${slug}':location.pathname.startsWith('/vi/')?'/vi/${slug}':location.pathname.startsWith('/id/')?'/id/${slug}':'/${slug}'</script><script src="/assets/vendor-language.js?v=20260918-1" defer></script><script src="/assets/site-tracking.js?v=20260918-ga4" defer></script></body></html>`;
  await mkdir(new URL(`${l.dir}railway-village/`, root), {recursive:true});
  await writeFile(new URL(path, root), html);
}
