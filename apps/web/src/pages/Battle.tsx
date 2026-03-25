import { useState, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { Heart, Droplet, Zap, Shield, Sword, ArrowRight, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
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
  3: { name: '魔王コレステロール・キング', hp: 3000, maxHp: 3000, minAtk: 70, maxAtk: 90, image: '/images/cholesterol_king.png', intro: '「我こそは成人病の王なり……健康など不要！」' },
};

const STORY_TEXT: Record<number, string[]> = {
  1: ['4月1日、朝。', '世界は突如として脂と糖質に覆われた。', '人々が胃もたれで苦しむ中、一人の戦士が立ち上がる。', '青汁マイスター「この苦味こそが、世界を救う力なんだ！」', 'まずは朝食の平和を取り戻すため、ベーコン将軍を倒せ！'],
  2: ['昼時、オフィス街。', '強烈な睡魔がサラリーマンたちを襲う。', 'これはただの昼寝ではない……炭水化物の呪いだ！', '社長「マイスター君！午後もバリバリ働くには青汁が必要だ！」', '炭水化物の化け物を倒し、生産性を取り戻せ！'],
  3: ['夕暮れ時。', '全ての元凶、魔王コレステロール・キングが姿を現した。', 'マイスター「これで終わりだ……みんなの健康は俺が守る！」', 'ケナ氏「映えより健康！みんな応援して！」', '最後の戦いが始まる……！'],
};

const SKILL_COST = 30;
const MAX_MP = 100;

export const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { consumeAp, addGold, addExp, getBattleStats } = useGame();

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
    const HEAL = 120;
    setPlayerHp(prev => {
      const next = Math.min(maxHp, prev + HEAL);
      addLog(`🧃 青汁ポーションを飲んだ！ HPが${next - prev}回復した。`);
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
  };

  // ---- Screens ----

  if (gameState === 'STORY') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full border border-gray-600 shadow-2xl relative">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Episode {questId}</h2>
          <p className="text-xl leading-relaxed mb-12 min-h-[100px]">{STORY_TEXT[questId][currentStoryIndex]}</p>
          <button onClick={handleStoryNext} className="absolute bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-all animate-bounce">
            Next <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </Layout>
  );

  if (gameState === 'WIN') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/40 p-12 rounded-xl text-center border border-yellow-500/50 backdrop-blur-md">
          <h1 className="text-5xl font-bold text-yellow-400 mb-4 drop-shadow-lg">QUEST CLEAR!</h1>
          <p className="text-xl text-white mb-2">「この一杯のために生きている！」</p>
          <div className="flex justify-center gap-6 my-6 text-sm font-mono">
            <span className="text-yellow-400">GOLD +{(quest?.goldReward ?? 1000).toLocaleString()}</span>
            <span className="text-blue-400">EXP +{Math.floor((quest?.goldReward ?? 1000) / 10).toLocaleString()}</span>
          </div>
          <button onClick={() => navigate('/quest')} className="mt-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold">
            クエスト一覧へ戻る
          </button>
        </div>
      </div>
    </Layout>
  );

  if (gameState === 'GAMEOVER') return (
    <Layout>
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-gradient-to-br from-red-900/40 to-gray-900 p-12 rounded-xl text-center border border-red-700/50 backdrop-blur-md">
          <h1 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-lg animate-pulse">GAME OVER</h1>
          <p className="text-xl text-gray-300 mb-2">「青汁が……足りなかった……」</p>
          <p className="text-sm text-gray-500 mb-8">健康は一日にして成らず……</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/quest')} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold">クエスト一覧へ戻る</button>
            <button onClick={() => navigate('/battle', { state: { questId } })} className="px-8 py-3 bg-red-800 hover:bg-red-700 border border-red-600 rounded-lg text-white font-bold">リトライ</button>
          </div>
        </div>
      </div>
    </Layout>
  );

  const disabled = !isPlayerTurn;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">

        {/* Battle Area */}
        <div className="flex-1 bg-gray-900 rounded-xl relative overflow-hidden border border-gray-700 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: enemyData.bgImage ? `url('${enemyData.bgImage}')` : "url('https://placehold.co/1200x800/222/333?text=Battle+Background')" }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="z-10 flex flex-col items-center animate-[float_3s_ease-in-out_infinite]">
            <div className="filter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
              <img src={enemyData.image} alt={enemyData.name} className="w-64 h-64 object-contain" />
            </div>
            <div className="mt-4 bg-gray-900/80 p-3 rounded-lg border border-red-900/50 backdrop-blur-sm w-64">
              <h3 className="text-red-400 font-bold text-center mb-1">{enemyData.name}</h3>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-500 origin-left" style={{ transform: `scaleX(${enemyHp / enemyData.maxHp})` }} />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1 font-mono">{enemyHp.toLocaleString()} / {enemyData.maxHp.toLocaleString()}</p>
            </div>
          </div>
          {!isPlayerTurn && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-600 text-red-300 text-sm px-4 py-1 rounded-full font-bold animate-pulse backdrop-blur">
              {enemyData.name}のターン……
            </div>
          )}
          {isGuarding && isPlayerTurn && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-900/80 border border-blue-600 text-blue-300 text-sm px-4 py-1 rounded-full font-bold backdrop-blur">
              🛡️ 防御態勢中
            </div>
          )}
        </div>

        {/* HUD */}
        <div className="h-48 grid grid-cols-12 gap-4">

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
              { label: 'アイテム',     sub: 'HP +120回復',  icon: <Package size={24} />, cls: 'from-yellow-900/70 to-gray-800 hover:from-yellow-800/80 hover:to-yellow-900/60 border-yellow-700/60 hover:border-yellow-400', textCls: 'text-yellow-100', subCls: 'text-yellow-300', iconCls: 'text-yellow-400 group-hover:text-yellow-300', fn: handleItem },
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
          <div className="col-span-3 bg-black/60 rounded-xl p-3 border border-gray-700 overflow-hidden font-mono text-sm shadow-inner">
            <div className="flex flex-col justify-end h-full">
              {battleLog.map((log, i) => (
                <p key={i} className={clsx('mb-1', i === battleLog.length - 1 ? 'text-white font-bold' : 'text-gray-500')}>
                  {i === battleLog.length - 1 ? '> ' : ''}{log}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Battle;
