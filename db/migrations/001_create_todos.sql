-- todosテーブルを作成する
CREATE TABLE todos (
  --ID 自動採番
  id BIGSERIAL PRIMARY KEY,
  --タイトル 必須
  title TEXT NOT NULL,
  --完了未完了フラグ デフォルトはfalse
  completed BOOLEAN NOT NULL DEFAULT false,
  --作成日時 自動で現在時刻が入る
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  --更新日時 トリガーで自動で更新
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 更新時にupdated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- UPDATE時にupdated_atを自動更新するトリガー
CREATE TRIGGER todos_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();



