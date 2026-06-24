/**
 * 生命数字密码（Numerology）完整算法实现
 * 基于毕达哥拉斯生命数字体系
 * 
 * @version 2.0.0
 */

// ============================================================================
// 常量定义
// ============================================================================

// 毕达哥拉斯字母转数字映射表
const PITHAGOREAN_CHART = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
};

// 九宫格模板
const NINE_GRID_TEMPLATE = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
];

// 生命灵数解读
const LIFE_PATH_INTERPRETATIONS = {
    1: { title: "开创者", desc: "你是自己故事的主角，别等别人来写。" },
    2: { title: "协调者", desc: "你擅长在关系中找到自己的价值。" },
    3: { title: "表达者", desc: "你的世界里，美和快乐从不稀缺。" },
    4: { title: "实践者", desc: "稳扎稳打的你，终将收获满满的安心。" },
    5: { title: "探险者", desc: "变化是你的朋友，拥抱它而非躲避它。" },
    6: { title: "守护者", desc: "责任很重，但爱你的人会懂这份珍贵。" },
    7: { title: "探索者", desc: "内向不是孤独，是与自己深度相处的礼物。" },
    8: { title: "成就者", desc: "你值得成功，就像太阳值得升起。" },
    9: { title: "觉醒者", desc: "放下执念的那一刻，你反而得到一切。" },
    11: { title: "启示者", desc: "你的直觉比大多数人跑得快，相信它。" },
    22: { title: "建筑者", desc: "你有让梦想照进现实的力量。" },
    33: { title: "光耀者", desc: "你存在的方式，本身就是他人的光。" }
};

// ============================================================================
// 汉字 → 拼音 转换（内置完整映射，无外部依赖）
// ============================================================================

