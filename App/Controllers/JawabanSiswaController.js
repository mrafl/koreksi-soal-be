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
                    }).populate('idKunciJawaban', 'kodeSoal kunciJawaban')
               } else {
                    data = await JawabanSiswa.find().populate('idKunciJawaban', 'kodeSoal kunciJawaban');
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

                    const jumlahOpsi = 5;

                    const punishmentScore = {
                         point: parseFloat((( benar.length ) - (salah.length * ( 1 / ( jumlahOpsi - 1 )))).toFixed(2)),
                         nilai: parseFloat(((( benar.length ) - (salah.length * ( 1 / ( jumlahOpsi - 1 )))) / result.idKunciJawaban.kunciJawaban.length * 100).toFixed(2))
                    }

                    const rewardScore = {
                         point: parseFloat((( benar.length ) + (tidakDiisi.length * ( 1 / jumlahOpsi ))).toFixed(2)),
                         nilai: parseFloat(((( benar.length ) + (tidakDiisi.length * ( 1 / jumlahOpsi ))) / result.idKunciJawaban.kunciJawaban.length * 100).toFixed(2))
                    }

                    const correctScore = {
                         point: benar.length,
                         nilai: benar.length / result.idKunciJawaban.kunciJawaban.length * 100
                    }
                    
                    data = {
                         _id: result._id,
                         namaSiswa: result.namaSiswa,
                         kodeSoal: result.idKunciJawaban.kodeSoal,
                         jumlahSoal: result.idKunciJawaban.kunciJawaban.length,
                         jumlahOpsi,
                         benar: benar.length,
                         salah: salah.length,
                         tidakDiisi: tidakDiisi.length,
                         punishmentScore,
                         rewardScore,
                         correctScore
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

                         const jumlahOpsi = 5;

                         const punishmentScore = {
                              point: parseFloat((( benar.length ) - (salah.length * ( 1 / ( jumlahOpsi - 1 )))).toFixed(2)),
                              nilai: parseFloat(((( benar.length ) - (salah.length * ( 1 / ( jumlahOpsi - 1 )))) / item.idKunciJawaban.kunciJawaban.length * 100).toFixed(2))
                         }
     
                         const rewardScore = {
                              point: parseFloat((( benar.length ) + (tidakDiisi.length * ( 1 / jumlahOpsi ))).toFixed(2)),
                              nilai: parseFloat(((( benar.length ) + (tidakDiisi.length * ( 1 / jumlahOpsi ))) / item.idKunciJawaban.kunciJawaban.length * 100).toFixed(2))
                         }
     
                         const correctScore = {
                              point: benar.length,
                              nilai: benar.length / item.idKunciJawaban.kunciJawaban.length * 100
                         }

                         data.push({
                              _id: item._id,
                              namaSiswa: item.namaSiswa,
                              kodeSoal: item.idKunciJawaban.kodeSoal,
                              jumlahSoal: item.idKunciJawaban.kunciJawaban.length,
                              jumlahOpsi,
                              benar: benar.length,
                              salah: salah.length,
                              tidakDiisi: tidakDiisi.length,
                              punishmentScore,
                              rewardScore,
                              correctScore
                         })
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