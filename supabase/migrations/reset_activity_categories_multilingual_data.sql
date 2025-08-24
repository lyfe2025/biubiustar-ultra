-- Reset activity categories with real multilingual data
-- This migration clears existing test data and inserts real activity categories with proper translations
-- Supports: Chinese (zh), English (en), Japanese (ja), Korean (ko)

-- Clear existing activity categories data
DELETE FROM activity_categories;

-- Reset the sequence (using the correct sequence name)
SELECT setval(pg_get_serial_sequence('activity_categories', 'id'), 1, false);

-- Insert real activity categories with multilingual support
INSERT INTO activity_categories (
  name, description, name_zh, name_zh_tw, name_en, name_vi,
  description_zh, description_zh_tw, description_en, description_vi,
  color, icon, is_active
) VALUES
-- 户外运动
(
  '户外运动', '登山、徒步、骑行、露营等户外体育活动',
  '户外运动', '戶外運動', 'Outdoor Sports', 'Thể thao ngoài trời',
  '登山、徒步、骑行、露营等户外体育活动', '登山、徒步、騎行、露營等戶外體育活動', 'Hiking, trekking, cycling, camping and other outdoor physical activities', 'Leo núi, đi bộ đường dài, đạp xe, cắm trại và các hoạt động thể chất ngoài trời khác',
  '#10B981', 'mountain', true
),
-- 学习交流
(
  '学习交流', '知识分享、技能学习、经验交流等教育类活动',
  '学习交流', '學習交流', 'Learning & Exchange', 'Học tập và trao đổi',
  '知识分享、技能学习、经验交流等教育类活动', '知識分享、技能學習、經驗交流等教育類活動', 'Knowledge sharing, skill learning, experience exchange and other educational activities', 'Chia sẻ kiến thức, học kỹ năng, trao đổi kinh nghiệm và các hoạt động giáo dục khác',
  '#3B82F6', 'book-open', true
),
-- 社交聚会
(
  '社交聚会', '朋友聚会、派对、交友等社交类活动',
  '社交聚会', '社交聚會', 'Social Gathering', 'Tụ tập xã hội',
  '朋友聚会、派对、交友等社交类活动', '朋友聚會、派對、交友等社交類活動', 'Friend gatherings, parties, making friends and other social activities', 'Tụ tập bạn bè, tiệc tùng, kết bạn và các hoạt động xã hội khác',
  '#F59E0B', 'users', true
),
-- 文化艺术
(
  '文化艺术', '绘画、音乐、舞蹈、戏剧等艺术文化活动',
  '文化艺术', '文化藝術', 'Culture & Arts', 'Văn hóa và nghệ thuật',
  '绘画、音乐、舞蹈、戏剧等艺术文化活动', '繪畫、音樂、舞蹈、戲劇等藝術文化活動', 'Painting, music, dance, theater and other artistic cultural activities', 'Hội họa, âm nhạc, khiêu vũ, sân khấu và các hoạt động văn hóa nghệ thuật khác',
  '#8B5CF6', 'palette', true
),
-- 志愿服务
(
  '志愿服务', '公益活动、社区服务、环保行动等志愿服务',
  '志愿服务', '志願服務', 'Volunteer Service', 'Dịch vụ tình nguyện',
  '公益活动、社区服务、环保行动等志愿服务', '公益活動、社區服務、環保行動等志願服務', 'Public welfare activities, community service, environmental protection and other volunteer services', 'Các hoạt động phúc lợi công cộng, dịch vụ cộng đồng, bảo vệ môi trường và các dịch vụ tình nguyện khác',
  '#EF4444', 'heart', true
),
-- 技术分享
(
  '技术分享', '编程、设计、科技等技术领域的分享交流',
  '技术分享', '技術分享', 'Tech Sharing', 'Chia sẻ công nghệ',
  '编程、设计、科技等技术领域的分享交流', '編程、設計、科技等技術領域的分享交流', 'Programming, design, technology and other technical field sharing and exchange', 'Lập trình, thiết kế, công nghệ và các hoạt động chia sẻ kỹ thuật khác',
  '#06B6D4', 'code', true
),
-- 娱乐休闲
(
  '娱乐休闲', '游戏、电影、KTV、桌游等娱乐休闲活动',
  '娱乐休闲', '娛樂休閒', 'Entertainment & Leisure', 'Giải trí và nghỉ ngơi',
  '游戏、电影、KTV、桌游等娱乐休闲活动', '遊戲、電影、KTV、桌遊等娛樂休閒活動', 'Games, movies, KTV, board games and other entertainment and leisure activities', 'Trò chơi, phim ảnh, KTV, trò chơi bàn và các hoạt động giải trí khác',
  '#EC4899', 'gamepad-2', true
),
-- 商务活动
(
  '商务活动', '会议、研讨会、商务交流等职业发展活动',
  '商务活动', '商務活動', 'Business Events', 'Sự kiện kinh doanh',
  '会议、研讨会、商务交流等职业发展活动', '會議、研討會、商務交流等職業發展活動', 'Conferences, seminars, business exchanges and other professional development activities', 'Hội nghị, hội thảo, trao đổi kinh doanh và các hoạt động phát triển nghề nghiệp khác',
  '#64748B', 'briefcase', true
),
-- 美食聚会
(
  '美食聚会', '美食品鉴、烹饪学习、餐厅聚餐等美食相关活动',
  '美食聚会', '美食聚會', 'Food Gathering', 'Tụ tập ẩm thực',
  '美食品鉴、烹饪学习、餐厅聚餐等美食相关活动', '美食品嚐、烹飪學習、餐廳聚餐等美食相關活動', 'Food tasting, cooking learning, restaurant dining and other food-related activities', 'Nếm thức ăn, học nấu ăn, ăn uống tại nhà hàng và các hoạt động liên quan đến ẩm thực khác',
  '#F97316', 'utensils', true
),
-- 摄影
(
  '摄影', '摄影技巧学习、外拍活动、摄影作品分享',
  '摄影', '攝影', 'Photography', 'Nhiếp ảnh',
  '摄影技巧学习、外拍活动、摄影作品分享', '攝影技巧學習、外拍活動、攝影作品分享', 'Photography skill learning, outdoor shooting activities, photography work sharing', 'Học kỹ thuật nhiếp ảnh, hoạt động chụp ảnh ngoại cảnh, chia sẻ tác phẩm nhiếp ảnh',
  '#84CC16', 'camera', true
),
-- 音乐
(
  '音乐', '音乐演出、乐器学习、音乐欣赏等音乐活动',
  '音乐', '音樂', 'Music', 'Âm nhạc',
  '音乐演出、乐器学习、音乐欣赏等音乐活动', '音樂演出、樂器學習、音樂欣賞等音樂活動', 'Music performances, instrument learning, music appreciation and other music activities', 'Biểu diễn âm nhạc, học nhạc cụ, thưởng thức âm nhạc và các hoạt động âm nhạc khác',
  '#A855F7', 'music', true
),
-- 旅行
(
  '旅行', '旅游、探索、文化体验等旅行相关活动',
  '旅行', '旅行', 'Travel', 'Du lịch',
  '旅游、探索、文化体验等旅行相关活动', '旅遊、探索、文化體驗等旅行相關活動', 'Tourism, exploration, cultural experience and other travel-related activities', 'Du lịch, khám phá, trải nghiệm văn hóa và các hoạt động liên quan đến du lịch khác',
  '#14B8A6', 'map-pin', true
),
-- 健身运动
(
  '健身运动', '健身、瑜伽、跑步、球类等室内外运动',
  '健身运动', '健身運動', 'Fitness & Sports', 'Thể dục và thể thao',
  '健身、瑜伽、跑步、球类等室内外运动', '健身、瑜伽、跑步、球類等室內外運動', 'Fitness, yoga, running, ball games and other indoor and outdoor sports', 'Thể dục, yoga, chạy bộ, các môn thể thao bóng và các hoạt động thể thao khác',
  '#22C55E', 'dumbbell', true
),
-- 读书会
(
  '读书会', '读书分享、文学讨论、作者见面会等阅读活动',
  '读书会', '讀書會', 'Book Club', 'Câu lạc bộ sách',
  '读书分享、文学讨论、作者见面会等阅读活动', '讀書分享、文學討論、作者見面會等閱讀活動', 'Book sharing, literature discussion, author meet-and-greet and other reading activities', 'Chia sẻ sách, thảo luận văn học, gặp gỡ tác giả và các hoạt động đọc sách khác',
  '#6366F1', 'book', true
),
-- 艺术创作
(
  '艺术创作', '绘画、手工、雕塑、设计等艺术创作活动',
  '艺术创作', '藝術創作', 'Art Creation', 'Sáng tác nghệ thuật',
  '绘画、手工、雕塑、设计等艺术创作活动', '繪畫、手工、雕塑、設計等藝術創作活動', 'Painting, handicrafts, sculpture, design and other art creation activities', 'Hội họa, thủ công, điêu khắc, thiết kế và các hoạt động sáng tác nghệ thuật khác',
  '#F43F5E', 'paintbrush', true
);