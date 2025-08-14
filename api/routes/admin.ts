import { Router } from 'express'
import adminRouter from './admin/index'

const router = Router()

// 使用分离后的管理员路由模块
router.use('/', adminRouter)

export default router
