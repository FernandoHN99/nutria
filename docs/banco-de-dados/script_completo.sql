-- Active: 1725033897675@@aws-0-sa-east-1.pooler.supabase.com@6543@postgres
--auth.users
DELETE FROM auth.users;


--usuario
DROP TABLE IF EXISTS usuario CASCADE;
CREATE TABLE usuario (
	id_usuario uuid,
   nome TEXT NOT NULL,
   sobrenome TEXT NOT NULL,
	dt_nascimento DATE NOT NULL,
	pais TEXT NOT NULL,
	sexo TEXT NOT NULL,
	sistema_metrico VARCHAR(10) NOT NULL,
	perfil_alimentar VARCHAR(20) NOT NULL,
	CONSTRAINT check_perfil_sexo CHECK (sexo IN ('H', 'M')),
	CONSTRAINT check_sistema_metrico CHECK (sistema_metrico IN ('METRICO', 'IMPERIAL')), 
	CONSTRAINT check_perfil_alimentar CHECK (perfil_alimentar IN ('ONIVORO', 'VEGETARIANO', 'VEGANO')),
   CONSTRAINT usuario_fk_auth_user FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE,
	PRIMARY KEY (id_usuario)
);

--cartao
DROP TABLE IF EXISTS cartao CASCADE;
CREATE TABLE cartao (
	id_usuario uuid NOT NULL,
	tipo_cartao TEXT,
	dtt_interacao_cartao TIMESTAMP,
	CONSTRAINT check_tipo_cartao CHECK (tipo_cartao IN ('DIETA FLEXIVEL', 'MACROS', 'CALORIAS')), 
	CONSTRAINT cartao_fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	PRIMARY KEY (id_usuario, tipo_cartao)
);

--dia
DROP TABLE IF EXISTS dia CASCADE;
CREATE TABLE dia (
	id_usuario UUID,
	dt_dia DATE,
	peso_dia NUMERIC(4,1),
	foto_dia BYTEA,
	medida_abdomen_dia NUMERIC(4,1),
	CONSTRAINT dia_fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	PRIMARY KEY (id_usuario, dt_dia)
);

--refeicao
DROP TABLE IF EXISTS refeicao CASCADE;
CREATE TABLE refeicao (
	id_usuario uuid,
	numero_refeicao SMALLINT,
	nome_refeicao TEXT NOT NULL,
	ativa BOOLEAN NOT NULL,
	dt_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
	CONSTRAINT refeicao_fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	PRIMARY KEY (id_usuario, numero_refeicao)
);

--alimento
DROP TABLE IF EXISTS alimento CASCADE;
CREATE TABLE alimento (
	id_alimento SERIAL,
   id_usuario UUID,
	nome_alimento TEXT NOT NULL,
	estado_alimento VARCHAR(20) NOT NULL,
	alimento_verificado BOOLEAN NOT NULL,
	grupo_alimentar VARCHAR(25) NOT NULL,
	marca_alimento TEXT,
   dtt_criacao_alimento TIMESTAMP NOT NULL,
   alimento_ativo BOOLEAN NOT NULL
	CONSTRAINT check_grupo_alimentar CHECK (
		grupo_alimentar IN (
			'ONIVORO', 'VEGETARIANO', 'VEGANO')
	), 
	CONSTRAINT check_estado_alimento CHECK (
		estado_alimento IN (
			'CRU', 'COZIDO', 'ASSADO', 'FRITO', 'GRELHADO', 'PADRAO', 'REFOGADO')
	), 
   CONSTRAINT alimento_fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
	PRIMARY KEY (id_alimento)
);
CREATE UNIQUE INDEX alimento_unique_nome_estado_verificado_marca_grupo_alimentar
ON alimento 
(nome_alimento, estado_alimento, grupo_alimentar, marca_alimento)
WHERE alimento_verificado = TRUE;

--codigo_de_barras
DROP TABLE IF EXISTS codigo_de_barras CASCADE;
CREATE TABLE codigo_de_barras (
	codigo TEXT,
	id_alimento INTEGER NOT NULL,
	CONSTRAINT codigo_de_barras_fk_id_alimento FOREIGN KEY (id_alimento) REFERENCES alimento(id_alimento) ON DELETE CASCADE,
	PRIMARY KEY (codigo)
);

