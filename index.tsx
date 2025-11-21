import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { 
  Tent, 
  Flame, 
  Map as MapIcon, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  List, 
  Backpack,
  Tag,
  Maximize,
  Minimize,
  Languages,
  Code,
  Terminal,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react";

// --- Types ---

type SlideType = "intro" | "story" | "concept" | "quiz" | "challenge_lantern" | "challenge_list" | "outro";
type Language = "en" | "zh";

interface SlideConfig {
  id: number;
  type: SlideType;
  title: string;
  content: React.ReactNode;
}

// --- Translations ---

const TEXTS = {
  en: {
    title: "Xiao Qi's Compose Camping Trip",
    mission: "Mission:",
    missionDesc: "Set up the perfect campsite using:",
    start: "Start Journey",
    next: "Next",
    back: "Back",
    step: "Page",
    of: "/",
    
    // Concept Explanations
    diaryAnalogyTitle: "Analogy: The Private Diary",
    diaryAnalogy: "Variables inside a function are like a private diary inside a locked tent. Only the person inside (the Component) can read or write to it. The parent outside knows nothing about it.",
    whiteboardAnalogyTitle: "Analogy: The Public Whiteboard",
    whiteboardAnalogy: "State Hoisting is like moving the information to a public whiteboard by the campfire. Now everyone can see it (read) and anyone can pick up the marker to update it (write).",
    
    patternTitle: "The Standard Pattern: (value, onValueChange)",
    patternValue: "👁️ value: T (Input)",
    patternValueDesc: "What the component DISPLAYS. Data flows DOWN from parent.",
    patternEvent: "🗣️ onValueChange: (T) -> Unit (Output)",
    patternEventDesc: "What the component SAYS when user interacts. Events flow UP to parent.",

    // Quiz Hints
    quizHint: "Explanation >",
    quiz1Hint: "Think about scope. Can a parent access a variable defined inside a child's function body?",
    quiz1Explain: "Correct! Functions in Kotlin are black boxes. Variables defined inside them (using `val/var`) are local scope. To share state, it must be passed in as a parameter.",
    quiz2Hint: "If you put everything at the top, every small change re-renders the whole app. Think about efficiency.",
    quiz2Explain: "Correct! The 'Lowest Common Ancestor' rule ensures we share state only as high as needed, preventing unnecessary re-renders of unrelated components.",

    // Slides
    introTitle: "Compose Camp",
    introSubtitle: "Join Xiao Qi and friends to master Android Jetpack Compose!",
    
    story1Title: "The Campsite Arrival",
    story1P1: "Hello everyone! I'm Xiao Qi. I want to build a campsite app, but my components aren't talking to each other!",
    story1P2: "Meow~ Relax. Think of components like tents. If everyone hides their gear inside their own tent, we can't share anything!",
    story1Lesson: "First lesson: State Hoisting.",

    concept1Title: "Problem: The Locked Tent",
    concept1Desc: "In Compose, `remember { mutableStateOf }` creates state that survives recomposition, but it stays locked inside the function scope.",
    
    concept2Title: "Solution: State Hoisting",
    concept2Desc: "We move the state up to the caller. This creates a 'Single Source of Truth'.",

    quiz1Title: "Concept Check: Scope",
    quiz1Q: "Xiao Qi defines `var text` inside `SearchBar`. Can she add a 'Clear' button outside the search bar to empty it?",
    quiz1A: "A. Yes, using a global variable hack.",
    quiz1B: "B. No, the state is locked inside the function scope.",
    quiz1C: "C. Yes, parents can always read child state.",
    
    challenge1Title: "Challenge: Sync the Lanterns",
    challenge1Desc: "Task: The sliders below are disconnected. Refactor the code (flip the switch) to Hoist the State, then set brightness to 80%.",

    story2Title: "Chapter 2: Smart Packing",
    story2P1: "Wow! The lantern works perfectly now. Next task: Packing snacks!",
    story2P2: "We have 1000 snack packs to list in our inventory app.",
    story2P3: "If we dump them all out onto the screen at once... disaster awaits!",

    concept3Title: "LazyColumn vs Column",
    concept3BadTitle: "The Wrong Way: Column",
    concept3BadDesc: "A standard `Column` renders ALL children immediately. 1000 items = 1000 UI nodes created instantly.",
    concept3GoodTitle: "The Smart Way: LazyColumn",
    concept3GoodDesc: "`LazyColumn` works like a window. It only renders what you see. As you scroll, it recycles the views.",

    challenge2Title: "Challenge: The Snack Inventory",
    challenge2Desc: "Task: Switch to 'LazyColumn' mode and scroll down to the bottom to complete the packing list.",

    concept4Title: "Pro Tips: Keys & Padding",
    concept4KeyTitle: "Keys (Identity)",
    concept4KeyDesc: "Without keys, Compose assumes items at position 1 are the same, even if data changed. Keys preserve state during reordering.",
    concept4PadTitle: "ContentPadding",
    concept4PadDesc: "Avoid clipping! `contentPadding` adds space inside the scrolling container, ensuring the last item isn't hidden behind navigation bars.",

    quiz2Title: "Final Check: Architecture",
    quiz2Q: "Should we hoist ALL state to the very top level of the app (A 'God Component')?",
    quiz2A: "A. Yes, keep it all in one place.",
    quiz2B: "B. No, only to the 'Lowest Common Ancestor'.",
    quiz2C: "C. No, never hoist state.",

    outroTitle: "Happy Camping!",
    outroBadge: "🌟 Badge Earned!",
    outroMsg: "You are now a Compose Camp Graduate.",
    restart: "Start Over",

    // Mini Games
    mg_arch_bad: "❌ Internal State",
    mg_arch_good: "✅ Hoisted State",
    mg_lantern_btn: "✨ Hoist State",
    mg_lantern_success: "Synced! Set to 80%.",
    mg_list_mode_bad: "Column (Laggy)",
    mg_list_mode_good: "LazyColumn (Smooth)",
    mg_snack: "Snack"
  },
  zh: {
    title: "小奇的 Compose 露营之旅",
    mission: "任务:",
    missionDesc: "用以下装备打造完美的露营地:",
    start: "开始旅程",
    next: "下一页",
    back: "上一页",
    step: "Page",
    of: "/",

    // Concept Explanations
    diaryAnalogyTitle: "比喻：私密日记本",
    diaryAnalogy: "写在函数内部的变量就像一本锁在帐篷里的日记。只有住在里面的人（组件自己）能看能写。外面的父母（父组件）根本不知道里面写了什么。",
    whiteboardAnalogyTitle: "比喻：公共白板",
    whiteboardAnalogy: "状态提升就像把信息写在营火旁的公共白板上。现在所有人都能看到（读取），任何人都可以拿起笔去更新它（写入）。",
    
    patternTitle: "标准模式：(value, onValueChange)",
    patternValue: "👁️ value: T (数据下行)",
    patternValueDesc: "组件【显示】的内容。由父组件通过参数传进来。",
    patternEvent: "🗣️ onValueChange: (T) -> Unit (事件上行)",
    patternEventDesc: "组件【请求修改】的呐喊。通过 Lambda 通知父组件去改白板。",

    // Quiz Hints
    quizHint: "解析 >",
    quiz1Hint: "想想【作用域】。父组件能直接访问子函数大括号 `{ }` 里定义的变量吗？",
    quiz1Explain: "正确！Kotlin 的函数就像黑盒子。在内部用 `remember` 定义的状态是私有的。如果外部想要控制它，必须把状态作为参数传进去。",
    quiz2Hint: "如果把所有状态都放在最顶层，哪怕只是改一个按钮的颜色，整个 App 都要重绘，效率高吗？",
    quiz2Explain: "正确！架构的精髓在于“适度”。我们遵循“最近公共祖先”原则，只把状态提升到需要共享它的那一层，避免不必要的重绘。",

    // Slides
    introTitle: "Compose 露营训练营",
    introSubtitle: "和小奇一起，在悠闲的露营中学会 Android Jetpack Compose！",

    story1Title: "第一章：准备出发",
    story1P1: "大家好，我是小奇！我对编程充满了好奇，但还是个新手。我的组件好像没法互相交流！",
    story1P2: "喵~ 别担心。把组件想象成帐篷。如果大家把装备都藏在自己的帐篷里，就没法共享了！",
    story1Lesson: "第一课：状态提升 (State Hoisting)",

    concept1Title: "问题所在：被困住的状态",
    concept1Desc: "在 Compose 中，`remember { mutableStateOf }` 虽然能记住状态，但它把状态锁在了函数作用域内部。",
    
    concept2Title: "解决方案：状态提升",
    concept2Desc: "我们将状态从子组件移到父组件中。这建立了一个“单一信源 (Single Source of Truth)”。",

    quiz1Title: "试炼一：概念辨析",
    quiz1Q: "小奇在 `SearchBar` 组件内部定义了 `var text`。她想在组件外部加一个“清空”按钮来清空搜索框，能做到吗？",
    quiz1A: "A. 能，用全局变量就行。",
    quiz1B: "B. 不能，因为状态被锁在函数作用域内部了。",
    quiz1C: "C. 能，父组件总是能读取子组件的变量。",

    challenge1Title: "实战挑战：点亮共享提灯",
    challenge1Desc: "任务：下面的滑块互不相关。请重构代码（点击“状态提升”），然后将亮度调节到 80%。",

    story2Title: "第二章：聪明地打包",
    story2P1: "哇！提灯现在工作得完美无缺。下一个任务：打包零食！",
    story2P2: "我们有整整 1000 件“必带”的零食要列在清单里。",
    story2P3: "如果一次性把它们全倒在屏幕上…… 我们的旅程可能还没开始就结束了（卡顿）！",

    concept3Title: "LazyColumn vs Column",
    concept3BadTitle: "错误的方式：Column",
    concept3BadDesc: "普通的 `Column` 会立即渲染所有的子项。1000 个数据 = 瞬间创建 1000 个节点，导致卡顿。",
    concept3GoodTitle: "聪明的方式：LazyColumn",
    concept3GoodDesc: "`LazyColumn` 就像一个窗口。它只渲染你看见的部分。当你滚动时，它会回收旧的格子来装新的数据。",

    challenge2Title: "实战挑战：整理零食清单",
    challenge2Desc: "任务：切换到 'LazyColumn' 模式，并滚动到底部完成清单打包。",

    concept4Title: "整理技巧：Keys 与 Padding",
    concept4KeyTitle: "Keys (身份证)",
    concept4KeyDesc: "如果没有 Key，Compose 只能按位置识别。如果列表乱序，状态会错乱。`key` 给了物品唯一的身份。",
    concept4PadTitle: "contentPadding",
    concept4PadDesc: "别直接给容器加 padding！使用 `contentPadding`，让内容在滚动容器内部保留呼吸感，同时滚动条能贴边。",

    quiz2Title: "最终测试：架构设计",
    quiz2Q: "既然状态提升这么好，我们是不是应该把所有状态都提升到最顶层（做一个“上帝组件”）？",
    quiz2A: "A. 是的，这样最整洁。",
    quiz2B: "B. 不是，只提升到“最近的公共祖先”即可。",
    quiz2C: "C. 不，永远不要提升状态。",

    outroTitle: "Happy Camping!",
    outroBadge: "🌟 获得徽章！",
    outroMsg: "恭喜你毕业了！你已经掌握了 Compose 的精髓。",
    restart: "重新开始",

    // Mini Games
    mg_arch_bad: "❌ 独立的内部状态",
    mg_arch_good: "✅ 状态已提升 (共享)",
    mg_lantern_btn: "✨ 状态提升！",
    mg_lantern_success: "系统已同步！设为 80%。",
    mg_list_mode_bad: "Column (卡顿)",
    mg_list_mode_good: "LazyColumn (流畅)",
    mg_snack: "零食"
  }
};

// --- Code Content (Localized via helper) ---

const getCodes = (lang: Language) => ({
    badState: lang === "zh" ? `// ❌ 错误：状态被困在帐篷里
@Composable
fun Tent() {
    // 这个状态是私有的，外面看不到！
    var map by remember { mutableStateOf("Map A") }
    
    Text(text = map)
}` : `// ❌ Bad: State trapped in the tent
@Composable
fun Tent() {
    // Private state, invisible to outside!
    var map by remember { mutableStateOf("Map A") }
    
    Text(text = map)
}`,
    goodState: lang === "zh" ? `// ✅ 正确：状态提升
@Composable
fun Campsite() {
    // 1. 状态在父组件 (公共白板)
    var sharedMap by remember { mutableStateOf("Map A") }

    // 2. 通过参数传递下去
    Tent(
        map = sharedMap, 
        onMapChange = { sharedMap = it }
    )
}` : `// ✅ Good: State Hoisting
@Composable
fun Campsite() {
    // 1. State in Parent (Public Whiteboard)
    var sharedMap by remember { mutableStateOf("Map A") }

    // 2. Pass down via parameters
    Tent(
        map = sharedMap, 
        onMapChange = { sharedMap = it }
    )
}`,
    lazyList: lang === "zh" ? `LazyColumn(
    // ✨ 妙用：内容内边距
    contentPadding = PaddingValues(16.dp) 
) {
    items(
        items = snacks,
        // 🔑 关键：唯一身份证
        key = { snack -> snack.id } 
    ) { snack ->
        SnackItem(snack)
    }
}` : `LazyColumn(
    // ✨ Tip: Content Padding
    contentPadding = PaddingValues(16.dp) 
) {
    items(
        items = snacks,
        // 🔑 Key: Unique Identity
        key = { snack -> snack.id } 
    ) { snack ->
        SnackItem(snack)
    }
}`
});

// --- Components ---

const Button = ({ onClick, children, variant = "primary", disabled = false, className = "" }: { onClick: () => void, children: React.ReactNode, variant?: "primary" | "secondary" | "outline", disabled?: boolean, className?: string }) => {
  const styles: any = {
    primary: { background: "var(--camp-orange)", color: "white", border: "none", boxShadow: "0 4px 0 #b84319" },
    secondary: { background: "#8aa881", color: "white", border: "none" },
    outline: { border: "2px solid var(--camp-green)", color: "var(--camp-green)", background: "transparent" }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        padding: "12px 24px",
        borderRadius: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.1s",
        ...styles[variant]
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.95)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
};

// Simple Kotlin Syntax Highlighter
const SimpleCodeHighlighter = ({ code }: { code: string }) => {
    const tokens = code.split(/(\/\/.*|\b(?:fun|val|var|remember|mutableStateOf|by|Composable|Modifier|Column|LazyColumn|items|Text|Button|key|contentPadding|PaddingValues)\b|"[^"]*"|[{}().,=])/g);
    
    return (
        <div style={{ 
            background: "#282c34", 
            color: "#abb2bf", 
            padding: "15px", 
            borderRadius: "8px", 
            fontFamily: "'JetBrains Mono', Consolas, monospace", 
            fontSize: "0.85rem", 
            lineHeight: "1.6", 
            overflowX: "auto",
            border: "1px solid #3e4451"
        }}>
            {tokens.map((token, i) => {
                let color = "#abb2bf"; // default
                if (token.startsWith("//")) color = "#5c6370"; // Comment (Grey)
                else if (token.match(/\b(fun|val|var)\b/)) color = "#c678dd"; // Keywords (Purple)
                else if (token.match(/\b(remember|mutableStateOf|by|items|key|contentPadding)\b/)) color = "#56b6c2"; // Functions/Props (Cyan)
                else if (token.match(/\b(Composable|Modifier|Column|LazyColumn|Text|Button|PaddingValues)\b/)) color = "#e5c07b"; // Classes/Annotations (Yellow)
                else if (token.startsWith('"')) color = "#98c379"; // Strings (Green)
                
                return <span key={i} style={{ color }}>{token}</span>;
            })}
        </div>
    );
};

const Character = ({ name, emotion = "happy", side = "left" }: { name: string, emotion?: string, side?: "left" | "right" }) => {
  const emojis: any = {
    xiaoqi: { happy: "👧", confused: "👧❓", excited: "👧✨", sad: "👧💧" },
    cat: { happy: "🐱", confused: "🐱❓", teaching: "🐱👓" },
    friend: { happy: "👩", camping: "👩🏕️" }
  };
  
  return (
    <div style={{ 
      position: "absolute", 
      bottom: "-10px", 
      [side]: "20px", 
      fontSize: "5rem", 
      filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.2))",
      zIndex: 10,
      transition: "all 0.3s ease",
      animation: "bounce 2s infinite ease-in-out"
    }}>
      {emojis[name][emotion] || "❓"}
    </div>
  );
};

