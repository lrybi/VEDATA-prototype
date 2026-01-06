UTxO (Unspent Transaction Output)
eUTxO là viết tắt của Extended Unspent Transaction Output – tức Mô hình UTxO mở rộng

So với UTxO, eUTxO thêm:
    Datum: dữ liệu kèm theo với mỗi output (có thể là trạng thái, thông tin hợp đồng).
    Redeemer: dữ liệu mà người dùng cung cấp khi muốn tiêu UTxO đó (kiểu như "tham số đầu vào" để chạy logic smart contract).
    Validation script (thường viết bằng Plutus): một đoạn code xác định điều kiện nào thì UTxO có thể được tiêu.
Ví dụ dễ hình dung
Giả sử bạn có một smart contract kiểu “hộp tiền chung” (shared wallet):
    Output lưu 100 ADA + một datum chứa danh sách thành viên.
    Khi rút tiền, bạn cần cung cấp một redeemer (chữ ký hợp lệ).
    Validation script sẽ kiểm tra chữ ký có thuộc danh sách không.
Nếu đúng → cho rút. Nếu sai → từ chối.

UTxO là gì?
    UTxO (Unspent Transaction Output) là mô hình dữ liệu được Bitcoin dùng để quản lý số dư.
    Thay vì lưu trữ "số dư tài khoản" như trong Ethereum (account model), mỗi giao dịch trong Bitcoin tạo ra các output (đầu ra).
    Output nào chưa được tiêu (unspent) sẽ trở thành "UTxO" – có thể được dùng trong các giao dịch tiếp theo.
        Ví dụ: Bạn có một UTxO trị giá 2 BTC. Nếu gửi 1 BTC cho A, bạn sẽ tiêu UTxO này và tạo ra:
            1 output 1 BTC cho A.
            1 output 1 BTC còn lại cho chính bạn (gọi là change).
eUTxO mở rộng thế nào?
    Cardano đã phát triển eUTxO để giải quyết hạn chế của UTxO truyền thống khi muốn xây dựng các ứng dụng phức tạp (DeFi, smart contract).
    So với UTxO, eUTxO thêm:
        Datum: dữ liệu kèm theo với mỗi output (có thể là trạng thái, thông tin hợp đồng).
        Redeemer: dữ liệu mà người dùng cung cấp khi muốn tiêu UTxO đó (kiểu như "tham số đầu vào" để chạy logic smart contract).
        Validation script (thường viết bằng Plutus): một đoạn code xác định điều kiện nào thì UTxO có thể được tiêu.
    👉 Với 3 thành phần này, eUTxO cho phép:
    Xây dựng smart contract phức tạp nhưng vẫn giữ tính deterministic (tất định, dễ dự đoán).
    Giữ ưu điểm song song của UTxO (nhiều giao dịch xử lý độc lập).
    Vẫn tránh được nhiều vấn đề của account model như reentrancy attack (tràn gọi hàm lặp).
Ví dụ dễ hình dung
    Giả sử bạn có một smart contract kiểu “hộp tiền chung” (shared wallet):
        Output lưu 100 ADA + một datum chứa danh sách thành viên.
        Khi rút tiền, bạn cần cung cấp một redeemer (chữ ký hợp lệ).
        Validation script sẽ kiểm tra chữ ký có thuộc danh sách không.
    Nếu đúng → cho rút. Nếu sai → từ chối.
👉 Tóm lại:
    UTxO = mô hình "đầu ra chưa tiêu", đơn giản, hiệu quả cho chuyển tiền.
    eUTxO = UTxO được mở rộng thêm dữ liệu + logic kiểm tra, phù hợp cho smart contract trên Cardano.

🔹 Transaction Output là gì?
Khi bạn thực hiện một giao dịch (transaction) trên blockchain kiểu UTxO (như Bitcoin, Cardano):
    Mỗi transaction có input (các UTxO cũ bạn tiêu đi) và output (các UTxO mới được tạo ra).
    Các output này chính là "đơn vị tiền" bạn và người khác có thể dùng cho giao dịch sau.
"Chưa được tiêu" nghĩa là gì?
    Khi một output được tạo ra, nó tồn tại trên blockchain và gắn liền với một địa chỉ ví.
    Nếu output đó chưa được dùng làm input trong bất kỳ giao dịch nào khác, thì nó được gọi là UTxO (Unspent Transaction Output).
    Một khi bạn sử dụng nó để gửi tiền đi, nó được coi là đã tiêu (spent) và không còn giá trị nữa.
