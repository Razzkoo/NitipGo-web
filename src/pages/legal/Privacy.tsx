import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Privacy() {
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
              Kebijakan Privasi
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground mb-6">
                Terakhir diperbarui: 1 Februari 2024
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Informasi yang Kami Kumpulkan</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Informasi Pribadi</h3>
                      <p className="text-muted-foreground">
                        Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, email, nomor telepon, dan alamat. Untuk Mitra Traveler, kami juga mengumpulkan data identitas (KTP) untuk keperluan verifikasi.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Informasi Transaksi</h3>
                      <p className="text-muted-foreground">
                        Data terkait order, pembayaran, riwayat transaksi, dan komunikasi dalam platform.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Informasi Teknis</h3>
                      <p className="text-muted-foreground">
                        Alamat IP, jenis perangkat, browser, dan data penggunaan platform untuk meningkatkan layanan.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Penggunaan Informasi</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground mb-3">Kami menggunakan informasi Anda untuk:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Memproses dan mengelola order serta transaksi</li>
                      <li>Memverifikasi identitas pengguna</li>
                      <li>Menghubungi Anda terkait layanan dan update platform</li>
                      <li>Meningkatkan keamanan dan mencegah penipuan</li>
                      <li>Menganalisis penggunaan untuk pengembangan fitur</li>
                      <li>Memenuhi kewajiban hukum</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Berbagi Informasi</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground mb-3">Kami dapat membagikan informasi Anda dengan:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Pengguna lain:</strong> Informasi dasar seperti nama dan rating dibagikan untuk keperluan transaksi.</li>
                      <li><strong className="text-foreground">Penyedia layanan:</strong> Mitra pembayaran, hosting, dan analitik yang membantu operasional kami.</li>
                      <li><strong className="text-foreground">Otoritas hukum:</strong> Jika diwajibkan oleh hukum atau perintah pengadilan.</li>
                    </ul>
                    <p className="text-muted-foreground mt-4">
                      Kami tidak menjual informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Keamanan Data</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data Anda, termasuk enkripsi data, akses terbatas, dan monitoring keamanan berkala. Namun, tidak ada sistem yang 100% aman, dan kami tidak dapat menjamin keamanan absolut.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Penyimpanan Data</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Data Anda disimpan selama akun aktif dan untuk periode yang diperlukan sesuai kewajiban hukum, penyelesaian sengketa, dan penegakan perjanjian. Setelah penghapusan akun, data akan dihapus atau dianonimkan dalam waktu 30 hari, kecuali yang diperlukan untuk keperluan hukum.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Hak Pengguna</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground mb-3">Anda memiliki hak untuk:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Mengakses dan memperoleh salinan data pribadi Anda</li>
                      <li>Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                      <li>Meminta penghapusan data (dengan batasan tertentu)</li>
                      <li>Menarik persetujuan penggunaan data</li>
                      <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookie dan Tracking</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis trafik, dan personalisasi konten. Anda dapat mengatur preferensi cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Perubahan Kebijakan</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diinformasikan melalui email atau notifikasi dalam platform. Kami sarankan untuk meninjau kebijakan ini secara berkala.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Hubungi Kami</h2>
                  <div className="bg-card rounded-xl p-6 shadow-card">
                    <p className="text-muted-foreground">
                      Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menggunakan hak-hak Anda, silakan hubungi:
                    </p>
                    <ul className="mt-3 space-y-1 text-muted-foreground">
                      <li>Email: privacy@nitipgo.id</li>
                      <li>WhatsApp: +62 812 3456 7890</li>
                      <li>Alamat: Jl. Sudirman No. 123, Jakarta Pusat 10110</li>
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
