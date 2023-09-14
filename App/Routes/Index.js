import express from "express";
import restrictAccessByRole from "../Middlewares/jwtAuth.js";

import Auth from "../Controllers/AuthController.js";
import KunciJawaban from "../Controllers/KunciJawabanController.js";
import JawabanSiswa from "../Controllers/JawabanSiswaController.js";

const router = express.Router();

//Auth
router.post('/auth/register', Auth.register);
router.post('/auth/login', Auth.login);
router.post('/auth/refresh-token', Auth.refreshToken);
router.put('/auth/update-password', restrictAccessByRole(['admin', 'user']), Auth.updatePassword);

//Kunci Jawaban
router.post('/kunci-jawaban', restrictAccessByRole(['admin']), KunciJawaban.store);
router.get('/kunci-jawaban', restrictAccessByRole(['admin', 'user']), KunciJawaban.index);

//Jawaban Siswa
router.post('/jawaban-siswa', restrictAccessByRole(['admin', 'user']), JawabanSiswa.store);
router.get('/jawaban-siswa', restrictAccessByRole(['admin']), JawabanSiswa.index);

// Nilai
router.get('/nilai-siswa', restrictAccessByRole(['admin', 'user']), JawabanSiswa.point);


export default router;