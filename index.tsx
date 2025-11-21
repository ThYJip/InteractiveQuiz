
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
  Languages
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
    step: "Step",
    of: "of",
    hoisting: "State Hoisting",
    lazyColumn: "LazyColumn",
    
    // Slides
    introTitle: "Compose Camp",
    introSubtitle: "Join Xiao Qi and friends to master Android Jetpack Compose!",
    
    story1Title: "The Campsite Arrival",
    story1P1: "Hello everyone! I'm Xiao Qi. I want to build a campsite app, but my components aren't talking to each other!",
    story1P2: "Meow~ Relax. Think of components like tents. If everyone hides their gear inside their own tent, we can't share anything!",
    story1Lesson: "First lesson: State Hoisting.",

    concept1Title: "The Problem: Independent Tents",
    concept1P1: "Imagine Rin and Nadeshiko are in separate tents.",
    concept1TentA: "Has Map A",
    concept1TentB: "Has Map B",
    concept1P2: "If state (the Map) is locked inside the component (Tent), they can't agree on a route!",
    concept1Bad: "🚫 This is a Stateful Component.",

    concept2Title: "The Solution: State Hoisting",
    concept2P1: "We move the map OUT of the tents and place it by the campfire (The Parent Component).",
    concept2Shared: "Shared State",
    concept2P2: "This makes components Stateless. They just receive data and trigger events.",
    concept2Pattern: "✅ Pattern: (value, onValueChange)",

    quiz1Title: "Campfire Quiz",
    quiz1Q: "Xiao Qi wants a 'Clear' button OUTSIDE her SearchBar component to empty the text inside. Can she do it if the text state is 'remembered' strictly INSIDE the SearchBar?",
    quiz1A: "A. Yes, it's easy.",
    quiz1B: "B. No, she must Hoist the State up.",
    correct: "Correct! Great job camper! 🌟",

    challenge1Title: "Challenge: Sync the Lanterns",
    challenge1Desc: "It's getting dark! We need a shared lantern for the whole camp.",
    
    story2Title: "Chapter 2: Smart Packing",
    story2P1: "Wow! The lantern works perfectly now. Next task: Packing snacks!",
    story2P2: "We have 1000 snack packs to list in our inventory app.",
    story2P3: "If we dump them all out onto the screen at once... disaster awaits!",

    concept3Title: "LazyColumn vs Column",
    concept3BadTitle: "The Wrong Way: Column",
    concept3BadDesc: "Like a 'Stubborn Builder'. It creates ALL 1000 items immediately, even if they are off-screen. This freezes the UI (Jank).",
    concept3GoodTitle: "The Smart Way: LazyColumn",
    concept3GoodDesc: "Like a 'Smart Builder'. It only creates items that are currently visible. As you scroll, it recycles the logic. This is called Virtualization.",

    challenge2Title: "Challenge: The Snack Inventory",
    challenge2Desc: "Try scrolling the list below. Notice the 'DOM Nodes' counter.",

    concept4Title: "Pro Tips: Keys & Padding",
    concept4KeyTitle: "Use Keys (Name Tags)",
    concept4KeyDesc: "Give every item a unique ID (key). This helps Compose know exactly which item is which, especially when you shuffle or delete items. It keeps state attached to the right item!",
    concept4PadTitle: "ContentPadding",
    concept4PadBad: "Modifier.padding (Shrinks Window) ❌",
    concept4PadGood: "contentPadding (Pads Inside) ✅",
    concept4PadDesc: "Use contentPadding so your content is padded, but the scroll area still touches the screen edges.",

    quiz2Title: "Final Check: God Component",
    quiz2Q: "Since State Hoisting is good, should we hoist ALL state to the very top level of the app (A 'God Component')?",
    quiz2A: "A. Yes, keep it all in one place.",
    quiz2B: "B. No, only hoist as high as needed.",

    outroTitle: "Happy Camping!",
    outroBadge: "🌟 Badge Earned!",
    outroMsg: "You are now a Compose Camp Graduate.",
    outroItem1: "Shared State (Hoisting)",
    outroItem2: "LazyColumn Virtualization",
    outroItem3: "Keys & contentPadding",
    restart: "Start Over",

    // Mini Games
    mg_arch_bad: "❌ Independent Internal State",
    mg_arch_good: "✅ State Hoisted (Shared Source of Truth)",
    mg_current_arch: "Current Architecture:",
    mg_slider: "Slider",
    mg_brightness: "Brightness",
    mg_lantern_instr_bad: "Try moving the sliders. They don't affect each other! We want them to control the same lantern.",
    mg_lantern_btn: "✨ Hoist the State!",
    mg_lantern_success: "It works! Both sliders update the single sharedBrightness state.",
    mg_lantern_task: "Set brightness to approx 80% to light up the camp!",
    
    mg_list_mode_bad: "Use 'Column' (Bad)",
    mg_list_mode_good: "Use 'LazyColumn' (Good)",
    mg_list_items: "Items",
    mg_list_nodes: "DOM Nodes",
    mg_list_viewport: "Active Viewport",
    mg_list_instr_bad: "Creating 1000 items at once consumes memory instantly.",
    mg_list_instr_good: "Creating only visible items saves resources. Scroll down to finish packing!",
    mg_snack: "Snack"
  },
  zh: {
    title: "小奇的 Compose 露营之旅",
    mission: "任务:",
    missionDesc: "用以下装备打造完美的露营地:",
    start: "开始旅程",
    next: "下一步",
    back: "返回",
    step: "第",
    of: "步 / 共",
    hoisting: "状态提升 (State Hoisting)",
    lazyColumn: "LazyColumn (长列表)",

    // Slides
    introTitle: "Compose 露营训练营",
    introSubtitle: "和小奇一起，在悠闲的露营中学会 Android Jetpack Compose！",

    story1Title: "第一章：准备出发",
    story1P1: "大家好，我是小奇！我对编程充满了好奇，但还是个新手。我的组件好像没法互相交流！",
    story1P2: "喵~ 别担心。把组件想象成帐篷。如果大家把装备都藏在自己的帐篷里，就没法共享了！",
    story1Lesson: "第一课：状态提升 (State Hoisting)。",

    concept1Title: "问题所在：各自为战的帐篷",
    concept1P1: "想象一下抚子和凛住在各自的帐篷里。",
    concept1TentA: "持有地图 A",
    concept1TentB: "持有地图 B",
    concept1P2: "如果状态（地图）被锁在组件（帐篷）内部，她们就无法商量出一条统一的路线！",
    concept1Bad: "🚫 这就是“有状态” (Stateful) 组件。",

    concept2Title: "解决方案：状态提升",
    concept2P1: "我们把地图从帐篷里拿出来，放在营火旁（父组件）。",
    concept2Shared: "共享状态",
    concept2P2: "这让组件变成了“无状态” (Stateless)。它们只负责接收数据和发送事件。",
    concept2Pattern: "✅ 标准模式：(value, onValueChange)",

    quiz1Title: "营地小问答",
    quiz1Q: "小奇想在 SearchBar 组件外部加一个“清空”按钮。如果文本状态被“remember”死锁在 SearchBar 内部，她能做到吗？",
    quiz1A: "A. 能，这很容易。",
    quiz1B: "B. 不能，她必须进行状态提升。",
    correct: "回答正确！太棒了！🌟",

    challenge1Title: "实战挑战：点亮共享提灯",
    challenge1Desc: "天黑了！我们需要一个共享的提灯来照亮整个营地。",

    story2Title: "第二章：聪明地打包",
    story2P1: "哇！提灯现在工作得完美无缺。下一个任务：打包零食！",
    story2P2: "我们有整整 1000 件“必带”的零食要列在清单里。",
    story2P3: "如果一次性把它们全倒在屏幕上…… 我们的旅程可能还没开始就结束了（卡顿）！",

    concept3Title: "LazyColumn vs Column",
    concept3BadTitle: "错误的方式：Column",
    concept3BadDesc: "就像个“耿直的建筑工”。它会一次性把 1000 个列表项全部创建出来，不管你屏幕上能不能看到。后果：应用卡顿甚至崩溃。",
    concept3GoodTitle: "聪明的方式：LazyColumn",
    concept3GoodDesc: "就像个“聪明的建筑工”。它只在你视线范围内（屏幕可见区域）创建列表项。当你滚动时，它会“随看随建”。核心魔法：虚拟化 (Virtualization)。",

    challenge2Title: "实战挑战：整理零食清单",
    challenge2Desc: "试着滚动下面的列表。注意观察“DOM 节点数”。",

    concept4Title: "整理技巧：Keys 与 Padding",
    concept4KeyTitle: "给物品贴上“姓名牌” (Keys)",
    concept4KeyDesc: "给每个列表项一个唯一的 ID (key)。这能让 Compose 准确识别每个列表项，特别是在列表发生变化时。这对于保持正确的状态非常重要！",
    concept4PadTitle: "contentPadding 的妙用",
    concept4PadBad: "Modifier.padding (压缩视口) ❌",
    concept4PadGood: "contentPadding (内部留白) ✅",
    concept4PadDesc: "使用 contentPadding 作用于内容本身。这样滚动区域仍然是全尺寸的，只有内容在内部保留边距。",

    quiz2Title: "最终测试：上帝组件",
    quiz2Q: "既然状态提升这么好，我们是不是应该把所有状态都提升到最顶层（做一个“上帝组件”）？",
    quiz2A: "A. 是的，这样最整洁。",
    quiz2B: "B. 不是，只提升那些“需要被共享或控制”的状态。",

    outroTitle: "Happy Camping!",
    outroBadge: "🌟 获得徽章！",
    outroMsg: "恭喜你毕业了！你已经掌握了 Compose 的精髓。",
    outroItem1: "状态提升 (共享与协作)",
    outroItem2: "LazyColumn (高效长列表)",
    outroItem3: "Keys 与 contentPadding",
    restart: "重新开始",

    // Mini Games
    mg_arch_bad: "❌ 独立的内部状态 (Internal State)",
    mg_arch_good: "✅ 状态已提升 (共享唯一信源)",
    mg_current_arch: "当前架构:",
    mg_slider: "滑块",
    mg_brightness: "亮度",
    mg_lantern_instr_bad: "试试拖动滑块。它们互不影响！我们需要它们控制同一个提灯。",
    mg_lantern_btn: "✨ 状态提升！",
    mg_lantern_success: "成功了！两个滑块现在更新同一个 sharedBrightness 状态。",
    mg_lantern_task: "把亮度调到大约 80% 来点亮营地！",
    
    mg_list_mode_bad: "使用 'Column' (错误)",
    mg_list_mode_good: "使用 'LazyColumn' (正确)",
    mg_list_items: "物品总数",
    mg_list_nodes: "DOM 节点数",
    mg_list_viewport: "可见区域",
    mg_list_instr_bad: "一次性创建 1000 个项目会瞬间消耗内存。",
    mg_list_instr_good: "只创建可见的项目可以节省资源。向下滚动来完成打包！",
    mg_snack: "零食"
  }
};

