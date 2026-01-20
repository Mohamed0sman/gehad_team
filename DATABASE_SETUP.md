# إعداد قاعدة البيانات - Database Setup

## المشكلة الحالية
التطبيق يحاول الوصول إلى جداول غير موجودة في قاعدة البيانات، مما يسبب خطأ "Failed to load boards".

## الحل

### 1. إعداد Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. أنشئ مشروع جديد
4. انتظر حتى يكتمل إعداد المشروع

### 2. إنشاء الجداول
1. في لوحة تحكم Supabase، اذهب إلى **SQL Editor**
2. انسخ محتوى ملف `database-setup.sql` والصقه في المحرر
3. اضغط **Run** لتنفيذ الأوامر

### 3. تحديث متغيرات البيئة
1. في Supabase، اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL**
   - **anon/public key**
3. حدث ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 4. إعداد المصادقة (Clerk)
1. اذهب إلى [clerk.com](https://clerk.com)
2. أنشئ تطبيق جديد
3. انسخ المفاتيح وأضفها لملف `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-secret
```

## هيكل قاعدة البيانات

### الجداول المُنشأة:
- **boards**: لوحات المشاريع
- **columns**: أعمدة كل لوحة (To Do, In Progress, Done)
- **tasks**: المهام داخل كل عمود

### الميزات:
- ✅ Row Level Security (RLS) للأمان
- ✅ Foreign Keys للعلاقات
- ✅ Indexes للأداء
- ✅ Auto-updating timestamps
- ✅ Data validation

## التحقق من النجاح
بعد تطبيق هذه الخطوات:
1. أعد تشغيل المشروع: `npm run dev`
2. اذهب إلى `/dashboard`
3. يجب أن تظهر الصفحة بدون أخطاء
4. يمكنك إنشاء لوحة جديدة بنجاح