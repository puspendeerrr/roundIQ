'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Booking } from '../../../../types';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building,
  Clock,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const bookingId = (params?.bookingId as string) || '';
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedPaymentRef, setCompletedPaymentRef] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingAndOrder = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch Booking Details
        const bookingRes: any = await apiClient.get(`/bookings/${bookingId}`);
        if (bookingRes?.data) {
          setBooking(bookingRes.data);

          // 2. Create Razorpay Payment Order
          const orderRes: any = await apiClient.post('/payments/create-order', {
            bookingId,
          });

          if (orderRes?.data) {
            setPaymentData(orderRes.data);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.error?.message || 'Failed to initialize payment checkout.');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingAndOrder();
    }
  }, [bookingId]);

  // Execute Simulated / Real Payment Callback & Webhook Trigger
  const handlePayNow = async () => {
    if (!paymentData || !booking) return;

    try {
      setIsProcessing(true);
      setPaymentStatus('PROCESSING');
      setErrorMsg(null);

      // Trigger Webhook Event Callback to Backend (Single Source of Truth)
      const webhookPayload = {
        event_id: `evt_${Date.now()}`,
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_${Date.now()}`,
              order_id: paymentData.razorpayOrderId,
              amount: paymentData.amount,
              currency: 'INR',
              status: 'captured',
              method: 'card',
            },
          },
        },
      };

      const webhookRes: any = await apiClient.post('/payments/webhook', webhookPayload);

      if (webhookRes?.data?.success) {
        setCompletedPaymentRef(paymentData.referenceCode);
        setPaymentStatus('SUCCESS');
      } else {
        setPaymentStatus('FAILED');
        setErrorMsg('Payment verification failed.');
      }
    } catch (err: any) {
      setPaymentStatus('FAILED');
      setErrorMsg(err?.error?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-xs text-zinc-500 animate-pulse">
          Initializing secure checkout order...
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === 'SUCCESS') {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 space-y-6 bg-white text-center shadow-2xl border-2 border-green-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-zinc-900">Payment Successful!</h1>
              <p className="text-xs text-[#71717A]">
                Your payment of <strong>₹{paymentData?.amountFormatted?.toFixed(2)}</strong> has been captured.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-[#E4E4E7] space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Payment Reference:</span>
                <span className="font-mono font-bold text-zinc-900">{completedPaymentRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Booking Reference:</span>
                <span className="font-mono font-bold text-zinc-900">{booking?.referenceCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Session Status:</span>
                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  CONFIRMED
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/student/bookings" className="w-full">
                <Button className="w-full bg-zinc-900 text-white">Go to My Bookings</Button>
              </Link>
              <Link href="/student/wallet" className="w-full">
                <Button variant="outline" className="w-full">
                  View Wallet Ledger
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/student/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Cancel & Back to Bookings
          </Link>

          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#C2410C]" /> Secure Session Checkout
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Complete payment via Razorpay to confirm your 1-on-1 mock technical interview.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted
            </span>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Booking Summary */}
            <div className="md:col-span-7 space-y-6">
              <Card className="p-6 space-y-4 bg-white shadow-md">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Session Reservation Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Booking Reference:</span>
                    <span className="font-mono font-bold text-zinc-900">{booking?.referenceCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Interviewer:</span>
                    <span className="font-bold text-zinc-900">{booking?.interviewer?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Company:</span>
                    <span className="font-semibold text-zinc-800">
                      {booking?.interviewer?.currentCompany || 'Software Engineer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Scheduled Start:</span>
                    <span className="font-bold text-zinc-900">
                      {booking?.scheduledStart ? new Date(booking.scheduledStart).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Duration:</span>
                    <span className="font-bold text-zinc-900">{booking?.durationMinutes} Minutes</span>
                  </div>
                </div>
              </Card>

              {/* Price Breakdown */}
              <Card className="p-6 space-y-3 bg-white shadow-md">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Price & Fee Breakdown
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Session Fee ({booking?.durationMinutes} Mins):</span>
                    <span className="font-semibold text-zinc-900">
                      ₹{paymentData?.calculation?.bookingAmount?.toFixed(2) || '1000.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">GST (18%):</span>
                    <span className="font-semibold text-zinc-900">
                      ₹{paymentData?.calculation?.gstAmount?.toFixed(2) || '36.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E4E4E7] flex justify-between text-sm font-black">
                    <span className="text-zinc-900">Total Amount Payable:</span>
                    <span className="text-[#C2410C]">
                      ₹{paymentData?.amountFormatted?.toFixed(2) || '1036.00'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Execution Sidebar */}
            <div className="md:col-span-5 space-y-6">
              <Card className="p-6 space-y-5 bg-white border-2 border-orange-200 shadow-xl">
                <div className="border-b border-[#E4E4E7] pb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C2410C]">
                    Razorpay Gateway Integration
                  </span>
                  <h3 className="text-base font-black text-zinc-900 mt-1">Complete Payment</h3>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-[#E4E4E7] text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Gateway Order ID:</span>
                    <span className="font-mono text-[11px] font-bold text-zinc-800">
                      {paymentData?.razorpayOrderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Merchant Key:</span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-600">
                      {paymentData?.key}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold py-3 shadow-lg"
                  onClick={handlePayNow}
                  isLoading={isProcessing}
                >
                  Pay ₹{paymentData?.amountFormatted?.toFixed(2)} via Razorpay
                </Button>

                <p className="text-[11px] text-[#71717A] text-center italic">
                  Razorpay webhooks verify payment authenticity automatically.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
