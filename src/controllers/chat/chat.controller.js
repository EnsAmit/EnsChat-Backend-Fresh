import Chat from '../../models/chat/chat.model.js'
import User from '../../models/auth/user.model.js'
import { createError } from '../../helpers/common/backend.functions.js'
import { ObjectId } from 'mongodb';

const addChat = async (req, res, next) => {
    const { userId } = req.body;
    const chatObj = {
        chatName: req.body.chatName,
        members: req.body.members,
    }
    if (!userId) {
        return next(400, "user not exist")
    }
    try {
        const newChat = await Chat.create(chatObj)
        const result = await newChat.save()
        if (!result) {
            return (next(createError(400, "chat not added")))
        }
        return res.status(201).json({ data: newChat })
    }
    catch (error) {
        next(error)
    }
}

const getChat = async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        return next(400, "user not exist")
    }
    try {
        const allChat = await Chat.find({
            members: { $eq: userId }
        }, { members: 1 }).populate({
            path: 'members',
            select: "_id firstName lastName picture"
        })

        if (!allChat) {
            return next(createError(400, "data not found"))
        }
        return res.status(200).json({
            data: allChat
        })
    }
    catch (error) {
        next(error)
    }
}

const searchChat = async (req, res, next) => {
    const { searchValue, } = req.body;
    const userId = req.user.id;
    if (searchValue) {
        try {
            // Search for users based on the provided search value
            const userExist = await User.find({
                $or: [
                    { firstName: { $regex: `^${searchValue}`, $options: 'i' } }, // Prefix search
                    { firstName: { $regex: `${searchValue}$`, $options: 'i' } }, // Suffix search
                    { lastName: { $regex: `^${searchValue}`, $options: 'i' } }, // Prefix search
                    { lastName: { $regex: `${searchValue}$`, $options: 'i' } },// Suffix search
                    { userName: { $regex: `^${searchValue}`, $options: 'i' } }
                ]
            }, { firstName: 1, lastName: 1, picture: 1 });

            if (!userExist || userExist.length === 0) {
                return next(createError(400, "User not exist"));
            }

            const senderId = userId;
            const singleChat = [];


            for (const user of userExist) {
                const receiverId = user._id.toString();

                // Find the chat room where both sender and receiver are members
                const room = await Chat.findOne({
                    isGroupChat: false,
                    members: {
                        $all: [
                            { $elemMatch: { userId: senderId } },
                            { $elemMatch: { userId: receiverId } }
                        ]
                    }
                }, { _id: 1 });


                if (room) {
                    singleChat.push({
                        chatId: room._id,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });
                }
                else {
                    singleChat.push({
                        chatId: null,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });

                }
            }


            return res.status(200).json({
                data: singleChat
            });
        } catch (error) {
            return next(error);
        }
    }
    else {

        try {
            let allChat = await Chat.find({
                isGroupChat: false,
                'members.userId': userId

            }).populate({
                path: 'members.userId',
                select: "_id firstName lastName picture"
            });

            if (!allChat) {
                return next(createError(400, "data not found"));
            }
            // Filter out the provided userId from members
            allChat = allChat.map(chat => {
                chat.members = chat.members.filter(member => member.userId._id.toString() !== userId);
                return chat;
            });

            let groups = await Chat.find({
                isGroupChat: true,
                'members.userId': userId
            }).populate({
                path: 'members.userId',
                select: "_id firstName lastName picture"
            });

            if (!groups) {
                return next(createError(400, "data not found"));
            }

            // Create group objects array
            const group = groups.map(groupChat => ({
                isGroupChat: groupChat.isGroupChat,
                chatId: groupChat._id,
                member: groupChat.members,
                fullName: groupChat.chatName,
                picture: groupChat.picture
            }));


            const singleChat = allChat.flatMap(chat =>
                chat.members.map(member => ({
                    isGroupChat: chat.isGroupChat,
                    chatId: chat._id,
                    userId: member.userId._id,
                    fullName: `${member.userId.firstName} ${member.userId.lastName}`,
                    picture: member.userId.picture
                }))
            );
            const result = [
                ...singleChat,
                ...group
            ]
            // console.log('group->',rest)
            return res.status(200).json({
                data: result
            });
        }

        catch (error) {
            next(error)
        }
    }

}

