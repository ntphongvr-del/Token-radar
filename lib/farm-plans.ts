/**
 * farm-plans.ts — Thu vien mau buoc farm cho tung loai protocol (token launch radar).
 *
 * Export chinh: FARM_TEMPLATES — key la category DefiLlama (vd: "Dexs", "Lending"),
 * value la mang buoc mau (3-12 buoc, moi buoc 20-600 ky tu).
 *
 * Placeholder:
 *   {name}  — ten protocol (vd: te ten trong snapshot DefiLlama)
 *   {chain} — ten chain chinh cua protocol
 * Dung renderFarmSteps(category, name, chain) de dien placeholder thanh farm_steps
 * hoan chinh cho tung dong trong board.json.
 *
 * Quy tac viet buoc: moi buoc la mot hanh dong cu the tren dung loai protocol do,
 * ghi ro ton bao nhieu tien (von + gas/phi) va mat bao lau, khong khau hieu chung chung.
 * So tien la co mau (von thuong 10-300 do, chia nho theo dot); gas/phi thay doi theo
 * chain va thoi diem, phai kiem tra thuc te truoc khi lam. Day khong phai loi khuyen
 * tai chinh — chi la mau de main.ts sinh farm_steps.
 *
 * Nguon category: trang Categories cua DefiLlama (defillama.com/categories),
 * tra cuu ngay 23/11/2026. File nay do Ngự Trù tự viet, khong copy starter.
 */

export type FarmTemplate = string[];

/**
 * Mau buoc farm theo category DefiLlama.
 * Key phai khop dung ten category trong snapshot DefiLlama (phân biệt hoa/thường).
 */