// --- Assets / Components ---

const Button = ({ onClick, children, variant = "primary", disabled = false }: { onClick: () => void, children: React.ReactNode, variant?: "primary" | "secondary" | "outline", disabled?: boolean }) => {
  const styles: any = {
    primary: { background: "var(--camp-green)", color: "white", border: "none" },
    secondary: { background: "var(--camp-brown)", color: "white", border: "none" },
    outline: { border: "2px solid var(--camp-green)", color: "var(--camp-green)", background: "transparent" }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px",
        borderRadius: "20px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.1s, background 0.2s",
        ...styles[variant]
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.95)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
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

// --- Mini-Games ---

// Challenge 1: State Hoisting (Lanterns)
const LanternChallenge = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => {
  const [isHoisted, setIsHoisted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const t = TEXTS[lang];
  
  // Independent State (Bad)
  const [brightnessA, setBrightnessA] = useState(50);
  const [brightnessB, setBrightnessB] = useState(30);

  // Shared State (Good)
  const [sharedBrightness, setSharedBrightness] = useState(50);

  useEffect(() => {
    if (!hasCompleted && isHoisted && Math.abs(sharedBrightness - 80) < 5) {
       setHasCompleted(true);
       // Little delay to let them see it
       setTimeout(onComplete, 1500);
    }
  }, [isHoisted, sharedBrightness, onComplete, hasCompleted]);

  const currentBrightness = isHoisted ? sharedBrightness : (brightnessA + brightnessB) / 2;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ 
        padding: "10px", 
        background: isHoisted ? "#e6fffa" : "#fff5f5", 
        borderRadius: "8px", 
        border: `2px solid ${isHoisted ? "green" : "red"}`,
        marginBottom: "10px",
        fontSize: "0.9rem",
        textAlign: "center"
      }}>
        <strong>{t.mg_current_arch} </strong> {isHoisted ? t.mg_arch_good : t.mg_arch_bad}
      </div>

      {/* The Lantern */}
      <div style={{ 
        position: "relative", 
        width: "100px", 
        height: "140px", 
        background: "#333", 
        borderRadius: "10px 10px 40px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: `0 0 ${currentBrightness}px ${currentBrightness / 3}px gold`,
        transition: "box-shadow 0.2s"
      }}>
        <div style={{
          width: "60px", height: "80px", background: "gold", borderRadius: "20px",
          opacity: currentBrightness / 100 + 0.2,
          transition: "opacity 0.1s"
        }} />
        <div style={{ position: "absolute", top: "-15px", width: "30px", height: "15px", background: "#444", borderRadius: "5px" }} />
        <div style={{ position: "absolute", bottom: "-5px", width: "50px", height: "10px", background: "#222", borderRadius: "5px" }} />
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Slider A */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "15px", background: "white", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <span style={{ fontWeight: "bold", color: "#555" }}>{t.mg_slider} A</span>
          <input 
            type="range" 
            min="0" max="100" 
            value={isHoisted ? sharedBrightness : brightnessA} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (isHoisted) setSharedBrightness(val);
              else setBrightnessA(val);
            }}
            style={{ accentColor: "var(--camp-green)" }}
          />
          <small>{t.mg_brightness}: {isHoisted ? sharedBrightness : brightnessA}%</small>
        </div>

        {/* Slider B */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "15px", background: "white", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <span style={{ fontWeight: "bold", color: "#555" }}>{t.mg_slider} B</span>
          <input 
            type="range" 
            min="0" max="100" 
            value={isHoisted ? sharedBrightness : brightnessB} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (isHoisted) setSharedBrightness(val);
              else setBrightnessB(val);
            }}
            style={{ accentColor: "var(--camp-green)" }}
          />
          <small>{t.mg_brightness}: {isHoisted ? sharedBrightness : brightnessB}%</small>
        </div>
      </div>

      {!isHoisted ? (
         <div style={{ textAlign: "center", maxWidth: "400px" }}>
           <p style={{ fontSize: "0.9rem" }}>{t.mg_lantern_instr_bad}</p>
           <Button onClick={() => setIsHoisted(true)}>{t.mg_lantern_btn}</Button>
         </div>
      ) : (
        <div style={{ textAlign: "center", color: "var(--camp-green)", animation: "fadeIn 0.5s" }}>
           <p>{t.mg_lantern_success}</p>
           <p><strong>{t.mg_lantern_task}</strong></p>
        </div>
      )}
    </div>
  );
};

