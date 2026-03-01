'use client'

import Link from 'next/link'
import { ArrowLeft, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History, Lock, Bell, Settings, ChevronRight } from 'lucide-react'

// Mock wallet data - will be replaced with eToro SSO
const MOCK_BALANCE = {
  total: 125432.87,
  available: 45000.00,
  invested: 80432.87,
  currency: 'USD',
}

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'deposit', amount: 5000, date: '2024-02-25', status: 'completed' },
  { id: 2, type: 'buy', symbol: 'NVDA', amount: 1849.90, shares: 10, date: '2024-02-24', status: 'completed' },
  { id: 3, type: 'buy', symbol: 'AAPL', amount: 2729.50, shares: 10, date: '2024-02-23', status: 'completed' },
  { id: 4, type: 'dividend', symbol: 'MSFT', amount: 45.20, date: '2024-02-20', status: 'completed' },
  { id: 5, type: 'sell', symbol: 'TSLA', amount: 4085.80, shares: 10, date: '2024-02-18', status: 'completed' },
]

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-[#0d1421] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1421]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-2 text-[#8b9eb3] hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <button className="p-2 text-[#8b9eb3] hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <h1 className="text-xl font-bold text-white">Wallet</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#2ecc71] to-[#27ae60] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-white/80" />
              <span className="text-white/80 font-medium">Total Balance</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">{MOCK_BALANCE.currency}</span>
            </div>
          </div>
          
          <div className="text-4xl font-bold text-white mb-6">
            ${MOCK_BALANCE.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/70 text-xs mb-1">Available</div>
              <div className="text-white font-semibold">
                ${MOCK_BALANCE.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/70 text-xs mb-1">Invested</div>
              <div className="text-white font-semibold">
                ${MOCK_BALANCE.invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-[#2ecc71]" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Deposit</div>
              <div className="text-xs text-[#8b9eb3]">Add funds</div>
            </div>
          </button>
          <button className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3a4d] hover:border-[#2ecc71]/30 transition-colors flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e74c3c]/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-[#e74c3c]" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Withdraw</div>
              <div className="text-xs text-[#8b9eb3]">Cash out</div>
            </div>
          </button>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d]">
          <div className="p-4 border-b border-[#2a3a4d]">
            <h2 className="font-semibold text-white">Payment Methods</h2>
          </div>
          <button className="w-full p-4 flex items-center justify-between hover:bg-[#243447] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#243447] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#8b9eb3]" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Add Payment Method</div>
                <div className="text-xs text-[#8b9eb3]">Credit card, bank transfer, PayPal</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5a6b7d]" />
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d]">
          <div className="p-4 border-b border-[#2a3a4d] flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Activity</h2>
            <button className="text-[#2ecc71] text-sm font-medium">See All</button>
          </div>
          <div>
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <div 
                key={tx.id}
                className={`p-4 flex items-center justify-between ${
                  i < MOCK_TRANSACTIONS.length - 1 ? 'border-b border-[#2a3a4d]/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' || tx.type === 'dividend' ? 'bg-[#2ecc71]/20' :
                    tx.type === 'sell' ? 'bg-[#2ecc71]/20' :
                    'bg-[#e74c3c]/20'
                  }`}>
                    {tx.type === 'deposit' && <ArrowDownLeft className="w-5 h-5 text-[#2ecc71]" />}
                    {tx.type === 'dividend' && <ArrowDownLeft className="w-5 h-5 text-[#2ecc71]" />}
                    {tx.type === 'buy' && <ArrowUpRight className="w-5 h-5 text-[#e74c3c]" />}
                    {tx.type === 'sell' && <ArrowDownLeft className="w-5 h-5 text-[#2ecc71]" />}
                  </div>
                  <div>
                    <div className="text-white font-medium capitalize">
                      {tx.type === 'deposit' ? 'Deposit' :
                       tx.type === 'dividend' ? `Dividend - ${tx.symbol}` :
                       tx.type === 'buy' ? `Buy ${tx.symbol}` :
                       `Sell ${tx.symbol}`}
                    </div>
                    <div className="text-xs text-[#8b9eb3]">{tx.date}</div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  tx.type === 'buy' ? 'text-[#e74c3c]' : 'text-[#2ecc71]'
                }`}>
                  {tx.type === 'buy' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Links */}
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4d]">
          <button className="w-full p-4 flex items-center justify-between hover:bg-[#243447] transition-colors border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-[#8b9eb3]" />
              <span className="text-white">Transaction History</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5a6b7d]" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-[#243447] transition-colors border-b border-[#2a3a4d]">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#8b9eb3]" />
              <span className="text-white">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5a6b7d]" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-[#243447] transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#8b9eb3]" />
              <span className="text-white">Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5a6b7d]" />
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-[#f1c40f]/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔐</div>
            <div>
              <div className="font-semibold text-white mb-1">eToro SSO Coming Soon</div>
              <p className="text-sm text-[#8b9eb3]">
                Connect your eToro account to see real balance and transactions. 
                This demo shows placeholder data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
