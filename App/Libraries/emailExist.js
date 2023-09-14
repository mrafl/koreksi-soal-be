import user from '../Models/User.js';

const emailExist = async (email) => {
    try {
        const User = await user.findOne({ email: email });
        if(!User) { return false }
        return true;
    } catch (err) {
        return false;
    }
}

export default emailExist;