// Challenge 2: LazyColumn (Packing)
const SnackListChallenge = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => {
  const [mode, setMode] = useState<"column" | "lazy">("column");
  const [items, setItems] = useState<string[]>([]);
  const [scrollPos, setScrollPos] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TEXTS[lang];

  const TOTAL_ITEMS = 1000;
  const ITEM_HEIGHT = 40;
  const WINDOW_HEIGHT = 300;

  useEffect(() => {
    // Re-generate items when language changes
    const snacks = Array.from({ length: TOTAL_ITEMS }, (_, i) => `${t.mg_snack} #${i + 1} ${["🍪","🍫","🍬","🥨","🍎"][i % 5]}`);
    setItems(snacks);
  }, [lang]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPos(e.currentTarget.scrollTop);
    
    if (!hasCompleted && mode === "lazy" && e.currentTarget.scrollTop > 800) {
        setHasCompleted(true);
        setTimeout(onComplete, 1500);
    }
  };

  // "Bad" Column Implementation (Visualized)
  const renderColumn = () => {
    return (
      <div style={{ padding: "0" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ 
              height: ITEM_HEIGHT, 
              borderBottom: "1px solid #eee", 
              display: "flex", 
              alignItems: "center",
              paddingLeft: "10px",
              background: "#fff0f0" // Reddish tint for bad
          }}>
            {item}
          </div>
        ))}
      </div>
    );
  };

  // "Good" LazyColumn Implementation (Manually Simulated for Education)
  const renderLazy = () => {
    const startIndex = Math.floor(scrollPos / ITEM_HEIGHT);
    const buffer = 2;
    const visibleCount = Math.ceil(WINDOW_HEIGHT / ITEM_HEIGHT);
    const endIndex = Math.min(TOTAL_ITEMS - 1, startIndex + visibleCount + buffer);
    
    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push(
        <div 
            key={i} 
            style={{ 
                position: "absolute", 
                top: i * ITEM_HEIGHT, 
                width: "100%", 
                height: ITEM_HEIGHT, 
                borderBottom: "1px solid #cfc", 
                display: "flex", 
                alignItems: "center",
                paddingLeft: "10px",
                background: "#eaffea", // Greenish tint for good
                transition: "top 0.1s"
            }}
        >
          {items[i]}
        </div>
      );
    }

    return (
      <div style={{ height: TOTAL_ITEMS * ITEM_HEIGHT, position: "relative" }}>
        {visibleItems}
      </div>
    );
  };

  const renderCount = mode === "column" ? TOTAL_ITEMS : Math.ceil(WINDOW_HEIGHT / ITEM_HEIGHT) + 3; // +buffer

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "15px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <Button variant={mode === "column" ? "primary" : "outline"} onClick={() => setMode("column")}>{t.mg_list_mode_bad}</Button>
        <Button variant={mode === "lazy" ? "primary" : "outline"} onClick={() => setMode("lazy")}>{t.mg_list_mode_good}</Button>
      </div>

      <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          background: "#333", 
          color: "white",
          padding: "10px 15px", 
          borderRadius: "8px", 
          fontSize: "0.9rem", 
          fontFamily: "monospace"
      }}>
        <div>{t.mg_list_items}: {TOTAL_ITEMS}</div>
        <div style={{ color: mode === "column" ? "#ff6b6b" : "#51cf66" }}>
            {t.mg_list_nodes}: {renderCount} {mode === "column" ? "⚠️" : "✅"}
        </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ 
            height: WINDOW_HEIGHT, 
            overflowY: "auto", 
            background: "white", 
            border: `3px solid ${mode === "column" ? "#ffcccc" : "#ccffcc"}`, 
            borderRadius: "8px",
            position: "relative"
        }}
      >
        {mode === "column" ? renderColumn() : renderLazy()}
        
        {/* Viewport Visualizer Overlay */}
        {mode === "lazy" && (
             <div style={{
                 position: "sticky",
                 top: 0,
                 right: 0,
                 pointerEvents: "none",
                 padding: "5px",
                 background: "rgba(0,0,0,0.05)",
                 fontSize: "0.7rem",
                 color: "#666",
                 textAlign: "right"
             }}>
                 {t.mg_list_viewport}
             </div>
        )}
      </div>
      
      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", margin: 0 }}>
        {mode === "column" 
            ? t.mg_list_instr_bad
            : t.mg_list_instr_good}
      </p>
    </div>
  );
};

