import React, { useState } from 'react';
import { 
  Github, 
  Check, 
  Copy, 
  X, 
  Globe, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  PiggyBank, 
  Smartphone,
  Sparkles
} from 'lucide-react';

interface GithubDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubDeployGuideModal: React.FC<GithubDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const workflowYaml = `# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build production bundle
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                100% Free Hosting on GitHub
              </h2>
              <p className="text-xs text-teal-400 font-medium">
                No subscription, no server costs, accessible anywhere
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-slate-300 text-xs leading-relaxed">
          {/* Cost Reassurance Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex gap-3 items-start">
            <PiggyBank className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-300 text-sm">
                Yes! GitHub Pages is completely free
              </p>
              <p className="text-slate-300 text-[11px] leading-normal">
                Because this app runs 100% in your mobile browser (no external database server needed), GitHub hosts it on their global CDN with <strong>zero hosting costs</strong>. You can use it before, during, and after your holiday without paying anything.
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              3 Simple Steps to Deploy
            </h3>

            {/* Step 1 */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Export or Push to GitHub</span>
              </div>
              <p className="text-slate-400 text-[11px] pl-7">
                In the AI Studio top bar / menu, choose <strong>Export to GitHub</strong> (or export ZIP and upload to a new repository on <a href="https://github.com" target="_blank" rel="noreferrer" className="text-teal-400 underline">GitHub.com</a>).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Enable GitHub Pages in Settings</span>
              </div>
              <p className="text-slate-400 text-[11px] pl-7">
                In your GitHub repository, click <strong>Settings &gt; Pages</strong>. Under <strong>Build and deployment &gt; Source</strong>, select <strong>GitHub Actions</strong>.
              </p>
              <div className="pl-7 pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                  <ShieldCheck className="w-3 h-3" /> Pre-configured: .github/workflows/deploy.yml is already included in your project!
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Open on Phone & Add to Home Screen</span>
              </div>
              <p className="text-slate-400 text-[11px] pl-7">
                Once the Action finishes, your free link will be <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-300 font-mono text-[11px]">https://[your-user].github.io/[repo-name]/</code>. Open that on your mobile phone and select <em>"Add to Home Screen"</em> to use it like an installed app!
              </p>
            </div>
          </div>

          {/* Workflow Code Preview with Copy */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                Workflow file: <code className="text-slate-300">.github/workflows/deploy.yml</code>
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 text-[11px] font-semibold flex items-center gap-1 border border-teal-500/40 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy YAML</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 max-h-36 overflow-y-auto leading-normal">
              {workflowYaml}
            </pre>
          </div>

          {/* Features note */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Configured with <code className="text-teal-300 font-mono">base: './'</code> for zero-config relative subpaths.</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Ready to go
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
