# 🚨 حل مشكلة المصادقة - Authentication Error Troubleshooting

## المشكلة الحالية

تواجه رسالة خطأ:
```
Error loading boards
Authentication error: Please configure Clerk + Supabase integration
```

## 🔍 السبب الأكثر احتمالاً

المشكلة أن **Row Level Security (RLS)** في Supabase يرفض الوصول لأنه لا يستطيع قراءة معرف المستخدم من JWT token الخاص بـ Clerk بشكل صحيح.

---

## ✅ حلول متعددة (جربها بالترتيب)

### الحل 1: تعطيل RLS مؤقتاً (الأسرع للتأكد)

**هذا الحل للتأكد من أن المشكلة في RLS وليس في الاتصال:**

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. شغل الأمر التالي:

```sql
-- تعطيل RLS مؤقتاً
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
```

5. أعد تشغيل التطبيق:
   ```bash
   npm run dev
   ```

6. إذا عمل التطبيق الآن → **المشكلة في RLS**، انتقل للحل 2
7. إذا لم يعمل → المشكلة في شيء آخر، انتقل للحل 4

---

### الحل 2: إصلاح RLS Policies (الحل الصحيح)

**بعد التأكد من أن المشكلة في RLS (الحل 1)، أصلحها:**

#### أ. التأكد من دالة requesting_user_id()

اذهب إلى Supabase Dashboard → SQL Editor وشغل:

```sql
-- إنشاء/تحديث الدالة لاستخراج user_id من JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text AS $$
  SELECT NULLIF(
    auth.jwt()->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;
```

#### ب. التأكد من أن الـ Policies تستخدم الدالة الصحيحة

```sql
-- مثال: تحديث سياسة boards
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;

CREATE POLICY "Users can view their own boards"
ON public.boards
FOR SELECT
USING (user_id = requesting_user_id());

-- تحديث سياسات INSERT
DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;

CREATE POLICY "Users can insert their own boards"
ON public.boards
FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

-- تحديث سياسات UPDATE
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;

CREATE POLICY "Users can update their own boards"
ON public.boards
FOR UPDATE
USING (user_id = requesting_user_id())
WITH CHECK (user_id = requesting_user_id());

-- تحديث سياسات DELETE
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;

CREATE POLICY "Users can delete their own boards"
ON public.boards
FOR DELETE
USING (user_id = requesting_user_id());
```

#### ج. إعادة تفعيل RLS

```sql
-- إعادة تفعيل RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

---

### الحل 3: تكوين JWT Template في Clerk بشكل صحيح

**تأكد من أن Clerk JWT Template يحتوي على sub claim:**

1. اذهب إلى [Clerk Dashboard](https://dashboard.clerk.com)
2. اختر تطبيقك
3. اذهب إلى **JWT Templates**
4. اضغط **New template**
5. الاسم: `supabase`
6. في **Claims**، أضف:

```json
{
  "role": "authenticated",
  "user_id": "https://www.clerk.com/v1/user/{{user.id}}",
  "email": "{{user.primaryEmailAddress?.emailAddress}}"
}
```

**ملاحظة مهمة:** تأكد من أن `user_id` يستخدم `{{user.id}}` وليس نصاً ثابتاً.

---

### الحل 4: استخدام auth.uid() بدلاً من requesting_user_id()

**بديل: استخدام auth.uid() مباشرة في Policies:**

```sql
-- تحديث سياسة استخدام auth.uid() بدلاً من requesting_user_id()
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;

CREATE POLICY "Users can view their own boards"
ON public.boards
FOR SELECT
USING (user_id = auth.uid());
```

كرر نفس الشيء لجميع الجداول (boards, columns, tasks).

---

### الحل 5: فحص المتغيرات البيئية

تأكد من أن ملف `.env.local` صحيح:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qiuitsoolbbnlnnjhluf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sgjqn4gYMLUa1oblKowCVg_Vwi_Xpw4
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3VyaW91cy1tb2xsdXNrLTk2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_4sATSB23i3sv1IGAnbYC2tJuztnlTS29ml8txglnBd
```

**تأكد من:**
- لا توجد مسافات إضافية
- لا توجد علامات اقتباس حول القيم
- المفاتيح صحيحة (من Clerk Dashboard و Supabase Dashboard)

---

## 🔍 أدوات المساعدة

### 1. استخدم أداة الفحص:

```bash
./troubleshoot.sh
```

### 2. افتح صفحة الفحص في المتصفح:

```bash
# افتح troubleshoot.html في متصفحك
open troubleshoot.html
# أو
start troubleshoot.html  # Windows
```

---

## 📊 خطوات الاستكشاف الموصى بها

1. **أولاً**: جرب الحل 1 (تعطيل RLS) للتأكد من سبب المشكلة
2. **إذا نجح**: المشكلة في RLS → نفذ الحل 2 أو 4
3. **تحقق من JWT Template**: نفذ الحل 3
4. **فحص Console**: افتح Console في المتصفح (F12) وانظر للأخطاء

---

## 📝 مثال على Console Logs

### ✅ Logs الصحيحة:
```
Token length: 1234
Supabase session: Active
```

### ❌ Logs تدل على مشكلة:
```
Error initializing Supabase: ...
Authentication error: ...
PGRST301: JWT token not valid
```

---

## 🆘 إذا لم تنجح أي حل:

1. **تحقق من Console**:
   - افتح DevTools (F12)
   - اذهب إلى Console tab
   - حدث الصفحة
   - لقط screenshot للأخطاء

2. **تحقق من Clerk Dashboard**:
   - تأكد أن JWT template `supabase` موجود
   - تأكد أنه يحتوي على claims المطلوبة

3. **تحقق من Supabase Dashboard**:
   - Authentication → Users → تأكد أن المستخدم موجود
   - Database → Tables → تأكد أن الجداول موجودة
   - Auth → Policies → تأكد أن RLS مفعل

4. **اتصل بالدعم**:
   - شارك screenshot من Console
   - شارك محتوى .env.local (بدون المفاتيح)
   - شارك خطوات التي قمت بها

---

## 💡 نصائح إضافية

- **أعد تشغيل التطبيق** بعد كل تغيير: `npm run dev`
- **امسح cache المتصفح** بعد تغييرات JWT
- **استخدم user جديد** للتأكد من عدم وجود مشاكل في بيانات قديمة
- **تحقق من logs في Supabase Dashboard** → Logs

---

## ✅ التحقق من الحل

بعد تطبيق أي حل:

1. أعد تشغيل التطبيق
2. سجل دخول
3. اذهب إلى `/dashboard`
4. إذا ظهر اللوحات → ✅ نجح الحل
5. إذا ظهر نفس الخطأ → جرب الحل التالي

---

**ملاحظة:** بعد نجاح الحل، لا تنسى إعادة تفعيل RLS في الإنتاج!
