/**
 * 完整的前后端数据流程测试脚本
 * 测试联系邮箱和站点域名的保存和读取流程
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Supabase配置
const supabaseUrl = 'https://powzuwgzbmpnqamchdma.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvd3p1d2d6Ym1wbnFhbWNoZG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5MjQwOCwiZXhwIjoyMDcwNjY4NDA4fQ.CJiTdPp8Afrv9C0eewo4YIwik54i75SEpSgZEp09o38'