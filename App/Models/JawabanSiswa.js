import mongoose from "mongoose";

const jawabanSiswaSchema = mongoose.Schema({
     nomor: {
          type: Number,
          required: true,
     },
     jawaban: {
          type: String,
     },
}, {
     _id: false, // Menghilangkan _id dari subdokumen
});

const Schema = mongoose.Schema({
     idKunciJawaban: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'KunciJawaban',
          required: true,
     },
     namaSiswa: {
          type: String,
          required: true,
     },
     jawabanSiswa: [jawabanSiswaSchema], // Gunakan subskema jawabanSiswa di sini
});

export default mongoose.model('JawabanSiswa', Schema);