🔹 Ví dụ dễ hiểu
    Bạn có một UTxO trị giá 5 ADA trong ví.
    Bạn gửi 2 ADA cho A.
        Giao dịch sẽ tiêu UTxO 5 ADA (input).
        Tạo ra 2 output mới:
            2 ADA cho A.
            3 ADA trả lại bạn (change).
    Sau giao dịch:
        UTxO 5 ADA cũ không còn tồn tại (đã tiêu).
        Bạn có 1 UTxO mới 3 ADA.
        A có 1 UTxO mới 2 ADA.
🔹 Điểm quan trọng
    Trong blockchain UTxO: tiền không được cộng dồn như số dư ngân hàng, mà là tập hợp của nhiều UTxO.
    Ví của bạn thực chất là một tập hợp các UTxO mà bạn có quyền tiêu.
    Khi bạn gửi tiền, ví sẽ chọn một hoặc nhiều UTxO để gom đủ số cần gửi.

ví dụ trên có một UTxO trị giá 5 ADA trong ví. vậy có thể có nhiều UTxO trong 1 ví không?
    Một ví có thể có rất nhiều UTxO cùng lúc.
    🔹 Cách hình dung
    Ví của bạn trong mô hình UTxO không phải là một con số duy nhất (như tài khoản ngân hàng hay Ethereum account),
    mà nó giống như một cái bóp chứa nhiều tờ tiền:
    Mỗi UTxO = một “tờ tiền” với mệnh giá cụ thể (2 ADA, 3 ADA, 10 ADA...).
    Tổng số dư ví = tổng giá trị của tất cả các UTxO trong ví đó.
    🔹 Ví dụ
    Ví bạn hiện có:
        UTxO1 = 2 ADA
        UTxO2 = 3 ADA
        UTxO3 = 5 ADA
    👉 Tổng số dư = 2 + 3 + 5 = 10 ADA
    Nếu bạn muốn gửi 7 ADA cho B:
        Ví sẽ chọn UTxO2 (3 ADA) + UTxO3 (5 ADA) = 8 ADA để làm input.
        Output:
            7 ADA → cho B
            1 ADA → trả lại cho bạn (change UTxO mới)
    Kết quả:
        UTxO2 và UTxO3 bị “tiêu” (không còn tồn tại).
        Bạn có UTxO mới 1 ADA.
        B có UTxO mới 7 ADA.
        UTxO1 (2 ADA) vẫn còn trong ví bạn, không bị đụng tới.
    🔹 Điểm quan trọng
        Một ví có thể giữ rất nhiều UTxO, không giới hạn.
        Khi thực hiện giao dịch, hệ thống sẽ chọn UTxO nào phù hợp (hoặc nhiều cái cộng lại).
        Vì vậy, blockchain kiểu UTxO giống như quản lý “nhiều tờ tiền rời rạc”, còn blockchain kiểu Account (Ethereum) giống như quản lý “một con số số dư duy nhất”.

Tại sao ví không chọn đúng 2 ADA + 5 ADA = 7 ADA?
    Thực tế, ví hoàn toàn có thể chọn như vậy, nhưng không phải lúc nào nó cũng chọn “vừa đủ”.
    Lý do là vì ví thường dùng một thuật toán chọn UTxO (coin selection algorithm) để quyết định:
        Thuận tiện: Chọn ít UTxO hơn → giao dịch nhỏ gọn hơn (ít input → phí thấp hơn).
        Tối ưu phí: Một số chiến lược chọn cách gom UTxO lớn thay vì nhiều UTxO nhỏ.
        Dọn dẹp ví: Có lúc ví cố tình gom nhiều UTxO nhỏ lại → tránh tình trạng có cả đống UTxO lẻ (fragmentation).
        Ngẫu nhiên / đa dạng: Để tăng tính riêng tư, ví đôi khi chọn ngẫu nhiên thay vì chọn “đúng số”.
    Tóm gọn
        Ví có thể chọn đúng 2 + 5 = 7 ADA nếu thuật toán nó ưu tiên “vừa đủ”.
        Nhưng hầu hết ví hiện nay chọn theo cách gom gọn UTxO hoặc tối ưu phí, chứ không nhất thiết chọn vừa khít.
        Đây cũng là lý do đôi khi bạn thấy giao dịch tạo thêm “change output” (tiền thối về).

