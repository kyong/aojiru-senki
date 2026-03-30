import React from 'react';
import { X, Shield, EyeOff } from 'lucide-react';

export type LegalType = 'terms' | 'privacy';

interface Props {
  open: boolean;
  type: LegalType;
  onClose: () => void;
}

export const LegalModal: React.FC<Props> = ({ open, type, onClose }) => {
  if (!open) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            {isTerms ? <Shield className="text-green-500" /> : <EyeOff className="text-blue-400" />}
            <h2 className="text-xl font-bold">{isTerms ? '利用規約' : 'プライバシーポリシー'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-gray-300 leading-relaxed text-sm scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isTerms ? (
            <>
              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-green-500 pl-3">1. はじめに</h3>
                <p>
                  本利用規約は、Aojiru Studio（以下「当方」）が提供するアプリ「青汁戦記」（以下「本アプリ」）の利用条件を定めるものです。利用者の皆様は、本規約に同意した上で本アプリをご利用ください。
                </p>
                <p className="text-red-400 mt-2 font-bold italic">
                  ※本アプリの進捗データは利用者のブラウザ（localStorage）にのみ保存されます。キャッシュの削除やブラウザのアンインストールによりデータが消失した場合、復旧対応は行えません。
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-green-500 pl-3">2. ジョークアプリに関する免責事项</h3>
                <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 mb-3">
                  <p className="text-sm font-bold text-red-400 mb-1">【重要】</p>
                  <p>
                    本アプリは演出を目的としたジョークアプリです。アプリ内の設定や効果は、実際の医学的効果を保証するものではありません。
                  </p>
                </div>
                <p>
                  実際の青汁摂取等は自己責任で行ってください。当方は、本アプリの利用によって生じた損害について一切の責任を負いません。
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-green-500 pl-3">3. 禁止事項</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>データの不正改ざん</li>
                  <li>サービスの運営を妨害する行為</li>
                </ul>
              </section>

              <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
                制定日: 2026年3月30日
              </div>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-blue-500 pl-3">1. データの収集と利用</h3>
                <p>
                  本アプリは、**一切の個人を特定できる情報を収集・外部送信していません**。すべてのデータは利用者の端末内（ブラウザ）にのみ保存されます。
                </p>
                <p className="text-orange-400 mt-2">
                  ※ブラウザのキャッシュを削除するとデータも削除されます。復旧機能は提供しておりません。
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-blue-500 pl-3">2. 広告について</h3>
                <p>
                  報酬獲得等のために動画広告を表示する場合があります。広告配信において、配信事業者が非個人情報を取得する場合があります。
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-3 border-l-4 border-blue-500 pl-3">3. プライバシーの変更</h3>
                <p>
                  必要に応じて本ポリシーを変更する場合があります。
                </p>
              </section>

              <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
                制定日: 2026年3月30日
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950/50 border-t border-gray-800 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
