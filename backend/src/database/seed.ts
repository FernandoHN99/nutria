import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from './data-source';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = path.join(__dirname, '../../data/seeds');
const BATCH_SIZE = 200;

function parseCSVLine(line: string): string[] {
   const fields: string[] = [];
   let field = '';
   let inQuotes = false;
   for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
         if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
         else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
         fields.push(field.trim());
         field = '';
      } else {
         field += char;
      }
   }
   fields.push(field.trim());
   return fields;
}

function parseCSV(filePath: string): Record<string, string>[] {
   const content = fs.readFileSync(filePath, 'utf-8');
   const lines = content.split('\n').filter(l => l.trim());
   const headers = parseCSVLine(lines[0]);
   return lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      return headers.reduce((obj, header, i) => {
         obj[header] = values[i] ?? '';
         return obj;
      }, {} as Record<string, string>);
   });
}

function toNullableFloat(val: string): string {
   return val === '' ? 'NULL' : parseFloat(val).toString();
}

function toNullableText(val: string): string | null {
   return val === '' ? null : val;
}

async function seed() {
   await AppDataSource.initialize();
   const queryRunner = AppDataSource.createQueryRunner();

   const [{ count }] = await queryRunner.query(
      `SELECT COUNT(*) FROM alimento WHERE alimento_verificado = TRUE`
   );
   if (parseInt(count) > 0) {
      console.log(`Seed já aplicado (${count} alimentos verificados encontrados). Pulando.`);
      await AppDataSource.destroy();
      return;
   }

   const alimentos = parseCSV(path.join(CSV_DIR, 'TabelaNutrIA-Alimentos.csv'));
   const tabelasNutricionais = parseCSV(path.join(CSV_DIR, 'TabelaNutrIA-TabelaNutricional.csv'));

   console.log(`Inserindo ${alimentos.length} alimentos e ${tabelasNutricionais.length} tabelas nutricionais...`);

   await queryRunner.startTransaction();
   try {
      // Insert alimento in batches
      for (let i = 0; i < alimentos.length; i += BATCH_SIZE) {
         const batch = alimentos.slice(i, i + BATCH_SIZE);
         const values = batch.map(r => {
            const idUsuario = toNullableText(r.id_usuario);
            const marca = toNullableText(r.marca_alimento);
            return `(${r.id_alimento}, ${idUsuario ? `'${idUsuario}'` : 'NULL'}, '${r.nome_alimento.replace(/'/g, "''")}', '${r.estado_alimento}', ${r.alimento_verificado}, '${r.grupo_alimentar}', ${marca ? `'${marca.replace(/'/g, "''")}'` : 'NULL'}, '${r.dtt_criacao_alimento}', ${r.alimento_ativo})`;
         }).join(',\n');

         await queryRunner.query(`
            INSERT INTO alimento (id_alimento, id_usuario, nome_alimento, estado_alimento, alimento_verificado, grupo_alimentar, marca_alimento, dtt_criacao_alimento, alimento_ativo)
            VALUES ${values}
         `);
         console.log(`  alimento: ${Math.min(i + BATCH_SIZE, alimentos.length)}/${alimentos.length}`);
      }

      // Insert tabela_nutricional in batches
      for (let i = 0; i < tabelasNutricionais.length; i += BATCH_SIZE) {
         const batch = tabelasNutricionais.slice(i, i + BATCH_SIZE);
         const values = batch.map(r => {
            return `(${r.id_tabela_nutricional}, ${r.id_alimento}, '${r.unidade_medida}', ${r.porcao_padrao}, ${toNullableFloat(r.kcal)}, ${toNullableFloat(r.qtde_proteina)}, ${toNullableFloat(r.qtde_carboidrato)}, ${toNullableFloat(r.qtde_gordura)}, ${toNullableFloat(r.qtde_alcool)}, ${toNullableFloat(r.qtde_acucar)}, ${toNullableFloat(r.qtde_fibra)}, ${toNullableFloat(r.qtde_saturada)}, ${toNullableFloat(r.qtde_monosaturada)}, ${toNullableFloat(r.qtde_polisaturada)}, ${toNullableFloat(r.qtde_trans)}, ${toNullableFloat(r.qtde_sodio)}, ${toNullableFloat(r.qtde_calcio)}, ${toNullableFloat(r.qtde_ferro)}, ${toNullableFloat(r.qtde_potassio)}, ${toNullableFloat(r.qtde_vitamina_a)}, ${toNullableFloat(r.qtde_vitamina_c)}, ${toNullableFloat(r.qtde_vitamina_d)}, ${toNullableFloat(r.qtde_vitamina_e)})`;
         }).join(',\n');

         await queryRunner.query(`
            INSERT INTO tabela_nutricional (id_tabela_nutricional, id_alimento, unidade_medida, porcao_padrao, kcal, qtde_proteina, qtde_carboidrato, qtde_gordura, qtde_alcool, qtde_acucar, qtde_fibra, qtde_saturada, qtde_monosaturada, qtde_polisaturada, qtde_trans, qtde_sodio, qtde_calcio, qtde_ferro, qtde_potassio, qtde_vitamina_a, qtde_vitamina_c, qtde_vitamina_d, qtde_vitamina_e)
            VALUES ${values}
         `);
         console.log(`  tabela_nutricional: ${Math.min(i + BATCH_SIZE, tabelasNutricionais.length)}/${tabelasNutricionais.length}`);
      }

      // Reset sequences to avoid conflicts with future inserts
      await queryRunner.query(`SELECT setval('alimento_id_alimento_seq', (SELECT MAX(id_alimento) FROM alimento))`);
      await queryRunner.query(`SELECT setval('tabela_nutricional_id_tabela_nutricional_seq', (SELECT MAX(id_tabela_nutricional) FROM tabela_nutricional))`);

      await queryRunner.commitTransaction();
      console.log('Seed concluído com sucesso!');
   } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Erro durante o seed:', err);
      process.exit(1);
   } finally {
      await queryRunner.release();
      await AppDataSource.destroy();
   }
}

seed();
