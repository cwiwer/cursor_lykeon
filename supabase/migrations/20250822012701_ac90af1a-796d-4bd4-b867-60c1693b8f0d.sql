-- Extensão UUID se não existir
create extension if not exists "uuid-ossp";

-- Atualize a tabela profiles se não tem language
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='language') THEN
        ALTER TABLE profiles ADD COLUMN language text default 'pt';
    END IF;
END $$;

-- Criar tabelas de gamificação que não existem ainda
CREATE TABLE IF NOT EXISTS gam_levels (
  level integer PRIMARY KEY,
  required_xp integer NOT NULL
);

-- Inserir dados nas tabelas que já existem (se não existirem ainda)
INSERT INTO gam_missions(period, name, description, reward_xp, reward_lumis) VALUES
  ('daily', 'Concluir 1 aula hoje', 'Assista a uma aula completa.', 50, 5),
  ('daily', 'Acerte 80% no quiz', 'Desempenho do dia.', 80, 8),
  ('weekly', '5 dias consecutivos de estudo', 'Mantenha a sequência.', 150, 20)
ON CONFLICT DO NOTHING;

INSERT INTO gam_badges(name, category, rarity) VALUES
  ('Mestre da Tabuada', 'Conhecimento', 'rare'),
  ('Assiduidade Perfeita', 'Esforço', 'legendary'),
  ('Cientista Curioso', 'Explorador', 'common')
ON CONFLICT DO NOTHING;

-- Inserir níveis básicos
INSERT INTO gam_levels(level, required_xp) VALUES
  (1, 0), (2, 100), (3, 300), (4, 600), (5, 1000),
  (6, 1500), (7, 2100), (8, 2800), (9, 3600), (10, 4500)
ON CONFLICT DO NOTHING;