--tabela_nutricional
DROP TABLE IF EXISTS tabela_nutricional CASCADE;
CREATE TABLE tabela_nutricional(
   id_tabela_nutricional SERIAL,
	id_alimento INTEGER NOT NULL,
	unidade_medida TEXT NOT NULL,
	porcao_padrao INTEGER NOT NULL,
   kcal NUMERIC(6,1) NOT NULL,
	qtde_proteina NUMERIC(6,1) NOT NULL,
	qtde_carboidrato NUMERIC(6,1) NOT NULL,
	qtde_gordura NUMERIC(6,1) NOT NULL,
	qtde_alcool NUMERIC(6,1),
	qtde_acucar NUMERIC(6,1),
	qtde_fibra NUMERIC(6,1),
	qtde_saturada NUMERIC(6,1),
	qtde_monosaturada NUMERIC(6,1),
	qtde_polisaturada NUMERIC(6,1),
	qtde_trans NUMERIC(6,1),
	qtde_sodio NUMERIC(6,1),
	qtde_calcio NUMERIC(6,1),
	qtde_ferro NUMERIC(6,1),
	qtde_potassio NUMERIC(6,1),
	qtde_vitamina_a NUMERIC(6,1),
	qtde_vitamina_c NUMERIC(6,1),
	qtde_vitamina_d NUMERIC(6,1),
	qtde_vitamina_e NUMERIC(6,1),
	CONSTRAINT tabela_nutricional_check_valores_maiores_que_zero CHECK (
		porcao_padrao > 0 AND qtde_proteina >= 0 AND 
		qtde_carboidrato >= 0 AND qtde_gordura >= 0 AND kcal >= 0 AND
      qtde_alcool >= 0 AND qtde_acucar >= 0 AND qtde_fibra >= 0 AND
      qtde_saturada >= 0 AND qtde_monosaturada >= 0 AND qtde_polisaturada >= 0
      AND qtde_trans >= 0 AND qtde_sodio >= 0 AND qtde_calcio >= 0 AND
      qtde_ferro >= 0 AND qtde_potassio >= 0 AND qtde_vitamina_a >= 0 AND
      qtde_vitamina_c >= 0 AND qtde_vitamina_d >= 0 AND qtde_vitamina_e >= 0
	),
	CONSTRAINT unidade_medida CHECK (
		unidade_medida IN (
			'GRAMA', 'MILILITRO', 'COLHER SOPA', 'COLHER CHA',
			'XICARA PADRAO', 'XICARA CHA', 'XICARA CAFE', 'UNIDADE'
		)
	),
   CONSTRAINT tabela_nutricional_unique_id_alimento_unidade_porcao UNIQUE (id_alimento, unidade_medida, porcao_padrao),
	CONSTRAINT tabela_nutricional_fk_id_alimento FOREIGN KEY (id_alimento) REFERENCES alimento(id_alimento) ON DELETE CASCADE,
	PRIMARY KEY (id_tabela_nutricional)
);

--prato
DROP TABLE IF EXISTS prato CASCADE;
CREATE TABLE prato (
	id_prato SERIAL,
	id_usuario UUID,
	nome_prato TEXT NOT NULL,
	dtt_criacao_prato TIMESTAMP NOT NULL,
	prato_favoritado BOOLEAN NOT NULL,
	CONSTRAINT prato_fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	PRIMARY KEY (id_prato)
);

--alimento_prato
DROP TABLE IF EXISTS alimento_prato CASCADE;
CREATE TABLE alimento_prato ( 
   id_alimento_prato SERIAL,
	id_prato INTEGER NOT NULL,
	id_alimento INTEGER NOT NULL,
	unidade_medida TEXT NOT NULL,
   porcao_padrao INTEGER NOT NULL,
	qtde_utilizada NUMERIC(5,1) NOT NULL,
	qtde_proteina NUMERIC(6,1) NOT NULL,
	qtde_carboidrato NUMERIC(6,1) NOT NULL,
	qtde_gordura NUMERIC(6,1) NOT NULL,
	qtde_alcool NUMERIC(6,1) NOT NULL,
   kcal NUMERIC(6,1) NOT NULL,
	CONSTRAINT alimento_prato_check_valores_maiores_que_zero CHECK (
		porcao_padrao > 0 AND qtde_proteina >= 0 AND 
		qtde_carboidrato >= 0 AND qtde_gordura >= 0 AND qtde_alcool >= 0 AND qtde_utilizada > 0
	),
	CONSTRAINT alimento_prato_fk_id_prato FOREIGN KEY (id_prato) REFERENCES prato(id_prato) ON DELETE CASCADE,
	CONSTRAINT alimento_prato_fk_id_alimento FOREIGN KEY (id_alimento) REFERENCES alimento(id_alimento) ON DELETE CASCADE,
   PRIMARY KEY (id_alimento_prato)
);

