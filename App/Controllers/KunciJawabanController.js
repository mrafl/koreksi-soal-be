import JawabanSiswa from "../Models/JawabanSiswa.js";
import KunciJawaban from "../Models/KunciJawaban.js";
import Debug from "../Plugins/Debug.js";
import dotenv from 'dotenv'
const env = dotenv.config().parsed;

class KunciJawabanController {
     async store(req, res) {
          try {
               if (!req.body.kodeSoal) throw {
                    code: 400,
                    message: 'Kode Soal Harus di Isi!',
                    req
               }
               if (!req.body.tipeSoal) throw {
                    code: 400,
                    message: 'Tipe Soal Harus di Isi!',
                    req
               }
               if (!req.body.kunciJawaban) throw {
                    code: 400,
                    message: 'Kunci Jawaban Harus di Isi!',
                    req
               }

               const kunciJawaban = await KunciJawaban.findOne({
                    kodeSoal: req.body.kodeSoal,
               });

               if (kunciJawaban) throw {
                    code: 400,
                    message: 'Kunci Jawaban Sudah Ada!',
                    req
               }

               const newKunciJawaban = new KunciJawaban({
                    kodeSoal: req.body.kodeSoal,
                    tipeSoal: req.body.tipeSoal,
                    kunciJawaban: req.body.kunciJawaban,
               });

               await newKunciJawaban.save();

               return res.status(201).json({
                    status: true,
                    message: 'Kunci Jawaban Berhasil Ditambahkan!',
                    data: newKunciJawaban
               });

          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, req.body.email, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }

     async index(req, res) {
          try {
               let data = {};
               if(req.query.id) {
                    data = await KunciJawaban.findOne({
                         _id: req.query.id
                    })
               } else {
                    data = await KunciJawaban.find();
               }

               if (!data) throw {
                    code: 400,
                    message: 'Kunci Jawaban Tidak Ditemukan!',
                    req
               }

               return res.status(200).json({
                    status: true,
                    message: 'Kunci Jawaban Berhasil Ditemukan!',
                    data
               });
          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, req.body.email, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }
}

export default new KunciJawabanController();