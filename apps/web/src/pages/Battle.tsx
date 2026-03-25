import { useState, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { Heart, Droplet, Zap, Shield, Sword, ArrowRight, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

// Data Definitions
type EnemyData = {
  name: string;
  hp: number;
  maxHp: number;
  image: string;
  intro: string;
};

// ===== GAME BALANCE =====
// Quest 1 (Easy):   Enemy HP 600  / ATK 15-25  -> ~5 turns to kill, player survives 20+ hits
// Quest 2 (Medium): Enemy HP 1500 / ATK 40-55  -> ~11 turns to kill, player survives 9-12 hits (use skills/guard)
// Quest 3 (Hard):   Enemy HP 3000 / ATK 70-90  -> ~22 turns to kill, player survives 5-7 hits (must use all commands)

type EnemyStats = EnemyData & { minAtk: number; maxAtk: number };

const ENEMIES: Record<number, EnemyStats> = {
  1: {
    name: "カリカリベーコン将軍",
    hp: 600,
    maxHp: 600,
    minAtk: 15,
    maxAtk: 25,
    image: "/images/enemy.png",
    intro: "「朝から脂ギッシュにしてやるぜぇ……！」"
  },
  2: {
    name: "炭水化物・ザ・グレート",
    hp: 1500,
    maxHp: 1500,
    minAtk: 40,
    maxAtk: 55,
    image: "/images/potato_sniper.png",
    intro: "「血糖値を上げてやる……眠くなれぇ……」"
  },
  3: {
    name: "魔王コレステロール・キング",
    hp: 3000,
    maxHp: 3000,
    minAtk: 70,
    maxAtk: 90,
    image: "/images/cola_slime.png",
    intro: "「我こそは成人病の王なり……健康など不要！」"
  }
};

const STORY_TEXT: Record<number, string[]> = {
  1: [
    "4月1日、朝。",
    "世界は突如として脂と糖質に覆われた。",
    "人々が胃もたれで苦しむ中、一人の戦士が立ち上がる。",
    "青汁マイスター「この苦味こそが、世界を救う力なんだ！」",
    "まずは朝食の平和を取り戻すため、ベーコン将軍を倒せ！"
  ],
  2: [
    "昼時、オフィス街。",
    "強烈な睡魔がサラリーマンたちを襲う。",
    "これはただの昼寝ではない……炭水化物の呪いだ！",
    "社長「マイスター君！午後もバリバリ働くには青汁が必要だ！」",
    "炭水化物の化け物を倒し、生産性を取り戻せ！"
  ],
  3: [
    "夕暮れ時。",
    "全ての元凶、魔王コレステロール・キングが姿を現した。",
    "マイスター「これで終わりだ……みんなの健康は俺が守る！」",
    "ケナ氏「映えより健康！みんな応援して！」",
    "最後の戦いが始まる……！"
  ]
};

const MAX_HP = 500;
const MAX_MP = 100;
const SKILL_COST = 30;
// Player attack: 110-140 (avg ~125)
// Skill: ~312 dmg (2.5x avg)
// Item: heal 120 HP
const PLAYER_BASE_ATK = 110;
const PLAYER_ATK_RANGE = 30;
const ITEM_HEAL = 120;

export const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questId = location.state?.questId || 1;
  const enemyData = ENEMIES[questId] || ENEMIES[1];

  const [gameState, setGameState] = useState<'STORY' | 'BATTLE' | 'WIN' | 'GAMEOVER'>('STORY');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const [battleLog, setBattleLog] = useState<string[]>([
    `${enemyData.name}が現れた！`,
    enemyData.intro
  ]);

  const [enemyHp, setEnemyHp] = useState(enemyData.hp);
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [playerMp, setPlayerMp] = useState(MAX_MP);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isGuarding, setIsGuarding] = useState(false);

  const addLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  }, []);

  const handleStoryNext = () => {
    if (currentStoryIndex < STORY_TEXT[questId].length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setGameState('BATTLE');
      addLog("戦闘開始！");
    }
  };

  const doEnemyTurn = (guarding: boolean) => {
    setIsPlayerTurn(false);
    setTimeout(() => {
      const baseDmg = enemyData.minAtk + Math.floor(Math.random() * (enemyData.maxAtk - enemyData.minAtk + 1));
      const actualDmg = guarding ? Math.floor(baseDmg * 0.5) : baseDmg;
      const guardText = guarding ? "（防御！ダメージ半減！）" : "";
      setIsGuarding(false);
      setPlayerHp(prev => {
        const next = Math.max(0, prev - actualDmg);
        if (next === 0) {
          setGameState('GAMEOVER');
          addLog(`${enemyData.name}の攻撃！ ${actualDmg}のダメージ${guardText}……倒れてしまった！`);
        } else {
          addLog(`${enemyData.name}の攻撃！ ${actualDmg}のダメージを受けた！${guardText}`);
          setIsPlayerTurn(true);
        }
        return next;
      });
    }, 800);
  };

  const handleAttack = () => {
    if (!isPlayerTurn) return;
    const damage = PLAYER_BASE_ATK + Math.floor(Math.random() * PLAYER_ATK_RANGE);
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    addLog(`青汁マイスターの攻撃！ ${enemyData.name}に${damage}のダメージ！`);
    if (newEnemyHp === 0) {
      setGameState('WIN');
      addLog(`${enemyData.name}を倒した！`);
      return;
    }
    doEnemyTurn(false);
  };

  const handleSkill = () => {
    if (!isPlayerTurn) return;
    if (playerMp < SKILL_COST) {
      addLog(`AOJIRUが足りない！（必要: ${SKILL_COST}）`);
      return;
    }
    const damage = Math.floor((PLAYER_BASE_ATK + Math.floor(Math.random() * PLAYER_ATK_RANGE)) * 2.5);
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    setPlayerMp(prev => prev - SKILL_COST);
    addLog(`💚 青汁マイスターの必殺技・青汁ストーム！ ${enemyData.name}に${damage}の大ダメージ！`);
    if (newEnemyHp === 0) {
      setGameState('WIN');
      addLog(`${enemyData.name}を倒した！`);
      return;
    }
    doEnemyTurn(false);
  };

  const handleGuard = () => {
    if (!isPlayerTurn) return;
    setIsGuarding(true);
    setPlayerMp(prev => Math.min(MAX_MP, prev + 10));
    addLog("🛡️ 防御態勢！ 次の攻撃のダメージを半減する。AOJIRUを10回復！");
    doEnemyTurn(true);
  };

  const handleItem = () => {
    if (!isPlayerTurn) return;
    setPlayerHp(prev => {
      const next = Math.min(MAX_HP, prev + ITEM_HEAL);
      addLog(`🧃 青汁ポーションを飲んだ！ HPが${next - prev}回復した。`);
      return next;
    });
    doEnemyTurn(false);
  };

  // --- Screens ---

  if (gameState === 'STORY') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full border border-gray-600 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Episode {questId}</h2>
            <p className="text-xl leading-relaxed mb-12 min-h-[100px]">
              {STORY_TEXT[questId][currentStoryIndex]}
            </p>
            <button
              onClick={handleStoryNext}
              className="absolute bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-all animate-bounce"
            >
              Next <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (gameState === 'WIN') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/40 p-12 rounded-xl text-center border border-yellow-500/50 backdrop-blur-md">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4 drop-shadow-lg">QUEST CLEAR!</h1>
            <p className="text-xl text-white mb-8">「この一杯のために生きている！」</p>
            <button
              onClick={() => navigate('/quest')}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold"
            >
              クエスト一覧へ戻る
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="bg-gradient-to-br from-red-900/40 to-gray-900 p-12 rounded-xl text-center border border-red-700/50 backdrop-blur-md">
            <h1 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-lg animate-pulse">GAME OVER</h1>
            <p className="text-xl text-gray-300 mb-2">「青汁が……足りなかった……」</p>
            <p className="text-sm text-gray-500 mb-8">健康は一日にして成らず……</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/quest')}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-bold"
              >
                クエスト一覧へ戻る
              </button>
              <button
                onClick={() => navigate('/battle', { state: { questId } })}
                className="px-8 py-3 bg-red-800 hover:bg-red-700 border border-red-600 rounded-lg text-white font-bold"
              >
                リトライ
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const commandDisabled = !isPlayerTurn;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">

        {/* Battle Area (Enemy) */}
        <div className="flex-1 bg-gray-900 rounded-xl relative overflow-hidden border border-gray-700 flex items-center justify-center bg-[url('https://placehold.co/1200x800/222/333?text=Battle+Background')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40" />

          {/* Enemy Sprite & Status */}
          <div className={clsx("z-10 flex flex-col items-center transition-all duration-300", "animate-[float_3s_ease-in-out_infinite]")}>
            <div className="filter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
              <img src={enemyData.image} alt={enemyData.name} className="w-64 h-64 object-contain" />
            </div>
            <div className="mt-4 bg-gray-900/80 p-3 rounded-lg border border-red-900/50 backdrop-blur-sm w-64">
              <h3 className="text-red-400 font-bold text-center mb-1">{enemyData.name}</h3>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-full transition-all duration-500 origin-left" style={{ transform: `scaleX(${enemyHp / enemyData.maxHp})` }} />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1 font-mono">{enemyHp.toLocaleString()} / {enemyData.maxHp.toLocaleString()}</p>
            </div>
          </div>

          {/* Enemy turn indicator */}
          {!isPlayerTurn && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-600 text-red-300 text-sm px-4 py-1 rounded-full font-bold animate-pulse backdrop-blur">
              {enemyData.name}のターン……
            </div>
          )}

          {/* Guarding indicator */}
          {isGuarding && isPlayerTurn && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-900/80 border border-blue-600 text-blue-300 text-sm px-4 py-1 rounded-full font-bold backdrop-blur">
              🛡️ 防御態勢中
            </div>
          )}
        </div>

        {/* HUD Area (Player Status & Commands) */}
        <div className="h-48 grid grid-cols-12 gap-4">

          {/* Player Status */}
          <div className="col-span-3 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg flex flex-col gap-2">
            <h3 className="font-bold text-lg text-white border-b border-gray-700 pb-2">青汁マイスター</h3>

            <div className="flex items-center gap-2">
              <Heart className={clsx("transition-colors", playerHp < MAX_HP * 0.3 ? "text-red-400 animate-pulse" : "text-red-500")} size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>HP</span>
                  <span>{playerHp} / {MAX_HP}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full transition-all duration-300", playerHp < MAX_HP * 0.3 ? "bg-red-500" : "bg-green-500")}
                    style={{ width: `${(playerHp / MAX_HP) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Droplet className="text-green-500" size={20} />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>AOJIRU</span>
                  <span>{playerMp}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${playerMp}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Command Menu */}
          <div className="col-span-6 grid grid-cols-2 gap-2">
            <button
              onClick={handleAttack}
              disabled={commandDisabled}
              className="bg-gradient-to-br from-red-900/70 to-gray-800 hover:from-red-800/80 hover:to-red-900/60 border border-red-700/60 hover:border-red-400 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sword size={24} className="text-red-400 group-hover:text-red-300" />
              <span className="font-bold text-lg text-red-100">攻撃 (Attack)</span>
            </button>

            <button
              onClick={handleSkill}
              disabled={commandDisabled}
              className="bg-gradient-to-br from-green-900/70 to-gray-800 hover:from-green-800/80 hover:to-green-900/60 border border-green-700/60 hover:border-green-400 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap size={24} className="text-green-400 group-hover:text-green-300" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg text-green-100 leading-none">青汁スキル</span>
                <span className="text-xs text-green-400 font-mono">AOJIRU -{SKILL_COST}</span>
              </div>
            </button>

            <button
              onClick={handleGuard}
              disabled={commandDisabled}
              className="bg-gradient-to-br from-blue-900/70 to-gray-800 hover:from-blue-800/80 hover:to-blue-900/60 border border-blue-700/60 hover:border-blue-400 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shield size={24} className="text-blue-400 group-hover:text-blue-300" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg text-blue-100 leading-none">防御 (Guard)</span>
                <span className="text-xs text-blue-300 font-mono">AOJIRU +10</span>
              </div>
            </button>

            <button
              onClick={handleItem}
              disabled={commandDisabled}
              className="bg-gradient-to-br from-yellow-900/70 to-gray-800 hover:from-yellow-800/80 hover:to-yellow-900/60 border border-yellow-700/60 hover:border-yellow-400 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Package size={24} className="text-yellow-400 group-hover:text-yellow-300" />
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg text-yellow-100 leading-none">アイテム</span>
                <span className="text-xs text-yellow-300 font-mono">HP +{ITEM_HEAL}回復</span>
              </div>
            </button>
          </div>

          {/* Log Window */}
          <div className="col-span-3 bg-black/60 rounded-xl p-3 border border-gray-700 overflow-hidden font-mono text-sm shadow-inner">
            <div className="flex flex-col justify-end h-full">
              {battleLog.map((log, i) => (
                <p key={i} className={clsx("mb-1", i === battleLog.length - 1 ? "text-white font-bold" : "text-gray-500")}>
                  {i === battleLog.length - 1 ? "> " : ""}{log}
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
