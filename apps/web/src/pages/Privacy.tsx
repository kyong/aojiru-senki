import { Layout } from '../components/layout/Layout';
import { EyeOff } from 'lucide-react';

export const Privacy = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto py-4">
        <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
          <EyeOff className="text-blue-400" />
          <h2 className="text-2xl font-bold text-white">プライバシーポリシー</h2>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-700 space-y-6 text-gray-300 leading-relaxed">
          <p className="text-sm">
            スーパーハッピーカンパニー（以下「当方」）は、本アプリ「青汁戦記」における利用者情報の扱いについて、以下の通り定めます。
          </p>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">1. データの収集と利用目的</h3>
            <p className="text-sm">
              本アプリは、現在**一切の個人を特定できる情報を収集・外部送信していません**。
              アプリ内で管理される進捗データ（レベル、所持アイテム、ガチャ履歴等）は、すべて利用者の端末内（ブラウザのローカルストレージ）に保存され、当方のサーバー等へ送信されることはありません。
            </p>
            <p className="text-xs text-orange-400 mt-2">
              ※データはブラウザ内にのみ存在するため、ブラウザのキャッシュ削除やストレージの消去を行うと、すべての進捗がリセットされます。復旧やデータ移行の機能は提供しておりません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">2. 広告について</h3>
            <p className="text-sm">
              本アプリでは、ジェム報酬の獲得等のために動画広告を表示する場合があります。広告の表示・配信においては、広告配信事業者が端末識別子やCookie等の技術を利用して非個人情報を取得する場合があります。詳細については、各広告配信事業者のポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">3. お問い合わせ時の対応</h3>
            <p className="text-sm">
              お問い合わせフォーム等を通じてお送りいただいた情報については、回答およびサービス改善の目的にのみ利用し、法令に基づく場合を除き第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">4. プライバシーポリシーの変更</h3>
            <p className="text-sm">
              当方は、必要に応じて本プライバシーポリシーを変更することがあります。変更した場合には、本アプリ内または公式サイトにて告知いたします。
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

export default Privacy;
