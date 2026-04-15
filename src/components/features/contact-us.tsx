'use client';

import React, { useState, useTransition } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  Clock,
  Loader2,
} from 'lucide-react';

const SUBJECTS = [
  { value: 'order', label: 'Order Issue' },
  { value: 'return', label: 'Return / Exchange' },
  { value: 'product', label: 'Product Inquiry' },
  { value: 'payment', label: 'Payment Problem' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback / Suggestion' },
  { value: 'business', label: 'Business / Partnership' },
  { value: 'other', label: 'Other' },
];

interface ContactUsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactUs({ open, onOpenChange }: ContactUsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const isValid = formData.name.trim() && formData.email.trim() && formData.subject && formData.message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    });
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) handleReset(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Contact Us
          </SheetTitle>
          <SheetDescription>Have a question or need help? We&apos;re here for you 24/7.</SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="text-center space-y-4 py-8 animate-fade-in-up">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-20" />
              <div className="relative h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Message Sent!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Thank you for reaching out. Our support team will get back to you within 2 hours at {formData.email}.
            </p>
            <Button onClick={handleReset} variant="outline">
              Send Another Message
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Mail, label: 'Email', value: 'support@luxestore.sa', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Phone, label: 'Phone', value: '+966 50 000 0000', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { icon: Clock, label: 'Hours', value: '24/7 Support', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl ${item.bg} border p-3 text-center`}>
                  <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-1.5`} />
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full Name *</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+966 5XX XXX XXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formData.subject} onValueChange={handleSubjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message *</Label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="w-full h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
              {!isValid && (
                <p className="text-xs text-center text-muted-foreground">
                  Please fill in all required fields (*) to send your message.
                </p>
              )}
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
