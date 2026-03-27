import { useState, useCallback, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Heart, Droplet, Zap, Shield, Sword, ArrowRight, Package, LogOut, Share2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useNavigationGuard } from '../context/NavigationGuardContext';
import { QUEST_MAP } from '../store/quests';

// ============================================================
// Enemy master data (local to battle)
// ============================================================

type EnemyData = {
  name: string; hp: number; maxHp: number;
  minAtk: number; maxAtk: number; image: string; intro: string;
  bgImage?: string;
};

const ENEMIES: Record<number, EnemyData> = {
  1: { name: 'カリカリベーコン将軍', hp: 600,  maxHp: 600,  minAtk: 15, maxAtk: 25, image: '/images/bacon_general.png',          intro: '「朝から脂ギッシュにしてやるぜぇ……！」', bgImage: '/images/bacon_general_bg.png' },
  2: { name: '炭水化物・ザ・グレート', hp: 1500, maxHp: 1500, minAtk: 40, maxAtk: 55, image: '/images/carb_the_great.png', intro: '「血糖値を上げてやる……眠くなれぇ……」', bgImage: '/images/carb_the_great_bg.png' },
  3: { name: '魔王コレステロール・キング', hp: 3000, maxHp: 3000, minAtk: 70, maxAtk: 90, image: '/images/cholesterol_king.png', intro: '「我こそは成人病の王なり……健康など不要！」', bgImage: '/images/cholesterol_king_bg.png' },
  4: { name: 'スイーツ魔人ショートケーキ', hp: 2000, maxHp: 2000, minAtk: 50, maxAtk: 70, image: '/images/sweets_majin.png', intro: '「あま〜い罠から逃れられるかな？」', bgImage: '/images/sweets_majin_bg.png' },
  5: { name: '深夜のラーメン怪人', hp: 4000, maxHp: 4000, minAtk: 80, maxAtk: 100, image: '/images/ramen_kaijin.png', intro: '「寝る前に…すすってけよ……」', bgImage: '/images/ramen_kaijin_bg.png' },
  6: { name: '終わらない飲み会部長', hp: 2500, maxHp: 2500, minAtk: 60, maxAtk: 80, image: '/images/nomikai_bucho.png', intro: '「まだまだ帰さんぞ～！次行くぞ次！」', bgImage: '/images/nomikai_bucho_bg.png' },
};

const STORY_TEXT: Record<number, string[]> = {
  1: ['4月1日、朝。', '世界は突如として脂と糖質に覆われた。', '人々が胃もたれで苦しむ中、一人の戦士が立ち上がる。', '青汁マイスター「この苦味こそが、世界を救う力なんだ！」', 'まずは朝食の平和を取り戻すため、ベーコン将軍を倒せ！'],
  2: ['昼時、オフィス街。', '強烈な睡魔がサラリーマンたちを襲う。', 'これはただの昼寝ではない……炭水化物の呪いだ！', '社長「マイスター君！午後もバリバリ働くには青汁が必要だ！」', '炭水化物の化け物を倒し、生産性を取り戻せ！'],
  3: ['夕暮れ時。', '全ての元凶、魔王コレステロール・キングが姿を現した。', 'マイスター「これで終わりだ……みんなの健康は俺が守る！」', 'ケナ氏「映えより健康！みんな応援して！」', '最後の戦いが始まる……！'],
  4: ['夕立の中、甘い匂いが漂う。', 'マイスター「この誘惑は……おやつだ！」', '最終決戦を前に、油断を誘う甘い罠。', 'ショートケーキ魔人が立ちふさがる！', '糖分を振り払い、魔王のもとへ急げ！'],
  5: ['魔王を倒し、世界に平和が訪れた……ように見えた。', 'しかし、深夜0時。', '強烈な空腹感がマイスターを襲う。', 'マイスター「こ、これは……深夜ラーメンの誘惑！」', '真の恐ろしさは、寝る前の炭水化物だった！'],
  6: ['時計の針が進むと、どこからともなく宴会の声が。', '「お疲れ様です！カンパーイ！」', '突発的に発生する飲み会……断れない雰囲気。', 'マイスター「肝臓への負担も青汁でカバーする！」', '終わらない飲み会から無事に帰還せよ！'],
};

