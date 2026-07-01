// 预设主题配色方案
export const themes = {
  warm: {
    label: '暖桃',
    vars: {
      '--accent': '#8CC0EB', '--accent-hover': '#6BA8D6',
      '--accent-text': '#5a9bc7',
      '--bg-main': 'rgba(255,249,210,0.72)',     // #FFF9D2
      '--bg-sidebar': 'rgba(255,235,204,0.82)',   // #FFEBCC
      '--bg-card': 'rgba(191,221,240,0.65)',      // #BFDDF0
      '--bg-card-hover': 'rgba(191,221,240,0.88)',
      '--bg-input': 'rgba(191,221,240,0.52)',
      '--bg-sidebar-solid': 'rgba(255,235,204,0.95)',
      '--bg-code': 'rgba(191,221,240,0.45)',
      '--bg-user-msg': 'rgba(140,192,235,0.22)',  // #8CC0EB
      '--bg-modal': 'rgba(255,249,210,0.96)',
      '--bg-overlay': 'rgba(0,0,0,0.18)',
      '--text-primary': '#2c3e50', '--text-secondary': '#506070', '--text-tertiary': '#708090',
      '--border-color': 'rgba(140,192,235,0.25)', '--border-light': 'rgba(140,192,235,0.12)',
      '--shadow-sm': '0 1px 3px rgba(140,192,235,0.12)',
      '--shadow-md': '0 2px 10px rgba(140,192,235,0.16)',
      '--shadow-lg': '0 4px 20px rgba(140,192,235,0.20)',
    },
  },
  ocean: {
    label: '深海',
    vars: {
      '--accent': '#5088C8', '--accent-hover': '#3D70B0',
      '--accent-text': '#3D70B0',
      '--bg-main': 'rgba(232,240,254,0.72)',
      '--bg-sidebar': 'rgba(220,232,250,0.82)',
      '--bg-card': 'rgba(208,228,248,0.65)',
      '--bg-card-hover': 'rgba(208,228,248,0.88)',
      '--bg-input': 'rgba(208,228,248,0.52)',
      '--bg-sidebar-solid': 'rgba(220,232,250,0.95)',
      '--bg-code': 'rgba(208,228,248,0.45)',
      '--bg-user-msg': 'rgba(80,136,200,0.18)',
      '--bg-modal': 'rgba(232,240,254,0.96)',
      '--bg-overlay': 'rgba(0,0,0,0.18)',
      '--text-primary': '#1e3048', '--text-secondary': '#406080', '--text-tertiary': '#608098',
      '--border-color': 'rgba(80,136,200,0.22)', '--border-light': 'rgba(80,136,200,0.10)',
      '--shadow-sm': '0 1px 3px rgba(80,136,200,0.10)',
      '--shadow-md': '0 2px 10px rgba(80,136,200,0.14)',
      '--shadow-lg': '0 4px 20px rgba(80,136,200,0.18)',
    },
  },
  lavender: {
    label: '藕紫',
    vars: {
      '--accent': '#9878C8', '--accent-hover': '#7D5DB8',
      '--accent-text': '#7D5DB8',
      '--bg-main': 'rgba(245,240,255,0.72)',
      '--bg-sidebar': 'rgba(240,232,250,0.82)',
      '--bg-card': 'rgba(232,220,248,0.65)',
      '--bg-card-hover': 'rgba(232,220,248,0.88)',
      '--bg-input': 'rgba(232,220,248,0.52)',
      '--bg-sidebar-solid': 'rgba(240,232,250,0.95)',
      '--bg-code': 'rgba(232,220,248,0.45)',
      '--bg-user-msg': 'rgba(152,120,200,0.16)',
      '--bg-modal': 'rgba(245,240,255,0.96)',
      '--bg-overlay': 'rgba(0,0,0,0.18)',
      '--text-primary': '#2e2048', '--text-secondary': '#504868', '--text-tertiary': '#706080',
      '--border-color': 'rgba(152,120,200,0.22)', '--border-light': 'rgba(152,120,200,0.10)',
      '--shadow-sm': '0 1px 3px rgba(152,120,200,0.10)',
      '--shadow-md': '0 2px 10px rgba(152,120,200,0.14)',
      '--shadow-lg': '0 4px 20px rgba(152,120,200,0.18)',
    },
  },
  mint: {
    label: '薄荷',
    vars: {
      '--accent': '#58B888', '--accent-hover': '#3D9E6D',
      '--accent-text': '#3D9E6D',
      '--bg-main': 'rgba(240,255,245,0.72)',
      '--bg-sidebar': 'rgba(228,248,236,0.82)',
      '--bg-card': 'rgba(210,240,224,0.65)',
      '--bg-card-hover': 'rgba(210,240,224,0.88)',
      '--bg-input': 'rgba(210,240,224,0.52)',
      '--bg-sidebar-solid': 'rgba(228,248,236,0.95)',
      '--bg-code': 'rgba(210,240,224,0.45)',
      '--bg-user-msg': 'rgba(88,184,136,0.16)',
      '--bg-modal': 'rgba(240,255,245,0.96)',
      '--bg-overlay': 'rgba(0,0,0,0.18)',
      '--text-primary': '#1e3828', '--text-secondary': '#406048', '--text-tertiary': '#608068',
      '--border-color': 'rgba(88,184,136,0.22)', '--border-light': 'rgba(88,184,136,0.10)',
      '--shadow-sm': '0 1px 3px rgba(88,184,136,0.10)',
      '--shadow-md': '0 2px 10px rgba(88,184,136,0.14)',
      '--shadow-lg': '0 4px 20px rgba(88,184,136,0.18)',
    },
  },
  dusk: {
    label: '暮色',
    vars: {
      '--accent': '#6088C0', '--accent-hover': '#5078B0',
      '--accent-text': '#80A8D8',
      '--bg-main': 'rgba(30,34,48,0.88)',
      '--bg-sidebar': 'rgba(37,40,56,0.92)',
      '--bg-card': 'rgba(42,48,64,0.75)',
      '--bg-card-hover': 'rgba(42,48,64,0.92)',
      '--bg-input': 'rgba(42,48,64,0.62)',
      '--bg-sidebar-solid': 'rgba(37,40,56,0.96)',
      '--bg-code': 'rgba(42,48,64,0.55)',
      '--bg-user-msg': 'rgba(96,136,192,0.18)',
      '--bg-modal': 'rgba(30,34,48,0.96)',
      '--bg-overlay': 'rgba(0,0,0,0.40)',
      '--text-primary': '#d0d8e8', '--text-secondary': '#a0a8b8', '--text-tertiary': '#788090',
      '--border-color': 'rgba(96,136,192,0.20)', '--border-light': 'rgba(96,136,192,0.10)',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.20)',
      '--shadow-md': '0 2px 10px rgba(0,0,0,0.25)',
      '--shadow-lg': '0 4px 20px rgba(0,0,0,0.30)',
    },
  },
};

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