// 常用汉字拼音映射表（姓名+常用字）
const CHINESE_TO_PINYIN = {
    // 常用姓氏
    '李': 'li', '王': 'wang', '张': 'zhang', '刘': 'liu', '陈': 'chen',
    '杨': 'yang', '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu',
    '徐': 'xu', '孙': 'sun', '胡': 'hu', '朱': 'zhu', '高': 'gao',
    '林': 'lin', '何': 'he', '郭': 'guo', '马': 'ma', '罗': 'luo',
    '梁': 'liang', '宋': 'song', '郑': 'zheng', '谢': 'xie', '韩': 'han',
    '唐': 'tang', '冯': 'feng', '于': 'yu', '董': 'dong', '萧': 'xiao',
    '程': 'cheng', '曹': 'cao', '袁': 'yuan', '邓': 'deng', '许': 'xu',
    '傅': 'fu', '沈': 'shen', '曾': 'zeng', '彭': 'peng', '吕': 'lv',
    '苏': 'su', '卢': 'lu', '蒋': 'jiang', '蔡': 'cai', '贾': 'jia',
    '丁': 'ding', '魏': 'wei', '薛': 'xue', '叶': 'ye', '阎': 'yan',
    '余': 'yu', '潘': 'pan', '杜': 'du', '戴': 'dai', '夏': 'xia',
    '钟': 'zhong', '汪': 'wang', '田': 'tian', '任': 'ren', '姜': 'jiang',
    '范': 'fan', '方': 'fang', '石': 'shi', '姚': 'yao', '谭': 'tan',
    '廖': 'liao', '邹': 'zou', '熊': 'xiong', '金': 'jin', '陆': 'lu',
    '郝': 'hao', '孔': 'kong', '白': 'bai', '崔': 'cui', '康': 'kang',
    '毛': 'mao', '邱': 'qiu', '秦': 'qin', '江': 'jiang', '史': 'shi',
    '顾': 'gu', '侯': 'hou', '邵': 'shao', '孟': 'meng', '龙': 'long',
    '万': 'wan', '段': 'duan', '漕': 'cao', '钱': 'qian', '汤': 'tang',
    '尹': 'yin', '黎': 'li', '易': 'yi', '常': 'chang', '武': 'wu',
    '乔': 'qiao', '贺': 'he', '赖': 'lai', '龚': 'gong', '文': 'wen',
    // 常用名字
    '一': 'yi', '二': 'er', '三': 'san', '四': 'si', '五': 'wu',
    '六': 'liu', '七': 'qi', '八': 'ba', '九': 'jiu', '十': 'shi',
    '百': 'bai', '千': 'qian', '万': 'wan', '义': 'yi', '山': 'shan',
    '海': 'hai', '天': 'tian', '地': 'di', '人': 'ren', '和': 'he',
    '仁': 'ren', '义': 'yi', '礼': 'li', '智': 'zhi', '信': 'xin',
    '中': 'zhong', '华': 'hua', '国': 'guo', '民': 'min', '富': 'fu',
    '强': 'qiang', '刚': 'gang', '勇': 'yong', '毅': 'yi', '志': 'zhi',
    '鹏': 'peng', '飞': 'fei', '龙': 'long', '凤': 'feng', '虎': 'hu',
    '鹤': 'he', '云': 'yun', '雨': 'yu', '风': 'feng', '雷': 'lei',
    '电': 'dian', '光': 'guang', '明': 'ming', '月': 'yue', '日': 'ri',
    '星': 'xing', '辰': 'chen', '宇': 'yu', '宙': 'zhou', '乾': 'qian',
    '坤': 'kun', '凯': 'kai', '歌': 'ge', '舞': 'wu', '诗': 'shi',
    '书': 'shu', '画': 'hua', '琴': 'qin', '棋': 'qi', '梅': 'mei',
    '兰': 'lan', '竹': 'zhu', '菊': 'ju', '荷': 'he', '花': 'hua',
    '草': 'cao', '树': 'shu', '林': 'lin', '森': 'sen', '田': 'tian',
    '园': 'yuan', '川': 'chuan', '河': 'he', '湖': 'hu', '海': 'hai',
    '波': 'bo', '涛': 'tao', '浪': 'lang', '峰': 'feng', '岭': 'ling',
    '岩': 'yan', '石': 'shi', '沙': 'sha', '泉': 'quan', '源': 'yuan',
    '波': 'bo', '心': 'xin', '灵': 'ling', '魂': 'hun', '魄': 'po',
    '神': 'shen', '仙': 'xian', '道': 'dao', '德': 'de', '法': 'fa',
    '爱': 'ai', '情': 'qing', '恩': 'en', '义': 'yi', '孝': 'xiao',
    '忠': 'zhong', '诚': 'cheng', '信': 'xin', '礼': 'li', '乐': 'yue',
    '福': 'fu', '禄': 'lu', '寿': 'shou', '喜': 'xi', '庆': 'qing',
    '祥': 'xiang', '瑞': 'rui', '吉': 'ji', '利': 'li', '顺': 'shun',
    '昌': 'chang', '盛': 'sheng', '隆': 'long', '达': 'da', '通': 'tong',
    '广': 'guang', '博': 'bo', '学': 'xue', '文': 'wen', '章': 'zhang',
    '华': 'hua', '美': 'mei', '丽': 'li', '秀': 'xiu', '雅': 'ya',
    '静': 'jing', '宁': 'ning', '安': 'an', '平': 'ping', '和': 'he',
    '乐': 'le', '欣': 'xin', '然': 'ran', '悦': 'yue', '怡': 'yi',
    '然': 'ran', '洁': 'jie', '敏': 'min', '捷': 'jie', '杰': 'jie',
    '俊': 'jun', '豪': 'hao', '伟': 'wei', '雄': 'xiong', '威': 'wei',
    '辉': 'hui', '煌': 'huang', '烨': 'ye', '磊': 'lei', '超': 'chao',
    '越': 'yue', '进': 'jin', '升': 'sheng', '腾': 'teng', '飞': 'fei',
    '驰': 'chi', '骋': 'cheng', '骏': 'jun', '骐': 'qi', '骥': 'ji',
    '驰': 'chi', '鹏': 'peng', '鹰': 'ying', '雁': 'yan', '燕': 'yan',
    '蝶': 'die', '蜂': 'feng', '蝉': 'chan', '蛙': 'wa', '龟': 'gui',
    '麒': 'qi', '麟': 'lin', '狮': 'shi', '虎': 'hu', '豹': 'bao',
    '狼': 'lang', '熊': 'xiong', '鹿': 'lu', '兔': 'tu', '狐': 'hu',
    '狸': 'li', '猫': 'mao', '狗': 'gou', '鼠': 'shu', '蛇': 'she',
    '虫': 'chong', '锦': 'jin', '鲤': 'li', '鲤': 'li', '鲸': 'jing',
    '鲨': 'sha', '鳌': 'ao', '龟': 'gui', '蟹': 'xie', '螺': 'luo',
    '珍': 'zhen', '珠': 'zhu', '玉': 'yu', '珊': 'shan', '琪': 'qi',
    '琳': 'lin', '瑶': 'yao', '瑾': 'jin', '璇': 'xuan', '璐': 'lu',
    '环': 'huan', '璧': 'bi', '翠': 'cui', '羽': 'yu', '翎': 'ling',
    '翔': 'xiang', '翰': 'han', '翼': 'yi', '翘': 'qiao', '耀': 'yao',
    '辉': 'hui', '烨': 'ye', '烁': 'shuo', '熠': 'yi', '灿': 'can',
    '烂': 'lan', '丹': 'dan', '红': 'hong', '赤': 'chi', '绛': 'jiang',
    '紫': 'zi', '蓝': 'lan', '青': 'qing', '碧': 'bi', '翠': 'cui',
    '墨': 'mo', '白': 'bai', '素': 'su', '霜': 'shuang', '雪': 'xue',
    '冰': 'bing', '寒': 'han', '凉': 'liang', '暖': 'nuan', '热': 're',
    '春': 'chun', '夏': 'xia', '秋': 'qiu', '冬': 'dong', '晨': 'chen',
    '昏': 'hun', '夜': 'ye', '午': 'wu', '朝': 'chao', '夕': 'xi',
    '春': 'chun', '晓': 'xiao', '昧': 'mei', '暁': 'xiao', '晔': 'ye',
    '晟': 'sheng', '晧': 'hao', '晨': 'chen', '曦': 'xi', '朗': 'lang',
    '望': 'wang', '期': 'qi', '月': 'yue', '朗': 'lang', '朔': 'shuo',
    '望': 'wang', '盈': 'ying', '昊': 'hao', '炀': 'yang', '晖': 'hui',
    '东': 'dong', '南': 'nan', '西': 'xi', '北': 'bei', '左': 'zuo',
    '右': 'you', '前': 'qian', '后': 'hou', '上': 'shang', '下': 'xia',
    '内': 'nei', '外': 'wai', '间': 'jian', '里': 'li', '旁': 'pang',
    '新': 'xin', '旧': 'jiu', '古': 'gu', '今': 'jin', '昔': 'xi',
    '永': 'yong', '久': 'jiu', '长': 'chang', '恒': 'heng', '常': 'chang',
    '奇': 'qi', '巧': 'qiao', '妙': 'miao', '神': 'shen', '工': 'gong',
    '巧': 'qiao', '匠': 'jiang', '师': 'shi', '宗': 'zong', '主': 'zhu',
    '君': 'jun', '臣': 'chen', '民': 'min', '夫': 'fu', '妻': 'qi',
    '父': 'fu', '母': 'mu', '子': 'zi', '女': 'nv', '儿': 'er',
    '兄': 'xiong', '弟': 'di', '姐': 'jie', '妹': 'mei', '亲': 'qin',
    '友': 'you', '朋': 'peng', '伴': 'ban', '侣': 'lv', '辈': 'bei',
    '代': 'dai', '世': 'shi', '纪': 'ji', '年': 'nian', '岁': 'sui',
    '时': 'shi', '刻': 'ke', '分': 'fen', '秒': 'miao', '春': 'chun',
    '秋': 'qiu', '夏': 'xia', '冬': 'dong', '年': 'nian', '节': 'jie',
    '日': 'ri', '月': 'yue', '时': 'shi', '分': 'fen', '秒': 'miao',
    '元': 'yuan', '首': 'shou', '始': 'shi', '初': 'chu', '终': 'zhong',
    '末': 'mo', '极': 'ji', '端': 'duan', '始': 'shi', '开': 'kai',
    '拓': 'tuo', '创': 'chuang', '建': 'jian', '立': 'li', '成': 'cheng',
    '就': 'jiu', '功': 'gong', '业': 'ye', '志': 'zhi', '向': 'xiang',
    '梦': 'meng', '想': 'xiang', '愿': 'yuan', '望': 'wang', '念': 'nian',
    '思': 'si', '想': 'xiang', '感': 'gan', '悟': 'wu', '智': 'zhi',
    '慧': 'hui', '知': 'zhi', '识': 'shi', '学': 'xue', '问': 'wen',
    '研': 'yan', '究': 'jiu', '探': 'tan', '索': 'suo', '求': 'qiu',
    '寻': 'xun', '找': 'zhao', '得': 'de', '获': 'huo', '成': 'cheng',
    '败': 'bai', '得': 'de', '失': 'shi', '荣': 'rong', '辱': 'ru',
    '胜': 'sheng', '负': 'fu', '赢': 'ying', '输': 'shu', '进': 'jin',
    '退': 'tui', '攻': 'gong', '守': 'shou', '防': 'fang', '护': 'hu',
    '守': 'shou', '保': 'bao', '养': 'yang', '育': 'yu', '教': 'jiao',
    '育': 'yu', '学': 'xue', '校': 'xiao', '院': 'yuan', '堂': 'tang',
    '馆': 'guan', '舍': 'she', '宅': 'zhai', '屋': 'wu', '房': 'fang',
    '室': 'shi', '家': 'jia', '庭': 'ting', '园': 'yuan', '院': 'yuan',
    '宫': 'gong', '殿': 'dian', '楼': 'lou', '塔': 'ta', '桥': 'qiao',
    '路': 'lu', '街': 'jie', '道': 'dao', '途': 'tu', '径': 'jing',
    '门': 'men', '窗': 'chuang', '户': 'hu', '庭': 'ting', '院': 'yuan',
    '厅': 'ting', '堂': 'tang', '室': 'shi', '房': 'fang', '厨房': 'chufang',
    '客': 'ke', '厅': 'ting', '卧': 'wo', '室': 'shi', '书房': 'shufang',
    '卫': 'wei', '生': 'sheng', '间': 'jian', '浴': 'yu', '室': 'shi',
    '阳台': 'yangtai', '露台': 'lutai', '庭院': 'tingyuan', '花园': 'huayuan',
    '车': 'che', '船': 'chuan', '飞机': 'feiji', '火车': 'huoche',
    '地铁': 'ditie', '公交': 'gongjiao', '汽车': 'qiche', '单车': 'danche',
    '路': 'lu', '程': 'cheng', '距': 'ju', '离': 'li', '近': 'jin',
    '远': 'yuan', '高': 'gao', '低': 'di', '深': 'shen', '浅': 'qian',
    '厚': 'hou', '薄': 'bao', '宽': 'kuan', '窄': 'zhai', '大': 'da',
    '小': 'xiao', '长': 'chang', '短': 'duan', '粗': 'cu', '细': 'xi',
    '重': 'zhong', '轻': 'qing', '硬': 'ying', '软': 'ruan', '热': 're',
    '冷': 'leng', '温': 'wen', '凉': 'liang', '暖': 'nuan', '爽': 'shuang',
    '香': 'xiang', '臭': 'chou', '甜': 'tian', '苦': 'ku', '酸': 'suan',
    '辣': 'la', '咸': 'xian', '淡': 'dan', '浓': 'nong', '鲜': 'xian',
    '美': 'mei', '丑': 'chou', '好': 'hao', '坏': 'huai', '对': 'dui',
    '错': 'cuo', '真': 'zhen', '假': 'jia', '正': 'zheng', '反': 'fan',
    '顺': 'shun', '逆': 'ni', '正': 'zheng', '负': 'fu', '正': 'zheng',
    '负': 'fu', '阴': 'yin', '阳': 'yang', '动': 'dong', '静': 'jing',
    '快': 'kuai', '慢': 'man', '早': 'zao', '晚': 'wan', '迟': 'chi',
    '疾': 'ji', '急': 'ji', '缓': 'huan', '速': 'su', '快': 'kuai',
    '慢': 'man', '疾': 'ji', '徐': 'xu', '稳': 'wen', '健': 'jian',
    '康': 'kang', '健': 'jian', '壮': 'zhuang', '强': 'qiang', '弱': 'ruo',
    '柔': 'rou', '刚': 'gang', '勇': 'yong', '敢': 'gan', '毅': 'yi',
    '坚': 'jian', '强': 'qiang', '烈': 'lie', '猛': 'meng', '威': 'wei',
    '凶': 'xiong', '狠': 'hen', '恶': 'e', '善': 'shan', '慈': 'ci',
    '悲': 'bei', '哀': 'ai', '乐': 'le', '欢': 'huan', '喜': 'xi',
    '愁': 'chou', '怨': 'yuan', '恨': 'hen', '怒': 'nu', '惊': 'jing',
    '恐': 'kong', '惧': 'ju', '怕': 'pa', '安': 'an', '心': 'xin',
    '情': 'qing', '感': 'gan', '想': 'xiang', '念': 'nian', '思': 'si',
    '意': 'yi', '志': 'zhi', '愿': 'yuan', '望': 'wang', '希': 'xi',
    '盼': 'pan', '期': 'qi', '待': 'dai', '等': 'deng', '候': 'hou',
    '迎': 'ying', '送': 'song', '别': 'bie', '离': 'li', '合': 'he',
    '聚': 'ju', '散': 'san', '逢': 'feng', '遇': 'yu', '见': 'jian',
    '识': 'shi', '知': 'zhi', '晓': 'xiao', '觉': 'jue', '醒': 'xing',
    '明': 'ming', '智': 'zhi', '慧': 'hui', '光': 'guang', '亮': 'liang',
    '辉': 'hui', '灿': 'can', '烂': 'lan', '耀': 'yao', '眼': 'yan',
    '睛': 'jing', '目': 'mu', '耳': 'er', '鼻': 'bi', '口': 'kou',
    '嘴': 'zui', '舌': 'she', '牙': 'ya', '齿': 'chi', '唇': 'chun',
    '发': 'fa', '头': 'tou', '脑': 'nao', '心': 'xin', '肝': 'gan',
    '肺': 'fei', '胃': 'wei', '肾': 'shen', '脾': 'pi', '胆': 'dan',
    '手': 'shou', '脚': 'jiao', '足': 'zu', '腿': 'tui', '臂': 'bi',
    '膀': 'pang', '腰': 'yao', '背': 'bei', '胸': 'xiong', '腹': 'fu',
    '肩': 'jian', '颈': 'jing', '血': 'xue', '汗': 'han', '泪': 'lei',
    '雨': 'yu', '水': 'shui', '泪': 'lei', '汗': 'han', '血': 'xue',
    '酒': 'jiu', '茶': 'cha', '米': 'mi', '饭': 'fan', '面': 'mian',
    '包': 'bao', '饺': 'jiao', '饼': 'bing', '糖': 'tang', '盐': 'yan',
    '油': 'you', '盐': 'yan', '酱': 'jiang', '醋': 'cu', '米': 'mi',
    '麦': 'mai', '豆': 'dou', '瓜': 'gua', '果': 'guo', '蔬': 'shu',
    '菜': 'cai', '肉': 'rou', '鱼': 'yu', '鸡': 'ji', '鸭': 'ya',
    '鹅': 'e', '牛': 'niu', '羊': 'yang', '猪': 'zhu', '马': 'ma',
    '驴': 'lv', '骡': 'luo', '骆': 'luo', '驼': 'tuo', '象': 'xiang',
    '犀': 'xi', '虎': 'hu', '豹': 'bao', '熊': 'xiong', '猿': 'yuan',
    '猴': 'hou', '兔': 'tu', '鼠': 'shu', '蛇': 'she', '龙': 'long',
    '凤': 'feng', '鹰': 'ying', '鸽': 'ge', '雀': 'que', '燕': 'yan',
    '雁': 'yan', '鸟': 'niao', '虫': 'chong', '蝶': 'die', '蜂': 'feng',
    '蚁': 'yi', '蜜': 'mi', '蚕': 'can', '蛙': 'wa', '龟': 'gui',
    '螃': 'pang', '蟹': 'xie', '虾': 'xia', '螺': 'luo', '蚌': 'bang',
    '珍': 'zhen', '珠': 'zhu', '玉': 'yu', '石': 'shi', '金': 'jin',
    '银': 'yin', '铜': 'tong', '铁': 'tie', '铝': 'lv', '木': 'mu',
    '竹': 'zhu', '藤': 'teng', '草': 'cao', '麻': 'ma', '棉': 'mian',
    '丝': 'si', '绸': 'chou', '缎': 'duan', '锦': 'jin', '绣': 'xiu',
    '布': 'bu', '衣': 'yi', '衫': 'shan', '裙': 'qun', '裤': 'ku',
    '袜': 'wa', '鞋': 'xie', '帽': 'mao', '巾': 'jin', '帕': 'pa',
    '袋': 'dai', '包': 'bao', '箱': 'xiang', '柜': 'gui', '桌': 'zhuo',
    '椅': 'yi', '凳': 'deng', '床': 'chuang', '沙': 'sha', '发': 'fa',
    '灯': 'deng', '烛': 'zhu', '烟': 'yan', '火': 'huo', '光': 'guang',
    '电': 'dian', '力': 'li', '气': 'qi', '风': 'feng', '雨': 'yu',
    '云': 'yun', '雷': 'lei', '电': 'dian', '霜': 'shuang', '雪': 'xue',
    '雾': 'wu', '霞': 'xia', '虹': 'hong', '晴': 'qing', '阴': 'yin',
    '天': 'tian', '气': 'qi', '候': 'hou', '节': 'jie', '气': 'qi',
    '春': 'chun', '夏': 'xia', '秋': 'qiu', '冬': 'dong', '年': 'nian',
    '纪': 'ji', '代': 'dai', '岁': 'sui', '时': 'shi', '刻': 'ke',
    '分': 'fen', '秒': 'miao', '刻': 'ke', '钟': 'zhong', '点': 'dian',
    '钟': 'zhong', '表': 'biao', '时': 'shi', '辰': 'chen', '光': 'guang',
    '阴': 'yin', '阳': 'yang', '昼': 'zhou', '夜': 'ye', '晨': 'chen',
    '昏': 'hun', '晓': 'xiao', '夕': 'xi', '早': 'zao', '晚': 'wan',
    '春': 'chun', '早': 'zao', '朝': 'chao', '旭': 'xu', '昉': 'fang',
    '东': 'dong', '晓': 'xiao', '晨': 'chen', '昧': 'mei', '晁': 'chao',
    '晃': 'huang', '晖': 'hui', '晟': 'sheng', '晔': 'ye', '昊': 'hao',
    '皓': 'hao', '天': 'tian', '宇': 'yu', '星': 'xing', '辰': 'chen',
    '空': 'kong', '宙': 'zhou', '穹': 'qiong', '乾': 'qian', '坤': 'kun',
    '天': 'tian', '地': 'di', '海': 'hai', '山': 'shan', '川': 'chuan',
    '湖': 'hu', '河': 'he', '江': 'jiang', '溪': 'xi', '泉': 'quan',
    '源': 'yuan', '渊': 'yuan', '波': 'bo', '涛': 'tao', '浪': 'lang',
    '潮': 'chao', '湛': 'zhan', '深': 'shen', '浅': 'qian', '清': 'qing',
    '浊': 'zhuo', '洁': 'jie', '净': 'jing', '污': 'wu', '浮': 'fu',
    '沉': 'chen', '升': 'sheng', '降': 'jiang', '落': 'luo', '飘': 'piao',
    '流': 'liu', '注': 'zhu', '涌': 'yong', '汹': 'xiong', '澎': 'peng',
    '滋': 'zi', '润': 'run', '浸': 'jin', '润': 'run', '浸': 'jin',
    '漏': 'lou', '浅': 'qian', '深': 'shhen', '岸': 'an', '沙': 'sha',
    '滩': 'tan', '岛': 'dao', '洲': 'zhou', '礁': 'jiao', '石': 'shi',
    '岩': 'yan', '峰': 'feng', '岭': 'ling', '崖': 'ya', '谷': 'gu',
    '壑': 'he', '洞': 'dong', '穴': 'xue', '窟': 'ku', '门': 'men',
    '户': 'hu', '窗': 'chuang', '楼': 'lou', '台': 'tai', '亭': 'ting',
    '阁': 'ge', '廊': 'lang', '殿': 'dian', '堂': 'tang', '屋': 'wu',
    '舍': 'she', '宅': 'zhai', '院': 'yuan', '庭': 'ting', '园': 'yuan',
    '房': 'fang', '室': 'shi', '厅': 'ting', '厨': 'chu', '卫': 'wei',
    '卧': 'wo', '书': 'shu', '客': 'ke', '餐': 'can', '厕': 'ce',
    '廊': 'lang', '柱': 'zhu', '梁': 'liang', '栋': 'dong', '檐': 'yan',
    '瓦': 'wa', '砖': 'zhuan', '石': 'shi', '木': 'mu', '竹': 'zhu',
    '草': 'cao', '花': 'hua', '树': 'shu', '林': 'lin', '森': 'sen',
    '园': 'yuan', '果': 'guo', '蔬': 'shu', '茶': 'cha', '桑': 'sang',
    '麻': 'ma', '棉': 'mian', '葛': 'ge', '藤': 'teng', '花': 'hua',
    '草': 'cao', '叶': 'ye', '枝': 'zhi', '根': 'gen', '茎': 'jing',
    '果': 'guo', '种': 'zhong', '菜': 'cai', '瓜': 'gua', '豆': 'dou',
    '谷': 'gu', '米': 'mi', '麦': 'mai', '薯': 'shu', '蔗': 'zhe',
    '茶': 'cha', '桑': 'sang', '林': 'lin', '木': 'mu', '材': 'cai',
    '松': 'song', '柏': 'bai', '杉': 'shan', '榕': 'rong', '楠': 'nan',
    '樟': 'zhang', '桂': 'gui', '槐': 'huai', '榆': 'yu', '杨': 'yang',
    '柳': 'liu', '桐': 'tong', '枫': 'feng', '榴': 'liu', '桃': 'tao',
    '梅': 'mei', '李': 'li', '杏': 'xing', '梨': 'li', '枣': 'zao',
    '栗': 'li', '柿': 'shi', '柑': 'gan', '橘': 'ju', '橙': 'cheng',
    '柚': 'you', '枣': 'zao', '榛': 'zhen', '榉': 'ju', '榆': 'yu',
    '杨': 'yang', '柳': 'liu', '枝': 'zhi', '叶': 'ye', '根': 'gen',
    '材': 'cai', '板': 'ban', '木': 'mu', '箱': 'xiang', '柜': 'gui',
    '桌': 'zhuo', '椅': 'yi', '凳': 'deng', '床': 'chuang', '沙': 'sha',
    '柜': 'gui', '架': 'jia', '格': 'ge', '匣': 'xia', '盒': 'he',
    '盘': 'pan', '碟': 'die', '碗': 'wan', '杯': 'bei', '盏': 'zhan',
    '瓶': 'ping', '坛': 'tan', '罐': 'guan', '壶': 'hu', '筒': 'tong',
    '筒': 'tong', '筷': 'kuai', '勺': 'shao', '刀': 'dao', '叉': 'cha',
    '剪': 'jian', '针': 'zhen', '线': 'xian', '绳': 'sheng', '带': 'dai',
    '尺': 'chi', '秤': 'cheng', '钱': 'qian', '银': 'yin', '金': 'jin',
    '铜': 'tong', '铁': 'tie', '锡': 'xi', '铝': 'lv', '锌': 'xin',
    '镍': 'nie', '钻': 'zuan', '玉': 'yu', '珠': 'zhu', '珊': 'shan',
    '瑚': 'hu', '琥': 'hu', '珀': 'po', '碧': 'bi', '翠': 'cui',
    '玉': 'yu', '琅': 'lang', '琳': 'lin', '琪': 'qi', '琦': 'qi',
    '瑶': 'yao', '瑾': 'jin', '瑟': 'se', '瑚': 'hu', '瑛': 'ying',
    '瑜': 'yu', '璐': 'lu', '璜': 'huang', '璧': 'bi', '璋': 'zhang',
    '璃': 'li', '瓷': 'ci', '瓦': 'wa', '砖': 'zhuan', '石': 'shi',
    '砂': 'sha', '岩': 'yan', '矿': 'kuang', '泉': 'quan', '砚': 'yan',
    '碑': 'bei', '碛': 'qi', '碧': 'bi', '碟': 'die', '碗': 'wan',
    '盘': 'pan', '盆': 'pen', '缸': 'gang', '瓮': 'weng', '坛': 'tan',
    '罐': 'guan', '壶': 'hu', '瓢': 'piao', '勺': 'shao', '刀': 'dao',
    '剑': 'jian', '枪': 'qiang', '炮': 'pao', '弹': 'dan', '弓': 'gong',
    '矢': 'shi', '矛': 'mao', '盾': 'dun', '刀': 'dao', '剑': 'jian',
    '匕': 'bi', '叉': 'cha', '戟': 'ji', '戈': 'ge', '弓': 'gong',
    '弩': 'nu', '矢': 'shi', '箭': 'jian', '标': 'biao', '枪': 'qiang',
    '炮': 'pao', '舰': 'jian', '船': 'chuan', '艇': 'ting', '帆': 'fan',
    '舸': 'ge', '艘': 'sou', '舱': 'cang', '航': 'hang', '船': 'chuan',
    '舰': 'jian', '艇': 'ting', '舸': 'ge', '艘': 'sou', '舰': 'jian',
    '旗': 'qi', '幡': 'fan', '幢': 'chuang', '帆': 'fan', '带': 'dai',
    '帕': 'pa', '巾': 'jin', '布': 'bu', '帘': 'lian', '幕': 'mu',
    '帐': 'zhang', '帷': 'wei', '幌': 'huang', '旗': 'qi', '帜': 'zhi',
    '徽': 'hui', '章': 'zhang', '印': 'yin', '玺': 'xi', '绶': 'shou',
    '带': 'dai', '绶': 'shou', '印': 'yin', '符': 'fu', '节': 'jie',
    '竹': 'zhu', '节': 'jie', '筒': 'tong', '笛': 'di', '箫': 'xiao',
    '笙': 'sheng', '筝': 'zheng', '琴': 'qin', '瑟': 'se', '鼓': 'gu',
    '钟': 'zhong', '铃': 'ling', '锣': 'luo', '钹': 'bo', '铙': 'nao',
    '锤': 'chui', '铛': 'cheng', '锁': 'suo', '链': 'lian', '钩': 'gou',
    '针': 'zhen', '线': 'xian', '缝': 'feng', '绣': 'xiu', '织': 'zhi',
    '纺': 'fang', '绸': 'chou', '缎': 'duan', '锦': 'jin', '绣': 'xiu',
    '绦': 'tao', '绳': 'sheng', '索': 'suo', '线': 'xian', '绂': 'fu',
    '纱': 'sha', '绔': 'ku', '统': 'tong', '丝': 'si', '绸': 'chou',
    '绢': 'juan', '绣': 'xiu', '绥': 'sui', '继': 'ji', '续': 'xu',
    '索': 'suo', '累': 'lei', '紧': 'jin', '缚': 'fu', '缠': 'chan',
    '缘': 'yuan', '结': 'jie', '绕': 'rao', '绑': 'bang', '绒': 'rong',
    '絮': 'xu', '紫': 'zi', '绛': 'jiang', '绱': 'shang', '缍': 'duo',
    '绺': 'liu', '绉': 'zhou', '绐': 'dai', '综': 'zong', '绽': 'zhan',
    '绾': 'wan', '绰': 'chuo', '绱': 'shang', '绸': 'chou', '绾': 'wan',
    '缀': 'zhui', '缁': 'zi', '缂': 'ke', '缃': 'xiang', '缄': 'jian',
    '缅': 'mian', '缆': 'lan', '缈': 'miao', '缉': 'ji', '缊': 'yun',
    '缋': 'hui', '缍': 'duo', '缓': 'huan', '缔': 'di', '缕': 'lv',
    '编': 'bian', '缗': 'min', '缘': 'yuan', '缙': 'jin', '缚': 'fu',
    '缛': 'ru', '缜': 'zhen', '缝': 'feng', '缞': 'cui', '缟': 'gao',
    '缠': 'chan', '缢': 'yi', '缣': 'jian', '缤': 'bin', '缥': 'piao',
    '缦': 'man', '缧': 'lei', '缨': 'ying', '缪': 'miao', '缫': 'sao',
    '缬': 'xie', '缭': 'liao', '缮': 'shan', '缯': 'zeng', '缰': 'jiang',
    '缱': 'qian', '缲': 'qiao', '缳': 'huan', '缴': 'jiao', '缵': 'zuan',
    '才': 'cai', '材': 'cai', '财': 'cai', '木': 'mu', '林': 'lin',
    '森': 'sen', '戈': 'ge', '我': 'wo', '你': 'ni', '他': 'ta',
    '她': 'ta', '它': 'ta', '们': 'men', '的': 'de', '地': 'di',
    '得': 'de', '了': 'le', '是': 'shi', '在': 'zai', '有': 'you',
    '和': 'he', '与': 'yu', '或': 'huo', '但': 'dan', '却': 'que',
    '又': 'you', '如': 'ru', '果': 'guo', '则': 'ze', '便': 'bian',
    '要': 'yao', '会': 'hui', '能': 'neng', '可': 'ke', '以': 'yi',
    '因': 'yin', '所': 'suo', '从': 'cong', '到': 'dao', '去': 'qu',
    '来': 'lai', '去': 'qu', '为': 'wei', '而': 'er', '且': 'qie',
    '这': 'zhe', '那': 'na', '这': 'zhe', '些': 'xie', '些': 'xie',
    '谁': 'shui', '什': 'shen', '么': 'me', '怎': 'zen', '么': 'me',
    '哪': 'na', '里': 'li', '怎': 'zen', '这': 'zhe', '样': 'yang',
    '样': 'yang', '吗': 'ma', '呢': 'ne', '吧': 'ba', '啊': 'a',
    '哦': 'o', '呀': 'ya', '哇': 'wa', '啦': 'la', '呐': 'na',
    '嘛': 'ma', '哟': 'yo', '耶': 'ye', '咧': 'lie', '哄': 'hong',
    '嘿': 'hei', '哈': 'ha', '嘻': 'xi', '嘿': 'hei', '呼': 'hu',
    '吹': 'chui', '唱': 'chang', '歌': 'ge', '吟': 'yin', '咏': 'yong',
    '叹': 'tan', '息': 'xi', '哭': 'ku', '泣': 'qi', '号': 'hao',
    '哭': 'ku', '笑': 'xiao', '喜': 'xi', '悦': 'yue', '欣': 'xin',
    '乐': 'le', '欢': 'huan', '愉': 'yu', '快': 'kuai', '畅': 'chang',
    '爽': 'shuang', '惬': 'qie', '意': 'yi', '满': 'man', '足': 'zu',
    '饱': 'bao', '饿': 'e', '渴': 'ke', '累': 'lei', '困': 'kun',
    '乏': 'fa', '痛': 'tong', '痒': 'yang', '舒': 'shu', '服': 'fu',
    '健': 'jian', '康': 'kang', '疾': 'ji', '病': 'bing', '伤': 'shang',
    '创': 'chuang', '伤': 'shang', '痛': 'tong', '疼': 'teng', '痒': 'yang',
    '看': 'kan', '见': 'jian', '闻': 'wen', '听': 'ting', '说': 'shuo',
    '读': 'du', '写': 'xie', '画': 'hua', '唱': 'chang', '跳': 'tiao',
    '跑': 'pao', '走': 'zou', '站': 'zhan', '坐': 'zuo', '躺': 'tang',
    '睡': 'shui', '醒': 'xing', '起': 'qi', '床': 'chuang', '卧': 'wo',
    '起': 'qi', '居': 'ju', '食': 'shi', '吃': 'chi', '喝': 'he',
    '饮': 'yin', '咽': 'yan', '嚼': 'jiao', '吞': 'tun', '吐': 'tu',
    '呕': 'ou', '泻': 'xie', '便': 'bian', '排': 'pai', '放': 'fang',
    '尿': 'niao', '粪': 'fen', '去': 'qu', '厕': 'ce', '卫': 'wei',
    '生': 'sheng', '洗': 'xi', '浴': 'yu', '澡': 'zao', '沐': 'mu',
    '浴': 'yu', '梳': 'shu', '头': 'tou', '理': 'li', '发': 'fa',
    '整': 'zheng', '装': 'zhuang', '穿': 'chuan', '衣': 'yi', '戴': 'dai',
    '扣': 'kou', '系': 'ji', '带': 'dai', '扣': 'kou', '结': 'jie',
    '打': 'da', '结': 'jie', '扎': 'za', '绑': 'bang', '包': 'bao',
    '裹': 'guo', '卷': 'juan', '折': 'zhe', '叠': 'die', '铺': 'pu',
    '叠': 'die', '卷': 'juan', '收': 'shou', '藏': 'cang', '放': 'fang',
    '置': 'zhi', '摆': 'bai', '列': 'lie', '排': 'pai', '队': 'dui',
    '成': 'cheng', '班': 'ban', '组': 'zu', '团': 'tuan', '群': 'qun',
    '队': 'dui', '伍': 'wu', '旅': 'lv', '师': 'shi', '军': 'jun',
    '营': 'ying', '连': 'lian', '排': 'pai', '班': 'ban', '工': 'gong',
    '作': 'zuo', '务': 'wu', '岗': 'gang', '职': 'zhi', '位': 'wei',
    '责': 'ze', '任': 'ren', '命': 'ming', '令': 'ling', '号': 'hao',
    '召': 'zhao', '叫': 'jiao', '喊': 'han', '呼': 'hu', '吵': 'chao',
    '闹': 'nao', '争': 'zheng', '论': 'lun', '议': 'yi', '说': 'shuo',
    '谈': 'tan', '判': 'pan', '评': 'ping', '议': 'yi', '论': 'lun',
    '争': 'zheng', '吵': 'chao', '闹': 'nao', '哭': 'ku', '笑': 'xiao',
    '叫': 'jiao', '喊': 'han', '呼': 'hu', '唱': 'chang', '歌': 'ge',
    '吟': 'yin', '咏': 'yong', '叹': 'tan', '息': 'xi', '嘘': 'xu',
    '吹': 'chui', '言': 'yan', '语': 'yu', '话': 'hua', '说': 'shuo',
    '讲': 'jiang', '谈': 'tan', '论': 'lun', '议': 'yi', '记': 'ji',
    '载': 'zai', '书': 'shu', '写': 'xie', '记': 'ji', '录': 'lu',
    '抄': 'chao', '录': 'lu', '印': 'yin', '刷': 'shua', '刊': 'kan',
    '版': 'ban', '纸': 'zhi', '笔': 'bi', '墨': 'mo', '纸': 'zhi',
    '书': 'shu', '信': 'xin', '函': 'han', '件': 'jian', '公': 'gong',
    '文': 'wen', '档': 'dang', '案': 'an', '卷': 'juan', '册': 'ce',
    '图': 'tu', '画': 'hua', '像': 'xiang', '片': 'pian', '照': 'zhao',
    '片': 'pian', '影': 'ying', '戏': 'xi', '剧': 'ju', '曲': 'qu',
    '艺': 'yi', '术': 'shu', '科': 'ke', '学': 'xue', '术': 'shu',
    '技': 'ji', '术': 'shu', '医': 'yi', '药': 'yao', '病': 'bing',
    '治': 'zhi', '疗': 'liao', '护': 'hu', '理': 'li', '疗': 'liao',
    '养': 'yang', '健': 'jian', '康': 'kang', '疾': 'ji', '病': 'bing',
    '伤': 'shang', '创': 'chuang', '疼': 'teng', '痛': 'tong', '疗': 'liao',
    '治': 'zhi', '救': 'jiu', '护': 'hu', '医': 'yi', '药': 'yao',
    '针': 'zhen', '灸': 'jiu', '按': 'an', '摩': 'mo', '推': 'tui',
    '拿': 'na', '整': 'zheng', '骨': 'gu', '伤': 'shang', '科': 'ke',
    '室': 'shi', '院': 'yuan', '房': 'fang', '屋': 'wu', '屋': 'wu',
    '家': 'jia', '院': 'yuan', '楼': 'lou', '房': 'fang', '室': 'shi',
    '厅': 'ting', '堂': 'tang', '厨': 'chu', '厕': 'ce', '卫': 'wei',
    '浴': 'yu', '卧': 'wo', '客': 'ke', '书': 'shu', '餐': 'can',
    '厨': 'chu', '房': 'fang', '院': 'yuan', '庭': 'ting', '园': 'yuan',
    '宅': 'zhai', '寓': 'yu', '宫': 'gong', '殿': 'dian', '楼': 'lou',
    '阁': 'ge', '亭': 'ting', '台': 'tai', '廊': 'lang', '廊': 'lang',
    '柱': 'zhu', '梁': 'liang', '门': 'men', '窗': 'chuang', '户': 'hu',
    '墙': 'qiang', '壁': 'bi', '地': 'di', '板': 'ban', '砖': 'zhuan',
    '瓦': 'wa', '顶': 'ding', '屋': 'wu', '棚': 'peng', '架': 'jia',
    '柱': 'zhu', '桩': 'zhuang', '柱': 'zhu', '墩': 'dun', '台': 'tai',
    '座': 'zuo', '基': 'ji', '础': 'chu', '根': 'gen', '本': 'ben',
    '源': 'yuan', '泉': 'quan', '头': 'tou', '尾': 'wei', '端': 'duan',
    '中': 'zhong', '间': 'jian', '旁': 'pang', '边': 'bian', '缘': 'yuan',
    '际': 'ji', '缝': 'feng', '隙': 'xi', '裂': 'lie', '纹': 'wen',
    '理': 'li', '痕': 'hen', '迹': 'ji', '踪': 'zong', '影': 'ying',
    '像': 'xiang', '形': 'xing', '状': 'zhuang', '态': 'tai', '姿': 'zi',
    '势': 'shi', '状': 'zhuang', '况': 'kuang', '情': 'qing', '形': 'xing',
    '势': 'shi', '局': 'ju', '面': 'mian', '场': 'chang', '所': 'suo',
    '处': 'chu', '位': 'wei', '置': 'zhi', '点': 'dian', '站': 'zhan',
    '坐': 'zuo', '落': 'luo', '点': 'dian', '地': 'di', '处': 'chu',
    '境': 'jing', '况': 'kuang', '遇': 'yu', '遭': 'zao', '际': 'ji',
    '逢': 'feng', '会': 'hui', '见': 'jian', '遇': 'yu', '别': 'bie',
    '离': 'li', '合': 'he', '聚': 'ju', '散': 'san', '分': 'fen',
    '配': 'pei', '合': 'he', '组': 'zu', '队': 'dui', '班': 'ban',
    '排': 'pai', '连': 'lian', '营': 'ying', '团': 'tuan', '群': 'qun',
    '伙': 'huo', '伴': 'ban', '友': 'you', '朋': 'peng', '亲': 'qin',
    '眷': 'juan', '属': 'shu', '戚': 'qi', '亲': 'qin', '属': 'shu',
    '家庭': 'jiating', '家人': 'jiaren', '父母': 'fumu', '父亲': 'fuqin',
    '母亲': 'muqin', '爸爸': 'baba', '妈妈': 'mama', '爸妈': 'bama',
    '儿子': 'erzi', '女儿': 'nver', '孩子': 'haizi', '子女': 'zinu',
    '兄弟': 'xiongdi', '姐妹': 'jiemei', '兄': 'xiong', '弟': 'di',
    '姐': 'jie', '妹': 'mei', '哥': 'ge', '姐': 'jie', '夫': 'fu',
    '妻': 'qi', '老公': 'laogong', '老婆': 'laopo', '丈夫': 'zhangfu',
    '妻子': 'qizi', '爱人': 'airen', '对象': 'duixiang', '恋人': 'lianren',
    '情侣': 'qinglv', '伴': 'ban', '侣': 'lv', '配偶': 'peiou', '伴侣': 'banlv',
    '爷爷': 'yeye', '奶奶': 'nainai', '外公': 'waigong', '外婆': 'waipo',
    '爷爷': 'yeye', '奶奶': 'nainai', '姥爷': 'laoye', '姥姥': 'laolao',
    '叔叔': 'shushu', '舅舅': 'jiujiu', '姑姑': 'gugu', '姨': 'yi',
    '阿姨': 'ayi', '姑': 'gu', '姨': 'yi', '舅': 'jiu', '侄': 'zhi',
    '甥': 'sheng', '孙子': 'sunzi', '孙女': 'sunnv', '外孙': 'waisun',
    '外孙女': 'waisunnv', '曾孙': 'zengsun', '玄孙': 'xuansun', '祖宗': 'zongzu',
    '祖': 'zu', '宗': 'zong', '祖': 'zu', '先': 'xian', '祖': 'zu',
    '辈': 'bei', '代': 'dai', '世': 'shi', '纪': 'ji', '历': 'li',
    '史': 'shi', '过去': 'guoqu', '现在': 'xianzai', '未来': 'weilai',
    '今天': 'jintian', '明天': 'mingtian', '昨天': 'zuotian', '每天': 'meitian',
    '今年': 'jinnian', '明年': 'mingnian', '去年': 'quqin', '每年': 'meinian',
    '时候': 'shihou', '时间': 'shijian', '年代': 'niandai', '时期': 'shiqi',
    '阶段': 'jienduan', '过程': 'guocheng', '结果': 'jieguo', '答案': 'daan',
    '问题': 'wenti', '题目': 'timu', '问题': 'wenti', '方法': 'fangfa',
    '方式': 'fangshi', '办法': 'banfa', '手段': 'shouduan', '技术': 'jishu',
    '技巧': 'jiqiao', '技能': 'jineng', '能力': 'nengli', '才干': 'cagan',
    '才': 'cai', '能': 'neng', '力': 'li', '能量': 'nengliang', '力量': 'liliang',
    '权': 'quan', '力': 'li', '权利': 'quanli', '权力': 'quuanli', '权限': 'quanxian',
    '权柄': 'quanbing', '权势': 'quanshi', '权威': 'quuanwei', '权宜': 'quanyi',
    '权且': 'quuanqie', '权衡': 'quanheng', '权益': 'quanyi', '权舆': 'quanyu',
    '香': 'xiang', '港': 'gang', '澳': 'ao', '台': 'tai', '湾': 'wan',
    '京': 'jing', '津': 'jin', '沪': 'hu', '渝': 'yu', '冀': 'ji',
    '豫': 'yu', '云': 'yun', '滇': 'dian', '湘': 'xiang', '皖': 'wan',
    '皖': 'wan', '鲁': 'lu', '浙': 'zhe', '闽': 'min', '粤': 'yue',
    '赣': 'gan', '湘': 'xiang', '鄂': 'e', '桂': 'gui', '琼': 'qiong',
    '晋': 'jin', '蒙': 'meng', '陕': 'shan', '甘': 'gan', '青': 'qing',
    '宁': 'ning', '新': 'xin', '藏': 'zang', '川': 'chuan', '黔': 'qian',
    '黔': 'qian', '贵': 'gui', '滇': 'dian', '辽': 'liao', '吉': 'ji',
    '黑': 'hei', '苏': 'su', '首': 'shou', '都': 'dou', '市': 'shi',
    '区': 'qu', '县': 'xian', '镇': 'zhen', '村': 'cun', '乡': 'xiang',
    '街': 'jie', '道': 'dao', '路': 'lu', '巷': 'xiang', '弄': 'long',
    '号': 'hao', '栋': 'dong', '单元': 'danyuan', '楼层': 'louceng',
    '室': 'shi', '门': 'men', '窗': 'chuang', '地址': 'dizhi', '位置': 'weizhi',
    '方向': 'fangxiang', '路线': 'luxian', '距离': 'juli', '长度': 'changdu',
    '宽度': 'kuandu', '高度': 'gaodu', '深度': 'shendu', '厚度': 'houdu',
    '面积': 'mianji', '体积': 'tiji', '容量': 'rongliang', '重量': 'zhongliang',
    '质量': 'zhiliang', '速度': 'sudu', '时间': 'shijian', '温度': 'wendu',
    '湿度': 'shidu', '密度': 'midu', '粘度': 'niandu', '甜度': 'tiandu',
    '亮度': 'liangdu', '透明度': 'toumingdu', '硬度': 'yingdu', '强度': 'qiangdu',
    '力度': 'lidu', '高度': 'gaodu', '程度': 'chengdu', '进度': 'jindu',
    '难度': 'nandu', '复杂度': 'fuzadu', '满意度': 'manyidu', '准确度': 'zhunquedu',
    '精度': 'jingdu', '纯度': 'chundu', '浓度': 'nongdu', '效度': 'xiaodu',
    '可信度': 'kexindu', '知名度': 'zhimingdu', '美观度': 'meiguandu', '清晰度': 'qingxidu',
    '完整度': 'wanzhengdu', '安全度': 'anquandu', '稳定度': 'wendingdu', '舒服度': 'shufudu',
    '幸福度': 'xingfudu', '快乐度': 'kuailedu', '健康度': 'jiankangdu', '满意': 'manyi',
    '开心': 'kaixin', '快乐': 'kuaile', '高兴': 'gaoxing', '愉快': 'yukai',
    '欢乐': 'huanle', '喜悦': 'xiyue', '欣喜': 'xinxi', '快乐': 'kuaile',
    '幸福': 'xingfu', '美满': 'meiman', '圆满': 'yuanman', '完美': 'wanmei',
    '完整': 'wanzheng', '完善': 'wanshan', '完备': 'wanbei', '齐全': 'qiquan',
    '齐全': 'qiquan', '足够': 'zugou', '充足': 'chongzu', '充实': 'chongshi',
    '饱满': 'baoman', '丰富': 'fengfu', '多彩': 'duocai', '多样': 'duoyang',
    '变化': 'bianhua', '变动': 'biangdong', '改变': 'gaibian', '改革': 'gaige',
    '改进': 'gaijin', '改善': 'gaishan', '提高': 'tigao', '提升': 'tisheng',
    '增强': 'zengqiang', '加强': 'jiaqiang', '增长': 'zengzhang', '增加': 'zengjia',
    '减少': 'jianshao', '降低': 'jiangdi', '节约': 'jieyue', '节省': 'jiesheng',
    '简化': 'jianhua', '精简': 'jingjian', '压缩': 'yasuo', '减少': 'jianshao',
    '删': 'shan', '除': 'chu', '消除': 'xiaochu', '去除': 'quchu', '去掉': 'qudiao',
    '删除': 'shanchu', '撤销': 'chexiao', '取消': 'quxiao', '作废': 'zuofei',
    '废除': 'feichu', '解除': 'jiechu', '停止': 'tingzhi', '暂停': 'zanting',
    '中断': 'zhongduan', '终止': 'zhongzhi', '结束': 'jieshu', '完成': 'wancheng',
    '完毕': 'wanbi', '完善': 'wanshan', '完善': 'wanshan', '改进': 'gaijin',
    '优化': 'youhua', '升级': 'shengji', '提高': 'tigao', '提升': 'tisheng',
    '改善': 'gaishan', '增长': 'zengzhang', '发展': 'fazhan', '进步': 'jinbu',
    '成功': 'chenggong', '胜利': 'shengli', '成就': 'chengjiu', '成果': 'chenngguo',
    '效果': 'xiaoguo', '结果': 'jieguo', '后果': 'houguo', '影响': 'yingxiang',
    '作用': 'zuoyong', '意义': 'yiyi', '价值': 'jiazhi', '意义': 'yiyi',
    '意思': 'yisi', '理由': 'liyou', '原因': 'yuanyin', '结果': 'jieguo',
    '理由': 'liyou', '根据': 'genju', '依据': 'yiju', '原则': 'yuanze',
    '原理': 'yuanli', '规律': 'guilu', '规则': 'guize', '定律': 'dinglv',
    '公理': 'gongli', '真理': 'zhenli', '理论': 'lilun', '学说': 'xueshuo',
    '思想': 'sixiang', '观点': 'guandian', '看法': 'kanfa', '意见': 'yijian',
    '建议': 'jianyi', '主张': 'zhuzhang', '倡议': 'changyi', '提议': 'tiyi',
    '提案': 'tiandan', '议案': 'yian', '提案': 'tiandan', '建议': 'jianyi',
    '号召': 'haozhao', '倡议': 'changyi', '宣言': 'xuanyan', '声明': 'shengming',
    '公告': 'gonggao', '通知': 'tongzhi', '通报': 'tongbao', '报告': 'baogao',
    '汇报': 'huibao', '请示': 'qingshi', '申报': 'shenbao', '申请': 'shenqing',
    '请求': 'qingqiu', '要求': 'yaoqiu', '命令': 'mingling', '指令': 'zhiling',
    '指示': 'zhishi', '指点': 'zhidian', '指导': 'zhidao', '引导': 'yindao',
    '领导': 'lingdao', '管理': 'guanli', '经营': 'jingying', '运营': 'yunying',
    '操作': 'caozuo', '处理': 'chuli', '解决': 'jiejue', '应付': 'yingfu',
    '应对': 'yingdui', '对策': 'duice', '方案': 'fang\'an', '计划': 'jihua',
    '规划': 'guihua', '策划': 'cehua', '设计': 'sheji', '创建': 'chuangjian',
    '建设': 'jianshe', '发展': 'fazhan', '开发': 'kaifa', '开拓': 'kaituo',
    '开放': 'kaifang', '展开': 'zhankai', '开始': 'kaishi', '启动': 'qidong',
    '发起': 'faqi', '创办': 'chuangban', '创立': 'chuangli', '建立': 'jianli',
    '成立': 'chengli', '设立': 'sheli', '组建': 'zujian', '组织': 'zuzhi',
    '编制': 'bianzhi', '构造': 'gouzhao', '结构': 'jieguo', '框架': 'kuangjia',
    '格式': 'geshi', '模式': 'moshi', '方式': 'fangshi', '样式': 'yangshi',
    '风格': 'fengge', '类型': 'leixing', '种类': 'zhonglei', '类别': 'leibie',
    '分类': 'fenlei', '区分': 'qufen', '区别': 'qubie', '分别': 'fenbie',
    '差异': 'chayi', '不同': 'butong', '一样': 'yiyang', '相同': 'xiangtong',
    '相似': 'xiangsi', '类似': 'leisi', '好像': 'haoxiang', '如同': 'hutong',
    '等于': 'dengyu', '相当': 'xiangdang', '等于': 'dengyu', '等价': 'dengjia',
    '等值': 'dengzhi', '等价': 'dengjia', '等效': 'dengxiao', '同样': 'tongyang',
    '共同': 'gongtong', '通用': 'tongyong', '共享': 'gongxiang', '共有': 'gongyou',
    '公有': 'gongyou', '私有': 'siyou', '个人': 'geren', '私人': 'siren',
    '别人': 'bieren', '他人': 'taren', '各自': 'gezi', '自己': 'ziji',
    '本身': 'benshen', '自我': 'ziwo', '本身': 'benshen', '自体': 'ziti',
    '自我': 'ziwo', '本我': 'benwo', '自体': 'ziti', '自身': 'zishen',
    '本身': 'benshen', '自我': 'ziwo', '本身': 'benshen'
};

