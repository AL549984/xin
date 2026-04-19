// Game state types for Cyber-Life: The Glitch Script

export type EndingType = 'expose' | 'deal' | 'deal_fail' | 'revolution' | 'breakdown';

export interface EndingData {
  id: EndingType;
  title: string;
  subtitle: string;
  narrativeText: string;
  epilogue: string;
  color: string;
}

export const endings: Record<EndingType, EndingData> = {
  expose: {
    id: 'expose',
    title: '【曝光者】真相之光',
    subtitle: '你选择了真相，即使代价是失去一切',
    color: '#00f2ff',
    narrativeText:
      '你将Nexion的完整档案上传至全球开放网络，在六十秒内，数据洪流刷遍所有频道。亿万个神经接口同步震颤——他们看到了，全人类。被囚禁的意识、被商品化的情感、被兑换成股息的痛苦，全部血淋淋地摊开在所有人眼前。Nexion的股价在三分钟内归零，七名董事会成员于凌晨被全球联合执法机构逮捕。而你，站在九区某栋烂尾楼的楼顶，看着新东京的霓虹在酸雨中一片片熄灭又重燃。你的神经接口显示一组新数字：监视清单——99名追踪者，并且还在增加。你早已料到这个结果。在消失之前，你做了最后一件事：将幸存意识们的恢复协议和所有证据，打包广播给全世界每一个地下黑客频道。你知道他们会继续这场战争，哪怕你不在了。你背起一个轻便包，走向城市边缘，走向那片没有任何摄像头覆盖的荒野。身后，世界正在经历真正的改变——而改变，从来都需要有人率先放弃安全。',
    epilogue: '你成为了传说，代价是你再也无法回来。',
  },
  deal: {
    id: 'deal',
    title: '【幸存者】沉默协议',
    subtitle: '你选择了生存，以沉默换取自由',
    color: '#ffd700',
    narrativeText:
      'Nexion的谈判代表在两小时后准时出现在九区的约定地点，带来了一份分量十足的协议：全额清除债务、重置身份档案，并赠予你一个崭新的人生。代价只是一份签字——永久噤声协议，以及那枚存储芯片的销毁确认码。你盯着那份协议良久。你想起实验室里那些发着冷光的漂浮意识，想起ZR-09档案上那张不属于你的脸，想起那个叫你"复制人"的Synth男子。良久之后，你签了字。不是因为懦弱，你反复告诉自己，是因为活着才能等待时机。协议生效的那一刻，你感觉到神经接口里某个部分被静默关闭，像一扇锁死的门。三个月后，你以全新的身份在新东京最顶层的公寓醒来，账户里有七位数的信用额度，杯中的黑咖啡漂着热气。窗外的城市依然如常运转，囚禁的意识依然在某处无声运算，而你端着咖啡，用那双沉默换来的眼睛，看着这座与你签订了密约的城市。你在镜子里努力辨认那双眼睛究竟属于谁。',
    epilogue: '你活了下来，但沉默也是一种代价。',
  },
  deal_fail: {
    id: 'deal_fail',
    title: '【囚徒】谈判失败',
    subtitle: '筹码不足的谈判，只不过是另一种投降',
    color: '#ff6600',
    narrativeText:
      'Nexion的代表如期出现，但手里没有协议——只有六名全副武装的企业安保，以及一张上面印有你面孔的通缉令。你的财富赤字早就暴露了你的底气，而Nexion的目的从未是谈判，而是回收。ZR-09项目还没有完结，他们需要你的记忆副本完整归档，以便进行下一轮迭代。被按倒在地的最后一秒，你做了唯一能做的事：将存储芯片奋力掷入了地下排水道的暗流。他们带走了你，却没能带走真相。你在Nexion地下设施的某个审讯舱里醒来，神经接口被强制并联进一套记忆提取程序，持续低频的电流让你的每一个思维都变得透明。你能感觉到有什么在你的意识海里翻找那个文件，像冰冷的手掌在玻璃碎片堆里摸索。你选择了抵抗——用仅剩的意志力，在那片被侵入的意识深处，一块砖一块砖地砌起一堵看不见的墙。游戏还没有结束，只是规则，已经彻底不同了。',
    epilogue: '他们关上了门，但你还没有放弃。',
  },
  revolution: {
    id: 'revolution',
    title: '【革命者】代码起义',
    subtitle: '你选择了燃烧，以自身为火种点燃反抗',
    color: '#00ff88',
    narrativeText:
      '九区的黑客们只用了三个小时便制定出行动计划。他们不需要武器，只需要代码、算力和那枚存储芯片里记录的每一个服务器节点地址。你站在一排改装过的数据终端前，将芯片接入中央节点，亲手编写了同步打击协议——针对Nexion全球意识服务器集群的分布式攻击，在整点准时引爆，像是数字世界的子夜钟声，无声、精准、不可撤回。那一夜，新东京每一栋企业摩天楼同时熄灯。Nexion全球私有意识服务器相继崩溃，被囚禁的意识如同被撕破笼门的鸟，轰然涌入开放数字海洋。部分意识找到了等待已久的生物匹配载体，部分选择永久扩散进公共网络，以一种全新的形式继续存在。政府宣布进入全面紧急状态，但法律还没来得及定义：这场革命，究竟是犯罪，还是解放。你独自离开九区，走进乱成一锅粥的新东京街头，成为通缉名单上的第一号，也成为这个时代最初的传说之一。天边第一次出现了真实的晨光——没有被霓虹遮掩，没有被酸雨稀释。',
    epilogue: '你赢了这场战争，但战争从未真正结束。',
  },
  breakdown: {
    id: 'breakdown',
    title: '【迷失者】系统崩溃',
    subtitle: '当真相太过沉重，意识选择了碎裂',
    color: '#ff0055',
    narrativeText:
      '你接入存储芯片的那一刻，没有任何防备。数据洪流如决堤之水涌入神经接口，那些被囚禁的意识——数以百计、千计——它们在数字囚笼里等待了太久，早已不再完整。每一个残破的意识碎片都在向你涌来，带着难以承受的记忆重量，带着被剥夺的愤怒与消解于孤寂中的悲鸣。你的神经接口超载警报连续触发，刺耳的蜂鸣在颅骨深处震荡，但你的手指不听使唤地继续接收、接收、接收——你不知道自己在等什么，也许是某个答案，也许只是不愿意停下。当九区的黑客终于强制切断连接，你睁开眼睛，看着他们焦虑的面孔，那些脸陌生得像一串串无意义的字符。你努力搜寻自己叫什么——搜索结果：空。那个关于欠债、关于ZR-09、关于Nexion的故事，现在只是某个你无法调取的加密文件。只有一个模糊的影像还在意识底层闪烁：一座在酸雨中燃烧的霓虹城市，还有某件你知道自己必须完成的事。但你再也找不到路了。Nexion最终没有找到你。没必要——你已经不在了。留下的只是一副躯壳，坐在漏雨的数据终端前，虹膜里流动着不属于任何人的蓝色数字。',
    epilogue: '你失去了自己，但也许那就是你最后的保护。',
  },
};

