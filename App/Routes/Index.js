import express from "express";

import KunciJawaban from "../Controllers/KunciJawabanController.js";
import JawabanSiswa from "../Controllers/JawabanSiswaController.js";

const router = express.Router();

//Kunci Jawaban
router.post('/kunci-jawaban', KunciJawaban.store);
router.get('/kunci-jawaban', KunciJawaban.index);

//Jawaban Siswa
router.post('/jawaban-siswa', JawabanSiswa.store);
router.get('/jawaban-siswa', JawabanSiswa.index);

// Nilai
router.get('/nilai-siswa', JawabanSiswa.point);


export default router;