/**
 * 将汉字转换为拼音
 * @param {string} chinese - 中文字符串
 * @returns {string} 拼音字符串（全小写，空格分隔）
 */
function chineseToPinyin(chinese) {
    if (!chinese) return '';
    if (/^[a-zA-Z\s]+$/.test(chinese)) return chinese.toLowerCase().trim();
    
    let result = '';
    for (const char of chinese) {
        if (CHINESE_TO_PINYIN[char]) {
            result += CHINESE_TO_PINYIN[char];
        } else {
            result += char;
        }
    }
    return result.toLowerCase().trim();
}

// ============================================================================
// 核心工具函数
// ============================================================================

/**
 * 数字缩减函数 - Numerology 核心算法
 * 将任意正整数缩减为个位数(1-9)，或保留主数(11、22、33)
 * 
 * @param {number} n - 输入的正整数
 * @param {boolean} keepMaster - 是否保留主数(11、22、33)，默认true
 * @returns {number} 缩减后的数字 (1-9 或 11、22、33)
 */
function reduceNumber(n, keepMaster = true) {
    if (n < 0) { return 0; }
    if (n < 10) {
        return n;
    }
    
    // 检查是否为主数（仅在keepMaster=true时保留）
    if (keepMaster && (n === 11 || n === 22 || n === 33)) {
        return n;
    }
    
    // 计算各位数字之和
    const digitSum = String(n).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    
    // 递归缩减
    return reduceNumber(digitSum, keepMaster);
}

