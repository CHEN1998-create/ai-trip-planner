/**
 * 本应用在共享 Supabase 项目中的唯一标识。
 * 注册时写入 user_metadata.app，数据库触发器据此决定是否建立 trip 成员身份；
 * 必须与 supabase/migrations 中触发器判断的字符串完全一致。
 */
export const APP_KEY = "trip-planner";

/** 本应用独立的 Postgres schema（与同项目其他 app 逻辑隔离） */
export const APP_SCHEMA = "trip";
