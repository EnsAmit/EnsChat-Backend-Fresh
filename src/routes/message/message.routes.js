import {Router} from 'express'
import * as appMessageDetailsController from '../../controllers/message/message.controller.js'
import upload from '../../middlewares/files/upload_file.middleware.js'
import {verifyToken} from  '../../middlewares/files/verifyToken.js'

const appMessageDetailsRouterV1 = Router()

appMessageDetailsRouterV1.route('/addMessage').post(appMessageDetailsController.addMessage);
appMessageDetailsRouterV1.route('/getMessage').post(verifyToken,appMessageDetailsController.getMessage);
appMessageDetailsRouterV1.route('/upload_file').post(upload(), appMessageDetailsController.uploadFile);

export  { appMessageDetailsRouterV1 }