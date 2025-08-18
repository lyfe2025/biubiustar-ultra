import { Router } from 'express'
import activityRoutes from './activity.js'
import contentRoutes from './content.js'

const router = Router()

// 活动分类管理路由
router.use('/activity', activityRoutes)

// 内容分类管理路由
router.use('/content', contentRoutes)

export default router