// --- Interactive Components ---

const LanternChallenge = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => {
  const [isHoisted, setIsHoisted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const t = TEXTS[lang];
  const [brightnessA, setBrightnessA] = useState(50);
  const [brightnessB, setBrightnessB] = useState(30);
  const [sharedBrightness, setSharedBrightness] = useState(50);

  useEffect(() => {
    if (!hasCompleted && isHoisted && Math.abs(sharedBrightness - 80) < 5) {
       setHasCompleted(true);
       setTimeout(onComplete, 1500);
    }
  }, [isHoisted, sharedBrightness, onComplete, hasCompleted]);

  const currentBrightness = isHoisted ? sharedBrightness : (brightnessA + brightnessB) / 2;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ 
        padding: "8px 16px", 
        background: isHoisted ? "#d4edda" : "#f8d7da", 
        borderRadius: "20px", 
        color: isHoisted ? "#155724" : "#721c24",
        fontSize: "0.9rem",
        fontWeight: "bold",
        border: isHoisted ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
      }}>
        {isHoisted ? t.mg_arch_good : t.mg_arch_bad}
      </div>

      <div style={{ 
        position: "relative", 
        width: "80px", 
        height: "120px", 
        background: "#2d3436", 
        borderRadius: "10px 10px 40px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: `0 0 ${currentBrightness}px ${currentBrightness / 4}px #fdcb6e`,
        transition: "box-shadow 0.2s"
      }}>
        <div style={{
          width: "50px", height: "70px", background: "#ffeaa7", borderRadius: "20px",
          opacity: currentBrightness / 100 + 0.2,
          transition: "opacity 0.1s"
        }} />
        <div style={{ position: "absolute", top: "-10px", width: "20px", height: "10px", background: "#636e72", borderRadius: "4px" }} />
      </div>

      <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
        {[0, 1].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, background: "#fff", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#888" }}>Switch {i === 0 ? "A" : "B"}</span>
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={isHoisted ? sharedBrightness : (i === 0 ? brightnessA : brightnessB)} 
                    onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isHoisted) setSharedBrightness(val);
                    else i === 0 ? setBrightnessA(val) : setBrightnessB(val);
                    }}
                    style={{ width: "100%", accentColor: "var(--camp-orange)" }}
                />
            </div>
        ))}
      </div>

      {!isHoisted ? (
           <Button onClick={() => setIsHoisted(true)} className="pulse-btn">{t.mg_lantern_btn}</Button>
      ) : (
        <div style={{ color: "var(--camp-green)", fontWeight: "bold", animation: "fadeIn 0.5s" }}>
           {t.mg_lantern_success}
        </div>
      )}
    </div>
  );
};

