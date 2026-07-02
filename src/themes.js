// 预设主题配色方案
// 变量说明：
//   --accent*       主色调          --danger*      危险/删除
//   --success       在线状态         --warning      连接中状态
//   --bg-*          背景色           --text-*       文字色
//   --border-*      边框色           --shadow-*     阴影
//   --gradient-*    渐变             --glow-*       发光效果

const palettes = {
  // ═══════════════════════════════════════════
  //  暖桃 — 柔和桃金底色 + 天蓝点缀
  // ═══════════════════════════════════════════
  warm: {
    accent:          '#8CC0EB',
    'accent-hover':  '#6BA8D6',
    'accent-text':   '#5a9bc7',
    'accent-bg':     'rgba(140,192,235,0.15)',
    'accent-ring':   'rgba(140,192,235,0.18)',
    'accent-gradient': 'linear-gradient(135deg, #8CC0EB 0%, #6BA8D6 50%, #7AB8E0 100%)',
    'accent-glow':   '0 0 20px rgba(140,192,235,0.3), 0 0 40px rgba(140,192,235,0.1)',
    danger:          '#e85050',
    'danger-hover':  '#c03939',
    'danger-gradient':'linear-gradient(135deg, #e85050, #c03939)',
    success:         '#52c41a',
    warning:         '#faad14',
    'bg-main':       'rgba(255,249,210,0.72)',
    'bg-sidebar':    'rgba(255,235,204,0.82)',
    'bg-card':       'rgba(191,221,240,0.65)',
    'bg-card-hover': 'rgba(191,221,240,0.88)',
    'bg-input':      'rgba(191,221,240,0.52)',
    'bg-code':       'rgba(191,221,240,0.45)',
    'bg-user-msg':   'linear-gradient(135deg, rgba(140,192,235,0.22) 0%, rgba(140,192,235,0.15) 100%)',
    'bg-modal':      'rgba(255,249,210,0.96)',
    'bg-overlay':    'rgba(0,0,0,0.18)',
    'text-primary':  '#2c3e50',
    'text-secondary':'#506070',
    'text-tertiary': '#708090',
    'border-color':  'rgba(140,192,235,0.25)',
    'border-light':  'rgba(140,192,235,0.12)',
    'shadow-sm':     '0 1px 3px rgba(140,192,235,0.12)',
    'shadow-md':     '0 2px 12px rgba(140,192,235,0.16)',
    'shadow-lg':     '0 8px 32px rgba(140,192,235,0.20)',
    'glass-border':  'rgba(255,255,255,0.35)',
    'glass-shine':   'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // ═══════════════════════════════════════════
  //  深海 — 冷蓝白底色 + 宝蓝点缀
  // ═══════════════════════════════════════════
  ocean: {
    accent:          '#5088C8',
    'accent-hover':  '#3D70B0',
    'accent-text':   '#3D70B0',
    'accent-bg':     'rgba(80,136,200,0.15)',
    'accent-ring':   'rgba(80,136,200,0.18)',
    'accent-gradient': 'linear-gradient(135deg, #5088C8 0%, #3D70B0 50%, #6098D8 100%)',
    'accent-glow':   '0 0 20px rgba(80,136,200,0.3), 0 0 40px rgba(80,136,200,0.1)',
    danger:          '#e05050',
    'danger-hover':  '#c03030',
    'danger-gradient':'linear-gradient(135deg, #e05050, #c03030)',
    success:         '#3da060',
    warning:         '#e89820',
    'bg-main':       'rgba(232,240,254,0.72)',
    'bg-sidebar':    'rgba(220,232,250,0.82)',
    'bg-card':       'rgba(208,228,248,0.65)',
    'bg-card-hover': 'rgba(208,228,248,0.88)',
    'bg-input':      'rgba(208,228,248,0.52)',
    'bg-code':       'rgba(208,228,248,0.45)',
    'bg-user-msg':   'linear-gradient(135deg, rgba(80,136,200,0.18) 0%, rgba(80,136,200,0.10) 100%)',
    'bg-modal':      'rgba(232,240,254,0.96)',
    'bg-overlay':    'rgba(0,0,0,0.18)',
    'text-primary':  '#1e3048',
    'text-secondary':'#406080',
    'text-tertiary': '#608098',
    'border-color':  'rgba(80,136,200,0.22)',
    'border-light':  'rgba(80,136,200,0.10)',
    'shadow-sm':     '0 1px 3px rgba(80,136,200,0.10)',
    'shadow-md':     '0 2px 12px rgba(80,136,200,0.14)',
    'shadow-lg':     '0 8px 32px rgba(80,136,200,0.18)',
    'glass-border':  'rgba(255,255,255,0.35)',
    'glass-shine':   'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // ═══════════════════════════════════════════
  //  藕紫 — 淡紫底色 + 紫色点缀
  // ═══════════════════════════════════════════
  lavender: {
    accent:          '#9878C8',
    'accent-hover':  '#7D5DB8',
    'accent-text':   '#7D5DB8',
    'accent-bg':     'rgba(152,120,200,0.15)',
    'accent-ring':   'rgba(152,120,200,0.18)',
    'accent-gradient': 'linear-gradient(135deg, #9878C8 0%, #7D5DB8 50%, #A888D8 100%)',
    'accent-glow':   '0 0 20px rgba(152,120,200,0.3), 0 0 40px rgba(152,120,200,0.1)',
    danger:          '#d84860',
    'danger-hover':  '#b83048',
    'danger-gradient':'linear-gradient(135deg, #d84860, #b83048)',
    success:         '#3da068',
    warning:         '#e89030',
    'bg-main':       'rgba(245,240,255,0.72)',
    'bg-sidebar':    'rgba(240,232,250,0.82)',
    'bg-card':       'rgba(232,220,248,0.65)',
    'bg-card-hover': 'rgba(232,220,248,0.88)',
    'bg-input':      'rgba(232,220,248,0.52)',
    'bg-code':       'rgba(232,220,248,0.45)',
    'bg-user-msg':   'linear-gradient(135deg, rgba(152,120,200,0.16) 0%, rgba(152,120,200,0.08) 100%)',
    'bg-modal':      'rgba(245,240,255,0.96)',
    'bg-overlay':    'rgba(0,0,0,0.18)',
    'text-primary':  '#2e2048',
    'text-secondary':'#504868',
    'text-tertiary': '#706080',
    'border-color':  'rgba(152,120,200,0.22)',
    'border-light':  'rgba(152,120,200,0.10)',
    'shadow-sm':     '0 1px 3px rgba(152,120,200,0.10)',
    'shadow-md':     '0 2px 12px rgba(152,120,200,0.14)',
    'shadow-lg':     '0 8px 32px rgba(152,120,200,0.18)',
    'glass-border':  'rgba(255,255,255,0.35)',
    'glass-shine':   'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // ═══════════════════════════════════════════
  //  薄荷 — 淡绿底色 + 翠绿点缀
  // ═══════════════════════════════════════════
  mint: {
    accent:          '#58B888',
    'accent-hover':  '#3D9E6D',
    'accent-text':   '#3D9E6D',
    'accent-bg':     'rgba(88,184,136,0.15)',
    'accent-ring':   'rgba(88,184,136,0.18)',
    'accent-gradient': 'linear-gradient(135deg, #58B888 0%, #3D9E6D 50%, #68C898 100%)',
    'accent-glow':   '0 0 20px rgba(88,184,136,0.3), 0 0 40px rgba(88,184,136,0.1)',
    danger:          '#e05050',
    'danger-hover':  '#c03030',
    'danger-gradient':'linear-gradient(135deg, #e05050, #c03030)',
    success:         '#3da060',
    warning:         '#e89820',
    'bg-main':       'rgba(240,255,245,0.72)',
    'bg-sidebar':    'rgba(228,248,236,0.82)',
    'bg-card':       'rgba(210,240,224,0.65)',
    'bg-card-hover': 'rgba(210,240,224,0.88)',
    'bg-input':      'rgba(210,240,224,0.52)',
    'bg-code':       'rgba(210,240,224,0.45)',
    'bg-user-msg':   'linear-gradient(135deg, rgba(88,184,136,0.16) 0%, rgba(88,184,136,0.08) 100%)',
    'bg-modal':      'rgba(240,255,245,0.96)',
    'bg-overlay':    'rgba(0,0,0,0.18)',
    'text-primary':  '#1e3828',
    'text-secondary':'#406048',
    'text-tertiary': '#608068',
    'border-color':  'rgba(88,184,136,0.22)',
    'border-light':  'rgba(88,184,136,0.10)',
    'shadow-sm':     '0 1px 3px rgba(88,184,136,0.10)',
    'shadow-md':     '0 2px 12px rgba(88,184,136,0.14)',
    'shadow-lg':     '0 8px 32px rgba(88,184,136,0.18)',
    'glass-border':  'rgba(255,255,255,0.35)',
    'glass-shine':   'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // ═══════════════════════════════════════════
  //  暮色 — 深色底色 + 蓝灰点缀 (暗色主题)
  // ═══════════════════════════════════════════
  dusk: {
    accent:          '#6888C0',
    'accent-hover':  '#5070A8',
    'accent-text':   '#90B0E0',
    'accent-bg':     'rgba(104,136,192,0.18)',
    'accent-ring':   'rgba(104,136,192,0.20)',
    'accent-gradient': 'linear-gradient(135deg, #6888C0 0%, #5070A8 50%, #7898D0 100%)',
    'accent-glow':   '0 0 24px rgba(104,136,192,0.3), 0 0 48px rgba(104,136,192,0.08)',
    danger:          '#e85050',
    'danger-hover':  '#c83838',
    'danger-gradient':'linear-gradient(135deg, #e85050, #c83838)',
    success:         '#4a9a4a',
    warning:         '#e8a020',
    'bg-main':       'rgba(30,34,48,0.88)',
    'bg-sidebar':    'rgba(37,40,56,0.92)',
    'bg-card':       'rgba(42,48,64,0.75)',
    'bg-card-hover': 'rgba(42,48,64,0.92)',
    'bg-input':      'rgba(42,48,64,0.62)',
    'bg-code':       'rgba(42,48,64,0.55)',
    'bg-user-msg':   'linear-gradient(135deg, rgba(104,136,192,0.20) 0%, rgba(104,136,192,0.10) 100%)',
    'bg-modal':      'rgba(30,34,48,0.96)',
    'bg-overlay':    'rgba(0,0,0,0.40)',
    'text-primary':  '#d0d8e8',
    'text-secondary':'#a0a8b8',
    'text-tertiary': '#788090',
    'border-color':  'rgba(104,136,192,0.20)',
    'border-light':  'rgba(104,136,192,0.10)',
    'shadow-sm':     '0 1px 3px rgba(0,0,0,0.25)',
    'shadow-md':     '0 2px 12px rgba(0,0,0,0.30)',
    'shadow-lg':     '0 8px 32px rgba(0,0,0,0.40)',
    'glass-border':  'rgba(255,255,255,0.08)',
    'glass-shine':   'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.0) 100%)',
  },
};

/* 转换为 CSS 变量名格式：--accent, --accent-hover, ... */
export const themes = {};
for (const [key, vars] of Object.entries(palettes)) {
  themes[key] = {
    label: key === 'warm' ? '暖桃'
          : key === 'ocean' ? '深海'
          : key === 'lavender' ? '藕紫'
          : key === 'mint' ? '薄荷'
          : '暮色',
    vars: Object.fromEntries(
      Object.entries(vars).map(([k, v]) => [`--${k}`, v])
    ),
  };
}

/** 应用主题到 document */
export function applyTheme(themeKey) {
  const theme = themes[themeKey] || themes.warm;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.setAttribute('data-theme', themeKey);
  return theme;
}

/** 获取当前主题名 */
export function currentThemeKey() {
  return document.body.getAttribute('data-theme') || 'warm';
}
