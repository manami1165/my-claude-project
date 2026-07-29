-- todosテーブルを作成する
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
