import multer from "multer";

class Service {
     async uploadFile(req, res, folderName, callback) {
          let unixtime = parseInt(Math.round(new Date().getTime() / 1000).toString())
          let hextime = unixtime.toString(16).toUpperCase();

          const storage = multer.diskStorage({
               destination: (req, file, cb) => {
                    cb(null, folderName);
               },
               filename: async (req, file, cb) => {
                    const fileExtension = file.mimetype.split("/").pop();
                    file.originalname = `${hextime}.${fileExtension}`;
                    cb(null, file.originalname);
               },
          });

          const upload = multer({
               storage
          }).single('file');
          upload(req, res, (err) => {
               if (err) return callback({
                    status: false,
                    message: 'Gagal Upload File'
               });

               if (!req.file) return callback({
                    status: false,
                    message: 'File Tidak Boleh Kosong'
               });

               // Memanggil callback dengan req.file sebagai argumen
               return callback(req.file);
          });

     }
}

export default new Service();