import mongoose from "mongoose";
import JawabanSiswa from "../Models/JawabanSiswa.js";
import KunciJawaban from "../Models/KunciJawaban.js";
import Debug from "../Plugins/Debug.js";
import dotenv from 'dotenv'
const env = dotenv.config().parsed;

class JawabanSiswaController {
     async store(req, res) {
          try {
               if (!req.body.idKunciJawaban) throw {
                    code: 400,
                    message: 'ID Kunci Jawaban Harus di Isi!',
                    req
               }

               if (!mongoose.Types.ObjectId.isValid(req.body.idKunciJawaban)) throw {
                    code: 400,
                    message: 'ID Kunci Jawaban Tidak Valid!',
                    req
               }

               if (!req.body.namaSiswa) throw {
                    code: 400,
                    message: 'Nama Siswa Harus di Isi!',
                    req
               }

               if (!req.body.jawabanSiswa) throw {
                    code: 400,
                    message: 'Jawaban Siswa Harus di Isi!',
                    req
               }

               const kunciJawaban = await KunciJawaban.findById(req.body.idKunciJawaban);

               if (!kunciJawaban) throw {
                    code: 400,
                    message: 'Kunci Jawaban Tidak Ditemukan!',
                    req
               }

               const newJawabanSiswa = new JawabanSiswa({
                    idKunciJawaban: req.body.idKunciJawaban,
                    namaSiswa: req.body.namaSiswa,
                    jawabanSiswa: req.body.jawabanSiswa,
               });

               await newJawabanSiswa.save();

               return res.status(201).json({
                    status: true,
                    message: 'Jawaban Siswa Berhasil Ditambahkan!',
                    data: newJawabanSiswa
               });

          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, null, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }

     async index(req, res) {
          try {
               let data = {};

               if (req.query.id) {
                    data = await JawabanSiswa.findOne({
                         _id: req.query.id
                    }).populate('idKunciJawaban', 'kodeSoal tipeSoal kunciJawaban')
               } else {
                    data = await JawabanSiswa.find().populate('idKunciJawaban', 'kodeSoal tipeSoal kunciJawaban');
               }

               if (!data) throw {
                    code: 400,
                    message: 'Jawaban Siswa Tidak Ditemukan!',
                    req
               }

               return res.status(200).json({
                    status: true,
                    message: 'Jawaban Siswa Berhasil Ditemukan!',
                    data
               });
          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, null, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }

     async point(req, res) {
          try {
               let result = {};
               let data = [];

               if (req.query.id) {
                    result = await JawabanSiswa.findOne({
                         _id: req.query.id
                    }).populate('idKunciJawaban');

                    const jawabanSiswa = result.jawabanSiswa;
                    const kunciJawaban = result.idKunciJawaban.kunciJawaban;

                    const benar = [];
                    const salah = [];
                    const tidakDiisi = [];

                    for (const jawaban of jawabanSiswa) {
                         if (jawaban.jawaban == null) tidakDiisi.push(jawaban.nomor)
                         if (jawaban.jawaban !== null) {
                              kunciJawaban.find(item => {
                                   if (item.nomor == jawaban.nomor) {
                                        if (item.kunci == jawaban.jawaban) benar.push(item)
                                        if (item.kunci !== jawaban.jawaban) salah.push(item)
                                   }
                              })
                         }
                    }

                    let point = 0;

                    if (result.idKunciJawaban.tipeSoal == 'punishmentScore') {
                         point = (benar.length * 1) - (salah.length * 0.25);
                    } else {
                         point = benar.length;
                    }
                    
                    const totalSoal = result.idKunciJawaban.kunciJawaban.length;

                    data = {
                         _id: result._id,
                         namaSiswa: result.namaSiswa,
                         tipeSoal: result.idKunciJawaban.tipeSoal,
                         kodeSoal: result.idKunciJawaban.kodeSoal,
                         benar: benar.length,
                         salah: salah.length,
                         tidakDiisi: tidakDiisi.length,
                         point,
                         nilai: (point / totalSoal) * 100,
                    }

               } else {
                    result = await JawabanSiswa.find().populate('idKunciJawaban');

                    for (const item of result) {
                         const jawabanSiswa = item.jawabanSiswa;
                         const kunciJawaban = item.idKunciJawaban.kunciJawaban;

                         const benar = [];
                         const salah = [];
                         const tidakDiisi = [];

                         for (const jawaban of jawabanSiswa) {
                              if (jawaban.jawaban == null) tidakDiisi.push(jawaban.nomor)
                              if (jawaban.jawaban !== null) {
                                   kunciJawaban.find(item => {
                                        if (item.nomor == jawaban.nomor) {
                                             if (item.kunci == jawaban.jawaban) benar.push(item)
                                             if (item.kunci !== jawaban.jawaban) salah.push(item)
                                        }
                                   })
                              }
                         }

                         let point = 0;
                         if (item.idKunciJawaban.tipeSoal == 'punishmentScore') {
                              point = (benar.length * 1) - (salah.length * 0.25);
                         } else {
                              point = benar.length;
                         }

                         const totalSoal = item.idKunciJawaban.kunciJawaban.length;

                         data.push({
                              _id: item._id,
                              namaSiswa: item.namaSiswa,
                              tipeSoal: item.idKunciJawaban.tipeSoal,
                              kodeSoal: item.idKunciJawaban.kodeSoal,
                              benar: benar.length,
                              salah: salah.length,
                              tidakDiisi: tidakDiisi.length,
                              point,
                              nilai: (point / totalSoal) * 100,
                         });
                    }
               }



               return res.status(200).json({
                    status: true,
                    message: 'Berhasil Mengambil Nilai!',
                    data
               });
          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, null, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }
}

export default new JawabanSiswaController();