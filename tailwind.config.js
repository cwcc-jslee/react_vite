// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit', // JIT 컴파일러 활성화
  // purge: [
  //   // 사용하지 않는 스타일 제거
  //   './src/**/*.{js,jsx,ts,tsx}',
  // ],
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // React 소스 파일들
  ],
  theme: {
    extend: {
      // 커스텀 테마 설정
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      // 필요한 경우 spacing, fontSize 등 추가
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // 폼 스타일링을 위한 플러그인
  ],
  // variants: {
  //   extend: {
  //     opacity: ['disabled'], // disabled 상태에 대한 스타일 활성화
  //   },
  // },
};
