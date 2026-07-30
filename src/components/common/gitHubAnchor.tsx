import { CodeXml } from "lucide-react";
import React from "react";

function GitHubAnchor() {
  return (
    <a
      className="fixed group bottom-6 right-6 z-50 flex items-center gap-3 pl-3 pr-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold border border-white/10 shadow-2xl transition-all duration-500 ease-in-out hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden animate-bounce-subtle"
      href="https://github.com/Mojahedhu/food_restaurant"
      target="_blank"
    >
      <div className="absolute inset-0 bg-linear-to-br from-orange-500 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 w-[200%] h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center justify-center p-2 bg-orange-600 rounded-xl group-hover:bg-white/20 transition-all duration-300 shadow-inner">
          <CodeXml className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-sm tracking-tight font-bold">
          Get Source Code
        </span>
      </div>
    </a>
  );
}

export default GitHubAnchor;