// --- Quiz Component ---
const Quiz = ({ question, options, onCorrect, lang }: { question: string, options: {text: string, correct: boolean}[], onCorrect: () => void, lang: Language }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [isSolved, setIsSolved] = useState(false);

    const handleSelect = (idx: number) => {
        setSelected(idx);
        if (options[idx].correct) {
            setIsSolved(true);
            setTimeout(onCorrect, 1500);
        }
    };

    return (
        <div>
            <div style={{ background: "#fff", padding: "15px", borderRadius: "10px", borderLeft: "5px solid var(--fire-orange)", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "var(--camp-brown)" }}>{TEXTS[lang].quiz1Title}</h3>
                <p style={{ fontSize: "1.1rem", margin: 0 }}>{question}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => !isSolved && handleSelect(idx)}
                        style={{
                            padding: "15px",
                            borderRadius: "10px",
                            border: "2px solid #ddd",
                            background: selected === idx 
                                ? (opt.correct ? "#d4edda" : "#f8d7da") 
                                : "white",
                            borderColor: selected === idx 
                                ? (opt.correct ? "#28a745" : "#dc3545") 
                                : "#ddd",
                            cursor: isSolved ? "default" : "pointer",
                            textAlign: "left",
                            fontSize: "1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.2s"
                        }}
                    >
                        {opt.text}
                        {selected === idx && (
                            opt.correct ? <CheckCircle color="green" /> : <XCircle color="red" />
                        )}
                    </button>
                ))}
            </div>
            {isSolved && <p style={{ color: "var(--camp-green)", textAlign: "center", fontWeight: "bold", marginTop: "15px", animation: "fadeIn 0.5s" }}>{TEXTS[lang].correct}</p>}
        </div>
    );
}

