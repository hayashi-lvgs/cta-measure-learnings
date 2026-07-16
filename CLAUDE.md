# CLAUDE.md

このリポジトリで作業する Claude Code 向けの入口。**作業開始前に必ずこのファイルと下記「必読ドキュメント」を読むこと。**

## このプロジェクトは何か

**CTA施策学習サイト** — CTA（キャリアチケット就職）記事ページのCRO施策の勝ち/引き分け/負けを蓄積する社内向け静的サイト。

**目的**: 勝ち施策・負け施策から「なぜ勝ったか/負けたか」の要因を言語化して蓄積し、**次のデザイン提案に納得感（根拠・説得力）を持たせる**ための"根拠ライブラリ"。単なる結果アーカイブではない。

3原則（崩さない）:
1. **事実(📋実線)とAI推論・仮説(🤔破線+⚠️)を明示的に区別する**
2. 各施策に**デザイン観点の活かし**(✅有効/⚠️注意/❌NG)をCTユーザー前提（スマホネイティブ・初めての就活生・情報過多で意思決定困難）で付ける
3. **横断で学びをパターン化**する

判定は案C（チームの採用判断）: 本番採用=勝ち / デバイス別採用・継続中=引き分け / 未採用=負け。

## 必読ドキュメント

- **[docs/このサイトの目的と引き継ぎ書.md](docs/このサイトの目的と引き継ぎ書.md)** — 目的・仕様・運用フロー・既知の注意点・今後タスク（まずこれ）
- **[docs/並行作業ルール.md](docs/並行作業ルール.md)** — 別Claudeとの衝突防止（Figma書き込み禁止・レーン分け）。**作業前必読**

## ファイル構成

```
CLAUDE.md              # 本ファイル（Claude Code入口）
README.md              # 人間向けの入口（使い方・収録施策）
index.html             # 骨格のみ（head: cssリンク / body: マークアップ + 末尾 script×2）
assets/
  css/style.css        # 表示スタイル（melta UI 参考。見た目は変えない）
  js/app.js            # 表示ロジック（METRIC_LABELS 含む・末尾で init() 実行）
data/
  measures.js          # ★施策データの正: MEASURES / INSIGHTS / SCREENSHOTS
images/
  CTA-{番号}-before-after.png   # 前後比較スクショ（外部ファイル参照）
measures/
  CTA-{番号}.md        # 施策別サマリMD（人間可読の正・サイトは参照しない）
docs/                  # 目的・引き継ぎ・運用ルール・リサーチ
```

## 作業時の重要ルール

- **正のデータは `data/measures.js`**。1施策の追加は原則ここに `MEASURES` オブジェクトを1つ足すだけで完結（スクショがあれば `SCREENSHOTS` に1行 + `images/` に画像）。
- **`fetch()`／`type="module"` は使わない**。file:// のCORS制限で動かない。データは必ず `<script src="data/measures.js">`（classic script）で読む。
- **事実とAI推論を混ぜない**。PDFに書かれていない解釈を `factuals` に入れない（目的の実装＝提案の根拠として「どこまでが事実か」を明確にするため）。
- 新しい指標キーを使ったら `assets/js/app.js` の `METRIC_LABELS` にも日本語ラベルを追記。
- **見た目（CSS）は勝手に変えない**。melta UI（https://melta.tsubotax.com/ ）参考のレイアウトを維持。
- 作業開始時に `git log` とローカル差分を確認。リモートが進んでいたら先に `pull`（複数セッション同時編集に注意）。

## リポジトリ

- private: https://github.com/hayashi-lvgs/cta-measure-learnings
- GitHubアカウント: `hayashi-lvgs`（gh CLIでブラウザ認証済み）
- コミットのuser設定: `Haruya Hayashi <haruya.hayashi@leverages.jp>`
- 反映フロー: 動作確認（`index.html` をブラウザで開く）→ README更新 → `git add -A && git commit && git push`
</content>