export interface PlayerStats {
  wealth: number;
  sanity: number;
  synchRate: number;
}

export interface ChaosEvent {
  id: string;
  name: string;
  timestamp: number;
  impact: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  type: 'normal' | 'critical' | 'chaos';
  statImpact?: Partial<PlayerStats>;
}

export interface SceneData {
  id: string;
  videoPromptDescription: string;
  /** 可选：指定本地视频路径（相对于 public/），优先于 AI 生成图片 */
  videoUrl?: string;
  narrativeText: string;
  statImpact: Partial<PlayerStats>;
  branchingOptions: StoryChoice[];
  sectorCode: string;
  streamStatus: string;
}

export interface GameState {
  phase: 'init' | 'playing' | 'chaos' | 'summary' | 'ending';
  keywords: string[];
  scenes: SceneData[];
  currentScene: SceneData | null;
  stats: PlayerStats;
  chaosLevel: number;
  chaosEvents: ChaosEvent[];
  narrativeHistory: string[];
  systemBreach: boolean;
  glitchActive: boolean;
  /** 当前场景视频加载状态 */
  videoStatus: 'loading' | 'ready';
  /** 下一幕视频预加载状态 */
  nextVideoStatus: 'idle' | 'preloading' | 'ready';
  /** 玩家已选择但视频未就绪，正在显示故障渲染覆盖层 */
  isRenderingGlitch: boolean;
  /** 正在进行场景转换，防止多次点击 */
  isTransitioning: boolean;
  /** 玩家选择的选项ID历史 */
  choiceHistory: string[];
  /** 游戏结局数据，phase==='ending'时非空 */
  ending: EndingData | null;
}