const addGroup = async (req, res, next) => {
    try {
        const newGroup = await Chat.create(req.body)
        const result = await newGroup.save()
        if (!result) {
            return next(createError(500, "data is not added"))
        }
        return res.status(200).json({
            data: newGroup,
            message: "Group created successfully"
        })
    }
    catch (error) {
        console.log(error, "error")
        next(error);
    }
}

const getGroupMember = async (req, res, next) => {
    const { id } = req.body;
    if (!id) {
        return next(createError(400, "group id is not provided"));
    }
    try {
        const chat = await Chat.findById(id).populate({
            path: 'members.userId',
            select: 'firstName lastName picture '
        });
        const members = chat.members.map(member => ({
            userId: member.userId._id,
            firstName: member.userId.firstName,
            lastName: member.userId.lastName,
            picture: member.userId.picture,
            isAdmin: member.isAdmin
        }));
        // console.log
        // console.log('chat', members)
        if (!chat) {
            return next(createError(404, "chat not found"))
        }
        return res.status(200).json({
            data: members
        })
    }
    catch (error) {
        console.log(error, "error")
        next(error);

    }


}
const updateGroup = async (req, res, next) => {
    try {

        const { ...update } = req.body;
        const { id } = req.body;
        if(!id){
            return next(createError(404,"group id not provided"))
        }

        const groupExist = await Chat.findById(id);
        if (!groupExist) {
            return next(createError(400, "Group not found"))
        }

        //updating field based on user requirement
        for (let key in update) {
            if (update.hasOwnProperty(key)) {
                groupExist[key] = update[key]
            }
        }
        const result = await groupExist.save();
        if (!result) {
            return next(createError(404, "facing issue in group update"))
        }

        if (result) {
            res.status(200).json({ message: "update successfully" })
        }
    }
    catch (error) {
        next(error)
    }
}
const updateGroupPic = async (req, res, next) => {
    try {
        // const id = req.querry.id
        const { id } = req.body;
        const fileName = req.file.filename;
        const groupExist = await Chat.findById(id)
        if(!id){
            return next(createError(404,"group id not provided"))
        }
        if (!groupExist) {
            next(createError(404, "group Not exists"))
            return;
        }

        groupExist.chatPic = fileName;
        const result = await groupExist.save()
        if (!result) {
            next(createError(400, "fail to update the profile picture"))
        }
        res.status(200).json({ message: "Profile Updated successfuly" })
    }
    catch (error) {
        next(error)
    }
}

const getAllGroup = async (req, res, next) => {
    const { chatId } = req.body.chatId;
    if (!chatId) {
        return next(createError(400, "provide the required feild"))
    }
    try {
        const chatExist = await Chat.find(req.body)
        if (!chatExist) {
            return next(createError(400, "group does not exist"))
        }
        return res.status(200).json({ data: chatExist })
    }
    catch (error) {

        next(error)
    }
}

const getUserWithChatId = async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return next(400, "user not exist")
    }
    try {
        const allChat = await Chat.find(
            {
                "members": {
                    "$elemMatch": {
                        "userId": "664eccac02d9362769cf23aa"
                    }
                }
            },
            "_id"
        )

        if (!allChat) {
            return next(createError(400, "data not found"))
        }
        return res.status(200).json({
            data: allChat
        })
    }
    catch (error) {
        next(error)
    }
}



export { addChat, getChat, searchChat, addGroup, getAllGroup, getUserWithChatId, getGroupMember, updateGroup, updateGroupPic }
