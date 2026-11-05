# profil-naudihaqqi-rd

Profil digital Mohd Naudi Haqqi, Pengetua SMK Jugra. Pemilik profil boleh mengemas kini kandungan sendiri melalui `/admin`.

## Struktur

| Fail | Fungsi |
|---|---|
| `index.html` | Laman profil awam. Semua seksyen dijana daripada data. |
| `content.js` | URL backend (`PROFILE_API`) + kandungan asal (sandaran). |
| `admin/index.html` | Panel edit: log masuk PIN, edit/tambah/padam/susun, muat naik gambar, pratonton, sejarah. |
| `gas/Code.gs` | Backend Google Apps Script (data dalam Google Sheets, gambar dalam Google Drive). |

## Pemasangan backend (sekali sahaja)

1. Buat **Google Sheet** baharu guna akaun Gmail peribadi (akaun DELIMa/MOE mungkin menyekat perkongsian gambar awam).
2. **Extensions → Apps Script**, padam kod sedia ada, tampal isi `gas/Code.gs`.
3. Tukar `INITIAL_PIN` di bahagian atas kepada PIN pilihan (min. 6 aksara) → **Save**.
4. Pilih fungsi `setup` → **Run** → benarkan semua akses yang diminta.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL yang berakhir `/exec`, tampal dalam `content.js`:
   ```js
   window.PROFILE_API = 'https://script.google.com/macros/s/XXXX/exec';
   ```
7. Commit & push. Buka `https://<laman>/admin/`, log masuk, kemudian tekan **Simpan & Terbit** sekali untuk menerbitkan kandungan asal ke Sheets.
8. (Pilihan) Kosongkan semula `INITIAL_PIN` dalam editor GAS. PIN disimpan sebagai hash dalam Script Properties.

> Jika kod `Code.gs` dikemas kini kemudian, guna **Deploy → Manage deployments → Edit → New version** supaya URL kekal sama.

## Penggunaan harian (untuk Tuan Naudi)

- Buka `/admin/` → masukkan PIN.
- Pilih bahagian (Profil, Perkhidmatan, Galeri…) → ketik item untuk edit, **+ Tambah** untuk item baharu, ↑ ↓ untuk susun, 🗑 untuk padam.
- Medan teks ada **Terjemahan** (EN / عربي). Jika dibiar kosong, laman guna BM.
- Ikon 👁 di atas = pratonton draf sebelum diterbitkan.
- **Simpan & Terbit** = terus dipaparkan kepada semua pelawat.
- Tersilap padam? **Tetapan → Sejarah sandaran → Pulih**.

## Keselamatan

- PIN disemak di pelayan (hash SHA-256 + salt); 10 cubaan salah = dikunci 15 minit.
- Token sesi tamat selepas 6 jam tanpa aktiviti.
- PIN terlupa: isi `INITIAL_PIN` dengan PIN baharu dalam editor GAS → jalankan `resetPin`.

## Mod demo

Selagi `PROFILE_API` kosong, laman guna kandungan dalam `content.js`, dan `/admin` boleh dibuka dalam mod demo. Dalam mod ini, perubahan disimpan dalam peranti itu sahaja.
