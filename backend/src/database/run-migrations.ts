import 'reflect-metadata'
import { AppDataSource } from './data-source'

AppDataSource.initialize()
  .then(async () => {
    console.log('Executando migrations...')
    await AppDataSource.runMigrations()
    console.log('Migrations executadas com sucesso')
    process.exit(0)
  })
  .catch(error => {
    console.error('Erro ao executar migrations:', error)
    process.exit(1)
  })
