export interface Hanzi {
  character: string;  // 汉字
  pinyin: string;   // 拼音
  words: string[];  // 组词
  sentence: string; // 造句
  image: string;  // 图片
}
export interface HanziGroup {
  id: string;
  group: string; // 分组名称
  hanzi: Hanzi[];
  desc?: string; // 分组描述
  icon?: string; // 分组图标
  character?: string; // 分组字形
  color?: string; // 分组颜色, 用于卡片背景
}

// 返回上一页的配置
export interface BackConf {
  name: string;
  path: string;
}
