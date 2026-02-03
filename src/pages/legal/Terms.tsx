import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Terms() {
  return (
    <MainLayout>
      <section className="py-12 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-8">
              Syarat & Ketentuan
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground mb-6">
                Terakhir diperbarui: 1 Februari 2024
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Ketentuan Umum</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Dengan mengakses dan menggunakan platform NitipGo, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. NitipGo adalah platform yang menghubungkan customer dengan mitra traveler untuk layanan jasa titip dan pengiriman barang.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Definisi</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card space-y-3">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Platform:</strong> Website dan aplikasi NitipGo beserta seluruh fiturnya.
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Customer:</strong> Pengguna yang menggunakan layanan jasa titip atau kirim barang.
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Mitra Traveler:</strong> Pengguna yang terdaftar sebagai penyedia jasa titip/kirim barang.
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Order:</strong> Permintaan layanan yang diajukan oleh Customer kepada Mitra Traveler.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Pendaftaran Akun</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Pengguna wajib memberikan informasi yang akurat dan valid saat mendaftar.</li>
                      <li>Setiap pengguna bertanggung jawab atas keamanan akun masing-masing.</li>
                      <li>Pengguna dilarang membuat akun ganda atau meminjamkan akun kepada pihak lain.</li>
                      <li>NitipGo berhak menonaktifkan akun yang melanggar ketentuan.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Layanan dan Transaksi</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Pembayaran dilakukan melalui sistem escrow NitipGo untuk keamanan kedua belah pihak.</li>
                      <li>Dana akan diteruskan ke Mitra Traveler setelah Customer mengonfirmasi penerimaan barang.</li>
                      <li>Pembatalan order mengikuti kebijakan pembatalan yang berlaku.</li>
                      <li>NitipGo memungut komisi dari setiap transaksi yang berhasil.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Barang yang Dilarang</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground mb-3">Berikut adalah barang yang tidak boleh dikirim melalui NitipGo:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Narkotika dan obat-obatan terlarang</li>
                      <li>Senjata api dan bahan peledak</li>
                      <li>Barang ilegal atau hasil kejahatan</li>
                      <li>Hewan hidup</li>
                      <li>Barang mudah rusak tanpa pengemasan memadai</li>
                      <li>Barang berharga tanpa asuransi tambahan</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Tanggung Jawab</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Mitra Traveler bertanggung jawab atas keamanan barang selama dalam perjalanan.</li>
                      <li>Customer wajib memberikan deskripsi barang yang akurat.</li>
                      <li>NitipGo tidak bertanggung jawab atas kerugian akibat informasi yang tidak akurat.</li>
                      <li>Penyelesaian dispute akan difasilitasi oleh tim NitipGo.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Perubahan Ketentuan</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      NitipGo berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform dan berlaku sejak tanggal yang ditentukan. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan atas ketentuan baru.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Kontak</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Untuk pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami di:
                    </p>
                    <ul className="mt-3 space-y-1 text-muted-foreground">
                      <li>Email: legal@nitipgo.id</li>
                      <li>WhatsApp: +62 812 3456 7890</li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
