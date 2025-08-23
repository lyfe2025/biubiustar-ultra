/*
 Navicat Premium Dump SQL

 Source Server         : biubiustar-ultra
 Source Server Type    : PostgreSQL
 Source Server Version : 170004 (170004)
 Source Host           : aws-0-us-east-2.pooler.supabase.com:6543
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170004 (170004)
 File Encoding         : 65001

 Date: 23/08/2025 08:16:38
*/


-- ----------------------------
-- Type structure for gtrgm
-- ----------------------------
DROP TYPE IF EXISTS "public"."gtrgm";
CREATE TYPE "public"."gtrgm" (
  INPUT = "public"."gtrgm_in",
  OUTPUT = "public"."gtrgm_out",
  INTERNALLENGTH = VARIABLE,
  CATEGORY = U,
  DELIMITER = ','
);
ALTER TYPE "public"."gtrgm" OWNER TO "supabase_admin";

-- ----------------------------
-- Sequence structure for system_settings_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."system_settings_id_seq";
CREATE SEQUENCE "public"."system_settings_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."system_settings_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS "public"."activities";
CREATE TABLE "public"."activities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "image_url" text COLLATE "pg_catalog"."default",
  "start_date" timestamptz(6) NOT NULL,
  "end_date" timestamptz(6),
  "location" varchar(255) COLLATE "pg_catalog"."default",
  "max_participants" int4,
  "current_participants" int4 DEFAULT 0,
  "user_id" uuid NOT NULL,
  "category" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'published'::character varying,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "category_id" uuid
)
;
ALTER TABLE "public"."activities" OWNER TO "postgres";
COMMENT ON COLUMN "public"."activities"."status" IS '活动状态: published(已发布), draft(草稿), cancelled(已取消)';