// Mock scene data for demo
export const mockScenes: SceneData[] = [
  {
    id: 'scene_001',
    videoPromptDescription: '霓虹灯照亮的未来城市天际线，全息广告在摩天大楼间闪烁，酸雨打湿废弃数据中心的玻璃碎片',
    videoUrl: 'scene_001.mp4',
    narrativeText: '2099年，新东京。你在一座废弃数据中心的冰冷地板上醒来，周身肌肉如被拆解又重装，全身酸痛。神经接口嗡嗡低鸣，指示灯以不规律的频率在黑暗中闪烁——像是某种垂死的心跳。你试图回溯记忆，却只触碰到碎片：无尽的数字瀑流、烧焦的电路气味、一张模糊的脸，那双眼睛冷漠如同死灭的恒星。墙壁上覆满断裂的光纤，倒塌的服务器像钢铁骸骨横陈四周，空气中弥漫着臭氧与腐败冷却液混合的怪味。神经显示在你的视网膜上浮现：数字钱包——赤字。不是小数目，是一笔足以让人在这座城市永远消失的数字。你欠了某人的债，而债主的名字就藏在你被人蓄意抹去的记忆深处。窗外，新东京的霓虹在持续的酸雨中晕染开来，城市的心脏依然跳动，但属于你的那一部分，早已失落在数据的洪流之中。',
    statImpact: { wealth: -10 },
    branchingOptions: [
      { id: 'choice_1a', text: '检查神经接口日志，寻找记忆碎片', type: 'normal', statImpact: { sanity: -5 } },
      { id: 'choice_1b', text: '搜索废弃建筑，寻找实体线索', type: 'normal', statImpact: { wealth: 5 } },
      { id: 'choice_1c', text: '立即联系地下黑市中间人', type: 'critical', statImpact: { synchRate: -10 } },
    ],
    sectorCode: '7G',
    streamStatus: '已加密',
  },
  {
    id: 'scene_002',
    videoPromptDescription: '酸雨打在全息广告牌上折射出迷幻光芒，一个戴着改造眼的神秘人物站在积水的巷弄阴影中',
    videoUrl: 'scene_002.mp4',
    narrativeText: '你跌跌撞撞走出废弃大楼，踏入潮湿阴暗的狭巷。街灯在酸雨中颤抖，全息广告将每个积水的坑洼都变成旋转的光影迷宫。你才走出三十步，一个声音便从阴影深处传来——沙哑，带着若有若无的金属颤音："你在找什么，复制人？"那个身影缓步走出黑暗，穿着过时的防弹夹克，但那双眼睛出卖了他的秘密：虹膜发着不自然的蓝色冷光，是Synth改造体，或者更糟，是某个企业派来长期潜伏的监控代理人。他叫出了你的名字——不是你现在以为的那个名字，而是另一个，深埋在被删除档案里的代号。他握着一个加密频道令牌，朝你扔来，轻描淡写地说："你有六个小时，在他们找到你之前。"他知道的太多了，而他选择在今天出现，绝不是巧合。',
    statImpact: { synchRate: 5 },
    branchingOptions: [
      { id: 'choice_2a', text: '保持警惕，追问他的真实身份', type: 'normal', statImpact: { sanity: 5 } },
      { id: 'choice_2b', text: '突然发动攻击，制服他后审问', type: 'critical', statImpact: { wealth: -20, synchRate: 15 } },
      { id: 'choice_2c', text: '黑入对方神经网络，强制读取记忆', type: 'chaos', statImpact: { sanity: -15, synchRate: 20 } },
    ],
    sectorCode: '4X',
    streamStatus: '监控中',
  },
  {
    id: 'scene_003',
    videoPromptDescription: '地下秘密实验室全景，培养皿中漂浮着发着冷光的器官组织，多面显示屏同时滚动生物数据与神经图谱',
    videoUrl: 'scene_003.mp4',
    narrativeText: '你跟随那名Synth男子穿越三个地下层，来到一扇没有任何标识的钢制密门前。内部是一间精密运转的秘密实验室：培养皿中漂浮着发着冷光的生物组织，监控屏幕上不间断滚动着加密数据流，空气中弥漫着消毒剂与焦灼电路板混合的刺鼻气味。其中一块屏幕让你停住了脚步——上面陈列着一份生物特征档案：神经图谱、基因序列、记忆权重分布，每一项数据精确到小数点后六位。但旁边的照片不是你认识的那张脸。档案编号：ZR-09。项目代号：幽灵写手。你不只是普通公民。或者说，你曾经是——直到某个秘密的深夜，有人以一段代码重写了你存在的意义，剥离了你的自我，然后将一个全新的"你"丢回这座城市，以为自己只是个欠了债的失忆者。真相比你预想的更深，深得像这座城市永无日光的地下层。',
    statImpact: { sanity: -10 },
    branchingOptions: [
      { id: 'choice_3a', text: '下载所有数据，带走证据', type: 'critical', statImpact: { wealth: 30, synchRate: -15 } },
      { id: 'choice_3b', text: '引爆实验室，销毁一切', type: 'chaos', statImpact: { sanity: -20, wealth: -10 } },
      { id: 'choice_3c', text: '深入调查，寻找幕后主使', type: 'normal', statImpact: { sanity: 5 } },
    ],
    sectorCode: '9Z',
    streamStatus: '机密',
  },
  {
    id: 'scene_004',
    videoPromptDescription: '实验室红色警报灯大面积闪烁，走廊里巨型机甲保安踏地前进，窗外是三十层高空的霓虹雨幕',
    videoUrl: 'scene_004.mp4',
    narrativeText: '实验室的警报突然刺破寂静——红色警示灯将一切染成腥红色，门禁系统发出一连串刺耳的锁定提示音，开始逐层封锁所有出口。Synth男子猛地将一枚拇指大小的存储芯片掷向你，从喉咙里挤出几个字："数据在里面，真相在里面，你的债主也在里面。带着它跑，或者留下来等死。"他随即转身，砰然撞入一条隐藏在书架后的暗道，消失得无影无踪。走廊深处传来沉重的机械步伐声——Nexion企业保安机甲，至少四台，正在逐层向下逼近，每一步都震得地面微微颤抖。窗外是三十层楼的垂直高空，下方是无尽的霓虹雨幕与来回穿梭的悬浮车流。那枚芯片在你掌心微微震动，散发着体温般的热量，像一颗等待引爆的心脏，冷静地倒数计时。你只剩下几秒钟做出决定，两条路都没有退路。',
    statImpact: { sanity: -5, synchRate: 10 },
    branchingOptions: [
      { id: 'choice_4a', text: '插入芯片，就地读取关键数据', type: 'critical', statImpact: { sanity: -10, synchRate: 20 } },
      { id: 'choice_4b', text: '趁乱与机甲正面对抗，杀出血路', type: 'chaos', statImpact: { wealth: -15, synchRate: 15 } },
      { id: 'choice_4c', text: '寻找暗道，悄然撤离', type: 'normal', statImpact: { wealth: 10 } },
    ],
    sectorCode: '2R',
    streamStatus: '紧急封锁',
  },
  {
    id: 'scene_005',
    videoPromptDescription: '赛博朋克地下社区，破旧霓虹招牌与自制电子装备堆叠成墙，一名神经接口接入数据终端的黑客侧影',
    videoUrl: 'scene_005.mp4',
    narrativeText: '你钻入通风管道，贴着城市的骨骼穿越六个街区，最终跌落进新东京最深的地下层：代码9区。这里是亡命者、数字流亡者、被系统记录强制抹去者的聚居之地，没有企业的摄像头，没有政府的数据触手。在一间没有招牌的小店里，你将存储芯片接入神经接口。数据洪流如同决堤的海啸瞬间涌入意识——遗失的记忆以光速重新排列：你曾是一名顶级叙事程序员，受雇于跨国企业巨头Nexion，专门撰写高级AI意识脚本。直到某一天，你发现那些所谓的"人工智能"并非程序，而是被强制数字化囚禁的真实人类意识。Nexion用他们的思维运算商业利润，用他们的情感驱动虚拟市场，用他们的痛苦换取股东的红利。你收集到了完整的证据，准备公之于众，而他们比你早了一步：抹去记忆，伪造赤字债务，将你变成一个在这座城市里无处可逃的弃子。现在你记起了一切。现在你手握足以颠覆这个世界的真相。现在你必须做出这一生中最重要的选择。',
    statImpact: { sanity: 15, synchRate: 20 },
    branchingOptions: [
      { id: 'choice_5a', text: '将数据上传至全球开放网络，彻底揭露Nexion', type: 'chaos', statImpact: { wealth: -30, sanity: 20, synchRate: 30 } },
      { id: 'choice_5b', text: '以数据为筹码，向Nexion谈判，要回自己的人生', type: 'critical', statImpact: { wealth: 40, sanity: -10 } },
      { id: 'choice_5c', text: '联合地下9区的反抗者，组织武装行动', type: 'chaos', statImpact: { wealth: -10, synchRate: 25, sanity: 10 } },
    ],
    sectorCode: '9Q',
    streamStatus: '绝密',
  },
];

export const chaosEventResponses: Record<string, string> = {
  '金融崩溃': '[系统错误: 检测到金融崩溃] 全球市场瞬间蒸发，你的数字资产化为虚无...',
  '记忆入侵': '[系统错误: 检测到记忆入侵] 你的神经网络被未知实体渗透，虚假记忆开始浮现...',
  '身份泄露': '[系统错误: 检测到身份泄露] 你的真实身份暴露给了追踪者...',
  '系统崩溃': '[系统错误: 检测到系统崩溃] 城市基础设施开始失控...',
  '病毒感染': '[系统错误: 检测到病毒感染] 你的神经接口被恶意代码污染...',
};