/**
 * 将多个数字的各位数相加
 * 
 * @param {...number} args - 任意数量的整数
 * @returns {number} 所有数字的各位数之和
 */
function sumDigits(...args) {
    let total = 0;
    for (const num of args) {
        total += String(num).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    }
    return total;
}

/**
 * 解析出生日期字符串
 * 支持格式：YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {Object} {year, month, day}
 */
function parseBirthdate(birthdate) {
    // 移除所有非数字字符
    const digits = birthdate.replace(/\D/g, '');
    
    if (digits.length !== 8) {
        throw new Error(`日期格式错误，应为8位数字，当前: ${birthdate}`);
    }
    
    return {
        year: parseInt(digits.substring(0, 4), 10),
        month: parseInt(digits.substring(4, 6), 10),
        day: parseInt(digits.substring(6, 8), 10)
    };
}

/**
 * 将拼音转换为数字序列
 * 使用毕达哥拉斯体系：A=1, B=2, ..., I=9, J=1, K=2, ...
 * 
 * @param {string} pinyin - 拼音字符串（不带声调）
 * @returns {number[]} 数字列表
 */
function pinyinToNumbers(pinyin) {
    pinyin = pinyin.toUpperCase();
    return pinyin.split('').map(c => PITHAGOREAN_CHART[c] || 0);
}

