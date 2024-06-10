import Message from '../../models/message/message.model.js'
import { createError } from '../../helpers/common/backend.functions.js'
import storage from '../../helpers/init_firebase.js';
import { getStorage, ref, uploadBytes } from "firebase/storage";

const addMessage = async (req, res, next) => {
    const { sender, content, chat } = req.body;
    // if (!sender || !chat || sender == '' || chat == '') {
    //     return next(createError(400, "plz provide the required feild"))
    // }
    try {
        const newMessage = await Message.create(req.body);
        const result = await newMessage.save()
        if (!result) {
            return next(createError(500, 'Internal server error: Failed to save data'))
        }
        return res.status(201).json({
            message: "message save successfully"
        })
    }
    catch (error) {
        return next(error)
    }
}

const getMessage = async (req, res, next) => {
    const { chat } = req.body;
    if (!chat || chat == '') {
        return next(createError(400, "plz provide the required feild"))
    }
    try {
        const result = await Message.find(req.body)
        // .populate({
        //     path: 'sender',
        //     select: 'firstName lastName' // Specify the fields to populate
        // })
        // .exec();

        if (!result) {
            return next(createError(500, 'Internal server error: Failed to save data'))
        }

        return res.status(200).json({ data: result })
    }
    catch (error) {
        return next(error)
    }

}

const uploadFile = async (req, res, next) => {
    const file = req.file;
    let messageType = ""

    // Get the mimetype of the uploaded file
    const mimeType = file.mimetype;

    // Check the mimetype to determine the type of file
    if (mimeType.startsWith('image')) {
        console.log('Uploaded file is an image.');
        messageType = 'image'
        // Handle image file
    } else if (mimeType.startsWith('audio')) {
        console.log('Uploaded file is an audio file.');
        messageType = 'audio'
        // Handle audio file
    } else if (mimeType.startsWith('video')) {
        console.log('Uploaded file is a video file.');
        messageType = 'video'
        // Handle video file
    } else if (mimeType === 'application/pdf') {
        console.log('Uploaded file is a PDF file.');
        messageType = 'application/pdf'
        // Handle PDF file
    } else {
        console.log('Uploaded file is of an unsupported type.');
        messageType = 'none'
        // Handle unsupported file type
    }

    console.log(req.file, "fileName")
    try {

        return res.status(200).json({ fileName: req.file.filename, messageType: messageType })
    }
    catch (error) {
        return next(error)
    }

}


// Function to upload file to Firebase Storage
const uploadFile1 = (file) => {
    const storageRef = ref(storage, `fir-rtc-8e24b.appspot.com/${file.name}`);
    return uploadBytes(storageRef, file)
        .then((snapshot) => {
            console.log('File uploaded successfully');
            // Return download URL or any other relevant data
            return snapshot.ref.getDownloadURL();
        })
        .catch((error) => {
            console.error('Error uploading file:', error);
            throw error;
        });
};

const uploadFileFirebase = async (req, res) => {

    const file = req.files.file; // Assuming you're using multer for file uploads
    uploadFile1(file)
        .then((downloadURL) => {
            console.log('Download URL:', downloadURL);
            // Handle success
        })
        .catch((error) => {
            // Handle error
        });

}

export { addMessage, getMessage, uploadFile, uploadFileFirebase }
