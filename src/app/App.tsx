import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Search, BookOpen, RotateCcw, ChevronRight } from "lucide-react";

type Mode = "question" | "theme" | "random";

const THEMES = [
  { id: "threshold", label: "优先级", glyph: "◇" },
  { id: "seed", label: "需求", glyph: "✶" },
  { id: "shadow", label: "风险", glyph: "◐" },
  { id: "current", label: "节奏", glyph: "≈" },
  { id: "vessel", label: "团队", glyph: "◎" },
  { id: "return", label: "数据", glyph: "∴" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

const ASSERTIONS: Record<ThemeId, string[]> = {
  threshold: [
    "若必须同时向三类人解释价值，先收窄那扇门。",
    "门槛不是阻碍，是替你筛掉不该进入的人。",
    "此刻宜定边界，不宜扩版图。",
    "若一句话说不清要给谁，答案尚未落地。",
    "真正的选择，常表现为删掉一个看似无害的选项。",
    "别问能不能做，先问做完后谁会立刻少一分痛。",
    "如果每条路都显得合理，先选能最快暴露错误的那条。",
    "会议上的共识若无法写成验收条件，门还没有开。",
    "当代价被说得很轻，后面的路往往很重。",
    "不要把老板的点头误作用户的通行证。",
    "可以推进，但要让退出条件先站在门口。",
    "若范围一直膨胀，真正的问题正在逃走。",
    "此事不缺理由，缺一个不可替代的理由。",
    "先确认不做它会失去什么，再确认做它会得到什么。",
    "门外的噪声很多，门内只能容下一件最重要的事。",
    "把决定交给最小证据，而不是最大想象。",
  ],
  seed: [
    "先做一粒能被真实使用的种子，不要先画森林。",
    "需求若只在访谈里发光，还要等它在行为里发芽。",
    "最小版本不该显得贫瘠，它应当暴露最肥沃的部分。",
    "把第一滴水给最痛的场景，而不是最大的市场。",
    "若原型需要长篇解释，它还没有学会自己说话。",
    "种子宜小，但根要扎进真实流程。",
    "不要急着求增长，先看第一个用户是否愿意回来。",
    "能被手工服务验证的，不必急着系统化。",
    "若没人愿意为绕路停下，那里可能没有需求。",
    "先让一个人离不开，再让一百个人看见。",
    "现在适合试探价格、频次和痛感，不适合宣布胜利。",
    "种子最怕被路线图压成装饰。",
    "若冷启动全靠补贴，土壤还没有回答。",
    "把功能做薄，把场景看深。",
    "第一批反馈不是裁判，是天气。",
    "会自然触发下一次打开的东西，才算开始生长。",
  ],
  shadow: [
    "阴影常藏在边界条件里，别只看主路径的顺滑。",
    "最安静的异常，可能是下个版本最大的债。",
    "若所有人都说影响不大，请找出那个会被影响的人。",
    "没被写进 PRD 的例外，会在上线后替自己报名。",
    "不要用乐观估时覆盖未知成本。",
    "反对声若来自一线，先把它当作信号而非阻力。",
    "技术债不是暗处的灰尘，它会改写未来的选择。",
    "若风险清单只有三行，可能是你还没有问对人。",
    "被绕开的流程，正在积累自己的权力。",
    "灰度不是护身符，它只给你看见裂缝的机会。",
    "如果失败无法被定义，成功也只是临时幻觉。",
    "先给最坏情况取名，它才会变小。",
    "当数据过于漂亮，去看漏斗之外的人。",
    "被客服反复转述的抱怨，不宜再归为个例。",
    "上线前的沉默，常常来自没人愿意说出不确定。",
    "真正的暗面不是做错，而是错了以后无处回滚。",
  ],
  current: [
    "水流变快时，先看上游指标，而不是催船夫。",
    "此刻宜小步校准，不宜重写路线图。",
    "快慢不是答案，反馈闭环的长度才是。",
    "节奏若只服务排期，不服务学习，船会越来越重。",
    "不要用连续上线掩盖方向尚未被验证。",
    "该等一等的时候，等的是数据成熟，不是情绪冷却。",
    "版本越密，越要知道每一次放水要观察什么。",
    "若窗口期正在关闭，先砍掉不会影响判断的枝叶。",
    "一次回滚不丢人，丢人的是没有给回滚留路。",
    "当所有人都催快，先确认快的是交付还是认知。",
    "流量突然涌入时，别急着庆祝，先看承接。",
    "今日宜试水，不宜把试验写成承诺。",
    "若节奏总被临时需求打断，说明河道还没修好。",
    "短期波动像浪花，留存的方向像潮汐。",
    "排期可以被压缩，学习不能被跳过。",
    "让下一次迭代回答一个问题，而不是满足一串愿望。",
  ],
  vessel: [
    "容器太满时，新需求会被误判为敌人。",
    "先修协作的杯沿，再讨论更大的酒。",
    "流程的形状，会偷偷决定产品的形状。",
    "不要把团队疲惫解释成执行力不足。",
    "若每个问题都要找你裁决，器皿还没有成形。",
    "边界不是推脱，是让责任不在路上蒸发。",
    "同一处反复溢出时，别再只加人。",
    "先把决策权放到离信息最近的地方。",
    "过大的项目会让关键价值变得稀薄。",
    "别让临时群聊长成正式流程。",
    "能被稳定承载的需求，才会被持续交付。",
    "接口松动时，小变更也会震成大事故。",
    "不必提高音量，先调整评审桌上的座位。",
    "当每个人都在搬运需求，先问谁在守目标。",
    "容器的价值不在装满 backlog，而在不漏掉意图。",
    "把隐形规则写出来，协作会自己变轻。",
  ],
  return: [
    "回声比发布会诚实，它只重复真正被用到的部分。",
    "不要急着解释数据，先确认埋点是否看见了人。",
    "被反复提起的细节，正在替优先级投票。",
    "沉默也是反馈，可能是无感，也可能是无路可走。",
    "若回声变小，可能不是需求弱了，而是入口偏了。",
    "真正的价值会回来，常常带着另一个使用场景。",
    "先看谁愿意第二次打开。",
    "不要只数新增，也要数离开前最后一次点击。",
    "重复出现的个例，已经不是个例。",
    "有些好评只是礼貌，有些抱怨才指向留存。",
    "回来的用户值得倾听，留下的路径值得敬畏。",
    "若听不见回声，先停止加功能，去改提问方式。",
    "每一次转化偏差，都是未来写来的便签。",
    "让事实自己说第二遍，再把结论写进复盘。",
    "答案不在最响的反馈，在最久不散的行为。",
    "若没有回声，说明它还没有真正进入用户的一天。",
  ],
};

const ALL_ASSERTIONS = Object.values(ASSERTIONS).flat();

const QUESTION_SIGNS: { test: RegExp; theme: ThemeId }[] = [
  { test: /要不要|该不该|是否|能不能|值得|选择|还是|取舍|推进|放弃/, theme: "threshold" },
  { test: /开始|新|机会|冷启动|起步|增长|扩|拉新|第一|从哪/, theme: "seed" },
  { test: /风险|担心|失败|卡住|问题|压力|反对|冲突|投诉|漏洞/, theme: "shadow" },
  { test: /何时|多久|快|慢|节奏|版本|发布|上线|迭代|等待|先后/, theme: "current" },
  { test: /团队|资源|协作|流程|研发|设计|老板|客户|边界|责任/, theme: "vessel" },
  { test: /结果|数据|反馈|留存|复盘|评价|声音|验证|指标|转化/, theme: "return" },
];

function pick(pool: string[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function matchByKeyword(q: string): string {
  const sign = QUESTION_SIGNS.find(({ test }) => test.test(q));

  if (!sign) return pick(ALL_ASSERTIONS);

  const veiledPool = [
    ...ASSERTIONS[sign.theme],
    ...ALL_ASSERTIONS.filter(() => Math.random() > 0.78),
  ];

  return pick(veiledPool);
}

export default function App() {
  const [mode, setMode] = useState<Mode>("random");
  const [question, setQuestion] = useState("");
  const [activeTheme, setActiveTheme] = useState<ThemeId | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [pending, setPending] = useState(false);

  const reveal = useCallback((text: string) => {
    setPending(true);
    setTimeout(() => {
      setAnswer(text);
      setRevealKey((k) => k + 1);
      setPending(false);
    }, 500);
  }, []);

  const handleQuestion = () => {
    if (!question.trim()) return;
    reveal(matchByKeyword(question));
  };

  const handleTheme = (id: ThemeId) => {
    setActiveTheme(id);
    reveal(pick(ASSERTIONS[id]));
  };

  const handleRandom = () => reveal(pick(ALL_ASSERTIONS));

  const handleAgain = () => {
    if (mode === "random") handleRandom();
    else if (mode === "theme" && activeTheme) handleTheme(activeTheme);
    else handleQuestion();
  };

  const reset = () => {
    setAnswer(null);
    setQuestion("");
    setActiveTheme(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-serif flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden select-none">
      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #b8955a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Center vertical hairline */}
      <div className="fixed top-0 left-1/2 -translate-x-px w-px h-full bg-gradient-to-b from-transparent via-[#b8955a]/8 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="text-center z-10">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#b8955a]/50" />
          <span className="text-[#b8955a]/70 text-[10px] tracking-[0.4em] font-mono uppercase">
            Book of Product Omens
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#b8955a]/50" />
        </div>
        <h1 className="text-5xl md:text-6xl font-light tracking-[0.15em] text-foreground">
          产品之书
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-[#b8955a]/25" />
          <div className="w-1 h-1 bg-[#b8955a]/40 rounded-full" />
          <div className="h-px w-8 bg-[#b8955a]/25" />
        </div>
      </header>

      {/* Oracle stage */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-xl z-10 py-12 relative">
        <AnimatePresence mode="wait">
          {!answer ? (
            <motion.div
              key="input-stage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {/* Mode switcher */}
              <div className="flex justify-center gap-0 mb-12 border border-[#b8955a]/15">
                {(
                  [
                    { id: "question", label: "提问", Icon: Search },
                    { id: "theme", label: "主题", Icon: BookOpen },
                    { id: "random", label: "随缘", Icon: Shuffle },
                  ] as { id: Mode; label: string; Icon: typeof Search }[]
                ).map(({ id, label, Icon }, i) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-[0.25em] font-mono transition-all duration-300 ${
                      i < 2 ? "border-r border-[#b8955a]/15" : ""
                    } ${
                      mode === id
                        ? "bg-[#b8955a]/10 text-[#b8955a]"
                        : "text-muted-foreground hover:text-foreground hover:bg-[#b8955a]/5"
                    }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {mode === "question" && (
                  <motion.div
                    key="q"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-muted-foreground text-xs mb-6 tracking-[0.2em] font-mono">
                      写下疑问，翻开答案
                    </p>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleQuestion();
                        }
                      }}
                      placeholder="例如：这件事现在要不要推进？"
                      rows={3}
                      className="w-full bg-transparent border border-[#b8955a]/20 focus:border-[#b8955a]/45 text-foreground placeholder:text-muted-foreground/35 text-center resize-none outline-none px-6 py-5 text-sm leading-loose tracking-wider transition-all duration-400 font-serif"
                    />
                    <button
                      onClick={handleQuestion}
                      disabled={!question.trim() || pending}
                      className="mt-6 px-12 py-3 border border-[#b8955a]/35 text-[#b8955a] text-xs tracking-[0.3em] font-mono hover:bg-[#b8955a]/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      翻开答案
                    </button>
                  </motion.div>
                )}

                {mode === "theme" && (
                  <motion.div
                    key="t"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-muted-foreground text-xs mb-8 tracking-[0.2em] font-mono">
                      选择此刻最接近的主题
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleTheme(t.id)}
                          disabled={pending}
                          className="py-4 px-4 border border-[#b8955a]/12 hover:border-[#b8955a]/40 hover:bg-[#b8955a]/5 text-sm tracking-widest text-foreground/70 hover:text-foreground transition-all duration-300 flex items-center justify-center gap-2.5 group disabled:opacity-40"
                        >
                          <span className="text-[#b8955a]/50 group-hover:text-[#b8955a] transition-colors text-base font-mono">
                            {t.glyph}
                          </span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {mode === "random" && (
                  <motion.div
                    key="r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-muted-foreground text-xs mb-14 tracking-[0.2em] font-mono">
                      放下执念，让书给你一个答案
                    </p>
                    <button
                      onClick={handleRandom}
                      disabled={pending}
                      className="relative group mx-auto flex items-center justify-center w-44 h-44 disabled:opacity-40"
                    >
                      <div className="absolute inset-0 border border-[#b8955a]/18 rounded-full transition-all duration-700 group-hover:scale-110 group-hover:border-[#b8955a]/40" />
                      <div className="absolute inset-5 border border-[#b8955a]/10 rounded-full transition-all duration-700 group-hover:scale-105 group-hover:border-[#b8955a]/25" />
                      <div className="absolute inset-10 border border-[#b8955a]/06 rounded-full" />

                      <div className="relative z-10 text-center">
                        <div className="text-4xl text-[#b8955a]/75 mb-1.5 group-hover:scale-110 transition-transform duration-400 leading-none">
                          册
                        </div>
                        <div className="text-[10px] text-muted-foreground tracking-[0.3em] font-mono">
                          翻　开
                        </div>
                      </div>

                      {/* Slow orbit dot */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#b8955a]/35 rounded-full" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-[#b8955a]/20 rounded-full" />
                      </motion.div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key={`answer-${revealKey}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full"
            >
              {/* Top ornament */}
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-[#b8955a]/35" />
                <span className="text-[#b8955a]/55 text-[10px] tracking-[0.4em] font-mono">— 书曰 —</span>
                <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-[#b8955a]/35" />
              </div>

              {/* The answer */}
              <motion.blockquote
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl font-light leading-[2.2] tracking-wider text-foreground px-4"
              >
                {answer}
              </motion.blockquote>

              {/* Bottom ornament */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10 flex items-center justify-center gap-2"
              >
                <div className="h-px w-8 bg-[#b8955a]/20" />
                <div className="w-1 h-1 rounded-full bg-[#b8955a]/30" />
                <div className="h-px w-8 bg-[#b8955a]/20" />
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-10 flex items-center justify-center gap-8"
              >
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[11px] tracking-[0.25em] font-mono transition-colors group"
                >
                  <RotateCcw
                    size={11}
                    className="group-hover:-rotate-180 transition-transform duration-500"
                  />
                  重新提问
                </button>
                <div className="w-px h-3 bg-[#b8955a]/20" />
                <button
                  onClick={handleAgain}
                  className="flex items-center gap-2 text-[#b8955a]/65 hover:text-[#b8955a] text-[11px] tracking-[0.25em] font-mono transition-colors"
                >
                  再翻一页
                  <ChevronRight size={11} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revealing overlay */}
        <AnimatePresence>
          {pending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
            >
              <motion.div
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-[#b8955a]/60 tracking-[0.5em] font-mono text-xs"
              >
                · · ·
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="z-10 text-center">
        <p className="text-muted-foreground/30 text-[10px] tracking-[0.35em] font-mono">
          答案不负责解释，只负责出现
        </p>
      </footer>
    </div>
  );
}
