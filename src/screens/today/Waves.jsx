// The live app's waves, behind Today's title only: a pale wash, a blue wave with its orange and white lines, and the
// dot grid. They fade out before the first card, so every card keeps the flat page behind it. Decorative.
// The two wave layers rise and fall slowly, out of step; reduced motion holds them still. Nothing reaches past the
// screen's edges, so the art never widens the page.
export function Waves() {
  return (
    <div className="waves" aria-hidden="true">
      <svg className="waves-art" viewBox="0 0 800 300" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="waves-fill" x1="0" y1="1" x2="1" y2="0">
            <stop className="waves-stop-a" offset="0" />
            <stop className="waves-stop-b" offset=".56" />
            <stop className="waves-stop-c" offset="1" />
          </linearGradient>
          <linearGradient id="waves-line" x1="0" x2="1">
            <stop offset="0" stopColor="#FF6701" stopOpacity="0" />
            <stop offset=".55" stopColor="#FF7F2F" stopOpacity=".85" />
            <stop offset="1" stopColor="#FFB27A" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <g className="waves-drift waves-drift--back">
          <path className="waves-sweep" d="M613 -10H800V118C770 92 752 66 720 44 676 14 640 2 613 -10Z" />
          <path className="waves-sweep" d="M738 -10H800V70C786 52 772 34 751 20Z" />
          <path className="waves-soft" d="M218 320C384 300 530 250 654 170 708 134 756 106 800 88V320Z" />
        </g>
        <g className="waves-drift waves-drift--front">
          <path className="waves-wave" d="M301 320C446 296 561 246 665 176 712 144 758 120 800 108V320Z" />
          <path className="waves-orange" d="M280 312C430 288 546 236 650 166 700 132 752 110 800 96" />
          <path className="waves-white" d="M313 326C461 302 575 254 679 186 725 156 766 134 800 120" />
        </g>
      </svg>
    </div>
  )
}
