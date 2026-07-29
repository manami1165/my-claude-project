# CLAUDE.md

このファイルは、このプロジェクトで作業する際にClaude Codeが従うべきルールをまとめた指示書です。

## プロジェクト概要

このプロジェクトは Node.js + Express の TODO アプリです。バックエンドAPIとHTML/CSS/JSフロントエンドで構成されています。

## ディレクトリ構成

- **バックエンド**: `src/` 配下
  - `src/index.js`: Expressサーバーのエントリポイント
  - `src/routes/todos.js`: TODOのAPIルート
  - `src/db/pool.js`: データベース接続プール
- **フロントエンド**: `public/` 配下
  - `public/index.html`: 画面のエントリポイント
  - fetch API でバックエンドと通信する

## コーディング規約

- エラーハンドリングは必ず実装する
- コメントは日本語で書く

## テスト

- テストには Jest を使う
- フロントエンドのテストは jsdom 環境で実行する