/**
 * 判断字符是否为准音字母（A, E, I, O, U，不包含Y）
 * 
 * @param {string} c - 单个英文字母
 * @returns {boolean} 是否为准音
 */
function isVowel(c) {
    return 'AEIOU'.includes(c.toUpperCase());
}

/**
 * 判断字符是否为辅音字母
 * 
 * @param {string} c - 单个英文字母
 * @returns {boolean} 是否为辅音
 */
function isConsonant(c) {
    const upper = c.toUpperCase();
    return upper >= 'A' && upper <= 'Z' && !'AEIOU'.includes(upper);
}

// ============================================================================
// 出生日期相关计算
// ============================================================================

/**
 * 计算生命灵数（Life Path Number）
 * 生命灵数是Numerology中最核心的数字，代表人生使命与道路
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number} 生命灵数 (1-9 或 11、22、33)
 */
function lifePathNumber(birthdate) {
    const digits = birthdate.replace(/\D/g, '');
    const total = digits.split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    return reduceNumber(total);
}

/**
 * 计算命运数（Destiny Number）
 * 命运数代表先天潜能与人生课题
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number} 命运数
 */
function destinyNumber(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    const total = sumDigits(year, month, day);
    return reduceNumber(total);
}

/**
 * 计算生日数（Birthday Number）
 * 生日数代表外在表现与天赋
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number} 生日数
 */
