import { Router } from 'express'
import listRoutes from './list'
import managementRoutes from './management'
import crudRoutes from './crud'

const router = Router()

// 用户列表查询路由
router.use('/', listRoutes)

// 用户管理操作路由（状态、角色、密码更新）
router.use('/', managementRoutes)

// 用户CRUD操作路由（创建、删除）
router.use('/', crudRoutes)

export default router