export const FARM_TEMPLATES: Record<string, FarmTemplate> = {
  // ---------------------------------------------------------------- Dexs
  // AMM / order-book DEX: swap, them LP, claim phi, vote gauge.
  Dexs: [
    "Nạp 100 USDC vào ví trên {chain} (giữ lại ~5 đô token gas của chain đó) rồi mở {name}, swap 50 USDC sang token của pool chính; tốn ~50 đô vốn + 0.3–1 đô gas, mất 5 phút.",
    "Thêm thanh khoản 50 USDC + lượng token tương đương vào pool {name} trên {chain}, chọn biên độ giá hẹp (±10%) để phí cao hơn; tốn ~50 đô vốn, mất 10 phút, giữ tối thiểu 7 ngày.",
    "Mỗi tuần vào {name} claim phí giao dịch đã tích lũy rồi gộp lại vào cùng pool; tốn 0.5–2 đô gas mỗi lần, mất 5 phút/lần, làm 4 tuần liên tiếp.",
    "Swap ngược 25 USDC qua một cặp pool khác trên {name} để tạo volume ở 2 pool thay vì 1; tốn ~25 đô vốn luân chuyển + 0.5–1 đô gas, mất 5 phút.",
    "Dùng tính năng limit order (nếu {name} có) đặt 1 lệnh mua token khi giá giảm 5%, để lệnh chạy 3–7 ngày; tốn ~20 đô vốn + 0.5 đô gas, mất 5 phút đặt lệnh.",
    "Tham gia vote gauge/bribe (nếu {name} có) bằng LP token, vote cho pool mình đang cung cấp; tốn 0.5–1 đô gas, mất 5 phút, mỗi epoch 7 ngày vote 1 lần.",
    "Rút một nửa LP sau 14 ngày, swap về USDC rồi nạp lại vào pool mới của {name} để ghi nhận thêm 1 chu kỳ nạp/rút; tốn ~25 đô vốn luân chuyển + 1–2 đô gas, mất 10 phút.",
    "Ghi lại toàn bộ hash giao dịch, số tiền và ngày làm trên {name} vào file riêng để đối chiếu khi snapshot/airdrop; tốn 0 đô, mất 5 phút mỗi tuần.",
  ],

  // -------------------------------------------------------------- Lending
  // Money market: supply the chap, vay, loop, tra no, giu health factor.
  Lending: [
    "Nạp 200 USDC vào ví {chain}, supply 100 USDC lên {name} làm tài sản thế chấp, giữ lại 100 USDC dự phòng; tốn ~100 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Vay 40 USDC (tối đa 50% giá trị thế chấp) bằng tài sản đã supply trên {name}, giữ health factor trên 2.0 để tránh thanh lý; tốn 0.5–2 đô gas, mất 5 phút.",
    "Dùng 40 USDC vừa vay mua thêm tài sản thế chấp rồi supply lại vào {name} (loop 1 vòng), tăng tổng supply lên ~140 USDC; tốn 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần claim lãi supply + phần thưởng (nếu có) trên {name} rồi supply lại, lãi kép chạy 4 tuần; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Trả 20 USDC nợ vay trên {name} sau 14 ngày để health factor lên trên 2.5 rồi vay lại 20 USDC, tạo thêm 1 chu kỳ vay/trả; tốn ~20 đô vốn luân chuyển + 1–2 đô gas, mất 10 phút.",
    "Supply thêm 50 USDC vào một thị trường khác của {name} (ví dụ thị trường ETH thay vì USDC) để đa dạng tài sản; tốn ~50 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Theo dõi health factor trên {name} mỗi 3 ngày, nếu xuống dưới 1.8 thì trả nợ hoặc nạp thêm thế chấp ngay; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
  ],

  // ----------------------------------------------------------- Derivatives
  // Perp / futures / options: mo lenh long-short, dong lenh, quan ly funding.
  Derivatives: [
    "Nạp 100 USDC làm margin vào {name} trên {chain}, mở 1 lệnh long BTC đòn bẩy 2x trị giá 50 USDC, đặt stop-loss −5%; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mở thêm 1 lệnh short ETH 25 USDC đòn bẩy 2x trên {name} để có cả 2 chiều long/short; tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Đóng 1 lệnh trên {name} sau 2–3 ngày khi lãi/lỗ trong ±3%, chốt phí funding đã trả/nhận để ghi nhận volume; tốn 0.5–2 đô gas, mất 5 phút.",
    "Mỗi tuần mở 2 lệnh nhỏ 20–30 USDC trên {name}, mỗi lệnh giữ 2–4 ngày rồi đóng, duy trì đều 4 tuần; tốn ~50 đô vốn luân chuyển/tuần + 2–4 đô gas, mất 15 phút/tuần.",
    "Thử 1 lệnh limit/market qua cặp giao dịch ít người chơi trên {name} (ví dụ altcoin perp), khối lượng 20 USDC; tốn ~20 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Nạp 50 USDC vào vault/market-making (nếu {name} có) để cung cấp thanh khoản cho trader, giữ 14 ngày rồi rút; tốn ~50 đô vốn + 1–2 đô gas, mất 10 phút.",
    "Kiểm tra funding rate trên {name} trước mỗi lệnh, tránh mở lệnh khi funding trên 0.05%/8h; tốn 0 đô, mất 2 phút/lần kiểm tra.",
  ],

  // ---------------------------------------------------------------- Bridge
  // Bridge mint/burn: bridge 2 chieu, doi chain dich, lap lai theo tuan.
  Bridge: [
    "Chuẩn bị 50 USDC trên {chain} + 5 đô token gas của chain đích, mở {name} và bridge 25 USDC sang chain đích; tốn ~25 đô vốn + 1–3 đô phí bridge, mất 10–20 phút chờ xác nhận.",
    "Bridge ngược 12 USDC từ chain đích về {chain} qua {name} sau 2–3 ngày để tạo giao dịch 2 chiều; tốn ~12 đô vốn luân chuyển + 1–3 đô phí, mất 10–20 phút.",
    "Bridge 25 USDC còn lại sang một chain thứ ba qua {name} để có 3 chain trong lịch sử; tốn ~25 đô vốn + 1–3 đô phí, mất 10–20 phút.",
    "Lặp lại 1 lần bridge 10–20 USDC mỗi tuần qua {name}, làm 4 tuần liên tiếp để volume đều theo thời gian; tốn ~20 đô vốn luân chuyển/tuần + 1–3 đô phí/lần, mất 15 phút/lần.",
    "Dùng {name} bridge một tài sản khác ngoài USDC (ví dụ 0.01 ETH) với giá trị ~20 đô để đa dạng loại tài sản; tốn ~20 đô vốn + 1–3 đô phí, mất 10–20 phút.",
    "Lưu lại hash của từng lần bridge trên {name}, kiểm tra số tiền nhận đủ ở chain đích trước khi làm lần tiếp theo; tốn 0 đô, mất 5 phút/lần kiểm tra.",
  ],

  // -------------------------------------------------------- Liquid Staking
  // Stake nhan LST: stake, dung LST di lending/LP, unstake 1 phan roi stake lai.
  "Liquid Staking": [
    "Stake 0.1 ETH (khoảng 300 đô) trên {name} ở {chain} để nhận token LST tương ứng, giữ lại 0.01 ETH làm gas; tốn ~300 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Mang token LST vừa nhận từ {name} đi supply vào lending trên {chain} để vừa hưởng lãi staking vừa hưởng lãi lending; tốn 0.5–2 đô gas, mất 10 phút, giữ ít nhất 14 ngày.",
    "Thêm 0.05 ETH stake tiếp trên {name} sau 7 ngày để tăng tổng lượng stake theo từng đợt; tốn ~150 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Dùng LST của {name} làm LP trong pool LST/ETH trên DEX của {chain}, cung cấp 50 đô LST + 50 đô ETH, giữ 14 ngày; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Unstake một phần nhỏ (0.02 ETH) trên {name} rồi stake lại sau 3 ngày để ghi nhận thêm chu kỳ stake/unstake; tốn ~60 đô vốn luân chuyển + 2–4 đô gas, mất 10 phút, chờ unstake 1–3 ngày.",
    "Mỗi tuần kiểm tra tỉ giá LST/ETH trên {name}, nếu lệch quá 1% thì cân bằng lại LP hoặc stake thêm; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
  ],

  // ----------------------------------------------------------------- Yield
  // Vault tra thuong staking/LP: nap vault, claim lai kep, rut/nap lai.
  Yield: [
    "Nạp 100 USDC vào vault {name} trên {chain}, chọn vault có APY hiển thị và thời gian khóa rõ ràng; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ tiền trong vault {name} ít nhất 14 ngày, mỗi tuần claim phần thưởng rồi nạp lại vào cùng vault để lãi kép; tốn 0.5–2 đô gas/lần claim, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào vault thứ hai của {name} (chiến lược khác, ví dụ vault ETH thay vì USDC) sau 7 ngày; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Rút 50 USDC khỏi vault {name} sau 14 ngày rồi nạp lại sau 2 ngày để ghi nhận 1 chu kỳ rút/nạp; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "So sánh APY thực nhận trên {name} với APY quảng cáo sau 7 ngày, nếu thấp hơn một nửa thì chuyển sang vault khác cùng protocol; tốn 1–3 đô gas, mất 15 phút.",
    "Đọc kỹ phí rút sớm/phí hiệu suất của vault {name} trước khi nạp, tránh vault phí rút trên 1%; tốn 0 đô, mất 10 phút đọc.",
  ],

  // ------------------------------------------------------- Yield Aggregator
  // Tu dong gom lai qua nhieu protocol: nap vault auto-compound, migrate vault.
  "Yield Aggregator": [
    "Nạp 100 USDC vào vault tự động gộp lãi của {name} trên {chain}, bật auto-compound nếu có; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Để vault {name} tự gộp lãi 14 ngày, mỗi tuần kiểm tra số dư tăng và ghi lại APY thực; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào vault thứ hai của {name} ở chiến lược khác (ví dụ LP thay vì lending) sau 7 ngày; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Chuyển 50 USDC từ vault này sang vault khác của {name} (migrate) để thử 2 chiến lược trong cùng protocol; tốn 1–3 đô gas, mất 10 phút.",
    "Rút toàn bộ khỏi 1 vault {name} sau 21 ngày, giữ lại 1 vault còn chạy để so sánh lợi nhuận; tốn 1–3 đô gas, mất 10 phút.",
    "Đọc báo cáo chiến lược của vault {name} (nó đi qua những protocol nào) trước khi nạp tiền lớn; tốn 0 đô, mất 15 phút đọc.",
  ],

  // -------------------------------------------------------------------- CDP
  // The chap mint stablecoin: nap the chap, mint, tra no, giu ti le the chap.
  CDP: [
    "Nạp 0.1 ETH (khoảng 300 đô) làm tài sản thế chấp lên {name} trên {chain}, mint 100 stablecoin của protocol (tỉ lệ thế chấp 300%); tốn ~300 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Dùng 100 stablecoin vừa mint để mua thêm ETH rồi nạp lại làm thế chấp trên {name}, nâng tổng thế chấp lên ~0.13 ETH; tốn 1–3 đô gas, mất 10 phút.",
    "Trả 50 stablecoin trên {name} để giảm nợ sau 7 ngày, giữ tỉ lệ thế chấp trên 250% để tránh thanh lý; tốn ~50 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Mint thêm 50 stablecoin trên {name} sau 14 ngày khi giá ETH tăng, dùng để supply vào lending kiếm lãi; tốn 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ lệ thế chấp trên {name}, nếu xuống dưới 200% thì trả nợ hoặc nạp thêm ETH ngay; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
    "Đóng vị thế CDP trên {name} sau 30 ngày: trả hết nợ, rút toàn bộ ETH thế chấp về ví; tốn 1–3 đô gas, mất 10 phút.",
  ],

  // -------------------------------------------------------------- Restaking
  // Stake lai ETH de bao mat AVS: uy quyen AVS, giu 30 ngay, rut 1 phan.
  Restaking: [
    "Stake 0.1 ETH qua {name} trên {chain} để restake vào dịch vụ AVS, giữ lại 0.01 ETH làm gas; tốn ~300 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Chọn 2–3 AVS có phần thưởng hiển thị trên {name} và ủy quyền restake cho cả 3 thay vì chỉ 1; tốn 1–3 đô gas, mất 15 phút.",
    "Giữ vị thế restake trên {name} ít nhất 30 ngày, mỗi tuần kiểm tra phần thưởng AVS đã tích lũy; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 0.05 ETH restake trên {name} sau 14 ngày để tăng lượng stake theo từng đợt; tốn ~150 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Rút 0.02 ETH khỏi restake trên {name} sau 21 ngày rồi restake lại sau 3 ngày để ghi nhận chu kỳ rút/nạp; tốn ~60 đô vốn luân chuyển + 2–4 đô gas, mất 10 phút, chờ rút 1–7 ngày.",
    "Đọc danh sách AVS và điều kiện slashing của {name} trước khi ủy quyền, tránh AVS không rõ ràng; tốn 0 đô, mất 15 phút đọc.",
  ],

  // -------------------------------------------------------- Liquid Restaking
  // Nhan LRT: mint LRT, dung LRT di lending/LP, doi/mint lai.
  "Liquid Restaking": [
    "Nạp 0.1 ETH lên {name} trên {chain} để nhận token LRT, giữ lại 0.01 ETH làm gas; tốn ~300 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Mang LRT vừa nhận từ {name} đi supply vào lending trên {chain} để hưởng thêm lãi ngoài phần thưởng restake; tốn 0.5–2 đô gas, mất 10 phút, giữ ít nhất 14 ngày.",
    "Cung cấp LP 50 đô LRT của {name} + 50 đô ETH trên DEX của {chain}, giữ 14 ngày rồi kiểm tra tỉ giá LRT/ETH; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Nạp thêm 0.05 ETH để mint thêm LRT trên {name} sau 7 ngày, tăng tổng vị thế theo từng đợt; tốn ~150 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Đổi một phần LRT sang ETH trên DEX rồi mint lại LRT trên {name} sau 14 ngày để ghi nhận chu kỳ đổi/mint; tốn ~50 đô vốn luân chuyển + 2–4 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá LRT/ETH và phần thưởng restake trên {name}, nếu lệch quá 1% thì cân bằng lại; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
  ],

  // -------------------------------------------------------------------- RWA
  // Token hoa tai san thuc: mua token RWA, giu qua chu ky tra lai, dung lam the chap.
  RWA: [
    "Nạp 100 USDC vào {name} trên {chain} để mua token đại diện tài sản thực (ví dụ tín phiếu kho bạc token hóa), giữ lại 5 đô USDC làm gas; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ token RWA của {name} ít nhất 30 ngày để nhận đủ 1 chu kỳ trả lãi (thường trả theo tháng); tốn 0 đô khi chỉ giữ, mất 5 phút/tuần kiểm tra.",
    "Mua thêm 50 USDC token RWA khác loại trên {name} sau 14 ngày (ví dụ trái phiếu thay vì tín phiếu) để đa dạng tài sản; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Bán một phần 25 USDC token RWA trên {name} sau 30 ngày rồi mua lại sau 3 ngày để ghi nhận chu kỳ mua/bán; tốn ~25 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Dùng token RWA của {name} làm thế chấp vay 30 USDC trên lending (nếu được chấp nhận) rồi trả sau 7 ngày; tốn 1–3 đô gas, mất 15 phút.",
    "Đọc kỹ tài liệu pháp lý và đơn vị lưu ký của tài sản trên {name} trước khi nạp tiền lớn; tốn 0 đô, mất 20 phút đọc.",
  ],

  // ----------------------------------------------------------- DEX Aggregator
  // Gom thanh khoan nhieu DEX: swap qua duong re nhat, limit order, so sanh gia.
  "DEX Aggregator": [
    "Swap 50 USDC sang ETH qua {name} trên {chain}, để aggregator tự chọn đường swap rẻ nhất; tốn ~50 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Mỗi tuần swap 20–30 USDC qua {name} với một cặp token khác nhau, làm 4 tuần để volume đều theo thời gian; tốn ~25 đô vốn luân chuyển/tuần + 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Dùng tính năng limit order của {name} đặt 1 lệnh mua ETH khi giá giảm 3%, để lệnh chạy 3–7 ngày; tốn ~30 đô vốn + 0.5 đô gas, mất 5 phút.",
    "Thử swap qua {name} với số tiền lớn hơn 100 USDC một lần để ghi nhận volume lớn, chia 2 lần nếu trượt giá cao; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Dùng {name} để swap token ít thanh khoản (ví dụ token mới trên {chain}) trị giá 20 USDC, kiểm tra trượt giá trước khi xác nhận; tốn ~20 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "So sánh giá nhận được trên {name} với 1 DEX khác trước mỗi lần swap lớn, chụp lại chênh lệch để đối chiếu; tốn 0 đô, mất 5 phút/lần.",
  ],

  // ----------------------------------------------------------------- Options
  // Quyen chon: mua call/put, dong som khi lai, viet option nhan phi.
  Options: [
    "Nạp 50 USDC vào {name} trên {chain}, mua 1 quyền chọn mua (call) ETH kỳ hạn 7 ngày với phí quyền chọn ~5 USDC; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mua thêm 1 quyền chọn bán (put) ETH 25 USDC kỳ hạn 14 ngày trên {name} để có cả 2 chiều; tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ quyền chọn trên {name} đến đáo hạn hoặc đóng sớm khi lãi 20%, ghi lại phí quyền chọn đã trả; tốn 0.5–2 đô gas khi đóng, mất 5 phút.",
    "Mỗi tuần mua 1 quyền chọn nhỏ 10–20 USDC trên {name} với kỳ hạn 7 ngày, làm 4 tuần liên tiếp; tốn ~15 đô vốn/tuần + 0.5–2 đô gas/lần, mất 10 phút/lần.",
    "Thử bán 1 quyền chọn (viết option) trên {name} với tài sản thế chấp 50 USDC, nhận phí quyền chọn và quản lý rủi ro; tốn ~50 đô vốn + 1–3 đô gas, mất 15 phút.",
    "Đọc kỹ giá thực hiện, ngày đáo hạn và phí trên {name} trước khi mua, tránh quyền chọn hết hạn vô giá trị; tốn 0 đô, mất 10 phút đọc.",
  ],

  // ------------------------------------------------------- Cross Chain Bridge
  // Bridge qua pool thanh khoan: bridge, cung cap thanh khoan pool bridge, doi tuyen.
  "Cross Chain Bridge": [
    "Bridge 25 USDC từ {chain} sang chain đích qua pool thanh khoản của {name}, chờ 10–30 phút để nhận đủ tiền; tốn ~25 đô vốn + 1–3 đô phí, mất 10 phút thao tác.",
    "Cung cấp 50 USDC thanh khoản vào pool bridge của {name} trên {chain} để hưởng phí từ người bridge, giữ 14 ngày; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Bridge ngược 12 USDC về {chain} qua {name} sau 3 ngày để tạo giao dịch 2 chiều; tốn ~12 đô vốn luân chuyển + 1–3 đô phí, mất 10–20 phút.",
    "Mỗi tuần bridge 10–20 USDC qua một tuyến khác nhau của {name} (đổi chain đích), làm 4 tuần; tốn ~15 đô vốn luân chuyển/tuần + 1–3 đô phí/lần, mất 15 phút/lần.",
    "Rút một nửa thanh khoản khỏi pool bridge {name} sau 14 ngày rồi nạp lại vào pool tuyến khác; tốn 1–3 đô gas, mất 10 phút.",
    "Kiểm tra phí và thời gian chờ của từng tuyến trên {name} trước khi bridge, tránh tuyến phí trên 5 đô; tốn 0 đô, mất 5 phút/lần.",
  ],

  // --------------------------------------------------------------- Launchpad
  // Mo ban token moi: dang ky mua, stake lay phan bo, claim sau mo ban.
  Launchpad: [
    "Nạp 50 USDC vào {name} trên {chain} để đăng ký mua token đợt mở bán, giữ lại 5 đô làm gas; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Stake 20 USDC token của {name} (nếu có yêu cầu) để đủ điều kiện phân bổ mua token mới, giữ 14 ngày; tốn ~20 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Tham gia 2 đợt mở bán khác nhau trên {name} trong 30 ngày, mỗi đợt 30–50 USDC, ghi lại phân bổ nhận được; tốn ~40 đô vốn/đợt + 1–2 đô gas, mất 15 phút/đợt.",
    "Claim token đã mua trên {name} sau khi mở bán kết thúc, giữ 7 ngày rồi bán một nửa nếu cần; tốn 0.5–2 đô gas, mất 5 phút.",
    "Đọc kỹ điều kiện khóa token (vesting) của đợt mở bán trên {name} trước khi nạp tiền; tốn 0 đô, mất 15 phút đọc.",
  ],

  // --------------------------------------------------------------- Insurance
  // Bao hiem DeFi: mua goi bao hiem, cung cap von vao pool bao hiem, gia han.
  Insurance: [
    "Mua bảo hiểm 100 USDC cho vị thế DeFi trên {name} ở {chain}, chọn gói 30 ngày phí ~1–2 USDC; tốn ~2 đô phí + 0.5–2 đô gas, mất 10 phút.",
    "Nạp 50 USDC vào pool bảo hiểm của {name} để cung cấp vốn bảo hiểm và hưởng phí, giữ 30 ngày; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Mua thêm 1 gói bảo hiểm khác trên {name} (ví dụ bảo hiểm smart contract thay vì bảo hiểm depeg) trị giá 50 USDC, phí ~1 USDC; tốn ~1 đô phí + 0.5–2 đô gas, mất 10 phút.",
    "Gia hạn gói bảo hiểm trên {name} thêm 30 ngày trước khi hết hạn 3 ngày để không bị gián đoạn; tốn ~1–2 đô phí + 0.5–2 đô gas, mất 5 phút.",
    "Đọc kỹ điều kiện bồi thường và loại trừ của {name} trước khi mua, ghi lại số hợp đồng bảo hiểm; tốn 0 đô, mất 15 phút đọc.",
  ],

  // --------------------------------------------------------- Prediction Market
  // Thi truong du doan: dat cuoc thi truong, ban vi the som, dung tien nho.
  "Prediction Market": [
    "Nạp 20 USDC vào {name} trên {chain}, đặt cược 10 USDC vào 1 thị trường (ví dụ kết quả sự kiện), giữ lại 10 USDC dự phòng; tốn ~10 đô vốn + 0.5–1 đô gas, mất 5 phút.",
    "Đặt thêm 10 USDC vào 1 thị trường khác trên {name} với hướng ngược lại để có 2 vị thế; tốn ~10 đô vốn + 0.5–1 đô gas, mất 5 phút.",
    "Mỗi tuần tham gia 1 thị trường mới trên {name} với 5–10 USDC, làm 4 tuần để có lịch sử đều; tốn ~8 đô vốn/tuần + 0.5–1 đô gas/lần, mất 10 phút/lần.",
    "Bán vị thế trước khi thị trường đóng trên {name} nếu giá đã lãi 20%, chốt lời thay vì chờ kết quả; tốn 0.5–1 đô gas, mất 5 phút.",
    "Chỉ dùng tiền nhỏ (dưới 50 USDC tổng) trên {name} vì thị trường dự đoán biến động mạnh và có thể mất hết; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
  ],

  // ---------------------------------------------------------- Stablecoin Issuer
  // Phat hanh stablecoin: mint, supply stablecoin, stake tiet kiem, doi/mint lai.
  "Stablecoin Issuer": [
    "Nạp 100 USDC vào {name} trên {chain} để mint 100 stablecoin của protocol, giữ lại 5 đô làm gas; tốn ~100 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Dùng 50 stablecoin vừa mint từ {name} để supply vào lending trên {chain} kiếm lãi, giữ 50 còn lại trong ví; tốn 0.5–2 đô gas, mất 10 phút, giữ ít nhất 14 ngày.",
    "Đổi 50 stablecoin của {name} sang USDC trên DEX rồi mint lại 50 stablecoin sau 7 ngày để ghi nhận chu kỳ mint/đổi; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Stake 50 stablecoin của {name} vào vault tiết kiệm của protocol (nếu có) để hưởng lãi suất tiết kiệm, giữ 30 ngày; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá stablecoin của {name} so với 1 đô, nếu lệch quá 0.5% thì cân nhắc đổi sang USDC; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
  ],

  // ------------------------------------------------------------- Staking Pool
  // Stake khong co receipt token: stake, them dot, uy quyen validator, unstake.
  "Staking Pool": [
    "Stake 0.05 ETH (khoảng 150 đô) vào pool staking {name} trên {chain}, giữ lại 0.01 ETH làm gas; tốn ~150 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Giữ vị thế stake trên {name} ít nhất 30 ngày, mỗi tuần kiểm tra phần thưởng staking đã tích lũy; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Stake thêm 0.02 ETH vào {name} sau 14 ngày để tăng tổng lượng stake theo từng đợt; tốn ~60 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Ủy quyền stake sang validator khác trong pool {name} (nếu được chọn) để đa dạng validator, giữ 14 ngày; tốn 0.5–2 đô gas, mất 10 phút.",
    "Unstake một phần 0.01 ETH trên {name} sau 30 ngày rồi stake lại sau 3 ngày để ghi nhận chu kỳ unstake/stake; tốn ~30 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút, chờ unstake 1–3 ngày.",
  ],

  // -------------------------------------------------------- Liquidity Manager
  // Quan ly LP tu dong: nap vault quan ly bien do, de tu can bang, rut/nap lai.
  "Liquidity Manager": [
    "Nạp 100 USDC (50 USDC + 50 USDC token tương đương) vào vault quản lý thanh khoản {name} trên {chain}, chọn biên độ do vault đề xuất; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Để vault {name} tự cân bằng lại biên độ 14 ngày, mỗi tuần kiểm tra vị thế có còn trong biên độ không; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào vault {name} sau 7 ngày khi biên độ đã được cân bằng lại; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Rút một nửa khỏi vault {name} sau 21 ngày rồi nạp lại sau 2 ngày để ghi nhận chu kỳ rút/nạp; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "So sánh phí thu được trên {name} với tự cung cấp LP thủ công sau 14 ngày, ghi lại chênh lệch; tốn 0 đô, mất 10 phút so sánh.",
  ],

  // -------------------------------------------------------------------- Farm
  // Farm phan thuong: nap cap token vao farm, claim gop lai, chuyen farm.
  Farm: [
    "Nạp 50 USDC + token tương đương vào farm {name} trên {chain} để nhận phần thưởng farm, giữ lại 5 đô làm gas; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần claim phần thưởng farm trên {name} rồi gộp lại vào cùng farm để lãi kép, làm 4 tuần; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào farm thứ hai của {name} (cặp token khác) sau 7 ngày; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Rút khỏi farm {name} sau 21 ngày, bán một nửa phần thưởng rồi nạp lại phần còn lại; tốn 1–3 đô gas, mất 15 phút.",
    "Kiểm tra tỉ lệ phần thưởng/APR của farm {name} mỗi tuần, nếu APR giảm quá một nửa thì chuyển farm khác; tốn 0 đô, mất 5 phút/lần.",
  ],

  // ----------------------------------------------------------------- Indexes
  // Chi so ro token: mua chi so, giu 30 ngay, nap them dot, doi chi so.
  Indexes: [
    "Nạp 100 USDC vào chỉ số {name} trên {chain} để mua rổ token theo tỉ trọng chỉ số, giữ lại 5 đô làm gas; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Giữ vị thế chỉ số {name} ít nhất 30 ngày, mỗi tuần kiểm tra tỉ trọng rổ có thay đổi không; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào {name} sau 14 ngày để tăng vị thế theo từng đợt; tốn ~50 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Đổi một phần chỉ số {name} sang chỉ số khác cùng protocol sau 21 ngày để thử 2 rổ khác nhau; tốn 1–3 đô gas, mất 10 phút.",
    "Đọc thành phần rổ và phí quản lý của {name} trước khi nạp tiền lớn, tránh chỉ số phí trên 1%/năm; tốn 0 đô, mất 15 phút đọc.",
  ],

  // ----------------------------------------------------------------- Payments
  // Thanh toan: chuyen tien, thanh toan dinh ky, nhan roi chuyen tiep.
  Payments: [
    "Nạp 50 USDC vào {name} trên {chain}, chuyển 20 USDC cho 1 ví khác qua protocol để thử thanh toán; tốn ~20 đô vốn + 0.5–1 đô phí, mất 5 phút.",
    "Thiết lập 1 khoản thanh toán định kỳ 10 USDC/tuần qua {name} trong 4 tuần để có lịch sử đều; tốn ~10 đô vốn/tuần + 0.5–1 đô phí/lần, mất 5 phút thiết lập.",
    "Dùng {name} để thanh toán 25 USDC cho 1 dịch vụ/hóa đơn (nếu được hỗ trợ) trên {chain}; tốn ~25 đô vốn + 0.5–1 đô phí, mất 10 phút.",
    "Nhận 20 USDC qua {name} từ ví khác rồi chuyển tiếp 10 USDC đi để tạo cả chiều nhận và gửi; tốn 0.5–1 đô phí, mất 10 phút.",
    "Kiểm tra lịch sử giao dịch trên {name} mỗi tuần, đảm bảo mọi khoản thanh toán đều đã xác nhận; tốn 0 đô, mất 5 phút/lần.",
  ],

  // --------------------------------------------------------------- Synthetics
  // Tai san tong hop: the chap mint tai san tong hop, giu, burn/rut, giao dich.
  Synthetics: [
    "Nạp 100 USDC làm thế chấp lên {name} trên {chain} để mint 50 USDC tài sản tổng hợp theo giá tài sản gốc; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Giữ tài sản tổng hợp của {name} ít nhất 14 ngày, mỗi tuần kiểm tra giá có bám sát tài sản gốc không; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Mint thêm 50 USDC tài sản tổng hợp khác loại trên {name} sau 7 ngày để đa dạng; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Đốt (burn) một nửa tài sản tổng hợp trên {name} sau 14 ngày để rút thế chấp, rồi mint lại sau 3 ngày; tốn ~25 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Dùng tài sản tổng hợp của {name} để giao dịch trên DEX của {chain} với 20 USDC, kiểm tra trượt giá trước; tốn ~20 đô vốn + 0.5–2 đô gas, mất 10 phút.",
  ],

  // ------------------------------------------------------------ Risk Curators
  // Nha quan ly rui ro (curator) quan ly vault cho vay: nap vault cua curator,
  // so sanh curator, chia von giua 2 vault, claim thuong, doi curator.
  "Risk Curators": [
    "Nạp 100 USDC vào vault của {name} trên {chain}, chọn vault do curator quản lý có lịch sử rõ ràng và phí hiệu suất dưới 10%; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Chia 100 USDC còn lại sang vault thứ hai của {name} do một curator khác quản lý để so sánh lợi nhuận 2 curator; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ lệ sử dụng vốn và lợi nhuận thực của từng vault {name}, ghi lại APY tuần; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Chuyển 50 USDC từ vault lợi nhuận thấp sang vault lợi nhuận cao hơn của {name} sau 14 ngày nếu chênh lệch APY trên 2%; tốn 1–3 đô gas, mất 10 phút.",
    "Claim phần thưởng curator (nếu {name} có) mỗi 2 tuần rồi nạp lại vào cùng vault để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Đọc báo cáo rủi ro của curator trên {name} (nó cho vay thị trường nào, tỉ lệ thế chấp bao nhiêu) trước khi nạp thêm tiền lớn; tốn 0 đô, mất 15 phút đọc.",
    "Rút một nửa khỏi vault {name} sau 30 ngày rồi nạp lại sau 3 ngày để ghi nhận 1 chu kỳ rút/nạp; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
  ],

  // ------------------------------------------------- Onchain Capital Allocator
  // Bo phan bo von onchain: nap vault phan bo, chon chien luoc, theo doi phan bo.
  "Onchain Capital Allocator": [
    "Nạp 100 USDC vào vault phân bổ vốn của {name} trên {chain}, chọn chiến lược có mô tả rõ ràng (ví dụ lending, basis hay LP) và thời gian khóa; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra bảng phân bổ của {name} xem vốn đang nằm ở chiến lược nào và lợi nhuận từng phần; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào {name} sau 7 ngày khi đã thấy phân bổ chạy ổn định 1 tuần; tốn ~50 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Chuyển 50 USDC từ chiến lược lợi nhuận thấp sang chiến lược khác của {name} (nếu cho đổi) sau 14 ngày; tốn 1–3 đô gas, mất 10 phút.",
    "Claim phần thưởng phân bổ trên {name} mỗi 2 tuần rồi nạp lại vào cùng vault để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Rút toàn bộ khỏi 1 chiến lược của {name} sau 30 ngày, giữ lại chiến lược còn chạy để so sánh lợi nhuận; tốn 1–3 đô gas, mất 10 phút.",
  ],

  // ------------------------------------------------------------ Basis Trading
  // Giao dich basis (mua spot + short perp): nap vault basis, theo doi funding.
  "Basis Trading": [
    "Nạp 100 USDC vào vault basis của {name} trên {chain}, đọc kỹ chiến lược basis (mua spot + short perp) và mức funding kỳ vọng; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ tiền trong vault {name} ít nhất 21 ngày để đi qua đủ chu kỳ funding (thường tính theo 8 giờ); tốn 0 đô khi chỉ giữ, mất 5 phút/tuần kiểm tra.",
    "Mỗi tuần kiểm tra funding rate thực nhận trên {name}, nếu funding âm 2 tuần liên tiếp thì cân nhắc rút một nửa; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 50 USDC vào vault basis thứ hai của {name} (cặp tài sản khác) sau 7 ngày để đa dạng basis; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Claim lợi nhuận basis trên {name} mỗi 2 tuần rồi nạp lại vào cùng vault để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Rút 50 USDC khỏi vault {name} sau 30 ngày rồi nạp lại sau 3 ngày để ghi nhận 1 chu kỳ rút/nạp; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
  ],

  // --------------------------------------------------------------------- Chain
  // Chuoi L1/L2: bridge sang chain, dung app goc, stake token goc, LP tren DEX goc.
  Chain: [
    "Bridge 50 USDC từ Ethereum sang {chain} qua cầu nối chính thức của chain (hoặc cầu {name} hỗ trợ), giữ lại 5 đô làm gas; tốn ~50 đô vốn + 1–3 đô phí bridge, mất 10–20 phút.",
    "Dùng 25 USDC trên {chain} để thử 1 app gốc của chain qua {name} (ví dụ swap trên DEX gốc hoặc supply lên lending gốc); tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Stake 25 USDC token gốc của {chain} qua {name} (nếu có staking) để vừa hưởng lãi vừa ghi nhận hoạt động staking, giữ ít nhất 14 ngày; tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Cung cấp 25 USDC thanh khoản vào pool chính trên DEX gốc của {chain} qua {name}, giữ 14 ngày rồi kiểm tra phí thu được; tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần làm 1 giao dịch nhỏ 10–20 USDC trên {chain} qua {name} (đổi app hoặc đổi cặp), làm 4 tuần để hoạt động đều theo thời gian; tốn ~15 đô vốn luân chuyển/tuần + 0.5–2 đô gas/lần, mất 10 phút/lần.",
    "Rút một nửa tài sản khỏi {chain} về Ethereum qua cầu nối sau 30 ngày rồi bridge lại sau 3 ngày để ghi nhận chu kỳ đi/về; tốn ~25 đô vốn luân chuyển + 1–3 đô phí, mất 15 phút.",
  ],

  // -------------------------------------------------------------------- CeDeFi
  // CeFi + DeFi: nap tien huong loi suat CeFi tren onchain, doi san pham.
  CeDeFi: [
    "Nạp 100 USDC vào {name} trên {chain} để hưởng lợi suất kiểu CeFi trên onchain, đọc kỹ đơn vị lưu ký và tài sản đảm bảo trước khi nạp; tốn ~100 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ tiền trong {name} ít nhất 30 ngày để nhận đủ 1 chu kỳ trả lãi (thường trả theo tháng); tốn 0 đô khi chỉ giữ, mất 5 phút/tuần kiểm tra.",
    "Nạp thêm 50 USDC vào sản phẩm thứ hai của {name} (ví dụ kỳ hạn khác) sau 14 ngày để đa dạng kỳ hạn; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Rút 50 USDC khỏi {name} sau 30 ngày khi hết 1 kỳ hạn rồi nạp lại sau 3 ngày để ghi nhận 1 chu kỳ rút/nạp; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Claim lãi CeDeFi trên {name} mỗi tháng rồi nạp lại vào cùng sản phẩm để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
  ],

  // ----------------------------------------------------------------- Anchor BTC
  // BTC neo gia: nap BTC/wBTC, mint san pham BTC neo, dung trong DeFi, doi lai.
  "Anchor BTC": [
    "Nạp 0.005 BTC (khoảng 300 đô) vào {name} trên {chain} để mint token BTC neo giá, giữ lại 5 đô token gas của chain; tốn ~300 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Mang token BTC neo của {name} đi supply vào lending trên {chain} để vừa giữ giá BTC vừa hưởng lãi, giữ ít nhất 14 ngày; tốn 0.5–2 đô gas, mất 10 phút.",
    "Cung cấp 100 USDC token BTC neo của {name} + 100 USDC BTC vào pool trên DEX của {chain}, giữ 14 ngày rồi kiểm tra phí; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá token BTC neo của {name} so với BTC thật, nếu lệch quá 0.5% thì cân nhắc đổi về BTC; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Đổi một nửa token BTC neo về BTC trên {name} sau 30 ngày rồi mint lại sau 3 ngày để ghi nhận 1 chu kỳ đổi/mint; tốn ~150 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
  ],

  // --------------------------------------------------------- Leveraged Farming
  // Farm don bay: nap the chap, mo vi the farm don bay, giu health factor.
  "Leveraged Farming": [
    "Nạp 100 USDC làm thế chấp lên {name} trên {chain}, mở 1 vị thế farm đòn bẩy 2x trị giá 100 USDC (50 USDC vốn + 50 USDC vay), đặt ngưỡng an toàn rõ ràng; tốn ~100 đô vốn + 1–3 đô gas, mất 15 phút.",
    "Mỗi 3 ngày kiểm tra health factor của vị thế farm trên {name}, nếu xuống dưới 1.5 thì trả nợ hoặc nạp thêm thế chấp ngay; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
    "Claim phần thưởng farm trên {name} mỗi tuần rồi bán một nửa, nạp lại một nửa vào cùng vị thế để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Giảm đòn bẩy xuống 1.5x trên {name} sau 14 ngày bằng cách trả 25 USDC nợ vay, giữ vị thế an toàn hơn; tốn ~25 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Đóng vị thế farm đòn bẩy trên {name} sau 30 ngày: trả hết nợ vay, rút toàn bộ thế chấp về ví; tốn 1–3 đô gas, mất 10 phút.",
    "Mở lại 1 vị thế farm nhỏ hơn (50 USDC, đòn bẩy 2x) trên {name} sau 3 ngày để ghi nhận chu kỳ đóng/mở; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
  ],

  // ------------------------------------------------------ Dual-Token Stablecoin
  // Stablecoin 2 token: mint stable, stake token tiet kiem, doi qua lai 2 token.
  "Dual-Token Stablecoin": [
    "Nạp 100 USDC vào {name} trên {chain} để mint 100 stablecoin của protocol, giữ lại 5 đô làm gas; tốn ~100 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Stake 50 stablecoin vừa mint từ {name} vào token tiết kiệm của protocol để hưởng lãi suất tiết kiệm, giữ 50 còn lại trong ví; tốn 0.5–2 đô gas, mất 10 phút, giữ ít nhất 14 ngày.",
    "Đổi 25 stablecoin sang token tiết kiệm của {name} rồi đổi ngược lại sau 7 ngày để ghi nhận cả 2 chiều đổi; tốn ~25 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá stablecoin của {name} so với 1 đô và lãi suất tiết kiệm, nếu stable lệch quá 0.5% thì đổi sang USDC; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
    "Rút toàn bộ khỏi {name} sau 30 ngày: unstake token tiết kiệm, đổi hết stablecoin về USDC; tốn 1–3 đô gas, mất 10 phút.",
  ],

  // ----------------------------------------------------------- Decentralized BTC
  // BTC phi tap trung: bridge BTC sang dang phi tap trung, dung trong DeFi, doi ve.
  "Decentralized BTC": [
    "Bridge 0.005 BTC (khoảng 300 đô) sang dạng BTC phi tập trung của {name} trên {chain}, giữ lại 5 đô token gas của chain; tốn ~300 đô vốn + 1–3 đô phí bridge, mất 15–30 phút.",
    "Mang BTC phi tập trung của {name} đi supply vào lending trên {chain} để hưởng lãi mà vẫn giữ giá BTC, giữ ít nhất 14 ngày; tốn 0.5–2 đô gas, mất 10 phút.",
    "Cung cấp 100 USDC BTC phi tập trung của {name} + 100 USDC BTC vào pool trên DEX của {chain}, giữ 14 ngày; tốn ~100 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá BTC phi tập trung của {name} so với BTC thật, nếu lệch quá 0.5% thì cân nhắc đổi về; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Đổi một nửa BTC phi tập trung về BTC gốc qua {name} sau 30 ngày rồi bridge lại sau 3 ngày để ghi nhận chu kỳ đi/về; tốn ~150 đô vốn luân chuyển + 1–3 đô phí, mất 15 phút.",
  ],

  // ---------------------------------------------------------- Collateral Markets
  // Thi truong the chap restaking: nap the chap, chon mang luoi, nhan thuong.
  "Collateral Markets": [
    "Nạp 0.05 ETH (khoảng 150 đô) làm tài sản thế chấp lên {name} trên {chain}, giữ lại 0.01 ETH làm gas; tốn ~150 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Chọn 2–3 mạng lưới (network) trên {name} để ủy quyền thế chấp cho cả 3 thay vì chỉ 1, đọc kỹ điều kiện slashing của từng mạng; tốn 1–3 đô gas, mất 15 phút.",
    "Giữ vị thế thế chấp trên {name} ít nhất 30 ngày, mỗi tuần kiểm tra phần thưởng từng mạng đã tích lũy; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Nạp thêm 0.02 ETH thế chấp trên {name} sau 14 ngày để tăng tổng lượng thế chấp theo từng đợt; tốn ~60 đô vốn + 1–3 đô gas, mất 5 phút.",
    "Rút 0.01 ETH khỏi thế chấp trên {name} sau 21 ngày rồi nạp lại sau 3 ngày để ghi nhận chu kỳ rút/nạp; tốn ~30 đô vốn luân chuyển + 2–4 đô gas, mất 10 phút, chờ rút 1–7 ngày.",
    "Claim phần thưởng restaking trên {name} mỗi 2 tuần rồi nạp lại vào thế chấp để lãi kép; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
  ],

  // ---------------------------------------------------------- Stablecoin Wrapper
  // Goi stablecoin: wrap stable, dung ban wrap trong DeFi, unwrap/wrap lai.
  "Stablecoin Wrapper": [
    "Nạp 100 USDC vào {name} trên {chain} để wrap thành 100 stablecoin đã gói của protocol, giữ lại 5 đô làm gas; tốn ~100 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Mang 50 stablecoin đã gói của {name} đi supply vào lending trên {chain} để hưởng lãi, giữ 50 còn lại trong ví; tốn 0.5–2 đô gas, mất 10 phút, giữ ít nhất 14 ngày.",
    "Cung cấp 50 USDC stablecoin đã gói của {name} + 50 USDC vào pool trên DEX của {chain}, giữ 14 ngày; tốn ~50 đô vốn + 1–3 đô gas, mất 10 phút.",
    "Unwrap 50 stablecoin đã gói về USDC trên {name} sau 14 ngày rồi wrap lại sau 3 ngày để ghi nhận chu kỳ unwrap/wrap; tốn ~50 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra tỉ giá stablecoin đã gói của {name} so với 1 đô, nếu lệch quá 0.5% thì đổi sang USDC; tốn 0 đô khi chỉ kiểm tra, mất 2 phút/lần.",
  ],

  // ------------------------------------------------------- Governance Incentives
  // Khuyen khich quan tri: khoa/bau, nhan bribe, bau hang tuan, claim, bau lai.
  "Governance Incentives": [
    "Nạp 50 USDC vào {name} trên {chain} để khóa token quản trị (nếu có) hoặc đăng ký nhận khuyến khích quản trị, giữ lại 5 đô làm gas; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Bỏ phiếu quản trị 1 lần trên {name} cho đề xuất đang mở, chọn đề xuất có phần thưởng khuyến khích hiển thị; tốn 0.5–1 đô gas, mất 5 phút.",
    "Mỗi tuần bỏ phiếu 1 lần trên {name} cho đề xuất mới (mỗi epoch 7 ngày vote 1 lần) để có lịch sử vote đều 4 tuần; tốn 0.5–1 đô gas/lần, mất 5 phút/lần.",
    "Claim phần thưởng khuyến khích (bribe) trên {name} mỗi 2 tuần rồi nạp lại vào vị thế khóa; tốn 0.5–2 đô gas/lần, mất 5 phút/lần.",
    "Đổi phiếu bầu sang đề xuất khác của {name} sau 14 ngày để thử 2 hướng khuyến khích khác nhau; tốn 0.5–1 đô gas, mất 5 phút.",
  ],

  // ---------------------------------------------------------- Crypto Card Issuer
  // Phat hanh the crypto: dang ky the, nap tien, chi tieu, nhan hoan tien.
  "Crypto Card Issuer": [
    "Đăng ký thẻ crypto của {name} trên {chain}, nạp 50 USDC vào thẻ để kích hoạt, giữ lại 5 đô làm gas; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Dùng thẻ {name} chi tiêu 20 USDC cho 1 giao dịch nhỏ (ví dụ mua hàng online) để ghi nhận giao dịch thẻ đầu tiên; tốn ~20 đô vốn + 0 đô phí thẻ, mất 5 phút.",
    "Nạp thêm 30 USDC vào thẻ {name} sau 7 ngày rồi chi tiêu 10 USDC/tuần trong 4 tuần để có lịch sử chi tiêu đều; tốn ~10 đô vốn/tuần, mất 5 phút/lần.",
    "Kiểm tra hoàn tiền (cashback) trên {name} mỗi tuần, nếu có hoàn tiền thì rút về ví rồi nạp lại vào thẻ; tốn 0 đô, mất 5 phút/lần.",
    "Đổi hạn mức hoặc nâng cấp thẻ {name} sau 30 ngày nếu đủ điều kiện chi tiêu, ghi lại lịch sử thẻ đầy đủ; tốn 0–5 đô phí nâng cấp, mất 10 phút.",
  ],

  // ------------------------------------------------------ Uncollateralized Lending
  // Cho vay khong the chap: xac minh tin dung, vay nho, tra dung han, xay lich su.
  "Uncollateralized Lending": [
    "Hoàn tất xác minh tín dụng trên {name} ở {chain} (kết nối ví, xác minh danh tính nếu yêu cầu), giữ lại 5 đô làm gas; tốn 0–2 đô phí xác minh, mất 15 phút.",
    "Vay 50 USDC không thế chấp trên {name} với hạn mức nhỏ nhất được duyệt, đọc kỹ lãi suất và kỳ hạn trước khi vay; tốn 0.5–2 đô gas, mất 10 phút.",
    "Trả đúng hạn 25 USDC nợ vay trên {name} sau 7 ngày để xây lịch sử trả nợ tốt, giữ lại 25 USDC còn nợ; tốn ~25 đô vốn + 0.5–2 đô gas, mất 5 phút.",
    "Trả hết 25 USDC còn lại trên {name} sau 14 ngày, sau đó vay lại 50 USDC để ghi nhận chu kỳ vay/trả thứ hai; tốn ~50 đô vốn luân chuyển + 0.5–2 đô gas, mất 10 phút.",
    "Mỗi tuần kiểm tra điểm tín dụng và hạn mức trên {name}, nếu hạn mức tăng thì vay thêm 1 khoản nhỏ 20 USDC; tốn ~20 đô vốn + 0.5–2 đô gas, mất 5 phút/lần.",
  ],

  // ---------------------------------------------------- Interest Rate Derivatives
  // Phai sinh lai suat: mua/ban vi the lai suat, giu den dao han, phong ngua.
  "Interest Rate Derivatives": [
    "Nạp 50 USDC vào {name} trên {chain}, mua 1 vị thế lãi suất (ví dụ lãi cố định) trị giá 50 USDC kỳ hạn 30 ngày, đọc kỹ lãi suất và ngày đáo hạn; tốn ~50 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Giữ vị thế lãi suất trên {name} ít nhất 14 ngày, mỗi tuần kiểm tra lãi suất thị trường so với lãi đã khóa; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
    "Mở thêm 1 vị thế lãi suất ngược chiều 25 USDC trên {name} sau 7 ngày để phòng ngừa biến động lãi suất; tốn ~25 đô vốn + 0.5–2 đô gas, mất 10 phút.",
    "Đóng sớm 1 vị thế trên {name} sau 21 ngày nếu lãi suất thị trường đã lệch quá 1% so với lúc mở, chốt chênh lệch; tốn 0.5–2 đô gas, mất 5 phút.",
    "Giữ vị thế còn lại trên {name} đến đáo hạn 30 ngày rồi nhận lãi và gốc về ví, ghi lại lãi thực nhận; tốn 0.5–2 đô gas, mất 5 phút.",
  ],
};