--alimento_consumido
DROP TABLE IF EXISTS alimento_consumido CASCADE;
CREATE TABLE alimento_consumido (
   id_alimento_consumido BIGSERIAL,
   id_usuario UUID NOT NULL,
	numero_refeicao INTEGER NOT NULL, 
	id_alimento INTEGER,
	id_prato INTEGER,
	dt_dia DATE NOT NULL,
   nome_consumo TEXT,
	unidade_medida TEXT NOT NULL,
	porcao_padrao INTEGER NOT NULL,
	qtde_utilizada NUMERIC(5,1) NOT NULL,
	qtde_proteina NUMERIC(6,1) NOT NULL,
	qtde_carboidrato NUMERIC(6,1) NOT NULL,
	qtde_gordura NUMERIC(6,1) NOT NULL,
	qtde_alcool NUMERIC(6,1) NOT NULL,
   kcal NUMERIC(6,1) NOT NULL,
   dtt_alimento_consumido TEXT NOT NULL,
   CONSTRAINT alimento_consumido_check_referencias CHECK (
      id_alimento > 0 OR nome_consumo IS NOT NULL AND nome_consumo <> ''
   ),
	CONSTRAINT alimento_consumido_check_valores_maiores_que_zero CHECK (
      porcao_padrao > 0 AND qtde_utilizada > 0 AND qtde_proteina >= 0 AND 
	   qtde_carboidrato >= 0 AND qtde_gordura >= 0 AND qtde_alcool >= 0 AND kcal >= 0
	),
	CONSTRAINT alimento_consumido_fk_id_usuario_numero_refeicao FOREIGN KEY (id_usuario, numero_refeicao) REFERENCES refeicao(id_usuario, numero_refeicao),
	CONSTRAINT alimento_consumido_fk_id_alimento FOREIGN KEY (id_alimento) REFERENCES alimento(id_alimento),
	CONSTRAINT alimento_consumido_fk_id_prato FOREIGN KEY (id_prato) REFERENCES prato(id_prato),
   PRIMARY KEY (id_alimento_consumido)
);

--alimento_favorito
DROP TABLE IF EXISTS alimento_favorito CASCADE;
CREATE TABLE alimento_favorito (
	id_usuario UUID,
	id_alimento INTEGER,
	dtt_alimento_favoritado TIMESTAMP NOT NULL,
	CONSTRAINT alimento_favorito_fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	CONSTRAINT alimento_favorito_fk_id_alimento FOREIGN KEY (id_alimento) REFERENCES alimento(id_alimento) ON DELETE CASCADE,
	PRIMARY KEY(id_usuario, id_alimento)
);

--perfil
DROP TABLE IF EXISTS perfil CASCADE;
CREATE TABLE perfil (
	id_perfil SERIAL,
	id_usuario uuid NOT NULL,
	peso_inicial NUMERIC(4,1) NOT NULL,
	peso_final NUMERIC(4,1) NOT NULL,
	altura NUMERIC(4,1) NOT NULL,
	nivel_atividade VARCHAR(15) NOT NULL,
	objetivo VARCHAR(15) NOT NULL,
	tmb INTEGER NOT NULL,
	tmt INTEGER NOT NULL,
	tmf INTEGER NOT NULL,
	meta_proteina INTEGER NOT NULL,
	meta_carboidrato INTEGER NOT NULL,
	meta_gordura INTEGER NOT NULL,
	proteina_peso NUMERIC(3,1) NOT NULL,
	carboidrato_peso NUMERIC(3,1) NOT NULL,
	gordura_peso NUMERIC(3,1) NOT NULL,
	dt_criacao_perfil DATE NOT NULL,
	CONSTRAINT check_perfil_check_valores_maiores_que_zero CHECK (
		proteina_peso >= 0 AND carboidrato_peso >= 0 AND gordura_peso >= 0 AND 
		meta_proteina >= 0 AND meta_carboidrato >= 0 AND meta_gordura >= 0
		AND tmt > 0 AND tmf > 0 AND tmb > 0 
	),
	CONSTRAINT check_nivel_atividade CHECK (
		nivel_atividade IN ('SENDENTARIO', 'LEVE', 'MODERADO', 'INTENSO', 'EXTREMO')
	), 
	CONSTRAINT check_objetivo CHECK (
		objetivo IN ('PERDA', 'MANUTENCAO', 'GANHO')
	), 
	CONSTRAINT perfil_unique_id_usuario_dt_criacao_perfil UNIQUE (id_usuario, dt_criacao_perfil),
	CONSTRAINT perfil_fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
	PRIMARY KEY (id_perfil)
);


