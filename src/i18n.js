/**
 * Japanese / English UI string translations.
 */

export const TRANSLATIONS = {
  ja: {
    appTitle: '旅行チェックリスト',
    appSubtitle: '旅行の条件を入力して最適な持ち物リストを生成',

    // Form labels
    labelDestination: '行き先',
    labelDays: '日数',
    labelSeason: '季節',
    labelTransport: '交通手段',
    labelTripType: '旅行の目的',

    // Destination options
    domestic: '国内',
    international: '海外',

    // Season options
    spring: '春',
    summer: '夏',
    fall: '秋',
    winter: '冬',

    // Transport options
    plane: '飛行機',
    train: '電車・新幹線',
    car: '車',

    // Trip type options
    business: 'ビジネス',
    leisure: '観光・レジャー',
    adventure: 'アドベンチャー',
    beach: 'ビーチ・リゾート',

    // Actions
    generate: 'リストを作成',
    saveProfile: 'プロフィールを保存',
    loadProfile: 'プロフィールを読み込む',
    deleteProfile: '削除',
    printList: '印刷',
    addCustomItem: 'アイテムを追加',
    addPlaceholder: 'カスタムアイテムを入力...',
    add: '追加',

    // Categories
    documents: '書類・証明書',
    clothing: '衣類',
    toiletries: '洗面・衛生用品',
    electronics: '電子機器',
    health: '健康・医療',
    entertainment: '娯楽',
    misc: 'その他',

    // Priority badges
    critical: '必須',
    high: '重要',
    medium: '推奨',
    low: 'あれば',

    // Days display
    days: '日間',
    day: '日間',

    // Status
    noItems: 'アイテムが見つかりません。旅行情報を入力してリストを生成してください。',
    checkedCount: '件完了',
    totalCount: '件中',
    profileSaved: 'プロフィールを保存しました',
    profileName: 'プロフィール名を入力:',
    profileNamePlaceholder: '例: 夏のハワイ旅行',
    noProfiles: '保存済みプロフィールなし',

    // Print
    printTitle: '旅行持ち物リスト',
    printGenerated: '生成日',
    printProfile: '旅行条件',

    // Theme
    themeToggle: 'テーマ切替',

    // Lang toggle
    langToggle: 'English',
  },

  en: {
    appTitle: 'Travel Checklist',
    appSubtitle: 'Generate a personalized packing list for your trip',

    // Form labels
    labelDestination: 'Destination',
    labelDays: 'Duration',
    labelSeason: 'Season',
    labelTransport: 'Transport',
    labelTripType: 'Trip type',

    // Destination options
    domestic: 'Domestic',
    international: 'International',

    // Season options
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall / Autumn',
    winter: 'Winter',

    // Transport options
    plane: 'Plane',
    train: 'Train',
    car: 'Car',

    // Trip type options
    business: 'Business',
    leisure: 'Leisure',
    adventure: 'Adventure',
    beach: 'Beach / Resort',

    // Actions
    generate: 'Generate list',
    saveProfile: 'Save profile',
    loadProfile: 'Load profile',
    deleteProfile: 'Delete',
    printList: 'Print',
    addCustomItem: 'Add item',
    addPlaceholder: 'Custom item name...',
    add: 'Add',

    // Categories
    documents: 'Documents',
    clothing: 'Clothing',
    toiletries: 'Toiletries',
    electronics: 'Electronics',
    health: 'Health',
    entertainment: 'Entertainment',
    misc: 'Misc',

    // Priority badges
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Optional',

    // Days display
    days: 'days',
    day: 'day',

    // Status
    noItems: 'No items yet. Fill in your trip details and generate a list.',
    checkedCount: 'packed',
    totalCount: 'of',

    profileSaved: 'Profile saved',
    profileName: 'Profile name:',
    profileNamePlaceholder: 'e.g. Summer Hawaii trip',
    noProfiles: 'No saved profiles',

    // Print
    printTitle: 'Travel Packing List',
    printGenerated: 'Generated',
    printProfile: 'Trip details',

    // Theme
    themeToggle: 'Toggle theme',

    // Lang toggle
    langToggle: '日本語',
  },
};

/**
 * Get the translation for a key in the given language.
 * Falls back to the key itself if not found.
 *
 * @param {string} key
 * @param {'ja'|'en'} lang
 * @returns {string}
 */
export function t(key, lang) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) ?? key;
}