function birthdayNumber(birthdate) {
    const { day } = parseBirthdate(birthdate);
    return day;
}

/**
 * 计算生日数字根（用于某些进阶计算）
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number} 生日数字根
 */
function birthdayReduced(birthdate) {
    const { day } = parseBirthdate(birthdate);
    return reduceNumber(day);
}

/**
 * 计算挑战数（Challenge Numbers）
 * 挑战数代表人生中的成长障碍
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number[]} 四个挑战数
 */
function challengeNumber(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    const yearReduced = reduceNumber(year, false);
    const monthReduced = reduceNumber(month, false);
    const dayReduced = reduceNumber(day, false);
    
    return [
        Math.abs(yearReduced - monthReduced),
        Math.abs(yearReduced - dayReduced),
        Math.abs(monthReduced - dayReduced),
        Math.abs(reduceNumber(year + month, false) - reduceNumber(day, false))
    ];
}

/**
 * 计算高峰数（Peak Numbers）
 * 高峰数代表人生四个阶段的积极能量
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {number[]} 四个高峰数
 */
function peakNumbers(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    // 第一高峰：月份 + 日期 的数字根
    const peak1 = reduceNumber(sumDigits(month, day), false);
    
    // 第二高峰：月份 + 年份后两位 的数字根
    const yearLast2 = year % 100;
    const peak2 = reduceNumber(sumDigits(month, yearLast2), false);
    
    // 第三高峰：年份总数 + 日期 的数字根
    const yearTotal = sumDigits(year);
    const peak3 = reduceNumber(sumDigits(yearTotal, day), false);
    
    // 永生高峰：所有数字之和
    const peak4 = reduceNumber(sumDigits(year, month, day), false);
    
    return [peak1, peak2, peak3, peak4];
}

