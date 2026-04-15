"use client";

import React, { useState } from "react";
import {
  Store,
  CreditCard,
  Truck,
  Percent,
  Shield,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">الإعدادات</h2>
        <p className="text-muted-foreground">
          إدارة إعدادات المتجر والتكوينات العامة
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
          {[
            { id: "store", label: "المتجر", icon: Store },
            { id: "payment", label: "المدفوعات", icon: CreditCard },
            { id: "shipping", label: "الشحن والضريبة", icon: Truck },
            { id: "coupons", label: "الكوبونات", icon: Percent },
            { id: "appearance", label: "المظهر", icon: Palette },
            { id: "security", label: "الأمان", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                معلومات المتجر
              </CardTitle>
              <CardDescription>تحديث بيانات المتجر الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">اسم المتجر</Label>
                  <Input id="store-name" defaultValue="متجري" placeholder="أدخل اسم المتجر" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">البريد الإلكتروني</Label>
                  <Input id="store-email" defaultValue="info@mystore.com" placeholder="info@store.com" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">هاتف المتجر</Label>
                  <Input id="store-phone" defaultValue="+966501234567" placeholder="+966..." dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">العملة</Label>
                  <Select defaultValue="SAR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (د.إ)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                      <SelectItem value="EUR">يورو</SelectItem>
                      <SelectItem value="EGP">جنيه مصري (ج.م)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-desc">وصف المتجر</Label>
                <Textarea
                  id="store-desc"
                  defaultValue="متجرك المفضل للتسوق الإلكتروني بأفضل الأسعار"
                  placeholder="أدخل وصف المتجر"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">عنوان المتجر</Label>
                <Input id="store-address" defaultValue="الرياض، المملكة العربية السعودية" placeholder="أدخل عنوان المتجر" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                اللغة والمنطقة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اللغة الافتراضية</Label>
                  <Select defaultValue="ar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Select defaultValue="asia-riyadh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-riyadh">توقيت الرياض (GMT+3)</SelectItem>
                      <SelectItem value="asia-dubai">توقيت دبي (GMT+4)</SelectItem>
                      <SelectItem value="africa-cairo">توقيت القاهرة (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Stripe - إعدادات الدفع
              </CardTitle>
              <CardDescription>تكوين بوابة الدفع Stripe لاستقبال المدفوعات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Stripe</p>
                    <p className="text-xs text-muted-foreground">بوابة الدفع الإلكتروني</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="stripe-public">مفتاح Stripe العام (Publishable Key)</Label>
                <div className="relative">
                  <Input
                    id="stripe-public"
                    defaultValue="pk_test_51Nx...example"
                    placeholder="pk_test_..."
                    dir="ltr"
                    type="password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  يمكن مشاركة هذا المفتاح بأمان في الواجهة الأمامية
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-secret">مفتاح Stripe السري (Secret Key)</Label>
                <div className="relative">
                  <Input
                    id="stripe-secret"
                    defaultValue="sk_test_51Nx...example"
                    placeholder="sk_test_..."
                    dir="ltr"
                    type="password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  لا تشارك هذا المفتاح أبداً - يُستخدم فقط في الخادم
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe-webhook">مفتاح Webhook السري</Label>
                <div className="relative">
                  <Input
                    id="stripe-webhook"
                    defaultValue="whsec_...example"
                    placeholder="whsec_..."
                    dir="ltr"
                    type="password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  مطلوب للتحقق من صحة أحداث Stripe الواردة
                </p>
              </div>

              <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ملاحظة: تأكد من استخدام مفاتيح الاختبار (Test Mode) أثناء التطوير، واستبدلها بمفاتيح الإنتاج قبل النشر.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>طرق الدفع المتاحة</CardTitle>
              <CardDescription>تحديد طرق الدفع المقبولة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "بطاقات الائتمان / الخصم", desc: "Visa, Mastercard, AMEX, Mada", enabled: true },
                { name: "Apple Pay", desc: "الدفع عبر Apple Pay", enabled: true },
                { name: "Google Pay", desc: "الدفع عبر Google Pay", enabled: false },
                { name: "STC Pay", desc: "محفظة STC Pay", enabled: true },
                { name: "التحويل البنكي", desc: "تحويل مباشر لحساب بنكي", enabled: false },
                { name: "الدفع عند الاستلام", desc: "COD - نقدي عند التسليم", enabled: true },
              ].map((method) => (
                <div
                  key={method.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                  <Switch defaultChecked={method.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping & Tax Settings */}
        <TabsContent value="shipping" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                إعدادات الشحن
              </CardTitle>
              <CardDescription>تكوين خيارات الشحن والتوصيل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">تفعيل الشحن</p>
                  <p className="text-xs text-muted-foreground">تفعيل حساب تكاليف الشحن عند الطلب</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">مناطق الشحن والتكاليف</p>
                {[
                  { zone: "الرياض", cost: 25, freeAbove: 300 },
                  { zone: "جدة ومكة المكرمة", cost: 35, freeAbove: 400 },
                  { zone: "الدمام والخليج", cost: 40, freeAbove: 500 },
                  { zone: "باقي المناطق", cost: 50, freeAbove: 600 },
                ].map((shipping) => (
                  <div key={shipping.zone} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{shipping.zone}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <span className="font-medium">ر.س {shipping.cost}</span>
                        <p className="text-xs text-muted-foreground">مجاني فوق ر.س {shipping.freeAbove}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-shipping">تكلفة الشحن الافتراضية (ر.س)</Label>
                  <Input id="default-shipping" defaultValue="30" type="number" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">حد الشحن المجاني (ر.س)</Label>
                  <Input id="free-shipping" defaultValue="300" type="number" dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات الضريبة</CardTitle>
              <CardDescription>تكوين نسبة ضريبة القيمة المضافة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">تفعيل الضريبة</p>
                  <p className="text-xs text-muted-foreground">إضافة ضريبة القيمة المضافة على الطلبات</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">نسبة الضريبة (%)</Label>
                  <Input id="tax-rate" defaultValue="15" type="number" dir="ltr" />
                  <p className="text-xs text-muted-foreground">
                    ضريبة القيمة المضافة في المملكة العربية السعودية 15%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-number">الرقم الضريبي</Label>
                  <Input id="tax-number" defaultValue="300000000000003" placeholder="الرقم الضريبي" dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupons Settings */}
        <TabsContent value="coupons" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                إدارة الكوبونات
              </CardTitle>
              <CardDescription>إنشاء وإدارة أكواد الخصم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { code: "WELCOME20", type: "نسبة مئوية", value: "20%", used: 156, max: 500, active: true, expires: "2026-12-31" },
                  { code: "SAVE10", type: "نسبة مئوية", value: "10%", used: 342, max: 1000, active: true, expires: "2026-06-30" },
                  { code: "FLAT50", type: "مبلغ ثابت", value: "50 ر.س", used: 89, max: 200, active: true, expires: "2026-09-15" },
                  { code: "SUMMER30", type: "نسبة مئوية", value: "30%", used: 0, max: 100, active: false, expires: "2025-09-01" },
                ].map((coupon) => (
                  <div key={coupon.code} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1.5 rounded-md bg-primary/10 font-mono font-bold text-sm">
                        {coupon.code}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          خصم {coupon.value} ({coupon.type})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          استخدام: {coupon.used} / {coupon.max} | ينتهي: {new Date(coupon.expires).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={coupon.active ? "default" : "secondary"}>
                        {coupon.active ? "نشط" : "غير نشط"}
                      </Badge>
                      <Button variant="outline" size="sm">تعديل</Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <Button>
                <Percent className="w-4 h-4 ml-2" />
                إنشاء كوبون جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                المظهر والتخصيص
              </CardTitle>
              <CardDescription>تخصيص مظهر واجهة المتجر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">الوضع الليلي</p>
                  <p className="text-xs text-muted-foreground">تفعيل الوضع الليلي للمتجر</p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">اللون الرئيسي</p>
                <div className="flex items-center gap-3">
                  {[
                    { color: "bg-blue-500", label: "أزرق" },
                    { color: "bg-purple-500", label: "بنفسجي" },
                    { color: "bg-green-500", label: "أخضر" },
                    { color: "bg-red-500", label: "أحمر" },
                    { color: "bg-orange-500", label: "برتقالي" },
                    { color: "bg-pink-500", label: "وردي" },
                    { color: "bg-indigo-500", label: "نيلي" },
                    { color: "bg-teal-500", label: "تركوازي" },
                  ].map((theme) => (
                    <button
                      key={theme.color}
                      className={`w-10 h-10 rounded-full ${theme.color} border-2 border-transparent hover:scale-110 transition-transform`}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">شعار المتجر</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Store className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">رفع شعار</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, SVG (الحد الأقصى 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="products-per-page">عدد المنتجات في الصفحة</Label>
                <Select defaultValue="12">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription>إعدادات حماية المتجر والحسابات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">المصادقة الثنائية (2FA)</p>
                  <p className="text-xs text-muted-foreground">إضافة طبقة حماية إضافية لحساب المدير</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">حماية Bot</p>
                  <p className="text-xs text-muted-foreground">تفعيل reCAPTCHA للنماذج العامة</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">حد الطلبات</p>
                  <p className="text-xs text-muted-foreground">الحد الأقصى للطلبات في الدقيقة لمنع الإساءة</p>
                </div>
                <Input className="w-24" defaultValue="100" type="number" dir="ltr" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">انتهاء الجلسة</p>
                  <p className="text-xs text-muted-foreground">المدة قبل انتهاء الجلسة تلقائياً</p>
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">ساعة واحدة</SelectItem>
                    <SelectItem value="6h">6 ساعات</SelectItem>
                    <SelectItem value="24h">24 ساعة</SelectItem>
                    <SelectItem value="7d">7 أيام</SelectItem>
                    <SelectItem value="30d">30 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="min-w-32" onClick={handleSave}>
          {saved ? (
            <>
              <Check className="w-4 h-4 ml-2" />
              تم الحفظ!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
