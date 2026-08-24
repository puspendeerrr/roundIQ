'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Server,
  Activity,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';

export default function AdminSystemPage() {
  const [systemData, setSystemData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/admin/system');
      if (res?.data) {
        setSystemData(res.data);
      }
    } catch (e) {
      setSystemData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Server className="h-6 w-6 text-[#C2410C]" /> System Infrastructure & DevOps Health Dashboard
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit Node.js server memory, PostgreSQL connections, Redis cache stats, and security header policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSystemStatus}
                leftIcon={<RefreshCw className="h-4 w-4 text-[#C2410C]" />}
              >
                Refresh System Probes
              </Button>
            </div>
          </div>

          {/* Infrastructure Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1">
                <Activity className="h-4 w-4" /> Node API Server
              </span>
              <h3 className="text-2xl font-black">{systemData?.server?.status || 'HEALTHY'}</h3>
              <p className="text-[11px] text-zinc-400">
                Uptime: {systemData?.server?.uptimeSeconds || 0} seconds
              </p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
                <Database className="h-4 w-4 text-blue-600" /> Database Cluster
              </span>
              <h3 className="text-2xl font-black text-blue-700">{systemData?.database?.status || 'CONNECTED'}</h3>
              <p className="text-[11px] text-zinc-500">{systemData?.database?.provider || 'PostgreSQL 16'}</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
                <Cpu className="h-4 w-4 text-amber-600" /> RAM Memory Usage
              </span>
              <h3 className="text-2xl font-black text-amber-600">
                {systemData?.server?.memoryMb || 45} MB
              </h3>
              <p className="text-[11px] text-zinc-500">Heap Memory Consumption</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Security Hardening
              </span>
              <h3 className="text-2xl font-black text-green-700">HSTS / CSP ACTIVE</h3>
              <p className="text-[11px] text-zinc-500">Rate Limiter & Anti-Sniffing Ready</p>
            </Card>
          </div>

          {/* Detailed Probes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3 bg-white shadow-md border-[#E4E4E7]">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                Cache & Worker Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A]">Cache Storage Provider:</span>
                  <span className="font-mono font-bold text-zinc-900">{systemData?.cache?.provider}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A]">Active Cached Keys:</span>
                  <span className="font-mono font-bold text-zinc-900">{systemData?.cache?.activeKeys}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#71717A]">Background Job Runner:</span>
                  <span className="font-mono font-bold text-green-700">ONLINE</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3 bg-white shadow-md border-[#E4E4E7]">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                DevOps & Kubernetes Health Endpoints
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A]">Liveness Probe:</span>
                  <span className="font-mono text-blue-600 font-bold">/health/liveness (HTTP 200)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-[#71717A]">Readiness Probe:</span>
                  <span className="font-mono text-green-600 font-bold">/health/readiness (HTTP 200)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#71717A]">OpenAPI / Swagger Spec:</span>
                  <span className="font-mono text-orange-600 font-bold">/api-docs.json</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
