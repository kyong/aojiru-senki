import { Layout } from '../components/layout/Layout';
import { Shield } from 'lucide-react';

export const Terms = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto py-4">
        <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
          <Shield className="text-green-500" />
          <h2 className="text-2xl font-bold text-white">利用規約</h2>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-700 space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h3 className="text-lg font-bold text-white mb-3">1. はじめに</h3>
            <p className="text-sm">
              本利用規約は、Aojiru Studio（以下「当方」）が提供するアプリ「青汁戦記」（以下「本アプリ」）の利用条件を定めるものです。
              利用者の皆様は、本規約に同意した上で本アプリをご利用ください。
            </p>
            <p className="text-xs text-red-400 mt-2 font-bold italic">
              ※本アプリの進捗データは利用者のブラウザ（localStorage）にのみ保存されます。キャッシュの削除やブラウザのアンインストール等によりデータが消失した場合、当方は一切の復旧対応を行えません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">2. ジョークアプリに関する免責事項</h3>
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-3">
              <p className="text-red-400 text-sm font-bold underline mb-2">重要事項</p>
              <p className="text-sm text-gray-200">
                本アプリは演出・娯楽を目的とした**ジョークアプリ**です。アプリ内で表現される「健康効果」「回復」「ステータス上昇」などの表現は、実際の医学的・健康上の効果を保証するものではありません。
              </p>
            </div>
            <p className="text-sm">
              実際の青汁等の摂取については、各自の体調に合わせて適切に行うものとし、本アプリの利用によって生じたいかなる健康被害や損害についても、当方は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">3. 禁止事項</h3>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>本アプリのデータを不正に改ざんする行為</li>
              <li>サーバー（存在する場合）への過度な負荷をかける行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">4. サービス内容の変更</h3>
            <p className="text-sm">
              当方は、利用者に事前通知することなく、本アプリの内容を変更または提供をの中断・終了することができるものとします。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">5. 規約の変更</h3>
            <p className="text-sm">
              当方は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
            </p>
          </section>
        </div>

        <div className="text-center text-xs text-gray-600">
          制定日: 2026年3月30日
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
