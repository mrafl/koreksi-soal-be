import mongoose from "mongoose";
import User from "../Models/User.js";
import emailExist from "../Libraries/emailExist.js";
import Debug from "../Plugins/Debug.js";
import bcrypt from "bcrypt";
import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'
const env = dotenv.config().parsed;

const generateAccessToken = async (payload) => {
     return jsonwebtoken.sign(
          payload,
          env.JWT_ACCESS_TOKEN_SECRET, {
               expiresIn: env.JWT_ACCESS_TOKEN_LIFE
          }
     );
}

const generateRefreshToken = async (payload) => {
     return jsonwebtoken.sign(
          payload,
          env.JWT_REFRESH_TOKEN_SECRET, {
               expiresIn: env.JWT_REFRESH_TOKEN_LIFE
          }
     );
}

class AuthController {

     async register(req, res) {
          try {
               if (!req.body.namaLengkap) throw {
                    code: 428,
                    message: "Nama Lengkap tidak boleh kosong!",
                    req
               }
               if (!req.body.noTelp) throw {
                    code: 428,
                    message: "No Telp tidak boleh kosong!",
                    req
               }
               if (!req.body.email) throw {
                    code: 428,
                    message: "Email tidak boleh kosong!",
                    req
               }
               if (!req.body.username) throw {
                    code: 428,
                    message: "Username tidak boleh kosong!",
                    req
               }
               if (!req.body.password) throw {
                    code: 428,
                    message: "Password tidak boleh kosong!",
                    req
               }
               if (req.body.password !== req.body.retype_password) {
                    throw {
                         code: 428,
                         message: "Password dan Konfirmasi Password Tidak Cocok!",
                         req
                    }
               }

               const isEmailExist = await emailExist(req.body.email);
               if (isEmailExist) throw {
                    code: 409,
                    message: "Email Sudah Terdaftar!",
                    req
               }

               const isUsernameExist = await User.findOne({
                    username: req.body.username
               });

               if (isUsernameExist) throw {
                    code: 409,
                    message: "Username Sudah Terdaftar!",
                    req
               }

               if (req.body.username.length < 6) throw {
                    code: 428,
                    message: "Username minimal 6 karakter!",
                    req
               }

               let salt = await bcrypt.genSalt(10);
               let hash = await bcrypt.hash(req.body.password, salt);

               let newUser = null;

               newUser = new User({
                    namaLengkap: req.body.namaLengkap,
                    noTelp: req.body.noTelp,
                    email: req.body.email,
                    username: req.body.username,
                    password: hash,
                    roles: req.body.roles ? req.body.roles : 'user',
               });

               const user = await newUser.save();

               if (!user) throw {
                    code: 500,
                    message: "Gagal Mendaftarkan Akun!",
                    req
               }

               await Debug.logging(200, "Berhasil Mendaftarkan Akun!", req.body.email, req);
               return res.status(200).json({
                    status: true,
                    message: 'Berhasil Mendaftarkan Akun!',
                    user
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

     async updatePassword(req, res) {
          try {
               const user = await User.findOne({
                    _id: req.JWT.id
               });

               if (!user) throw {
                    code: 404,
                    message: "User tidak ditemukan!",
                    req
               }

               if (!req.body.oldPassword) throw {
                    code: 428,
                    message: "Password Lama tidak boleh kosong!",
                    req
               }

               if (!req.body.newPassword) throw {
                    code: 428,
                    message: "Password Baru tidak boleh kosong!",
                    req
               }

               if (!req.body.retypePassword) throw {
                    code: 428,
                    message: "Konfirmasi Password tidak boleh kosong!",
                    req
               }

               if (req.body.newPassword !== req.body.retypePassword) throw {
                    code: 428,
                    message: "Password Baru dan Konfirmasi Password tidak cocok!",
                    req
               }

               const isMatch = await bcrypt.compareSync(req.body.oldPassword, user.password);

               if (!isMatch) throw {
                    code: 403,
                    message: "Password Lama Salah!",
                    req
               }

               let salt = await bcrypt.genSalt(10);
               let hash = await bcrypt.hash(req.body.newPassword, salt);

               const changePassword = await User.findOneAndUpdate({
                    _id: req.JWT.id
               }, {
                    password: hash
               }, {
                    new: true
               });

               if (!changePassword) throw {
                    code: 500,
                    message: "Gagal mengubah password!",
                    req
               }

               await Debug.logging(200, "Berhasil mengubah password!", req.JWT.email, req);

               return res.status(200).json({
                    status: true,
                    message: "Berhasil mengubah password!",
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

     async login(req, res) {
          try {
               if (!req.body.usernameOrEmail) throw {
                    code: 428,
                    message: "Username atau Email tidak boleh kosong!",
                    req
               }
               if (!req.body.password) throw {
                    code: 428,
                    message: "Password tidak boleh kosong!",
                    req
               }

               let user = null;

               user = await User.findOne({
                    email: req.body.usernameOrEmail
               });

               if (!user) {
                    user = await User.findOne({
                         username: req.body.usernameOrEmail
                    });
               }

               if (!user) throw {
                    username: req.body.usernameOrEmail,
                    code: 404,
                    message: "User tidak ditemukan!",
                    req
               }

               const isMatch = await bcrypt.compareSync(req.body.password, user.password);

               if (!isMatch) throw {
                    username: req.body.email,
                    code: 403,
                    message: "Email atau Password Salah!",
                    req
               }

               const payload = {
                    id: user._id,
                    namaLengkap: user.namaLengkap,
                    noTelp: user.noTelp,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
               };

               const accessToken = await generateAccessToken(payload)
               const refreshToken = await generateRefreshToken(payload)

               await Debug.logging(200, "Berhasil Login!", req.body.email, req);

               return res.status(200).json({
                    status: true,
                    message: 'Berhasil Login!',
                    accessToken,
                    refreshToken,
                    user: {
                         id: user._id,
                         namaLengkap: user.namaLengkap,
                         username: user.username,
                         roles: user.roles,
                         email: user.email,
                         noTelp: user.noTelp,
                    }
               });
          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }
               await Debug.logging(err.code, err.message, err.username, err.req);
               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }

     async refreshToken(req, res) {
          try {
               if (!req.body.refreshToken) throw {
                    code: 428,
                    message: "Refresh Token diperlukan!",
                    req
               }

               //verify token
               const verify = await jsonwebtoken.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET);

               //generate token
               let payload = {
                    id: verify.id,
                    role: verify.role
               };
               const accessToken = await generateAccessToken(payload)
               const refreshToken = await generateRefreshToken(payload)

               await Debug.logging(200, "Refresh Token Berhasil!", req?.JWT?.email || null, req);
               return res.status(200).json({
                    status: true,
                    message: 'REFRESH_TOKEN_SUCCESS',
                    accessToken,
                    refreshToken
               });
          } catch (err) {
               if (!err.code) {
                    err.code = 500
               }

               if (err.message === 'jwt expired') {
                    err.message = 'REFRESH_TOKEN_EXPIRED'
               } else if (err.message === 'invalid signature' || err.message === 'invalid token') {
                    err.message = 'REFRESH_TOKEN_INVALID'
               }

               await Debug.logging(err.code, err.message, err.username, err.req);

               return res.status(err.code).json({
                    status: false,
                    message: err.message
               });
          }
     }
}

export default new AuthController();