/**
 * Mau du phong cho category DefiLlama chua co trong FARM_TEMPLATES.
 * main.ts dung cai nay khi snapshot co category la (vd: category moi, hiem).
 * Van cu the: thu 1 giao dich nho, giu vi the, lap lai theo tuan, kiem tra dinh ky.
 */
export const DEFAULT_TEMPLATE: FarmTemplate = [
  "Mở {name} trên {chain}, nạp 20 USDC thử 1 giao dịch nhỏ nhất mà protocol hỗ trợ (swap/supply/mint tùy loại); tốn ~20 đô vốn + 0.5–2 đô gas, mất 10 phút.",
  "Giữ vị thế trên {name} ít nhất 14 ngày, mỗi tuần kiểm tra số dư và phần thưởng đã tích lũy; tốn 0 đô khi chỉ kiểm tra, mất 5 phút/lần.",
  "Nạp thêm 30 USDC vào {name} sau 7 ngày để tăng vị thế theo từng đợt thay vì nạp 1 lần; tốn ~30 đô vốn + 0.5–2 đô gas, mất 5 phút.",
  "Thử thêm 1 tính năng khác của {name} (ví dụ thị trường/cặp/vault thứ hai) với 20 USDC sau 14 ngày; tốn ~20 đô vốn + 0.5–2 đô gas, mất 10 phút.",
  "Rút một nửa khỏi {name} sau 21 ngày rồi nạp lại sau 2 ngày để ghi nhận 1 chu kỳ rút/nạp; tốn ~25 đô vốn luân chuyển + 1–3 đô gas, mất 10 phút.",
  "Ghi lại toàn bộ hash giao dịch, số tiền và ngày làm trên {name} vào file riêng để đối chiếu khi snapshot/airdrop; tốn 0 đô, mất 5 phút mỗi tuần.",
];

/** Danh sach category da co mau (dung de main.ts kiem tra bao phu). */
export const FARM_CATEGORIES: string[] = Object.keys(FARM_TEMPLATES);

/** Lay mau buoc cua 1 category; category la thi dung DEFAULT_TEMPLATE. */
export function getFarmTemplate(category: string): FarmTemplate {
  return FARM_TEMPLATES[category] ?? DEFAULT_TEMPLATE;
}

/**
 * Sinh farm_steps hoan chinh cho 1 protocol: lay mau theo category cua no
 * roi dien {name} va {chain} bang ten/chain that.
 * Vi du: renderFarmSteps("Dexs", "Uniswap", "Ethereum") -> 8 buoc da dien ten.
 */
export function renderFarmSteps(
  category: string,
  name: string,
  chain: string,
): string[] {
  return getFarmTemplate(category).map((step) =>
    step.replaceAll("{name}", name).replaceAll("{chain}", chain),
  );
}
