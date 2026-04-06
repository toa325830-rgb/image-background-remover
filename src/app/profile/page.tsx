"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, credits, loading, refreshCredits } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      refreshCredits();
    }
  }, [user, refreshCredits]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const usedPercent = credits 
    ? Math.min(100, (credits.usedCredits / credits.totalCredits) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* User Info Card */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={user.picture}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-blue-500"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-slate-400">{user.email}</p>
              <div className="mt-2">
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${credits?.hasSubscription 
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }
                `}>
                  {credits?.hasSubscription 
                    ? `${credits.plan === 'pro' ? '专业版' : credits.plan === 'team' ? '团队版' : '个人版'}`
                    : '免费用户'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {credits?.remainingCredits ?? '-'}
            </div>
            <p className="text-slate-400">剩余额度</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {credits?.usedCredits ?? '-'}
            </div>
            <p className="text-slate-400">已使用</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {credits?.totalCredits ?? '-'}
            </div>
            <p className="text-slate-400">本月额度</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <div className="flex justify-between mb-3">
            <span className="text-slate-400">本月使用进度</span>
            <span className="font-medium">{usedPercent.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                usedPercent > 90 ? "bg-red-500" : usedPercent > 70 ? "bg-orange-500" : "bg-blue-500"
              }`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          {credits && credits.remainingCredits <= 10 && !credits.hasSubscription && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <p className="text-orange-400 text-sm">
                ⚠️ 剩余额度不足 10 张，建议升级套餐以获得更多额度
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">📊 使用统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">当前套餐</span>
                <span className="font-medium">
                  {credits?.hasSubscription 
                    ? (credits.plan === 'pro' ? '专业版' : credits.plan === 'team' ? '团队版' : '个人版')
                    : '免费体验'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">额度周期</span>
                <span className="font-medium">每月重置</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">注册时间</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">🚀 快速升级</h3>
            <p className="text-slate-400 text-sm mb-4">
              需要更多额度？升级到专业版或团队版，享受更多权益。
            </p>
            <a
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium text-center transition-all"
            >
              查看套餐
            </a>
          </div>
        </div>

        {/* Subscription Plans Comparison */}
        {!credits?.hasSubscription && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-center">升级解锁更多权益</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-medium">专业版 ¥39/月</p>
                <p className="text-slate-400">300张/月 + 优先队列</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <p className="font-medium">团队版 ¥99/月</p>
                <p className="text-slate-400">500张/月 + 批量处理</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💎</div>
                <p className="font-medium">专属客服</p>
                <p className="text-slate-400">优先技术支持</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <a
                href="/pricing"
                className="inline-block px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
              >
                立即升级
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
