// Entrepreneurship lesson 3: pricing strategy.
import type { Lesson } from "#/engine/types.ts";

export const menentukanHargaLesson: Lesson = {
  id: "menentukan-harga",
  title: "Menentukan harga jual",
  icon: "Tag",
  screens: [
    {
      type: "choice",
      prompt: "Harga berbasis nilai (value-based pricing) berarti harga ditentukan dari …",
      options: [
        { id: "a", label: "Seberapa besar manfaat yang dirasakan pelanggan" },
        { id: "b", label: "Biaya produksi ditambah sekian persen" },
        { id: "c", label: "Harga paling murah di pasar" },
        { id: "d", label: "Perkiraan biaya pesaing" },
      ],
      correctId: "a",
      explain:
        "Produk yang menyelesaikan masalah senilai 1 juta per bulan bisa dijual jauh di atas biayanya. Harga mencerminkan nilai, bukan sekadar ongkos.",
    },
    {
      type: "concept",
      prompt:
        "Harga jual = Biaya + Margin. Tapi biaya hanyalah batas bawah. Batas atasnya adalah nilai yang dirasakan pelanggan. Harga yang baik berdiri di antara keduanya.",
      explain:
        "Menetapkan harga di bawah nilai membuat kamu meninggalkan uang di meja. Menetapkan harga di atas nilai membuat pelanggan pergi. Tahu nilai produk adalah kunci harga.",
    },
    {
      type: "numeric",
      prompt:
        "Biaya produksi satu produk 40 ribu dan kamu ingin margin 50% dari harga jual. Berapa harga jualnya?",
      unit: "ribu",
      acceptRange: [78, 82],
      explain:
        "Kalau margin 50% dari harga, biaya 40 ribu adalah 50% dari harga. Harga = 40.000 ÷ 0,5 = 80 ribu.",
    },
    {
      type: "choice",
      prompt:
        "Pesaing menjual 100 ribu dan produkmu jelas lebih baik. Strategi harga yang paling masuk akal?",
      options: [
        { id: "a", label: "Harga sedikit di atas pesaing sambil mengkomunikasikan nilai" },
        { id: "b", label: "Harga setengah dari pesaing agar laku" },
        { id: "c", label: "Harga sama persis dengan pesaing" },
        { id: "d", label: "Gratis untuk semua orang" },
      ],
      correctId: "a",
      explain:
        'Harga premium yang jelas beralasan menandakan kualitas lebih baik. Harga terlalu murah justru sering dianggap "terlalu bagus untuk jadi kenyataan".',
    },
    {
      type: "numeric",
      prompt: "Harga jual 120 ribu dan biaya 80 ribu. Berapa persen margin kotornya?",
      unit: "persen",
      acceptRange: [31, 35],
      explain:
        "Margin = (120 − 80) ÷ 120 × 100% = 33%. Setiap penjualan menyisakan sepertiga dari harga untuk biaya tetap dan laba.",
    },
    {
      type: "allocation",
      prompt:
        "Dari setiap 100 ribu harga jual, alokasikan ke biaya produksi, pemasaran, dan keuntungan — dengan syarat keuntungan minimal 25%.",
      categories: ["Biaya produksi", "Pemasaran", "Keuntungan"],
      rule: { category: "Keuntungan", min: 25 },
      explain:
        "Keuntungan minimal 25% menjaga bisnis tetap bisa tumbuh dan menahan risiko. Kalau keuntungannya tipis, harga perlu dievaluasi ulang.",
    },
  ],
};