// --- Main Application ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState<Language>("zh");

  const t = TEXTS[lang];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(c => c + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const toggleLang = () => {
    setLang(l => l === "en" ? "zh" : "en");
  };

  // Game Content based on PDF - Dynamic based on Language
  const slides: SlideConfig[] = useMemo(() => [
    {
      id: 0,
      type: "intro",
      title: t.introTitle,
      content: (
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "var(--camp-green)", fontSize: "2.5rem", margin: "10px 0" }}>🏕️ {t.introTitle}</h1>
          <p style={{ fontSize: "1.2rem" }}>{t.introSubtitle}</p>
          <div style={{ margin: "30px 0" }}>
             <p><strong>{t.mission}</strong> {t.missionDesc}</p>
             <div style={{ display: "inline-flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ background: "#e8f5e9", padding: "5px 10px", borderRadius: "15px", color: "var(--camp-green)" }}>🔥 {t.hoisting}</span>
                <span style={{ background: "#fff3e0", padding: "5px 10px", borderRadius: "15px", color: "var(--fire-orange)" }}>📜 {t.lazyColumn}</span>
             </div>
          </div>
          <div style={{ fontSize: "4rem", margin: "20px" }}>👧 🐱 🏔️</div>
          <Button onClick={nextSlide}>{t.start}</Button>
        </div>
      )
    },
    {
        id: 1,
        type: "story",
        title: t.story1Title,
        content: (
            <>
                <Character name="xiaoqi" emotion="confused" />
                <Character name="cat" emotion="teaching" side="right" />
                <p><strong>Xiao Qi:</strong> "{t.story1P1}"</p>
                <p><strong>Cat:</strong> "{t.story1P2}"</p>
                <p style={{ background: "#f0f0f0", padding: "10px", borderRadius: "8px", fontStyle: "italic" }}>
                    {t.story1Lesson}
                </p>
            </>
        )
    },
    {
        id: 2,
        type: "concept",
        title: t.concept1Title,
        content: (
            <div style={{ textAlign: "center" }}>
                <p>{t.concept1P1}</p>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "30px 0", background: "#fff", padding: "20px", borderRadius: "10px" }}>
                    <div style={{ opacity: 0.7 }}>
                        <Tent size={64} color="#d64545" /> 
                        <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{t.concept1TentA}</div>
                    </div>
                    <div style={{ fontSize: "2rem", color: "red", fontWeight: "bold" }}>X</div>
                    <div style={{ opacity: 0.7 }}>
                        <Tent size={64} color="#457cd6" /> 
                        <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{t.concept1TentB}</div>
                    </div>
                </div>
                <p>{t.concept1P2}</p>
                <p style={{ color: "red" }}>{t.concept1Bad}</p>
            </div>
        )
    },
    {
        id: 3,
        type: "concept",
        title: t.concept2Title,
        content: (
            <div style={{ textAlign: "center" }}>
                <p>{t.concept2P1}</p>
                <div style={{ background: "var(--night-blue)", padding: "20px", borderRadius: "10px", color: "white", margin: "20px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Flame color="orange" size={48} fill="orange" />
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.2)", padding: "5px 15px", borderRadius: "20px", marginTop: "10px" }}>
                            <MapIcon color="wheat" size={20} />
                            <span>{t.concept2Shared}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ height: "30px", borderLeft: "2px dashed rgba(255,255,255,0.5)", marginBottom: "5px" }}></div>
                            <Tent size={40} color="#d64545" /> 
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ height: "30px", borderLeft: "2px dashed rgba(255,255,255,0.5)", marginBottom: "5px" }}></div>
                            <Tent size={40} color="#457cd6" />
                        </div>
                    </div>
                </div>
                <p>{t.concept2P2}</p>
                <p style={{ color: "green" }}>{t.concept2Pattern}</p>
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
                options={[
                    { text: t.quiz1A, correct: false },
                    { text: t.quiz1B, correct: true }
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
                <p>{t.challenge1Desc}</p>
                <LanternChallenge lang={lang} onComplete={() => setTimeout(nextSlide, 2000)} />
            </div>
        )
    },
    {
        id: 6,
        type: "story",
        title: t.story2Title,
        content: (
            <>
                <Character name="xiaoqi" emotion="excited" />
                <div style={{ textAlign: "center" }}>
                    <p><strong>Xiao Qi:</strong> "{t.story2P1}"</p>
                    <p>{t.story2P2}</p>
                    <div style={{ fontSize: "4rem", margin: "20px 0" }}>🍪🍫🍬🎒</div>
                    <p>{t.story2P3}</p>
                </div>
            </>
        )
    },
    {
        id: 7,
        type: "concept",
        title: t.concept3Title,
        content: (
            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                 <div style={{ border: "2px solid #ffcccc", padding: "15px", borderRadius: "12px", background: "#fff5f5" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#c0392b", display: "flex", alignItems: "center", gap: "10px" }}><XCircle size={20}/> {t.concept3BadTitle}</h4>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>{t.concept3BadDesc}</p>
                 </div>
                 <div style={{ border: "2px solid #ccffcc", padding: "15px", borderRadius: "12px", background: "#f0fff4" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#27ae60", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle size={20}/> {t.concept3GoodTitle}</h4>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>{t.concept3GoodDesc}</p>
                 </div>
            </div>
        )
    },
    {
        id: 8,
        type: "challenge_list",
        title: t.challenge2Title,
        content: (
            <div>
                <p>{t.challenge2Desc}</p>
                <SnackListChallenge lang={lang} onComplete={() => setTimeout(nextSlide, 2000)} />
            </div>
        )
    },
    {
        id: 9,
        type: "concept",
        title: t.concept4Title,
        content: (
            <div style={{ fontSize: "0.95rem" }}>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "var(--camp-brown)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Tag size={20} /> {t.concept4KeyTitle}
                    </h4>
                    <p>{t.concept4KeyDesc}</p>
                </div>
                
                <div>
                    <h4 style={{ color: "var(--camp-brown)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Maximize size={20} /> {t.concept4PadTitle}
                    </h4>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ flex: 1, border: "2px dashed #ccc", padding: "5px", borderRadius: "5px", textAlign: "center", fontSize: "0.8rem" }}>
                            {t.concept4PadBad}
                        </div>
                        <ArrowRight size={16} />
                        <div style={{ flex: 1, border: "2px solid var(--camp-green)", padding: "2px", borderRadius: "5px", textAlign: "center", fontSize: "0.8rem" }}>
                            <div style={{ background: "#eaffea", padding: "10px" }}>
                             {t.concept4PadGood}
                            </div>
                        </div>
                    </div>
                    <p style={{ marginTop: "5px" }}>{t.concept4PadDesc}</p>
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
                options={[
                    { text: t.quiz2A, correct: false },
                    { text: t.quiz2B, correct: true }
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
            <div style={{ textAlign: "center" }}>
                <h1 style={{ color: "var(--fire-orange)" }}>{t.outroBadge}</h1>
                <p>{t.outroMsg}</p>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", display: "inline-block", textAlign: "left", margin: "20px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <CheckCircle color="green" size={20} /> <span>{t.outroItem1}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                         <CheckCircle color="green" size={20} /> <span>{t.outroItem2}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                         <CheckCircle color="green" size={20} /> <span>{t.outroItem3}</span>
                    </div>
                </div>
                <div style={{ marginTop: "30px", position: "relative", height: "100px" }}>
                    <Character name="friend" emotion="camping" side="left" />
                    <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "0" }}>
                         <Tent size={80} color="#e25822" />
                    </div>
                    <Character name="cat" emotion="happy" side="right" />
                </div>
                <div style={{ marginTop: "40px" }}>
                    <Button onClick={() => window.location.reload()}>{t.restart}</Button>
                </div>
            </div>
        )
    }
  ], [lang]);

  // --- Safety Check ---
  // Ensure currentSlide is valid (handles HMR or language switches safely)
  if (currentSlide >= slides.length) {
    setCurrentSlide(0);
    return null;
  }

  const slide = slides[currentSlide];
  
  // Guard against undefined slide (double safety)
  if (!slide) return null;

  return (
    <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        minHeight: "100vh", 
        background: "var(--camp-beige)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Header / Progress */}
      <div style={{ padding: "15px 20px", background: "var(--camp-green)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
        <span style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}><Tent size={20} /> {t.title}</span>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <button 
                onClick={toggleLang} 
                style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    border: "none", 
                    color: "white", 
                    borderRadius: "5px", 
                    padding: "5px 10px", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "0.9rem"
                }}>
                <Languages size={16} />
                {lang === "en" ? "中文" : "English"}
            </button>
            <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>{t.step} {currentSlide + 1} {t.of} {slides.length}</span>
        </div>
      </div>
      <div style={{ width: "100%", height: "6px", background: "#ddd" }}>
        <div style={{ width: `${((currentSlide + 1) / slides.length) * 100}%`, height: "100%", background: "var(--fire-orange)", transition: "width 0.5s ease-in-out" }} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
        <div key={slide.id} className="slide-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ color: "var(--camp-brown)", marginTop: 0, fontSize: "1.8rem", textAlign: "center" }}>{slide.title}</h2>
            <div style={{ 
                background: "white", 
                padding: "25px", 
                borderRadius: "20px", 
                boxShadow: "0 8px 20px rgba(74, 103, 65, 0.1)", 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: slide.type === "story" || slide.type === "intro" ? "center" : "flex-start",
                position: "relative",
                overflow: "hidden" // For character positioning
            }}>
                {slide.content}
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(5px)" }}>
        <Button variant="secondary" onClick={prevSlide} disabled={currentSlide === 0}>{t.back}</Button>
        
        {/* Only show Next if it's not a blocking interactive slide */}
        {!["quiz", "challenge_lantern", "challenge_list"].includes(slide.type) && (
            <Button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
                {t.next} <ArrowRight size={18} style={{ verticalAlign: "middle", marginLeft: "5px" }} />
            </Button>
        )}
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