/**
 * 计算个人年份数（Personal Year Number）
 * 个人年份数以9年为一个循环周期
 * 
 * @param {string} birthdate - 出生日期字符串
 * @param {number} targetYear - 目标年份，默认当前年份
 * @returns {number} 个人年份数 (1-9)
 */
function personalYearNumber(birthdate, targetYear = null) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    if (targetYear === null) {
        targetYear = new Date().getFullYear();
    }
    
    const total = sumDigits(targetYear, month, day);
    
    return reduceNumber(total, false);
}

// ============================================================================
// 姓名数字计算
// ============================================================================

/**
 * 将姓名转换为数字序列
 * 
 * @param {string} name - 英文或拼音姓名
 * @returns {number[]} 数字列表
 */
function nameToNumbers(name) {
    // 如果是中文，先转换为拼音
    if (/[\u4e00-\u9fa5]/.test(name)) {
        name = chineseToPinyin(name);
    }
    // 移除空格和非字母字符，转大写
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    return cleanName.split('').map(c => PITHAGOREAN_CHART[c] || 0).filter(n => n > 0);
}

/**
 * 计算表达数（Expression Number）
 * 表达数代表外在表现与人生目标
 * 
 * @param {string} name - 姓名
 * @returns {number} 表达数
 */
function expressionNumber(name) {
    const nums = nameToNumbers(name).filter(n => n > 0);  // 过滤掉无法识别的字符
    if (nums.length === 0) { return 1; }
    const total = nums.reduce((sum, n) => sum + n, 0);
    return reduceNumber(total);
}

/**
 * 计算灵魂Urge数（Soul Urge Number）
 * 灵魂Urge数代表内心真实渴望
 * 
 * @param {string} name - 姓名
 * @returns {number} 灵魂Urge数
 */
function soulUrgeNumber(name) {
    // 如果是中文，先转换为拼音
    if (/[\u4e00-\u9fa5]/.test(name)) {
        name = chineseToPinyin(name);
    }
    const upper = name.toUpperCase();
    const vowels = upper.split('').filter(c => isVowel(c));
    const total = vowels.reduce((sum, c) => sum + (PITHAGOREAN_CHART[c] || 0), 0);
    return reduceNumber(total);
}

/**
 * 计算人格数（Personality Number）
 * 人格数代表外在给别人的印象
 * 
 * @param {string} name - 姓名
 * @returns {number} 人格数
 */
function personalityNumber(name) {
    // 如果是中文，先转换为拼音
    if (/[\u4e00-\u9fa5]/.test(name)) {
        name = chineseToPinyin(name);
    }
    const upper = name.toUpperCase();
    const consonants = upper.split('').filter(c => isConsonant(c));
    const total = consonants.reduce((sum, c) => sum + (PITHAGOREAN_CHART[c] || 0), 0);
    return reduceNumber(total);
}

/**
 * 计算成熟数（Maturity Number）
 * 成熟数代表人生后半段的能量
 * 
 * @param {string} birthdate - 出生日期
 * @param {string} name - 姓名
 * @returns {number} 成熟数
 */
function maturityNumber(birthdate, name) {
    const lifePath = lifePathNumber(birthdate);
    const expression = expressionNumber(name);
    return reduceNumber(lifePath + expression);
}

// ============================================================================
// 九宫格矩阵分析
// ============================================================================

/**
 * 分析九宫格矩阵
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {Object} 九宫格分析结果
 */
function nineGrid(birthdate) {
    const digits = birthdate.replace(/\D/g, '');
    
    // 统计1-9每个数字出现次数
    const counts = {};
    for (let i = 1; i <= 9; i++) {
        counts[i] = 0;
    }
    
    for (const d of digits) {
        const num = parseInt(d, 10);
        if (num >= 1 && num <= 9) {
            counts[num]++;
        }
    }
    
    // 找出缺失数字
    const missing = [];
    for (let i = 1; i <= 9; i++) {
        if (counts[i] === 0) {
            missing.push(i);
        }
    }
    
    // 分析连线（天赋通道）
    const template = NINE_GRID_TEMPLATE;
    const lines = {
        '横向': [],
        '纵向': [],
        '对角线': []
    };
    
    // 横向
    for (let r = 0; r < 3; r++) {
        const rowNums = template[r];
        if (rowNums.every(n => counts[n] > 0)) {
            lines['横向'].push(rowNums);
        }
    }
    
    // 纵向
    for (let c = 0; c < 3; c++) {
        const colNums = [template[0][c], template[1][c], template[2][c]];
        if (colNums.every(n => counts[n] > 0)) {
            lines['纵向'].push(colNums);
        }
    }
    
    // 对角线
    const diag1 = [template[0][0], template[1][1], template[2][2]];
    const diag2 = [template[0][2], template[1][1], template[2][0]];
    if (diag1.every(n => counts[n] > 0)) lines['对角线'].push(diag1);
    if (diag2.every(n => counts[n] > 0)) lines['对角线'].push(diag2);
    
    return {
        counts: counts,
        missing: missing,
        lines: lines,
        template: template
    };
}

// ============================================================================
// 金字塔矩阵（和谐方舟风格）
// ============================================================================

/**
 * 计算金字塔矩阵
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {Object} 金字塔矩阵数据
 */
