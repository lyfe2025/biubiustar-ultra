import { Router } from 'express'
import authRouter from './auth'
import usersRouter from './users'
import postsRouter from './posts'
import activitiesRouter from './activities'
import categoriesRouter from './categories'
import settingsRouter from './settings'

const router = Router()

// 路由聚合 - 将分离的功能模块重新组合
router.use('/', authRouter)           // 认证和统计路由
router.use('/users', usersRouter)     // 用户管理路由
router.use('/posts', postsRouter)     // 内容管理路由
router.use('/activities', activitiesRouter)  // 活动管理路由
router.use('/categories', categoriesRouter)  // 分类管理路由
router.use('/settings', settingsRouter)      // 系统设置路由

export default router
