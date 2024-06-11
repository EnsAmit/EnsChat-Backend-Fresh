import { Router } from 'express';
import * as appChatDetailsController from '../../controllers/chat/chat.controller.js'
import { verifyToken } from '../../middlewares/files/verifyToken.js';

const appChatDetailsRouterV1 = Router();

appChatDetailsRouterV1.route('/addChat').post(verifyToken,appChatDetailsController.addChat)
appChatDetailsRouterV1.route('/getChat').post(appChatDetailsController.getChat)
appChatDetailsRouterV1.route('/searchChat').post(verifyToken,appChatDetailsController.searchChat)
appChatDetailsRouterV1.route('/addGroup').post(appChatDetailsController.addGroup)
appChatDetailsRouterV1.route('/searchUser').post(verifyToken,appChatDetailsController.searchUser)
appChatDetailsRouterV1.route('/getgroup').post(appChatDetailsController.getAllGroup)
appChatDetailsRouterV1.route('/userWithChatId').post(appChatDetailsController.getUserWithChatId)

export { appChatDetailsRouterV1 };