import fs from 'fs';
import path from 'path';
import moment from 'moment';

class Debug {
    async logging (code, message, username, req) {
        const date = new Date();
        const formatDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        
        let debug = {
            code: code,
            message: message,
            username: username || null,
            method: req?.method,
            url: req?.url,
            browser: req?.headers?.["user-agent"],
            ip: req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress,
            date: formatDate
        };

        // masukan ke file logging/logs.txt
        const formatDateFile = moment(date).format('DD-MM-YYYY');
        const folder = path.join(`./logging`);
        try {
            // check if folder already exists
            fs.accessSync(folder);
        } catch (err) {
            // create folder if it doesn't exist
            fs.mkdirSync(folder, { recursive: true });
        }
        
        const logString = JSON.stringify(debug) + '\n';
        const filePath = `./logging/${formatDateFile}.txt`;
        fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
            // File tidak ditemukan, maka buat file baru
            fs.writeFile(filePath, logString, (err) => {
                if (err) console.error('Terjadi kesalahan saat membuat file:');
            });
            } else {
                console.error('Terjadi kesalahan saat mengakses file:');
            }
        } else {
            // File sudah ada, langsung tulis objek ke dalam file
            fs.appendFile(filePath, logString, (err) => {
                if (err) console.error('Terjadi kesalahan saat menulis file:', err);
            });
        }
        });
    
        console.log(debug);
    }
}


export default new Debug();