function pyramidMatrix(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    // 四个基础数字
    const a = year % 100;  // 79
    const b = Math.floor(year / 100);  // 19
    const c = month;        // 01 -> 1
    const d = day;          // 03 -> 3
    
    // 第一行：基本运算
    const row1 = [
        reduceNumber(a + b + c),
        reduceNumber(a + b + d),
        reduceNumber(a + c + d),
        reduceNumber(b + c + d),
    ];
    
    // 第二行：差值运算
    const row2 = [
        reduceNumber(Math.abs(a - b)),
        reduceNumber(Math.abs(a - c)),
        reduceNumber(Math.abs(a - d)),
        reduceNumber(Math.abs(b - c)),
    ];
    
    // 第三行：乘积和组合
    const row3 = [
        reduceNumber((a % 10) + (b % 10)),
        reduceNumber(Math.floor(a / 10) + Math.floor(b / 10)),
        reduceNumber(c + d),
        reduceNumber(a + b),
    ];
    
    return {
        birthdate: birthdate,
        year: year,
        month: month,
        day: day,
        bottom: [
            String(day).padStart(2, '0'),
            String(month).padStart(2, '0'),
            String(b),
            String(a)
        ],
        thirdLayer: row3,
        secondLayer: row2,
        firstLayer: row1,
        lifePath: lifePathNumber(birthdate)
    };
}

// ============================================================================
// 联合数字
// ============================================================================

/**
 * 计算联合数字（Unified Numbers）
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {string[]} 12组联合数字
 */
function unifiedNumbers(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    const a = year % 100;
    const b = Math.floor(year / 100);
    
    const calc = (x, y, z) => reduceNumber(x + y + z);
    
    return [
        calc(a, b, month),
        calc(b, month, day),
        calc(month, day, a),
        calc(day, a, b),
        calc(a, month, day),
        calc(b, a, month),
        calc(month, a, day),
        calc(day, month, a),
        calc(a + b, month, day),
        calc(b + month, day, a),
        calc(month + day, a, b),
        calc(day + a, b, month)
    ].map(n => String(n).padStart(2, '0'));
}

// ============================================================================
// 内心/外心/潜意识/晚年数字
// ============================================================================

/**
 * 计算内心数字、外心数字、潜意识数字和晚年数字
 * 
 * @param {string} birthdate - 出生日期字符串
 * @returns {Object} 包含 inner, outer, subconscious, late_life
 */
function innerOuterNumber(birthdate) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    // 内心数字 = 月份还原
    const inner = reduceNumber(month, false);
    
    // 外心数字 = 年份还原
    const outer = reduceNumber(year, false);
    
    // 潜意识数字 = 生命灵数计算过程的中间值
    const yearSum = String(year).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    const monthDaySum = String(month.toString().padStart(2, '0') + day.toString().padStart(2, '0'))
        .split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    const total = yearSum + monthDaySum;
    const subconscious = total > 9 ? reduceNumber(total, false) : total;
    
    // 晚年数字 = 年份 + 月份 + 日期 的综合
    const lateLife = sumDigits(year, month, day);
    const lateLifeReduced = reduceNumber(lateLife, false);
    
    return {
        inner: inner,
        outer: outer,
        subconscious: subconscious,
        lateLife: lateLifeReduced,
        lateLifeCombined: `${outer}${inner}${subconscious}`
    };
}

// ============================================================================
// 综合报告生成
// ============================================================================

/**
 * 生成完整的生命数字分析结果
 * 
 * @param {string} birthdate - 出生日期字符串
 * @param {string} name - 姓名（支持中文或拼音）
 * @returns {Object} 完整的分析结果对象
 */
function generateFullReport(birthdate, name = null) {
    const { year, month, day } = parseBirthdate(birthdate);
    
    // 核心数字
    const lifePath = lifePathNumber(birthdate);
    const destiny = destinyNumber(birthdate);
    const birthday = birthdayNumber(birthdate);
    const birthdayRed = birthdayReduced(birthdate);
    
    // 挑战数
    const challenges = challengeNumber(birthdate);
    
    // 高峰数
    const peaks = peakNumbers(birthdate);
    
    // 九宫格
    const nineGridResult = nineGrid(birthdate);
    
    // 金字塔
    const pyramid = pyramidMatrix(birthdate);
    
    // 联合数字
    const unified = unifiedNumbers(birthdate);
    
    // 内外数字
    const innerOuter = innerOuterNumber(birthdate);
    
    // 当前个人年份
    const currentYear = new Date().getFullYear();
    const personalYear = personalYearNumber(birthdate, currentYear);
    
    // 姓名数字（如果有姓名）
    let nameNumbers = null;
    if (name) {
        nameNumbers = {
            expression: expressionNumber(name),
            soulUrge: soulUrgeNumber(name),
            personality: personalityNumber(name),
            maturity: maturityNumber(birthdate, name)
        };
    }
    
    // 获取生命灵数解读
    const interpretation = LIFE_PATH_INTERPRETATIONS[lifePath] || { 
        title: "神秘者", 
        desc: "你的生命数字蕴含着独特的力量。" 
    };
    
    return {
        // 基本信息
        birthdate: birthdate,
        formattedDate: `${year}年${month}月${day}日`,
        name: name,
        
        // 核心数字
        lifePath: lifePath,
        destiny: destiny,
        birthday: birthday,
        birthdayReduced: birthdayRed,
        
        // 挑战数
        challenges: {
            first: challenges[0],
            second: challenges[1],
            third: challenges[2],
            lifetime: challenges[3]
        },
        
        // 高峰数
        peaks: {
            first: peaks[0],
            second: peaks[1],
            third: peaks[2],
            eternal: peaks[3]
        },
        
        // 九宫格
        nineGrid: nineGridResult,
        
        // 金字塔
        pyramid: pyramid,
        
        // 联合数字
        unifiedNumbers: unified,
        
        // 内外数字
        innerOuter: innerOuter,
        
        // 姓名数字
        nameNumbers: nameNumbers,
        
        // 个人年份
        personalYear: personalYear,
        currentYear: currentYear,
        
        // 解读
        interpretation: interpretation
    };
}

// ============================================================================
// 导出（兼容 ES Module 和 CommonJS）
// ============================================================================

// 如果是浏览器环境，挂载到全局
if (typeof window !== 'undefined') {
    window.Numerology = {
        // 核心函数
        reduceNumber,
        sumDigits,
        parseBirthdate,
        
        // 出生日期相关
        lifePathNumber,
        destinyNumber,
        birthdayNumber,
        birthdayReduced,
        challengeNumber,
        peakNumbers,
        personalYearNumber,
        
        // 姓名相关
        nameToNumbers,
        pinyinToNumbers,
        chineseToPinyin,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        maturityNumber,
        
        // 矩阵相关
        nineGrid,
        pyramidMatrix,
        unifiedNumbers,
        innerOuterNumber,
        
        // 综合报告
        generateFullReport,
        
        // 常量
        LIFE_PATH_INTERPRETATIONS,
        PITHAGOREAN_CHART,
        NINE_GRID_TEMPLATE,
        CHINESE_TO_PINYIN
    };
}

// 如果是 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        reduceNumber,
        sumDigits,
        parseBirthdate,
        lifePathNumber,
        destinyNumber,
        birthdayNumber,
        birthdayReduced,
        challengeNumber,
        peakNumbers,
        personalYearNumber,
        nameToNumbers,
        pinyinToNumbers,
        chineseToPinyin,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        maturityNumber,
        nineGrid,
        pyramidMatrix,
        unifiedNumbers,
        innerOuterNumber,
        generateFullReport,
        LIFE_PATH_INTERPRETATIONS,
        PITHAGOREAN_CHART,
        NINE_GRID_TEMPLATE,
        CHINESE_TO_PINYIN
    };
}


// ============================================================================
// HTML 页面桥接函数（calculateAll）
// ============================================================================

/**
 * 桥接函数：将 generateFullReport 的完整数据映射为 HTML 页面所需格式
 * @param {string} name - 中文姓名
 * @param {number} year - 出生年
 * @param {number} month - 出生月
 * @param {number} day - 出生日
 * @returns {Object} 页面渲染所需的数据对象
 */
function calculateAll(name, year, month, day) {
    const birthdate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const report = generateFullReport(birthdate, name);

    const interp = LIFE_PATH_INTERPRETATIONS[report.lifePath] || { title: '神秘者', desc: '你的生命数字蕴含独特力量' };

    // 九宫格：使用模板布局，count=0 显示为空
    const t = NINE_GRID_TEMPLATE;
    const grid = {
        northeast:  report.nineGrid.counts[t[0][0]] || 0,
        north:      report.nineGrid.counts[t[0][1]] || 0,
        northwest:  report.nineGrid.counts[t[0][2]] || 0,
        east:       report.nineGrid.counts[t[1][0]] || 0,
        center:     report.nineGrid.counts[t[1][1]] || 0,
        west:       report.nineGrid.counts[t[1][2]] || 0,
        southeast:  report.nineGrid.counts[t[2][0]] || 0,
        south:      report.nineGrid.counts[t[2][1]] || 0,
        southwest:  report.nineGrid.counts[t[2][2]] || 0,
    };

    return {
        lifePath:              report.lifePath,
        lifePathName:          interp.title,
        lifePathInterpretation: interp.desc,

        // 九宫格
        grid: grid,

        // 命运数（先天潜能）
        destiny:         report.destiny,
        destinyMeaning:  '代表先天潜能与人生课题',

        // 生日数
        birthDay:        report.birthday,

        // 表达数（姓名数字）
        expression:       report.nameNumbers ? report.nameNumbers.expression : 0,
        expressionMeaning:'代表外在表达与沟通方式',

        // 挑战数
        challenge:        report.challenges.first,
        challengeMeaning: '代表人生中的成长障碍',

        // 高峰数
        pinnacle1:        report.peaks.first,
        pinnacle2:        report.peaks.second,
        pinnacle3:        report.peaks.third,

        // 内在数（灵魂数）
        innerDream:       report.nameNumbers ? report.nameNumbers.soulUrge : 0,
        innerMeaning:      '代表内心深处的渴望'
    };
}