-- ----------------------------
-- Records of activities
-- ----------------------------
BEGIN;
INSERT INTO "public"."activities" ("id", "title", "description", "image_url", "start_date", "end_date", "location", "max_participants", "current_participants", "user_id", "category", "status", "created_at", "updated_at", "category_id") VALUES ('499e1b53-ea11-4965-a218-3cdc7307c249', '12312', '1 阿萨德阿萨德按时打算大是的', 'http://localhost:3001/uploads/activities/1755611710172-775299457.png', '2025-08-05 09:01:00+00', '2025-08-18 09:01:00+00', '阿阿', 109, 0, 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', '文化艺术', 'published', '2025-08-18 17:01:14.852+00', '2025-08-19 13:55:12.254+00', NULL);
INSERT INTO "public"."activities" ("id", "title", "description", "image_url", "start_date", "end_date", "location", "max_participants", "current_participants", "user_id", "category", "status", "created_at", "updated_at", "category_id") VALUES ('98ed06ee-c750-4ebc-8753-12f6dc5d968d', '安师大', '阿萨德阿萨德阿萨德阿萨德阿萨德按时大sa', 'http://localhost:3001/uploads/activities/1755544381429-597972735.png', '2025-09-16 13:18:00+00', '2025-09-28 10:18:00+00', '阿大师的', 123, 1, 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', '健身运动', 'published', '2025-08-18 18:18:58.607+00', '2025-08-20 14:11:57.171+00', NULL);
INSERT INTO "public"."activities" ("id", "title", "description", "image_url", "start_date", "end_date", "location", "max_participants", "current_participants", "user_id", "category", "status", "created_at", "updated_at", "category_id") VALUES ('b502dc62-3969-4958-b652-54927ed81545', '按时', '阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿阿萨德阿', 'http://localhost:3001/uploads/activities/1755547003809-620257176.png', '2025-08-11 00:56:00+00', '2025-08-28 19:56:00+00', '阿阿', 123, 1, 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', '111', 'published', '2025-08-18 19:56:49.57+00', '2025-08-19 13:49:16.246+00', NULL);
INSERT INTO "public"."activities" ("id", "title", "description", "image_url", "start_date", "end_date", "location", "max_participants", "current_participants", "user_id", "category", "status", "created_at", "updated_at", "category_id") VALUES ('9a77a794-142f-41f5-bf3e-1d3903a322c2', '阿萨德', '阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德', 'http://localhost:3001/uploads/activities/1755547665781-595483982.png', '2025-08-18 12:07:00+00', '2025-08-28 12:07:00+00', '阿萨德阿萨德', 1111, 1, 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', '旅行', 'published', '2025-08-18 20:08:06.881+00', '2025-08-22 22:08:58.91+00', NULL);
COMMIT;

-- ----------------------------
-- Table structure for activity_categories
-- ----------------------------
DROP TABLE IF EXISTS "public"."activity_categories";
CREATE TABLE "public"."activity_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "color" varchar(7) COLLATE "pg_catalog"."default" DEFAULT '#3B82F6'::character varying,
  "icon" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'tag'::character varying,
  "is_active" bool DEFAULT true,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "name_zh" text COLLATE "pg_catalog"."default",
  "name_zh_tw" text COLLATE "pg_catalog"."default",
  "name_en" text COLLATE "pg_catalog"."default",
  "name_vi" text COLLATE "pg_catalog"."default",
  "description_zh" text COLLATE "pg_catalog"."default",
  "description_zh_tw" text COLLATE "pg_catalog"."default",
  "description_en" text COLLATE "pg_catalog"."default",
  "description_vi" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."activity_categories" OWNER TO "postgres";
COMMENT ON COLUMN "public"."activity_categories"."name_zh" IS 'Category name in Simplified Chinese';
COMMENT ON COLUMN "public"."activity_categories"."name_zh_tw" IS 'Category name in Traditional Chinese';
COMMENT ON COLUMN "public"."activity_categories"."name_en" IS 'Category name in English';
COMMENT ON COLUMN "public"."activity_categories"."name_vi" IS 'Category name in Vietnamese';
COMMENT ON COLUMN "public"."activity_categories"."description_zh" IS 'Category description in Simplified Chinese';
COMMENT ON COLUMN "public"."activity_categories"."description_zh_tw" IS 'Category description in Traditional Chinese';
COMMENT ON COLUMN "public"."activity_categories"."description_en" IS 'Category description in English';
COMMENT ON COLUMN "public"."activity_categories"."description_vi" IS 'Category description in Vietnamese';

-- ----------------------------
-- Records of activity_categories
-- ----------------------------
BEGIN;
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('e409c940-075e-4dc3-8ab8-9be093e89156', '户外运动', '户外体育活动和运动', '#10B981', 'mountain', 't', '2025-08-14 13:36:25.512181+00', '2025-08-18 18:42:22.411811+00', '户外运动', '户外运动', '户外运动', '户外运动', '户外体育活动和运动', '户外体育活动和运动', '户外体育活动和运动', '户外体育活动和运动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('773356f5-3e16-40f1-806e-9fa3fe092d06', '社交聚会', '社交活动和聚会', '#F59E0B', 'users', 't', '2025-08-14 13:36:25.512181+00', '2025-08-18 18:42:22.411811+00', '社交聚会', '社交聚会', '社交聚会', '社交聚会', '社交活动和聚会', '社交活动和聚会', '社交活动和聚会', '社交活动和聚会');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('9ef780db-7cdc-4960-bf11-601a91281a04', '文化艺术', '文化艺术活动', '#8B5CF6', 'palette', 't', '2025-08-14 13:36:25.512181+00', '2025-08-18 18:42:22.411811+00', '文化艺术', '文化艺术', '文化艺术', '文化艺术', '文化艺术活动', '文化艺术活动', '文化艺术活动', '文化艺术活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('18b805e3-4dae-4c9e-8004-48f87ab6eccd', '娱乐休闲', '娱乐和休闲活动', '#84CC16', 'gamepad-2', 't', '2025-08-14 13:36:25.512181+00', '2025-08-18 18:42:22.411811+00', '娱乐休闲', '娱乐休闲', '娱乐休闲', '娱乐休闲', '娱乐和休闲活动', '娱乐和休闲活动', '娱乐和休闲活动', '娱乐和休闲活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('a35da7e6-31d4-4c64-a11d-b5670f8712ff', '商务活动', '商务会议和活动', '#6B7280', 'briefcase', 't', '2025-08-14 13:36:25.512181+00', '2025-08-18 18:42:22.411811+00', '商务活动', '商务活动', '商务活动', '商务活动', '商务会议和活动', '商务会议和活动', '商务会议和活动', '商务会议和活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('4a4ef8eb-30df-43ac-93ce-1e7ef8270fa4', '技术分享', '技术交流和知识分享活动', '#3B82F6', 'code', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '技术分享', '技术分享', '技术分享', '技术分享', '技术交流和知识分享活动', '技术交流和知识分享活动', '技术交流和知识分享活动', '技术交流和知识分享活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('1ef508f7-6ee1-4a7a-8f43-0196ca94d240', '学习交流', '学习小组和知识交流活动', '#F59E0B', 'book-open', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '学习交流', '学习交流', '学习交流', '学习交流', '学习小组和知识交流活动', '学习小组和知识交流活动', '学习小组和知识交流活动', '学习小组和知识交流活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('0f1ef72e-9380-4c2e-b060-bad305b29f42', '读书会', '读书分享和文学交流活动', '#7C3AED', 'book', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '读书会', '读书会', '读书会', '读书会', '读书分享和文学交流活动', '读书分享和文学交流活动', '读书分享和文学交流活动', '读书分享和文学交流活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('2c2be90e-9a7e-425d-a280-7e30fda79f69', '美食聚会', '美食品尝和烹饪交流活动', '#EF4444', 'utensils', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '美食聚会', '美食聚会', '美食聚会', '美食聚会', '美食品尝和烹饪交流活动', '美食品尝和烹饪交流活动', '美食品尝和烹饪交流活动', '美食品尝和烹饪交流活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('313f6d51-ebcb-49b0-a457-b24c412494cd', '摄影', '摄影交流和作品分享活动', '#06B6D4', 'camera', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '摄影', '摄影', '摄影', '摄影', '摄影交流和作品分享活动', '摄影交流和作品分享活动', '摄影交流和作品分享活动', '摄影交流和作品分享活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('a0f2b584-9f02-4e56-937e-7717ae32c79e', '音乐', '音乐演出和交流活动', '#EC4899', 'music', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '音乐', '音乐', '音乐', '音乐', '音乐演出和交流活动', '音乐演出和交流活动', '音乐演出和交流活动', '音乐演出和交流活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('901287ae-330e-4407-9168-da1fb5a30a42', '旅行', '旅行分享和户外探索活动', '#10B981', 'map-pin', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '旅行', '旅行', '旅行', '旅行', '旅行分享和户外探索活动', '旅行分享和户外探索活动', '旅行分享和户外探索活动', '旅行分享和户外探索活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('f95bc634-eab8-45cf-b727-bdb14ea77516', '志愿服务', '公益活动和志愿服务', '#22C55E', 'heart', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '志愿服务', '志愿服务', '志愿服务', '志愿服务', '公益活动和志愿服务', '公益活动和志愿服务', '公益活动和志愿服务', '公益活动和志愿服务');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('6204b337-1a50-42c9-b0c2-1bd32233c268', '艺术创作', '艺术创作和手工制作活动', '#A855F7', 'paintbrush', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '艺术创作', '艺术创作', '艺术创作', '艺术创作', '艺术创作和手工制作活动', '艺术创作和手工制作活动', '艺术创作和手工制作活动', '艺术创作和手工制作活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('bfe7444d-6651-42d9-b4d4-16c2398c3858', '其他', '其他类型的活动', '#64748B', 'more-horizontal', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 18:42:22.411811+00', '其他', '其他', '其他', '其他', '其他类型的活动', '其他类型的活动', '其他类型的活动', '其他类型的活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('d24cc1a4-a582-4d33-901c-016704c993b1', '商务网络', '商务社交和职业发展活动', '#6B7280', 'users', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 19:00:30.13917+00', '商务网络', '商务网络 123', '商务网络34', '商务网络55', '商务社交和职业发展活动', '商务社交和职业发展活动', '商务社交和职业发展活动', '商务社交和职业发展活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('3807db15-a3fe-4d35-ae03-038287145f04', '健身运动', '健身锻炼和体育活动', '#F97316', 'dumbbell', 't', '2025-08-18 17:57:50.562706+00', '2025-08-18 19:14:12.431577+00', '健身运动', '健身运动222', '健身运动333', '健身运动444', '健身锻炼和体育活动', '健身锻炼和体育活动', '健身锻炼和体育活动', '健身锻炼和体育活动');
INSERT INTO "public"."activity_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi") VALUES ('1ca52152-11f7-451c-9fa0-ca71a6771e51', '111222', '1', '#3B82F6', 'tag', 't', '2025-08-18 18:02:50.685+00', '2025-08-22 12:28:18.837866+00', '111222', '222', '333', '444', '1', '1', '1', '1');
COMMIT;

-- ----------------------------
-- Table structure for activity_logs
-- ----------------------------
DROP TABLE IF EXISTS "public"."activity_logs";
CREATE TABLE "public"."activity_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "action" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "details" text COLLATE "pg_catalog"."default",
  "user_id" uuid,
  "user_email" varchar(255) COLLATE "pg_catalog"."default",
  "ip_address" inet,
  "user_agent" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."activity_logs" OWNER TO "postgres";

-- ----------------------------
-- Records of activity_logs
-- ----------------------------
BEGIN;
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4bfe0501-9494-42e6-8fc2-c2d390c77949', 'system', 'system_start', '系统启动', NULL, 'system@biubiustar.com', '127.0.0.1', NULL, '2025-08-15 15:51:23.485037+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('02530116-d0aa-47da-a047-64abfb217b35', 'admin', 'admin_login', '管理员登录', NULL, 'admin@biubiustar.com', '192.168.1.100', NULL, '2025-08-15 15:51:23.485037+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dc84392b-29a1-485f-ae0d-4eb63efb9e27', 'user', 'user_register', '用户注册', NULL, 'user@example.com', '192.168.1.101', NULL, '2025-08-15 15:51:23.485037+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('f699e87d-420f-48ef-8b1d-90d7a0c6f27e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T16:53:12.179Z"}', NULL, NULL, NULL, NULL, '2025-08-15 16:53:12.854636+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('f7efb05f-10f3-4e8b-bf71-4eedfe2bae04', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T16:58:47.075Z"}', NULL, NULL, NULL, NULL, '2025-08-15 16:58:47.70348+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('36a4a3a1-4ebe-40ec-973a-ff337fc03bbc', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T16:59:03.580Z"}', NULL, NULL, NULL, NULL, '2025-08-15 16:59:04.235413+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d8325ec7-3a07-4697-aeaf-40984b31a427', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T16:59:13.550Z"}', NULL, NULL, NULL, NULL, '2025-08-15 16:59:14.182353+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ad1f812c-7415-493f-bfe8-44a0fd59e7f9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 16:59:22.417535+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a9062412-4739-4cd5-a7fe-f29bac8693b5', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:00:56.083Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:00:56.86505+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('529dd007-7095-4f0a-8c35-dcac5e586fa2', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:02:56.293Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:02:56.957015+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ace3c2ed-2a76-4a19-a3f1-a1f696c9f670', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-15 17:03:23.079785+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fb58a2b1-b013-44f4-ab85-387aadebb239', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:06:24.916Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:06:25.581949+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('bc665ffa-6d7b-442a-9df9-fbdfe3c48ac6', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:06:35.488Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:06:36.129573+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('06c6f41a-fcaa-440d-8a30-afe4383d6f80', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:07:06.185Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:07:07.390828+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('16b1ede5-f242-4ca5-895c-f3213a427a0b', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:07:44.034Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:07:44.793284+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('70ea48fd-c695-4516-a92f-f97178b25bbe', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:09:01.349Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:09:01.9897+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('44d064ac-ed94-4277-84bd-d3b98c857328', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 17:09:04.703124+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('17cf50aa-5dc7-409a-b176-bbcb81d04bdf', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:09:13.796Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:09:14.639841+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4b246b4c-3aa2-4c4c-b76a-956f51f0a5aa', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 17:09:15.805536+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e2cf4c9d-aaad-4949-97de-f856ca22cce2', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:09:20.944Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:09:21.607384+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('623c4c52-3656-495d-afd2-15fde7f3f3a5', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:09:31.979Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:09:32.572997+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('cc919cc5-24fe-4724-942b-2369289f0a0d', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 17:10:05.289605+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0e836208-3b1a-4001-852b-e229168c2811', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:11:42.596Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:11:43.227197+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a97dacb2-a53f-469c-9ce5-aed3d8c63ee7', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:14:06.264Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:14:06.897358+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4b26367d-7a25-4707-a429-543c295dc146', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:14:26.336Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:14:27.059689+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('1f257be6-95ae-428d-976c-42b108a2aaa7', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:18:47.118Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:18:47.753797+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('004d9bca-5480-46df-a6a3-202db35dde60', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:19:03.761Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:19:04.35661+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d08bb156-eb93-42cf-9c56-8cb4a4c0ec23', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:19:28.411Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:19:28.996934+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('42d15033-29c3-42c0-933c-45586275be76', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-15T17:50:40.396Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-15 17:20:42.041197+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7787e8f6-7d11-47e5-91ef-01db8efe4e6c', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:22:16.662Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:22:17.271319+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8e67320c-c995-4742-8072-48d4f7837ce8', 'ip_security', 'ip_manual_unlock', '{"unlockedIP":"::1","adminAction":true,"reason":"Manual unlock for wwx@biubiustar.com admin access"}', NULL, 'system_admin', '::1', 'System Admin Script', '2025-08-15 17:28:17.627134+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('109383a7-ca0b-4bcb-8c96-9c2d7ef2e1f1', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:28:27.982Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:28:28.608635+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2f8f448d-bf16-4b6c-a6fa-92fb178cd598', 'system_maintenance', 'login_attempts_cleanup', '{"cleanedIP":"::1","cleanedEmail":"wwx@biubiustar.com","recordsDeleted":24,"reason":"Manual cleanup after IP unblock for admin access"}', NULL, 'system_admin', '::1', 'System Admin Script', '2025-08-15 17:29:22.462693+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('95b58ea9-4bad-4873-baa7-23bf3c0f7962', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 17:29:52.493768+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0b9f0729-1e8e-4cca-9a45-72e76cbc35f2', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:32:18.164Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:32:18.87635+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('afdb1f59-2f00-4bf1-ad66-3d227283de31', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:33:37.001Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:33:37.611577+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8c1222ab-17d3-47f7-aa33-214c10d849f0', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:33:51.087Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:33:51.785866+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('883f870f-3a36-48f0-814c-905b7a59ce68', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:34:15.286Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:34:15.97198+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b8288c24-3c7d-4584-be91-1b18ea294bc0', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:34:28.137Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:34:28.759642+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7b75b522-9cc2-4be4-813d-4fa025e840f8', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:34:46.308Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:34:46.935536+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c298fbe6-79b1-4a17-8e71-47c310fdbc76', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:35:01.878Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:35:03.189782+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('bfcc3865-8471-4ad4-aa4c-d5a906aad548', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:35:25.942Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:35:26.594595+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d5f62f00-ac81-41fb-a21d-fa82a1f9f63c', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:36:58.059Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:36:58.642944+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4d8b3199-d6e4-48f1-8f41-2bac12e92109', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:37:03.565Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:37:04.191001+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e9104f46-8bf5-44e4-bcbd-4462bfccb194', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:51:59.685Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:52:00.3188+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3073e41f-2358-4f3c-b800-4d8756909f49', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:53:15.161Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:53:15.919081+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('664de0e1-3b60-4df8-982b-fe6007a346d9', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:53:21.554Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:53:22.299152+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('cf60a486-6b9f-4fdb-a7ae-2dba4e29a4fb', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:55:03.121Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:55:03.699378+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('766f30b6-8d31-4cd3-a1ad-91908350507e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T17:55:54.232Z"}', NULL, NULL, NULL, NULL, '2025-08-15 17:55:54.846529+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('10f64ed8-39e5-402c-afc5-0e82d7680d3a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 18:00:28.087125+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4a768cf7-c22e-4219-8abc-1f5ed6faf574', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:05:14.697Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:05:14.892161+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3ea1bc15-95ab-4d9d-8215-7ce6b9e65bdb', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:10:01.216Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:10:01.823208+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dedc7c5c-21d3-4970-b37a-b323a1cdcc56', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-15 18:13:58.422583+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8e22bb03-80ac-4a46-8c10-7a31611313db', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 18:31:39.077836+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('28ee9092-58db-47b7-8c0c-45e5229f12fb', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:43:53.253Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:43:53.87346+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('46444a07-ad87-4e5b-939b-92f97ed87b4e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:47:38.498Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:47:39.100043+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('20897ab0-411a-437c-ae8f-964b0c44b3b2', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:47:53.392Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:47:53.972685+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8d3a46c4-edb2-4da0-a605-520ae2717221', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:49:48.053Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:49:48.649046+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4b8dcff7-797e-4673-b58d-a21522d39e7e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T18:58:31.122Z"}', NULL, NULL, NULL, NULL, '2025-08-15 18:58:31.854796+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3040392c-44e7-48c0-8aad-2e49305fdd15', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T19:08:33.247Z"}', NULL, NULL, NULL, NULL, '2025-08-15 19:08:33.419672+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('454b2293-45e1-4258-b4db-631dcb1af7e3', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-15 19:26:27.790135+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6bfd16cc-db23-431a-a740-3e1da4b98aed', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 19:42:39.344687+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ac359cfd-fe8c-4860-a165-6c94e57c7af3', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T20:08:32.696Z"}', NULL, NULL, NULL, NULL, '2025-08-15 20:08:33.615752+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('de3f130e-4234-4737-9eff-9d5aa767e1d9', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T20:25:03.676Z"}', NULL, NULL, NULL, NULL, '2025-08-15 20:25:04.43062+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2da83498-7c65-4611-9963-100d4e6eb5db', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T20:25:13.923Z"}', NULL, NULL, NULL, NULL, '2025-08-15 20:25:14.654963+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fbaf393d-3034-4c7a-b3e5-36b851b9ddbc', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T20:25:24.358Z"}', NULL, NULL, NULL, NULL, '2025-08-15 20:25:25.222849+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('89f6bd95-1065-4734-bc7b-42eb31b69a51', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 20:32:09.133522+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4adbe85c-4e7d-4457-b3c4-03e302b1e246', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T20:42:56.882Z"}', NULL, NULL, NULL, NULL, '2025-08-15 20:42:57.753264+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d4101557-09de-4dd3-84d8-c75bb0360456', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:04:10.856Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:04:11.871973+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('1fb0f024-5c49-4b53-ba64-ae3eb087ffc1', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:04:21.446Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:04:22.474133+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('77ada7ab-4608-4c98-94f1-36bc5ea3f539', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:04:37.018Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:04:38.030241+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('f5c9a8c5-9362-4cd3-9616-daf180194055', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:23:13.294Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:23:14.452416+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c96b9be4-5090-4531-9489-f929a7d63c4e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:26:17.615Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:26:18.78826+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3356b124-6f99-4d27-bd89-c16a2237a92e', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-15T21:57:41.712Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-15 21:27:43.769819+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('409039a2-a42a-480b-a52d-c48cdd52a75d', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-15T22:00:10.675Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-15 21:30:12.297405+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('70160ff1-cc1f-4355-8e24-d15de4913511', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 21:31:21.143371+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ad4b257a-0503-4b5b-9736-21ebb4506ef8', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:36:22.391Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:36:23.661419+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7af46f9f-7607-4fd8-ac18-6fd5424932a2', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-15T22:10:06.470Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-15 21:40:08.557182+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('f2303bf2-77d5-46bf-a1b2-56e9049c690d', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:44:23.010Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:44:24.384855+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a556d3ad-41f1-48a4-bb6c-cc6ef3b11820', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:47:05.088Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:47:06.310739+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a75a0f3f-053b-423a-b3bc-c44cc866f83a', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:47:52.273Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:47:53.475505+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e3bf0da1-1ef0-4066-955a-df1396cbdd60', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:48:57.578Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:48:58.694582+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dbc011e6-5d97-4caf-9e83-827486901dea', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:49:35.669Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:49:36.782341+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('f9fc4349-f101-401b-b830-efbc3b306abe', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:50:21.829Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:50:23.014697+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c98605aa-0484-4b3c-b448-91b4281202c9', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:51:32.353Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:51:33.511172+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6504bc91-1d0b-44cb-9efd-a4f48b480e22', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:51:49.149Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:51:50.27716+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b9c42c00-dfcd-45b2-ba06-f9d053c8578a', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:52:09.271Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:52:10.417865+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9eb37bef-56c8-488f-b082-49c0fa10a55d', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:52:18.677Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:52:19.917119+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4ef516b6-b55a-4616-92ab-481f7f1a3e3e', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:53:06.829Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:53:07.989951+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('aa73c2d0-7609-4688-83a4-5d4316bfcf61', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:53:47.024Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:53:48.192229+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e893da27-1696-40c7-ab88-b00d71b3036a', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:53:59.414Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:54:00.545482+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2d48cf2c-720d-455d-aa14-520b7f02a36c', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T21:54:44.247Z"}', NULL, NULL, NULL, NULL, '2025-08-15 21:54:45.430675+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('cea5fd94-0a16-4f25-a1c9-6dfa78f69399', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 21:58:38.52046+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fe9db260-e62d-45f9-91b7-94daaf8139cb', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:01:38.645Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:01:39.841518+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('de1536b3-e712-490a-a47d-5eb1ad2f92b9', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:02:25.547Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:02:26.326269+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9fe49926-1060-4402-a583-95d5d9ab35ca', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:06:16.608Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:06:18.271662+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8ab573a3-e2a5-4094-8a68-e2f4d0664aa6', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:10:27.939Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:10:29.632596+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7f011994-e4af-4d87-bef8-bbb81f966bed', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:09:03.195Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:09:05.102297+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('00c79929-1ffc-44d5-be66-9d25c059123b', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:14:19.042869+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b219e313-df2e-4d38-8f59-cbf04ac17cdb', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-15 22:15:09.266156+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3260fb8c-3509-4881-87df-833dc5c27a25', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:21:11.2219+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3e124ff1-b4b0-4e3a-96b2-468512f4b4d2', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:21:14.769Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:21:16.515302+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b9a4a617-7d1a-483b-8e01-21fd0479688a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:21:19.17179+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('5665ea0f-b47d-40cb-b21e-0eaf2b252bd6', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:21:55.709Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:21:57.42076+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e8f64aba-4aa0-4e9b-af09-25ec59c45b28', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:25:59.633Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:26:00.976963+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b0ce195f-586a-49d3-b270-b992098edfb9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:26:14.305309+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6e260ed2-e36f-4cfb-b146-f1412a390eff', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:26:36.260Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:26:37.961484+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ecd4a959-61e5-4398-a32d-e5fbff5da841', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:26:45.717309+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7d51b9ab-238a-40bf-a47f-12bccd41c624', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:29:23.560Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:29:25.272125+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('216cd515-3991-4f42-9999-73b8622719c5', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:30:55.653Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:30:57.014732+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0f979d69-728e-460b-a7b6-53db9576f928', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:31:00.842Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:31:02.711299+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('942eca38-be65-4a95-b58c-3f7895d1736d', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-15 22:31:09.357452+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b90d1932-cd5f-4f2e-abef-8658384f7c73', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:32:49.630Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:32:51.452495+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('32d485e9-8434-40ff-9071-9416da989e78', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:35:30.926Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:35:33.062591+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6340e607-8a39-4523-82a8-76db371cb7e8', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:37:28.601Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:37:30.749329+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9c0fceb8-27f8-47d8-834d-f932be03da1d', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:37:41.635Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:37:43.782356+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('943b37c9-150e-4b10-ab9b-adff0b2fa03c', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:37:47.526Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:37:49.790798+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('48bc8e2b-d7cc-4b59-809c-d7ae0f76306f', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:37:57.719Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:37:59.841364+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b2e45005-8bdd-490e-994a-94bef450dac8', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:38:04.584Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:38:06.721475+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('1e5f0dc9-e7d5-4d00-8a04-e960cad1d26c', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:38:19.534Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:38:21.635622+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('334dd67e-e7c8-4f79-8b8a-e459ae560753', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:38:34.914Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:38:37.039307+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('411048ec-1839-4ba0-9649-bd719d90f1e3', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-15T22:41:49.955Z"}', NULL, NULL, NULL, NULL, '2025-08-15 22:41:52.222287+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6c1f2bd3-77e2-4cb9-9602-64fbd878a2bd', 'system_maintenance', 'login_attempts_cleanup', '{"cleaned_count":20,"cutoff_time":"2025-08-17T11:33:34.208Z","cleanup_time":"2025-08-18T11:33:36.595Z"}', NULL, NULL, NULL, NULL, '2025-08-18 11:33:38.174214+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('06f37913-afff-4776-9a6c-89a7bf0749fe', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":20,"total_errors":0,"cleanup_time":"2025-08-18T11:33:37.528Z"}', NULL, NULL, NULL, NULL, '2025-08-18 11:33:39.125571+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2a04dc39-3fcb-4cf7-b57a-73ccf1cbf4c0', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T11:33:42.170Z"}', NULL, NULL, NULL, NULL, '2025-08-18 11:33:44.134752+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3196a1a5-dad7-4814-99db-d0fbf7c94a7a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 11:34:26.667119+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9e4b7fdc-de14-4263-9118-4c8117bf9705', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T11:35:05.866Z"}', NULL, NULL, NULL, NULL, '2025-08-18 11:35:07.685563+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4486017a-37a4-4b46-a4e1-0b1a4adb1631', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:10:37.638Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:10:39.521193+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0e651ef2-7562-471f-a2fc-fc7f1e3011aa', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 12:11:08.159225+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0eeb6c7a-1040-417c-8d2d-f62b703077a7', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:12:15.817Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:12:17.566084+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9d8cc6fb-e345-4036-851b-df41d4596301', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:14:58.136Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:15:00.015554+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('ff93be21-9212-4c3d-bcf5-565d53425d24', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:22:48.845Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:22:50.735529+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d8bd542f-55ff-4ed7-b0ea-bb4690671055', 'system_maintenance', 'security_cleanup_summary', '{"blacklist_cleaned":0,"login_attempts_cleaned":0,"total_errors":0,"cleanup_time":"2025-08-18T12:26:07.219Z"}', NULL, NULL, NULL, NULL, '2025-08-18 12:26:09.320522+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9ddb289b-c136-46ac-92b0-ee7e016b4a97', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 14:27:03.747957+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c84743db-9ede-498c-bfae-26711d0ad131', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 14:30:44.204154+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('006961af-ae59-4dbd-ad2d-df9483dc2573', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 14:58:08.022539+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('74036a2a-06f1-415e-b803-ba48a730d9a1', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 14:59:07.405276+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('832e6171-ee21-499d-a6b1-e168b7881f88', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 14:59:26.157325+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8255dc66-e91b-40be-801c-9e0c9ee77af0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 15:02:33.679352+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7947699b-129c-42b5-8877-21f1d8463ce8', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 15:04:49.005439+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('69f02937-78fc-4635-82c2-067879a91aeb', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 16:06:33.439577+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c72e6417-a331-41d8-9365-837baad508d9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"curl/8.7.1"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'curl/8.7.1', '2025-08-18 16:08:34.453269+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dbfe73c5-b2fe-4ed9-a0cf-ae7c508dca27', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"curl/8.7.1"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'curl/8.7.1', '2025-08-18 16:10:01.226526+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c670f08d-59e8-4059-a5a2-95aadd656ec1', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 16:14:27.672336+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e4d711bb-475d-44ee-b264-e4f0171254b0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 16:18:34.786684+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e1832d7e-723f-49c3-ab33-61a884068139', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-18 16:46:46.040117+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dea996f5-290f-4d38-bda2-9577e13a11c5', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 17:16:42.994683+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('df7bf790-2483-4bc2-985e-351e1d4c4d4a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 17:33:59.514233+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d551a0d1-c4a4-4816-940e-5e58373e3ce9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 17:54:24.585607+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('479dd5cd-5b65-45b3-9aef-0e8b244f22d8', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 18:35:36.690616+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7fcfab4e-227b-4aa8-8aef-69ed0e6f24fc', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 19:36:10.652459+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b4789fa1-20f0-46b2-8c06-1bac4a10cdd0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 19:36:12.233678+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c5834a9b-25f3-401b-8256-bfc6b0321384', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 20:40:27.807693+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('623bf400-0916-4355-a352-baee4f0afc85', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-18 20:52:59.868813+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('93a3efe0-b845-45fc-9080-34324826bcb0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 11:03:10.574761+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6b7e4f5c-2631-49e6-8dc3-c384a6ee5b6e', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 11:24:06.660967+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('67bba930-bbd0-44d8-8d5d-2d633d611852', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 11:43:34.68032+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4b93dd1d-8956-484b-ae58-5000483a5594', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 11:43:48.275006+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('549de214-0703-4d3a-a35e-7ab3e549d73a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 12:04:01.36317+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c460564b-2de4-4cb9-8b82-7b3e398bad70', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 12:06:13.137422+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fd313a5d-72db-4757-a6fe-0500589b7489', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 12:12:35.480894+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9d2713a3-e581-4b51-972d-60b26de3b245', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 12:14:19.98864+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a90cfe91-05cb-42c1-8112-5b0b4a383f83', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-19 12:17:49.03+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d5f44f5f-9900-44ac-b9d1-6fbf5f7fa508', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 13:00:48.114184+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dec98f39-dfe5-4366-8808-511f041de327', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 13:48:54.19968+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8ce91a64-a40f-4c72-b81e-f4abfc1884d5', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 17:21:36.426186+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('648b5901-635b-4916-8432-4567f9680fe6', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 18:25:29.287497+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dd34ede0-b310-4d04-98e9-6adf60190064', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 18:59:37.38204+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a3a0e295-7f8d-4fd2-b282-99d1cab4b79e', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T13:44:25.975Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 13:14:27.777024+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a3be3147-573c-42be-9f27-3b456920f4b9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 19:01:44.58724+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2d934a26-9f8e-4733-8e04-0156745a94d1', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 20:03:08.59256+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c9751b75-20f8-41df-a231-f8a053588a5a', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-19 20:45:05.174826+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6ab6762f-ede5-46d5-b65d-68395a3e45a9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 13:59:27.776625+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a783ac4b-4b6e-482b-b672-f1e9631a87e3', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-20 14:14:20.451207+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('44ad694c-02c2-48c3-b7ba-4bdb8e451be2', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-20 14:17:13.880892+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('80a07a2f-bdd1-4fa8-820f-6090b6517797', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:19:23.531475+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e91eac5c-5b8d-4825-b7b7-448b8040b8d4', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:20:06.047302+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('34770f48-b982-4e47-be48-71584cab3834', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:20:46.726988+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('55d49c72-b12f-4992-a2f5-cf8181a8d069', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:33:38.138585+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6d4a1c33-55f9-4c9f-867f-d25d8619aabc', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:44:52.830805+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7ed38b6f-24e2-4218-85b1-57a44d264ea9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:55:39.666354+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('968af208-5790-4e91-8621-60469cad6cfa', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 14:59:57.754288+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9920809b-1639-4ce6-964d-a245d33db2f1', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 16:31:25.966799+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('46535789-4ba2-4a5a-9f42-c52aa1df0140', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 20:50:02.271866+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('32777329-4645-4826-a12d-8a34494fd916', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:00:22.834636+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('95f15612-be86-4b11-988e-ea8d9e69bf89', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-20 21:06:12.037895+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('36bfe7b8-9c12-413e-9520-ad5a2f7c9d26', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:08:09.325764+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7e8e7d19-fc69-4872-bf34-6a1f0ba40dff', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:08:44.380932+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4ce19d5d-74d1-4442-93c1-b433b60fe6da', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:11:57.522808+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('22352b79-d7cf-4c4a-aa8e-9f66a4003274', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:18:29.912116+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('77163a92-0e4c-48c3-a776-839e021a49a3', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:21:20.035393+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0b5d0271-c0f4-4510-bc4e-72d42a43fb0e', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:26:55.68487+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('78f19ff6-0cdf-4168-b3e2-f7350f750fe8', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:31:41.954604+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('92b4916a-f164-475a-ab4a-cdaf69dfd7ff', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-20 21:43:24.187212+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('cfeebb3b-cd19-4b37-bca0-f6fae92d5bfb', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:48:53.437791+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('51139916-7b28-4fc3-995c-dc7e713f30cc', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:54:57.703577+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('1761be58-a3ba-4903-9f64-9f93d2fc0aee', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:57:00.462951+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a703fefa-be5a-41c3-84fd-2ba7c9b6b603', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 21:59:13.875175+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('97aa49d7-235a-446e-89bd-d61427e7c9b0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:07:39.157417+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('29fcbc48-bf30-48be-aacd-70038594013c', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:07:59.135282+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c1ffd1b0-612a-4749-b754-46d1fd6b3fbe', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:28:18.630945+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4bb58a74-bc10-43f7-bd95-8bc13f4e80d5', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:31:26.156197+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e1e2b4dc-c0ae-401e-acbd-d3c3afaea21f', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:36:05.992168+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('50142139-dea6-4511-aa3e-924de0250bb0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:41:45.665991+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e85ebdff-c626-4e35-8c5f-c582618bd7b6', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:44:25.269553+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a9096c6b-8ffa-4071-b5e4-a42bc811e012', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:45:18.560214+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('56a2b44b-2d1b-4f87-93ac-da611f42843e', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:46:24.947763+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3dc4d44d-6016-4fce-a044-101321729542', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T13:45:20.607Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 13:15:22.460801+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('15964dc4-9562-497a-b18b-da5cfeec8153', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:53:11.831419+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4ed161a8-638b-4cf5-816e-9b0a0c3ccb02', 'admin_login', 'login_attempts_reset', '{"reset_time":"2025-08-20T22:53:13.164Z","reason":"Successful admin login"}', NULL, NULL, '::1', NULL, '2025-08-20 22:53:13.977829+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d5f338e8-2327-4ca0-b721-85f0cf273eb1', 'admin_login', 'ip_removed_from_blacklist', '{"removal_time":"2025-08-20T22:53:15.461Z","reason":"Successful admin login"}', NULL, NULL, '::1', NULL, '2025-08-20 22:53:16.312772+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('994fd822-c9ee-410e-a021-db989aa4ee8b', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:53:30.018851+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('950f5067-758e-47b7-9838-9c57584c6d80', 'admin_login', 'login_attempts_reset', '{"reset_time":"2025-08-20T22:53:30.668Z","reason":"Successful admin login"}', NULL, NULL, '::1', NULL, '2025-08-20 22:53:31.231798+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('392ddd71-4dd7-4d4e-ad43-f9bd25313692', 'admin_login', 'ip_removed_from_blacklist', '{"removal_time":"2025-08-20T22:53:32.454Z","reason":"Successful admin login"}', NULL, NULL, '::1', NULL, '2025-08-20 22:53:32.713567+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('18905a04-c9c6-481e-b770-fc4d49fe41dc', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:53:50.445694+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('92c1c010-1a84-4ed7-b3be-01ddcef57df7', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:55:20.910315+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('172c5f89-5927-4d74-82dd-ac45c1887a92', 'ip_security', 'login_attempts_reset', '{"ip_address":"::1","reset_time":"2025-08-20T22:55:21.928Z","reason":"Admin login successful"}', NULL, NULL, '::1', NULL, '2025-08-20 22:55:22.526003+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a50af313-1dd6-4cc1-a3c3-474f87480d7d', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 22:59:56.727721+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('bd3cad3f-ad08-4169-9edb-8d15c77dd5d4', 'ip_security', 'login_attempts_reset', '{"ip_address":"::1","reset_time":"2025-08-20T22:59:57.763Z","reason":"Admin login successful"}', NULL, NULL, '::1', NULL, '2025-08-20 22:59:58.021234+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('35ad5499-ab74-45d0-95da-6bc69803d47b', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:00:28.029342+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d743afcf-0d76-4d68-a87f-5251d880fff2', 'ip_security', 'login_attempts_reset', '{"ip_address":"::1","reset_time":"2025-08-20T23:00:29.009Z","reason":"Admin login successful"}', NULL, NULL, '::1', NULL, '2025-08-20 23:00:29.265867+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7fc5b9f6-8064-4a40-8cd1-ae04898297ff', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:02:13.616608+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('362b8f96-fe0b-4fe5-b400-9a9b4139c296', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:02:40.465145+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('15266319-9956-48bc-afc9-c3d0381904d6', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:02:48.051158+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c32e14a9-ea02-4cae-82ac-5c4fa4782fc3', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:03:44.337319+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('dc986b77-8578-4be8-9fca-ea4df59900fa', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-20 23:03:58.033907+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('484e7f0e-4fdb-4420-b49c-6e72ac2198a8', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 12:47:31.121036+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('9a81e906-ae64-4a00-8bdf-671f720ca80f', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 14:42:42.587429+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('32d95e8b-c94b-48a9-965f-efad93959be0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:15:24.396752+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0fe1e927-9c8a-4fc6-b4a1-beb0ce1faada', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:24:55.002378+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7250e818-fe75-475e-a192-6a3b37f86933', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:33:54.53579+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d1a04d48-e653-46c7-a828-f83c21852d45', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:37:39.771767+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('5b947cc6-2a62-4f52-ba4d-df5ed8ba22a0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:47:34.799385+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('82882591-c4c3-42ca-9ce4-5a5865d81120', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 16:54:10.820673+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7a477a74-ae03-4fcd-ba4e-30142ddadd00', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 17:05:48.411048+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('51e454fd-7e3e-4615-9967-adb76cb0ec3d', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 18:06:52.599529+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('50508750-c386-4f3c-b097-9f6c2c682b3d', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 19:33:10.395448+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('004e7570-23ab-4e21-ab4d-f98f6a50711c', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 19:39:18.992484+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2f55d769-46f3-4e7c-9b8b-9084b8f2e767', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 19:44:56.631928+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8102d494-3fe4-4702-a78f-f06121bc4537', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 20:20:53.068078+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('d1ea93a8-6a67-440c-a4d2-e371646e616b', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 20:57:12.667868+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('09758444-cf70-40ef-b7a1-a94baa458749', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 21:25:26.015129+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('63cb785b-67dd-4512-b01c-f3710fd58cb6', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 21:33:09.999115+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('179f29cf-447a-4143-9ae3-a6dae633972c', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 21:44:08.244119+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c446f7d0-dd91-414e-beb3-766f13c7e85c', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 21:56:03.746731+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fb20d3b6-0e96-46e3-ad6d-6f9a957d64db', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-21 22:05:12.812874+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('0dad543d-ffc1-4623-94e1-6e100d72c8c3', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-21 22:16:39.00831+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('6f688f62-0d73-45f0-9e92-5667cb477362', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 12:14:56.260266+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fbc45128-f76d-4e5d-8615-31e7776b3e65', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T13:30:54.959Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 13:00:56.82659+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('7ed4cacf-b38d-4e04-a636-93ae357e38a4', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T13:43:40.592Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 13:13:42.483381+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('27047944-e30f-4f44-954f-5269f88e7087', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 13:22:56.878709+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('900e9954-abe6-4ef5-96a7-ec6ce279b36f', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-22 13:23:59.350408+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('eb864155-6bfb-499c-8c6c-d95911813bb7', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 13:50:12.688968+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('8d4dae77-b4d2-41df-90d0-e778bc267c14', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 14:11:05.90584+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4c66507c-06bb-4b13-8cda-4b2ed14ac877', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 14:29:57.19984+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('90fa239a-c584-4a3d-b605-f1adf9e0d24f', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-22 14:44:33.163259+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('3ab8e94f-8b60-4091-b344-d12bc3443f9b', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 15:06:11.311444+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('fdb1e404-c50f-495d-99b1-01955d8d3038', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-22 15:37:50.833126+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('23a05b76-cbaa-4dd5-b550-c1a8bd3c4892', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 15:38:52.357195+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('a646bb41-011e-4bd0-adbd-e2849b91b379', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T16:14:13.158Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 15:44:14.757557+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('04061b5a-98f0-415a-892e-96d782743298', 'ip_security', 'ip_blocked', '{"reason":"Too many failed login attempts","failed_attempts":3,"blocked_until":"2025-08-22T16:15:06.190Z","blocked_by":null}', NULL, NULL, '::1', NULL, '2025-08-22 15:45:08.117307+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('e4a3c8dc-5cc0-4d39-b124-efa62281b7c4', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-22 15:55:31.255124+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('c4920f2a-30e6-41be-8e51-7d0a8d4012f9', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 16:06:46.256521+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('2e131efb-af6d-4265-be10-6d6131aa4bc0', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 18:43:48.869797+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('39b3f8d0-218f-4d92-a645-91e97a133148', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 19:48:40.966035+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('09ba12da-e4c4-4ca1-b4ae-a61b22accd59', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 21:42:56.796346+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('aa95aaec-6b8e-4ea6-b6ee-38a75ef95dcd', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2025-08-22 21:44:08.591505+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('1b26e1ed-3afc-48e5-b0b1-f1f7faf5efbb', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 21:54:45.161652+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('b23c641f-f430-41d3-a143-20bcb0c4cbd8', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 21:55:20.686497+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('653a5b97-9b2b-4e72-baef-6984678a59bf', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 22:13:08.826043+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('4f148554-f5e0-42d2-909a-0cde3b8e46ba', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 22:22:15.289502+00');
INSERT INTO "public"."activity_logs" ("id", "type", "action", "details", "user_id", "user_email", "ip_address", "user_agent", "created_at") VALUES ('38a5d0db-6218-45d6-a3d1-c20772181ec7', 'admin_login', 'admin_login_success', '{"username":"wwx","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-22 22:28:41.253837+00');
COMMIT;

-- ----------------------------
-- Table structure for activity_participants
-- ----------------------------
DROP TABLE IF EXISTS "public"."activity_participants";
CREATE TABLE "public"."activity_participants" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "activity_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'joined'::character varying,
  "joined_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."activity_participants" OWNER TO "postgres";

-- ----------------------------
-- Records of activity_participants
-- ----------------------------
BEGIN;
INSERT INTO "public"."activity_participants" ("id", "activity_id", "user_id", "status", "joined_at") VALUES ('231a6192-6cfe-4cea-81c8-02b6dd69868d', '9a77a794-142f-41f5-bf3e-1d3903a322c2', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'joined', '2025-08-19 11:06:12.574304+00');
INSERT INTO "public"."activity_participants" ("id", "activity_id", "user_id", "status", "joined_at") VALUES ('9b5d5750-eea2-4b10-bd5c-e08834a0d32b', '98ed06ee-c750-4ebc-8753-12f6dc5d968d', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'joined', '2025-08-19 19:24:56.457365+00');
INSERT INTO "public"."activity_participants" ("id", "activity_id", "user_id", "status", "joined_at") VALUES ('ca99c2b2-b51d-4a7d-9065-c8cde5b5bde5', 'b502dc62-3969-4958-b652-54927ed81545', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'joined', '2025-08-20 16:26:04.821348+00');
COMMIT;

-- ----------------------------
-- Table structure for cache_configs
-- ----------------------------
DROP TABLE IF EXISTS "public"."cache_configs";
CREATE TABLE "public"."cache_configs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "cache_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "config_data" jsonb NOT NULL,
  "enabled" bool DEFAULT true,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."cache_configs" OWNER TO "postgres";
COMMENT ON COLUMN "public"."cache_configs"."cache_type" IS 'Type of cache (user, content, stats, config, session, api)';
COMMENT ON COLUMN "public"."cache_configs"."config_data" IS 'JSON configuration data including maxSize, defaultTTL, cleanupInterval';
COMMENT ON COLUMN "public"."cache_configs"."enabled" IS 'Whether this cache type is enabled';
COMMENT ON TABLE "public"."cache_configs" IS 'Stores cache configuration settings for different cache types';

-- ----------------------------
-- Records of cache_configs
-- ----------------------------
BEGIN;
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('9ee89b16-4cf2-465a-abd8-34e934bccebb', 'session', '{"maxSize": 5000, "defaultTTL": 86400000, "cleanupInterval": 3600000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:43.510981+00');
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('02651d48-2bab-4e26-b503-8289e2a995d9', 'api', '{"maxSize": 500, "defaultTTL": 300000, "cleanupInterval": 120000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:44.035374+00');
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('5cf1dec9-8b46-4020-b4be-742b6d1a072d', 'user', '{"maxSize": 1000, "defaultTTL": 900000, "cleanupInterval": 300000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:41.716036+00');
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('219a52e4-9984-4ad2-989a-b2d38643dccf', 'content', '{"maxSize": 2000, "defaultTTL": 1800000, "cleanupInterval": 600000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:42.209077+00');
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('6699dd96-1738-4e95-a800-0e4bcc691eef', 'stats', '{"maxSize": 500, "defaultTTL": 600000, "cleanupInterval": 180000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:42.635159+00');
INSERT INTO "public"."cache_configs" ("id", "cache_type", "config_data", "enabled", "created_at", "updated_at") VALUES ('a4cc8987-3be0-406e-9db6-84f5053b48cf', 'config', '{"maxSize": 100, "defaultTTL": 3600000, "cleanupInterval": 900000}', 't', '2025-08-22 13:44:02.516392+00', '2025-08-22 14:43:43.052676+00');
COMMIT;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS "public"."comments";
CREATE TABLE "public"."comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "post_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "parent_id" uuid,
  "likes_count" int4 DEFAULT 0,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."comments" OWNER TO "postgres";

-- ----------------------------
-- Records of comments
-- ----------------------------
BEGIN;
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('334aa526-4168-4a6e-8b8b-34073711158a', '123', '54f8315c-75f4-4084-96ae-f058f94e8b91', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-19 14:30:38.95+00', '2025-08-19 14:30:39.246359+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('7dcf7707-8265-442d-abad-e3f1b341bd64', '阿萨德', 'fce71943-58d6-4e77-b142-41d47d4613f4', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-19 18:37:07.508+00', '2025-08-19 18:37:07.8548+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('2f06702f-f96f-40ee-8ebb-340eb21a53e6', '12313', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 17:27:06.618+00', '2025-08-20 17:27:06.869291+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('16a7d57a-7d72-4c85-adb1-bbdb06aa737f', '123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:31:49.937+00', '2025-08-20 18:31:50.086118+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('15922ebb-1c7c-4f20-ad36-f2ee62f1155f', '21323', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:32:38.468+00', '2025-08-20 18:32:38.691623+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('59b9a633-10e4-4a51-8cbd-5549954d4bea', '123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:36:23.269+00', '2025-08-20 18:36:23.504346+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('e65acd34-d25e-44dd-aa37-b0efa3b079de', '阿阿阿', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:36:29.664+00', '2025-08-20 18:36:29.926722+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('7cd5fbe6-5101-48bb-ae35-dcb23198093e', '123123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:38:12.822+00', '2025-08-20 18:38:13.066511+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('f8a0efcd-b29e-4c38-bb76-ef1f8a280f5e', '234', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:39:56.24+00', '2025-08-20 18:39:56.463926+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('46d8af27-96e2-4bdd-9466-5e41c422b9e8', '1231324', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:40:12.928+00', '2025-08-20 18:40:13.153116+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('9e79f764-62b2-48b3-b15d-4a73c1fcf460', '阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:40:34.084+00', '2025-08-20 18:40:34.376023+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('00e6f829-3955-48e4-a383-596ff7ec9b23', '12312', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:42:37.616+00', '2025-08-20 18:42:37.759235+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('00dd4463-8a49-46b6-9eee-6188acd3f6d5', '213', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:43:18.484+00', '2025-08-20 18:43:18.848482+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('87ccbdb7-233c-49d5-8c21-5efe310d4f34', '123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:43:53.983+00', '2025-08-20 18:43:54.289483+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('e2037523-b071-477a-8429-cb848e2681cc', '1111', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:44:02.507+00', '2025-08-20 18:44:02.738021+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('587104c9-69a1-4b71-9e5f-48290f15da4b', '12312 啊啊啊', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:44:44.121+00', '2025-08-20 18:44:44.2732+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('6e0324d6-bb7c-4580-a18a-0f4ad8d738d1', '阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 18:45:06.418+00', '2025-08-20 18:45:06.650695+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('2102a28a-135b-413b-9888-c19e8085c140', '123123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 19:01:12.394+00', '2025-08-20 19:01:12.636254+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('7a74b583-bd8e-467b-b8d9-f399c7e6ce70', '123', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 19:07:31.965+00', '2025-08-20 19:07:32.23286+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('f88ccd4b-85b9-47fb-b5ba-b060eb011186', '阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德阿萨德', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-20 19:09:42.769+00', '2025-08-20 19:09:43.107962+00');
INSERT INTO "public"."comments" ("id", "content", "post_id", "user_id", "parent_id", "likes_count", "created_at", "updated_at") VALUES ('d87758c3-78bb-4e6b-9d38-6fca4be466d3', '1321', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', NULL, 0, '2025-08-21 15:12:38.833+00', '2025-08-21 15:12:39.088829+00');
COMMIT;

-- ----------------------------
-- Table structure for contact_forms
-- ----------------------------
DROP TABLE IF EXISTS "public"."contact_forms";
CREATE TABLE "public"."contact_forms" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "category" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "company" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pending'::character varying,
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."contact_forms" OWNER TO "postgres";

-- ----------------------------
-- Records of contact_forms
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for contact_submissions
-- ----------------------------
DROP TABLE IF EXISTS "public"."contact_submissions";
CREATE TABLE "public"."contact_submissions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "subject" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "message" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pending'::character varying,
  "submitted_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "created_at" timestamptz(6) DEFAULT now(),
  "ip_address" varchar(45) COLLATE "pg_catalog"."default",
  "phone" varchar(50) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";
COMMENT ON COLUMN "public"."contact_submissions"."name" IS 'Full name of the person submitting the form';
COMMENT ON COLUMN "public"."contact_submissions"."email" IS 'Email address for contact response';
COMMENT ON COLUMN "public"."contact_submissions"."subject" IS 'Subject/topic of the inquiry';
COMMENT ON COLUMN "public"."contact_submissions"."message" IS 'Main message content';
COMMENT ON COLUMN "public"."contact_submissions"."status" IS 'Processing status: pending, read, replied';
COMMENT ON COLUMN "public"."contact_submissions"."submitted_at" IS 'When the form was submitted';
COMMENT ON COLUMN "public"."contact_submissions"."updated_at" IS 'Last update timestamp';
COMMENT ON COLUMN "public"."contact_submissions"."ip_address" IS 'IP address of the user who submitted the contact form';
COMMENT ON COLUMN "public"."contact_submissions"."phone" IS 'Phone number of the person submitting the form';
COMMENT ON TABLE "public"."contact_submissions" IS 'Stores contact form submissions from website visitors including phone numbers';

-- ----------------------------
-- Records of contact_submissions
-- ----------------------------
BEGIN;
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('8b57bdda-2a2b-4288-ae6a-65ee50c1660b', '123123', '4645@qq.com', 'about.contactForm.categories.shortvideo - 123123', '公司: 123123

sdadasd', 'read', '2025-08-15 14:03:48.094+00', '2025-08-15 14:09:48.262+00', '2025-08-15 14:03:48.636126+00', '::1', '15102115555');
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('31dfd4e8-9c0a-4764-83be-fa67e67c89cf', '测测吃吃', '51616@qq.com', '短视频制作 - 测测额测', '公司: 测测额测

qweqwe', 'read', '2025-08-15 14:36:44.464+00', '2025-08-15 16:20:27.291+00', '2025-08-15 14:36:44.957363+00', '::1', '15102111111');
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('8aa587ad-f731-4efa-9d1f-33e293f8e96b', '阿萨德阿萨德', '5416546@qq.com', 'about.contactForm.categories.productinquiry - 按时打算', '公司: 按时打算

测测测测测测', 'replied', '2025-08-15 14:10:21.556+00', '2025-08-18 11:36:08.636+00', '2025-08-15 14:10:22.112242+00', '::1', '15102119999');
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('deaf2f95-9d00-4dc9-b15d-440b9879ac08', '1231231', 'wuweixi12x@gmail.com', '短视频制作 - 123123', '公司: 123123

123123', 'pending', '2025-08-18 14:36:31.21+00', '2025-08-18 14:36:31.621645+00', '2025-08-18 14:36:31.621645+00', '::1', '15101118808');
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('d4c6b503-1859-497b-a5c0-6333edfbcc0f', 'asdasd', 'wuweixia123lex@gmail.com', 'Business Cooperation - asdasd', 'Company Name: Not provided

asdasd', 'pending', '2025-08-21 15:10:09.887+00', '2025-08-21 15:10:10.166122+00', '2025-08-21 15:10:10.166122+00', '::1', '15102119929');
INSERT INTO "public"."contact_submissions" ("id", "name", "email", "subject", "message", "status", "submitted_at", "updated_at", "created_at", "ip_address", "phone") VALUES ('086039e5-60db-4cbb-a1e0-c830b008c048', '实打实', '156@qq.com', '直播电商 - 实打实', '公司名称: 未提供

按时打卡时间到了', 'replied', '2025-08-22 12:16:34.389+00', '2025-08-22 12:25:29.601+00', '2025-08-22 12:16:35.023079+00', '::1', '15102114444');
COMMIT;

-- ----------------------------
-- Table structure for content_categories
-- ----------------------------
DROP TABLE IF EXISTS "public"."content_categories";
CREATE TABLE "public"."content_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "color" varchar COLLATE "pg_catalog"."default" DEFAULT '#3B82F6'::character varying,
  "icon" varchar COLLATE "pg_catalog"."default" DEFAULT 'tag'::character varying,
  "is_active" bool DEFAULT true,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "name_zh" varchar(100) COLLATE "pg_catalog"."default",
  "name_zh_tw" varchar(100) COLLATE "pg_catalog"."default",
  "name_en" varchar(100) COLLATE "pg_catalog"."default",
  "name_vi" varchar(100) COLLATE "pg_catalog"."default",
  "description_zh" text COLLATE "pg_catalog"."default",
  "description_zh_tw" text COLLATE "pg_catalog"."default",
  "description_en" text COLLATE "pg_catalog"."default",
  "description_vi" text COLLATE "pg_catalog"."default",
  "sort_order" int4 DEFAULT 0
)
;
ALTER TABLE "public"."content_categories" OWNER TO "postgres";
COMMENT ON COLUMN "public"."content_categories"."name_zh" IS 'Category name in Chinese (Simplified)';
COMMENT ON COLUMN "public"."content_categories"."name_zh_tw" IS 'Category name in Chinese (Traditional)';
COMMENT ON COLUMN "public"."content_categories"."name_en" IS 'Category name in English';
COMMENT ON COLUMN "public"."content_categories"."name_vi" IS 'Category name in Vietnamese';
COMMENT ON COLUMN "public"."content_categories"."description_zh" IS 'Category description in Chinese (Simplified)';
COMMENT ON COLUMN "public"."content_categories"."description_zh_tw" IS 'Category description in Chinese (Traditional)';
COMMENT ON COLUMN "public"."content_categories"."description_en" IS 'Category description in English';
COMMENT ON COLUMN "public"."content_categories"."description_vi" IS 'Category description in Vietnamese';

-- ----------------------------
-- Records of content_categories
-- ----------------------------
BEGIN;
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('4690c04d-f2cd-431e-9d84-060894233111', '生活随笔', '日常生活感悟和随笔', '#10B981', 'heart', 't', '2025-08-14 16:00:19.00822+00', '2025-08-14 16:00:19.00822+00', '生活随笔', '生活随笔', '生活随笔', '生活随笔', '日常生活感悟和随笔', '日常生活感悟和随笔', '日常生活感悟和随笔', '日常生活感悟和随笔', 2);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('2d27c145-fe7a-48ea-a760-e9002a2d2660', '____3', '技术相关的内容分享', '#c42121', 'code', 't', '2025-08-14 16:00:19.00822+00', '2025-08-14 16:00:19.00822+00', '技术分享 1', '技术分享2', '技术分享3', '技术分享43', '技术相关的内容分享', '技术相关的内容分享', '技术相关的内容分享', '技术相关的内容分享', 1);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('23bf4f11-6e3a-47c2-86d6-68f48edc91ae', '学习笔记', '学习过程中的笔记和总结', '#F59E0B', 'book', 't', '2025-08-14 16:00:19.00822+00', '2025-08-14 16:00:19.00822+00', '学习笔记', '学习笔记', '学习笔记', '学习笔记', '学习过程中的笔记和总结', '学习过程中的笔记和总结', '学习过程中的笔记和总结', '学习过程中的笔记和总结', 3);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('4af22b59-a855-4161-b2f6-ec4efa41fdc4', '项目展示', '个人或团队项目的展示', '#8B5CF6', 'folder', 't', '2025-08-14 16:00:19.00822+00', '2025-08-14 16:00:19.00822+00', '项目展示', '项目展示', '项目展示', '项目展示', '个人或团队项目的展示', '个人或团队项目的展示', '个人或团队项目的展示', '个人或团队项目的展示', 4);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('abdcdedc-118e-45c6-b8c6-4ccdfed55f9b', '其他', '其他类型的内容', '#6B7280', 'more-horizontal', 't', '2025-08-14 16:00:19.00822+00', '2025-08-14 16:00:19.00822+00', '其他', '其他', '其他', '其他', '其他类型的内容', '其他类型的内容', '其他类型的内容', '其他类型的内容', 5);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('e17bbba6-d658-4aeb-9a39-d8551bd333ce', '产品评测', '各类产品的使用体验和评价', '#EF4444', 'star', 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '产品评测', '产品评测', '产品评测', '产品评测', '各类产品的使用体验和评价', '各类产品的使用体验和评价', '各类产品的使用体验和评价', '各类产品的使用体验和评价', 6);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('4af18e06-866e-48b2-bf76-e614761c4e37', '旅行游记', '旅行见闻和攻略分享', '#8B5CF6', 'map', 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '旅行游记', '旅行游记', '旅行游记', '旅行游记', '旅行见闻和攻略分享', '旅行见闻和攻略分享', '旅行见闻和攻略分享', '旅行见闻和攻略分享', 7);
INSERT INTO "public"."content_categories" ("id", "name", "description", "color", "icon", "is_active", "created_at", "updated_at", "name_zh", "name_zh_tw", "name_en", "name_vi", "description_zh", "description_zh_tw", "description_en", "description_vi", "sort_order") VALUES ('1af7923d-e358-49a5-a261-aabc99e21747', '____', '美食制作和品尝体验', '#F97316', 'utensils', 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '美食分享', '美食分享 2', '美食分享', '美食分享', '美食制作和品尝体验', '美食制作和品尝体验', '美食制作和品尝体验', '美食制作和品尝体验', 8);
COMMIT;

-- ----------------------------
-- Table structure for follows
-- ----------------------------
DROP TABLE IF EXISTS "public"."follows";
CREATE TABLE "public"."follows" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "follower_id" uuid NOT NULL,
  "following_id" uuid NOT NULL,
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."follows" OWNER TO "postgres";

-- ----------------------------
-- Records of follows
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ip_blacklist
-- ----------------------------
DROP TABLE IF EXISTS "public"."ip_blacklist";
CREATE TABLE "public"."ip_blacklist" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ip_address" inet NOT NULL,
  "blocked_at" timestamptz(6) DEFAULT now(),
  "blocked_until" timestamptz(6),
  "reason" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'Too many failed login attempts'::character varying,
  "failed_attempts_count" int4 DEFAULT 0,
  "is_permanent" bool DEFAULT false,
  "blocked_by" uuid,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."ip_blacklist" OWNER TO "postgres";

-- ----------------------------
-- Records of ip_blacklist
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for likes
-- ----------------------------
DROP TABLE IF EXISTS "public"."likes";
CREATE TABLE "public"."likes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "post_id" uuid,
  "comment_id" uuid,
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."likes" OWNER TO "postgres";

-- ----------------------------
-- Records of likes
-- ----------------------------
BEGIN;
INSERT INTO "public"."likes" ("id", "user_id", "post_id", "comment_id", "created_at") VALUES ('4e026f80-76a5-4966-97d1-b686cce7477e', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'fce71943-58d6-4e77-b142-41d47d4613f4', NULL, '2025-08-19 18:35:40.011+00');
INSERT INTO "public"."likes" ("id", "user_id", "post_id", "comment_id", "created_at") VALUES ('141fa010-4381-4181-982a-b672c8897c7c', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'ccad9289-67e3-4d92-bfe5-9fa57ead209a', NULL, '2025-08-19 18:35:44.249+00');
INSERT INTO "public"."likes" ("id", "user_id", "post_id", "comment_id", "created_at") VALUES ('86236260-3a60-4d01-993b-d717fd058ee9', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'add0588b-4024-462b-b8ec-92563cdba61a', NULL, '2025-08-19 18:35:47.532+00');
INSERT INTO "public"."likes" ("id", "user_id", "post_id", "comment_id", "created_at") VALUES ('e4badea8-831f-4836-b824-5ce851de2e08', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', NULL, '2025-08-20 17:01:47.058+00');
COMMIT;

-- ----------------------------
-- Table structure for login_attempts
-- ----------------------------
DROP TABLE IF EXISTS "public"."login_attempts";
CREATE TABLE "public"."login_attempts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ip_address" inet NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "attempt_time" timestamptz(6) DEFAULT now(),
  "success" bool DEFAULT false,
  "user_agent" text COLLATE "pg_catalog"."default",
  "failure_reason" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."login_attempts" OWNER TO "postgres";

-- ----------------------------
-- Records of login_attempts
-- ----------------------------
BEGIN;
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('f6c26460-0503-4de6-b7b1-adedadfc4e2c', '::1', 'wwx@biubiustar.com', '2025-08-20 23:02:47.186302+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-20 23:02:47.186302+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('e5a51c58-4b12-452c-ad7b-3e8aeaca05e4', '::1', 'wwx@biubiustar.com', '2025-08-21 12:47:30.054788+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 12:47:30.054788+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('a17240d9-a1a8-48c3-b3f7-50d2ae3f0e2d', '::1', 'wwx@biubiustar.com', '2025-08-21 16:24:54.433246+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:24:54.433246+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('c1fe3ba9-68b1-4ab6-9545-8980f105b1c6', '::1', 'wwx@biubiustar.com', '2025-08-21 16:47:34.191218+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:47:34.191218+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('ab96e525-cd4e-4ff6-920e-e877eb3be637', '::1', 'wwx@biubiustar.com', '2025-08-21 18:06:51.956581+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 18:06:51.956581+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('97cb85ca-a661-4841-aa95-e5cd669096de', '::1', 'wwx@biubiustar.com', '2025-08-21 19:44:55.592+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 19:44:55.592+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('50a1f37c-c7d7-4876-bec7-3a9d9cfe9562', '::1', 'wwx@biubiustar.com', '2025-08-21 21:25:25.236778+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 21:25:25.236778+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('1d846ee1-2240-468e-9bb1-986590709ff4', '::1', 'wwx@biubiustar.com', '2025-08-21 21:56:02.665317+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 21:56:02.665317+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('956872a4-0696-4a6d-b5cf-3347543f6809', '::1', 'wwx@biubiustar.com', '2025-08-22 12:14:55.459621+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 12:14:55.459621+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('33c20de4-50f0-4314-8ff5-60697b88d847', '::1', 'test@example.com', '2025-08-22 13:04:30.830437+00', 'f', 'curl/8.7.1', 'Invalid credentials', '2025-08-22 13:04:30.830437+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('3f1aca5a-1bed-4fe6-9613-d63ee6db749a', '::1', 'wwx@biubiustar.com', '2025-08-22 13:48:59.299387+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 13:48:59.299387+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('703e5bca-18f4-4fff-a2c5-3e6ffeb54fa3', '::1', 'admin@example.com', '2025-08-22 13:53:35.663515+00', 'f', 'node-fetch', 'Invalid credentials', '2025-08-22 13:53:35.663515+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('bf33bdfd-2e95-4d97-89e1-2943bcb7f4a8', '::1', 'wwx@biubiustar.com', '2025-08-22 14:29:55.98521+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 14:29:55.98521+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('bcb3d448-635f-4f8e-8310-a3e286cce544', '::1', 'wwx@biubiustar.com', '2025-08-22 15:37:44.313837+00', 'f', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 'Invalid credentials', '2025-08-22 15:37:44.313837+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('58b8012d-2eae-49ae-a9dc-5c2e2d9eba2e', '::1', 'wwx@biubiustar.com', '2025-08-22 15:37:49.790805+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 15:37:49.790805+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('ed390787-bab7-485e-a3ab-a7977b527f61', '::1', 'wwx@biubiustar.com', '2025-08-22 15:42:40.769319+00', 'f', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 'Invalid credentials', '2025-08-22 15:42:40.769319+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('2e13a21e-68e5-4a8c-9138-767c9f37ed1a', '::1', 'wwx@biubiustar.com', '2025-08-22 16:06:45.201457+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 16:06:45.201457+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('afb4728c-f6a0-4335-bdd9-b4e2c2ece73d', '::1', 'wwx@biubiustar.com', '2025-08-22 21:42:56.106738+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 21:42:56.106738+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('daca0d18-2903-47e3-8538-56f1100f7e1e', '::1', 'wwx@biubiustar.com', '2025-08-22 21:55:19.974819+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 21:55:19.974819+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('efead24a-8aea-4e7a-a7f9-57e6012efb86', '::1', 'wwx@biubiustar.com', '2025-08-22 22:28:40.268183+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 22:28:40.268183+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('5dbf5cb8-7fc3-4b92-9ff6-b2666ccd659e', '::1', 'wwx@biubiustar.com', '2025-08-20 23:02:12.605088+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-20 23:02:12.605088+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('7842579d-7842-4c87-b83d-703a621dbe82', '::1', 'wwx@biubiustar.com', '2025-08-20 23:03:43.384939+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-20 23:03:43.384939+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('e31b2720-e3d9-46d2-a6f1-c7fd1eb52dda', '::1', 'wwx@biubiustar.com', '2025-08-21 14:42:41.980268+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 14:42:41.980268+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('5fa69c55-074e-46d1-b3f2-9ddc00fb7eb5', '::1', 'wwx@biubiustar.com', '2025-08-21 16:33:53.869018+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:33:53.869018+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('789ed27d-e5f6-40ef-990a-dd7ec6b844e9', '::1', 'wwx@biubiustar.com', '2025-08-21 16:54:10.116523+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:54:10.116523+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('70ce8cc2-ba9d-4168-9676-f3d798be2782', '::1', 'wwx@biubiustar.com', '2025-08-21 19:33:09.839282+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 19:33:09.839282+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('12297ad7-699e-46dd-bc8f-97ee459f6b0e', '::1', 'wwx@biubiustar.com', '2025-08-21 20:20:52.32009+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 20:20:52.32009+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('0ce62aa1-f247-417c-a2e7-00391edd182c', '::1', 'wwx@biubiustar.com', '2025-08-21 21:33:09.227091+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 21:33:09.227091+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('96ff872f-e73a-4769-bb74-461887fff826', '::1', 'wwx@biubiustar.com', '2025-08-21 22:05:11.851803+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 22:05:11.851803+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('bec3aed3-66f9-466e-a895-f768c644bb9d', '::1', 'admin@biubiustar.com', '2025-08-22 13:03:05.897463+00', 'f', 'curl/8.7.1', 'Invalid credentials', '2025-08-22 13:03:05.897463+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('1d03d5a5-300f-49c6-af12-5987baea1e64', '::1', 'wwx@biubiustar.com', '2025-08-22 13:22:56.126615+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 13:22:56.126615+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('19d9f079-0b42-48df-857a-7054420c8f50', '::1', 'wwx@biubiustar.com', '2025-08-22 13:50:11.39556+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 13:50:11.39556+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('08626800-a643-40d9-a545-4761e791d9c5', '::1', 'wwx@biubiustar.com', '2025-08-22 14:11:05.166968+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 14:11:05.166968+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('7133cc7b-b15c-4593-bb55-ea22184316dd', '::1', 'wwx@biubiustar.com', '2025-08-22 14:44:32.1094+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 14:44:32.1094+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('4e909885-2030-4236-a928-1dd46920b8d1', '::1', 'wwx@biubiustar.com', '2025-08-22 15:38:51.586288+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 15:38:51.586288+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('a43f06ad-46d2-45bc-a8c3-29fe0d8fbc92', '::1', 'wwx@biubiustar.com', '2025-08-22 15:55:29.798622+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 15:55:29.798622+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('dc612ec5-a180-40fe-a0af-5330a3f9302b', '::1', 'wwx@biubiustar.com', '2025-08-22 18:43:48.157527+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 18:43:48.157527+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('d0f6eaf6-6862-4f4c-8675-953588f15593', '::1', 'wwx@biubiustar.com', '2025-08-22 21:44:06.940911+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 21:44:06.940911+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('7e833c39-7870-410d-936a-3b29e4b57b13', '::1', 'wwx@biubiustar.com', '2025-08-22 22:13:08.097566+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 22:13:08.097566+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('7a7e4ef7-4424-4ec3-bd8a-45a395d882e8', '::1', 'wwx@biubiustar.com', '2025-08-20 23:02:39.655233+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-20 23:02:39.655233+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('579b4829-2bfa-41c9-89c3-4703827f69c0', '::1', 'wwx@biubiustar.com', '2025-08-20 23:03:57.411124+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-20 23:03:57.411124+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('0a6ac16e-196e-49cf-a803-65603e507b8b', '::1', 'wwx@biubiustar.com', '2025-08-21 16:15:23.76965+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:15:23.76965+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('f64569dc-8c90-4034-b246-823d65cd58f0', '::1', 'wwx@biubiustar.com', '2025-08-21 16:37:39.027059+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 16:37:39.027059+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('cfcaa15b-98ec-4f9b-8f12-b7736a6d1ee1', '::1', 'wwx@biubiustar.com', '2025-08-21 17:05:47.876517+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 17:05:47.876517+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('5f712b47-4796-4c6b-8ad3-9eded22db053', '::1', 'wwx@biubiustar.com', '2025-08-21 19:39:18.375128+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 19:39:18.375128+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('697ffd9d-0d76-4d7e-84ca-d30e101ab4f2', '::1', 'wwx@biubiustar.com', '2025-08-21 20:57:11.926914+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 20:57:11.926914+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('c6ad765c-a885-43a6-bcea-6843c2604116', '::1', 'wwx@biubiustar.com', '2025-08-21 21:44:07.274063+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-21 21:44:07.274063+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('972d270d-be12-4589-b2ba-fcede36b700a', '::1', 'wwx@biubiustar.com', '2025-08-21 22:16:38.23668+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-21 22:16:38.23668+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('63f49fc6-d0eb-4420-986c-4ca4cc624293', '::1', 'admin@example.com', '2025-08-22 13:03:52.211703+00', 'f', 'curl/8.7.1', 'Invalid credentials', '2025-08-22 13:03:52.211703+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('08a24c1e-7f56-4c65-8d25-82f9ff7422a4', '::1', 'wwx@biubiustar.com', '2025-08-22 13:23:58.224309+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', NULL, '2025-08-22 13:23:58.224309+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('178faab1-a7cf-4900-b4aa-d63561bbb661', '::1', 'admin@example.com', '2025-08-22 13:52:36.728784+00', 'f', 'node-fetch', 'Invalid credentials', '2025-08-22 13:52:36.728784+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('2d5497fe-c872-4ae3-bc89-cdff68142f8d', '::1', 'admin@example.com', '2025-08-22 14:23:49.857065+00', 'f', 'node-fetch', 'Invalid credentials', '2025-08-22 14:23:49.857065+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('e1cf3ff1-c0cf-4b43-ac0d-d76ad3d9a349', '::1', 'wwx@biubiustar.com', '2025-08-22 15:06:10.558545+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 15:06:10.558545+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('0247b882-01c0-4cc2-a785-a0474ecec556', '::1', 'wwx@biubiustar.com', '2025-08-22 15:42:36.033048+00', 'f', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', 'Invalid credentials', '2025-08-22 15:42:36.033048+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('e8202504-53e3-440d-891e-d7b0576b0388', '::1', 'wwx@biubiustar.com', '2025-08-22 16:06:37.420771+00', 'f', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'Invalid credentials', '2025-08-22 16:06:37.420771+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('5beecd18-87c9-49e0-afb3-d1266a47856f', '::1', 'wwx@biubiustar.com', '2025-08-22 19:48:39.421846+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 19:48:39.421846+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('550aa9ca-0e15-448c-bedc-9da0541d5ed3', '::1', 'wwx@biubiustar.com', '2025-08-22 21:54:44.446471+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 21:54:44.446471+00');
INSERT INTO "public"."login_attempts" ("id", "ip_address", "email", "attempt_time", "success", "user_agent", "failure_reason", "created_at") VALUES ('31109f04-25ae-4b6d-95e7-64124df43a28', '::1', 'wwx@biubiustar.com', '2025-08-22 22:22:14.591941+00', 't', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', NULL, '2025-08-22 22:22:14.591941+00');
COMMIT;

-- ----------------------------
-- Table structure for media_files
-- ----------------------------
DROP TABLE IF EXISTS "public"."media_files";
CREATE TABLE "public"."media_files" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL,
  "file_url" text COLLATE "pg_catalog"."default" NOT NULL,
  "file_type" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  "file_size" int4,
  "mime_type" varchar(100) COLLATE "pg_catalog"."default",
  "thumbnail_url" text COLLATE "pg_catalog"."default",
  "display_order" int4 NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."media_files" OWNER TO "postgres";
COMMENT ON COLUMN "public"."media_files"."display_order" IS '媒体文件显示顺序，0-8，用于控制在前端的显示顺序';
COMMENT ON TABLE "public"."media_files" IS '帖子媒体文件表，存储帖子的图片和视频文件，支持每个帖子最多9个媒体文件';

-- ----------------------------
-- Records of media_files
-- ----------------------------
BEGIN;
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('75788ee4-b4f5-453f-8abc-ff4911202d03', '13e4f5a0-d6a4-4138-8ad1-6611662a3cde', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20development%20tutorial%20video%20thumbnail%20with%20code%20editor&image_size=landscape_16_9', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-18 20:46:22.811412+00', '2025-08-18 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('c13763e0-6aeb-43d5-8f6b-3157427748c3', 'fce71943-58d6-4e77-b142-41d47d4613f4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20logo%20with%20modern%20blue%20gradient%20background&image_size=landscape_4_3', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('87f2931e-057d-4b81-be10-09accb22b73b', 'add0588b-4024-462b-b8ec-92563cdba61a', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=coffee%20beans%20and%20brewing%20equipment%20on%20wooden%20table&image_size=landscape_4_3', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('3628881f-1b90-4704-b4e2-0bcfe9e4a461', '97781e60-5dc5-4e7b-9285-e83edfcc70bb', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20on%20clean%20white%20background&image_size=square_hd', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('74809a13-5216-4d9b-9cbf-4f7d39d1bda4', '54f8315c-75f4-4084-96ae-f058f94e8b91', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Kyoto%20temple%20with%20cherry%20blossoms%20traditional%20architecture&image_size=landscape_4_3', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('40197545-b174-4f3d-836a-a7ce98fa9838', '5539b5d0-fa18-40b1-9144-27c1fba56e70', 'http://localhost:3001/uploads/posts/post-1755627682200-fe54654feb68d79d.png', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 18:21:53.741+00', '2025-08-19 19:05:43.267+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('e8c47406-3f7a-45bf-b3a4-363559c5ef4f', 'ccad9289-67e3-4d92-bfe5-9fa57ead209a', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=TypeScript%20code%20on%20computer%20screen%20with%20blue%20theme&image_size=landscape_4_3', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 12:10:35.528132+00', '2025-08-19 19:06:08.011+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('b8ba64f6-d1e8-4f54-98d5-f721fbfbb4fc', '43e5b53c-f628-494f-b5c9-1ea97e172214', '/uploads/posts/post-1755636269501-4f55722d70e16d51.png', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 20:44:40.107+00', '2025-08-19 20:44:40.107+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('f67570d7-83e4-4b98-a216-5b5abf4da09a', '959869c7-90ae-4325-9319-ae8e116ab4b8', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Kyoto%20cherry%20blossoms%20travel%20vlog%20thumbnail&image_size=landscape_16_9', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-16 20:46:22.811412+00', '2025-08-16 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('46d8b00c-201f-4e9d-9aee-da2ae532c9b0', '77b5e309-e757-43d7-8d92-70e0b67fc656', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Italian%20pasta%20cooking%20tutorial%20video%20thumbnail&image_size=landscape_16_9', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-17 20:46:22.811412+00', '2025-08-17 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('c09d3ec8-172f-4433-814c-c6f5bdd942ff', 'b9159a60-8602-449f-b4cb-60590089b1d3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20review%20video%20thumbnail%20tech&image_size=landscape_16_9', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 15:46:22.811412+00', '2025-08-19 15:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('8a42e25f-e7da-4ce5-bb27-abe6e73e812f', '5b3e9f7e-d5ea-4c25-b3e5-121e73e8e8d0', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20creation%20process%20video%20thumbnail&image_size=landscape_16_9', 'image', NULL, 'image/jpeg', NULL, 0, '2025-08-19 14:46:22.811412+00', '2025-08-19 14:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('4e5044f8-207c-4093-949d-d8f0ed443281', 'd9ae635d-f4ef-40f4-b0b0-916e3dc57f39', '/uploads/posts/post-1755633291411-de85630c676e658a.mp4', 'video', NULL, 'video/mp4', '/uploads/posts/post-1755633291411-de85630c676e658a_thumb.jpg', 0, '2025-08-19 19:55:07.693+00', '2025-08-19 19:55:07.693+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('e4e25c5c-63fd-45b6-966f-387019a90963', '13e4f5a0-d6a4-4138-8ad1-6611662a3cde', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'video', NULL, 'video/mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20logo%20video%20thumbnail%20programming&image_size=landscape_16_9', 1, '2025-08-18 20:46:22.811412+00', '2025-08-18 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('00761970-1e72-4623-a794-089819a9c170', 'c5961a7a-91a5-4616-82c1-06f2f05476ea', '/uploads/posts/post-1755633481813-1b4e0ff5e22e5473.mp4', 'video', NULL, 'video/mp4', '/uploads/posts/post-1755633481813-1b4e0ff5e22e5473_thumb.jpg', 0, '2025-08-19 19:58:20.727+00', '2025-08-19 20:00:20.788+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('7b19d120-bffd-4590-98f1-49b5202641b3', '959869c7-90ae-4325-9319-ae8e116ab4b8', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'video', NULL, 'video/mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossoms%20Kyoto%20temple%20video%20thumbnail&image_size=landscape_16_9', 1, '2025-08-16 20:46:22.811412+00', '2025-08-16 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('85935864-ef93-494a-bdaf-d839697cf39b', '77b5e309-e757-43d7-8d92-70e0b67fc656', 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', 'video', NULL, 'video/mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=pasta%20cooking%20kitchen%20video%20thumbnail&image_size=landscape_16_9', 1, '2025-08-17 20:46:22.811412+00', '2025-08-17 20:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('7103fbd1-651a-4c77-899f-b0f8f2e948cc', 'b9159a60-8602-449f-b4cb-60590089b1d3', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_1mb.mp4', 'video', NULL, 'video/mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20review%20tech%20video%20thumbnail&image_size=landscape_16_9', 1, '2025-08-19 15:46:22.811412+00', '2025-08-19 15:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('8b254a01-b7a0-4b41-a63f-078a82db061e', '5b3e9f7e-d5ea-4c25-b3e5-121e73e8e8d0', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 'video', NULL, 'video/mp4', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20painting%20art%20video%20thumbnail&image_size=landscape_16_9', 1, '2025-08-19 14:46:22.811412+00', '2025-08-19 14:46:22.811412+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('91a58c36-1263-4c32-b2af-1500cf1de3ba', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702610291-52c70ce4a0290daf.png', 'image', NULL, NULL, NULL, 0, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('6fd77271-24e2-4f5a-821b-bff6f28f8589', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702610295-48afe4d9d455e109.png', 'image', NULL, NULL, NULL, 1, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('076081dc-a04a-4f46-b5ba-d8147e1fd642', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702610308-e3005c9ac5ede040.png', 'image', NULL, NULL, NULL, 2, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('05dd3a48-f82c-4693-846a-1cc5c87aa8a7', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702610308-435693bf0bb41c62.png', 'image', NULL, NULL, NULL, 3, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('e128a059-c6eb-4611-8626-33aadcfc6cb3', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702616148-ca180ee8b65d481a.mp4', 'video', NULL, NULL, '/uploads/posts/post-1755702616148-ca180ee8b65d481a_thumb.jpg', 4, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('44902323-e2a2-4d09-bba5-77caa4c8a8c5', '034af08a-b16e-425a-8ffa-f0bb7eca46f6', '/uploads/posts/post-1755702625466-3f87e40d34ee0764.mp4', 'video', NULL, NULL, '/uploads/posts/post-1755702625466-3f87e40d34ee0764_thumb.jpg', 5, '2025-08-20 15:10:51.646+00', '2025-08-20 15:10:51.887805+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('8f62c3ee-a92f-432a-b85c-e266b41fcd51', '785873b1-0ecb-4480-9fa0-c1cf5e546b02', '/uploads/posts/post-1755864848093-e5e814d6f34581b6.mp4', 'video', NULL, NULL, '/uploads/posts/post-1755864848093-e5e814d6f34581b6_thumb.jpg', 0, '2025-08-22 12:14:36.359+00', '2025-08-22 12:14:37.219592+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('1df437b2-1a75-4e45-a6c1-127308442a0c', '785873b1-0ecb-4480-9fa0-c1cf5e546b02', '/uploads/posts/post-1755864858047-c84b3d37eb6e36e4.png', 'image', NULL, NULL, NULL, 1, '2025-08-22 12:14:36.359+00', '2025-08-22 12:14:37.219592+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('124ad4d1-9f1e-4a0c-8497-a6bf226a4d22', '785873b1-0ecb-4480-9fa0-c1cf5e546b02', '/uploads/posts/post-1755864858048-7fd22289ade92726.png', 'image', NULL, NULL, NULL, 2, '2025-08-22 12:14:36.359+00', '2025-08-22 12:14:37.219592+00');
INSERT INTO "public"."media_files" ("id", "post_id", "file_url", "file_type", "file_size", "mime_type", "thumbnail_url", "display_order", "created_at", "updated_at") VALUES ('52d69928-d74d-4dd4-ae12-cf5b28637827', '785873b1-0ecb-4480-9fa0-c1cf5e546b02', '/uploads/posts/post-1755864858049-12bb306973e8f274.png', 'image', NULL, NULL, NULL, 3, '2025-08-22 12:14:36.359+00', '2025-08-22 12:14:37.219592+00');
COMMIT;

-- ----------------------------
-- Table structure for post_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."post_tags";
CREATE TABLE "public"."post_tags" (
  "post_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL
)
;
ALTER TABLE "public"."post_tags" OWNER TO "postgres";

-- ----------------------------
-- Records of post_tags
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for posts
-- ----------------------------
DROP TABLE IF EXISTS "public"."posts";
CREATE TABLE "public"."posts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "tags" text[] COLLATE "pg_catalog"."default",
  "user_id" uuid NOT NULL,
  "likes_count" int4 DEFAULT 0,
  "comments_count" int4 DEFAULT 0,
  "shares_count" int4 DEFAULT 0,
  "is_published" bool DEFAULT true,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "category" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'general'::character varying,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pending'::character varying,
  "views_count" int4 DEFAULT 0
)
;
ALTER TABLE "public"."posts" OWNER TO "postgres";
COMMENT ON COLUMN "public"."posts"."views_count" IS '帖子浏览次数';

-- ----------------------------
-- Records of posts
-- ----------------------------
BEGIN;
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('d9ae635d-f4ef-40f4-b0b0-916e3dc57f39', '阿阿阿', '下次在现场', '{阿阿阿阿阿}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 0, 0, 0, 't', '2025-08-19 19:55:07.693+00', '2025-08-19 19:55:07.693+00', 'general', 'pending', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('13e4f5a0-d6a4-4138-8ad1-6611662a3cde', '🎥 React 开发技巧视频教程', '分享一个关于 React 开发技巧的视频教程，包含了一些实用的编程技巧和最佳实践。这个视频详细介绍了如何优化 React 组件性能，以及如何使用最新的 Hooks API。', '{React,视频教程,前端开发,编程}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 45, 12, 0, 't', '2025-08-18 20:46:22.811412+00', '2025-08-18 20:46:22.811412+00', '技术分享', 'published', 320);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('fce71943-58d6-4e77-b142-41d47d4613f4', 'React 18 新特性详解', '本文将详细介绍 React 18 的新特性，包括并发渲染、自动批处理、Suspense 改进等内容。这些新特性将大大提升 React 应用的性能和用户体验。\n\n## 并发渲染\n\n并发渲染是 React 18 最重要的特性之一...', '{React,前端,JavaScript}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 16, 3, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '技术分享', 'published', 128);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('add0588b-4024-462b-b8ec-92563cdba61a', '我的咖啡制作心得', '作为一个咖啡爱好者，我想分享一下这些年来学到的咖啡制作技巧。从选豆到冲泡，每一个环节都很重要。\n\n## 选择咖啡豆\n\n好的咖啡豆是制作美味咖啡的基础...', '{咖啡,生活,分享}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 9, 2, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '生活随笔', 'published', 95);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('97781e60-5dc5-4e7b-9285-e83edfcc70bb', 'iPhone 15 Pro 使用体验', '使用 iPhone 15 Pro 一个月后的真实感受，从拍照到性能，全方位评测。\n\n## 外观设计\n\n钛金属材质确实带来了不同的手感...', '{iPhone,评测,数码}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 20, 8, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '产品评测', 'published', 234);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('54f8315c-75f4-4084-96ae-f058f94e8b91', '京都三日游攻略', '刚从京都回来，分享一下这次旅行的详细攻略，希望对大家有帮助。\n\n## 第一天：清水寺周边\n\n建议早上8点就出发...', '{京都,旅行,攻略}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 25, 12, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '旅行游记', 'published', 312);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('788f7ee7-3690-41af-89fc-897faa41e0d2', '在家制作意大利面的小技巧', '分享一些在家制作正宗意大利面的小技巧，让你在家也能享受餐厅级别的美食。', '{意大利面,烹饪}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 0, 0, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '美食分享', 'pending', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('5988ff77-916e-4ed6-868d-d987ba13773a', 'Node.js 性能优化指南', '这是一篇关于 Node.js 性能优化的文章，目前还在编写中...', '{Node.js,性能}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 0, 0, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '技术分享', 'draft', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('8192fadb-36ba-4067-af29-e5a1178f9417', '这是一篇测试文章', '这只是一篇测试文章，内容不够充实。', '{测试}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 0, 0, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 12:10:35.528132+00', '生活随笔', 'rejected', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('5539b5d0-fa18-40b1-9144-27c1fba56e70', '123', '123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算打算大123asdasd 按时打算', '{科技,asd}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 0, 0, 0, 't', '2025-08-19 18:21:53.741+00', '2025-08-19 19:05:43.267+00', '4af22b59-a855-4161-b2f6-ec4efa41fdc4', 'rejected', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('ccad9289-67e3-4d92-bfe5-9fa57ead209a', 'TypeScript 学习笔记 - 高级类型', 'TypeScript 的高级类型系统非常强大，本文记录了我在学习过程中的一些心得体会。\n\n## 联合类型和交叉类型\n\n联合类型使用 | 符号...', '{TypeScript,学习,编程}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 13, 5, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-19 19:06:08.011+00', '学习笔记', 'published', 156);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('c5961a7a-91a5-4616-82c1-06f2f05476ea', '按时打算大叔大婶的', '阿萨德阿萨德按时', '{"阿阿 1"}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 0, 0, 0, 't', '2025-08-19 19:58:20.727+00', '2025-08-19 20:00:20.788+00', '4af22b59-a855-4161-b2f6-ec4efa41fdc4', 'published', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('43e5b53c-f628-494f-b5c9-1ea97e172214', '阿阿阿a', '阿阿萨德啊大打算打算大师的阿萨德按时', '{}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 0, 0, 0, 't', '2025-08-19 20:44:40.107+00', '2025-08-19 20:44:40.107+00', '23bf4f11-6e3a-47c2-86d6-68f48edc91ae', 'pending', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('959869c7-90ae-4325-9319-ae8e116ab4b8', '🎬 旅行Vlog：京都樱花季', '记录了我在京都樱花季的美好时光，从清水寺到哲学之道，每一处风景都让人流连忘返。这个视频包含了详细的旅行攻略和拍摄技巧分享。', '{旅行,Vlog,京都,樱花,视频}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 78, 25, 0, 't', '2025-08-16 20:46:22.811412+00', '2025-08-16 20:46:22.811412+00', '旅行游记', 'published', 560);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('77b5e309-e757-43d7-8d92-70e0b67fc656', '🍳 美食制作：意大利面完整教程', '从选材到制作，完整展示如何制作正宗的意大利面。这个视频包含了详细的步骤说明和专业厨师的小贴士，让你在家也能做出餐厅级别的美食。', '{美食,烹饪,意大利面,教程,视频}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 32, 8, 0, 't', '2025-08-17 20:46:22.811412+00', '2025-08-17 20:46:22.811412+00', '美食分享', 'published', 245);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('f58f2fbc-0450-4cf0-b6d3-6c285f5886f3', 'Vue 3 Composition API 最佳实践', '本文总结了 Vue 3 Composition API 的最佳实践，包括代码组织、性能优化等方面。', '{Vue,前端}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 0, 0, 0, 't', '2025-08-19 12:10:35.528132+00', '2025-08-22 22:26:45.4+00', '技术分享', 'published', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('785873b1-0ecb-4480-9fa0-c1cf5e546b02', '123', '12312阿萨德阿萨德', '{阿萨德}', '8c41749f-76a0-43b8-bf49-2b1da24b586f', 0, 0, 0, 't', '2025-08-22 12:14:35.03+00', '2025-08-22 22:28:54.723+00', '2d27c145-fe7a-48ea-a760-e9002a2d2660', 'published', 0);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('b9159a60-8602-449f-b4cb-60590089b1d3', '📱 iPhone 15 Pro 深度评测视频', '详细评测 iPhone 15 Pro 的各项功能，包括摄像头、性能、电池续航等方面。这个视频提供了全面的使用体验分享和购买建议。', '{iPhone,评测,数码,视频,科技}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 89, 34, 0, 't', '2025-08-19 15:46:22.811412+00', '2025-08-19 15:46:22.811412+00', '产品评测', 'published', 720);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('5b3e9f7e-d5ea-4c25-b3e5-121e73e8e8d0', '🎨 数字艺术创作过程分享', '分享我的数字艺术创作过程，从草图到最终作品的完整流程。这个视频展示了各种数字绘画技巧和创意思路，适合艺术爱好者观看学习。', '{艺术,数字绘画,创作,视频,教程}', 'cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 56, 18, 0, 't', '2025-08-19 14:46:22.811412+00', '2025-08-19 14:46:22.811412+00', '生活随笔', 'published', 380);
INSERT INTO "public"."posts" ("id", "title", "content", "tags", "user_id", "likes_count", "comments_count", "shares_count", "is_published", "created_at", "updated_at", "category", "status", "views_count") VALUES ('034af08a-b16e-425a-8ffa-f0bb7eca46f6', '阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是', '阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是阿西啥打算阿森西奥是', '{阿阿吃}', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 1, 19, 0, 't', '2025-08-20 15:10:51.246+00', '2025-08-21 17:57:57.443+00', '4af22b59-a855-4161-b2f6-ec4efa41fdc4', 'published', 11);
COMMIT;

-- ----------------------------
-- Table structure for security_logs
-- ----------------------------
DROP TABLE IF EXISTS "public"."security_logs";
CREATE TABLE "public"."security_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "event_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "ip_address" inet,
  "user_id" uuid,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "details" jsonb,
  "severity" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'info'::character varying,
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."security_logs" OWNER TO "postgres";

-- ----------------------------
-- Records of security_logs
-- ----------------------------
BEGIN;
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ca46ff6f-6cb4-48fe-969f-1027760f2991', 'system_init', NULL, NULL, NULL, '{"message": "Security tables initialized"}', 'info', '2025-08-15 14:38:00.467275+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d54031b1-8d42-4e81-bae9-ae70b9024df3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 14:55:17.293189+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ba8b354f-0bea-4319-a293-16b788125df3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T14:59:28.359Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 14:59:28.530466+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('22a18270-4f8b-422f-bed9-523c579ba3c5', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-15T15:31:04.278Z", "failed_attempts": 3}', 'warning', '2025-08-15 15:01:05.728545+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1e892823-8d48-40a6-a84d-d5a989f424c0', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:07:35.369Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:07:35.617977+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('191326ec-f19d-47a6-bce5-b1e0df6b31ab', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:18:58.031Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:18:58.257507+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('adce78d3-ae94-4123-82ea-8ae10ae5879e', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:27:35.097Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:27:35.33986+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('212b594f-ed4c-4ce8-b72d-e7381608fdaa', 'ip_auto_unblocked', '::1', NULL, NULL, '{"reason": "Lockout period expired"}', 'info', '2025-08-15 15:31:12.56621+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('731a805b-2375-45f7-b9a2-5093b3e7116e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 15:31:14.621113+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('94b7f92c-efdc-46bc-9efb-cd7bce21bb02', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 15:32:39.594603+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1a41ee54-19d3-446a-b43e-59f559601a2f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 15:36:00.515244+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6a391362-b98f-4aa4-8c37-f5158b216879', 'ip_manual_block', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"reason": "132", "blockedIP": "192.168.1.1", "adminAction": true}', 'warning', '2025-08-15 15:38:16.485134+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d4d2c9e2-377c-4fb3-a872-50c4a0b30c7e', 'ip_manual_unlock', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"unlockedIP": "192.168.1.1", "adminAction": true}', 'info', '2025-08-15 15:38:25.036414+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('27c1ddbf-d5be-4ef8-a787-c520ba62a9b2', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 15:46:42.653769+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d7ed2f8f-adf4-4662-b863-97fd5149e3dd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:50:24.341Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:50:24.556854+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('19c5df5e-112d-4862-8461-f03755b1000f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:53:29.946Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:53:30.156346+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ba812e1e-c330-4264-869e-c9e0d694c2d2', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:53:41.418Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:53:41.637565+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4bcabcac-036f-470e-90f0-12106920b296', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 15:54:00.845458+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('59b3a027-e4a7-46b4-8df1-f71cf3b67ae0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 15:55:22.737404+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a4ee9b97-267c-4b25-be99-d5d11f19edb1', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T15:59:21.074Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 15:59:21.279749+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('dfd1a019-8717-41f4-9e4c-f3da86037f97', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 15:59:41.123519+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3c44ac2e-5eed-43a0-8d21-4ac95562abaf', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 16:06:00.188638+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('29bb9c0a-5a1a-40fb-bad0-b20bdc9d9f9b', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:13:57.055Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:13:57.260794+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7b5aabf9-e940-4314-928c-9122bf9b7c13', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:14:11.610Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:14:12.178264+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3e38adfb-bd4a-4c4c-bfad-ff8a02a8a592', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:14:27.760Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:14:27.989698+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('211cd92a-5b9f-4fa5-bb13-98c0cb9e139e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 16:16:07.607948+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('10d06abe-2d19-48fa-897b-31dc5c066b5c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:18:39.212Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:18:39.481001+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2853b982-b103-4fd5-861f-4a83d450d00b', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:19:22.062Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:19:22.337037+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e6bf668c-a07c-4848-a39e-7509222d9675', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:19:50.905Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:19:51.156904+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9fa3845e-5b5b-4630-8651-1cee28f94220', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:20:24.861Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:20:25.100539+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('878051f8-8b57-4608-98e5-360dac72685d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:20:44.387Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:20:44.645772+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('dcf8bf9e-9bc1-48d9-a508-a359d87b65c2', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:20:55.393Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:20:55.653685+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('65ad06a5-7a63-4fe5-b782-0477a1051ada', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 16:21:02.695516+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9b45184e-fdee-4741-94d1-e0578403ef0e', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:22:14.753Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:22:15.015146+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('df62d92c-31ce-44f4-9238-e8173597403d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:23:15.278Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:23:15.548368+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3a57953f-09e3-4758-9065-8c9647fd3835', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:23:28.031Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:23:28.308715+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('69315447-6f1a-4ed9-969a-dcf4fc4826fc', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:24:03.439Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:24:03.710709+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('32edfbf5-f135-4325-9e53-bef85c9489d2', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:24:45.794Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:24:46.089125+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fe323944-33e0-4aad-99f4-42a3fa447a98', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:21:53.373Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:21:53.651865+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('53dc0391-052c-4b8f-87f8-83369a36f714', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:22:43.464Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:22:43.720998+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a926de47-a6c9-4dbb-a3f7-40c8e2965315', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:24:26.377Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:24:26.63971+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f42ec6e0-0ba0-4278-a827-4d308f523461', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:25:21.408Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:25:21.6863+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9eaf0937-212a-426c-9966-bf6ae19d8ff3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:25:32.795Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:25:33.064954+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('57d97fbc-cc2a-4139-9e63-7ea542bc921d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:39:27.564Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:39:27.889589+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('16db0c63-1f84-458c-980f-c906aee7990d', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 16:45:07.979992+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('980f06c7-3e17-428a-b2f4-fb9034fbca4f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 16:46:42.357801+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('653ff9aa-0869-40c0-abdc-c432ae1d76f3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:51:09.801Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:51:10.110738+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1659a9c9-6f13-47c4-90fd-278bc23f619e', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:51:31.677Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:51:31.953087+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('0650a47e-a87d-411c-81c4-59c2bd235f0b', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:51:40.665Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:51:40.976743+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1091b309-2501-403c-81ed-88b969bafe86', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:51:47.264Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:51:47.557959+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8f4821f9-8155-4c2d-b562-1392d4036813', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:51:54.047Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:51:54.35007+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d675f64f-aa98-4209-ba2e-cde66ddc8321', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:52:08.397Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:52:08.674905+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5750bc53-e630-4ace-983f-faf4df1f1115', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:52:15.718Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:52:16.017039+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3f29f60e-7a7f-4d74-8228-7feaefb2c24a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:52:22.692Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:52:22.983797+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4713f6d6-b614-4a91-b474-6dd5da65f224', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:52:46.188Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:52:46.535202+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e1dd3f50-f728-4f72-bec6-08ef67f81b6c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:52:57.205Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:52:57.511498+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b197d267-5aab-4e67-9674-1efb08af56b3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:53:04.571Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:53:04.836648+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f5331a0a-5acc-42d5-90a1-f99d12a2dac8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:53:11.807Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:53:12.105587+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3b417330-b2f3-4570-bda8-fd31004281fa', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:53:20.786Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:53:21.054555+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d1cecac4-22ce-433f-8817-795f34891d0c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:58:46.780Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:58:47.015714+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5b00f2b3-b5f2-4346-be7d-09b34aab8716', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:59:03.289Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:59:03.522858+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('df836a70-75d1-4652-aa26-9b712634cab4', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T16:59:13.265Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 16:59:13.500178+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1ee33077-477d-42c0-af84-ced180f0e364', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 16:59:22.101836+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('df8c228a-405a-4e40-8142-a5470686e141', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:00:55.778Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:00:56.027654+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6f79b01c-4bca-4192-b55a-58a41d1607b6', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:02:55.969Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:02:56.228024+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5721dcb7-c116-43f3-b696-44ca24959a69', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 17:03:22.785673+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7a04aab9-5c21-4d10-a20e-cafeb27d1de1', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:06:24.074Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:06:24.337765+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6792ce1c-6d67-4924-b2a5-6b8a7ec2d48d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:06:35.199Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:06:35.441119+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3e4340df-0315-4e21-b053-360e5b3d031c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:07:05.893Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:07:06.134649+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('98791023-23fa-4fcd-bfc0-d9977c7f5a21', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:07:43.754Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:07:43.974262+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('000ef71f-c196-4dad-820c-1d0de2c8543a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:09:01.074Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:09:01.303431+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ea452fd6-7ea4-48ae-a655-f4ae42dff41a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 17:09:04.39483+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b5b87adc-2e1a-4649-8dca-aae17cefe7b8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:09:12.507Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:09:13.742467+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ae09c49a-a85c-4cc5-a886-1c590ce9c3ef', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:09:20.655Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:09:20.897539+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('064b9d35-c6e7-48bb-84a1-16fa646e4b8e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 17:09:15.499771+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f6a21438-e0a6-4a89-806a-2c533ef0ba6d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:09:31.659Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:09:31.915311+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('52177052-ddf1-4c5b-97fd-83e8f49930c5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 17:10:04.976708+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3cc14973-c702-41b5-b1c7-606e87ac2cbc', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:11:42.299Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:11:42.540344+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e79fdba1-1543-40e4-b153-968ba8e606bd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:14:05.956Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:14:06.179076+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a42bf93d-36a6-4322-b144-98de450daad8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:14:25.817Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:14:26.116776+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('30162677-d648-4410-acf9-31c81bacb38e', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:18:46.805Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:18:47.032749+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('113bc6d5-4355-4c03-8173-e762fef7349c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:19:03.471Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:19:03.672565+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('88b7087a-6bf3-4896-9a82-6b7f48810de3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:19:28.121Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:19:28.333149+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('60f701b0-b0ca-4337-990d-9124db87574c', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-15T17:50:40.396Z", "failed_attempts": 3}', 'warning', '2025-08-15 17:20:41.752563+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6a85e6ac-8cf8-4c0d-850e-3de7b62958dd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:22:16.331Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:22:16.552589+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('34f6564b-49ea-49e1-a25c-2f90abf1a548', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:28:27.691Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:28:27.898019+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9bb8c9a1-73fb-4a23-a1df-37c9e8dec6b5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 17:29:52.210793+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fa39fa23-36b4-4b69-aaf8-b2d8a164f26c', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:32:17.865Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:32:18.080128+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('797662d4-8da8-4360-9f7b-09566b3196c5', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:33:36.652Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:33:36.895317+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e6bf3fa8-4246-491f-a1d9-069dbadd4006', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:33:50.770Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:33:50.979754+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e8abc14e-92e1-406b-8c0f-09ea68974b86', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:34:14.956Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:34:15.177915+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('aed21744-1f1c-4ff7-a84f-165fabf66138', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:34:27.832Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:34:28.05325+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c75f214d-6603-4d88-bff8-1abb29d273d3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:34:46.003Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:34:46.22633+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('475c34b6-6014-47af-abfc-b20007fb0af2', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:35:01.575Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:35:01.798532+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fd619fc8-2050-47da-bb5d-0827727858a0', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:35:25.608Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:35:25.838024+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ff283cf7-a491-4463-9f52-f67f0accf9bc', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:36:57.740Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:36:57.957037+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('03e967e1-e1d2-4a5f-b022-2a62f314019d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:37:03.296Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:37:03.488516+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5a08746a-2328-4aee-99f0-891fef4009a4', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:51:59.370Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:51:59.586334+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('34c03b6a-e370-4e40-bc43-e8050d52cf4f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:53:14.833Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:53:15.056876+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('25eda95e-18e4-46c6-b69b-25d77dcdf3f6', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:53:21.236Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:53:21.442056+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4a25b75d-2002-4b60-98bc-43a77f967ea6', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:55:02.795Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:55:03.018367+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2fcdac0c-3354-4145-b681-50241ef4e720', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T17:55:53.791Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 17:55:54.133913+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d1489889-111a-4afc-85f7-bffe59d826ee', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 18:00:27.805982+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3e684c53-b3f9-42a4-aa27-fc70901eea8b', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:05:13.989Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:05:14.60134+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('351822d1-0ddb-453a-9261-9db40cac95a5', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:10:00.915Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:10:01.121766+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('dd1734a8-5ab7-4be3-8d5d-e2e33e0d07f5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 18:13:58.116368+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('0049e918-1676-407c-b4eb-22dfbb367a98', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 18:31:38.784862+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('46b169e1-3390-42ef-9e2d-0f35f6fef4b7', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:43:52.950Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:43:53.152733+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('cbcde08e-e10a-4830-92fd-a29d54c67de8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:47:38.178Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:47:38.397346+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('091005aa-a2ea-40c0-b877-d8ecfff95057', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:47:53.082Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:47:53.28358+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6efa479c-bbba-4280-9e44-fd4ffb51ba2f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:49:47.730Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:49:47.957942+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5e1e25ad-da17-4449-b40b-3fd1d31847a5', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T18:58:30.777Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 18:58:31.000988+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7ea6a1be-621a-4e87-a4c2-63b86672698d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T19:08:32.560Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 19:08:33.144497+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f0e85117-c0f8-4ba5-8b7e-dd4605a354ad', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 19:26:27.339895+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d68b69ce-a081-42ae-a262-38dd8805d135', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 19:42:39.05439+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3b4869ef-ee17-42da-b8a8-fe0b32117fdb', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T20:08:32.359Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 20:08:32.712383+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('302f8422-c4c0-4a28-94f7-3a2a31e8e005', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T20:25:03.182Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 20:25:03.704933+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2c61de55-f2bd-4ec7-9d73-226bb406e36a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T20:25:13.619Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 20:25:13.981981+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b69ab61a-e73a-4e05-82a2-777aa135eca3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T20:25:24.060Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 20:25:24.410874+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('bcc0c40d-045a-4a80-a952-3b867a02261a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 20:32:08.826794+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fd1009d9-a5dd-45c2-9403-bf5eaeae5024', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T20:42:56.586Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 20:42:56.953952+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('81fb5b80-6e55-426a-b4c5-3ca90ffd08ce', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:04:10.565Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:04:11.182886+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('37c15ed7-92ed-4323-9160-9f327258a2aa', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:04:21.131Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:04:21.769624+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('cd1c7c7b-6e59-45f6-811c-22ba72ce4e89', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:04:36.693Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:04:37.352951+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2eadbcf2-ff07-4ce7-84ec-dcb6616bfec0', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:23:12.990Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:23:13.754334+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('378e33f2-b33c-4aed-b8a0-6ec8c4fc3416', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:26:17.043Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:26:17.982756+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8b7048c7-d120-40d3-812b-bf2cce064d40', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-15T21:57:41.712Z", "failed_attempts": 3}', 'warning', '2025-08-15 21:27:43.474712+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9d186c2b-9a76-496a-ab79-9b077dae23e2', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-15T22:00:10.675Z", "failed_attempts": 3}', 'warning', '2025-08-15 21:30:12.022169+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3a8b1576-69bc-4e6d-97dc-14126c897eef', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 21:31:20.789588+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('289d3d1b-7725-4749-a7ab-7e9cdb930969', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:36:22.102Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:36:22.894786+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2d4300b7-37ed-4d20-a72f-4406f1c6eeb3', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-15T22:10:06.470Z", "failed_attempts": 3}', 'warning', '2025-08-15 21:40:07.871909+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d47f6d4e-13ab-4088-a93f-77f8d09d7383', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:44:22.667Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:44:23.516169+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3c0a9ea3-b6ea-4d3a-b6c1-85753959c524', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:47:04.760Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:47:05.581627+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a35205d7-8eea-4b81-bc12-074dd986877a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:47:51.985Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:47:52.800868+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5abedbf6-0975-4c53-a70e-9ea0c00aff2f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:48:57.297Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:48:58.039822+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3789dd5e-281d-46ab-9a45-4d86a54ca6d7', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:49:35.275Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:49:36.129263+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f5207262-7caa-41eb-ab74-b088ed80a598', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:50:21.525Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:50:22.294192+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1e701391-2f5e-4986-bdb5-869fcca629e5', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:51:32.037Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:51:32.810257+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b9c01a78-1a8e-449d-a78c-3f7d56f85ffd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:51:48.848Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:51:49.609472+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('88f13b5d-e23d-48e3-bb63-2fa4cd9a719d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:52:08.943Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:52:09.717581+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('688cf199-a5cb-4992-874f-b5221d253990', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:52:18.389Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:52:19.14314+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('24e589d0-5124-4ba0-ad67-bdccb4cae1f1', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:53:06.476Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:53:07.25636+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3113edcc-ad37-4b9c-b8c0-f46544ced535', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:53:46.741Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:53:47.4909+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1859855b-6e31-41ce-b52a-59306c6e4e6d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:53:59.119Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:53:59.888359+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('61663c3c-200b-4bd6-8068-bcb2347c0800', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T21:54:43.907Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 21:54:44.680741+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b5581b78-f3a1-47e4-896f-59ec2627b456', 'ip_unblocked', '::1', NULL, NULL, '{"reason": "Manual unblock via script", "original_reason": "Too many failed login attempts"}', 'info', '2025-08-15 21:58:28.881+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3c9d0bd6-8163-41cc-925a-e93ed2203b83', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 21:58:38.242631+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3ae29209-4bce-495e-ac4d-7adc1ef5b431', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:01:38.240Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:01:39.072458+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('35de4d5b-4a2b-4f72-a686-05510bcf9e45', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:02:24.861Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:02:26.024633+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('76ce8956-8e43-4487-9cf3-e78003a45890', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:06:16.304Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:06:17.574266+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('020ce048-41f6-444f-9e3c-37ca47e5cce1', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:10:27.643Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:10:28.91281+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5053f397-9b81-4e81-a606-16ce19df833b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:14:18.741553+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d3aee39e-150e-4ff2-9d6c-09d19952fe63', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-15 22:15:08.945723+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('625ea2ac-9245-498f-9903-c5032193c7ce', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:21:10.894885+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9dd4733d-7013-4ed0-91d4-4f80f310a6e3', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:21:14.465Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:21:15.791126+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('02b1ad6d-0774-4fed-9ae1-fb13bbea8be4', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:21:18.848856+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('49953e27-6e70-414a-87d6-c528843056b0', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:21:55.384Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:21:56.719257+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a728afe0-7322-4e37-8bf0-768e95c117e5', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:25:59.295Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:26:00.641634+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('07f83707-e324-4b03-af95-600a2b03fac3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:26:14.01115+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ac4978a0-3d6d-465b-a5fa-043c8fe96dc7', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:26:35.930Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:26:37.282067+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a6fb8dba-7d30-4896-bd8f-b400906d9a0e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:26:45.438417+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('47328af8-5702-4f0c-87a0-fe3435088064', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:29:23.273Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:29:24.620623+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a054498a-7d00-4cfc-a32e-909eaed61c66', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:30:54.977Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:30:56.717904+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6f955c7b-7ad6-4315-9eea-496b88c64e6f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:31:00.519Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:31:01.891756+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c4d102a8-ab7f-47f5-a04e-c8af279520e5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-15 22:31:09.048169+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e3c6d467-d376-4546-aef2-9602bccdd34a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:32:49.271Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:32:50.631765+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('17fd48ab-d9ae-494b-a010-16e986d61e52', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:35:30.557Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:35:32.337818+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e43f8c81-c5a6-4e77-ba20-c249ca66126d', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:37:28.302Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:37:30.034874+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('588b8df7-9aac-452b-8763-7bed4265c2dd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:37:41.288Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:37:43.059123+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5f915528-b3e7-4e10-a260-6d5fdea51c49', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:37:47.191Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:37:48.933048+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('12e43972-27d0-409b-a688-d2b4f0304168', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:37:57.418Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:37:59.154348+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b49ac3d5-c6b2-4c1f-b60c-f78affe78aa2', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:38:04.278Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:38:06.013064+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6989d0e8-e6ef-498a-a9d3-0c51d3d27a8f', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:38:19.231Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:38:20.97846+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7831bfb6-0b43-4387-91f3-11b1dfc887dd', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:38:34.607Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:38:36.35444+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('637d08ed-727e-4745-aea0-6e65974b5fa8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-15T22:41:49.580Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-15 22:41:51.381945+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a4f26a1b-9bd3-4b70-a4a9-1f50b45552c5', 'login_attempts_cleanup', NULL, NULL, NULL, '{"cutoff_time": "2025-08-17T11:33:34.208Z", "cleanup_time": "2025-08-18T11:33:35.699Z", "cleaned_count": 20}', 'info', '2025-08-18 11:33:37.679127+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f2d3dffa-2275-42c1-94d8-031b21b63be0', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T11:33:37.109Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 20}', 'info', '2025-08-18 11:33:38.649308+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d0163f35-8a66-4702-ad26-a51319a5b6a8', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T11:33:41.724Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 11:33:43.296445+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fdcbfe6c-9304-49d9-9285-86a22ec47c8b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 11:34:26.388736+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('07747366-9a1f-47e4-aa9b-eed1a0262eae', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T11:35:05.415Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 11:35:06.986927+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f96dae68-ae1a-4a5c-a108-b59929377989', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:09:02.719Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:09:04.22497+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a31cb475-885f-4d72-9e60-181197adb815', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:10:37.304Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:10:38.655096+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e87c795e-9003-4924-8c97-dd424e3c9741', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 12:11:07.876661+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('14e6f0c9-3a3b-4ac1-a8c3-370a5bbd767a', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:12:14.388Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:12:15.760139+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b6f01985-3ade-4b4b-a7bc-e8e52b7a51be', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:14:57.821Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:14:59.179911+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('25438560-ab13-468d-85a1-fda33e321888', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:22:48.441Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:22:49.817567+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7a4b2fff-afd0-472e-913f-a41b6c6c2743', 'security_cleanup_summary', NULL, NULL, NULL, '{"cleanup_time": "2025-08-18T12:26:06.899Z", "total_errors": 0, "blacklist_cleaned": 0, "login_attempts_cleaned": 0}', 'info', '2025-08-18 12:26:08.624161+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('137fbc0c-684f-408a-a472-cc437686e65e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 14:27:03.438025+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6dab5d5e-fec5-41e6-978e-13f09be01953', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 14:30:43.919856+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('10867fe1-9e62-4c55-be81-2551e99dbec9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 14:58:07.726506+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d43c38ca-34bb-436f-8ee6-cd99d0759d7f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 14:59:07.100072+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6a3abe17-3f63-415f-afb5-6d6158120fa0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 14:59:25.84459+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('feb00c66-35b2-40f1-b855-934094ec8d7c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 15:02:33.363166+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('759e280a-db21-47a9-86d1-955abd60f729', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 15:04:48.668118+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e3391ffe-490f-4c58-aa51-cf253d8f4def', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 16:06:33.144508+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('428c041e-85df-4bac-8f84-d9029b6212f8', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "curl/8.7.1"}', 'info', '2025-08-18 16:08:33.78925+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('0351c421-95fb-4699-b80f-dfefc78b8ba0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "curl/8.7.1"}', 'info', '2025-08-18 16:10:00.884139+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d2f11b98-ff2f-4dc8-bcf6-596c2712bf98', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 16:14:27.042265+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('251b6080-14b0-48b0-9cac-ef6ad7f2febf', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 16:18:34.488962+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d1e61bee-3810-41d4-9e0d-2aa7373b58ad', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-18 16:46:45.751382+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('78460d09-f021-4810-b5b5-be18b5ce53e8', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 17:16:42.703029+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b5cabfcb-22de-4dff-b023-d004ce9f67f2', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 17:33:59.204055+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('986476bf-4c0f-4993-bf75-9668b5f18160', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 17:54:24.306575+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('67f833da-428e-4346-872e-4de45bf3aa2f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 18:35:36.220298+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5b04f138-9c53-4204-8ed4-5f194842aae8', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 19:36:10.360221+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e84468c2-4a3a-4329-97a7-7b4d17a6dd70', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 19:36:11.933765+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b2198961-d780-4419-9a75-91f8b5dfc555', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 20:40:27.524413+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8ae9762c-65e3-4cea-b1dc-1ca527f571bb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-18 20:52:59.547264+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5bb75962-6a1d-4df8-b59a-f347ee2a875c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 11:03:10.25696+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('801fa015-2012-4672-a21e-02a93b22af7d', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 11:24:06.010008+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ea524b14-d1bd-423e-8789-be38e21199c1', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 11:43:34.274602+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8d48abed-c790-401a-b5f2-b598133c4700', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 11:43:47.90855+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('17be5078-999d-4409-a4de-6204e266b005', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 12:04:00.71615+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e88010ce-7063-4615-9882-6fc0ca2fc565', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 12:06:12.403015+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('bdf01b81-c916-44a5-be85-e66dd987ea16', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 12:12:35.174076+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a5c7f063-737d-477c-ab96-62d5cf341e68', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 12:14:19.672886+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('441679b3-e03e-459e-bc43-635a6c0fc92c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-19 12:17:48.257614+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c617f1ed-8536-468d-b7d7-6300fe016188', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 13:00:47.809536+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('670f4422-3b2a-400c-98e1-4383c42855b0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 13:48:53.447292+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a0583cb1-606a-49cc-9fa3-e54fb587bfbf', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 17:21:36.066979+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('0f7130fa-1ed6-420a-b1c8-c82ff095cbf0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 18:25:28.948448+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('31168c47-15ee-4f79-b104-d6b4fbaaa94f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 18:59:37.078865+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8557aa3c-7ad4-42b4-af54-63e0042726f1', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 19:01:44.291501+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('0c08da3b-ba31-41f9-84f4-4860e34502be', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-19 20:03:08.297911+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7edb7118-532c-4ab9-b33e-30baada8eafb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-19 20:45:04.870288+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d3a15ca3-7a5e-43c5-a06e-c7aabe716f53', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 13:59:27.481592+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('cb005d4b-ee80-4879-a063-3c8cc7099a4b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-20 14:14:20.141152+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('92001601-39c0-4445-8300-e61df8836f98', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-20 14:17:13.578054+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8aea4470-00f9-4b8a-892c-b373987f82f5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:19:23.246276+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b5ea6152-7d4b-47a1-8087-5a154fc09481', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:20:05.755147+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3ac76d86-38ca-40a4-88c1-61837114cb31', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:20:46.396487+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2e2b0b4c-03ec-4a08-bae8-5de73ae60962', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:33:37.826585+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('14f2101f-113e-401f-9d84-f0a0be6b43a3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:44:52.540548+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4d7ea623-561c-4a4f-80f9-f01b3a2989e1', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:55:39.305586+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e6cd6b23-4b08-4b86-8357-388b6403863a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 14:59:57.416088+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f56477dd-60a4-4b60-b1fd-bd1f6702c5f7', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 16:31:25.693614+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('ce10a50c-24be-4162-bfa7-f09f25ac3c08', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 20:50:01.929232+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('371e2306-c1c4-4644-9ed8-e53f432ec4e3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:00:22.557333+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a391f0be-e931-413b-a5aa-e7517eccbe30', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-20 21:06:11.744199+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('665593e0-322c-4743-9764-4926b928d052', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:08:09.053602+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c889ea74-ad3c-45df-b8be-cb12614aa93a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:08:44.092592+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4e7748ee-cf64-4ab0-a044-224fd748a8a6', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:11:57.136762+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('517e7208-5eaa-407f-89fd-d92fe11ecdac', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:18:29.63651+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5f974a70-6132-4394-9256-7711dd49e7b2', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:21:19.762473+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('25530896-6344-40a1-a02f-2665dcf0090c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:26:55.410482+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e5a11292-5ea4-4774-ad4e-cbfa093deacf', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:31:41.654773+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8dddef24-6039-4a89-a90e-2fc6a56cc5ae', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-20 21:43:23.915598+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('08dac4ee-f4dc-4714-b703-4e9c6ee4bc2b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:48:53.158444+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7532b5c7-8aff-4210-835b-dd2a88eec7d6', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:54:57.433599+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4e7785be-5555-48e8-bf91-682fc0d0a42f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:57:00.196877+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('08ece351-f358-4de5-afc2-88b4fc6c8a96', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 21:59:13.588018+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d28ab818-b2ce-4829-8e1c-3322dd35dad9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:07:38.875813+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f5ad6043-65c3-4fb1-baf6-86d5c5fd9a40', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:07:58.849237+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d130feea-e2a8-4cd6-a575-1fb535781dfb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:28:18.34662+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d401a280-60cf-40ac-81fd-012f76604949', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:31:25.883182+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('00a5c8ad-eadd-4164-9f67-b88c1995e6b9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:36:05.686707+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('11092466-aab7-4154-89f1-0964d5e67245', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:41:45.379329+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c85072db-1a7d-47d2-b758-217faf073aaa', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:44:24.990582+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f9e89d56-8ac2-44fa-a88c-8f4adbd60848', 'unauthorized_admin_access_attempt', '::1', '4234f544-ff1d-4f39-bf66-d49653ad5d72', 'asd@ad.com', '{"role": "user", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'warning', '2025-08-20 22:45:05.253156+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9483f97c-cfdc-4496-8cc0-2594edf22ffb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:45:18.264405+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9009c968-4801-4112-95eb-3bea0191f5ff', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:46:24.670856+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d484fe33-9cfd-456c-9c53-2d7f2fa1582d', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:53:11.520049+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e68060ed-26eb-4496-90ea-e16b101d0415', 'login_attempts_reset', '::1', NULL, NULL, '{"reason": "Successful admin login", "reset_time": "2025-08-20T22:53:12.537Z"}', 'info', '2025-08-20 22:53:13.115662+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('abeaa83d-c533-4802-a109-6f6ecb5df09b', 'ip_removed_from_blacklist', '::1', NULL, NULL, '{"reason": "Successful admin login", "removal_time": "2025-08-20T22:53:14.856Z"}', 'info', '2025-08-20 22:53:15.420692+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('74ba5933-184a-47b5-83d5-b313a530975c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:53:29.719318+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a115f7d2-fefe-42bb-87ef-daf84f945ad6', 'login_attempts_reset', '::1', NULL, NULL, '{"reason": "Successful admin login", "reset_time": "2025-08-20T22:53:30.369Z"}', 'info', '2025-08-20 22:53:30.630927+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2986be3b-b206-4701-827d-a9c90a933270', 'ip_removed_from_blacklist', '::1', NULL, NULL, '{"reason": "Successful admin login", "removal_time": "2025-08-20T22:53:31.585Z"}', 'info', '2025-08-20 22:53:32.395559+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('316127f1-73d4-4e44-a797-3be9d281994f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:53:50.136855+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('570643c7-979c-417a-b1eb-8d4e97700804', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:55:20.618369+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('05e6cafe-0671-49ed-8850-d527f77a92bc', 'login_attempts_reset', '::1', NULL, NULL, '{"reason": "Admin login successful", "reset_time": "2025-08-20T22:55:21.637Z"}', 'info', '2025-08-20 22:55:21.88506+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e09e7ebe-375a-477e-9a31-41c2e2206efb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 22:59:56.390574+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d65ec8d6-43cb-411f-a100-3df3a78042e6', 'login_attempts_reset', '::1', NULL, NULL, '{"reason": "Admin login successful", "reset_time": "2025-08-20T22:59:57.147Z"}', 'info', '2025-08-20 22:59:57.432702+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('fcf053cb-cef9-4110-9637-ddb9984705c5', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:00:27.708134+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('903dce3e-90df-4e94-b018-7b1d59534e36', 'login_attempts_reset', '::1', NULL, NULL, '{"reason": "Admin login successful", "reset_time": "2025-08-20T23:00:28.379Z"}', 'info', '2025-08-20 23:00:28.967461+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('233d0c9f-1458-4f2e-a5be-df149070c2c4', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:02:13.315064+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d79fbe9f-bda4-46a4-acf9-0a7182603a72', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:02:40.179181+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('8c24c3c4-18a9-4ff8-8c2f-41caf36fbbc9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:02:47.752372+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6ba930b9-efcf-401a-b300-3fbb4b914ffe', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:03:43.95268+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f3b107ea-97bc-4428-b09d-803bb0c977d0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-20 23:03:57.721036+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9318b3f1-e969-4859-af16-5b4ae216eed3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 12:47:30.344129+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e5504569-97e0-4974-aace-a0185c2f3322', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 14:42:42.281894+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('621ccb99-ccae-44b1-b599-f7649eca6502', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:15:24.086319+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2ba599a5-75ac-439a-a23a-1d53dd9c4cf9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:24:54.718364+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('81fb7fb6-dcbf-4ce7-9709-fa8e397519a0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:33:54.258757+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2f6751cc-0a23-4dac-8142-c999b5d82012', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:37:39.413613+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f43a04a8-4bb2-481a-a380-47e725f58906', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:47:34.490425+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d87c4bb6-8e95-4d46-af81-d5f3c6481e64', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 16:54:10.518519+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3b96acb6-3158-4399-8ab4-946257e10fa9', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 17:05:48.139164+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('10cf8563-601f-40f7-870b-b408c022a36e', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 18:06:52.273451+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('dab89ba6-709f-49d9-99f7-4e4adbcf99c3', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 19:33:10.11706+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d59f3153-0457-4ccc-a140-267b087e5df0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 19:39:18.711432+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('9c7e3235-abeb-434a-9a6b-3df69a6d108b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 19:44:56.272622+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c4510cb4-9c6a-4859-937f-f084629718e0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 20:20:52.722268+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('e88a2a0c-585f-4f4d-916e-a3de51ede15d', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 20:57:12.304296+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d3e7e40b-0214-48e2-9473-3c7e63d38f4a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 21:25:25.64708+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1c544a7d-aff1-43df-81db-58c5327d6496', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 21:33:09.599054+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('595fbe72-a178-4a0d-a8b1-e93cf4424bd6', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 21:44:07.892497+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c1f2f2a1-5acd-4559-b2b8-c5721bb619c8', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 21:56:03.376367+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('7f19f11c-877c-49fc-a813-c1a85da7d8c1', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-21 22:05:12.451418+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('14ba1811-f76a-4b60-acac-61e98bf4433a', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-21 22:16:38.609768+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b0f903c2-c8c0-4eaa-8bc8-08ece6f91063', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 12:14:55.858808+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a0a40f24-6bf1-4dc8-8265-bc141d955a78', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T13:30:54.959Z", "failed_attempts": 3}', 'warning', '2025-08-22 13:00:56.435132+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('09137da5-3982-4b70-bcd0-a926cc99904e', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T13:43:40.592Z", "failed_attempts": 3}', 'warning', '2025-08-22 13:13:42.073001+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5d72f062-645b-4ed3-a6ea-34675f64d6d1', 'ip_unblocked', '::1', NULL, NULL, '{"reason": "Manual unblock via script", "original_reason": "Too many failed login attempts"}', 'info', '2025-08-22 13:14:10.194+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('f1bf306e-60f7-49a4-bc98-616f55395513', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T13:44:25.975Z", "failed_attempts": 3}', 'warning', '2025-08-22 13:14:27.397353+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('02231e41-ea28-4634-b6bc-72ad78f0883c', 'ip_unblocked', '::1', NULL, NULL, '{"reason": "Manual unblock via script", "original_reason": "Too many failed login attempts"}', 'info', '2025-08-22 13:14:54.372+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4f2d686c-15eb-48cd-af4f-65981eae22c6', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T13:45:20.607Z", "failed_attempts": 3}', 'warning', '2025-08-22 13:15:22.066759+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('585e9fa9-1cab-40b8-9f5b-eb00677478a9', 'ip_unblocked', '::1', NULL, NULL, '{"reason": "Manual unblock via script", "original_reason": "Too many failed login attempts"}', 'info', '2025-08-22 13:20:51.461+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('2c7ad189-72c9-43e1-bad1-bd1db1188b44', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 13:22:56.508527+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('be4b1c50-b188-4cc4-ac5f-8bdb9afdd4e7', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 13:23:58.93058+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6b57ab91-aebf-4ccd-a62c-0d1688c4ccfc', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 13:48:59.917655+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('62866a4f-dc6c-4aef-9c64-5d7523947de8', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 13:50:11.771113+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('20eafb90-0ce5-4272-8fce-811823e65721', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 14:11:05.54058+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('1e50c611-6c83-4382-bfcb-e4bd446fdd6b', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 14:29:56.768395+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('5d4941f7-56c8-40cb-a0cf-1e0099b00153', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 14:44:32.777204+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('083d052b-eade-45fd-a2d7-e7352f9db257', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 15:06:10.940513+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('3b5a42b0-abc8-4859-9c15-58eeebfebc46', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 15:37:50.455339+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('b21bc1b9-45e5-4dbe-9068-192b6a9a6c3f', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 15:38:51.971963+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('6a0d7db0-88fa-4520-9182-49a70a873f4d', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T16:14:13.158Z", "failed_attempts": 3}', 'warning', '2025-08-22 15:44:14.361217+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('a8ef1014-440d-41d0-816b-28897380dbf9', 'ip_blocked', '::1', NULL, NULL, '{"reason": "Too many failed login attempts", "blocked_by": null, "blocked_until": "2025-08-22T16:15:06.190Z", "failed_attempts": 3}', 'warning', '2025-08-22 15:45:07.747043+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('78f51a8e-3056-4dac-acea-a893672707a5', 'ip_unblocked', '::1', NULL, NULL, '{"reason": "Manual unblock via script", "original_reason": "Too many failed login attempts"}', 'info', '2025-08-22 15:51:33.743+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('670d8400-5a5c-429f-9f6b-3a50f05669ad', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 15:55:30.423148+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('76dcfb83-e2c3-4fa6-a6d6-17fb33b74447', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 16:06:45.878714+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4f32cdf0-3958-4792-8cfd-a8c05f1c4251', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 18:43:48.51456+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c0321d17-9440-4243-bf9a-69d3cab4971c', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 19:48:40.195661+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('021810c3-f141-43f1-a38c-b3e5c7cb77c0', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 21:42:56.442818+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d6ef5d6b-25b4-41c9-b8ac-049a9067e5ab', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.100.3 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36"}', 'info', '2025-08-22 21:44:07.996908+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('d3a05524-8910-4193-9ffb-c8c5b9568750', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 21:54:44.808619+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('4157654f-a8d1-47ce-9ac9-386bba74cd93', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 21:55:20.321377+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('821c391f-9e2b-439e-acae-641d5422ea84', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 22:13:08.482745+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('dde0e667-f0f6-455a-bdbf-bd012c3bc428', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 22:22:14.944514+00');
INSERT INTO "public"."security_logs" ("id", "event_type", "ip_address", "user_id", "email", "details", "severity", "created_at") VALUES ('c1657271-4790-4223-940f-9d00133bf1bb', 'admin_login_success', '::1', 'a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx@biubiustar.com', '{"username": "wwx", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"}', 'info', '2025-08-22 22:28:40.892617+00');
COMMIT;

-- ----------------------------
-- Table structure for system_settings
-- ----------------------------
DROP TABLE IF EXISTS "public"."system_settings";
CREATE TABLE "public"."system_settings" (
  "id" int4 NOT NULL DEFAULT nextval('system_settings_id_seq'::regclass),
  "setting_key" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "setting_value" text COLLATE "pg_catalog"."default",
  "setting_type" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'string'::character varying,
  "category" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "is_public" bool DEFAULT false,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."system_settings" OWNER TO "postgres";

-- ----------------------------
-- Records of system_settings
-- ----------------------------
BEGIN;
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (9, 'allow_registration', '{"value":false,"type":"boolean","description":"允许用户注册","is_public":false}', 'boolean', 'user', '允许用户注册', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.935044+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (25, 'password_min_length', '{"value":0,"type":"number","description":"密码最小长度","is_public":false}', 'number', 'security', '密码最小长度', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.937743+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (35, 'notification_email_new_post', '{"value":false,"type":"boolean","description":"新帖子邮件通知","is_public":false}', 'boolean', 'notification', '新帖子邮件通知', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.015602+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (11, 'default_user_role', '{"value":"{\"value\":\"user\",\"type\":\"string\",\"description\":\"默认用户角色\",\"is_public\":false}","type":"string","description":"默认用户角色","is_public":false}', 'string', 'user', '默认用户角色', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.935246+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (4, 'site_favicon', '/uploads/site-favicon.png', 'string', 'basic', '网站Favicon URL', 't', '2025-08-14 18:48:51.109386+00', '2025-08-22 14:35:32.339432+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (37, 'cache_ttl', '{"value":0,"type":"number","description":"缓存过期时间(秒)","is_public":false}', 'number', 'cache', '缓存过期时间(秒)', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.958226+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (8, 'auto_detect_language', '{"value":false,"type":"boolean","description":"自动检测用户语言","is_public":true}', 'boolean', 'language', '自动检测用户语言', 't', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.097757+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (24, 'storage_path', '{"value":"{\"value\":\"uploads\",\"type\":\"string\",\"description\":\"存储路径\",\"is_public\":false}","type":"string","description":"存储路径","is_public":false}', 'string', 'storage', '存储路径', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.294188+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (28, 'password_require_numbers', '{"value":false,"type":"boolean","description":"密码需要数字","is_public":false}', 'boolean', 'security', '密码需要数字', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.075096+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (36, 'enable_cache', '{"value":false,"type":"boolean","description":"启用缓存","is_public":false}', 'boolean', 'cache', '启用缓存', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.909666+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (10, 'require_email_verification', '{"value":false,"type":"boolean","description":"需要邮箱验证","is_public":false}', 'boolean', 'user', '需要邮箱验证', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.611466+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (19, 'smtp_from_name', '{"value":"{\"value\":\"BiuBiuStar\",\"type\":\"string\",\"description\":\"发件人名称\",\"is_public\":false}","type":"string","description":"发件人名称","is_public":false}', 'string', 'email', '发件人名称', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.924127+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (7, 'supported_languages', '{"value":{"value":["zh-CN","zh-TW","en","vi"],"type":"json","description":"支持的语言列表","is_public":true},"type":"json","description":"支持的语言列表","is_public":true}', 'json', 'language', '支持的语言列表', 't', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.584044+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (29, 'password_require_symbols', '{"value":false,"type":"boolean","description":"密码需要特殊字符","is_public":false}', 'boolean', 'security', '密码需要特殊字符', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.970201+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (20, 'smtp_use_tls', '{"value":false,"type":"boolean","description":"使用TLS加密","is_public":false}', 'boolean', 'email', '使用TLS加密', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.939231+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (33, 'enable_system_notifications', '{"value":false,"type":"boolean","description":"启用系统通知","is_public":false}', 'boolean', 'notification', '启用系统通知', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.083257+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (16, 'smtp_username', '{"value":"{\"value\":\"\",\"type\":\"string\",\"description\":\"SMTP用户名\",\"is_public\":false}","type":"string","description":"SMTP用户名","is_public":false}', 'string', 'email', 'SMTP用户名', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.29797+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (23, 'allowed_file_types', '{"value":{"value":["jpg","jpeg","png","gif","pdf","doc","docx"],"type":"json","description":"允许的文件类型","is_public":false},"type":"json","description":"允许的文件类型","is_public":false}', 'json', 'storage', '允许的文件类型', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.043895+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (22, 'max_upload_size', '{"value":0,"type":"number","description":"最大上传大小(字节)","is_public":false}', 'number', 'storage', '最大上传大小(字节)', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:30.259816+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (14, 'smtp_host', '{"value":"{\"value\":\"\",\"type\":\"string\",\"description\":\"SMTP主机\",\"is_public\":false}","type":"string","description":"SMTP主机","is_public":false}', 'string', 'email', 'SMTP主机', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.100279+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (26, 'password_require_uppercase', '{"value":false,"type":"boolean","description":"密码需要大写字母","is_public":false}', 'boolean', 'security', '密码需要大写字母', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.939605+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (41, 'backup_retention_days', '{"value":0,"type":"number","description":"备份保留天数","is_public":false}', 'number', 'backup', '备份保留天数', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.523966+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (40, 'backup_frequency', '{"value":"{\"value\":\"daily\",\"type\":\"string\",\"description\":\"备份频率\",\"is_public\":false}","type":"string","description":"备份频率","is_public":false}', 'string', 'backup', '备份频率', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.945053+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (30, 'max_login_attempts', '{"value":0,"type":"number","description":"最大登录尝试次数","is_public":false}', 'number', 'security', '最大登录尝试次数', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.947773+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (27, 'password_require_lowercase', '{"value":false,"type":"boolean","description":"密码需要小写字母","is_public":false}', 'boolean', 'security', '密码需要小写字母', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.083617+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (38, 'cache_type', '{"value":"{\"value\":\"memory\",\"type\":\"string\",\"description\":\"缓存类型\",\"is_public\":false}","type":"string","description":"缓存类型","is_public":false}', 'string', 'cache', '缓存类型', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.953887+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (1, 'site_name', 'BiuBiuStar', 'string', 'basic', '网站名称', 't', '2025-08-14 18:48:51.109386+00', '2025-08-22 14:35:32.316719+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (12, 'max_posts_per_day', '{"value":0,"type":"number","description":"每日最大发帖数","is_public":false}', 'number', 'user', '每日最大发帖数', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.958211+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (17, 'smtp_password', '{"value":"{\"value\":\"\",\"type\":\"string\",\"description\":\"SMTP密码\",\"is_public\":false}","type":"string","description":"SMTP密码","is_public":false}', 'string', 'email', 'SMTP密码', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.971907+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (31, 'login_lockout_duration', '{"value":0,"type":"number","description":"登录锁定时长(秒)","is_public":false}', 'number', 'security', '登录锁定时长(秒)', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.055786+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (3, 'site_logo', '/uploads/site-logo.png', 'string', 'basic', '网站Logo URL', 't', '2025-08-14 18:48:51.109386+00', '2025-08-22 14:35:32.339412+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (42, 'backup_storage_path', '{"value":"{\"value\":\"backups\",\"type\":\"string\",\"description\":\"备份存储路径\",\"is_public\":false}","type":"string","description":"备份存储路径","is_public":false}', 'string', 'backup', '备份存储路径', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.06486+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (5, 'site_keywords', '社交平台,活动,社区,交友,兴趣', 'string', 'basic', '网站关键词', 't', '2025-08-14 18:48:51.109386+00', '2025-08-18 16:49:29.048276+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (13, 'max_file_size', '{"value":0,"type":"number","description":"最大文件大小(字节)","is_public":false}', 'number', 'user', '最大文件大小(字节)', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.90245+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (18, 'smtp_from_email', '{"value":"{\"value\":\"\",\"type\":\"string\",\"description\":\"发件人邮箱\",\"is_public\":false}","type":"string","description":"发件人邮箱","is_public":false}', 'string', 'email', '发件人邮箱', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.926695+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (32, 'enable_email_notifications', '{"value":false,"type":"boolean","description":"启用邮件通知","is_public":false}', 'boolean', 'notification', '启用邮件通知', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:28.94139+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (39, 'enable_auto_backup', '{"value":false,"type":"boolean","description":"启用自动备份","is_public":false}', 'boolean', 'backup', '启用自动备份', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.077751+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (34, 'notification_email_new_user', '{"value":false,"type":"boolean","description":"新用户注册邮件通知","is_public":false}', 'boolean', 'notification', '新用户注册邮件通知', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.089091+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (21, 'storage_provider', '{"value":"{\"value\":\"supabase\",\"type\":\"string\",\"description\":\"存储提供商\",\"is_public\":false}","type":"string","description":"存储提供商","is_public":false}', 'string', 'storage', '存储提供商', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.08297+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (15, 'smtp_port', '{"value":0,"type":"number","description":"SMTP端口","is_public":false}', 'number', 'email', 'SMTP端口', 'f', '2025-08-14 18:48:51.109386+00', '2025-08-15 16:43:29.286967+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (60, 'site_description_vi', 'Một nền tảng hoạt động xã hội hiện đại kết nối những người cùng chí hướng', 'text', 'basic', '站点描述（越南语）', 't', '2025-08-15 20:42:32.287973+00', '2025-08-22 14:35:32.386891+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (84, 'copyright', '© 2024 BiuBiuStar. All rights reserved.', 'string', 'basic', '版权信息', 't', '2025-08-18 16:49:29.048276+00', '2025-08-18 16:49:29.048276+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (85, 'icp_number', '', 'string', 'basic', 'ICP备案号', 't', '2025-08-18 16:49:29.048276+00', '2025-08-18 16:49:29.048276+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (46, 'tech_stack', '风之岚', 'string', 'basic', 'Setting: tech_stack', 't', '2025-08-15 18:47:50.445+00', '2025-08-15 18:48:29.565122+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (2, 'site_description', '', 'string', 'basic', '网站描述', 't', '2025-08-14 18:48:51.109386+00', '2025-08-22 14:35:32.089415+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (57, 'site_description_zh', '一个现代化的社交活动平台，连接志趣相投的人们', 'text', 'basic', '站点描述（简体中文）', 't', '2025-08-15 20:42:32.287973+00', '2025-08-22 14:35:32.333862+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (58, 'site_description_zh_tw', '一個現代化的社交活動平台，連接志趣相投的人們', 'text', 'basic', '站點描述（繁體中文）', 't', '2025-08-15 20:42:32.287973+00', '2025-08-22 14:35:32.34465+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (47, 'site_domain', 'localhost:51731', 'string', 'basic', 'Setting: site_domain', 't', '2025-08-15 18:47:50.445+00', '2025-08-22 14:35:32.348009+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (48, 'contact_email', 'contact@biubiustar.com', 'string', 'basic', 'Setting: contact_email', 't', '2025-08-15 18:47:50.445+00', '2025-08-22 14:35:32.357212+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (6, 'default_language', 'zh', 'string', 'basic', '默认语言', 't', '2025-08-14 18:48:51.109386+00', '2025-08-22 14:35:32.360834+00');
INSERT INTO "public"."system_settings" ("id", "setting_key", "setting_value", "setting_type", "category", "description", "is_public", "created_at", "updated_at") VALUES (59, 'site_description_en', 'A modern social activity platform connecting like-minded people', 'text', 'basic', '站点描述（英文）', 't', '2025-08-15 20:42:32.287973+00', '2025-08-22 14:35:32.366949+00');
COMMIT;

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."tags";
CREATE TABLE "public"."tags" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "color" varchar(7) COLLATE "pg_catalog"."default" DEFAULT '#8B5CF6'::character varying,
  "usage_count" int4 DEFAULT 0,
  "created_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."tags" OWNER TO "postgres";

-- ----------------------------
-- Records of tags
-- ----------------------------
BEGIN;
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('b9e25e35-f6bf-4dae-8a55-94e7e5f71f83', '技术', '#8B5CF6', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('9e4acb6a-a727-4220-9006-25d13df7abb9', '生活', '#A855F7', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('0afad003-d4bc-4240-a54c-8d95af133750', '娱乐', '#C084FC', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('8043ccc0-df42-4253-a531-301f011634de', '旅行', '#06B6D4', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('94c9d4ff-4616-4a64-b422-0aa6a619d871', '美食', '#10B981', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('d0c54ff0-7f0b-4fdb-b258-7833238214b0', '摄影', '#F59E0B', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('a06380e1-87db-41f1-9e22-1abf6e4a8a7c', '音乐', '#EF4444', 0, '2025-08-13 13:48:31.071427+00');
INSERT INTO "public"."tags" ("id", "name", "color", "usage_count", "created_at") VALUES ('d66454b6-ca41-4b24-914f-e90bb3a39f77', '运动', '#84CC16', 0, '2025-08-13 13:48:31.071427+00');
COMMIT;

-- ----------------------------
-- Table structure for user_profiles
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_profiles";
CREATE TABLE "public"."user_profiles" (
  "id" uuid NOT NULL,
  "username" varchar(50) COLLATE "pg_catalog"."default",
  "full_name" varchar(100) COLLATE "pg_catalog"."default",
  "avatar_url" text COLLATE "pg_catalog"."default",
  "bio" text COLLATE "pg_catalog"."default",
  "location" varchar(100) COLLATE "pg_catalog"."default",
  "website" varchar(255) COLLATE "pg_catalog"."default",
  "followers_count" int4 DEFAULT 0,
  "following_count" int4 DEFAULT 0,
  "posts_count" int4 DEFAULT 0,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now(),
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'active'::character varying,
  "role" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'user'::character varying,
  "email_verified" bool DEFAULT false,
  "last_login" timestamptz(6)
)
;
ALTER TABLE "public"."user_profiles" OWNER TO "postgres";
COMMENT ON TABLE "public"."user_profiles" IS 'Test admin user created for performance testing';

-- ----------------------------
-- Records of user_profiles
-- ----------------------------
BEGIN;
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('0aa62c81-2ff0-4afe-a298-fca6ba2dfd96', '11wwx123123123', '我想', '/api/avatar/default?username=11wwx123123123', '123 阿萨德阿萨德阿萨德阿萨德', '123', 'https://www.baidu.com/', 0, 0, 0, '2025-08-19 17:04:35.375313+00', '2025-08-19 17:08:49.481+00', 'active', 'user', 'f', '2025-08-19 17:05:38.082+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('37b2077a-9891-4b7e-8615-1ca23cc3e654', 'wwx564154', '', '/api/avatar/default?username=wwx564154', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 12:29:42.794835+00', '2025-08-19 12:29:42.794835+00', 'active', 'user', 'f', '2025-08-19 12:30:21.73+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('b2838c1c-1cae-4aa7-9474-ba734354e9fb', 'ww1x12', '', '/api/avatar/default?username=ww1x12', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 12:35:36.345577+00', '2025-08-19 12:35:36.345577+00', 'active', 'user', 'f', '2025-08-19 12:35:44.962+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('a1220bf8-94b5-4683-888d-3000cf57c009', 'admin', 'Administrator', '/api/avatar/default?username=admin', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 12:14:36.846272+00', '2025-08-19 12:14:36.846272+00', 'active', 'admin', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('00000000-0000-0000-0000-000000000001', 'admin1', 'admin', '/api/avatar/default?username=admin1', NULL, NULL, NULL, 0, 0, 0, '2025-08-20 22:51:25.634577+00', '2025-08-20 22:51:25.634577+00', 'active', 'admin', 't', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('262c3770-9016-491d-aec2-488fab73788a', 'dasdas211123', '123', 'http://localhost:3001/uploads/avatars/262c3770-9016-491d-aec2-488fab73788a-1755620610320-9fae91cb9857fa02.png', '123', '123', '', 0, 0, 0, '2025-08-19 16:13:10.475199+00', '2025-08-19 16:23:51.885+00', 'active', 'user', 'f', '2025-08-19 16:14:04.487+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('98f97ef6-ea06-4b22-b30f-dfa619968aee', 'ceshiyonghu', '', '/api/avatar/default?username=ceshiyonghu', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 16:25:21.337558+00', '2025-08-19 16:25:21.337558+00', 'active', 'user', 'f', '2025-08-19 16:25:36.355+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('c779a602-73b0-441e-a5eb-278b4173e07e', 'asdasd', '', '/api/avatar/default?username=asdasd', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 16:31:35.916693+00', '2025-08-19 16:31:35.916693+00', 'active', 'user', 'f', '2025-08-19 16:31:47.726+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('4234f544-ff1d-4f39-bf66-d49653ad5d72', 'aaa23123123', '', '/api/avatar/default?username=aaa23123123', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 17:05:28.458127+00', '2025-08-19 17:05:28.458127+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('b4b8b3bf-34c1-4974-9f5a-ef3965396e8d', 'wwx2123', 'www', '/api/avatar/default?username=wwx2123', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 17:48:30.132492+00', '2025-08-14 17:48:30.132492+00', 'active', 'admin', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('a81ba5bd-a477-4039-9ae3-2154b51fc2bb', 'wwx2', '', '/api/avatar/default?username=wwx2', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 17:56:56.457917+00', '2025-08-14 17:56:56.457917+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('0235e526-c7b1-416b-a9f5-a9ba7d5313dd', 'wwx3', '', '/api/avatar/default?username=wwx3', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 18:25:09.021888+00', '2025-08-14 18:25:09.021888+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('f4c9f2ef-58b0-489b-bc78-f1c846d21a53', 'wwx33', 'qweqwe', '/api/avatar/default?username=wwx33', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 18:27:56.636125+00', '2025-08-14 18:27:56.636125+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('53fb564d-201c-4014-baab-e31a750baec9', 'wwx44', '', '/api/avatar/default?username=wwx44', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 18:28:52.085233+00', '2025-08-14 20:39:51.62+00', 'active', 'user', 'f', '2025-08-14 20:40:21.477+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('cfb471a9-1773-455b-bd4b-ec3efd93cc8b', 'wwx2123123123', 'qweqwe', '/api/avatar/default?username=wwx2123123123', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 17:52:01.683416+00', '2025-08-15 20:59:46.243+00', 'suspended', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('0df951c2-88b1-43ca-a8e0-914f896f6094', 'qweqwe', '', '/api/avatar/default?username=qweqwe', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 16:39:22.631235+00', '2025-08-14 16:39:22.631235+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('ce98c077-0353-49a3-8624-83aad12fdfa2', 'testuser1755190008440', 'Test User 1755190008440', '/api/avatar/default?username=testuser1755190008440', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 16:46:54.564473+00', '2025-08-14 16:46:54.564473+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('5f8498da-e0d4-4818-945a-3d123782168b', '阿阿', '问问', '/api/avatar/default?username=\351\230\277\351\230\277', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 16:50:13.504847+00', '2025-08-14 16:50:13.504847+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('69a793ab-03ca-46f6-9bab-31d6e0556af7', '阿阿阿阿', '1qweqwe', '/api/avatar/default?username=\351\230\277\351\230\277\351\230\277\351\230\277', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 16:54:45.478399+00', '2025-08-14 16:54:45.478399+00', 'active', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('fedf58ec-0a83-49e8-8e38-cb59fafd2d79', 'wwx1', '', '/api/avatar/default?username=wwx1', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 17:19:56.407397+00', '2025-08-14 17:30:09.385+00', 'suspended', 'user', 'f', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('8c41749f-76a0-43b8-bf49-2b1da24b586f', '123123', '123 啊啊', '/api/avatar/default?username=wwx1231231123dss', '阿是的啊的', '', '', 0, 0, 0, '2025-08-21 22:50:38.217+00', '2025-08-21 22:52:01.547+00', 'active', 'user', 'f', '2025-08-22 12:13:45.232+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('7b234871-801d-4385-957d-e365db0e1039', 'testadmin', 'Test Administrator', '/api/avatar/default?username=testadmin', NULL, NULL, NULL, 0, 0, 0, '2025-08-14 16:45:50.47139+00', '2025-08-14 16:45:50.47139+00', 'active', 'admin', 't', NULL);
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('a8a5172d-6aa1-49a1-8d9f-9dd5db111094', 'wwx', '阿阿阿阿111', 'http://localhost:3001/uploads/avatars/a8a5172d-6aa1-49a1-8d9f-9dd5db111094-1755801403101-d103f80c82c709fa.png', '12312323 阿阿', '123', '123', 0, 0, 0, '2025-08-14 15:39:33.692699+00', '2025-08-22 16:02:16.122589+00', 'active', 'admin', 't', '2025-08-22 18:43:19.333+00');
INSERT INTO "public"."user_profiles" ("id", "username", "full_name", "avatar_url", "bio", "location", "website", "followers_count", "following_count", "posts_count", "created_at", "updated_at", "status", "role", "email_verified", "last_login") VALUES ('1e7989c6-8127-422a-9bed-770cea4e43a9', '11wwx123123', '', '/api/avatar/default?username=11wwx123123', NULL, NULL, NULL, 0, 0, 0, '2025-08-19 16:59:22.740409+00', '2025-08-19 16:59:22.740409+00', 'active', 'user', 'f', '2025-08-22 22:01:34.424+00');
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password_hash" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "avatar_url" text COLLATE "pg_catalog"."default",
  "bio" text COLLATE "pg_catalog"."default",
  "language" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'vi'::character varying,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'active'::character varying,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;
ALTER TABLE "public"."users" OWNER TO "postgres";

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Function structure for auto_analyze_posts
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."auto_analyze_posts"();
CREATE FUNCTION "public"."auto_analyze_posts"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
    random_chance float;
BEGIN
    -- 随机触发统计信息更新（1%概率），避免频繁更新
    SELECT random() INTO random_chance;
    
    IF random_chance < 0.01 THEN
        -- 异步执行ANALYZE，不阻塞当前事务
        PERFORM pg_notify('analyze_posts', 'trigger');
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."auto_analyze_posts"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for cleanup_old_security_records
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."cleanup_old_security_records"();
CREATE FUNCTION "public"."cleanup_old_security_records"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
  -- 删除30天前的登录尝试记录
  DELETE FROM login_attempts 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 删除90天前的安全日志
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- 自动解锁过期的IP黑名单（非永久封禁）
  UPDATE ip_blacklist 
  SET blocked_until = NULL,
      updated_at = NOW()
  WHERE blocked_until IS NOT NULL 
    AND blocked_until < NOW() 
    AND is_permanent = FALSE;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."cleanup_old_security_records"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for create_sample_data_for_user
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."create_sample_data_for_user"("user_id" uuid);
CREATE FUNCTION "public"."create_sample_data_for_user"("user_id" uuid)
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
  -- 这个函数可以在用户注册后调用，创建该用户的示例数据
  -- 包括示例帖子、活动等
  -- 具体实现可以在应用程序中完成
  RAISE NOTICE '示例数据创建函数已准备就绪，用户ID: %', user_id;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."create_sample_data_for_user"("user_id" uuid) OWNER TO "postgres";

-- ----------------------------
-- Function structure for get_posts_count_estimate
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."get_posts_count_estimate"();
CREATE FUNCTION "public"."get_posts_count_estimate"()
  RETURNS "pg_catalog"."int8" AS $BODY$
DECLARE
    estimated_count bigint;
    actual_count bigint;
BEGIN
    -- 从pg_class获取统计信息估算
    SELECT reltuples::bigint
    INTO estimated_count
    FROM pg_class
    WHERE relname = 'posts'
    AND relkind = 'r';
    
    -- 如果估算值为0或null，说明统计信息过期，返回null让应用使用精确计数
    IF estimated_count IS NULL OR estimated_count = 0 THEN
        RETURN NULL;
    END IF;
    
    -- 如果估算值小于1000，使用精确计数（性能影响较小）
    IF estimated_count < 1000 THEN
        SELECT COUNT(*) INTO actual_count FROM posts;
        RETURN actual_count;
    END IF;
    
    -- 对于大数据集，返回估算值
    RETURN estimated_count;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;
ALTER FUNCTION "public"."get_posts_count_estimate"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_posts_count_estimate"() IS '获取帖子数量的快速估算，使用PostgreSQL统计信息';

-- ----------------------------
-- Function structure for get_posts_count_smart
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."get_posts_count_smart"();
CREATE FUNCTION "public"."get_posts_count_smart"()
  RETURNS TABLE("count_value" int8, "is_estimate" bool) AS $BODY$
DECLARE
    estimated_count bigint;
    actual_count bigint;
BEGIN
    -- 获取估算值
    SELECT get_posts_count_estimate() INTO estimated_count;
    
    -- 如果估算值为null或小于阈值，使用精确计数
    IF estimated_count IS NULL OR estimated_count < 1000 THEN
        SELECT COUNT(*) INTO actual_count FROM posts;
        RETURN QUERY SELECT actual_count, false;
    ELSE
        -- 返回估算值
        RETURN QUERY SELECT estimated_count, true;
    END IF;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100
  ROWS 1000;
ALTER FUNCTION "public"."get_posts_count_smart"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_posts_count_smart"() IS '智能计数函数，自动选择精确计数或估算';

-- ----------------------------
-- Function structure for gin_extract_query_trgm
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gin_extract_query_trgm"(text, internal, int2, internal, internal, internal, internal);
CREATE FUNCTION "public"."gin_extract_query_trgm"(text, internal, int2, internal, internal, internal, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gin_extract_query_trgm'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gin_extract_query_trgm"(text, internal, int2, internal, internal, internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gin_extract_value_trgm
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gin_extract_value_trgm"(text, internal);
CREATE FUNCTION "public"."gin_extract_value_trgm"(text, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gin_extract_value_trgm'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gin_extract_value_trgm"(text, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gin_trgm_consistent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gin_trgm_consistent"(internal, int2, text, int4, internal, internal, internal, internal);
CREATE FUNCTION "public"."gin_trgm_consistent"(internal, int2, text, int4, internal, internal, internal, internal)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'gin_trgm_consistent'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gin_trgm_consistent"(internal, int2, text, int4, internal, internal, internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gin_trgm_triconsistent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gin_trgm_triconsistent"(internal, int2, text, int4, internal, internal, internal);
CREATE FUNCTION "public"."gin_trgm_triconsistent"(internal, int2, text, int4, internal, internal, internal)
  RETURNS "pg_catalog"."char" AS '$libdir/pg_trgm', 'gin_trgm_triconsistent'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gin_trgm_triconsistent"(internal, int2, text, int4, internal, internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_compress
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_compress"(internal);
CREATE FUNCTION "public"."gtrgm_compress"(internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gtrgm_compress'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_compress"(internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_consistent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_consistent"(internal, text, int2, oid, internal);
CREATE FUNCTION "public"."gtrgm_consistent"(internal, text, int2, oid, internal)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'gtrgm_consistent'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_consistent"(internal, text, int2, oid, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_decompress
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_decompress"(internal);
CREATE FUNCTION "public"."gtrgm_decompress"(internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gtrgm_decompress'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_decompress"(internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_distance
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_distance"(internal, text, int2, oid, internal);
CREATE FUNCTION "public"."gtrgm_distance"(internal, text, int2, oid, internal)
  RETURNS "pg_catalog"."float8" AS '$libdir/pg_trgm', 'gtrgm_distance'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_distance"(internal, text, int2, oid, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_in
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_in"(cstring);
CREATE FUNCTION "public"."gtrgm_in"(cstring)
  RETURNS "public"."gtrgm" AS '$libdir/pg_trgm', 'gtrgm_in'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_in"(cstring) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_options
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_options"(internal);
CREATE FUNCTION "public"."gtrgm_options"(internal)
  RETURNS "pg_catalog"."void" AS '$libdir/pg_trgm', 'gtrgm_options'
  LANGUAGE c IMMUTABLE
  COST 1;
ALTER FUNCTION "public"."gtrgm_options"(internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_out
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_out"("public"."gtrgm");
CREATE FUNCTION "public"."gtrgm_out"("public"."gtrgm")
  RETURNS "pg_catalog"."cstring" AS '$libdir/pg_trgm', 'gtrgm_out'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_out"("public"."gtrgm") OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_penalty
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_penalty"(internal, internal, internal);
CREATE FUNCTION "public"."gtrgm_penalty"(internal, internal, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gtrgm_penalty'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_penalty"(internal, internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_picksplit
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_picksplit"(internal, internal);
CREATE FUNCTION "public"."gtrgm_picksplit"(internal, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gtrgm_picksplit'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_picksplit"(internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_same
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", internal);
CREATE FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/pg_trgm', 'gtrgm_same'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for gtrgm_union
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."gtrgm_union"(internal, internal);
CREATE FUNCTION "public"."gtrgm_union"(internal, internal)
  RETURNS "public"."gtrgm" AS '$libdir/pg_trgm', 'gtrgm_union'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."gtrgm_union"(internal, internal) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for handle_new_user
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."handle_new_user"();
CREATE FUNCTION "public"."handle_new_user"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  default_avatar_url TEXT;
BEGIN
  -- 获取基础用户名
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  
  -- 检查用户名是否已存在，如果存在则添加数字后缀
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- 生成默认头像URL
  default_avatar_url := '/api/avatar/default?username=' || encode(final_username::bytea, 'escape');
  
  INSERT INTO public.user_profiles (
    id, 
    username, 
    full_name, 
    avatar_url,
    followers_count, 
    following_count, 
    posts_count
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_avatar_url,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for refresh_posts_stats
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."refresh_posts_stats"();
CREATE FUNCTION "public"."refresh_posts_stats"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    -- 更新posts表的统计信息
    ANALYZE posts;
    
    -- 记录更新时间（可选）
    RAISE NOTICE 'Posts table statistics updated at %', NOW();
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;
ALTER FUNCTION "public"."refresh_posts_stats"() OWNER TO "postgres";
COMMENT ON FUNCTION "public"."refresh_posts_stats"() IS '手动刷新posts表的统计信息';

-- ----------------------------
-- Function structure for set_limit
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."set_limit"(float4);
CREATE FUNCTION "public"."set_limit"(float4)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'set_limit'
  LANGUAGE c VOLATILE STRICT
  COST 1;
ALTER FUNCTION "public"."set_limit"(float4) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for show_limit
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."show_limit"();
CREATE FUNCTION "public"."show_limit"()
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'show_limit'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."show_limit"() OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for show_trgm
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."show_trgm"(text);
CREATE FUNCTION "public"."show_trgm"(text)
  RETURNS "pg_catalog"."_text" AS '$libdir/pg_trgm', 'show_trgm'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."show_trgm"(text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for similarity
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."similarity"(text, text);
CREATE FUNCTION "public"."similarity"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'similarity'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."similarity"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for similarity_dist
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."similarity_dist"(text, text);
CREATE FUNCTION "public"."similarity_dist"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'similarity_dist'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."similarity_dist"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for similarity_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."similarity_op"(text, text);
CREATE FUNCTION "public"."similarity_op"(text, text)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'similarity_op'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."similarity_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for strict_word_similarity
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."strict_word_similarity"(text, text);
CREATE FUNCTION "public"."strict_word_similarity"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'strict_word_similarity'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."strict_word_similarity"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for strict_word_similarity_commutator_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."strict_word_similarity_commutator_op"(text, text);
CREATE FUNCTION "public"."strict_word_similarity_commutator_op"(text, text)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'strict_word_similarity_commutator_op'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."strict_word_similarity_commutator_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for strict_word_similarity_dist_commutator_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."strict_word_similarity_dist_commutator_op"(text, text);
CREATE FUNCTION "public"."strict_word_similarity_dist_commutator_op"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'strict_word_similarity_dist_commutator_op'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."strict_word_similarity_dist_commutator_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for strict_word_similarity_dist_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."strict_word_similarity_dist_op"(text, text);
CREATE FUNCTION "public"."strict_word_similarity_dist_op"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'strict_word_similarity_dist_op'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."strict_word_similarity_dist_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for strict_word_similarity_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."strict_word_similarity_op"(text, text);
CREATE FUNCTION "public"."strict_word_similarity_op"(text, text)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'strict_word_similarity_op'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."strict_word_similarity_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for update_activity_participants_count
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_activity_participants_count"();
CREATE FUNCTION "public"."update_activity_participants_count"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activities SET current_participants = current_participants + 1 WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activities SET current_participants = current_participants - 1 WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_activity_participants_count"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_cache_configs_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_cache_configs_updated_at"();
CREATE FUNCTION "public"."update_cache_configs_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_cache_configs_updated_at"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_post_comments_count
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_post_comments_count"();
CREATE FUNCTION "public"."update_post_comments_count"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_post_comments_count"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_post_likes_count
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_post_likes_count"();
CREATE FUNCTION "public"."update_post_likes_count"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_post_likes_count"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_system_settings_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_system_settings_updated_at"();
CREATE FUNCTION "public"."update_system_settings_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_system_settings_updated_at"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_updated_at_column
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_updated_at_column"();
CREATE FUNCTION "public"."update_updated_at_column"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for update_user_follow_counts
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_user_follow_counts"();
CREATE FUNCTION "public"."update_user_follow_counts"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE user_profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE user_profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_user_follow_counts"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for word_similarity
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."word_similarity"(text, text);
CREATE FUNCTION "public"."word_similarity"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'word_similarity'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."word_similarity"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for word_similarity_commutator_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."word_similarity_commutator_op"(text, text);
CREATE FUNCTION "public"."word_similarity_commutator_op"(text, text)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'word_similarity_commutator_op'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."word_similarity_commutator_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for word_similarity_dist_commutator_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."word_similarity_dist_commutator_op"(text, text);
CREATE FUNCTION "public"."word_similarity_dist_commutator_op"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'word_similarity_dist_commutator_op'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."word_similarity_dist_commutator_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for word_similarity_dist_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."word_similarity_dist_op"(text, text);
CREATE FUNCTION "public"."word_similarity_dist_op"(text, text)
  RETURNS "pg_catalog"."float4" AS '$libdir/pg_trgm', 'word_similarity_dist_op'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."word_similarity_dist_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Function structure for word_similarity_op
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."word_similarity_op"(text, text);
CREATE FUNCTION "public"."word_similarity_op"(text, text)
  RETURNS "pg_catalog"."bool" AS '$libdir/pg_trgm', 'word_similarity_op'
  LANGUAGE c STABLE STRICT
  COST 1;
ALTER FUNCTION "public"."word_similarity_op"(text, text) OWNER TO "supabase_admin";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."system_settings_id_seq"
OWNED BY "public"."system_settings"."id";
SELECT setval('"public"."system_settings_id_seq"', 86, true);

-- ----------------------------
-- Indexes structure for table activities
-- ----------------------------
CREATE INDEX "idx_activities_start_date" ON "public"."activities" USING btree (
  "start_date" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table activities
-- ----------------------------
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table activity_categories
-- ----------------------------
CREATE TRIGGER "update_activity_categories_updated_at" BEFORE UPDATE ON "public"."activity_categories"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_updated_at_column"();

-- ----------------------------
-- Uniques structure for table activity_categories
-- ----------------------------
ALTER TABLE "public"."activity_categories" ADD CONSTRAINT "activity_categories_name_key" UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table activity_categories
-- ----------------------------
ALTER TABLE "public"."activity_categories" ADD CONSTRAINT "activity_categories_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table activity_logs
-- ----------------------------
CREATE INDEX "idx_activity_logs_action" ON "public"."activity_logs" USING btree (
  "action" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_activity_logs_type" ON "public"."activity_logs" USING btree (
  "type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table activity_logs
-- ----------------------------
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table activity_participants
-- ----------------------------
CREATE INDEX "idx_activity_participants_activity_id" ON "public"."activity_participants" USING btree (
  "activity_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table activity_participants
-- ----------------------------
CREATE TRIGGER "trigger_update_activity_participants_count" AFTER INSERT OR DELETE ON "public"."activity_participants"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_activity_participants_count"();

-- ----------------------------
-- Uniques structure for table activity_participants
-- ----------------------------
ALTER TABLE "public"."activity_participants" ADD CONSTRAINT "activity_participants_activity_id_user_id_key" UNIQUE ("activity_id", "user_id");

-- ----------------------------
-- Primary Key structure for table activity_participants
-- ----------------------------
ALTER TABLE "public"."activity_participants" ADD CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table cache_configs
-- ----------------------------
CREATE INDEX "idx_cache_configs_cache_type" ON "public"."cache_configs" USING btree (
  "cache_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_cache_configs_enabled" ON "public"."cache_configs" USING btree (
  "enabled" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table cache_configs
-- ----------------------------
CREATE TRIGGER "trigger_cache_configs_updated_at" BEFORE UPDATE ON "public"."cache_configs"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_cache_configs_updated_at"();

-- ----------------------------
-- Uniques structure for table cache_configs
-- ----------------------------
ALTER TABLE "public"."cache_configs" ADD CONSTRAINT "cache_configs_cache_type_key" UNIQUE ("cache_type");

-- ----------------------------
-- Primary Key structure for table cache_configs
-- ----------------------------
ALTER TABLE "public"."cache_configs" ADD CONSTRAINT "cache_configs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table comments
-- ----------------------------
CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING btree (
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table comments
-- ----------------------------
CREATE TRIGGER "trigger_update_post_comments_count" AFTER INSERT OR DELETE ON "public"."comments"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_post_comments_count"();

-- ----------------------------
-- Primary Key structure for table comments
-- ----------------------------
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table contact_forms
-- ----------------------------
CREATE INDEX "idx_contact_forms_created_at" ON "public"."contact_forms" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_contact_forms_status" ON "public"."contact_forms" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Checks structure for table contact_forms
-- ----------------------------
ALTER TABLE "public"."contact_forms" ADD CONSTRAINT "contact_forms_status_check" CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table contact_forms
-- ----------------------------
ALTER TABLE "public"."contact_forms" ADD CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table contact_submissions
-- ----------------------------
CREATE INDEX "idx_contact_submissions_email" ON "public"."contact_submissions" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_contact_submissions_status" ON "public"."contact_submissions" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_contact_submissions_submitted_at" ON "public"."contact_submissions" USING btree (
  "submitted_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Checks structure for table contact_submissions
-- ----------------------------
ALTER TABLE "public"."contact_submissions" ADD CONSTRAINT "contact_submissions_status_check" CHECK (status::text = ANY (ARRAY['pending'::character varying, 'read'::character varying, 'replied'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table contact_submissions
-- ----------------------------
ALTER TABLE "public"."contact_submissions" ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table content_categories
-- ----------------------------
CREATE INDEX "idx_content_categories_sort_order" ON "public"."content_categories" USING btree (
  "sort_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table content_categories
-- ----------------------------
ALTER TABLE "public"."content_categories" ADD CONSTRAINT "content_categories_name_key" UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table content_categories
-- ----------------------------
ALTER TABLE "public"."content_categories" ADD CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table follows
-- ----------------------------
CREATE INDEX "idx_follows_follower_id" ON "public"."follows" USING btree (
  "follower_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_follows_following_id" ON "public"."follows" USING btree (
  "following_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table follows
-- ----------------------------
CREATE TRIGGER "trigger_update_user_follow_counts" AFTER INSERT OR DELETE ON "public"."follows"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_user_follow_counts"();

-- ----------------------------
-- Uniques structure for table follows
-- ----------------------------
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");

-- ----------------------------
-- Checks structure for table follows
-- ----------------------------
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_self_check" CHECK (follower_id <> following_id);

-- ----------------------------
-- Primary Key structure for table follows
-- ----------------------------
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ip_blacklist
-- ----------------------------
CREATE INDEX "idx_ip_blacklist_blocked_until" ON "public"."ip_blacklist" USING btree (
  "blocked_until" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ip_blacklist_ip" ON "public"."ip_blacklist" USING btree (
  "ip_address" "pg_catalog"."inet_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table ip_blacklist
-- ----------------------------
CREATE TRIGGER "update_ip_blacklist_updated_at" BEFORE UPDATE ON "public"."ip_blacklist"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_updated_at_column"();

-- ----------------------------
-- Uniques structure for table ip_blacklist
-- ----------------------------
ALTER TABLE "public"."ip_blacklist" ADD CONSTRAINT "ip_blacklist_ip_address_key" UNIQUE ("ip_address");

-- ----------------------------
-- Primary Key structure for table ip_blacklist
-- ----------------------------
ALTER TABLE "public"."ip_blacklist" ADD CONSTRAINT "ip_blacklist_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table likes
-- ----------------------------
CREATE INDEX "idx_likes_post_id" ON "public"."likes" USING btree (
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_likes_user_id" ON "public"."likes" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table likes
-- ----------------------------
CREATE TRIGGER "trigger_update_post_likes_count" AFTER INSERT OR DELETE ON "public"."likes"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_post_likes_count"();

-- ----------------------------
-- Uniques structure for table likes
-- ----------------------------
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_user_id_post_id_key" UNIQUE ("user_id", "post_id");
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_user_id_comment_id_key" UNIQUE ("user_id", "comment_id");

-- ----------------------------
-- Checks structure for table likes
-- ----------------------------
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_target_check" CHECK (post_id IS NOT NULL AND comment_id IS NULL OR post_id IS NULL AND comment_id IS NOT NULL);

-- ----------------------------
-- Primary Key structure for table likes
-- ----------------------------
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table login_attempts
-- ----------------------------
CREATE INDEX "idx_login_attempts_email_time" ON "public"."login_attempts" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "attempt_time" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_login_attempts_ip_time" ON "public"."login_attempts" USING btree (
  "ip_address" "pg_catalog"."inet_ops" ASC NULLS LAST,
  "attempt_time" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table login_attempts
-- ----------------------------
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table media_files
-- ----------------------------
CREATE INDEX "idx_media_files_display_order" ON "public"."media_files" USING btree (
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "display_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "idx_media_files_post_display" ON "public"."media_files" USING btree (
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "display_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."idx_media_files_post_display" IS '媒体文件关联查询索引：按帖子ID和显示顺序';
CREATE INDEX "idx_media_files_post_id" ON "public"."media_files" USING btree (
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "idx_media_files_type" ON "public"."media_files" USING btree (
  "file_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "post_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table media_files
-- ----------------------------
ALTER TABLE "public"."media_files" ADD CONSTRAINT "unique_post_display_order" UNIQUE ("post_id", "display_order");

-- ----------------------------
-- Checks structure for table media_files
-- ----------------------------
ALTER TABLE "public"."media_files" ADD CONSTRAINT "check_display_order" CHECK (display_order >= 0 AND display_order <= 8);
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_file_type_check" CHECK (file_type::text = ANY (ARRAY['image'::character varying, 'video'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table media_files
-- ----------------------------
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table post_tags
-- ----------------------------
ALTER TABLE "public"."post_tags" ADD CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id", "tag_id");

-- ----------------------------
-- Indexes structure for table posts
-- ----------------------------
CREATE INDEX "idx_posts_admin_list" ON "public"."posts" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST,
  "id" "pg_catalog"."uuid_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_posts_admin_list" IS '管理后台帖子列表主查询索引：按创建时间倒序';
CREATE INDEX "idx_posts_category" ON "public"."posts" USING btree (
  "category" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_posts_comments_desc" ON "public"."posts" USING btree (
  "comments_count" "pg_catalog"."int4_ops" DESC NULLS FIRST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
) WHERE is_published = true;
CREATE INDEX "idx_posts_content_gin" ON "public"."posts" USING gin (
  to_tsvector('english'::regconfig, content) "pg_catalog"."tsvector_ops"
);
CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_posts_likes_desc" ON "public"."posts" USING btree (
  "likes_count" "pg_catalog"."int4_ops" DESC NULLS FIRST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
) WHERE is_published = true;
CREATE INDEX "idx_posts_published_stats" ON "public"."posts" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
) WHERE is_published = true;
COMMENT ON INDEX "public"."idx_posts_published_stats" IS '已发布帖子统计索引：减少索引大小的部分索引';
CREATE INDEX "idx_posts_status" ON "public"."posts" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_posts_status_created" ON "public"."posts" USING btree (
  "is_published" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_posts_status_created" IS '帖子状态筛选索引：按发布状态和创建时间';
CREATE INDEX "idx_posts_status_created_at" ON "public"."posts" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_posts_title_gin" ON "public"."posts" USING gin (
  to_tsvector('english'::regconfig, title::text) "pg_catalog"."tsvector_ops"
);
CREATE INDEX "idx_posts_user_created" ON "public"."posts" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_posts_user_created" IS '用户帖子查询索引：按用户ID和创建时间';
CREATE INDEX "idx_posts_user_id" ON "public"."posts" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table posts
-- ----------------------------
CREATE TRIGGER "trigger_auto_analyze_posts" AFTER INSERT OR UPDATE OR DELETE ON "public"."posts"
FOR EACH ROW
EXECUTE PROCEDURE "public"."auto_analyze_posts"();

-- ----------------------------
-- Checks structure for table posts
-- ----------------------------
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_status_check" CHECK (status::text = ANY (ARRAY['pending'::character varying, 'published'::character varying, 'rejected'::character varying, 'draft'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table posts
-- ----------------------------
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table security_logs
-- ----------------------------
CREATE INDEX "idx_security_logs_ip_time" ON "public"."security_logs" USING btree (
  "ip_address" "pg_catalog"."inet_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_security_logs_type_time" ON "public"."security_logs" USING btree (
  "event_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table security_logs
-- ----------------------------
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table system_settings
-- ----------------------------
CREATE INDEX "idx_system_settings_category" ON "public"."system_settings" USING btree (
  "category" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_system_settings_is_public" ON "public"."system_settings" USING btree (
  "is_public" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_system_settings_key" ON "public"."system_settings" USING btree (
  "setting_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table system_settings
-- ----------------------------
CREATE TRIGGER "trigger_update_system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_system_settings_updated_at"();

-- ----------------------------
-- Uniques structure for table system_settings
-- ----------------------------
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");

-- ----------------------------
-- Primary Key structure for table system_settings
-- ----------------------------
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table tags
-- ----------------------------
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_name_key" UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table tags
-- ----------------------------
ALTER TABLE "public"."tags" ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table user_profiles
-- ----------------------------
CREATE INDEX "idx_user_profiles_active_stats" ON "public"."user_profiles" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST,
  "posts_count" "pg_catalog"."int4_ops" DESC NULLS FIRST
) WHERE status::text = 'active'::text;
COMMENT ON INDEX "public"."idx_user_profiles_active_stats" IS '活跃用户统计索引：减少索引大小的部分索引';
CREATE INDEX "idx_user_profiles_admin_info" ON "public"."user_profiles" USING btree (
  "id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."idx_user_profiles_admin_info" IS '用户信息覆盖索引：包含管理后台常用字段';
CREATE INDEX "idx_user_profiles_admin_info_cover" ON "public"."user_profiles" USING btree (
  "id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."idx_user_profiles_admin_info_cover" IS '用户信息覆盖索引：避免回表查询';
CREATE INDEX "idx_user_profiles_admin_list" ON "public"."user_profiles" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST,
  "id" "pg_catalog"."uuid_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_user_profiles_admin_list" IS '管理后台用户列表主查询索引：按创建时间倒序';
CREATE INDEX "idx_user_profiles_email_verified" ON "public"."user_profiles" USING btree (
  "email_verified" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_user_profiles_fullname_search" ON "public"."user_profiles" USING btree (
  "full_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_pattern_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."idx_user_profiles_fullname_search" IS '全名搜索索引：支持ILIKE模糊搜索';
CREATE INDEX "idx_user_profiles_recent_login" ON "public"."user_profiles" USING btree (
  "last_login" "pg_catalog"."timestamptz_ops" DESC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
) WHERE last_login IS NOT NULL;
CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING btree (
  "role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_user_profiles_role_created" ON "public"."user_profiles" USING btree (
  "role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_user_profiles_role_created" IS '角色筛选索引：按角色和创建时间';
CREATE INDEX "idx_user_profiles_search_role" ON "public"."user_profiles" USING btree (
  "role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "full_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_user_profiles_search_status" ON "public"."user_profiles" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "full_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_user_profiles_status" ON "public"."user_profiles" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_user_profiles_status_created" ON "public"."user_profiles" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_user_profiles_status_created" IS '状态筛选索引：按状态和创建时间';
CREATE INDEX "idx_user_profiles_status_role_created" ON "public"."user_profiles" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
COMMENT ON INDEX "public"."idx_user_profiles_status_role_created" IS '状态角色组合筛选索引：支持多条件筛选';
CREATE INDEX "idx_user_profiles_username_search" ON "public"."user_profiles" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_pattern_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."idx_user_profiles_username_search" IS '用户名搜索索引：支持ILIKE模糊搜索';

-- ----------------------------
-- Uniques structure for table user_profiles
-- ----------------------------
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_username_key" UNIQUE ("username");

-- ----------------------------
-- Checks structure for table user_profiles
-- ----------------------------
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_role_check" CHECK (role::text = ANY (ARRAY['user'::character varying, 'moderator'::character varying, 'admin'::character varying]::text[]));
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_status_check" CHECK (status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying, 'banned'::character varying, 'pending'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table user_profiles
-- ----------------------------
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE INDEX "idx_users_email" ON "public"."users" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_users_status" ON "public"."users" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_users_username" ON "public"."users" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");

-- ----------------------------
-- Checks structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_status_check" CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'banned'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table activities
-- ----------------------------
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."activity_categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table activity_logs
-- ----------------------------
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table activity_participants
-- ----------------------------
ALTER TABLE "public"."activity_participants" ADD CONSTRAINT "activity_participants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."activity_participants" ADD CONSTRAINT "activity_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table comments
-- ----------------------------
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table follows
-- ----------------------------
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table likes
-- ----------------------------
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table media_files
-- ----------------------------
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table post_tags
-- ----------------------------
ALTER TABLE "public"."post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table posts
-- ----------------------------
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table user_profiles
-- ----------------------------
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
