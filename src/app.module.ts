import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5433,
      //port= +(process.env.DB_PORT||5433), (+ es para parsear a number)
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, //Permite cargar dependencias de entidades automáticamente cuando se importan módulos
      synchronize: true, //Sincroniza el esquema de la base de datos con las entidades definidas en el código. No se recomienda usar en producción, ya que puede causar pérdida de datos.
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}