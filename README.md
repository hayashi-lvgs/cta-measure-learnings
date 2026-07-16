# CTA 施策学習サイト

CTA（キャリアチケット就職）記事ページ施策の勝ち/負け/引き分けを、要因分析とデザイン観点の学びつきで蓄積する社内向け学習サイト。

## 使い方

`index.html` をブラウザで開くだけで動作します（CDN不使用・オフライン対応・file:// で動く）。

## 収録施策

| ID | 施策名 | 結果 |
|---|---|---|
| CTA-9270 | 記事詳細 MV(サムネイル)削除＋適職診断EF導入によるCVR改善（ABC比較） | ✅ 勝ち（弱い） |
| CTA-11925 | 記事詳細 SP/PC CTS送客のCTAボタン削除によるCVR改善 | ✅ 勝ち |
| CTA-12483 | 記事TOPバナー 記事中盤への挿入テスト | ➖ 引き分け |
| CTA-12584 | 記事TOPバナー クリエイティブ変更（新型バナー） | ➖ 引き分け |
| CTA-12699 | 記事詳細ページ FV UI変更によるエンゲージメント改善 ph1 | ➖ 引き分け |
| CTA-13031 | 記事TOP SP/PC UI変更（ビジュアル強化・情報再編） | ❌ 負け |
| CTA-13979 | 記事詳細 記事同化型CTA挿入（ABC比較） | ✅ 勝ち |

## 判定基準

**案C（チームの採用判断）**: 寄せ対応・本番採用 = 勝ち、デバイス別採用・継続中 = 引き分け、未採用 = 負け

## ディレクトリ構成

```
├── index.html            # サイト骨格（head の css リンク + body マークアップ + 末尾 script）
├── assets/
│   ├── css/style.css     # 表示スタイル（melta UI 参考）
│   └── js/app.js         # 表示ロジック（カード/モーダル/フィルタ/横断インサイト）
├── data/
│   └── measures.js       # 施策データの正: MEASURES / INSIGHTS / SCREENSHOTS
├── images/               # 前後比較スクショ（外部ファイル参照。base64は廃止）
│   ├── CTA-11925-before-after.png
│   └── CTA-13979-before-after.png
├── measures/             # 施策別サマリ（Markdown・人間可読の正）
│   └── CTA-9270.md … CTA-13979.md
└── docs/
    ├── 引き継ぎ書.md                          # 運用の全体像（まずこれを読む）
    ├── 並行作業ルール.md                       # 他Claudeとの衝突防止ルール
    └── CTA-13979-external-factors-research.md  # 外部要因リサーチ（未反映・承認待ち）
```

## 施策の追加（運用の要点）

- 1施策の追加は原則 `data/measures.js` の編集だけで完結します（`MEASURES` にオブジェクトを1つ追加）。
- スクショを付ける場合は `images/CTA-{番号}-before-after.png` を置き、`data/measures.js` の `SCREENSHOTS` に1行足すだけ。
- **事実（`factuals`）とAI推論（`hypothesisInsights`）の区別を必ず維持**してください。詳細は `docs/引き継ぎ書.md` を参照。