const SnackListChallenge = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => {
  const [mode, setMode] = useState<"column" | "lazy">("column");
  const [scrollPos, setScrollPos] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const t = TEXTS[lang];
  
  // Performance Simulation
  const [nodeCount, setNodeCount] = useState(1000);

  useEffect(() => {
      setNodeCount(mode === "column" ? 1000 : 15);
  }, [mode]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPos(e.currentTarget.scrollTop);
    if (!hasCompleted && mode === "lazy" && e.currentTarget.scrollTop > 800) {
        setHasCompleted(true);
        setTimeout(onComplete, 1500);
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <Button variant={mode === "column" ? "primary" : "outline"} onClick={() => setMode("column")}>{t.mg_list_mode_bad}</Button>
        <Button variant={mode === "lazy" ? "primary" : "outline"} onClick={() => setMode("lazy")}>{t.mg_list_mode_good}</Button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#666" }}>
        <span>DOM Nodes: <strong style={{ color: mode === "column" ? "red" : "green" }}>{nodeCount}</strong></span>
        <span>{hasCompleted ? "✅ Ready!" : "🏁 Goal: Bottom"}</span>
      </div>

      <div 
        onScroll={handleScroll}
        style={{ 
            height: "250px", 
            overflowY: "auto", 
            background: "white", 
            border: `2px solid ${mode === "column" ? "#ffcccc" : "#ccffcc"}`, 
            borderRadius: "8px",
            position: "relative"
        }}
      >
        <div style={{ height: "4000px", position: "relative" }}>
            {/* Simulated Items */}
            {Array.from({ length: mode === "column" ? 20 : 10 }).map((_, i) => {
                // Logic to only render visible ones if lazy, or render all (simulated visual only) if column
                // To keep simulation simple: we just show a representative sample
                const offset = mode === "lazy" ? Math.floor(scrollPos / 40) * 40 : 0;
                return (
                    <div key={i} style={{
                        position: "absolute",
                        top: mode === "lazy" ? offset + (i * 40) : i * 40,
                        left: 0, right: 0,
                        height: "35px",
                        display: "flex", alignItems: "center", paddingLeft: "10px",
                        borderBottom: "1px solid #eee",
                        background: mode === "column" ? "#fff5f5" : "#f0fff4"
                    }}>
                        {t.mg_snack} #{mode === "lazy" ? Math.floor(scrollPos / 40) + i + 1 : i + 1}
                    </div>
                )
            })}
            {mode === "column" && <div style={{ position: "absolute", top: "800px", width: "100%", textAlign: "center", color: "red" }}>... 980 more items ...</div>}
        </div>
      </div>
    </div>
  );
};

const Quiz = ({ question, options, hint, explain, onCorrect, lang }: { question: string, options: {text: string, correct: boolean}[], hint: string, explain: string, onCorrect: () => void, lang: Language }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

    const handleSelect = (idx: number) => {
        if (status === "correct") return;
        setSelected(idx);
        if (options[idx].correct) {
            setStatus("correct");
            setTimeout(onCorrect, 3000); // Give time to read explanation
        } else {
            setStatus("wrong");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "1.1rem", lineHeight: "1.5" }}>{question}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    let borderColor = "#e0e0e0";
                    let bgColor = "white";
                    
                    if (isSelected) {
                         if (status === "correct") { borderColor = "#2ecc71"; bgColor = "#eafaf1"; }
                         if (status === "wrong") { borderColor = "#e74c3c"; bgColor = "#fde9e8"; }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            style={{
                                padding: "15px",
                                borderRadius: "12px",
                                border: `2px solid ${borderColor}`,
                                background: bgColor,
                                cursor: status === "correct" ? "default" : "pointer",
                                textAlign: "left",
                                fontSize: "1rem",
                                fontWeight: isSelected ? "bold" : "normal",
                                color: isSelected && status === "wrong" ? "#c0392b" : "#333",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <span style={{ fontWeight: "bold", color: "#888" }}>{String.fromCharCode(65 + idx)}.</span>
                            {opt.text}
                        </button>
                    )
                })}
            </div>

            {/* Feedback Card */}
            <div style={{ minHeight: "80px", marginTop: "20px" }}>
                {status === "wrong" && (
                    <div style={{ 
                        background: "#ffebee", 
                        color: "#c62828", 
                        padding: "15px", 
                        borderRadius: "12px", 
                        display: "flex", 
                        gap: "10px", 
                        alignItems: "start",
                        animation: "fadeIn 0.3s"
                    }}>
                        <Character name="xiaoqi" emotion="sad" />
                        <div style={{ marginLeft: "60px" }}>
                            <strong>❌ Oops...</strong>
                            <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>{hint}</p>
                        </div>
                    </div>
                )}
                {status === "correct" && (
                     <div style={{ 
                        background: "#e8f5e9", 
                        color: "#2e7d32", 
                        padding: "15px", 
                        borderRadius: "12px", 
                        display: "flex", 
                        gap: "10px", 
                        alignItems: "start",
                        animation: "fadeIn 0.3s"
                    }}>
                        <div style={{ fontSize: "2rem" }}>✨</div>
                        <div>
                            <strong>{TEXTS[lang].quizHint.split(">")[0]}</strong> 
                            <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>{explain}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Main Application ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<Language>("zh");
  const codes = getCodes(lang);
  const t = TEXTS[lang];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(c => c + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  // Slide Configuration
  const slides: SlideConfig[] = useMemo(() => [
    {
      id: 0,
      type: "intro",
      title: t.introTitle,
      content: (
        <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Tent size={80} color="var(--camp-orange)" />
          <h1 style={{ color: "var(--camp-green)", margin: "20px 0 10px 0" }}>{t.introTitle}</h1>
          <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "80%" }}>{t.introSubtitle}</p>
          
          <div style={{ background: "#fff3e0", padding: "20px", borderRadius: "15px", marginTop: "30px", width: "100%" }}>
             <h4 style={{ margin: "0 0 10px 0", color: "var(--fire-orange)" }}>{t.mission}</h4>
             <p style={{ margin: 0 }}>{t.missionDesc}</p>
             <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                <Backpack size={20} /> <MapIcon size={20} /> <Flame size={20} />
             </div>
          </div>
        </div>
      )
    },
    {
        id: 1,
        type: "story",
        title: t.story1Title,
        content: (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
                <Character name="xiaoqi" emotion="confused" />
                <div style={{ marginLeft: "80px", background: "white", padding: "15px", borderRadius: "20px 20px 20px 0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: 0 }}><strong>Xiao Qi:</strong> {t.story1P1}</p>
                </div>
                
                <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ marginRight: "80px", background: "#fff8e1", padding: "15px", borderRadius: "20px 20px 0 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                        <p style={{ margin: 0 }}><strong>Cat:</strong> {t.story1P2}</p>
                    </div>
                    <Character name="cat" emotion="teaching" side="right" />
                </div>
                
                <div style={{ marginTop: "40px", textAlign: "center", color: "var(--camp-green)", fontWeight: "bold" }}>
                    {t.story1Lesson}
                </div>
            </div>
        )
    },
    {
        id: 2,
        type: "concept",
        title: t.concept1Title,
        content: (
            <div>
                <div style={{ background: "#e3f2fd", padding: "15px", borderRadius: "12px", display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" }}>
                    <BookOpen color="#1976d2" size={32} />
                    <div>
                        <strong style={{ color: "#1565c0" }}>{t.diaryAnalogyTitle}</strong>
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>{t.diaryAnalogy}</p>
                    </div>
                </div>

                <p>{t.concept1Desc}</p>
                <SimpleCodeHighlighter code={codes.badState} />
            </div>
        )
    },
    {
        id: 3,
        type: "concept",
        title: t.concept2Title,
        content: (
            <div>
                 <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "12px", display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ background: "white", padding: "8px", borderRadius: "50%" }}>
                         <MapIcon color="#2e7d32" size={20} />
                    </div>
                    <div>
                        <strong style={{ color: "#2e7d32" }}>{t.whiteboardAnalogyTitle}</strong>
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>{t.whiteboardAnalogy}</p>
                    </div>
                </div>

                <SimpleCodeHighlighter code={codes.goodState} />

                <div style={{ marginTop: "20px", padding: "15px", border: "2px dashed #ddd", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>{t.patternTitle}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ fontWeight: "bold", color: "#e67e22" }}>{t.patternValue}</div>
                            <div style={{ color: "#7f8c8d" }}>{t.patternValueDesc}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ fontWeight: "bold", color: "#27ae60" }}>{t.patternEvent}</div>
                            <div style={{ color: "#7f8c8d" }}>{t.patternEventDesc}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 4,
        type: "quiz",
        title: t.quiz1Title,
        content: (
            <Quiz 
                lang={lang}
                question={t.quiz1Q}
                hint={t.quiz1Hint}
                explain={t.quiz1Explain}
                options={[
                    { text: t.quiz1A, correct: false },
                    { text: t.quiz1B, correct: true },
                    { text: t.quiz1C, correct: false }
                ]}
                onCorrect={nextSlide}
            />
        )
    },
    {
        id: 5,
        type: "challenge_lantern",
        title: t.challenge1Title,
        content: (
            <div>
                <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center", background: "#fff3cd", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", color: "#856404" }}>
                    <AlertCircle size={18} /> {t.challenge1Desc}
                </div>
                <LanternChallenge lang={lang} onComplete={() => setTimeout(nextSlide, 2000)} />
            </div>
        )
    },
    {
        id: 6,
        type: "story",
        title: t.story2Title,
        content: (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎒 🍪 🍫</div>
                <h3 style={{ color: "var(--camp-brown)" }}>{t.story2P1}</h3>
                <p>{t.story2P2}</p>
                <div style={{ background: "#ffebee", padding: "15px", borderRadius: "10px", marginTop: "20px", color: "#c62828" }}>
                    ⚠️ {t.story2P3}
                </div>
            </div>
        )
    },
    {
        id: 7,
        type: "concept",
        title: t.concept3Title,
        content: (
            <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ padding: "15px", borderRadius: "10px", background: "#ffebee", border: "1px solid #ef9a9a" }}>
                        <div style={{ fontWeight: "bold", color: "#c62828", marginBottom: "5px" }}>Column</div>
                        <div style={{ fontSize: "0.85rem" }}>{t.concept3BadDesc}</div>
                    </div>
                    <div style={{ padding: "15px", borderRadius: "10px", background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                        <div style={{ fontWeight: "bold", color: "#2e7d32", marginBottom: "5px" }}>LazyColumn</div>
                        <div style={{ fontSize: "0.85rem" }}>{t.concept3GoodDesc}</div>
                    </div>
                </div>
                <SimpleCodeHighlighter code={codes.lazyList} />
            </div>
        )
    },
    {
        id: 8,
        type: "challenge_list",
        title: t.challenge2Title,
        content: (
            <div>
                <p style={{ marginBottom: "20px" }}>{t.challenge2Desc}</p>
                <SnackListChallenge lang={lang} onComplete={() => setTimeout(nextSlide, 2000)} />
            </div>
        )
    },
    {
        id: 9,
        type: "concept",
        title: t.concept4Title,
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--camp-brown)", margin: "0 0 5px 0" }}>
                        <Tag size={18} /> {t.concept4KeyTitle}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{t.concept4KeyDesc}</p>
                </div>
                <div style={{ height: "1px", background: "#eee" }} />
                <div>
                    <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--camp-brown)", margin: "0 0 5px 0" }}>
                        <Maximize size={18} /> {t.concept4PadTitle}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{t.concept4PadDesc}</p>
                </div>
                <div style={{ background: "#f9f9f9", padding: "10px", borderRadius: "8px", fontSize: "0.8rem", color: "#777", fontStyle: "italic" }}>
                    <Lightbulb size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                    {lang === "zh" ? "提示：看看上一页的代码示例，这些属性都已经用上了！" : "Tip: Check the code snippet on the previous page, these props are already used!"}
                </div>
            </div>
        )
    },
    {
        id: 10,
        type: "quiz",
        title: t.quiz2Title,
        content: (
             <Quiz 
                lang={lang}
                question={t.quiz2Q}
                hint={t.quiz2Hint}
                explain={t.quiz2Explain}
                options={[
                    { text: t.quiz2A, correct: false },
                    { text: t.quiz2B, correct: true },
                    { text: t.quiz2C, correct: false }
                ]}
                onCorrect={nextSlide}
            />
        )
    },
    {
        id: 11,
        type: "outro",
        title: t.outroTitle,
        content: (
            <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 style={{ color: "var(--fire-orange)", fontSize: "2rem" }}>{t.outroBadge}</h1>
                <p style={{ fontSize: "1.2rem", color: "#555" }}>{t.outroMsg}</p>
                
                <div style={{ display: "flex", gap: "10px", margin: "30px 0" }}>
                    <div style={{ background: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>🔥 State</div>
                    <div style={{ background: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>📜 Lazy</div>
                    <div style={{ background: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>🔑 Keys</div>
                </div>

                <Button onClick={() => setCurrentSlide(0)} variant="primary">{t.restart}</Button>
                
                <div style={{ marginTop: "50px", position: "relative", width: "100%" }}>
                    <Character name="friend" emotion="camping" side="left" />
                    <Character name="cat" emotion="happy" side="right" />
                </div>
            </div>
        )
    }
  ], [lang]);

  // --- Safety Check ---
  if (currentSlide >= slides.length) {
    setCurrentSlide(0);
    return null;
  }

  const slide = slides[currentSlide];
  if (!slide) return null;

  return (
    <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        minHeight: "100vh", 
        background: "var(--camp-beige)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <div style={{ padding: "15px 20px", background: "var(--camp-orange)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 0 #c04515" }}>
        <span style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
            <Tent size={22} /> 
            {/* Mobile title truncation */}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {t.title}
            </span>
        </span>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
                onClick={() => setLang(l => l === "en" ? "zh" : "en")}
                style={{ background: "rgba(0,0,0,0.1)", border: "none", color: "white", borderRadius: "8px", padding: "6px", cursor: "pointer" }}>
                <Languages size={20} />
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", height: "8px", background: "#e0e0e0" }}>
        <div style={{ width: `${((currentSlide + 1) / slides.length) * 100}%`, height: "100%", background: "var(--camp-green)", borderRadius: "0 4px 4px 0", transition: "width 0.5s ease" }} />
      </div>
      
      <div style={{ textAlign: "right", padding: "5px 20px", fontSize: "0.8rem", color: "#888" }}>
          {t.step} {currentSlide + 1} {t.of} {slides.length}
      </div>

      {/* Main Card */}
      <div style={{ flex: 1, padding: "10px 20px 20px 20px", display: "flex", flexDirection: "column" }}>
         <div key={slide.id} className="slide-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ color: "var(--camp-brown)", marginTop: 0, marginBottom: "15px", fontSize: "1.5rem", textAlign: "center" }}>{slide.title}</h2>
            <div style={{ 
                background: "white", 
                padding: "25px", 
                borderRadius: "24px", 
                boxShadow: "0 10px 30px rgba(139, 90, 43, 0.1)", 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "visible"
            }}>
                {slide.content}
            </div>
         </div>
      </div>

      {/* Navigation Footer */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            style={{ border: "none", background: "transparent", color: currentSlide === 0 ? "#ccc" : "var(--camp-brown)", cursor: currentSlide === 0 ? "default" : "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold" }}
        >
            ← {t.back}
        </button>

        {/* Only show Next if it's not a blocking interactive slide */}
        {!["quiz", "challenge_lantern", "challenge_list"].includes(slide.type) && (
             <Button onClick={nextSlide} variant="primary">
                {t.next} →
             </Button>
        )}
      </div>
      
      <style>{`
        :root {
            --camp-green: #6ab04c;
            --camp-orange: #e67e22;
            --camp-brown: #5d4037;
            --camp-beige: #fdfbf7;
            --fire-orange: #e25822;
        }
        .slide-enter {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .pulse-btn {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(230, 126, 34, 0); }
          100% { box-shadow: 0 0 0 0 rgba(230, 126, 34, 0); }
        }
      `}</style>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}