import mongoose from "mongoose";

// Buat subskema untuk kunci jawaban tanpa _id
const kunciJawabanSchema = mongoose.Schema({
     nomor: {
          type: Number,
          required: true,
     },
     kunci: {
          type: String,
          required: true,
     },
}, {
     _id: false, // Menghilangkan _id dari subdokumen
});

const Schema = mongoose.Schema({
     kodeSoal: {
          type: String,
          required: true,
     },
     tipeSoal: {
          type: String,
          enum: ['correctScore', 'punishmentScore'],
          required: true,
     },
     kunciJawaban: [kunciJawabanSchema], // Gunakan subskema kunciJawaban di sini
});

export default mongoose.model('KunciJawaban', Schema);