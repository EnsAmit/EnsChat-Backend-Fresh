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
            const result = [];

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
                // const group = await Chat.find({
                //     isGroupChat: true,
                //     members: {
                //         $all: [
                //             { $elemMatch: { userId: senderId } },

                //         ]
                //     }
                // }, { _id: 1, chatName:1, members:1, chatPic:1, isGroupChat:1 });
                // console.log('group',group)



                if (room) {
                    result.push({
                        chatId: room._id,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });
                }
                else {
                    result.push({
                        chatId: null,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });

                }
            }

            return res.status(200).json({
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }
    else {

        try {
            let allChat = await Chat.find({
                'members.userId': userId,
                isGroupChat: false
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

            const result = allChat.flatMap(chat =>
                chat.members.map(member => ({
                    chatId: chat._id,
                    userId: member.userId._id,
                    fullName: `${member.userId.firstName} ${member.userId.lastName}`,
                    picture: member.userId.picture
                }))
            );
            return res.status(200).json({
                data: result
            });
        }

        catch (error) {
            next(error)
        }
    }

}

const searchUser = async (req, res, next) => {
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
            const result = [];

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
                // const group = await Chat.find({
                //     isGroupChat: true,
                //     members: {
                //         $all: [
                //             { $elemMatch: { userId: senderId } },

                //         ]
                //     }
                // }, { _id: 1, chatName:1, members:1, chatPic:1, isGroupChat:1 });
                // console.log('group',group)



                if (room) {
                    result.push({
                        chatId: room._id,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });
                }
                else {
                    result.push({
                        chatId: null,
                        receiver: receiverId,
                        fullName: `${user.firstName} ${user.lastName}`,
                        picture: user.picture
                    });

                }
            }

            return res.status(200).json({
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }
    else {

        try {
            let allChat = await Chat.find({
                'members.userId': userId,
                isGroupChat: false
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

            const result = allChat.flatMap(chat =>
                chat.members.map(member => ({
                    chatId: chat._id,
                    userId: member.userId._id,
                    fullName: `${member.userId.firstName} ${member.userId.lastName}`,
                    picture: member.userId.picture
                }))
            );
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
        console.log("req.body", req.body)
        const userId = req.user.id;
        const { groupData, addImage } = req.body;
        const membersData = []
        addImage.map((item, index) => {
                membersData.push({ userId: item._id, isAdmin: false })
        })
        membersData.push({ userId: userId, isAdmin: true })
        const newGroup = await Chat.create({
            chatName: groupData.chat_name,
            isGroupChat: true,
            chatPic: "temp.jpg",
            members: membersData,
            latestMessage: new ObjectId('6645f9949de2321456dc28d3')
        })
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



export { addChat, getChat, searchChat, searchUser, addGroup, getAllGroup, getUserWithChatId }
