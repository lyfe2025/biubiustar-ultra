import { Router, Request, Response } from 'express'
import { asyncHandler } from '../../../middleware/asyncHandler.js'
import { requireAdmin } from '../../../middleware/auth.js'
import { supabaseAdmin } from '../../../lib/supabase.js'

const router = Router()

// 数据库连接测试
router.get('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('=== 数据库测试API开始 ===')
    
    // 1. 测试基本连接 - 获取所有表
    console.log('1. 测试基本数据库连接...')
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('获取表列表失败:', tablesError)
      return res.json({
        success: false,
        error: `获取表列表失败: ${tablesError.message}`,
        tableCount: 0,
        hasCacheConfigs: false,
        cacheConfigsCount: 0
      })
    }
    
    console.log('表列表获取成功，数量:', tables?.length || 0)
    
    // 2. 检查cache_configs表是否存在
    const hasCacheConfigs = tables?.some(t => t.table_name === 'cache_configs') || false
    console.log('cache_configs表存在:', hasCacheConfigs)
    
    // 3. 如果表存在，获取记录数量
    let cacheConfigsCount = 0
    if (hasCacheConfigs) {
      console.log('2. 检查cache_configs表记录...')
      const { count, error: countError } = await supabaseAdmin
        .from('cache_configs')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('获取记录数量失败:', countError)
        cacheConfigsCount = -1 // 表示查询失败
      } else {
        cacheConfigsCount = count || 0
        console.log('cache_configs表记录数量:', cacheConfigsCount)
      }
      
      // 4. 获取前几条记录作为样本
      if (cacheConfigsCount > 0) {
        console.log('3. 获取样本数据...')
        const { data: sampleData, error: sampleError } = await supabaseAdmin
          .from('cache_configs')
          .select('*')
          .limit(3)
        
        if (sampleError) {
          console.error('获取样本数据失败:', sampleError)
        } else {
          console.log('样本数据:', sampleData)
        }
      }
    }
    
    const result = {
      success: true,
      tableCount: tables?.length || 0,
      hasCacheConfigs,
      cacheConfigsCount,
      tables: tables?.map(t => t.table_name) || [],
      timestamp: new Date().toISOString()
    }
    
    console.log('数据库测试完成，结果:', result)
    console.log('=== 数据库测试API结束 ===')
    
    res.json(result)
  } catch (error) {
    console.error('数据库测试API异常:', error)
    res.status(500).json({
      success: false,
      error: `数据库测试异常: ${error.message}`,
      tableCount: 0,
      hasCacheConfigs: false,
      cacheConfigsCount: 0
    })
  }
}))

export default router