const SKILL_COST = 30;
const MAX_MP = 100;

export const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { consumeAp, addGold, addExp, getBattleStats, markQuestCleared, items, useItem } = useGame();

  const questId = (location.state?.questId as number) || 1;
  const enemyData = ENEMIES[questId] || ENEMIES[1];
  const quest = QUEST_MAP[questId];

  // 編成ステータスをバトル開始時に確定
  const [battleStats] = useState(() => getBattleStats());
  const { maxHp, baseAtk, atkRange } = battleStats;

  const [gameState, setGameState] = useState<'STORY' | 'BATTLE' | 'WIN' | 'GAMEOVER'>('STORY');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([`${enemyData.name}が現れた！`, enemyData.intro]);
  const [enemyHp, setEnemyHp] = useState(enemyData.hp);
  const [playerHp, setPlayerHp] = useState(maxHp);
  const [playerMp, setPlayerMp] = useState(MAX_MP);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isGuarding, setIsGuarding] = useState(false);

  // 戦闘中・ストーリー中の画面遷移をブロック
  const { guardedNavigate, setBlocked, pendingPath, confirmNavigation, cancelNavigation } = useNavigationGuard();
  const shouldBlock = gameState === 'BATTLE' || gameState === 'STORY';

  useEffect(() => {
    setBlocked(shouldBlock);
    return () => setBlocked(false);
  }, [shouldBlock, setBlocked]);

  // ブラウザのリロード・タブ閉じ時にも確認
  useEffect(() => {
    if (!shouldBlock) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [shouldBlock]);

  const addLog = useCallback((msg: string) => {
    setBattleLog(prev => [...prev.slice(-4), msg]);
  }, []);

  const handleStoryNext = () => {
    if (currentStoryIndex < STORY_TEXT[questId].length - 1) {
      setCurrentStoryIndex(p => p + 1);
    } else {
      // AP消費はバトル開始時
      consumeAp(quest?.stamina ?? 10);
      setGameState('BATTLE');
      addLog('戦闘開始！');
    }
  };

  const doEnemyTurn = (guarding: boolean) => {
    setIsPlayerTurn(false);
    setTimeout(() => {
      const base = enemyData.minAtk + Math.floor(Math.random() * (enemyData.maxAtk - enemyData.minAtk + 1));
      const dmg = guarding ? Math.floor(base * 0.5) : base;
      const guardText = guarding ? '（防御！ダメージ半減！）' : '';
      setIsGuarding(false);
      setPlayerHp(prev => {
        const next = Math.max(0, prev - dmg);
        if (next === 0) {
          setGameState('GAMEOVER');
          addLog(`${enemyData.name}の攻撃！ ${dmg}のダメージ${guardText}……倒れてしまった！`);
        } else {
          addLog(`${enemyData.name}の攻撃！ ${dmg}のダメージを受けた！${guardText}`);
          setIsPlayerTurn(true);
        }
        return next;
      });
    }, 800);
  };

  const handleAttack = () => {
    if (!isPlayerTurn) return;
    const dmg = baseAtk + Math.floor(Math.random() * atkRange);
    const newHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newHp);
    addLog(`青汁マイスターの攻撃！ ${enemyData.name}に${dmg}のダメージ！`);
    if (newHp === 0) { handleWin(); return; }
    doEnemyTurn(false);
  };

  const handleSkill = () => {
    if (!isPlayerTurn) return;
    if (playerMp < SKILL_COST) { addLog(`AOJIRUが足りない！（必要: ${SKILL_COST}）`); return; }
    const dmg = Math.floor((baseAtk + Math.floor(Math.random() * atkRange)) * 2.5);
    const newHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newHp);
    setPlayerMp(p => p - SKILL_COST);
    addLog(`💚 青汁ストーム！ ${enemyData.name}に${dmg}の大ダメージ！`);
    if (newHp === 0) { handleWin(); return; }
    doEnemyTurn(false);
  };

  const handleGuard = () => {
    if (!isPlayerTurn) return;
    setIsGuarding(true);
    setPlayerMp(p => Math.min(MAX_MP, p + 10));
    addLog('🛡️ 防御態勢！ 次の攻撃のダメージを半減。AOJIRU+10！');
    doEnemyTurn(true);
  };

  const handleItem = () => {
    if (!isPlayerTurn) return;
    if (items.aojiruPotion <= 0) { addLog('青汁ポーションがない！ ショップで購入しよう。'); return; }
    if (!useItem('aojiruPotion')) return;
    const HEAL = 120;
    setPlayerHp(prev => {
      const next = Math.min(maxHp, prev + HEAL);
      addLog(`🧃 青汁ポーションを飲んだ！ HPが${next - prev}回復した。（残り${items.aojiruPotion - 1}個）`);
      return next;
    });
    doEnemyTurn(false);
  };

  const handleWin = () => {
    const gold = quest?.goldReward ?? 1000;
    const exp  = gold / 10;
    setGameState('WIN');
    addLog(`${enemyData.name}を倒した！`);
    addGold(gold);
    addExp(exp);
    markQuestCleared(questId);
  };

  // ---- Screens ----

  if (gameState === 'STORY') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100dvh-8rem)]">
        <div className="bg-gray-800 p-6 md:p-8 rounded-xl max-w-2xl w-full border border-gray-600 shadow-2xl relative">
          <h2 className={clsx("text-xl md:text-2xl font-bold mb-4 md:mb-6", quest?.guerrilla ? "text-orange-400" : "text-green-400")}>
            {quest?.guerrilla ? 'GUERRILLA' : `Episode ${questId}`}
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-16 md:mb-12 min-h-[80px] md:min-h-[100px]">{STORY_TEXT[questId][currentStoryIndex]}</p>
          <button onClick={handleStoryNext} className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-all animate-bounce text-sm md:text-base">
            Next <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </Layout>
  );

  const isExtraStage = questId === 5;
  const shareText = '【青汁戦記】エクストラステージをクリアして「超波動青汁割引券」をゲットした！深夜のラーメン怪人を倒したぞ！ #青汁戦記 #超波動青汁';
  const shareUrl = window.location.origin;

  const handleShareTwitter = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const handleShareBluesky = () => {
    window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };
  const handleShareFediverse = () => {
    const text = encodeURIComponent(shareText + '\n' + shareUrl);
    window.open(`https://donshare.net/share.html?text=${text}`, '_blank');
  };

  if (gameState === 'WIN') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100dvh-8rem)]">
        <div className={clsx(
          'p-8 md:p-12 rounded-xl text-center border backdrop-blur-md mx-4 max-w-lg w-full',
          isExtraStage
            ? 'bg-gradient-to-br from-purple-600/30 to-green-900/40 border-green-400/50'
            : 'bg-gradient-to-br from-yellow-600/20 to-yellow-900/40 border-yellow-500/50'
        )}>
          <h1 className={clsx(
            'text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg',
            isExtraStage ? 'text-green-400' : 'text-yellow-400'
          )}>
            {isExtraStage ? 'EXTRA STAGE CLEAR!' : 'QUEST CLEAR!'}
          </h1>
          <p className="text-lg md:text-xl text-white mb-2">
            {isExtraStage ? '「深夜の誘惑に打ち勝った……これぞ青汁の極み！」' : '「この一杯のために生きている！」'}
          </p>
          <div className="flex justify-center gap-4 md:gap-6 my-6 text-sm font-mono">
            <span className="text-yellow-400">GOLD +{(quest?.goldReward ?? 1000).toLocaleString()}</span>
            <span className="text-blue-400">EXP +{Math.floor((quest?.goldReward ?? 1000) / 10).toLocaleString()}</span>
          </div>

          {isExtraStage && (
            <>
              {/* 超波動青汁割引券 */}
              <div className="my-6 relative">
                <div className="bg-gradient-to-r from-green-800 via-green-600 to-green-800 border-2 border-dashed border-green-300 rounded-xl p-5 md:p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                    SPECIAL REWARD
                  </div>
                  <p className="text-green-200 text-xs mb-2 tracking-widest">COUPON</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">超波動青汁割引券</h2>
                  <p className="text-green-300 text-sm mb-3">全商品 30%OFF</p>
                  <div className="border-t border-green-500/50 pt-3 mt-3">
                    <p className="text-green-400/80 text-[10px] md:text-xs font-mono">
                      ※ この割引券はフィクションです。実在の青汁とは関係ありません。
                    </p>
                  </div>
                </div>
              </div>

              {/* SNS投稿ボタン */}
              <div className="my-6">
                <p className="text-gray-400 text-xs mb-3 flex items-center justify-center gap-1.5">
                  <Share2 size={14} /> クリアを共有する
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleShareBluesky}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0085ff] hover:bg-[#0070dd] text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 600 530" className="w-4 h-4 fill-current"><path d="M135.72 44.03C202.216 93.951 273.74 195.17 300 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.017-2.935-1.193.516-3.707 7.896-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.256 82.697-152.22-67.108 11.421-142.549-7.449-163.25-81.433C20.15 217.613 9.997 86.535 9.997 68.825c0-88.687 77.742-60.816 125.723-24.795z"/></svg>
                    Bluesky
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-lg border border-gray-600 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </button>
                  <button
                    onClick={handleShareFediverse}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#6364FF] hover:bg-[#5253dd] text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.433-2.22.397-5.424.397-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.904 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.41 2.405 1.228l.518.869.519-.869c.533-.818 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z"/></svg>
                    Fediverse
                  </button>
                </div>
              </div>
            </>
          )}

          <button onClick={() => navigate('/quest')} className="mt-2 px-6 md:px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold">
            クエスト一覧へ戻る
          </button>
        </div>
      </div>
    </Layout>
  );

  if (gameState === 'GAMEOVER') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100dvh-8rem)]">
        <div className="bg-gradient-to-br from-red-900/40 to-gray-900 p-8 md:p-12 rounded-xl text-center border border-red-700/50 backdrop-blur-md mx-4">
          <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-4 drop-shadow-lg animate-pulse">GAME OVER</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2">「青汁が……足りなかった……」</p>
          <p className="text-sm text-gray-500 mb-6 md:mb-8">健康は一日にして成らず……</p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
            <button onClick={() => navigate('/quest')} className="px-6 md:px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold">クエスト一覧へ戻る</button>
            <button onClick={() => navigate('/battle', { state: { questId } })} className="px-6 md:px-8 py-3 bg-red-800 hover:bg-red-700 border border-red-600 rounded-lg text-white font-bold">リトライ</button>
          </div>
        </div>
      </div>
    </Layout>
  );

  const disabled = !isPlayerTurn;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100dvh-8rem)] gap-2 md:gap-4">

        {/* Mobile: Player Status Bar (above battle area) */}
        <div className="md:hidden flex gap-2">
          <div className="flex-1 bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className={clsx('w-3.5 h-3.5 transition-colors', playerHp < maxHp * 0.3 ? 'text-red-400 animate-pulse' : 'text-red-500')} />
              <span className="text-[10px] text-gray-400">HP</span>
              <span className="text-[10px] font-mono text-gray-300 ml-auto">{playerHp}/{maxHp}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={clsx('h-full transition-all duration-300', playerHp < maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500')} style={{ width: `${(playerHp / maxHp) * 100}%` }} />
            </div>
          </div>
          <div className="flex-1 bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplet className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] text-gray-400">AOJIRU</span>
              <span className="text-[10px] font-mono text-gray-300 ml-auto">{playerMp}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${playerMp}%` }} />
            </div>
          </div>
        </div>

        {/* Battle Area */}
        <div className="flex-1 bg-gray-900 rounded-xl relative overflow-hidden border border-gray-700 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: enemyData.bgImage ? `url('${enemyData.bgImage}')` : "url('https://placehold.co/1200x800/222/333?text=Battle+Background')" }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="z-10 flex flex-col items-center animate-[float_3s_ease-in-out_infinite]">
            <div className="filter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
              <img src={enemyData.image} alt={enemyData.name} className="w-56 h-56 md:w-96 md:h-96 object-contain" />
            </div>
            <div className="mt-3 md:mt-4 bg-gray-900/80 p-2 md:p-3 rounded-lg border border-red-900/50 backdrop-blur-sm w-48 md:w-64">
              <h3 className="text-red-400 font-bold text-center mb-1 text-sm md:text-base">{enemyData.name}</h3>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-500 origin-left" style={{ transform: `scaleX(${enemyHp / enemyData.maxHp})` }} />
              </div>
              <p className="text-right text-[10px] md:text-xs text-gray-400 mt-1 font-mono">{enemyHp.toLocaleString()} / {enemyData.maxHp.toLocaleString()}</p>
            </div>
          </div>
          {!isPlayerTurn && (
            <div className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-600 text-red-300 text-xs md:text-sm px-3 md:px-4 py-1 rounded-full font-bold animate-pulse backdrop-blur">
              {enemyData.name}のターン……
            </div>
          )}
          {isGuarding && isPlayerTurn && (
            <div className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 bg-blue-900/80 border border-blue-600 text-blue-300 text-xs md:text-sm px-3 md:px-4 py-1 rounded-full font-bold backdrop-blur">
              🛡️ 防御態勢中
            </div>
          )}

          {/* Mobile: Battle Log overlay */}
          <div className="md:hidden absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg p-2 backdrop-blur-sm border border-gray-700/50 max-h-16 overflow-hidden">
            {battleLog.slice(-2).map((log, i) => (
              <p key={i} className={clsx('text-[11px] font-mono leading-tight', i === battleLog.slice(-2).length - 1 ? 'text-white font-bold' : 'text-gray-500')}>
                {i === battleLog.slice(-2).length - 1 ? '> ' : ''}{log}
              </p>
            ))}
          </div>
        </div>

        {/* HUD - Desktop */}
        <div className="hidden md:grid h-48 grid-cols-12 gap-4">

          {/* Player Status */}
          <div className="col-span-3 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg flex flex-col gap-2">
            <h3 className="font-bold text-lg text-white border-b border-gray-700 pb-2">青汁マイスター</h3>
            <div className="flex items-center gap-2">
              <Heart className={clsx('transition-colors', playerHp < maxHp * 0.3 ? 'text-red-400 animate-pulse' : 'text-red-500')} size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5"><span>HP</span><span>{playerHp} / {maxHp}</span></div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className={clsx('h-full transition-all duration-300', playerHp < maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500')} style={{ width: `${(playerHp / maxHp) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Droplet className="text-green-500" size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5"><span>AOJIRU</span><span>{playerMp}%</span></div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${playerMp}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Commands */}
          <div className="col-span-6 grid grid-cols-2 gap-2">
            {([
              { label: '攻撃 (Attack)', sub: null,           icon: <Sword size={24} />,   cls: 'from-red-900/70 to-gray-800 hover:from-red-800/80 hover:to-red-900/60 border-red-700/60 hover:border-red-400', textCls: 'text-red-100', subCls: undefined, iconCls: 'text-red-400 group-hover:text-red-300', fn: handleAttack },
              { label: '青汁スキル',   sub: `AOJIRU -${SKILL_COST}`, icon: <Zap size={24} />,    cls: 'from-green-900/70 to-gray-800 hover:from-green-800/80 hover:to-green-900/60 border-green-700/60 hover:border-green-400', textCls: 'text-green-100', subCls: 'text-green-400', iconCls: 'text-green-400 group-hover:text-green-300', fn: handleSkill },
              { label: '防御 (Guard)', sub: 'AOJIRU +10',   icon: <Shield size={24} />, cls: 'from-blue-900/70 to-gray-800 hover:from-blue-800/80 hover:to-blue-900/60 border-blue-700/60 hover:border-blue-400',   textCls: 'text-blue-100',  subCls: 'text-blue-300',  iconCls: 'text-blue-400 group-hover:text-blue-300',   fn: handleGuard },
              { label: 'アイテム',     sub: `回復+120 (残${items.aojiruPotion})`,  icon: <Package size={24} />, cls: 'from-yellow-900/70 to-gray-800 hover:from-yellow-800/80 hover:to-yellow-900/60 border-yellow-700/60 hover:border-yellow-400', textCls: 'text-yellow-100', subCls: items.aojiruPotion > 0 ? 'text-yellow-300' : 'text-red-400', iconCls: 'text-yellow-400 group-hover:text-yellow-300', fn: handleItem },
            ] as const).map(({ label, sub, icon, cls, textCls, subCls, iconCls, fn }) => (
              <button key={label} onClick={() => fn()} disabled={disabled}
                className={clsx('bg-gradient-to-br border rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed', cls)}>
                <span className={iconCls}>{icon}</span>
                <div className="flex flex-col items-start">
                  <span className={clsx('font-bold text-lg leading-none', textCls)}>{label}</span>
                  {sub && <span className={clsx('text-xs font-mono', subCls ?? textCls)}>{sub}</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Log */}
          <div className="col-span-3 bg-black/60 rounded-xl p-3 border border-gray-700 overflow-hidden font-mono text-sm shadow-inner flex flex-col">
            <div className="flex flex-col justify-end flex-1">
              {battleLog.map((log, i) => (
                <p key={i} className={clsx('mb-1', i === battleLog.length - 1 ? 'text-white font-bold' : 'text-gray-500')}>
                  {i === battleLog.length - 1 ? '> ' : ''}{log}
                </p>
              ))}
            </div>
            <button onClick={() => guardedNavigate('/quest')} className="mt-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-700 rounded-lg transition-colors">
              <LogOut size={14} /> 撤退
            </button>
          </div>
        </div>

        {/* HUD - Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-1.5">
          {([
            { label: '攻撃',    sub: null,           icon: <Sword size={18} />,   cls: 'from-red-900/70 to-gray-800 border-red-700/60 active:border-red-400', textCls: 'text-red-100',    iconCls: 'text-red-400',    fn: handleAttack },
            { label: 'スキル',  sub: `-${SKILL_COST}`, icon: <Zap size={18} />,    cls: 'from-green-900/70 to-gray-800 border-green-700/60 active:border-green-400', textCls: 'text-green-100',  iconCls: 'text-green-400',  fn: handleSkill },
            { label: '防御',    sub: '+10',          icon: <Shield size={18} />,  cls: 'from-blue-900/70 to-gray-800 border-blue-700/60 active:border-blue-400',  textCls: 'text-blue-100',   iconCls: 'text-blue-400',   fn: handleGuard },
            { label: 'アイテム', sub: `×${items.aojiruPotion}`,       icon: <Package size={18} />, cls: 'from-yellow-900/70 to-gray-800 border-yellow-700/60 active:border-yellow-400', textCls: items.aojiruPotion > 0 ? 'text-yellow-100' : 'text-red-300', iconCls: 'text-yellow-400', fn: handleItem },
          ] as const).map(({ label, sub, icon, cls, textCls, iconCls, fn }) => (
            <button key={label} onClick={() => fn()} disabled={disabled}
              className={clsx('bg-gradient-to-br border rounded-lg flex items-center justify-center gap-1.5 py-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed', cls)}>
              <span className={iconCls}>{icon}</span>
              <span className={clsx('font-bold text-sm', textCls)}>{label}</span>
              {sub && <span className={clsx('text-[10px] font-mono', textCls)}>{sub}</span>}
            </button>
          ))}
        </div>
        {/* Mobile retreat button */}
        <button onClick={() => guardedNavigate('/quest')} className="md:hidden flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-700 rounded-lg transition-colors">
          <LogOut size={14} /> 撤退する
        </button>
      </div>

    </Layout>
  );
};

export default Battle;
